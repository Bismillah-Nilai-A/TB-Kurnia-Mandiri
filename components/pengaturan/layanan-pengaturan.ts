import {
  supabase,
  logAktivitas,
  usernameToSyntheticEmail,
} from "@/lib/supabase";
import type { Database, Role, StatusAkun } from "@/lib/types";

export type UserRow = Database["public"]["Tables"]["pengguna"]["Row"];
export type PenggunaRow = UserRow;
export type NotifRow = Database["public"]["Tables"]["notifikasi"]["Row"];
export type NotifikasiRow = NotifRow;

export interface LogRow {
  id: string;
  pengguna_id: string | null;
  modul: string;
  aktivitas: string;
  data_sebelum: unknown;
  data_sesudah: unknown;
  waktu: string;
  pengguna?: { nama: string; username: string; role: string } | null;
}
export type LogJoined = LogRow;

export type TabPengaturan = "sistem" | "pengguna" | "log" | "notifikasi";

export const DEFAULT_USERS: UserRow[] = [];
export const DEFAULT_LOGS: LogRow[] = [];
export const DEFAULT_NOTIFS: NotifRow[] = [];

export async function muatSemuaPengaturan() {
  const [setRes, usrRes, logRes, ntfRes] = await Promise.all([
    supabase
      .from("pengaturan_sistem")
      .select("*")
      .eq("id", 1)
      .maybeSingle(),
    supabase
      .from("pengguna")
      .select("*")
      .order("created_at", { ascending: true }),
    supabase
      .from("log_aktivitas")
      .select("*, pengguna:pengguna_id(nama, username, role)")
      .order("waktu", { ascending: false })
      .limit(100),
    supabase
      .from("notifikasi")
      .select("*")
      .order("waktu", { ascending: false })
      .limit(50),
  ]);

  return {
    settings: setRes.data || null,
    users: (usrRes.data as UserRow[]) || DEFAULT_USERS,
    logs: (logRes.data as unknown as LogRow[]) || DEFAULT_LOGS,
    notifs: (ntfRes.data as NotifRow[]) || DEFAULT_NOTIFS,
  };
}

export async function simpanPengaturanSistemSupabase(params: {
  notifEnabled: boolean;
  saluranNotif: "email" | "whatsapp";
  penerimaNotif: string;
  notifDetail: string;
  penyediaGateway: string;
  kunciApi: string;
  gatewayName: string;
  gatewayDetail: string;
}) {
  const payload = {
    id: 1,
    notifikasi: params.notifEnabled,
    saluran_notifikasi: params.saluranNotif,
    penerima_notifikasi: params.penerimaNotif.trim(),
    notifikasi_detail: params.notifDetail,
    penyedia_gateway: params.penyediaGateway,
    kunci_api: params.kunciApi,
    gateway: params.gatewayName,
    gateway_detail: params.gatewayDetail,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("pengaturan_sistem").upsert(payload);
  if (error) throw error;

  await logAktivitas({
    modul: "Pengaturan Sistem",
    aktivitas: "Memperbarui konfigurasi notifikasi & payment gateway",
    dataSesudah: payload,
  });
}

export async function tambahPenggunaBaruSupabase(userForm: {
  nama: string;
  username: string;
  password: string;
  role: Role;
}) {
  const cleanUsername = userForm.username.trim().toLowerCase();
  const payload = {
    nama: userForm.nama.trim(),
    username: cleanUsername,
    password: userForm.password,
    role: userForm.role,
    status: "aktif" as StatusAkun,
  };
  const { error } = await supabase.from("pengguna").insert(payload);
  if (error) throw error;

  await logAktivitas({
    modul: "Manajemen Pengguna",
    aktivitas: `Menambahkan akun pengguna baru @${cleanUsername} (${userForm.role})`,
    dataSesudah: {
      nama: payload.nama,
      username: cleanUsername,
      role: payload.role,
      email_sintetis: usernameToSyntheticEmail(cleanUsername),
    },
  });

  return cleanUsername;
}

export async function ubahRolePenggunaSupabase(u: UserRow, newRole: Role) {
  const { error } = await supabase
    .from("pengguna")
    .update({ role: newRole })
    .eq("id", u.id);
  if (!error) {
    await logAktivitas({
      modul: "Manajemen Pengguna",
      aktivitas: `Mengubah peran @${u.username} dari ${u.role} menjadi ${newRole}`,
      dataSebelum: { role: u.role },
      dataSesudah: { role: newRole },
    });
  }
  return error;
}

export async function resetPasswordPenggunaSupabase(
  u: UserRow,
  newPass: string
) {
  const { error } = await supabase
    .from("pengguna")
    .update({ password: newPass })
    .eq("id", u.id);
  if (!error) {
    await logAktivitas({
      modul: "Manajemen Pengguna",
      aktivitas: `Mereset password untuk pengguna @${u.username}`,
    });
  }
  return error;
}

export async function ubahStatusPenggunaSupabase(
  u: UserRow,
  nextStatus: StatusAkun
) {
  const { error } = await supabase
    .from("pengguna")
    .update({ status: nextStatus })
    .eq("id", u.id);
  if (!error) {
    await logAktivitas({
      modul: "Manajemen Pengguna",
      aktivitas: `Mengubah status akun @${u.username} menjadi ${nextStatus}`,
      dataSebelum: { status: u.status },
      dataSesudah: { status: nextStatus },
    });
  }
  return error;
}

export function unduhCsvLogAktivitas(logs: LogRow[]) {
  const headers = ["Waktu", "Pengguna", "Peran", "Modul", "Aktivitas"];
  const rows = logs.map((l) => [
    new Date(l.waktu).toLocaleString("id-ID"),
    l.pengguna?.nama || "Sistem",
    l.pengguna?.role || "-",
    l.modul,
    l.aktivitas,
  ]);
  const csv =
    "\uFEFF" +
    [headers.join(";")]
      .concat(rows.map((r) => r.map((c) => `"${c}"`).join(";")))
      .join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Log_Aktivitas_CV_Kurnia_Mandiri.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function picuCronNotifikasiApi() {
  const res = await fetch("/api/cron/notifikasi", { method: "POST" });
  return res.json();
}
