export const DEFAULT_RECIPIENT_EMAIL = "muhamadirfan.mi966@gmail.com";
export const RESEND_SANDBOX_OWNER_EMAIL = "muhamadirfan.mi966@gmail.com";

/**
 * Email Service menggunakan Resend REST API (Universal fetch, tanpa dependency eksternal).
 */
export async function sendEmailDirect({
  to,
  subject,
  html,
  from,
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Resend] RESEND_API_KEY tidak ditemukan. Pengiriman email dilewati.");
    return null;
  }

  // Pastikan alamat pengirim menggunakan domain resmi sandbox Resend (@resend.dev, bukan @resend.com)
  const rawFrom = from || process.env.RESEND_FROM_EMAIL || "";
  const safeFrom =
    !rawFrom || rawFrom.includes("@resend.com")
      ? "CV Kurnia Mandiri <onboarding@resend.dev>"
      : rawFrom;

  const targetEmail =
    !to ||
    !to.includes("@") ||
    to.endsWith("@cvkurniamandiri.com") ||
    to.endsWith("@kurnia.local")
      ? DEFAULT_RECIPIENT_EMAIL
      : to;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: safeFrom,
        to: [targetEmail],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      // Pada Resend Free Tier tanpa custom domain, Resend membatasi pengiriman hanya ke email pemilik API Key (muhamadirfan.mi966@gmail.com)
      if (res.status === 403 && targetEmail !== RESEND_SANDBOX_OWNER_EMAIL) {
        const matchOwner = errText.match(/\(([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\)/);
        const ownerEmail = matchOwner ? matchOwner[1] : RESEND_SANDBOX_OWNER_EMAIL;

        const retryRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: safeFrom,
            to: [ownerEmail],
            subject: `${subject} (Penerima: ${targetEmail})`,
            html,
          }),
        });

        if (retryRes.ok) {
          const retryData = await retryRes.json();
          console.log(
            `[Resend] Email terkirim via akun pemilik sandbox (${ownerEmail}) untuk ${targetEmail}: ${subject}`
          );
          return retryData;
        }
      }

      console.error("[Resend Error]", errText);
      return null;
    }

    const data = await res.json();
    console.log(`[Resend] Email terkirim ke ${targetEmail}: ${subject}`);
    return data;
  } catch (error) {
    console.error("[Resend Exception]", error);
    return null;
  }
}

/**
 * Notifikasi Sukses Pembayaran
 */
export async function sendPaymentSuccess({
  to,
  nota,
  total,
  metode,
  link,
  pelanggan,
}: {
  to: string;
  nota: string;
  total: number;
  metode: string;
  link?: string;
  pelanggan?: string;
}) {
  const totalFormatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(total);

  const html = `
  <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
    <div style="text-align: center; padding-bottom: 16px;">
      <h1 style="color: #2563eb; margin: 0 0 4px; font-size: 24px;">CV Kurnia Mandiri</h1>
      <p style="color: #6b7280; margin: 0; font-size: 14px;">Toko Bahan & Material Bangunan</p>
    </div>
    <div style="text-align: center; margin: 16px 0; padding: 12px; background: #f0fdf4; border-radius: 8px;">
      <span style="background: #22c55e; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">Pembayaran Lunas</span>
    </div>
    <div style="background: #fafafa; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
      <p style="margin: 0 0 8px; font-size: 14px;"><strong>Nomor Nota:</strong> <span style="color: #2563eb; font-weight: bold;">${nota}</span></p>
      <p style="margin: 0 0 8px; font-size: 14px;"><strong>Pelanggan:</strong> ${pelanggan || "—"}</p>
      <p style="margin: 0 0 8px; font-size: 14px;"><strong>Total:</strong> <span style="font-weight: bold; color: #2563eb;">${totalFormatted}</span></p>
      <p style="margin: 0 0 8px; font-size: 14px;"><strong>Metode:</strong> ${metode}</p>
      ${link ? `<p style="margin: 0 0 8px; font-size: 14px;"><strong>Link Detail:</strong> <a href="${link}" style="color: #2563eb; text-decoration: none;">${link}</a></p>` : ""}
    </div>
    <p style="color: #6b7280; font-size: 12px; margin: 0;">
      © 2026 CV Kurnia Mandiri. Semua hak dilindungi.
    </p>
  </div>
  `;

  return sendEmailDirect({ to, subject: `Nota #${nota} - Pembayaran Lunas`, html });
}

/**
 * Notifikasi Stok Hampir Habis
 */
export async function sendStockAlert({
  to,
  produk,
  sisa,
  jenis = "stok",
}: {
  to: string;
  produk: string;
  sisa: number;
  jenis?: string;
}) {
  const html = `
  <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
    <div style="text-align: center; padding-bottom: 16px;">
      <h1 style="color: #2563eb; margin: 0 0 4px; font-size: 24px;">CV Kurnia Mandiri</h1>
      <p style="color: #6b7280; margin: 0; font-size: 14px;">Peringatan Stok Menipis</p>
    </div>
    <div style="background: #fee2e2; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
      <span style="background: #ef4444; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">Perlu Restok Segera</span>
    </div>
    <div style="background: #fafafa; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
      <p style="margin: 0 0 8px; font-size: 14px;"><strong>Produk:</strong> ${produk}</p>
      <p style="margin: 0 0 8px; font-size: 14px;"><strong>Sisa Stok:</strong> <span style="color: #ef4444; font-weight: bold;">${sisa}</span></p>
      <p style="margin: 0 0 8px; font-size: 14px;"><strong>Kategori:</strong> ${jenis}</p>
    </div>
    <p style="color: #6b7280; font-size: 12px; margin: 0;">
      © 2026 CV Kurnia Mandiri. Semua hak dilindungi.
    </p>
  </div>
  `;

  return sendEmailDirect({
    to,
    subject: `⚠️ Stok ${produk} Menipis (${sisa} unit)`,
    html,
  });
}
