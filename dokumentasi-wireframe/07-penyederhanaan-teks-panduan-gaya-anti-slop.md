# 07 - Penyederhanaan Halaman Panduan Gaya (`wireframe/panduan-gaya.html`) Sesuai Aturan Anti-Slop & Stop-Slop

Dokumen ini mencatat pemangkasan teks deskriptif berlebih, penghapusan *badge* kategori/nomor teknis, dan penyederhanaan tata letak pada [`wireframe/panduan-gaya.html`](../wireframe/panduan-gaya.html) agar selaras dengan referensi gambar panduan gaya pengguna, `.agents/skills/antislop*`, dan `stop-slop/SKILL.md`.

---

## 1. Masalah yang Diperbaiki

Pada versi sebelumnya, halaman `panduan-gaya.html` memiliki ciri *AI-slop* berupa terlalu banyak kata penjelasan yang tidak diperlukan di kanvas panduan gaya:
- Subjudul panjang di bawah judul utama `Panduan Gaya - POS CV Kurnia Mandiri`.
- Paragraf penjelasan teknis pada setiap seksi (`min-w-[9.25rem]`, `placement="top"`, `html[data-size="kecil"]`, `display: none`).
- Tabel spesifikasi panjang dan kartu-kartu penjelasan skala teks.
- *Eyebrow label* bernomor (`01. POS & Data Barang`, `16. Pengguna & Hak Akses`) serta *capsule badge* (`High-Fidelity Real App`, `RBAC Role`, `Audit Log`, `Multi-Satuan`) di atas setiap komponen *dropdown*.

---

## 2. Perubahan yang Diterapkan

1. **Tata Letak Bersih Mengikuti Gambar Referensi**:
   - Menghapus bar navigasi atas dan subjudul deskriptif di bawah judul `Panduan Gaya - POS CV Kurnia Mandiri`.
   - Mempertahankan baris 10 kapsul status di bagian paling atas halaman (di luar kartu utama) untuk kemudahan menyalin komponen ke Figma.
2. **Seksi Warna & Ukuran Teks yang Ringkas**:
   - Menampilkan 10 kotak warna Mode Terang (`#2563EB`, `#1D4ED8`, `#F59E0B`, `#F8FAFC`, `#FFFFFF`, `#1E293B`, `#64748B`, `#16A34A`, `#DC2626`, `#CBD5E1`) dan 5 kotak warna Mode Gelap (`#0F172A`, `#1E293B`, `#F8FAFC`, `#94A3B8`, `#334155`) beserta satu kalimat catatan warna turunan status.
   - Menghapus tabel spesifikasi panjang dan kartu penjelasan `data-size`, menyisakan daftar visual ukuran teks `Plus Jakarta Sans` (`32`, `22`, `18 tebal`, `18`, `16 tebal`, `16`, `14 tebal`) dan `JetBrains Mono` (`13`).
3. **Seksi Status, Tombol, dan Dropdown Tanpa Teks Berlebih**:
   - Menghapus seluruh paragraf pengantar, kotak pembungkus berlapis, nomor urut (`01..18`), dan lencana kategori di atas setiap *dropdown*.
   - Setiap komponen *dropdown* (`Kategori Barang`, `Satuan Jual`, `Pelanggan`, `Petugas Pengirim`, `Status Pembayaran`, `Nomor Nota Transaksi Asal`, `Kondisi Barang yang Dikembalikan`, `Pilih Barang Pengganti`, `Jenis Pelanggan`, `Jenis Mutasi Stok`, `Pilih Barang Restok`, `Pemasok Tujuan`, `Status Pengiriman`, `Hasil Pengiriman di Lokasi`, `Jenis Kendala Lapangan`, `Peran Pengguna`, `Modul Log Aktivitas`, `Pilih Tanggal`, `Pengaturan Tampilan`, `Profil Header & Sub-Menu Sidebar`, dan `Paginasi Tabel 5 / hal`) kini hanya menampilkan **Label + Trigger + Daftar Opsi Terbuka** secara bersih dan siap disalin ke Figma.
4. **Seksi Prinsip Desain**:
   - Menggunakan 6 butir kalimat singkat yang sama persis dengan contoh gambar referensi panduan gaya.

---

## 3. File yang Diperbarui & Ditambahkan

- [`wireframe/panduan-gaya.html`](../wireframe/panduan-gaya.html)
- [`dokumentasi-wireframe/07-penyederhanaan-teks-panduan-gaya-anti-slop.md`](./07-penyederhanaan-teks-panduan-gaya-anti-slop.md)
