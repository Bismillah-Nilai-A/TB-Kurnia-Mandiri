import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

// Kepala halaman gaya Dashbyte (boiler-plate-laravel-pustekinfo):
// Breadcrumb di bagian atas konten (contoh: Penjualan > Transaksi Kasir), judul halaman, dan tombol aksi di kanan.
export function PageHeader({
  title,
  description,
  crumbs = [],
  actions,
}: {
  title: string;
  description?: string;
  crumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
      <div className="min-w-0">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-1">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-[#64748B]">
              {crumbs.map((c, i) => {
                const isLast = i === crumbs.length - 1;
                return (
                  <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                    {i > 0 && (
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-[#94A3B8]"
                        aria-hidden="true"
                      />
                    )}
                    {c.href && !isLast ? (
                      <Link
                        href={c.href}
                        className="hover:text-[#2563EB] transition-colors"
                      >
                        {c.label}
                      </Link>
                    ) : (
                      <span
                        aria-current={isLast ? "page" : undefined}
                        className={
                          isLast
                            ? "font-semibold text-[#2563EB]"
                            : "text-[#64748B]"
                        }
                      >
                        {c.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
        <h1 className="page-title truncate">{title}</h1>
        {description && (
          <p className="mt-1 text-base text-[#64748B]">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
