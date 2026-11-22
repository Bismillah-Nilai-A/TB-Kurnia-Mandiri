# 13 - Panduan Branch, Pemisahan Commit per Folder, dan Format Pesan Commit

Dokumen ini menjadi pegangan tim saat mengirim perubahan ke repositori Git agar riwayat kerja rapi dan mudah dibaca semua anggota.

## Aturan Branch

1. Jangan langsung melakukan `push` ke branch `main`.
2. Buat branch terpisah sesuai nama dan fokus pekerjaan, misalnya `rafly/penyempurnaan-desain` atau `nama/nama-fitur`.
3. Pastikan build (`npx tsc --noEmit` dan `npx next build`) lolos terlebih dahulu sebelum melakukan push ke remote.

## Aturan Pengelompokan Commit & Push

- Lakukan *commit* dan *push* secara bertahap per folder atau per file/modul agar rekan tim mudah membaca bagian mana saja yang berubah.
- Gunakan Bahasa Indonesia yang singkat, jelas, mudah dipahami rekan tim, serta hindari kalimat bergaya AI yang terlalu panjang.

## Pemisahan Folder Dokumentasi

- **`dokumentasi-sistem/`**: Khusus untuk dokumentasi teknis, arsitektur, dan perubahan pada **proyek aplikasi utama** (Next.js, komponen UI, tema, dan integrasi database).
- **`dokumentasi-wireframe/`**: Khusus untuk dokumentasi pembuatan dan revisi **wireframe, interactive prototype, serta panduan gaya Figma** yang berada di folder `wireframe/`. Jangan mencampur dokumentasi wireframe ke dalam `dokumentasi-sistem/`.

## Jenis Tipe Pesan Commit

Gunakan awalan tipe berikut sesuai isi perubahan pada folder terkait:

| Tipe | Kegunaan | Contoh Singkat |
| :--- | :--- | :--- |
| `feat` | Menambah fitur baru pada aplikasi atau pustaka | `feat(login): tambah tampilan split-screen dan pilih peran cepat` |
| `fix` | Memperbaiki kesalahan atau bug pada kode | `fix(tema): perbaiki warna hover mode gelap dan garis putih sidebar` |
| `docs` | Pembaruan dokumentasi saja | `docs(dokumentasi-sistem): tambah catatan perbaikan login dan tema` |
| `style` | Rapikan format kode (spasi, indentasi, titik koma) tanpa ubah logika | `style(ui): rapikan indentasi komponen kartu` |
| `refactor` | Merapikan struktur kode tanpa menambah fitur atau memperbaiki bug | `refactor(barang): pisah layanan, hook, dan komponen tabel barang` |
| `perf` | Meningkatkan kecepatan atau performa aplikasi | `perf(login): prioritaskan muat gambar utama halaman masuk` |
| `test` | Menambah atau memperbaiki pengujian | `test(transaksi): tambah skenario uji hitung kasbon` |
| `build` | Perubahan sistem build atau dependensi eksternal (`npm`, `webpack`) | `build: perbarui konfigurasi next untuk alias modul` |
| `ci` | Perubahan konfigurasi CI/CD (`GitHub Actions`, `GitLab CI`) | `ci: tambah alur cek build otomatis saat pull request` |
| `chore` | Tugas pemeliharaan rutin yang tidak mengubah kode aplikasi | `chore: perbarui aturan pengabaian file sementara di gitignore` |
