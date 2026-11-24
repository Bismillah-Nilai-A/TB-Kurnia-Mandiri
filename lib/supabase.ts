import { createClient } from "@supabase/supabase-js";
import { ROLE_PERMISSIONS, Role } from "./db";
import type { Json } from "./types";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://eruhyrcvczcaduzklqoi.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface POSUser {
  id: string;
  nama: string;
  username: string;
  email: string | null;
  role: Role;
  status: string;
}

const SESSION_STORAGE_KEY = "cvkm_pos_session_v1";

/** Simpan sesi pengguna aktif di client */
export function setCurrentSessionUser(user: POSUser) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // Ignore storage error
    }
  }
}

/** Hapus sesi pengguna aktif saat logout */
export function clearSessionUser() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Ignore storage error
    }
  }
}

/** Pemetaan username ke email sintetis Supabase Auth sesuai keputusan D4 */
export function usernameToSyntheticEmail(username: string): string {
  const clean = username.trim().toLowerCase();
  if (clean.includes("@")) return clean;
  return `${clean}@kurnia.local`;
}

export async function getCurrentUser(): Promise<POSUser | null> {
  // 1. Cek localStorage session terlebih dahulu (untuk perpindahan halaman instan & role switching)
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as POSUser;
        if (parsed && parsed.id && parsed.username) {
          return parsed;
        }
      }
    } catch {
      // Fallthrough
    }
  }

  // 2. Cek Supabase Auth session bila tersedia
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (user && !error) {
      return {
        id: user.id,
        nama:
          user.user_metadata?.nama ||
          user.email?.split("@")[0] ||
          "User",
        username:
          user.user_metadata?.username ||
          user.email?.split("@")[0] ||
          "user",
        email: user.email || null,
        role: ((user.user_metadata?.role as Role) || "admin") as Role,
        status: (user.user_metadata?.status as string) || "aktif",
      };
    }
  } catch {
    // Supabase auth session not available
  }

  // 3. Fallback dari tabel pengguna aktif di database (tanpa data dummy statis)
  try {
    const { data: adminRow } = await supabase
      .from("pengguna")
      .select("id_pengguna, nama, username, role, status")
      .eq("role", "admin")
      .eq("status", "aktif")
      .order("id_pengguna", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (adminRow) {
      const dbUser: POSUser = {
        id: String(adminRow.id_pengguna),
        nama: String(adminRow.nama),
        username: String(adminRow.username),
        email: usernameToSyntheticEmail(String(adminRow.username)),
        role: adminRow.role as Role,
        status: String(adminRow.status),
      };
      setCurrentSessionUser(dbUser);
      return dbUser;
    }
  } catch {
    // Abaikan jika koneksi database gagal saat memuat sesi awal
  }

  return null;
}

export async function checkPermission(requiredPath: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  const allowed = ROLE_PERMISSIONS[user.role as Role] || ROLE_PERMISSIONS.admin;
  return allowed.some(
    (p) => requiredPath === p || requiredPath.startsWith(p + "/")
  );
}

/** Catat jejak audit ke tabel log_aktivitas (LOG-01 / LOG-02) */
export async function logAktivitas({
  modul,
  aktivitas,
  dataSebelum = null,
  dataSesudah = null,
  penggunaId,
}: {
  modul: string;
  aktivitas: string;
  dataSebelum?: Json | null;
  dataSesudah?: Json | null;
  penggunaId?: string | null;
}) {
  try {
    let uid = penggunaId;
    if (!uid) {
      const current = await getCurrentUser();
      uid = current?.id || null;
    }
    await supabase.from("log_aktivitas").insert({
      pengguna_id: uid,
      modul: modul.slice(0, 30),
      aktivitas: aktivitas.slice(0, 50),
      data_sebelum: dataSebelum,
      data_sesudah: dataSesudah,
      waktu: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("[logAktivitas] Gagal mencatat log:", err);
  }
}
