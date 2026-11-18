# 02 - Komponen UI Standar & Cara Pakai

Seluruh komponen antarmuka diekspor melalui [`components/ui/index.tsx`](../components/ui/index.tsx). Programmer **wajib** menggunakan komponen di bawah ini saat membuat atau mengubah halaman agar tampilan tetap seragam.

---

## 1. `PageHeader` (Breadcrumb & Judul Halaman)

Lokasi file: [`components/ui/page-header.tsx`](../components/ui/page-header.tsx)

Setiap halaman di dalam dashboard wajib diawali dengan `<PageHeader />` agar menampilkan *breadcrumb* berjenjang (contoh: `Penjualan > Transaksi Kasir`), judul halaman 32px, dan slot tombol aksi di sebelah kanan.

### Contoh Penggunaan

```tsx
import { PageHeader, Button } from "@/components/ui";
import { Plus } from "lucide-react";

<PageHeader
  crumbs={[{ label: "Penjualan" }, { label: "Transaksi Kasir" }]}
  title="Transaksi Kasir"
  actions={
    <Button onClick={handleAdd}>
      <Plus className="w-4 h-4" />
      <span>Tambah Baru</span>
    </Button>
  }
/>
```

> **Catatan Anti-Slop**: Jangan menambahkan paragraf deskripsi panjang di bawah judul halaman yang hanya mengulang kata pada judul.

---

## 2. `CustomSelect` (Pengganti `<select>` Bawaan Browser)

Lokasi file: [`components/ui/custom-select.tsx`](../components/ui/custom-select.tsx)

**DILARANG menggunakan elemen `<select>` HTML biasa**, karena menu *dropdown* bawaan sistem operasi berbentuk kotak tajam yang merusak konsistensi desain melengkung. Gunakan `<CustomSelect>` (atau `<Select>` dari `@/components/ui` yang otomatis merender `CustomSelect`).

Komponen ini menerima *props* yang sama persis dengan `<select>` biasa (`value`, `onChange`, `disabled`, `className`, `aria-label`, dan anak elemen `<option>`), sehingga tidak perlu mengubah *state* atau fungsi *handler*.

### Contoh Penggunaan

```tsx
import { CustomSelect, Label } from "@/components/ui";

<div>
  <Label>Jenis Pelanggan</Label>
  <CustomSelect
    value={pelangganForm.jenis}
    onChange={(e) =>
      setPelangganForm({ ...pelangganForm, jenis: e.target.value })
    }
    aria-label="Jenis pelanggan"
    className="w-full mt-1"
  >
    <option value="proyek">Proyek / Kontraktor</option>
    <option value="perorangan">Perorangan</option>
  </CustomSelect>
</div>
```

### Menyandingkan `SearchField` dan `CustomSelect`

Agar kolom pencarian dan *dropdown* tidak saling menimpa di layar sempit maupun lebar, gunakan CSS Grid:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-[1fr_200px] items-center gap-2.5">
  <SearchField
    placeholder="Cari nama barang, kode, atau scan barcode..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full"
  />
  <CustomSelect
    value={kategori}
    onChange={(e) => setKategori(e.target.value)}
    aria-label="Filter kategori"
    className="w-full"
  >
    <option value="Semua">Semua Kategori</option>
  </CustomSelect>
</div>
```

---

## 3. `ResponsiveTabs` (Bar Tab & Filter Responsif)

Lokasi file: [`components/ui/responsive-tabs.tsx`](../components/ui/responsive-tabs.tsx)

Saat membuat tab navigasi halaman atau filter status (misalnya: *Semua*, *Menunggu*, *Dalam Perjalanan*, *Selesai*, *Retur / Gagal*):
- Jangan membuat tombol-tombol yang terpisah kotaknya.
- Jangan membiarkan deretan tombol tab turun menjadi bertingkat seperti tangga pada layar ponsel (4-7 inci) atau tablet/iPad.

Gunakan `<ResponsiveTabs />` yang secara otomatis:
1. Menampilkan **bar tab menyatu (*segmented control*)** pada layar desktop (`>= 1024px`).
2. Berubah menjadi **dropdown `<CustomSelect />`** pada layar mobile, phablet, dan tablet/iPad (`< 1024px`).

### Contoh Penggunaan

```tsx
import { ResponsiveTabs } from "@/components/ui";
import { Package, ArrowUpCircle, ClipboardList } from "lucide-react";

<ResponsiveTabs
  value={activeTab}
  onChange={(v) => setActiveTab(v)}
  aria-label="Pilih tab manajemen barang"
  options={[
    { id: "katalog", label: `Katalog & Harga (${items.length})`, icon: Package },
    { id: "mutasi", label: `Barang Masuk & Keluar (${mutasiList.length})`, icon: ArrowUpCircle },
    { id: "restok", label: `Stok Menipis (${lowStockItems.length})`, icon: ClipboardList },
  ]}
/>
```

---

## 4. `StatusBadge` (Lencana Status: Warna + Ikon + Teks)

Lokasi file: [`components/ui/status-badge.tsx`](../components/ui/status-badge.tsx)

Setiap status di dalam tabel (status stok, pembayaran, pengiriman, kasbon, akun pengguna, dan notifikasi) wajib menggunakan `<StatusBadge />` yang otomatis memetakan nilai status ke kombinasi **warna latar + ikon + teks**:

- **Hijau (`success` - `CheckCircle2`)**: `aman`, `lunas`, `diterima`, `selesai`, `disetujui`, `aktif`, `terkirim`, `masuk`
- **Oranye (`warning` - `TriangleAlert` / `Clock`)**: `menipis`, `belum_lunas`, `menunggu`, `sebagian`
- **Biru (`info` - `Clock` / `Truck`)**: `belum_dikirim` (*Menunggu Dikirim*), `sedang_dikirim` (*Dalam Perjalanan*)
- **Merah (`danger` - `XCircle` / `TriangleAlert`)**: `habis`, `gagal`, `dibatalkan`, `ditolak`, `retur`, `kendala`, `nonaktif`, `keluar`

### Contoh Penggunaan

```tsx
import { StatusBadge } from "@/components/ui";

<StatusBadge status={row.status_bayar} />
<StatusBadge status={item.stok <= item.stok_min ? "menipis" : "aman"} />
```

---

## 5. `Card` & Kartu Ringkasan (`.km-card`)

Lokasi file: [`components/ui/card.tsx`](../components/ui/card.tsx)

Kartu mengikuti gaya `.card-one` Dashbyte: latar putih (`#FFFFFF` di mode terang, `#1E293B` di mode gelap), sudut `6px`, tanpa garis tepi tebal, menggunakan bayangan berlapis halus (`--km-shadow-card`).

Untuk kartu ringkasan angka di bagian atas halaman, gunakan kelas `km-card p-5` dan tampilkan hanya **Label + Angka Utama** tanpa kalimat tambahan yang bertele-tele:

```tsx
<div className="km-card p-5">
  <p className="text-xs font-semibold text-gray-500">Total Barang</p>
  <p className="mt-1 text-xl font-bold text-gray-900">{items.length} barang</p>
</div>
```

Untuk halaman dengan dua kolom kartu berdampingan (seperti Kasir POS di [`components/transaksi/TransaksiPage.tsx`](../components/transaksi/TransaksiPage.tsx)), gunakan `items-stretch` pada grid dan `h-full flex flex-col` pada kedua `<Card>` agar tinggi bagian atas dan bawah kedua kartu sejajar.
