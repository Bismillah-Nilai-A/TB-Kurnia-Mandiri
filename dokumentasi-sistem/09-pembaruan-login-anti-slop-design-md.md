# 09 - Pembaruan Halaman Login Mengikuti DESIGN.md, Anti-Slop, dan Stop-Slop

Dokumentasi ini merangkum penyempurnaan desain dan aksesibilitas pada halaman autentikasi (`/login`) di `components/login/LoginPage.tsx`. Pembaruan mengambil inspirasi tata letak *split-screen* tanpa menyalin gaya template generik agar selaras dengan sistem desain CV Kurnia Mandiri (`DESIGN.md`) serta lolos pemeriksaan `.agents` (`antislop`) dan `stop-slop`.

## Ringkasan Masalah pada Desain Sebelumnya

1. **Terlalu menyerupai template referensi (*slop tells*)**:
   - Lapisan *frosted-glass* (`backdrop-blur-xs`) dipakai pada kartu merek dan 4 kapsul fitur di atas foto.
   - Terdapat lencana kapsul bertitik hijau dekoratif (`Rapi • Cepat • Terkendali`) tepat di atas judul utama.
   - Menggunakan pola tiga poin (*Rule of Three*) dan pencampuran gradasi biru gelap yang menutupi kejelasan foto tim.
2. **Ketidaksesuaian `DESIGN.md` & Keterbacaan**:
   - Latar halaman memakai putih polos (`bg-white`), belum menggunakan kanvas `#F8FAFC` (Mode Terang) / `#0F172A` (Mode Gelap) dan kartu `.km-card` (`border-radius: 6px`).
   - Label input dan footer memakai `text-xs`, sedangkan standar sistem mewajibkan teks isi di kisaran `16px-18px` (`text-sm`/`text-base` di `globals.css`).
   - *Placeholder* input menggunakan warna `#94A3B8` pada latar terang `#F8FAFC` yang kontrasnya di bawah 4.5:1 (WCAG AA).
3. **Aksesibilitas & Responsivitas Layar Kecil**:
   - Heading `<h1>` hanya tampil di panel desktop (`hidden lg:flex`), sehingga tampilan seluler tidak memiliki `<h1>`.
   - Tab pemilih peran 3 kolom memuat kata `"Login Pemilik"`, `"Login Kasir"`, dan `"Login Pengirim"` yang berisiko terpotong pada layar 4 inci (`320px`).
   - Tombol pengubah tema berukuran `36px x 36px` (`h-9 w-9`), di bawah target sentuh minimum `44px x 44px` (`h-11 w-11`).

## Perubahan Utama yang Diterapkan

| Bagian | Sebelumnya | Pembaruan Saat Ini | Referensi |
| :--- | :--- | :--- | :--- |
| **Struktur Kanvas & Kartu** | Dua panel polos langsung di `bg-white` | Kartu `.km-card` terbingkai (`max-w-[1120px]`) di atas latar `#F8FAFC` / `#0F172A` dengan *grid* `12` kolom (`5` form, `7` visual) | `DESIGN.md` & Konsistensi App |
| **Motif Merek** | Kotak gradien inisial `"KM"` ber-efek kaca | Wordmark `Kurnia Mandiri.` bertitik aksen biru (`#2563EB` / `#60A5FA`) identik dengan `SidebarUtama.tsx` | `DESIGN.md` & `antislop` Block 3 |
| **Posisi Form & Heading `<h1>`** | Form di kanan; `<h1>` tersembunyi di panel foto mobile | Form berada di panel kiri (kolom pertama di mobile) dengan `<h1>Masuk ke Sistem</h1>` selalu terlihat di semua ukuran layar | `antislop-human` & `antislop-layoutmobile` |
| **Kontrol Akses Cepat Peran** | `"Login Pemilik"`, `"Login Kasir"`, `"Login Pengirim"` | Ringkas `"Pemilik"`, `"Kasir"`, `"Pengirim"` dengan tinggi minimum `44px` (`min-h-11`) agar muat satu baris di layar `320px` | `antislop-layoutmobile` |
| **Presentasi `Team5.jpeg`** | Foto tertutup kartu kaca, pil dekoratif, dan *blend* biru | Foto rasio `16:9` (`1280x720`, `fetchPriority="high"`) tampil utuh di panel kanan; seluruh teks informasi ditempatkan pada blok solid `#0F172A` di bawah foto | `antislop-ui` (R-09, R-10, R-25, R-40) |
| **Kontras & Fokus Papan Ketik** | *Placeholder* `#94A3B8`, tombol tema `h-9 w-9` | *Placeholder* `#64748B` (Light) / `#94A3B8` (Dark), cincin fokus eksplisit `#2563EB` / `#60A5FA` (>= 3:1), serta seluruh tombol interaktif >= `44px` | `antislop-human` (R-25, R-32, R-39) |
| **Salinan Bahasa Indonesia** | Slogan 3 item dan lencana kapsul pemasaran | Kalimat aktif langsung dalam bahasa Indonesia dengan pembagian 2 blok ringkas (`Kasir & Piutang`, `Gudang & Pengantaran`) | `stop-slop` & `antislop-copywriting` |

## File Terkait

- **Tampilan & UI**: [`components/login/LoginPage.tsx`](../components/login/LoginPage.tsx)
- **Layanan Autentikasi (Tidak Berubah)**: [`components/login/layanan-login.ts`](../components/login/layanan-login.ts)
- **Rute Halaman**: [`app/(auth)/login/page.tsx`](../app/(auth)/login/page.tsx)

## Verifikasi Logika Bisnis (Tetap 100% Utuh)

- Pengisian otomatis kredensial cepat (`QUICK_ROLES`: `Pemilik`, `Kasir`, `Pengirim`) tetap memanggil data yang sama.
- Validasi kolom kosong sebelum mengirim ke server menampilkan peringatan langsung pada elemen `role="alert"`.
- Proses login melalui `prosesLoginPengguna(username, password)`, pembacaan data `users` Supabase, penyimpanan `sessionStorage`, pencatatan log aktivitas, dan pengalihan rute berdasarkan peran berjalan tanpa perubahan kontrak API maupun database.
