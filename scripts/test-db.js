const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// 1. Muat environment variable dari .env dan .env.local secara manual
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
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

const rootDir = path.resolve(__dirname, "..");
loadEnvFile(path.join(rootDir, ".env"));
loadEnvFile(path.join(rootDir, ".env.local"));

async function testDatabase() {
  console.log("\n=======================================================");
  console.log("   TEST KONEKSI DATABASE POS: CV KURNIA MANDIRI        ");
  console.log("=======================================================\n");

  // ───────────────────────────────────────────────────────────
  // A. TEST KONEKSI SUPABASE REST API
  // ───────────────────────────────────────────────────────────
  console.log("👉 [1/2] Menguji Koneksi Supabase (REST API & Anon Key)...");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY belum di-set di .env");
  } else {
    console.log(`   URL : ${supabaseUrl}`);
    const supabase = createClient(supabaseUrl, supabaseKey);

    const tables = [
      "pengguna",
      "pelanggan",
      "barang",
      "stok",
      "mutasi_barang",
      "transaksi",
      "detail_transaksi",
      "pembayaran",
      "kasbon",
      "pengaturan_sistem",
    ];

    let foundTables = 0;
    let missingTables = 0;

    for (const tbl of tables) {
      try {
        const { data, error, count } = await supabase
          .from(tbl)
          .select("*", { count: "exact", head: false })
          .limit(1);

        if (error) {
          if (error.code === "PGRST205") {
            console.log(`   ❌ Tabel '${tbl}' : Belum dibuat di Supabase (PGRST205)`);
            missingTables++;
          } else {
            console.log(`   ⚠️ Tabel '${tbl}' : Error (${error.message})`);
          }
        } else {
          console.log(`   ✅ Tabel '${tbl}' : Siap (data tersedia)`);
          foundTables++;
        }
      } catch (err) {
        console.log(`   ❌ Tabel '${tbl}' : Gagal koneksi (${err.message})`);
        missingTables++;
      }
    }

    if (missingTables > 0) {
      console.log("\n   💡 TIPS: Tabel belum terbentuk di PostgreSQL Supabase.");
      console.log("   Salin isi file 'supabase_schema.sql' dan jalankan di Dashboard Supabase -> SQL Editor.");
    } else {
      console.log("\n   🎉 Seluruh tabel Supabase telah terverifikasi aktif!");
    }
  }

  // ───────────────────────────────────────────────────────────
  // B. TEST KONEKSI PRISMA ORM (POSTGRESQL POOLER)
  // ───────────────────────────────────────────────────────────
  console.log("\n👉 [2/2] Menguji Koneksi Prisma ORM (PostgreSQL Pooler)...");
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.log("   ⚠️ DATABASE_URL belum ditemukan di .env.local atau .env");
  } else if (dbUrl.includes("[YOUR-PASSWORD]")) {
    console.log("   ⚠️ DATABASE_URL masih berisi placeholder '[YOUR-PASSWORD]'");
    console.log("   Ganti '[YOUR-PASSWORD]' di file .env.local dengan password database Anda");
    console.log("   jika ingin menghubungkan Prisma secara langsung ke Supabase.");
  } else {
    try {
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: dbUrl,
          },
        },
      });

      console.log("   Mencoba query 'SELECT 1' via Prisma...");
      await prisma.$queryRaw`SELECT 1 as connected`;
      console.log("   ✅ Koneksi Prisma ORM ke PostgreSQL BERHASIL!");
      await prisma.$disconnect();
    } catch (err) {
      console.log(`   ❌ Gagal terhubung via Prisma: ${err.message}`);
    }
  }

  console.log("\n=======================================================\n");
}

testDatabase();

