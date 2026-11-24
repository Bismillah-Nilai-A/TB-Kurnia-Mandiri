export interface BarangCatalogItem {
  id?: string;
  kode_barang: string;
  nama: string;
  merk?: string;
  kategori: string;
  barcode: string | null;
  barcode_fisik?: boolean;
  satuan_dasar?: string;
  satuan_pembelian?: string;
  isi_per_satuan_beli?: number;
  harga_beli: number;
  harga_modal?: number;
  harga: number;
  stok_awal?: number;
  stok: number;
  stok_min: number;
  stok_minimum?: number;
  satuan: string;
  keterangan?: string | null;
}

/**
 * Data Master Barang CV Kurnia Mandiri sesuai file Excel:
 * - Sheet "Daftar Harga Barang (Periode: November 2026)" (A001 - A088)
 * - Sheet "LAPORAN STOK BARANG (21-23 Jan 2026)" (B001 - B042)
 * Rumus default: Harga Jual = Harga Modal x (1 + 0.3)
 */
export const DATA_BARANG_KURNIA_MANDIRI: BarangCatalogItem[] = [
  // 1. Material Dasar
  { kode_barang: "A001", kategori: "Material Dasar", merk: "-", nama: "Hebel Ukuran 7", satuan: "Kubik", harga_beli: 480000, harga: 624000, stok_awal: 10, stok: 10, stok_min: 3, barcode: "899202600001", keterangan: "Data asli: 480.000 x 13 / kubik" },
  { kode_barang: "A002", kategori: "Material Dasar", merk: "-", nama: "Hebel Ukuran 10", satuan: "Kubik", harga_beli: 480000, harga: 624000, stok_awal: 10, stok: 10, stok_min: 3, barcode: "899202600002", keterangan: "Data asli: 480.000 x 10 / kubik" },
  { kode_barang: "A003", kategori: "Material Dasar", merk: "-", nama: "Pasir Hitam", satuan: "Truck", harga_beli: 2600000, harga: 3380000, stok_awal: 10, stok: 10, stok_min: 2, barcode: "899202600003", keterangan: "1 truck = 6,7 kubik" },
  { kode_barang: "A004", kategori: "Material Dasar", merk: "-", nama: "Pasir Bangka", satuan: "Truck", harga_beli: 3300000, harga: 4290000, stok_awal: 10, stok: 10, stok_min: 2, barcode: "899202600004", keterangan: "1 truck = 6,7 kubik" },
  { kode_barang: "A005", kategori: "Material Dasar", merk: "-", nama: "Pasir Rangkas", satuan: "Truck", harga_beli: 2000000, harga: 2600000, stok_awal: 10, stok: 10, stok_min: 2, barcode: "899202600005", keterangan: "1 truck = 6,7 kubik" },
  { kode_barang: "A006", kategori: "Material Dasar", merk: "-", nama: "Split", satuan: "Truck", harga_beli: 3200000, harga: 4160000, stok_awal: 10, stok: 10, stok_min: 2, barcode: "899202600006", keterangan: "1 truck = 6,7 kubik" },
  { kode_barang: "A007", kategori: "Material Dasar", merk: "-", nama: "Bata Merah", satuan: "Pcs", harga_beli: 600, harga: 780, stok_awal: 5000, stok: 5000, stok_min: 1000, barcode: "899202600007", keterangan: null },
  { kode_barang: "A008", kategori: "Material Dasar", merk: "-", nama: "Konblok Beton", satuan: "Meter", harga_beli: 60000, harga: 78000, stok_awal: 50, stok: 50, stok_min: 10, barcode: "899202600008", keterangan: null },

  // 2. Semen
  { kode_barang: "A009", kategori: "Semen", merk: "Rajawali", nama: "Semen Rajawali", satuan: "Sak", harga_beli: 49800, harga: 64740, stok_awal: 10, stok: 10, stok_min: 10, barcode: "899202600009", keterangan: null },
  { kode_barang: "A010", kategori: "Semen", merk: "Jempolan", nama: "Semen Jempolan", satuan: "Sak", harga_beli: 42000, harga: 54600, stok_awal: 10, stok: 10, stok_min: 10, barcode: "899202600010", keterangan: null },
  { kode_barang: "A011", kategori: "Semen", merk: "Tigaroda", nama: "Semen Tigaroda 40 kg", satuan: "Sak", harga_beli: 59600, harga: 77480, stok_awal: 100, stok: 95, stok_min: 20, barcode: "899202600011", keterangan: "Laporan Stok: Stok Awal 100, Masuk 10, Keluar 15, Stok Akhir 95" },
  { kode_barang: "A012", kategori: "Semen", merk: "Tigaroda", nama: "Semen Tigaroda 50 kg", satuan: "Sak", harga_beli: 72600, harga: 94380, stok_awal: 50, stok: 50, stok_min: 15, barcode: "899202600012", keterangan: null },

  // 3. Besi & Baja
  { kode_barang: "A013", kategori: "Besi & Baja", merk: "-", nama: "Ceker Ayam 50x50 (Besi 8)", satuan: "Pcs", harga_beli: 50000, harga: 65000, stok_awal: 30, stok: 30, stok_min: 5, barcode: "899202600013", keterangan: null },
  { kode_barang: "A014", kategori: "Besi & Baja", merk: "-", nama: "Ceker Ayam 50x50 (Besi 10)", satuan: "Pcs", harga_beli: 65000, harga: 84500, stok_awal: 30, stok: 30, stok_min: 5, barcode: "899202600014", keterangan: null },
  { kode_barang: "A015", kategori: "Besi & Baja", merk: "-", nama: "Ceker Ayam 40x40 (Besi 8)", satuan: "Pcs", harga_beli: 42000, harga: 54600, stok_awal: 30, stok: 30, stok_min: 5, barcode: "899202600015", keterangan: null },
  { kode_barang: "A016", kategori: "Besi & Baja", merk: "-", nama: "Ceker Ayam 40x40 (Besi 10)", satuan: "Pcs", harga_beli: 50000, harga: 65000, stok_awal: 30, stok: 30, stok_min: 5, barcode: "899202600016", keterangan: null },
  { kode_barang: "A017", kategori: "Besi & Baja", merk: "-", nama: "Besi Jadi (Besi 8)", satuan: "Pcs", harga_beli: 39000, harga: 50700, stok_awal: 40, stok: 40, stok_min: 10, barcode: "899202600017", keterangan: null },
  { kode_barang: "A018", kategori: "Besi & Baja", merk: "-", nama: "Besi Jadi (Besi 10)", satuan: "Pcs", harga_beli: 48000, harga: 62400, stok_awal: 40, stok: 40, stok_min: 10, barcode: "899202600018", keterangan: null },
  { kode_barang: "A019", kategori: "Besi & Baja", merk: "-", nama: "Wermes 2,5 x 5,2 (Besi 8)", satuan: "Lembar", harga_beli: 475000, harga: 617500, stok_awal: 15, stok: 15, stok_min: 3, barcode: "899202600019", keterangan: null },
  { kode_barang: "A020", kategori: "Besi & Baja", merk: "-", nama: "Wermes 2,5 x 5,2 (Besi 10)", satuan: "Lembar", harga_beli: 625000, harga: 812500, stok_awal: 15, stok: 15, stok_min: 3, barcode: "899202600020", keterangan: null },
  { kode_barang: "A021", kategori: "Besi & Baja", merk: "-", nama: "Besi 6", satuan: "Batang", harga_beli: 26000, harga: 33800, stok_awal: 100, stok: 100, stok_min: 20, barcode: "899202600021", keterangan: null },
  { kode_barang: "A022", kategori: "Besi & Baja", merk: "-", nama: "Besi 8", satuan: "Batang", harga_beli: 37000, harga: 48100, stok_awal: 120, stok: 120, stok_min: 20, barcode: "899202600022", keterangan: null },
  { kode_barang: "A023", kategori: "Besi & Baja", merk: "-", nama: "Besi 10", satuan: "Batang", harga_beli: 58000, harga: 75400, stok_awal: 100, stok: 100, stok_min: 20, barcode: "899202600023", keterangan: null },
  { kode_barang: "A024", kategori: "Besi & Baja", merk: "-", nama: "Besi 12", satuan: "Batang", harga_beli: 76000, harga: 98800, stok_awal: 80, stok: 80, stok_min: 15, barcode: "899202600024", keterangan: null },
  { kode_barang: "A025", kategori: "Besi & Baja", merk: "-", nama: "Bondek", satuan: "Meter", harga_beli: 95000, harga: 123500, stok_awal: 60, stok: 60, stok_min: 10, barcode: "899202600025", keterangan: null },

  // 4. Atap & Rangka Atap
  { kode_barang: "A026", kategori: "Atap & Rangka Atap", merk: "-", nama: "Genteng Metal", satuan: "Pcs", harga_beli: 33000, harga: 42900, stok_awal: 100, stok: 100, stok_min: 20, barcode: "899202600026", keterangan: null },
  { kode_barang: "A027", kategori: "Atap & Rangka Atap", merk: "Alderon", nama: "Genteng Alderon Transparan", satuan: "Meter", harga_beli: 85000, harga: 110500, stok_awal: 40, stok: 40, stok_min: 10, barcode: "899202600027", keterangan: null },
  { kode_barang: "A028", kategori: "Atap & Rangka Atap", merk: "Alderon", nama: "Genteng Alderon Single", satuan: "Meter", harga_beli: 75000, harga: 97500, stok_awal: 50, stok: 50, stok_min: 10, barcode: "899202600028", keterangan: null },
  { kode_barang: "A029", kategori: "Atap & Rangka Atap", merk: "Alderon", nama: "Genteng Alderon Double", satuan: "Meter", harga_beli: 90000, harga: 117000, stok_awal: 40, stok: 40, stok_min: 10, barcode: "899202600029", keterangan: null },
  { kode_barang: "A030", kategori: "Atap & Rangka Atap", merk: "-", nama: "Spandek Pasir", satuan: "Meter", harga_beli: 48000, harga: 62400, stok_awal: 80, stok: 80, stok_min: 15, barcode: "899202600030", keterangan: null },
  { kode_barang: "A031", kategori: "Atap & Rangka Atap", merk: "-", nama: "Spandek Polos", satuan: "Meter", harga_beli: 46000, harga: 59800, stok_awal: 80, stok: 80, stok_min: 15, barcode: "899202600031", keterangan: null },
  { kode_barang: "A032", kategori: "Atap & Rangka Atap", merk: "-", nama: "Reng Baja 0,35", satuan: "Batang", harga_beli: 33000, harga: 42900, stok_awal: 100, stok: 100, stok_min: 20, barcode: "899202600032", keterangan: null },
  { kode_barang: "A033", kategori: "Atap & Rangka Atap", merk: "-", nama: "Baja Ringan 0,70", satuan: "Batang", harga_beli: 64000, harga: 83200, stok_awal: 100, stok: 100, stok_min: 20, barcode: "899202600033", keterangan: null },
  { kode_barang: "A034", kategori: "Atap & Rangka Atap", merk: "-", nama: "Baja Ringan 0,75", satuan: "Batang", harga_beli: 82000, harga: 106600, stok_awal: 100, stok: 100, stok_min: 20, barcode: "899202600034", keterangan: null },
  { kode_barang: "A035", kategori: "Atap & Rangka Atap", merk: "Jabesmen", nama: "Asbes 1 1/2 Jabesmen", satuan: "Lembar", harga_beli: 45000, harga: 58500, stok_awal: 50, stok: 50, stok_min: 10, barcode: "899202600035", keterangan: null },
  { kode_barang: "A036", kategori: "Atap & Rangka Atap", merk: "-", nama: "Asbes 1,8 m", satuan: "Lembar", harga_beli: 54000, harga: 70200, stok_awal: 50, stok: 50, stok_min: 10, barcode: "899202600036", keterangan: null },
  { kode_barang: "A037", kategori: "Atap & Rangka Atap", merk: "-", nama: "Asbes 2,1 m", satuan: "Lembar", harga_beli: 62000, harga: 80600, stok_awal: 50, stok: 50, stok_min: 10, barcode: "899202600037", keterangan: null },
  { kode_barang: "A038", kategori: "Atap & Rangka Atap", merk: "-", nama: "Asbes 2,4 m", satuan: "Lembar", harga_beli: 70000, harga: 91000, stok_awal: 50, stok: 50, stok_min: 10, barcode: "899202600038", keterangan: null },
  { kode_barang: "A039", kategori: "Atap & Rangka Atap", merk: "-", nama: "Asbes 2,7 m", satuan: "Lembar", harga_beli: 80000, harga: 104000, stok_awal: 40, stok: 40, stok_min: 10, barcode: "899202600039", keterangan: null },
  { kode_barang: "A040", kategori: "Atap & Rangka Atap", merk: "-", nama: "Asbes 3 m", satuan: "Lembar", harga_beli: 95000, harga: 123500, stok_awal: 40, stok: 40, stok_min: 10, barcode: "899202600040", keterangan: null },

  // 5. Plafon & Lisplang
  { kode_barang: "A041", kategori: "Plafon & Lisplang", merk: "-", nama: "Besi Holo Plafon 4x4", satuan: "Batang", harga_beli: 25000, harga: 32500, stok_awal: 80, stok: 80, stok_min: 15, barcode: "899202600041", keterangan: null },
  { kode_barang: "A042", kategori: "Plafon & Lisplang", merk: "-", nama: "Besi Holo Plafon 2x4", satuan: "Batang", harga_beli: 20000, harga: 26000, stok_awal: 80, stok: 80, stok_min: 15, barcode: "899202600042", keterangan: null },
  { kode_barang: "A043", kategori: "Plafon & Lisplang", merk: "-", nama: "Gipsum", satuan: "Lembar", harga_beli: 52000, harga: 67600, stok_awal: 50, stok: 50, stok_min: 10, barcode: "899202600043", keterangan: null },
  { kode_barang: "A044", kategori: "Plafon & Lisplang", merk: "-", nama: "GRC 63", satuan: "Lembar", harga_beli: 63000, harga: 81900, stok_awal: 40, stok: 40, stok_min: 10, barcode: "899202600044", keterangan: null },
  { kode_barang: "A045", kategori: "Plafon & Lisplang", merk: "-", nama: "Lisplang GRC 10", satuan: "Pcs", harga_beli: 27000, harga: 35100, stok_awal: 40, stok: 40, stok_min: 10, barcode: "899202600045", keterangan: null },
  { kode_barang: "A046", kategori: "Plafon & Lisplang", merk: "-", nama: "Lisplang GRC 20", satuan: "Pcs", harga_beli: 41000, harga: 53300, stok_awal: 40, stok: 40, stok_min: 10, barcode: "899202600046", keterangan: null },
  { kode_barang: "A047", kategori: "Plafon & Lisplang", merk: "-", nama: "Lisplang GRC 30", satuan: "Pcs", harga_beli: 60000, harga: 78000, stok_awal: 30, stok: 30, stok_min: 8, barcode: "899202600047", keterangan: null },

  // 6. Kayu & Bekisting
  { kode_barang: "A048", kategori: "Kayu & Bekisting", merk: "-", nama: "Bambu", satuan: "Batang", harga_beli: 9000, harga: 11700, stok_awal: 100, stok: 100, stok_min: 20, barcode: "899202600048", keterangan: null },
  { kode_barang: "A049", kategori: "Kayu & Bekisting", merk: "-", nama: "Papan Cor 18 x 2,5 cm", satuan: "Pcs", harga_beli: 10000, harga: 13000, stok_awal: 100, stok: 100, stok_min: 20, barcode: "899202600049", keterangan: null },
  { kode_barang: "A050", kategori: "Kayu & Bekisting", merk: "-", nama: "Papan Cor 2 x 20 cm", satuan: "Pcs", harga_beli: 25000, harga: 32500, stok_awal: 80, stok: 80, stok_min: 15, barcode: "899202600050", keterangan: null },
  { kode_barang: "A051", kategori: "Kayu & Bekisting", merk: "-", nama: "Kaso 4x6", satuan: "Batang", harga_beli: 25000, harga: 32500, stok_awal: 80, stok: 80, stok_min: 15, barcode: "899202600051", keterangan: null },
  { kode_barang: "A052", kategori: "Kayu & Bekisting", merk: "-", nama: "Kaso 5x7", satuan: "Batang", harga_beli: 35000, harga: 45500, stok_awal: 60, stok: 60, stok_min: 15, barcode: "899202600052", keterangan: null },
  { kode_barang: "A053", kategori: "Kayu & Bekisting", merk: "-", nama: "Triplek 4 mm", satuan: "Lembar", harga_beli: 59000, harga: 76700, stok_awal: 40, stok: 40, stok_min: 10, barcode: "899202600053", keterangan: null },
  { kode_barang: "A054", kategori: "Kayu & Bekisting", merk: "-", nama: "Triplek 6 mm", satuan: "Lembar", harga_beli: 69000, harga: 89700, stok_awal: 40, stok: 40, stok_min: 10, barcode: "899202600054", keterangan: null },
  { kode_barang: "A055", kategori: "Kayu & Bekisting", merk: "-", nama: "Triplek 8 mm", satuan: "Lembar", harga_beli: 76000, harga: 98800, stok_awal: 30, stok: 30, stok_min: 8, barcode: "899202600055", keterangan: null },
  { kode_barang: "A056", kategori: "Kayu & Bekisting", merk: "-", nama: "Triplek 9 mm", satuan: "Lembar", harga_beli: 89000, harga: 115700, stok_awal: 30, stok: 30, stok_min: 8, barcode: "899202600056", keterangan: null },
  { kode_barang: "A057", kategori: "Kayu & Bekisting", merk: "-", nama: "Triplek 12 mm", satuan: "Lembar", harga_beli: 125000, harga: 162500, stok_awal: 25, stok: 25, stok_min: 5, barcode: "899202600057", keterangan: null },
  { kode_barang: "A058", kategori: "Kayu & Bekisting", merk: "-", nama: "Triplek 15 mm", satuan: "Lembar", harga_beli: 155000, harga: 201500, stok_awal: 20, stok: 20, stok_min: 5, barcode: "899202600058", keterangan: null },

  // 7. Pipa PVC
  { kode_barang: "A059", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon AW 1/2 Inch", satuan: "Batang", harga_beli: 23000, harga: 29900, stok_awal: 0, stok: 25, stok_min: 10, barcode: "899202600059", keterangan: "Laporan Stok: Masuk 25 BTG" },
  { kode_barang: "A060", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon AW 3/4 Inch", satuan: "Batang", harga_beli: 28000, harga: 36400, stok_awal: 20, stok: 20, stok_min: 10, barcode: "899202600060", keterangan: null },
  { kode_barang: "A061", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon AW 1 Inch", satuan: "Batang", harga_beli: 39000, harga: 50700, stok_awal: 0, stok: 20, stok_min: 10, barcode: "899202600061", keterangan: "Laporan Stok: Masuk 20 BTG" },
  { kode_barang: "A062", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon AW 1 1/4 Inch", satuan: "Batang", harga_beli: 60000, harga: 78000, stok_awal: 15, stok: 15, stok_min: 5, barcode: "899202600062", keterangan: "Data asli tertulis 1/4 (dikoreksi)" },
  { kode_barang: "A063", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon AW 1 1/2 Inch", satuan: "Batang", harga_beli: 70000, harga: 91000, stok_awal: 15, stok: 15, stok_min: 5, barcode: "899202600063", keterangan: null },
  { kode_barang: "A064", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon AW 2 Inch", satuan: "Batang", harga_beli: 89000, harga: 115700, stok_awal: 15, stok: 15, stok_min: 5, barcode: "899202600064", keterangan: null },
  { kode_barang: "A065", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon AW 2 1/2 Inch", satuan: "Batang", harga_beli: 130000, harga: 169000, stok_awal: 10, stok: 10, stok_min: 5, barcode: "899202600065", keterangan: null },
  { kode_barang: "A066", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon AW 3 Inch", satuan: "Batang", harga_beli: 183000, harga: 237900, stok_awal: 0, stok: 5, stok_min: 5, barcode: "899202600066", keterangan: "Laporan Stok: Masuk 5 BTG" },
  { kode_barang: "A067", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon AW 4 Inch", satuan: "Batang", harga_beli: 320000, harga: 416000, stok_awal: 0, stok: 5, stok_min: 5, barcode: "899202600067", keterangan: "Laporan Stok: Masuk 5 BTG" },
  { kode_barang: "A068", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon D 1 1/4 Inch", satuan: "Batang", harga_beli: 38000, harga: 49400, stok_awal: 15, stok: 15, stok_min: 5, barcode: "899202600068", keterangan: null },
  { kode_barang: "A069", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon D 1 1/2 Inch", satuan: "Batang", harga_beli: 43000, harga: 55900, stok_awal: 15, stok: 15, stok_min: 5, barcode: "899202600069", keterangan: null },
  { kode_barang: "A070", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon D 2 Inch", satuan: "Batang", harga_beli: 57000, harga: 74100, stok_awal: 0, stok: 10, stok_min: 5, barcode: "899202600070", keterangan: "Laporan Stok: Masuk 10 BTG" },
  { kode_barang: "A071", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon D 2 1/2 Inch", satuan: "Batang", harga_beli: 75000, harga: 97500, stok_awal: 0, stok: 10, stok_min: 5, barcode: "899202600071", keterangan: "Laporan Stok: Masuk 10 BTG" },
  { kode_barang: "A072", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon D 3 Inch", satuan: "Batang", harga_beli: 99000, harga: 128700, stok_awal: 0, stok: 15, stok_min: 5, barcode: "899202600072", keterangan: "Laporan Stok: Masuk 15 BTG" },
  { kode_barang: "A073", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon D 4 Inch", satuan: "Batang", harga_beli: 156000, harga: 202800, stok_awal: 0, stok: 5, stok_min: 5, barcode: "899202600073", keterangan: "Laporan Stok: Masuk 5 BTG" },

  // 8. Sanitair & Tandon
  { kode_barang: "A074", kategori: "Sanitair & Tandon", merk: "-", nama: "Closet Jongkok", satuan: "Pcs", harga_beli: 115000, harga: 149500, stok_awal: 0, stok: 5, stok_min: 3, barcode: "899202600074", keterangan: "Laporan Stok: Masuk 5 pcs" },
  { kode_barang: "A075", kategori: "Sanitair & Tandon", merk: "-", nama: "Pintu Kamar Mandi Standar PVC", satuan: "Pcs", harga_beli: 215000, harga: 279500, stok_awal: 8, stok: 8, stok_min: 2, barcode: "899202600075", keterangan: null },
  { kode_barang: "A076", kategori: "Sanitair & Tandon", merk: "-", nama: "Toren 300", satuan: "Pcs", harga_beli: 775000, harga: 1007500, stok_awal: 4, stok: 4, stok_min: 2, barcode: "899202600076", keterangan: null },
  { kode_barang: "A077", kategori: "Sanitair & Tandon", merk: "-", nama: "Toren 500", satuan: "Pcs", harga_beli: 1230000, harga: 1599000, stok_awal: 4, stok: 4, stok_min: 2, barcode: "899202600077", keterangan: null },
  { kode_barang: "A078", kategori: "Sanitair & Tandon", merk: "-", nama: "Toren 650", satuan: "Pcs", harga_beli: 1400000, harga: 1820000, stok_awal: 3, stok: 3, stok_min: 1, barcode: "899202600078", keterangan: null },
  { kode_barang: "A079", kategori: "Sanitair & Tandon", merk: "-", nama: "Toren 1050", satuan: "Pcs", harga_beli: 2570000, harga: 3341000, stok_awal: 2, stok: 2, stok_min: 1, barcode: "899202600079", keterangan: null },

  // 9. Paku & Perlengkapan
  { kode_barang: "A080", kategori: "Paku & Perlengkapan", merk: "-", nama: "Paku Biasa", satuan: "Kg", harga_beli: 15000, harga: 19500, stok_awal: 0, stok: 60, stok_min: 15, barcode: "899202600080", keterangan: "Ukuran 3, 4, 5, 7, 10, 12" },
  { kode_barang: "A081", kategori: "Paku & Perlengkapan", merk: "-", nama: "Paku Beton", satuan: "Pack", harga_beli: 35000, harga: 45500, stok_awal: 25, stok: 25, stok_min: 5, barcode: "899202600081", keterangan: "Ukuran 3, 4, 5, 7, 10, 12" },

  // 10. Cat
  { kode_barang: "A082", kategori: "Cat", merk: "Avian", nama: "Cat Avian 5 kg", satuan: "Pail", harga_beli: 163000, harga: 211900, stok_awal: 15, stok: 15, stok_min: 5, barcode: "899202600082", keterangan: null },
  { kode_barang: "A083", kategori: "Cat", merk: "Avian", nama: "Cat Avian 20 kg", satuan: "Pail", harga_beli: 790000, harga: 1027000, stok_awal: 8, stok: 8, stok_min: 3, barcode: "899202600083", keterangan: null },
  { kode_barang: "A084", kategori: "Cat", merk: "Vinilex", nama: "Cat Vinilex 5 kg", satuan: "Pail", harga_beli: 163000, harga: 211900, stok_awal: 15, stok: 15, stok_min: 5, barcode: "899202600084", keterangan: null },
  { kode_barang: "A085", kategori: "Cat", merk: "Vinilex", nama: "Cat Vinilex 20 kg", satuan: "Pail", harga_beli: 790000, harga: 1027000, stok_awal: 8, stok: 8, stok_min: 3, barcode: "899202600085", keterangan: null },
  { kode_barang: "A086", kategori: "Cat", merk: "Aquaprof", nama: "Cat Aquaprof 1 kg", satuan: "Pail", harga_beli: 61000, harga: 79300, stok_awal: 20, stok: 20, stok_min: 5, barcode: "899202600086", keterangan: null },
  { kode_barang: "A087", kategori: "Cat", merk: "Aquaprof", nama: "Cat Aquaprof 4 kg", satuan: "Pail", harga_beli: 235000, harga: 305500, stok_awal: 12, stok: 12, stok_min: 4, barcode: "899202600087", keterangan: null },
  { kode_barang: "A088", kategori: "Cat", merk: "Aquaprof", nama: "Cat Aquaprof 20 kg", satuan: "Pail", harga_beli: 980000, harga: 1274000, stok_awal: 6, stok: 6, stok_min: 2, barcode: "899202600088", keterangan: null },

  // 11. Item Tambahan dari Sheet Laporan Stok Barang (B001 - B042)
  { kode_barang: "B001", kategori: "Semen", merk: "Gresik", nama: "Semen Gresik", satuan: "Sak", harga_beli: 53000, harga: 68900, stok_awal: 10, stok: 10, stok_min: 10, barcode: "899202600089", keterangan: "Laporan Stok 23/01/2026" },
  { kode_barang: "B002", kategori: "Semen", merk: "-", nama: "Semen Putih", satuan: "Sak", harga_beli: 110000, harga: 143000, stok_awal: 0, stok: 1, stok_min: 3, barcode: "899202600090", keterangan: "Laporan Stok 22/01/2026: Masuk 1 Zak" },
  { kode_barang: "B003", kategori: "Pipa PVC", merk: "Bestlon", nama: "Paralon Bstln STD P D 2\"", satuan: "Batang", harga_beli: 41838, harga: 54390, stok_awal: 0, stok: 10, stok_min: 5, barcode: "899202600091", keterangan: "Laporan Stok 23/01/2026: Masuk 10 BTG" },
  { kode_barang: "B004", kategori: "Pipa PVC", merk: "Bestlon", nama: "Paralon Bstln STD P D 2 1/2\"", satuan: "Batang", harga_beli: 55135, harga: 71675, stok_awal: 0, stok: 10, stok_min: 5, barcode: "899202600092", keterangan: "Laporan Stok 23/01/2026: Masuk 10 BTG" },
  { kode_barang: "B005", kategori: "Pipa PVC", merk: "Bestlon", nama: "Paralon Bstln STD P D 3\"", satuan: "Batang", harga_beli: 76099, harga: 98930, stok_awal: 0, stok: 8, stok_min: 5, barcode: "899202600093", keterangan: "Laporan Stok 23/01/2026: Masuk 8 BTG" },
  { kode_barang: "B006", kategori: "Pipa PVC", merk: "Bestlon", nama: "Paralon Bstln STD P D 4\"", satuan: "Batang", harga_beli: 119730, harga: 155650, stok_awal: 0, stok: 15, stok_min: 5, barcode: "899202600094", keterangan: "Laporan Stok 23/01/2026: Masuk 15 BTG" },
  { kode_barang: "B007", kategori: "Pipa PVC", merk: "Trilliun", nama: "Knie Trilliun Bc D Abu 3\"/30", satuan: "Pcs", harga_beli: 7117, harga: 9250, stok_awal: 0, stok: 30, stok_min: 10, barcode: "899202600095", keterangan: "Laporan Stok 22/01/2026: Masuk 30 pcs" },
  { kode_barang: "B008", kategori: "Sanitair & Tandon", merk: "ONDA", nama: "Kran ONDA BC Atap 1/2\"/12", satuan: "Pcs", harga_beli: 32883, harga: 42750, stok_awal: 0, stok: 12, stok_min: 5, barcode: "899202600096", keterangan: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode_barang: "B009", kategori: "Pipa PVC", merk: "ONDA", nama: "Seal Tape ONDA 10m 12mm/72", satuan: "Pcs", harga_beli: 4459, harga: 5800, stok_awal: 0, stok: 72, stok_min: 20, barcode: "899202600097", keterangan: "Laporan Stok 22/01/2026: Masuk 72 pcs" },
  { kode_barang: "B010", kategori: "Pipa PVC", merk: "FOX", nama: "Lem FOX Isarplas Lem VPC 40gr", satuan: "Pcs", harga_beli: 6081, harga: 7900, stok_awal: 0, stok: 60, stok_min: 15, barcode: "899202600098", keterangan: "Laporan Stok 22/01/2026: Masuk 60 pcs" },
  { kode_barang: "B011", kategori: "Paku & Perlengkapan", merk: "-", nama: "Kape PVC 5\"", satuan: "Pcs", harga_beli: 1500, harga: 1950, stok_awal: 0, stok: 12, stok_min: 5, barcode: "899202600099", keterangan: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode_barang: "B012", kategori: "Paku & Perlengkapan", merk: "-", nama: "Kape PVC 7\"", satuan: "Pcs", harga_beli: 2500, harga: 3250, stok_awal: 0, stok: 12, stok_min: 5, barcode: "899202600100", keterangan: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode_barang: "B013", kategori: "Paku & Perlengkapan", merk: "-", nama: "Lakban Kertas 1\"", satuan: "Pcs", harga_beli: 3250, harga: 4225, stok_awal: 0, stok: 12, stok_min: 5, barcode: "899202600101", keterangan: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode_barang: "B014", kategori: "Paku & Perlengkapan", merk: "Shisuka", nama: "Meteran 5m Shisuka", satuan: "Pcs", harga_beli: 10000, harga: 13000, stok_awal: 0, stok: 12, stok_min: 5, barcode: "899202600102", keterangan: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode_barang: "B015", kategori: "Cat", merk: "Daesung", nama: "Bulu Roll Copot Daesung", satuan: "Pcs", harga_beli: 10417, harga: 13550, stok_awal: 0, stok: 24, stok_min: 6, barcode: "899202600103", keterangan: "Laporan Stok 22/01/2026: Masuk 24 pcs" },
  { kode_barang: "B016", kategori: "Paku & Perlengkapan", merk: "Kodai", nama: "Palu Karet Kodai", satuan: "Pcs", harga_beli: 26000, harga: 33800, stok_awal: 0, stok: 6, stok_min: 3, barcode: "899202600104", keterangan: "Laporan Stok 22/01/2026: Masuk 6 pcs" },
  { kode_barang: "B017", kategori: "Cat", merk: "Kapal Merah", nama: "Kuas Roll Kapal Merah", satuan: "Pcs", harga_beli: 9584, harga: 12460, stok_awal: 0, stok: 12, stok_min: 5, barcode: "899202600105", keterangan: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode_barang: "B018", kategori: "Cat", merk: "Stamvick", nama: "Kuas Roll Kapal Stamvick", satuan: "Pcs", harga_beli: 22084, harga: 28710, stok_awal: 0, stok: 12, stok_min: 5, barcode: "899202600106", keterangan: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode_barang: "B019", kategori: "Paku & Perlengkapan", merk: "-", nama: "Lem G", satuan: "Pcs", harga_beli: 4600, harga: 5980, stok_awal: 0, stok: 50, stok_min: 10, barcode: "899202600107", keterangan: "Laporan Stok 22/01/2026: Masuk 50 pcs" },
  { kode_barang: "B020", kategori: "Cat", merk: "Eterna", nama: "Bulu Roll Copot Eterna", satuan: "Pcs", harga_beli: 14167, harga: 18420, stok_awal: 0, stok: 12, stok_min: 5, barcode: "899202600108", keterangan: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode_barang: "B021", kategori: "Cat", merk: "Daesung", nama: "Kuas Roll Copot Daesung", satuan: "Pcs", harga_beli: 15417, harga: 20050, stok_awal: 0, stok: 12, stok_min: 5, barcode: "899202600109", keterangan: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode_barang: "B022", kategori: "Cat", merk: "Eterna", nama: "Kuas Roll Copot Eterna", satuan: "Pcs", harga_beli: 20000, harga: 26000, stok_awal: 0, stok: 24, stok_min: 6, barcode: "899202600110", keterangan: "Laporan Stok 22/01/2026: Masuk 24 pcs" },
  { kode_barang: "B023", kategori: "Paku & Perlengkapan", merk: "-", nama: "Selang Timbang", satuan: "Meter", harga_beli: 2000, harga: 2600, stok_awal: 0, stok: 100, stok_min: 20, barcode: "899202600111", keterangan: "Laporan Stok 22/01/2026: Masuk 100 m" },
  { kode_barang: "B024", kategori: "Cat", merk: "633", nama: "Kuas 633 2\"", satuan: "Pcs", harga_beli: 2750, harga: 3575, stok_awal: 0, stok: 24, stok_min: 6, barcode: "899202600112", keterangan: "Laporan Stok 22/01/2026: Masuk 24 pcs" },
  { kode_barang: "B025", kategori: "Cat", merk: "633", nama: "Kuas 633 2,5\"", satuan: "Pcs", harga_beli: 3438, harga: 4470, stok_awal: 0, stok: 24, stok_min: 6, barcode: "899202600113", keterangan: "Laporan Stok 22/01/2026: Masuk 24 pcs" },
  { kode_barang: "B026", kategori: "Cat", merk: "633", nama: "Kuas 633 3\"", satuan: "Pcs", harga_beli: 4125, harga: 5365, stok_awal: 0, stok: 24, stok_min: 6, barcode: "899202600114", keterangan: "Laporan Stok 22/01/2026: Masuk 24 pcs" },
  { kode_barang: "B027", kategori: "Cat", merk: "633", nama: "Kuas 633 4\"", satuan: "Pcs", harga_beli: 5417, harga: 7045, stok_awal: 0, stok: 12, stok_min: 5, barcode: "899202600115", keterangan: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode_barang: "B028", kategori: "Cat", merk: "Eterna", nama: "Kuas Eterna 1,5\"", satuan: "Pcs", harga_beli: 5313, harga: 6910, stok_awal: 0, stok: 12, stok_min: 5, barcode: "899202600116", keterangan: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode_barang: "B029", kategori: "Cat", merk: "Eterna", nama: "Kuas Eterna 2\"", satuan: "Pcs", harga_beli: 7084, harga: 9210, stok_awal: 0, stok: 12, stok_min: 5, barcode: "899202600117", keterangan: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode_barang: "B030", kategori: "Cat", merk: "Eterna", nama: "Kuas Eterna 2,5\"", satuan: "Pcs", harga_beli: 8855, harga: 11510, stok_awal: 0, stok: 12, stok_min: 5, barcode: "899202600118", keterangan: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode_barang: "B031", kategori: "Cat", merk: "Eterna", nama: "Kuas Eterna 4\"", satuan: "Pcs", harga_beli: 18084, harga: 23510, stok_awal: 0, stok: 12, stok_min: 5, barcode: "899202600119", keterangan: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode_barang: "B032", kategori: "Besi & Baja", merk: "-", nama: "Kawat Loket Hijau K", satuan: "Meter", harga_beli: 10000, harga: 13000, stok_awal: 0, stok: 20, stok_min: 5, barcode: "899202600120", keterangan: "Laporan Stok 22/01/2026: Masuk 20 m" },
  { kode_barang: "B033", kategori: "Besi & Baja", merk: "-", nama: "Kawat Loket Hijau B", satuan: "Meter", harga_beli: 7500, harga: 9750, stok_awal: 0, stok: 20, stok_min: 5, barcode: "899202600121", keterangan: "Laporan Stok 22/01/2026: Masuk 20 m" },
  { kode_barang: "B034", kategori: "Kayu & Bekisting", merk: "-", nama: "Plastik Cor", satuan: "Kg", harga_beli: 12500, harga: 16250, stok_awal: 0, stok: 13, stok_min: 5, barcode: "899202600122", keterangan: "Laporan Stok 22/01/2026: Masuk 13 Kg" },
  { kode_barang: "B035", kategori: "Atap & Rangka Atap", merk: "-", nama: "Karpet 90cm", satuan: "Meter", harga_beli: 8500, harga: 11050, stok_awal: 0, stok: 50, stok_min: 10, barcode: "899202600123", keterangan: "Laporan Stok 22/01/2026: Masuk 50 m" },
  { kode_barang: "B036", kategori: "Besi & Baja", merk: "-", nama: "Kawat Benrat", satuan: "Kg", harga_beli: 13500, harga: 17550, stok_awal: 0, stok: 50, stok_min: 10, barcode: "899202600124", keterangan: "Laporan Stok 22/01/2026: Masuk 50 Kg" },
  { kode_barang: "B037", kategori: "Paku & Perlengkapan", merk: "-", nama: "Pengki Orange", satuan: "Pcs", harga_beli: 12500, harga: 16250, stok_awal: 0, stok: 24, stok_min: 5, barcode: "899202600125", keterangan: "Laporan Stok 22/01/2026: Masuk 24 pcs" },
  { kode_barang: "B038", kategori: "Cat", merk: "-", nama: "Bak Cat 89", satuan: "Pcs", harga_beli: 6250, harga: 8125, stok_awal: 0, stok: 24, stok_min: 5, barcode: "899202600126", keterangan: "Laporan Stok 22/01/2026: Masuk 24 pcs" },
  { kode_barang: "B039", kategori: "Paku & Perlengkapan", merk: "-", nama: "Skrup Gypsum 6x1\"", satuan: "Box", harga_beli: 35000, harga: 45500, stok_awal: 0, stok: 10, stok_min: 3, barcode: "899202600127", keterangan: "Laporan Stok 22/01/2026: Masuk 10 Box" },
  { kode_barang: "B040", kategori: "Paku & Perlengkapan", merk: "-", nama: "Roofing 5cm 350pcs/box", satuan: "Box", harga_beli: 150500, harga: 195650, stok_awal: 0, stok: 5, stok_min: 2, barcode: "899202600128", keterangan: "Laporan Stok 22/01/2026: Masuk 5 box" },
  { kode_barang: "B041", kategori: "Paku & Perlengkapan", merk: "-", nama: "Roofing 7cm 250pcs/box", satuan: "Box", harga_beli: 137500, harga: 178750, stok_awal: 0, stok: 5, stok_min: 2, barcode: "899202600129", keterangan: "Laporan Stok 22/01/2026: Masuk 5 box" },
  { kode_barang: "B042", kategori: "Material Dasar", merk: "-", nama: "Glas Blok", satuan: "Dus", harga_beli: 23000, harga: 29900, stok_awal: 0, stok: 54, stok_min: 10, barcode: "899202600130", keterangan: "Laporan Stok 22/01/2026: Masuk 54 Dus" },
];

