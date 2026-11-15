import type {
  NotificationChannel,
  NotificationConfig,
  NotificationPayload,
  NotificationType,
} from "./types";
import { sendEmailDirect } from "./resend";

export const CHANNEL_EMAIL: NotificationChannel = "email";
export const CHANNEL_WHATSAPP: NotificationChannel = "whatsapp";

export function jenisLabel(jenis: NotificationType): string {
  const map: Record<NotificationType, string> = {
    stok_hampir_habis: "Stok Hampir Habis",
    transaksi_selesai: "Transaksi Selesai",
    pembayaran_lunas: "Pembayaran Lunas",
    piutang_lunas: "Piutang Lunas",
    kasbon_disetujui: "Kasbon Disetujui",
    notifikasi_other: "Notifikasi Sistem",
  };
  return map[jenis] || "Notifikasi";
}

/** Kirim email via Resend */
export async function sendEmail(to: string, subject: string, html: string) {
  return sendEmailDirect({ to, subject, html });
}

/** Kirim WhatsApp via Meta WhatsApp Cloud API */
export async function sendWhatsApp(to: string, message: string) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_API_KEY;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    console.warn("[WhatsApp] Token atau Phone Number ID belum dikonfigurasi di .env");
    return false;
  }

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[WhatsApp] Gagal mengirim pesan: ${res.status} ${body}`);
    return false;
  }
  return true;
}

export async function sendNotification(payload: NotificationPayload) {
  if (payload.channel === CHANNEL_EMAIL) {
    return sendEmail(
      payload.penerima,
      `CV Kurnia Mandiri | ${jenisLabel(payload.jenis)}`,
      `<div style="font-family: sans-serif; padding: 16px;">${payload.pesan}</div>`
    );
  } else {
    return sendWhatsApp(payload.penerima, payload.pesan);
  }
}

export async function getNotificationConfig(): Promise<NotificationConfig> {
  const emailEnabled = process.env.NOTIF_EMAIL_ENABLED !== "false";
  const whatsappEnabled = process.env.NOTIF_WHATSAPP_ENABLED !== "false";
  return {
    email_enabled: emailEnabled,
    email_from: process.env.RESEND_FROM_EMAIL || "CV Kurnia Mandiri <onboarding@resend.dev>",
    whatsapp_enabled: whatsappEnabled,
    whatsapp_phone: process.env.WHATSAPP_PHONE || "",
    default_channel: emailEnabled ? CHANNEL_EMAIL : CHANNEL_WHATSAPP,
  };
}
