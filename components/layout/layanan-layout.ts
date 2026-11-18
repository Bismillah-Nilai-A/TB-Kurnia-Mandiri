import {
  LayoutDashboard,
  Package,
  Receipt,
  FileBarChart,
  type LucideIcon,
} from "lucide-react";
import {
  supabase,
  usernameToSyntheticEmail,
  type POSUser,
} from "@/lib/supabase";
import type { Role } from "@/lib/db";

export interface SubMenuItem {
  href: string;
  label: string;
}

export interface NavDropdownItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: SubMenuItem[];
}

export interface NavGroup {
  label: string;
  items: NavDropdownItem[];
}

export interface HeaderNotif {
  id: string;
  title: string;
  time: string;
  tone: "warning" | "success" | "info";
}

export interface SearchEntry {
  id: string;
  category: "Halaman" | "Barang" | "Transaksi";
  title: string;
  subtitle: string;
  href: string;
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Utama",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
      },
    ],
  },
  {
    label: "Menu Operasional",
    items: [
      {
        id: "penjualan",
        label: "Penjualan",
        icon: Receipt,
        children: [
          { href: "/transaksi", label: "Transaksi Kasir" },
          { href: "/piutang", label: "Piutang & Pelanggan" },
          { href: "/pengiriman", label: "Pengiriman" },
        ],
      },
      {
        id: "persediaan",
        label: "Persediaan",
        icon: Package,
        children: [{ href: "/barang", label: "Barang & Stok" }],
      },
      {
        id: "laporan-sistem",
        label: "Laporan & Sistem",
        icon: FileBarChart,
        children: [
          { href: "/laporan", label: "Laporan" },
          { href: "/pengaturan", label: "Pengaturan" },
        ],
      },
    ],
  },
];

export const PAGE_SEARCH_ENTRIES: SearchEntry[] = [
  {
    id: "page-dashboard",
    category: "Halaman",
    title: "Dashboard Ringkasan",
    subtitle: "Utama > Dashboard",
    href: "/dashboard",
  },
  {
    id: "page-transaksi",
    category: "Halaman",
    title: "Transaksi Kasir (POS)",
    subtitle: "Penjualan > Transaksi Kasir",
    href: "/transaksi",
  },
  {
    id: "page-piutang",
    category: "Halaman",
    title: "Piutang & Pelanggan",
    subtitle: "Penjualan > Piutang & Pelanggan",
    href: "/piutang",
  },
  {
    id: "page-pengiriman",
    category: "Halaman",
    title: "Pengiriman Barang",
    subtitle: "Penjualan > Pengiriman",
    href: "/pengiriman",
  },
  {
    id: "page-barang",
    category: "Halaman",
    title: "Barang & Stok Gudang",
    subtitle: "Persediaan > Barang & Stok",
    href: "/barang",
  },
  {
    id: "page-laporan",
    category: "Halaman",
    title: "Laporan Toko",
    subtitle: "Laporan & Sistem > Laporan",
    href: "/laporan",
  },
  {
    id: "page-pengaturan",
    category: "Halaman",
    title: "Pengaturan Sistem",
    subtitle: "Laporan & Sistem > Pengaturan",
    href: "/pengaturan",
  },
];

export const ROLE_LABEL: Record<string, string> = {
  admin: "Pemilik",
  kasir: "Kasir",
  pengirim: "Pengirim",
};

function mapPenggunaRow(row: {
  id: string;
  nama: string;
  username: string;
  role: string;
  status: string;
}): POSUser {
  const uname = String(row.username);
  return {
    id: String(row.id),
    nama: String(row.nama),
    username: uname,
    email: usernameToSyntheticEmail(uname),
    role: row.role as Role,
    status: String(row.status),
  };
}

// Ambil seluruh akun pengguna aktif dari Supabase agar daftar peran tidak memakai dummy statis.
export async function muatDaftarAkunPeranSupabase(): Promise<{
  users: POSUser[];
  byRole: Partial<Record<Role, POSUser>>;
}> {
  const { data } = await supabase
    .from("pengguna")
    .select("id, nama, username, role, status")
    .eq("status", "aktif")
    .order("id", { ascending: true });

  const users = (data || []).map(mapPenggunaRow);
  const byRole: Partial<Record<Role, POSUser>> = {};

  for (const u of users) {
    if (!byRole[u.role] || u.username === u.role) {
      byRole[u.role] = u;
    }
  }

  return { users, byRole };
}

export async function cariAkunAktifPeranSupabase(
  targetRole: Role
): Promise<POSUser | null> {
  const { data } = await supabase
    .from("pengguna")
    .select("id, nama, username, role, status")
    .eq("role", targetRole)
    .eq("status", "aktif")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data ? mapPenggunaRow(data) : null;
}

export function initials(nama: string) {
  return nama
    .replace(/\(.*?\)/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export async function muatDataHeaderSupabase(): Promise<{
  notifications: HeaderNotif[];
  searchEntries: SearchEntry[];
}> {
  const [{ data: notifRows }, { data: barangRows }, { data: trxRows }] =
    await Promise.all([
      supabase
        .from("notifikasi")
        .select("id, jenis, pesan, waktu, status_kirim")
        .order("waktu", { ascending: false })
        .limit(5),
      supabase
        .from("barang")
        .select("id, kode_barang, nama, stok, satuan, harga")
        .order("kode_barang", { ascending: true })
        .limit(40),
      supabase
        .from("transaksi")
        .select("id, no_nota, total, status_bayar")
        .order("tanggal", { ascending: false })
        .limit(15),
    ]);

  const notifications: HeaderNotif[] = (notifRows || []).map((n) => ({
    id: String(n.id),
    title: String(n.pesan || n.jenis),
    time: new Date(String(n.waktu)).toLocaleString("id-ID", {
      dateStyle: "short",
      timeStyle: "short",
    }),
    tone: String(n.jenis).toLowerCase().includes("stok")
      ? "warning"
      : String(n.status_kirim) === "terkirim"
        ? "success"
        : "info",
  }));

  const searchEntries: SearchEntry[] = [];
  if (barangRows) {
    for (const b of barangRows) {
      searchEntries.push({
        id: `brg-${b.id}`,
        category: "Barang",
        title: `${b.kode_barang} - ${b.nama}`,
        subtitle: `Stok: ${b.stok} ${b.satuan} | Rp ${Number(b.harga).toLocaleString("id-ID")}`,
        href: "/barang",
      });
    }
  }
  if (trxRows) {
    for (const t of trxRows) {
      searchEntries.push({
        id: `trx-${t.id}`,
        category: "Transaksi",
        title: `Nota ${t.no_nota}`,
        subtitle: `Rp ${Number(t.total).toLocaleString("id-ID")} (${String(t.status_bayar).toUpperCase()})`,
        href: "/transaksi",
      });
    }
  }

  return { notifications, searchEntries };
}
