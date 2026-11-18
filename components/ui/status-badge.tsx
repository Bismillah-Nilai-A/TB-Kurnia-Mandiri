import type { ComponentType } from "react";
import {
  CircleCheck,
  TriangleAlert,
  CircleX,
  Clock,
  Truck,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

// Warna turunan (muda + teks) dari panduan gaya.
const TONE_CLASS: Record<Tone, string> = {
  success: "bg-[#DCFCE7] text-[#15803D]",
  warning: "bg-[#FEF3C7] text-[#92400E]",
  danger: "bg-[#FEE2E2] text-[#B91C1C]",
  info: "bg-[#DBEAFE] text-[#1D4ED8]",
  neutral: "bg-[#F1F5F9] text-[#334155]",
};

type Preset = { tone: Tone; icon: ComponentType<{ className?: string }>; label: string };

// Kunci = nilai status dari database (huruf kecil). Label = bahasa sehari-hari.
const PRESETS: Record<string, Preset> = {
  // Stok
  aman: { tone: "success", icon: CircleCheck, label: "Stok Aman" },
  tersedia: { tone: "success", icon: CircleCheck, label: "Stok Aman" },
  menipis: { tone: "warning", icon: TriangleAlert, label: "Stok Menipis" },
  habis: { tone: "danger", icon: CircleX, label: "Stok Habis" },
  // Pembayaran
  lunas: { tone: "success", icon: CircleCheck, label: "Lunas" },
  belum_lunas: { tone: "warning", icon: Clock, label: "Belum Lunas" },
  sebagian: { tone: "warning", icon: Clock, label: "Belum Lunas" },
  menunggu: { tone: "warning", icon: Clock, label: "Menunggu" },
  pending: { tone: "warning", icon: Clock, label: "Menunggu" },
  gagal: { tone: "danger", icon: CircleX, label: "Gagal" },
  berhasil: { tone: "success", icon: CircleCheck, label: "Berhasil" },
  // Kasbon
  disetujui: { tone: "success", icon: CircleCheck, label: "Disetujui" },
  ditolak: { tone: "danger", icon: CircleX, label: "Ditolak" },
  // Pengiriman
  belum_dikirim: { tone: "info", icon: Clock, label: "Menunggu Dikirim" },
  menunggu_dikirim: { tone: "info", icon: Clock, label: "Menunggu Dikirim" },
  sedang_dikirim: { tone: "info", icon: Truck, label: "Dalam Perjalanan" },
  dalam_perjalanan: { tone: "info", icon: Truck, label: "Dalam Perjalanan" },
  diterima: { tone: "success", icon: CircleCheck, label: "Selesai" },
  selesai: { tone: "success", icon: CircleCheck, label: "Selesai" },
  kendala: { tone: "danger", icon: TriangleAlert, label: "Ada Kendala" },
  ada_kendala: { tone: "danger", icon: TriangleAlert, label: "Ada Kendala" },
  retur: { tone: "danger", icon: TriangleAlert, label: "Retur" },
  // Akun & notifikasi
  aktif: { tone: "success", icon: CircleCheck, label: "Aktif" },
  nonaktif: { tone: "danger", icon: CircleX, label: "Nonaktif" },
  terkirim: { tone: "success", icon: CircleCheck, label: "Terkirim" },
  // Mutasi barang
  masuk: { tone: "success", icon: CircleCheck, label: "Masuk" },
  keluar: { tone: "warning", icon: TriangleAlert, label: "Keluar" },
};

function humanize(value: string) {
  const s = value.replace(/_/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Status selalu tampil sebagai warna + ikon + tulisan.
 * `status` = nilai mentah dari database; `label` mengganti tulisan bila perlu.
 */
export function StatusBadge({
  status,
  label,
  tone,
  className,
}: {
  status?: string | null;
  label?: string;
  tone?: Tone;
  className?: string;
}) {
  const key = (status || "").toLowerCase().trim().replace(/\s+/g, "_");
  const preset = PRESETS[key];
  const finalTone: Tone = tone ?? preset?.tone ?? "neutral";
  const Icon = preset && !tone ? preset.icon : toneIcon(finalTone);
  const text = label ?? preset?.label ?? humanize(status || "-");

  return (
    <span
      className={cn(
        "inline-flex min-w-[9.25rem] items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold",
        TONE_CLASS[finalTone],
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {text}
    </span>
  );
}

function toneIcon(tone: Tone) {
  switch (tone) {
    case "success":
      return CircleCheck;
    case "warning":
      return TriangleAlert;
    case "danger":
      return CircleX;
    case "info":
      return Clock;
    default:
      return Circle;
  }
}

export default StatusBadge;
