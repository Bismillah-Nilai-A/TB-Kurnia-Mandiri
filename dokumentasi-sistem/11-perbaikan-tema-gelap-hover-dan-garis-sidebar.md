# 11 - Perbaikan Kontras Hover Mode Gelap Global & Garis Putih Sidebar Biru/Gelap

Dokumentasi ini mencatat perbaikan konflik warna saat *hover* maupun kondisi normal di Mode Gelap (`data-skin="dark"`) pada halaman `/login` maupun seluruh halaman operasional, serta penghilangan garis tepi dan pemisah berwarna putih pada sidebar tema Biru dan Gelap saat Mode Terang.

## Akar Masalah yang Ditemukan

1. **Aturan `* { border-color: var(--border); }` tanpa `@layer base` di `app/globals.css`**:
   - Pada Tailwind CSS v4, aturan global tanpa *layer* mengalahkan seluruh utilitas `border-*` di `@layer utilities`. Akibatnya saat Mode Terang aktif (`--border: #e2e8f0`), kelas seperti `border-white/10`, `border-[#1E40AF]`, dan `border-[#1E293B]` di sidebar Biru maupun Gelap tetap dipaksa menjadi `#E2E8F0` (garis putih/abu terang).
   - Di Mode Gelap halaman `/login`, kondisi yang sama membuat batas input `border-[#334155]` dan fokus `focus:border-[#60A5FA]` tertimpa garis redup `#283548`.
2. **Utilitas `hover:bg-*`, `hover:text-*`, dan Latar Pastel Tidak Ter-override saat Mode Gelap**:
   - Kelas `.bg-white` dan `.text-[#1E293B]` berubah ke latar gelap dan teks putih saat `data-skin="dark"`, tetapi kelas *hover* seperti `hover:bg-[#F8FAFC]`, `hover:bg-[#F1F5F9]`, `hover:bg-[#EFF6FF]`, `hover:bg-gray-50`, dan `hover:text-[#1E293B]` tidak ikut diterjemahkan. Ketika kursor diarahkan ke baris tabel, tombol, dropdown, notifikasi, atau kartu produk, latar berubah putih/terang di belakang teks putih sehingga tulisan hilang.
3. **Benturan Warna pada Sidebar Tema Biru/Gelap, Header, & Footer Login**:
   - Pada footer sidebar tema Biru/Gelap (`SidebarUtama.tsx`), pemilih `Peran Aktif` memakai latar `bg-[#F1F5F9]` terang dan tombol `Keluar` memakai `text-[#DC2626] hover:bg-[#FEF2F2]` yang sulit dibaca di atas biru tua `#1E3A8A` maupun biru-hitam `#0F172A`, serta indikator online masih memakai `ring-white`.
   - Pada Mode Gelap halaman `/login`, panel bawah kanan `#0F172A` menyatu dengan latar halaman `#0F172A` sehingga batas kartu kanan bawah tampak samar.

## Perubahan yang Diterapkan

### 1. Pondasi Tema Global (`app/globals.css`)
- Memindahkan `* { border-color: var(--border); }` ke dalam `@layer base` agar utilitas warna *border* komponen berjalan normal.
- Menambahkan pemetaan `--color-slate-50` hingga `--color-slate-900` untuk `html[data-skin="dark"]`.
- Menambahkan aturan *override* lengkap di `html[data-skin="dark"]` untuk:
  - Latar *hover* netral (`hover:bg-[#F8FAFC]`, `hover:bg-[#F1F5F9]`, `hover:bg-[#E2E8F0]`, `hover:bg-gray-50/100`, `hover:bg-slate-50/100`, `hover:bg-white`, `group-hover:bg-white`) menjadi `#283548` / `#0F172A` agar teks terang tetap kontras tinggi.
  - Latar *hover* & badge semantik (`hover:bg-[#EFF6FF]`, `hover:bg-blue-50/100`, `hover:bg-red-50`, `hover:bg-emerald-100`, `hover:bg-amber-50`, `bg-*-50`) menjadi tinta transparan gelap selaras (`rgba(..., 0.20..0.30)`) disertai teks pastel cerah (`#93C5FD`, `#6EE7B7`, `#FCD34D`, `#FCA5A5`).
  - Teks saat *hover* (`hover:text-[#1E293B]`, `hover:text-gray-800`, `hover:text-[#1D4ED8]`, `hover:text-[#2563EB]`) menjadi `#F8FAFC` atau `#93C5FD`, dengan menjaga `group-hover:text-white` tetap putih pada chip biru solid.

### 2. Sidebar Tema Biru & Gelap (`components/layout/ProtectedLayoutView.tsx`, `components/layout/SidebarUtama.tsx`)
- Mengirimkan properti `sidebarSkin` (`default` | `prime` | `dark`) ke `SidebarUtama`.
- Mengganti garis pemisah dan tepi kanan sidebar dari `border-white/10` menjadi `border-[#2563EB]/35` (Sidebar Biru) dan `border-[#1E293B]` (Sidebar Gelap), serta menyesuaikan `ring` titik status menjadi `ring-[#1E3A8A]` atau `ring-[#0F172A]`.
- Meningkatkan keterbacaan label grup (`text-white/80`) dan menyesuaikan kotak pemilih `Peran Aktif` (`bg-black/25 border-black/20`) serta tombol `Keluar` (`text-[#FCA5A5] hover:bg-red-500/20`) saat sidebar bertema gelap/biru.

### 3. Header & Halaman Login (`components/layout/HeaderUtama.tsx`, `components/login/LoginPage.tsx`)
- `HeaderUtama.tsx`: menyesuaikan kolom pencarian header (`bg-[#0F172A] border-[#334155]` fokus/hover) dan lingkaran avatar online (`ring-[#1E293B]`) saat Mode Gelap aktif.
- `LoginPage.tsx`:
  - Memakai permukaan `#162032` pada blok footer panel kanan saat Mode Gelap sehingga batas seluruh kartu `.km-card` terpisah jelas dari latar `#0F172A`.
  - Menyempurnakan tombol peran (`bg-[#2563EB]/20 text-[#93C5FD]` saat aktif, `hover:bg-[#1E293B] hover:text-white` saat tidak aktif), input ber-hover `hover:border-[#475569]`, dan tombol pengubah tema dengan label jelas `Mode Terang` / `Mode Gelap`.

## File yang Diperbarui

- [`app/globals.css`](../app/globals.css)
- [`components/layout/ProtectedLayoutView.tsx`](../components/layout/ProtectedLayoutView.tsx)
- [`components/layout/SidebarUtama.tsx`](../components/layout/SidebarUtama.tsx)
- [`components/layout/HeaderUtama.tsx`](../components/layout/HeaderUtama.tsx)
- [`components/login/LoginPage.tsx`](../components/login/LoginPage.tsx)
- [`dokumentasi-sistem/README.md`](./README.md)
