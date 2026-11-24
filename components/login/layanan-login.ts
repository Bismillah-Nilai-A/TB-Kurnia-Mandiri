import {
  supabase,
  setCurrentSessionUser,
  usernameToSyntheticEmail,
  logAktivitas,
} from "@/lib/supabase";
import { ShieldCheck, UserCheck, Truck } from "lucide-react";
import type { Role } from "@/lib/db";

export const QUICK_ROLES = [
  { u: "admin", p: "admin123", label: "Pemilik", icon: ShieldCheck },
  { u: "kasir", p: "kasir123", label: "Kasir", icon: UserCheck },
  { u: "pengirim", p: "pengirim123", label: "Pengirim", icon: Truck },
] as const;

export async function prosesLoginPengguna(
  username: string,
  password: string
): Promise<{ redirectTo?: string; error?: string }> {
  const cleanUser = username.trim().toLowerCase();

  const { data: user, error: queryError } = await supabase
    .from("pengguna")
    .select("*")
    .eq("username", cleanUser)
    .eq("status", "aktif")
    .maybeSingle();

  if (queryError) {
    return { error: `Gagal memeriksa akun: ${queryError.message}` };
  }

  if (!user || user.password !== password) {
    const { data: inactiveUser } = await supabase
      .from("pengguna")
      .select("status")
      .eq("username", cleanUser)
      .maybeSingle();

    if (inactiveUser && inactiveUser.status === "nonaktif") {
      return { error: "Akun Anda telah dinonaktifkan oleh Admin." };
    }
    return { error: "Username atau password salah. Silakan coba lagi." };
  }

  const syntheticEmail = usernameToSyntheticEmail(user.username);
  try {
    await supabase.auth.signInWithPassword({
      email: syntheticEmail,
      password,
    });
  } catch {
    // Lanjutkan dengan sesi aplikasi
  }

  const sessionUser = {
    id: String(user.id_pengguna || user.id),
    nama: user.nama,
    username: user.username,
    email: syntheticEmail,
    role: user.role as Role,
    status: user.status,
  };
  setCurrentSessionUser(sessionUser);

  await logAktivitas({
    modul: "Autentikasi",
    aktivitas: `Login berhasil sebagai ${user.nama} (${user.role})`.slice(0, 50),
    penggunaId: String(user.id_pengguna || user.id),
    dataSesudah: { username: user.username, role: user.role },
  });

  if (user.role === "pengirim") {
    return { redirectTo: "/pengiriman" };
  }
  return { redirectTo: "/dashboard" };
}
