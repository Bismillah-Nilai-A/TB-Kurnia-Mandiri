"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label } from "@/components/ui";
import {
  supabase,
  setCurrentSessionUser,
  usernameToSyntheticEmail,
  logAktivitas,
} from "@/lib/supabase";
import { AlertCircle, ShieldCheck, UserCheck, Truck } from "lucide-react";
import type { Role } from "@/lib/db";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cleanUser = username.trim().toLowerCase();

      // 1. Cek pengguna di tabel public.pengguna
      const { data: user, error: queryError } = await supabase
        .from("pengguna")
        .select("*")
        .eq("username", cleanUser)
        .eq("status", "aktif")
        .maybeSingle();

      if (queryError) {
        setError(`Gagal memeriksa akun: ${queryError.message}`);
        return;
      }

      if (!user || user.password !== password) {
        // Coba cek apakah akun nonaktif
        const { data: inactiveUser } = await supabase
          .from("pengguna")
          .select("status")
          .eq("username", cleanUser)
          .maybeSingle();

        if (inactiveUser && inactiveUser.status === "nonaktif") {
          setError("Akun Anda telah dinonaktifkan oleh Admin.");
        } else {
          setError("Username atau password salah. Silakan coba lagi.");
        }
        return;
      }

      // 2. Opsional: sinkronisasi sesi Supabase Auth dengan email sintetis <username>@kurnia.local (D4)
      const syntheticEmail = usernameToSyntheticEmail(user.username);
      try {
        await supabase.auth.signInWithPassword({
          email: syntheticEmail,
          password,
        });
      } catch {
        // Lanjutkan dengan sesi aplikasi
      }

      // 3. Simpan sesi pengguna aktif
      const sessionUser = {
        id: user.id,
        nama: user.nama,
        username: user.username,
        email: syntheticEmail,
        role: user.role as Role,
        status: user.status,
      };
      setCurrentSessionUser(sessionUser);

      // 4. Catat ke log_aktivitas (AUTH-02 / LOG-01)
      await logAktivitas({
        modul: "Autentikasi",
        aktivitas: `Login berhasil sebagai ${user.nama} (${user.role})`,
        penggunaId: user.id,
        dataSesudah: { username: user.username, role: user.role },
      });

      // 5. Redirect sesuai peran (AUTH-04)
      if (user.role === "pengirim") {
        router.push("/pengiriman");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(
        `Kesalahan sistem: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setLoading(false);
    }
  };

  const fillQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError("");
  };

  return (
    <div className="w-full max-w-[440px]">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 flex flex-col gap-6">
        {/* Header Logo */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
            KM
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            CV Kurnia Mandiri
          </h1>
          <p className="text-xs text-gray-500">
            Sistem Informasi Penjualan & Persediaan Bahan Bangunan
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Masukkan username (admin / kasir / pengirim)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full mt-1"
            disabled={loading}
          >
            {loading ? "Memverifikasi..." : "Masuk ke Sistem"}
          </Button>
        </form>

        {/* Quick Demo Access */}
        <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
          <p className="text-[11px] font-medium text-gray-400 text-center uppercase tracking-wider">
            Akses Cepat Peran (Klik untuk Isi)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillQuickLogin("admin", "admin123")}
              className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition text-xs text-gray-700"
            >
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">Admin</span>
              <span className="text-[10px] text-gray-400">admin123</span>
            </button>
            <button
              type="button"
              onClick={() => fillQuickLogin("kasir", "kasir123")}
              className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition text-xs text-gray-700"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">Kasir</span>
              <span className="text-[10px] text-gray-400">kasir123</span>
            </button>
            <button
              type="button"
              onClick={() => fillQuickLogin("pengirim", "pengirim123")}
              className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 hover:border-amber-400 hover:bg-amber-50/50 transition text-xs text-gray-700"
            >
              <Truck className="w-4 h-4 text-amber-600" />
              <span className="font-semibold">Pengirim</span>
              <span className="text-[10px] text-gray-400">pengirim123</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-400">
          © 2026 CV Kurnia Mandiri • Single Store POS v1.2
        </p>
      </div>
    </div>
  );
}
