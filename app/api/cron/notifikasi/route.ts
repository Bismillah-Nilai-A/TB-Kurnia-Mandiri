import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendNotification } from "@/lib/notif";
import type { NotificationChannel, NotificationType } from "@/lib/types";

/**
 * Route Handler Outbox Notifikasi (D16 / Q3 - dipicu oleh Supabase pg_cron + pg_net)
 * Mengambil baris tabel `notifikasi` yang berstatus `pending` / `antri` / `gagal`
 * dan mencoba mengirimkannya kembali melalui Resend Email / WhatsApp.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: pendingList, error } = await supabase
      .from("notifikasi")
      .select("*")
      .in("status_kirim", ["pending", "antri", "gagal"])
      .order("waktu", { ascending: true })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let sentCount = 0;
    let failCount = 0;

    for (const item of pendingList || []) {
      try {
        const res = await sendNotification({
          channel: (item.saluran as NotificationChannel) || "email",
          penerima: item.penerima,
          jenis: (item.jenis as NotificationType) || "notifikasi_other",
          pesan: item.pesan,
        });

        const ok = Boolean(res);
        await supabase
          .from("notifikasi")
          .update({
            status_kirim: ok ? "terkirim" : "gagal",
          })
          .eq("id_notifikasi", item.id_notifikasi || item.id);

        if (ok) sentCount++;
        else failCount++;
      } catch {
        failCount++;
      }
    }

    return NextResponse.json({
      status: "ok",
      processed: (pendingList || []).length,
      sent: sentCount,
      failed: failCount,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Cron error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}

