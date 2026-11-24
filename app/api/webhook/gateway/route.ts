import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/midtrans";
import { supabase } from "@/lib/supabase";

/**
 * Route Handler Webhook Payment Gateway Midtrans (D17 / PGW-03)
 * - Tanpa sesi pengguna
 * - Verifikasi SHA-512 signature
 * - Idempoten (abaikan jika sudah lunas)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_id,
    } = body;

    if (!order_id || !status_code || !gross_amount) {
      return NextResponse.json(
        { error: "Payload webhook tidak lengkap" },
        { status: 400 }
      );
    }

    // Verifikasi signature bila signature_key disertakan oleh Midtrans
    if (signature_key) {
      const valid = verifyWebhookSignature(
        String(order_id),
        String(status_code),
        String(gross_amount),
        String(signature_key)
      );
      if (!valid) {
        return NextResponse.json(
          { error: "Signature tidak valid" },
          { status: 401 }
        );
      }
    }

    // Cari transaksi berdasarkan no_nota (order_id)
    const { data: trx, error: trxErr } = await supabase
      .from("transaksi")
      .select("*")
      .eq("no_nota", String(order_id))
      .maybeSingle();

    if (trxErr || !trx) {
      return NextResponse.json(
        { message: "Transaksi tidak ditemukan, webhook diabaikan" },
        { status: 200 }
      );
    }

    // Idempoten: jika sudah lunas, langsung return 200
    if (trx.status_bayar === "lunas") {
      return NextResponse.json({
        message: "Transaksi sudah lunas (idempoten)",
      });
    }

    const isSuccess =
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept");
    const isFailed =
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire";

    if (isSuccess) {
      const nominal = Number(gross_amount) || Number(trx.total);
      const trxId = trx.id_transaksi || trx.id;

      await supabase
        .from("transaksi")
        .update({
          jumlah_dibayar: nominal,
          sisa_tagihan: 0,
          status_bayar: "lunas",
        })
        .eq("id_transaksi", trxId);

      await supabase.from("pembayaran").insert({
        transaksi_id: trxId,
        metode: payment_type === "qris" ? "qris" : "va",
        nominal,
        referensi_gateway: transaction_id || String(order_id),
        status: "berhasil",
        tanggal: new Date().toISOString(),
      });

      await supabase.from("log_aktivitas").insert({
        modul: "Payment Gateway",
        aktivitas: `Webhook lunas nota ${trx.no_nota}`.slice(0, 50),
        data_sesudah: {
          order_id,
          transaction_status,
          payment_type,
          gross_amount,
        },
        waktu: new Date().toISOString(),
      });
    } else if (isFailed) {
      const trxId = trx.id_transaksi || trx.id;
      await supabase
        .from("transaksi")
        .update({
          status_bayar: "dibatalkan",
        })
        .eq("id_transaksi", trxId);
    }

    return NextResponse.json({ status: "ok", order_id });
  } catch (error) {
    console.error("[Webhook Midtrans Error]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

