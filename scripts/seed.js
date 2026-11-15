const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

// Muat .env dan .env.local
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

const rootDir = path.resolve(__dirname, "..");
loadEnvFile(path.join(rootDir, ".env"));
loadEnvFile(path.join(rootDir, ".env.local"));

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

// ============================================================================
// DATA BARANG DARI FILE EXCEL CV KURNIA MANDIRI
// Bagian 1: 88 Barang dari Sheet "Daftar Harga Barang (Periode: November 2026)"
//           (Margin keuntungan default = 30%, Harga Jual = Harga Modal * 1.3)
// Bagian 2: Barang dari Sheet "LAPORAN STOK BARANG (21-23 Jan 2026)"
// ============================================================================
const DATA_BARANG_EXCEL = [
  // ── 1. MATERIAL DASAR (A001 - A008) ──
  { kode: "A001", kategori: "Material Dasar", merk: "-", nama: "Hebel Ukuran 7", satuan: "Kubik", harga_beli: 480000, harga: 624000, stok_awal: 10, stok: 10, stok_min: 3, ket: "Data asli: 480.000 x 13 / kubik" },
  { kode: "A002", kategori: "Material Dasar", merk: "-", nama: "Hebel Ukuran 10", satuan: "Kubik", harga_beli: 480000, harga: 624000, stok_awal: 10, stok: 10, stok_min: 3, ket: "Data asli: 480.000 x 10 / kubik" },
  { kode: "A003", kategori: "Material Dasar", merk: "-", nama: "Pasir Hitam", satuan: "Truck", harga_beli: 2600000, harga: 3380000, stok_awal: 10, stok: 10, stok_min: 2, ket: "1 truck = 6,7 kubik" },
  { kode: "A004", kategori: "Material Dasar", merk: "-", nama: "Pasir Bangka", satuan: "Truck", harga_beli: 3300000, harga: 4290000, stok_awal: 10, stok: 10, stok_min: 2, ket: "1 truck = 6,7 kubik" },
  { kode: "A005", kategori: "Material Dasar", merk: "-", nama: "Pasir Rangkas", satuan: "Truck", harga_beli: 2000000, harga: 2600000, stok_awal: 10, stok: 10, stok_min: 2, ket: "1 truck = 6,7 kubik" },
  { kode: "A006", kategori: "Material Dasar", merk: "-", nama: "Split", satuan: "Truck", harga_beli: 3200000, harga: 4160000, stok_awal: 10, stok: 10, stok_min: 2, ket: "1 truck = 6,7 kubik" },
  { kode: "A007", kategori: "Material Dasar", merk: "-", nama: "Bata Merah", satuan: "Pcs", harga_beli: 600, harga: 780, stok_awal: 5000, stok: 5000, stok_min: 1000, ket: null },
  { kode: "A008", kategori: "Material Dasar", merk: "-", nama: "Konblok Beton", satuan: "Meter", harga_beli: 60000, harga: 78000, stok_awal: 50, stok: 50, stok_min: 10, ket: null },

  // ── 2. SEMEN (A009 - A012) ──
  { kode: "A009", kategori: "Semen", merk: "Rajawali", nama: "Semen Rajawali", satuan: "Sak", harga_beli: 49800, harga: 64740, stok_awal: 10, stok: 10, stok_min: 10, ket: null },
  { kode: "A010", kategori: "Semen", merk: "Jempolan", nama: "Semen Jempolan", satuan: "Sak", harga_beli: 42000, harga: 54600, stok_awal: 10, stok: 10, stok_min: 10, ket: null },
  { kode: "A011", kategori: "Semen", merk: "Tigaroda", nama: "Semen Tigaroda 40 kg", satuan: "Sak", harga_beli: 59600, harga: 77480, stok_awal: 100, stok: 95, stok_min: 20, ket: "Laporan Stok: Stok Awal 100, Masuk 10, Keluar 15, Stok Akhir 95" },
  { kode: "A012", kategori: "Semen", merk: "Tigaroda", nama: "Semen Tigaroda 50 kg", satuan: "Sak", harga_beli: 72600, harga: 94380, stok_awal: 50, stok: 50, stok_min: 15, ket: null },

  // ── 3. BESI & BAJA (A013 - A025) ──
  { kode: "A013", kategori: "Besi & Baja", merk: "-", nama: "Ceker Ayam 50x50 (Besi 8)", satuan: "Pcs", harga_beli: 50000, harga: 65000, stok_awal: 30, stok: 30, stok_min: 5, ket: null },
  { kode: "A014", kategori: "Besi & Baja", merk: "-", nama: "Ceker Ayam 50x50 (Besi 10)", satuan: "Pcs", harga_beli: 65000, harga: 84500, stok_awal: 30, stok: 30, stok_min: 5, ket: null },
  { kode: "A015", kategori: "Besi & Baja", merk: "-", nama: "Ceker Ayam 40x40 (Besi 8)", satuan: "Pcs", harga_beli: 42000, harga: 54600, stok_awal: 30, stok: 30, stok_min: 5, ket: null },
  { kode: "A016", kategori: "Besi & Baja", merk: "-", nama: "Ceker Ayam 40x40 (Besi 10)", satuan: "Pcs", harga_beli: 50000, harga: 65000, stok_awal: 30, stok: 30, stok_min: 5, ket: null },
  { kode: "A017", kategori: "Besi & Baja", merk: "-", nama: "Besi Jadi (Besi 8)", satuan: "Pcs", harga_beli: 39000, harga: 50700, stok_awal: 40, stok: 40, stok_min: 10, ket: null },
  { kode: "A018", kategori: "Besi & Baja", merk: "-", nama: "Besi Jadi (Besi 10)", satuan: "Pcs", harga_beli: 48000, harga: 62400, stok_awal: 40, stok: 40, stok_min: 10, ket: null },
  { kode: "A019", kategori: "Besi & Baja", merk: "-", nama: "Wermes 2,5 x 5,2 (Besi 8)", satuan: "Lembar", harga_beli: 475000, harga: 617500, stok_awal: 15, stok: 15, stok_min: 3, ket: null },
  { kode: "A020", kategori: "Besi & Baja", merk: "-", nama: "Wermes 2,5 x 5,2 (Besi 10)", satuan: "Lembar", harga_beli: 625000, harga: 812500, stok_awal: 15, stok: 15, stok_min: 3, ket: null },
  { kode: "A021", kategori: "Besi & Baja", merk: "-", nama: "Besi 6", satuan: "Batang", harga_beli: 26000, harga: 33800, stok_awal: 100, stok: 100, stok_min: 20, ket: null },
  { kode: "A022", kategori: "Besi & Baja", merk: "-", nama: "Besi 8", satuan: "Batang", harga_beli: 37000, harga: 48100, stok_awal: 120, stok: 120, stok_min: 20, ket: null },
  { kode: "A023", kategori: "Besi & Baja", merk: "-", nama: "Besi 10", satuan: "Batang", harga_beli: 58000, harga: 75400, stok_awal: 100, stok: 100, stok_min: 20, ket: null },
  { kode: "A024", kategori: "Besi & Baja", merk: "-", nama: "Besi 12", satuan: "Batang", harga_beli: 76000, harga: 98800, stok_awal: 80, stok: 80, stok_min: 15, ket: null },
  { kode: "A025", kategori: "Besi & Baja", merk: "-", nama: "Bondek", satuan: "Meter", harga_beli: 95000, harga: 123500, stok_awal: 60, stok: 60, stok_min: 10, ket: null },

  // ── 4. ATAP & RANGKA ATAP (A026 - A040) ──
  { kode: "A026", kategori: "Atap & Rangka Atap", merk: "-", nama: "Genteng Metal", satuan: "Pcs", harga_beli: 33000, harga: 42900, stok_awal: 100, stok: 100, stok_min: 20, ket: null },
  { kode: "A027", kategori: "Atap & Rangka Atap", merk: "Alderon", nama: "Genteng Alderon Transparan", satuan: "Meter", harga_beli: 85000, harga: 110500, stok_awal: 40, stok: 40, stok_min: 10, ket: null },
  { kode: "A028", kategori: "Atap & Rangka Atap", merk: "Alderon", nama: "Genteng Alderon Single", satuan: "Meter", harga_beli: 75000, harga: 97500, stok_awal: 50, stok: 50, stok_min: 10, ket: null },
  { kode: "A029", kategori: "Atap & Rangka Atap", merk: "Alderon", nama: "Genteng Alderon Double", satuan: "Meter", harga_beli: 90000, harga: 117000, stok_awal: 40, stok: 40, stok_min: 10, ket: null },
  { kode: "A030", kategori: "Atap & Rangka Atap", merk: "-", nama: "Spandek Pasir", satuan: "Meter", harga_beli: 48000, harga: 62400, stok_awal: 80, stok: 80, stok_min: 15, ket: null },
  { kode: "A031", kategori: "Atap & Rangka Atap", merk: "-", nama: "Spandek Polos", satuan: "Meter", harga_beli: 46000, harga: 59800, stok_awal: 80, stok: 80, stok_min: 15, ket: null },
  { kode: "A032", kategori: "Atap & Rangka Atap", merk: "-", nama: "Reng Baja 0,35", satuan: "Batang", harga_beli: 33000, harga: 42900, stok_awal: 100, stok: 100, stok_min: 20, ket: null },
  { kode: "A033", kategori: "Atap & Rangka Atap", merk: "-", nama: "Baja Ringan 0,70", satuan: "Batang", harga_beli: 64000, harga: 83200, stok_awal: 100, stok: 100, stok_min: 20, ket: null },
  { kode: "A034", kategori: "Atap & Rangka Atap", merk: "-", nama: "Baja Ringan 0,75", satuan: "Batang", harga_beli: 82000, harga: 106600, stok_awal: 100, stok: 100, stok_min: 20, ket: null },
  { kode: "A035", kategori: "Atap & Rangka Atap", merk: "Jabesmen", nama: "Asbes 1 1/2 Jabesmen", satuan: "Lembar", harga_beli: 45000, harga: 58500, stok_awal: 50, stok: 50, stok_min: 10, ket: null },
  { kode: "A036", kategori: "Atap & Rangka Atap", merk: "-", nama: "Asbes 1,8 m", satuan: "Lembar", harga_beli: 54000, harga: 70200, stok_awal: 50, stok: 50, stok_min: 10, ket: null },
  { kode: "A037", kategori: "Atap & Rangka Atap", merk: "-", nama: "Asbes 2,1 m", satuan: "Lembar", harga_beli: 62000, harga: 80600, stok_awal: 50, stok: 50, stok_min: 10, ket: null },
  { kode: "A038", kategori: "Atap & Rangka Atap", merk: "-", nama: "Asbes 2,4 m", satuan: "Lembar", harga_beli: 70000, harga: 91000, stok_awal: 50, stok: 50, stok_min: 10, ket: null },
  { kode: "A039", kategori: "Atap & Rangka Atap", merk: "-", nama: "Asbes 2,7 m", satuan: "Lembar", harga_beli: 80000, harga: 104000, stok_awal: 40, stok: 40, stok_min: 10, ket: null },
  { kode: "A040", kategori: "Atap & Rangka Atap", merk: "-", nama: "Asbes 3 m", satuan: "Lembar", harga_beli: 95000, harga: 123500, stok_awal: 40, stok: 40, stok_min: 10, ket: null },

  // ── 5. PLAFON & LISPLANG (A041 - A047) ──
  { kode: "A041", kategori: "Plafon & Lisplang", merk: "-", nama: "Besi Holo Plafon 4x4", satuan: "Batang", harga_beli: 25000, harga: 32500, stok_awal: 80, stok: 80, stok_min: 15, ket: null },
  { kode: "A042", kategori: "Plafon & Lisplang", merk: "-", nama: "Besi Holo Plafon 2x4", satuan: "Batang", harga_beli: 20000, harga: 26000, stok_awal: 80, stok: 80, stok_min: 15, ket: null },
  { kode: "A043", kategori: "Plafon & Lisplang", merk: "-", nama: "Gipsum", satuan: "Lembar", harga_beli: 52000, harga: 67600, stok_awal: 50, stok: 50, stok_min: 10, ket: null },
  { kode: "A044", kategori: "Plafon & Lisplang", merk: "-", nama: "GRC 63", satuan: "Lembar", harga_beli: 63000, harga: 81900, stok_awal: 40, stok: 40, stok_min: 10, ket: null },
  { kode: "A045", kategori: "Plafon & Lisplang", merk: "-", nama: "Lisplang GRC 10", satuan: "Pcs", harga_beli: 27000, harga: 35100, stok_awal: 40, stok: 40, stok_min: 10, ket: null },
  { kode: "A046", kategori: "Plafon & Lisplang", merk: "-", nama: "Lisplang GRC 20", satuan: "Pcs", harga_beli: 41000, harga: 53300, stok_awal: 40, stok: 40, stok_min: 10, ket: null },
  { kode: "A047", kategori: "Plafon & Lisplang", merk: "-", nama: "Lisplang GRC 30", satuan: "Pcs", harga_beli: 60000, harga: 78000, stok_awal: 30, stok: 30, stok_min: 8, ket: null },

  // ── 6. KAYU & BEKISTING (A048 - A058) ──
  { kode: "A048", kategori: "Kayu & Bekisting", merk: "-", nama: "Bambu", satuan: "Batang", harga_beli: 9000, harga: 11700, stok_awal: 100, stok: 100, stok_min: 20, ket: null },
  { kode: "A049", kategori: "Kayu & Bekisting", merk: "-", nama: "Papan Cor 18 x 2,5 cm", satuan: "Pcs", harga_beli: 10000, harga: 13000, stok_awal: 100, stok: 100, stok_min: 20, ket: null },
  { kode: "A050", kategori: "Kayu & Bekisting", merk: "-", nama: "Papan Cor 2 x 20 cm", satuan: "Pcs", harga_beli: 25000, harga: 32500, stok_awal: 80, stok: 80, stok_min: 15, ket: null },
  { kode: "A051", kategori: "Kayu & Bekisting", merk: "-", nama: "Kaso 4x6", satuan: "Batang", harga_beli: 25000, harga: 32500, stok_awal: 80, stok: 80, stok_min: 15, ket: null },
  { kode: "A052", kategori: "Kayu & Bekisting", merk: "-", nama: "Kaso 5x7", satuan: "Batang", harga_beli: 35000, harga: 45500, stok_awal: 60, stok: 60, stok_min: 15, ket: null },
  { kode: "A053", kategori: "Kayu & Bekisting", merk: "-", nama: "Triplek 4 mm", satuan: "Lembar", harga_beli: 59000, harga: 76700, stok_awal: 40, stok: 40, stok_min: 10, ket: null },
  { kode: "A054", kategori: "Kayu & Bekisting", merk: "-", nama: "Triplek 6 mm", satuan: "Lembar", harga_beli: 69000, harga: 89700, stok_awal: 40, stok: 40, stok_min: 10, ket: null },
  { kode: "A055", kategori: "Kayu & Bekisting", merk: "-", nama: "Triplek 8 mm", satuan: "Lembar", harga_beli: 76000, harga: 98800, stok_awal: 30, stok: 30, stok_min: 8, ket: null },
  { kode: "A056", kategori: "Kayu & Bekisting", merk: "-", nama: "Triplek 9 mm", satuan: "Lembar", harga_beli: 89000, harga: 115700, stok_awal: 30, stok: 30, stok_min: 8, ket: null },
  { kode: "A057", kategori: "Kayu & Bekisting", merk: "-", nama: "Triplek 12 mm", satuan: "Lembar", harga_beli: 125000, harga: 162500, stok_awal: 25, stok: 25, stok_min: 5, ket: null },
  { kode: "A058", kategori: "Kayu & Bekisting", merk: "-", nama: "Triplek 15 mm", satuan: "Lembar", harga_beli: 155000, harga: 201500, stok_awal: 20, stok: 20, stok_min: 5, ket: null },

  // ── 7. PIPA PVC RUCIKA (A059 - A073) — disesuaikan juga dgn Laporan Stok 23 Jan 2026 ──
  { kode: "A059", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon AW 1/2 Inch", satuan: "Batang", harga_beli: 23000, harga: 29900, stok_awal: 0, stok: 25, stok_min: 10, ket: "Laporan Stok: Masuk 25 BTG" },
  { kode: "A060", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon AW 3/4 Inch", satuan: "Batang", harga_beli: 28000, harga: 36400, stok_awal: 20, stok: 20, stok_min: 10, ket: null },
  { kode: "A061", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon AW 1 Inch", satuan: "Batang", harga_beli: 39000, harga: 50700, stok_awal: 0, stok: 20, stok_min: 10, ket: "Laporan Stok: Masuk 20 BTG" },
  { kode: "A062", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon AW 1 1/4 Inch", satuan: "Batang", harga_beli: 60000, harga: 78000, stok_awal: 15, stok: 15, stok_min: 5, ket: "Data asli tertulis 1/4 (dikoreksi)" },
  { kode: "A063", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon AW 1 1/2 Inch", satuan: "Batang", harga_beli: 70000, harga: 91000, stok_awal: 15, stok: 15, stok_min: 5, ket: null },
  { kode: "A064", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon AW 2 Inch", satuan: "Batang", harga_beli: 89000, harga: 115700, stok_awal: 15, stok: 15, stok_min: 5, ket: null },
  { kode: "A065", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon AW 2 1/2 Inch", satuan: "Batang", harga_beli: 130000, harga: 169000, stok_awal: 10, stok: 10, stok_min: 5, ket: null },
  { kode: "A066", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon AW 3 Inch", satuan: "Batang", harga_beli: 183000, harga: 237900, stok_awal: 0, stok: 5, stok_min: 5, ket: "Laporan Stok: Masuk 5 BTG" },
  { kode: "A067", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon AW 4 Inch", satuan: "Batang", harga_beli: 320000, harga: 416000, stok_awal: 0, stok: 5, stok_min: 5, ket: "Laporan Stok: Masuk 5 BTG" },
  { kode: "A068", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon D 1 1/4 Inch", satuan: "Batang", harga_beli: 38000, harga: 49400, stok_awal: 15, stok: 15, stok_min: 5, ket: null },
  { kode: "A069", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon D 1 1/2 Inch", satuan: "Batang", harga_beli: 43000, harga: 55900, stok_awal: 15, stok: 15, stok_min: 5, ket: null },
  { kode: "A070", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon D 2 Inch", satuan: "Batang", harga_beli: 57000, harga: 74100, stok_awal: 0, stok: 10, stok_min: 5, ket: "Laporan Stok: Masuk 10 BTG" },
  { kode: "A071", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon D 2 1/2 Inch", satuan: "Batang", harga_beli: 75000, harga: 97500, stok_awal: 0, stok: 10, stok_min: 5, ket: "Laporan Stok: Masuk 10 BTG" },
  { kode: "A072", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon D 3 Inch", satuan: "Batang", harga_beli: 99000, harga: 128700, stok_awal: 0, stok: 15, stok_min: 5, ket: "Laporan Stok: Masuk 15 BTG" },
  { kode: "A073", kategori: "Pipa PVC", merk: "Rucika", nama: "Paralon D 4 Inch", satuan: "Batang", harga_beli: 156000, harga: 202800, stok_awal: 0, stok: 5, stok_min: 5, ket: "Laporan Stok: Masuk 5 BTG" },

  // ── 8. SANITAIR & TANDON (A074 - A079) ──
  { kode: "A074", kategori: "Sanitair & Tandon", merk: "-", nama: "Closet Jongkok", satuan: "Pcs", harga_beli: 115000, harga: 149500, stok_awal: 0, stok: 5, stok_min: 3, ket: "Laporan Stok: Masuk 5 pcs" },
  { kode: "A075", kategori: "Sanitair & Tandon", merk: "-", nama: "Pintu Kamar Mandi Standar PVC", satuan: "Pcs", harga_beli: 215000, harga: 279500, stok_awal: 8, stok: 8, stok_min: 2, ket: null },
  { kode: "A076", kategori: "Sanitair & Tandon", merk: "-", nama: "Toren 300", satuan: "Pcs", harga_beli: 775000, harga: 1007500, stok_awal: 4, stok: 4, stok_min: 2, ket: null },
  { kode: "A077", kategori: "Sanitair & Tandon", merk: "-", nama: "Toren 500", satuan: "Pcs", harga_beli: 1230000, harga: 1599000, stok_awal: 4, stok: 4, stok_min: 2, ket: null },
  { kode: "A078", kategori: "Sanitair & Tandon", merk: "-", nama: "Toren 650", satuan: "Pcs", harga_beli: 1400000, harga: 1820000, stok_awal: 3, stok: 3, stok_min: 1, ket: null },
  { kode: "A079", kategori: "Sanitair & Tandon", merk: "-", nama: "Toren 1050", satuan: "Pcs", harga_beli: 2570000, harga: 3341000, stok_awal: 2, stok: 2, stok_min: 1, ket: null },

  // ── 9. PAKU & PERLENGKAPAN (A080 - A081) ──
  { kode: "A080", kategori: "Paku & Perlengkapan", merk: "-", nama: "Paku Biasa", satuan: "Kg", harga_beli: 15000, harga: 19500, stok_awal: 0, stok: 60, stok_min: 15, ket: "Ukuran 3, 4, 5, 7, 10, 12" },
  { kode: "A081", kategori: "Paku & Perlengkapan", merk: "-", nama: "Paku Beton", satuan: "Pack", harga_beli: 35000, harga: 45500, stok_awal: 25, stok: 25, stok_min: 5, ket: "Ukuran 3, 4, 5, 7, 10, 12" },

  // ── 10. CAT (A082 - A088) ──
  { kode: "A082", kategori: "Cat", merk: "Avian", nama: "Cat Avian 5 kg", satuan: "Pail", harga_beli: 163000, harga: 211900, stok_awal: 15, stok: 15, stok_min: 5, ket: null },
  { kode: "A083", kategori: "Cat", merk: "Avian", nama: "Cat Avian 20 kg", satuan: "Pail", harga_beli: 790000, harga: 1027000, stok_awal: 8, stok: 8, stok_min: 3, ket: null },
  { kode: "A084", kategori: "Cat", merk: "Vinilex", nama: "Cat Vinilex 5 kg", satuan: "Pail", harga_beli: 163000, harga: 211900, stok_awal: 15, stok: 15, stok_min: 5, ket: null },
  { kode: "A085", kategori: "Cat", merk: "Vinilex", nama: "Cat Vinilex 20 kg", satuan: "Pail", harga_beli: 790000, harga: 1027000, stok_awal: 8, stok: 8, stok_min: 3, ket: null },
  { kode: "A086", kategori: "Cat", merk: "Aquaprof", nama: "Cat Aquaprof 1 kg", satuan: "Pail", harga_beli: 61000, harga: 79300, stok_awal: 20, stok: 20, stok_min: 5, ket: null },
  { kode: "A087", kategori: "Cat", merk: "Aquaprof", nama: "Cat Aquaprof 4 kg", satuan: "Pail", harga_beli: 235000, harga: 305500, stok_awal: 12, stok: 12, stok_min: 4, ket: null },
  { kode: "A088", kategori: "Cat", merk: "Aquaprof", nama: "Cat Aquaprof 20 kg", satuan: "Pail", harga_beli: 980000, harga: 1274000, stok_awal: 6, stok: 6, stok_min: 2, ket: null },

  // ── 11. ITEM TAMBAHAN DARI SHEET LAPORAN STOK BARANG (B001 - B042) ──
  { kode: "B001", kategori: "Semen", merk: "Gresik", nama: "Semen Gresik", satuan: "Sak", harga_beli: 53000, harga: 68900, stok_awal: 10, stok: 10, stok_min: 10, ket: "Laporan Stok 23/01/2026" },
  { kode: "B002", kategori: "Semen", merk: "-", nama: "Semen Putih", satuan: "Sak", harga_beli: 110000, harga: 143000, stok_awal: 0, stok: 1, stok_min: 3, ket: "Laporan Stok 22/01/2026: Masuk 1 Zak" },
  { kode: "B003", kategori: "Pipa PVC", merk: "Bestlon", nama: "Paralon Bstln STD P D 2\"", satuan: "Batang", harga_beli: 41838, harga: 54390, stok_awal: 0, stok: 10, stok_min: 5, ket: "Laporan Stok 23/01/2026: Masuk 10 BTG" },
  { kode: "B004", kategori: "Pipa PVC", merk: "Bestlon", nama: "Paralon Bstln STD P D 2 1/2\"", satuan: "Batang", harga_beli: 55135, harga: 71675, stok_awal: 0, stok: 10, stok_min: 5, ket: "Laporan Stok 23/01/2026: Masuk 10 BTG" },
  { kode: "B005", kategori: "Pipa PVC", merk: "Bestlon", nama: "Paralon Bstln STD P D 3\"", satuan: "Batang", harga_beli: 76099, harga: 98930, stok_awal: 0, stok: 8, stok_min: 5, ket: "Laporan Stok 23/01/2026: Masuk 8 BTG" },
  { kode: "B006", kategori: "Pipa PVC", merk: "Bestlon", nama: "Paralon Bstln STD P D 4\"", satuan: "Batang", harga_beli: 119730, harga: 155650, stok_awal: 0, stok: 15, stok_min: 5, ket: "Laporan Stok 23/01/2026: Masuk 15 BTG" },
  { kode: "B007", kategori: "Pipa PVC", merk: "Trilliun", nama: "Knie Trilliun Bc D Abu 3\"/30", satuan: "Pcs", harga_beli: 7117, harga: 9250, stok_awal: 0, stok: 30, stok_min: 10, ket: "Laporan Stok 22/01/2026: Masuk 30 pcs" },
  { kode: "B008", kategori: "Sanitair & Tandon", merk: "ONDA", nama: "Kran ONDA BC Atap 1/2\"/12", satuan: "Pcs", harga_beli: 32883, harga: 42750, stok_awal: 0, stok: 12, stok_min: 5, ket: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode: "B009", kategori: "Pipa PVC", merk: "ONDA", nama: "Seal Tape ONDA 10m 12mm/72", satuan: "Pcs", harga_beli: 4459, harga: 5800, stok_awal: 0, stok: 72, stok_min: 20, ket: "Laporan Stok 22/01/2026: Masuk 72 pcs" },
  { kode: "B010", kategori: "Pipa PVC", merk: "FOX", nama: "Lem FOX Isarplas Lem VPC 40gr", satuan: "Pcs", harga_beli: 6081, harga: 7900, stok_awal: 0, stok: 60, stok_min: 15, ket: "Laporan Stok 22/01/2026: Masuk 60 pcs" },
  { kode: "B011", kategori: "Paku & Perlengkapan", merk: "-", nama: "Kape PVC 5\"", satuan: "Pcs", harga_beli: 1500, harga: 1950, stok_awal: 0, stok: 12, stok_min: 5, ket: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode: "B012", kategori: "Paku & Perlengkapan", merk: "-", nama: "Kape PVC 7\"", satuan: "Pcs", harga_beli: 2500, harga: 3250, stok_awal: 0, stok: 12, stok_min: 5, ket: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode: "B013", kategori: "Paku & Perlengkapan", merk: "-", nama: "Lakban Kertas 1\"", satuan: "Pcs", harga_beli: 3250, harga: 4225, stok_awal: 0, stok: 12, stok_min: 5, ket: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode: "B014", kategori: "Paku & Perlengkapan", merk: "Shisuka", nama: "Meteran 5m Shisuka", satuan: "Pcs", harga_beli: 10000, harga: 13000, stok_awal: 0, stok: 12, stok_min: 5, ket: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode: "B015", kategori: "Cat", merk: "Daesung", nama: "Bulu Roll Copot Daesung", satuan: "Pcs", harga_beli: 10417, harga: 13550, stok_awal: 0, stok: 24, stok_min: 6, ket: "Laporan Stok 22/01/2026: Masuk 24 pcs" },
  { kode: "B016", kategori: "Paku & Perlengkapan", merk: "Kodai", nama: "Palu Karet Kodai", satuan: "Pcs", harga_beli: 26000, harga: 33800, stok_awal: 0, stok: 6, stok_min: 3, ket: "Laporan Stok 22/01/2026: Masuk 6 pcs" },
  { kode: "B017", kategori: "Cat", merk: "Kapal Merah", nama: "Kuas Roll Kapal Merah", satuan: "Pcs", harga_beli: 9584, harga: 12460, stok_awal: 0, stok: 12, stok_min: 5, ket: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode: "B018", kategori: "Cat", merk: "Stamvick", nama: "Kuas Roll Kapal Stamvick", satuan: "Pcs", harga_beli: 22084, harga: 28710, stok_awal: 0, stok: 12, stok_min: 5, ket: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode: "B019", kategori: "Paku & Perlengkapan", merk: "-", nama: "Lem G", satuan: "Pcs", harga_beli: 4600, harga: 5980, stok_awal: 0, stok: 50, stok_min: 10, ket: "Laporan Stok 22/01/2026: Masuk 50 pcs" },
  { kode: "B020", kategori: "Cat", merk: "Eterna", nama: "Bulu Roll Copot Eterna", satuan: "Pcs", harga_beli: 14167, harga: 18420, stok_awal: 0, stok: 12, stok_min: 5, ket: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode: "B021", kategori: "Cat", merk: "Daesung", nama: "Kuas Roll Copot Daesung", satuan: "Pcs", harga_beli: 15417, harga: 20050, stok_awal: 0, stok: 12, stok_min: 5, ket: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode: "B022", kategori: "Cat", merk: "Eterna", nama: "Kuas Roll Copot Eterna", satuan: "Pcs", harga_beli: 20000, harga: 26000, stok_awal: 0, stok: 24, stok_min: 6, ket: "Laporan Stok 22/01/2026: Masuk 24 pcs" },
  { kode: "B023", kategori: "Paku & Perlengkapan", merk: "-", nama: "Selang Timbang", satuan: "Meter", harga_beli: 2000, harga: 2600, stok_awal: 0, stok: 100, stok_min: 20, ket: "Laporan Stok 22/01/2026: Masuk 100 m" },
  { kode: "B024", kategori: "Cat", merk: "633", nama: "Kuas 633 2\"", satuan: "Pcs", harga_beli: 2750, harga: 3575, stok_awal: 0, stok: 24, stok_min: 6, ket: "Laporan Stok 22/01/2026: Masuk 24 pcs" },
  { kode: "B025", kategori: "Cat", merk: "633", nama: "Kuas 633 2,5\"", satuan: "Pcs", harga_beli: 3438, harga: 4470, stok_awal: 0, stok: 24, stok_min: 6, ket: "Laporan Stok 22/01/2026: Masuk 24 pcs" },
  { kode: "B026", kategori: "Cat", merk: "633", nama: "Kuas 633 3\"", satuan: "Pcs", harga_beli: 4125, harga: 5365, stok_awal: 0, stok: 24, stok_min: 6, ket: "Laporan Stok 22/01/2026: Masuk 24 pcs" },
  { kode: "B027", kategori: "Cat", merk: "633", nama: "Kuas 633 4\"", satuan: "Pcs", harga_beli: 5417, harga: 7045, stok_awal: 0, stok: 12, stok_min: 5, ket: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode: "B028", kategori: "Cat", merk: "Eterna", nama: "Kuas Eterna 1,5\"", satuan: "Pcs", harga_beli: 5313, harga: 6910, stok_awal: 0, stok: 12, stok_min: 5, ket: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode: "B029", kategori: "Cat", merk: "Eterna", nama: "Kuas Eterna 2\"", satuan: "Pcs", harga_beli: 7084, harga: 9210, stok_awal: 0, stok: 12, stok_min: 5, ket: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode: "B030", kategori: "Cat", merk: "Eterna", nama: "Kuas Eterna 2,5\"", satuan: "Pcs", harga_beli: 8855, harga: 11510, stok_awal: 0, stok: 12, stok_min: 5, ket: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode: "B031", kategori: "Cat", merk: "Eterna", nama: "Kuas Eterna 4\"", satuan: "Pcs", harga_beli: 18084, harga: 23510, stok_awal: 0, stok: 12, stok_min: 5, ket: "Laporan Stok 22/01/2026: Masuk 12 pcs" },
  { kode: "B032", kategori: "Besi & Baja", merk: "-", nama: "Kawat Loket Hijau K", satuan: "Meter", harga_beli: 10000, harga: 13000, stok_awal: 0, stok: 20, stok_min: 5, ket: "Laporan Stok 22/01/2026: Masuk 20 m" },
  { kode: "B033", kategori: "Besi & Baja", merk: "-", nama: "Kawat Loket Hijau B", satuan: "Meter", harga_beli: 7500, harga: 9750, stok_awal: 0, stok: 20, stok_min: 5, ket: "Laporan Stok 22/01/2026: Masuk 20 m" },
  { kode: "B034", kategori: "Kayu & Bekisting", merk: "-", nama: "Plastik Cor", satuan: "Kg", harga_beli: 12500, harga: 16250, stok_awal: 0, stok: 13, stok_min: 5, ket: "Laporan Stok 22/01/2026: Masuk 13 Kg" },
  { kode: "B035", kategori: "Atap & Rangka Atap", merk: "-", nama: "Karpet 90cm", satuan: "Meter", harga_beli: 8500, harga: 11050, stok_awal: 0, stok: 50, stok_min: 10, ket: "Laporan Stok 22/01/2026: Masuk 50 m" },
  { kode: "B036", kategori: "Besi & Baja", merk: "-", nama: "Kawat Benrat", satuan: "Kg", harga_beli: 13500, harga: 17550, stok_awal: 0, stok: 50, stok_min: 10, ket: "Laporan Stok 22/01/2026: Masuk 50 Kg" },
  { kode: "B037", kategori: "Paku & Perlengkapan", merk: "-", nama: "Pengki Orange", satuan: "Pcs", harga_beli: 12500, harga: 16250, stok_awal: 0, stok: 24, stok_min: 5, ket: "Laporan Stok 22/01/2026: Masuk 24 pcs" },
  { kode: "B038", kategori: "Cat", merk: "-", nama: "Bak Cat 89", satuan: "Pcs", harga_beli: 6250, harga: 8125, stok_awal: 0, stok: 24, stok_min: 5, ket: "Laporan Stok 22/01/2026: Masuk 24 pcs" },
  { kode: "B039", kategori: "Paku & Perlengkapan", merk: "-", nama: "Skrup Gypsum 6x1\"", satuan: "Box", harga_beli: 35000, harga: 45500, stok_awal: 0, stok: 10, stok_min: 3, ket: "Laporan Stok 22/01/2026: Masuk 10 Box" },
  { kode: "B040", kategori: "Paku & Perlengkapan", merk: "-", nama: "Roofing 5cm 350pcs/box", satuan: "Box", harga_beli: 150500, harga: 195650, stok_awal: 0, stok: 5, stok_min: 2, ket: "Laporan Stok 22/01/2026: Masuk 5 box" },
  { kode: "B041", kategori: "Paku & Perlengkapan", merk: "-", nama: "Roofing 7cm 250pcs/box", satuan: "Box", harga_beli: 137500, harga: 178750, stok_awal: 0, stok: 5, stok_min: 2, ket: "Laporan Stok 22/01/2026: Masuk 5 box" },
  { kode: "B042", kategori: "Material Dasar", merk: "-", nama: "Glas Blok", satuan: "Dus", harga_beli: 23000, harga: 29900, stok_awal: 0, stok: 54, stok_min: 10, ket: "Laporan Stok 22/01/2026: Masuk 54 Dus" },
];

async function main() {
  console.log("Seeding Supabase Database CV Kurnia Mandiri (Data Excel)...");

  // 1. Pastikan kolom tambahan dari Excel tersedia di tabel barang & detail_mutasi_barang
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "barang"
      ADD COLUMN IF NOT EXISTS "merk" VARCHAR(100) DEFAULT '-',
      ADD COLUMN IF NOT EXISTS "harga_beli" NUMERIC(15,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "stok_awal" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "keterangan" TEXT;
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "detail_mutasi_barang"
      ADD COLUMN IF NOT EXISTS "stok_sebelum" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "stok_sesudah" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "harga_satuan" NUMERIC(15,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "total_harga" NUMERIC(15,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "keterangan" TEXT;
  `);
  console.log("✅ Struktur kolom tabel barang & detail_mutasi_barang telah disesuaikan dengan Excel.");

  // 2. Enable RLS and policies
  const tables = [
    "pengguna",
    "pelanggan",
    "barang",
    "stok",
    "mutasi_barang",
    "detail_mutasi_barang",
    "transaksi",
    "detail_transaksi",
    "pembayaran",
    "kasbon",
    "rencana_restok",
    "pengiriman",
    "notifikasi",
    "pengaturan_sistem",
    "log_aktivitas",
  ];

  for (const tbl of tables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "${tbl}" ENABLE ROW LEVEL SECURITY;`);
      await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Akses Penuh ${tbl}" ON "${tbl}";`);
      await prisma.$executeRawUnsafe(
        `CREATE POLICY "Akses Penuh ${tbl}" ON "${tbl}" FOR ALL USING (true) WITH CHECK (true);`
      );
    } catch (e) {
      console.log(`Policy for ${tbl}:`, e.message);
    }
  }

  // 3. Insert Pengguna
  await prisma.$executeRawUnsafe(`
    INSERT INTO "pengguna" (id, nama, username, password, role, status) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Irfan (Owner / Admin)', 'admin', 'admin123', 'admin', 'aktif'),
    ('a0000000-0000-0000-0000-000000000002', 'Cynthia Bella (Kasir)', 'kasir', 'kasir123', 'kasir', 'aktif'),
    ('a0000000-0000-0000-0000-000000000004', 'Rafly Romeo (Pengirim)', 'pengirim', 'pengirim123', 'pengirim', 'aktif')
    ON CONFLICT (username) DO NOTHING;
  `);

  // 4. Insert Pelanggan (termasuk Pelanggan Umum)
  await prisma.$executeRawUnsafe(`
    INSERT INTO "pelanggan" (id, nama, jenis, kontak, alamat, batas_kasbon, status_kasbon) VALUES
    ('b0000000-0000-0000-0000-000000000000', 'Pelanggan Umum', 'perorangan', '-', 'Pembeli Tunai Toko', 0, 'nonaktif'),
    ('b0000000-0000-0000-0000-000000000001', 'PT Bumi Karya Sejahtera', 'proyek', '081298765432', 'Jl. Margonda No. 120, Depok', 50000000, 'aktif'),
    ('b0000000-0000-0000-0000-000000000002', 'CV Citra Indah Sentosa', 'proyek', '081387654321', 'Kavling Nuansa Asri Blok C4', 30000000, 'aktif'),
    ('b0000000-0000-0000-0000-000000000003', 'Bpk. Joko Santoso (Mandor)', 'proyek', '085712345678', 'Proyek Ruko Cileungsi', 10000000, 'aktif'),
    ('b0000000-0000-0000-0000-000000000004', 'Pak Slamet Riyadi', 'perorangan', '082198761234', 'Jl. H. Asmawi No. 45', 0, 'aktif')
    ON CONFLICT (id) DO NOTHING;
  `);

  // 5. Bersihkan barang dummy lama BRG-001..BRG-010 jika ada, lalu upsert 130 barang Excel
  await prisma.$executeRawUnsafe(`
    DELETE FROM "barang" WHERE kode_barang LIKE 'BRG-%';
  `);

  const esc = (s) =>
    s === null || s === undefined
      ? "NULL"
      : "'" + String(s).replace(/'/g, "''") + "'";

  for (let i = 0; i < DATA_BARANG_EXCEL.length; i++) {
    const b = DATA_BARANG_EXCEL[i];
    const id = `c0000000-0000-0000-0000-${String(i + 1).padStart(12, "0")}`;
    const barcode = `8992026${String(i + 1).padStart(5, "0")}`;
    await prisma.$executeRawUnsafe(`
      INSERT INTO "barang" (id, kode_barang, nama, merk, kategori, barcode, harga_beli, harga, stok_awal, stok, stok_min, satuan, keterangan)
      VALUES (${esc(id)}, ${esc(b.kode)}, ${esc(b.nama)}, ${esc(b.merk)}, ${esc(b.kategori)}, ${esc(barcode)}, ${b.harga_beli}, ${b.harga}, ${b.stok_awal}, ${b.stok}, ${b.stok_min}, ${esc(b.satuan)}, ${esc(b.ket)})
      ON CONFLICT (kode_barang) DO UPDATE SET
        nama = EXCLUDED.nama,
        merk = EXCLUDED.merk,
        kategori = EXCLUDED.kategori,
        harga_beli = EXCLUDED.harga_beli,
        harga = EXCLUDED.harga,
        stok_awal = EXCLUDED.stok_awal,
        stok = EXCLUDED.stok,
        stok_min = EXCLUDED.stok_min,
        satuan = EXCLUDED.satuan,
        keterangan = EXCLUDED.keterangan;
    `);
  }
  console.log(`✅ ${DATA_BARANG_EXCEL.length} barang dari file Excel berhasil disimpan ke tabel 'barang'.`);

  // 6. Insert Mutasi Barang Masuk & Keluar sesuai Sheet LAPORAN STOK BARANG (21-23 Jan 2026)
  await prisma.$executeRawUnsafe(`
    INSERT INTO "mutasi_barang" (id, pengguna_id, jenis, supplier, no_referensi, tujuan, alasan, tanggal) VALUES
    ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'masuk', 'Distributor Rucika & Bestlon', 'SJ-20260123-01', 'Gudang Utama', 'Stok Masuk Pipa Paralon 23/01/2026', '2026-01-23T08:00:00+07:00'),
    ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'masuk', 'Grosir Alat Teknik & Pertukangan', 'SJ-20260122-01', 'Gudang Utama', 'Stok Masuk Alat & Perlengkapan 22/01/2026', '2026-01-22T09:00:00+07:00'),
    ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'masuk', 'Distributor Semen Tiga Roda', 'SJ-20260121-01', 'Gudang Utama', 'Barang Masuk Semen 3 Roda 21/01/2026', '2026-01-21T08:30:00+07:00'),
    ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'keluar', NULL, 'OUT-20260121-01', 'Penjualan Toko', 'Barang Keluar Semen 3 Roda 15 sak (21/01/2026)', '2026-01-21T14:00:00+07:00')
    ON CONFLICT (id) DO NOTHING;
  `);

  // Detail Mutasi dari Excel (Semen 3 Roda, Paralon Rucika & Bestlon, Alat Pertukangan)
  await prisma.$executeRawUnsafe(`
    INSERT INTO "detail_mutasi_barang" (id, mutasi_id, barang_id, jumlah, stok_sebelum, stok_sesudah, harga_satuan, total_harga, keterangan) VALUES
    ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000011', 10, 100, 110, 57000, 570000, 'Barang Masuk Semen 3 Roda 21/01/2026'),
    ('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000011', 15, 110, 95, 63000, 945000, 'Barang Keluar Semen 3 Roda 21/01/2026'),
    ('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000059', 25, 0, 25, 24144, 603600, 'Paralon Rck STD P AW 1/2"'),
    ('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000061', 20, 0, 20, 44775, 895500, 'Paralon Rck STD P AW 1"'),
    ('f0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000066', 5, 0, 5, 201351, 1006755, 'Paralon Rck STD P AW 3"'),
    ('f0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000067', 5, 0, 5, 333604, 1668020, 'Paralon Rck STD P AW 4"'),
    ('f0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000070', 10, 0, 10, 60811, 608110, 'Paralon Rck STD P D 2"'),
    ('f0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000071', 10, 0, 10, 82162, 821620, 'Paralon Rck STD P D 2 1/2"'),
    ('f0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000072', 15, 0, 15, 109009, 1635135, 'Paralon Rck STD P D 3"'),
    ('f0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000073', 5, 0, 5, 171441, 857205, 'Paralon Rck STD P D 4"')
    ON CONFLICT (id) DO NOTHING;
  `);

  console.log("✅ Riwayat mutasi barang masuk & keluar dari Excel berhasil disimpan!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Error seeding:", e);
  process.exit(1);
});
