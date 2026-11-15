"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { NavLink } from "@/components/ui";
import {
  supabase,
  getCurrentUser,
  checkPermission,
  clearSessionUser,
  setCurrentSessionUser,
  logAktivitas,
  type POSUser,
} from "@/lib/supabase";
import { ROLE_PERMISSIONS, Role } from "@/lib/db";
import {
  LayoutDashboard,
  Package,
  Receipt,
  CreditCard,
  Truck,
  FileBarChart,
  Settings,
  LogOut,
  ShieldAlert,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/barang", label: "Barang & Stok", icon: Package },
  { href: "/transaksi", label: "Transaksi POS", icon: Receipt },
  { href: "/piutang", label: "Piutang & Pelanggan", icon: CreditCard },
  { href: "/pengiriman", label: "Pengiriman", icon: Truck },
  { href: "/laporan", label: "Laporan", icon: FileBarChart },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
];

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<POSUser | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const u = await getCurrentUser();
      if (!u) {
        router.push("/login");
        return;
      }

      setUser(u);
      const ok = await checkPermission(pathname);
      setAllowed(ok);
      setLoading(false);
    };
    check();
  }, [pathname, router]);

  const handleLogout = async () => {
    if (user) {
      await logAktivitas({
        modul: "Autentikasi",
        aktivitas: `Logout pengguna ${user.nama} (${user.role})`,
        penggunaId: user.id,
      });
    }
    clearSessionUser();
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    router.push("/login");
  };

  const handleSwitchRole = async (targetRole: Role) => {
    const roleAccounts: Record<string, POSUser> = {
      admin: {
        id: "a0000000-0000-0000-0000-000000000001",
        nama: "Arif Muhamad (Admin)",
        username: "admin",
        email: "admin@kurnia.local",
        role: "admin",
        status: "aktif",
      },
      kasir: {
        id: "a0000000-0000-0000-0000-000000000002",
        nama: "Budi Santoso (Kasir)",
        username: "kasir",
        email: "kasir@kurnia.local",
        role: "kasir",
        status: "aktif",
      },
      pengirim: {
        id: "a0000000-0000-0000-0000-000000000004",
        nama: "Hendra Wijaya (Pengirim)",
        username: "pengirim",
        email: "pengirim@kurnia.local",
        role: "pengirim",
        status: "aktif",
      },
    };
    const nextUser = roleAccounts[targetRole];
    if (nextUser) {
      setCurrentSessionUser(nextUser);
      setUser(nextUser);
      const ok = ROLE_PERMISSIONS[targetRole].some(
        (p) => pathname === p || pathname.startsWith(p + "/")
      );
      setAllowed(ok);
      if (!ok) {
        router.push(targetRole === "pengirim" ? "/pengiriman" : "/dashboard");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const allowedRoutes = user
    ? ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.admin
    : [];

  return (
    <div className="h-screen overflow-hidden flex bg-gray-100 print:h-auto print:overflow-visible print:bg-white">
      {/* Sidebar (tetap penuh 1 layar & tidak terpotong) */}
      <aside className="w-64 h-full bg-white border-r border-gray-200 flex flex-col justify-between p-4 shrink-0 overflow-y-auto print:hidden">
        <div className="flex flex-col gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              KM
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 text-sm leading-tight">
                CV Kurnia Mandiri
              </span>
              <span className="text-[11px] text-gray-500">
                POS & Persediaan v1.2
              </span>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.filter((item) =>
              allowedRoutes.some(
                (r) => item.href === r || item.href.startsWith(r + "/")
              )
            ).map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                active={
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Footer & Role Switcher */}
        <div className="border-t border-gray-200 pt-3 flex flex-col gap-2.5">
          {user && (
            <div className="px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-100 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-900 truncate">
                  {user.nama}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-blue-100 text-blue-700">
                  {user.role}
                </span>
              </div>
              <span className="text-[11px] text-gray-400 truncate">
                @{user.username}
              </span>
              {/* Quick Role Switcher untuk Pengujian RBAC */}
              <div className="flex items-center gap-1 mt-1 pt-1 border-t border-gray-200/70">
                {(["admin", "kasir", "pengirim"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleSwitchRole(r)}
                    className={`flex-1 py-0.5 text-[10px] rounded font-medium capitalize transition ${
                      user.role === r
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto p-5 pb-12 print:h-auto print:overflow-visible print:p-0">
        {allowed === false ? (
          <div className="flex flex-col items-center justify-center h-96 text-center gap-3">
            <ShieldAlert className="w-12 h-12 text-red-500" />
            <h2 className="text-lg font-bold text-gray-800">Akses Ditolak (403)</h2>
            <p className="text-sm text-gray-500 max-w-sm">
              Peran Anda ({user?.role}) tidak memiliki izin untuk mengakses halaman{" "}
              <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">
                {pathname}
              </code>
              .
            </p>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
