import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-slate-50">
      <div className="max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-3xl font-extrabold text-slate-900">404</h2>
        <p className="mt-2 text-lg font-semibold text-slate-800">
          Halaman Tidak Ditemukan
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Halaman yang Anda cari tidak tersedia di sistem POS CV Kurnia Mandiri.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/dashboard">Kembali ke Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

