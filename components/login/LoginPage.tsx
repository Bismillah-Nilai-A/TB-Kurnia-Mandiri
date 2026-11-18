"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import {
  AlertCircle,
  User,
  Lock,
  Eye,
  EyeOff,
  Sun,
  Moon,
  LogIn,
} from "lucide-react";
import { QUICK_ROLES, prosesLoginPengguna } from "./layanan-login";

export function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [selectedRole, setSelectedRole] = useState<string>("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [skinMode, setSkinMode] = useState<"light" | "dark">("light");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedSkin = localStorage.getItem("skin-mode");
    const initialSkin = savedSkin === "dark" ? "dark" : "light";
    setSkinMode(initialSkin);
    document.documentElement.setAttribute("data-skin", initialSkin);
  }, []);

  const isDark = skinMode === "dark";

  const toggleSkinMode = () => {
    const next = isDark ? "light" : "dark";
    setSkinMode(next);
    document.documentElement.setAttribute("data-skin", next);
    if (next === "dark") {
      localStorage.setItem("skin-mode", "dark");
    } else {
      localStorage.removeItem("skin-mode");
    }
  };

  const handleSelectRole = (u: string, p: string) => {
    setSelectedRole(u);
    setUsername(u);
    setPassword(p);
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Username dan kata sandi wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const result = await prosesLoginPengguna(username, password);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.redirectTo) {
        router.push(result.redirectTo);
      }
    } catch (err) {
      setError(
        `Kesalahan sistem: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col justify-center bg-[#F8FAFC] px-3 py-5 sm:px-6 sm:py-8 lg:px-10">
      <div
        className={`mx-auto w-full max-w-[1040px] km-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 border ${
          isDark
            ? "border-[#334155] bg-[#1E293B] shadow-2xl"
            : "border-[#E2E8F0] bg-white shadow-sm"
        }`}
      >
        {/* Panel Kiri: Identitas Merek, Pemilih Peran, dan Form Autentikasi */}
        <section
          aria-labelledby="login-heading"
          className="lg:col-span-5 flex flex-col justify-between p-5 sm:p-8"
        >
          <div>
            {/* Motif Identitas CV Kurnia Mandiri konsisten dengan sidebar */}
            <div
              className={`pb-4 border-b ${
                isDark ? "border-[#334155]" : "border-[#E2E8F0]"
              }`}
            >
              <div
                className={`inline-flex items-baseline text-[22px] font-bold tracking-tight ${
                  isDark ? "text-[#F8FAFC]" : "text-[#1E293B]"
                }`}
              >
                <span>Kurnia Mandiri</span>
                <span
                  className={`ml-1 inline-block h-1.5 w-1.5 rounded-full ${
                    isDark ? "bg-[#60A5FA]" : "bg-[#2563EB]"
                  }`}
                  aria-hidden="true"
                />
              </div>
            </div>

            <h1
              id="login-heading"
              className={`mt-5 page-title text-[26px] font-bold tracking-tight ${
                isDark ? "text-[#F8FAFC]" : "text-[#1E293B]"
              }`}
            >
              Masuk Akun
            </h1>

            <form onSubmit={handleLogin} className="mt-5 space-y-4" noValidate>
              {/* Kontrol segmen menyatu untuk pengisian cepat kredensial demo */}
              <div
                role="group"
                aria-label="Pilih peran cepat"
                className={`grid grid-cols-3 rounded-md border p-1 gap-1 ${
                  isDark
                    ? "border-[#334155] bg-[#0F172A]"
                    : "border-[#E2E8F0] bg-[#F1F5F9]"
                }`}
              >
                {QUICK_ROLES.map((role) => {
                  const RoleIcon = role.icon;
                  const isActive =
                    selectedRole === role.u && username === role.u;
                  return (
                    <button
                      key={role.u}
                      type="button"
                      onClick={() => handleSelectRole(role.u, role.p)}
                      aria-pressed={isActive}
                      className={`min-h-11 px-2 inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-semibold transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 ${
                        isDark
                          ? "focus-visible:outline-[#60A5FA]"
                          : "focus-visible:outline-[#2563EB]"
                      } ${
                        isActive
                          ? isDark
                            ? "bg-[#2563EB]/20 text-[#93C5FD] border border-[#3B82F6]/60 shadow-xs hover:bg-[#2563EB]/30 hover:text-white"
                            : "bg-white text-[#1D4ED8] border border-[#CBD5E1] shadow-xs hover:bg-white"
                          : isDark
                            ? "border border-transparent text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white"
                            : "border border-transparent text-[#475569] hover:bg-white hover:text-[#1E293B]"
                      }`}
                    >
                      <RoleIcon
                        className="hidden min-[380px]:inline-block h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="truncate">{role.label}</span>
                    </button>
                  );
                })}
              </div>

              {error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className={`flex items-start gap-2.5 rounded-md border px-3.5 py-3 text-sm font-medium ${
                    isDark
                      ? "border-[#991B1B] bg-[#450A0A] text-[#FCA5A5]"
                      : "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]"
                  }`}
                >
                  <AlertCircle
                    className="h-5 w-5 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="username"
                  className={`mb-1.5 block text-sm font-medium ${
                    isDark ? "text-[#E2E8F0]" : "text-[#1E293B]"
                  }`}
                >
                  Username
                </label>
                <div className="relative">
                  <User
                    className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${
                      isDark ? "text-[#94A3B8]" : "text-[#64748B]"
                    }`}
                    aria-hidden="true"
                  />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    className={`h-11 w-full rounded-md border pl-10 pr-3.5 text-sm transition-colors duration-150 focus:outline-none focus:ring-2 ${
                      isDark
                        ? "border-[#334155] bg-[#0F172A] text-[#F8FAFC] placeholder:text-[#94A3B8] hover:border-[#475569] focus:border-[#60A5FA] focus:ring-[#60A5FA]/30"
                        : "border-[#CBD5E1] bg-white text-[#1E293B] placeholder:text-[#64748B] hover:border-[#94A3B8] focus:border-[#2563EB] focus:ring-[#2563EB]/25"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className={`mb-1.5 block text-sm font-medium ${
                    isDark ? "text-[#E2E8F0]" : "text-[#1E293B]"
                  }`}
                >
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock
                    className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${
                      isDark ? "text-[#94A3B8]" : "text-[#64748B]"
                    }`}
                    aria-hidden="true"
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className={`h-11 w-full rounded-md border pl-10 pr-12 text-sm transition-colors duration-150 focus:outline-none focus:ring-2 ${
                      isDark
                        ? "border-[#334155] bg-[#0F172A] text-[#F8FAFC] placeholder:text-[#94A3B8] hover:border-[#475569] focus:border-[#60A5FA] focus:ring-[#60A5FA]/30"
                        : "border-[#CBD5E1] bg-white text-[#1E293B] placeholder:text-[#64748B] hover:border-[#94A3B8] focus:border-[#2563EB] focus:ring-[#2563EB]/25"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword
                        ? "Sembunyikan kata sandi"
                        : "Tampilkan kata sandi"
                    }
                    aria-pressed={showPassword}
                    className={`absolute right-0 top-0 inline-flex h-11 w-11 items-center justify-center rounded-r-md cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-[-2px] ${
                      isDark
                        ? "text-[#94A3B8] hover:bg-[#1E293B] hover:text-white focus-visible:outline-[#60A5FA]"
                        : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B] focus-visible:outline-[#2563EB]"
                    }`}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={`w-full h-11 rounded-md text-sm font-semibold gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  isDark
                    ? "focus-visible:outline-[#60A5FA]"
                    : "focus-visible:outline-[#2563EB]"
                }`}
              >
                <LogIn className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{loading ? "Memproses..." : "Masuk ke Sistem"}</span>
              </Button>
            </form>
          </div>

          {/* Footer Form: Hak Cipta & Pengalih Mode Terang/Gelap */}
          <div
            className={`mt-7 pt-4 border-t flex items-center justify-between gap-2 ${
              isDark ? "border-[#334155]" : "border-[#E2E8F0]"
            }`}
          >
            <p
              className={`text-sm ${
                isDark ? "text-[#94A3B8]" : "text-[#64748B]"
              }`}
            >
              &copy; 2026 CV Kurnia Mandiri
            </p>
            <button
              type="button"
              onClick={toggleSkinMode}
              aria-label={
                isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"
              }
              title={isDark ? "Mode Terang" : "Mode Gelap"}
              className={`inline-flex h-11 min-w-11 px-3 shrink-0 items-center justify-center gap-2 rounded-md border text-sm font-medium cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 ${
                isDark
                  ? "border-[#334155] bg-[#0F172A] text-[#E2E8F0] hover:bg-[#334155] hover:border-[#475569] hover:text-white focus-visible:outline-[#60A5FA]"
                  : "border-[#E2E8F0] bg-[#F8FAFC] text-[#1E293B] hover:bg-[#F1F5F9] hover:border-[#CBD5E1] focus-visible:outline-[#2563EB]"
              }`}
            >
              {isDark ? (
                <Sun className="h-4 w-4 shrink-0" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <span className="hidden min-[380px]:inline">
                {isDark ? "Mode Terang" : "Mode Gelap"}
              </span>
            </button>
          </div>
        </section>

        {/* Panel Kanan: Foto Tim Tanpa Halangan Overlay */}
        <aside
          aria-label="CV Kurnia Mandiri"
          className={`lg:col-span-7 flex flex-col justify-between text-white border-t lg:border-t-0 lg:border-l ${
            isDark
              ? "bg-[#162032] border-[#334155]"
              : "bg-[#0F172A] border-[#E2E8F0]"
          }`}
        >
          {/* Bingkai rasio 16:9 mengikuti dimensi asli 1280x720 agar wajah keempat anggota tim tampil utuh */}
          <div className="relative aspect-video w-full flex-1 overflow-hidden bg-[#1E293B]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/HalamanLogin/Team5.jpeg"
              width={1280}
              height={720}
              fetchPriority="high"
              alt="Tim Pengembang Sistem Informasi CV Kurnia Mandiri"
              className="h-full w-full object-cover object-center"
            />
          </div>

          <div
            className={`px-5 py-4 sm:px-7 sm:py-5 border-t ${
              isDark
                ? "bg-[#162032] border-[#334155]"
                : "bg-[#0F172A] border-[#1E293B]"
            }`}
          >
            <h2 className="text-base font-semibold text-white">
              CV Kurnia Mandiri
            </h2>
            <p className="mt-0.5 text-sm text-[#94A3B8]">
              Toko Bahan Bangunan
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
