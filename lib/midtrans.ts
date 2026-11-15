import crypto from "crypto";
import type { MidtransSnap, SnapResponse, TransactionStatusResponse } from "./types";

const serverKey = process.env.MIDTRANS_SERVER_KEY || "";

export const MIDTRANS_SNAP_API = "https://app.sandbox.midtrans.com/snap/v1/transactions";
export const MIDTRANS_SERVER_API = "https://api.sandbox.midtrans.com/v2";

/** Request Snap token dari API route server. */
export async function getSnapToken(payload: MidtransSnap): Promise<string> {
  const res = await fetch("/api/payment/create-transaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Midtrans create failed: ${res.status} ${body}`);
  }
  const data = (await res.json()) as SnapResponse;
  return data.token;
}

/** Cek status pembayaran Midtrans via server-to-server. */
export async function getTransactionStatus(
  txnId: string
): Promise<TransactionStatusResponse> {
  const res = await fetch(`${MIDTRANS_SERVER_API}/${txnId}/status`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Midtrans status failed: ${res.status} ${body}`);
  }
  return (await res.json()) as TransactionStatusResponse;
}

/** Verifikasi SHA-512 signature webhook Midtrans (D17 / PGW-03) */
export function verifyWebhookSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  if (!serverKey) return false;
  const raw = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const expected = crypto.createHash("sha512").update(raw).digest("hex");
  return expected === signatureKey;
}
