import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";

    if (!serverKey) {
      return NextResponse.json(
        { error: "MIDTRANS_SERVER_KEY tidak ditemukan di environment" },
        { status: 500 }
      );
    }

    // Normalisasi format payload baik dari MidtransSnap maupun shorthand POS
    const orderId =
      body.transaction_details?.order_id ||
      body.orderId ||
      `INV-${Date.now()}`;
    const grossAmount = Math.round(
      Number(
        body.transaction_details?.gross_amount ?? body.grossAmount ?? 0
      )
    );

    if (!orderId || grossAmount <= 0) {
      return NextResponse.json(
        { error: "order_id dan gross_amount wajib diisi dan lebih dari 0" },
        { status: 400 }
      );
    }

    const itemDetails = (body.item_details || body.items || []).map(
      (item: {
        id?: string;
        price?: number;
        quantity?: number;
        name?: string;
      }) => ({
        id: String(item.id || "ITEM"),
        price: Math.round(Number(item.price || 0)),
        quantity: Number(item.quantity || 1),
        name: String(item.name || "Barang Bangunan").slice(0, 50),
      })
    );

    const midtransPayload: Record<string, unknown> = {
      transaction_details: {
        order_id: String(orderId),
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name:
          body.customer_details?.first_name ||
          body.customerName ||
          "Pelanggan",
        last_name: "CV Kurnia Mandiri",
        email:
          body.customer_details?.email || "muhamadirfan.mi966@gmail.com",
        phone:
          body.customer_details?.phone ||
          body.customerPhone ||
          "081234567890",
      },
    };

    if (itemDetails.length > 0) {
      midtransPayload.item_details = itemDetails;
    }

    const midtransRes = await fetch(
      "https://app.sandbox.midtrans.com/snap/v1/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`,
        },
        body: JSON.stringify(midtransPayload),
      }
    );

    if (!midtransRes.ok) {
      const errText = await midtransRes.text();
      console.error("[MIDTRANS] error:", errText);
      return NextResponse.json(
        { error: `Midtrans Snap request gagal: ${errText}`, details: errText },
        { status: midtransRes.status }
      );
    }

    const data = await midtransRes.json();
    return NextResponse.json({
      token: data.token,
      redirect_url: data.redirect_url,
    });
  } catch (error: unknown) {
    console.error("[MIDTRANS] exception:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
