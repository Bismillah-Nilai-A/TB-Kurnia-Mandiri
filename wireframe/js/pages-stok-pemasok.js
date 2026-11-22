/*
  Halaman Persediaan & Pemasok:
  1. Barang Masuk & Keluar + Halaman Form Catat Barang Masuk/Keluar (termasuk Tagihan Tempo Pemasok)
  2. Stok Minimum & Perencanaan Restok (RencanaRestok)
  3. Utang & Pembayaran Tempo Pemasok (TagihanPemasok & PembayaranPemasok) + Halaman Form Tagihan
  Menggunakan CustomSelect dan SVG icon konsisten.
*/

(function () {
  const esc = window.WFUI.esc;
  const icon = window.WFUI.icon;
  const customSelect = window.WFUI.customSelect;

  // ==================== 1. HALAMAN BARANG MASUK & KELUAR (MUTASI STOK) ====================
  function renderBarangMasukKeluarPage() {
    const db = window.WF.db;
    const f = window.WF.ui.filters;

    const filteredMutasi = db.mutasi_barang.filter(function (m) {
      return f.mutasiJenis === "SEMUA" || m.jenis === f.mutasiJenis;
    });

    const pgStokBarang = window.WFUI.paginate(
      db.barang,
      "stokBarang",
      5,
      [5, 10, 25],
      "barang"
    );
    const pgMutasi = window.WFUI.paginate(
      filteredMutasi,
      "mutasi",
      5,
      [5, 10, 25],
      "riwayat mutasi"
    );

    const rowsStok = pgStokBarang.items
      .map(function (b) {
        const st =
          b.stok <= 0 ? "habis" : b.stok <= b.stok_minimum ? "menipis" : "aman";
        return (
          "<tr>" +
          '<td class="wf-font-mono"><strong>' +
          esc(b.kode_barang) +
          "</strong></td>" +
          "<td><strong>" +
          esc(b.nama) +
          "</strong></td>" +
          "<td>" +
          esc(b.kategori) +
          "</td>" +
          "<td><strong>" +
          b.stok +
          " " +
          esc(b.satuan_dasar) +
          '</strong> <span style="color:var(--wf-text-muted);">(Min: ' +
          b.stok_minimum +
          ")</span></td>" +
          "<td>" +
          window.WFUI.statusBadge(st) +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    const rowsMutasi = pgMutasi.items
      .map(function (m) {
        return (
          "<tr>" +
          "<td>" +
          esc(m.tanggal) +
          "</td>" +
          "<td>" +
          window.WFUI.statusBadge(
            m.jenis === "masuk" ? "Barang Masuk" : "Barang Keluar"
          ) +
          "</td>" +
          '<td class="wf-font-mono">' +
          esc(m.no_surat_jalan) +
          "</td>" +
          "<td><strong>" +
          esc(m.barang_nama) +
          '</strong><div style="font-size:0.75rem;color:var(--wf-text-muted);">' +
          m.jumlah +
          " " +
          esc(m.satuan_pembelian) +
          "</div></td>" +
          "<td>" +
          (m.jenis === "masuk"
            ? "Pemasok: " +
              esc(m.nama_pemasok) +
              " (" +
              esc(m.jenis_bayar.toUpperCase()) +
              ")"
            : "Tujuan: " + esc(m.tujuan) + " (" + esc(m.alasan) + ")") +
          "</td>" +
          "<td>" +
          m.stok_sebelum +
          " &rarr; <strong>" +
          m.stok_sesudah +
          "</strong></td>" +
          "<td>" +
          esc(m.nama_pengguna) +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    return (
      window.WFUI.pageHeader(
        [{ label: "Persediaan & Pemasok" }, { label: "Barang Masuk & Keluar" }],
        "Barang Masuk & Keluar",
        '<button type="button" class="wf-btn" data-action="open-mutasi-form" data-jenis="keluar">' +
          icon("minus", "wf-icon-sm") +
          "<span>Catat Barang Keluar</span></button>" +
          '<button type="button" class="wf-btn wf-btn-primary" data-action="open-mutasi-form" data-jenis="masuk">' +
          icon("plus", "wf-icon-sm") +
          "<span>Catat Barang Masuk</span></button>"
      ) +
      '<div class="wf-stack">' +
      '<div class="wf-card">' +
      '<div class="wf-card-header"><h2 class="wf-card-title">Daftar Barang &amp; Stok Terkini</h2></div>' +
      '<div class="wf-table-wrap"><table class="wf-table">' +
      "<thead><tr><th>Kode</th><th>Nama Barang</th><th>Kategori</th><th>Stok Terkini</th><th>Status</th></tr></thead>" +
      "<tbody>" +
      rowsStok +
      "</tbody></table></div>" +
      pgStokBarang.html +
      "</div>" +
      '<div class="wf-card">' +
      '<div class="wf-card-header">' +
      '<h2 class="wf-card-title">Riwayat Mutasi Barang</h2>' +
      customSelect({
        id: "wf-filter-mut-jenis",
        value: f.mutasiJenis,
        filter: "mutasiJenis",
        width: "230px",
        size: "sm",
        options: [
          { value: "SEMUA", label: "Semua Jenis Mutasi" },
          { value: "masuk", label: "Barang Masuk (Pemasok)" },
          { value: "keluar", label: "Barang Keluar" },
        ],
      }) +
      "</div>" +
      '<div class="wf-table-wrap"><table class="wf-table">' +
      "<thead><tr><th>Waktu</th><th>Jenis</th><th>No. Surat Jalan / Ref</th><th>Barang &amp; Jumlah</th><th>Pemasok / Tujuan</th><th>Perubahan Stok</th><th>Petugas</th></tr></thead>" +
      "<tbody>" +
      rowsMutasi +
      "</tbody></table></div>" +
      pgMutasi.html +
      "</div>" +
      "</div>"
    );
  }

  // ==================== 2. HALAMAN FORM CATAT BARANG MASUK / KELUAR ====================
  function renderFormMutasiBarangPage() {
    const db = window.WF.db;
    const params = window.WF.ui.pageParams || {};
    const jenis = params.jenis || "masuk";

    return (
      window.WFUI.pageHeader(
        [
          { label: "Persediaan & Pemasok" },
          { label: "Barang Masuk & Keluar", page: "barang-masuk-keluar" },
          {
            label:
              jenis === "masuk" ? "Catat Barang Masuk" : "Catat Barang Keluar",
          },
        ],
        jenis === "masuk"
          ? "Penerimaan Barang Masuk dari Pemasok"
          : "Pengeluaran Barang Gudang",
        '<button type="button" class="wf-btn" data-nav="barang-masuk-keluar">' +
          icon("arrow-left", "wf-icon-sm") +
          "<span>Kembali</span></button>"
      ) +
      '<div class="wf-card">' +
      '<div class="wf-card-header">' +
      '<h2 class="wf-card-title">Formulir Mutasi Stok</h2>' +
      '<div style="display:flex;gap:6px;">' +
      '<button type="button" class="wf-btn wf-btn-sm ' +
      (jenis === "masuk" ? "wf-btn-primary" : "") +
      '" data-action="open-mutasi-form" data-jenis="masuk">Barang Masuk</button>' +
      '<button type="button" class="wf-btn wf-btn-sm ' +
      (jenis === "keluar" ? "wf-btn-primary" : "") +
      '" data-action="open-mutasi-form" data-jenis="keluar">Barang Keluar</button>' +
      "</div></div>" +
      '<div class="wf-card-body">' +
      '<form id="wf-form-mutasi" class="wf-stack" data-jenis="' +
      esc(jenis) +
      '">' +
      '<div class="wf-grid-2">' +
      '<div class="wf-field">' +
      '<label class="wf-label">Pilih Barang</label>' +
      customSelect({
        id: "f-mut-barang",
        name: "barang_id",
        value: db.barang[0] ? db.barang[0].id_barang : "",
        options: db.barang.map(function (b) {
          return {
            value: b.id_barang,
            label:
              b.kode_barang +
              " - " +
              b.nama +
              " (Stok: " +
              b.stok +
              " " +
              b.satuan_dasar +
              ")",
          };
        }),
      }) +
      "</div>" +
      '<div class="wf-field">' +
      '<label for="f-mut-qty" class="wf-label">Jumlah (' +
      (jenis === "masuk" ? "Satuan Dasar / Beli" : "Satuan Dasar") +
      ")</label>" +
      '<input id="f-mut-qty" name="jumlah" type="number" min="1" class="wf-input" value="10" required />' +
      "</div></div>" +
      (jenis === "masuk"
        ? '<div class="wf-grid-2">' +
          '<div class="wf-field">' +
          '<label class="wf-label">Pemasok</label>' +
          customSelect({
            id: "f-mut-pemasok",
            name: "pemasok_id",
            value: db.pemasok[0] ? db.pemasok[0].id_pemasok : "",
            options: db.pemasok.map(function (s) {
              return { value: s.id_pemasok, label: s.nama };
            }),
          }) +
          "</div>" +
          '<div class="wf-field">' +
          '<label for="f-mut-sj" class="wf-label">Nomor Surat Jalan Pemasok</label>' +
          '<input id="f-mut-sj" name="no_surat_jalan" type="text" class="wf-input" placeholder="Contoh: SJ-20260124-01" required />' +
          "</div></div>" +
          '<div class="wf-grid-2">' +
          '<div class="wf-field">' +
          '<label for="f-mut-hbeli" class="wf-label">Harga Beli Total / Satuan (Rp)</label>' +
          '<input id="f-mut-hbeli" name="harga_beli" type="number" min="0" class="wf-input" value="2200000" required />' +
          "</div>" +
          '<div class="wf-field">' +
          '<label class="wf-label">Jenis Pembayaran ke Pemasok</label>' +
          customSelect({
            id: "f-mut-bayar",
            name: "jenis_bayar",
            value: "lunas",
            options: [
              { value: "lunas", label: "Lunas Langsung" },
              {
                value: "tempo",
                label: "Pembayaran Tempo (Otomatis Catat Tagihan Pemasok)",
              },
            ],
          }) +
          "</div></div>" +
          '<div class="wf-field">' +
          '<label for="f-mut-jatuh-tempo" class="wf-label">Tanggal Jatuh Tempo (Jika Pembayaran Tempo)</label>' +
          '<input id="f-mut-jatuh-tempo" name="tanggal_jatuh_tempo" type="date" class="wf-input" value="2026-02-15" />' +
          "</div>"
        : '<div class="wf-grid-2">' +
          '<div class="wf-field">' +
          '<label for="f-mut-tujuan" class="wf-label">Tujuan Pengeluaran Barang</label>' +
          '<input id="f-mut-tujuan" name="tujuan" type="text" class="wf-input" placeholder="Contoh: Pemakaian Toko / Gudang Retur" required />' +
          "</div>" +
          '<div class="wf-field">' +
          '<label for="f-mut-alasan" class="wf-label">Alasan Barang Keluar</label>' +
          '<input id="f-mut-alasan" name="alasan" type="text" class="wf-input" placeholder="Contoh: Kemasan rusak / sampel proyek" required />' +
          "</div></div>") +
      '<div style="display:flex;justify-content:flex-end;gap:10px;padding-top:16px;border-top:1px solid var(--wf-border);">' +
      '<button type="button" class="wf-btn" data-nav="barang-masuk-keluar">Batal</button>' +
      '<button type="submit" class="wf-btn wf-btn-primary">' +
      icon("check", "wf-icon-sm") +
      "<span>Simpan Mutasi</span></button>" +
      "</div>" +
      "</form></div></div>"
    );
  }

  // ==================== 3. HALAMAN STOK MINIMUM & PERENCANAAN RESTOK (PEMILIK) ====================
  function renderStokDanRestokPage() {
    const db = window.WF.db;
    const hampirHabis = db.barang.filter(function (b) {
      return Number(b.stok) <= Number(b.stok_minimum);
    });

    const pgStokMin = window.WFUI.paginate(
      db.barang,
      "stokMin",
      5,
      [5, 10, 25],
      "barang"
    );

    const pgRestok = window.WFUI.paginate(
      db.rencana_restok,
      "restok",
      5,
      [5, 10, 25],
      "rencana restok"
    );

    const rowsBarang = pgStokMin.items
      .map(function (b) {
        const isLow = Number(b.stok) <= Number(b.stok_minimum);
        return (
          "<tr>" +
          '<td class="wf-font-mono"><strong>' +
          esc(b.kode_barang) +
          "</strong></td>" +
          "<td><strong>" +
          esc(b.nama) +
          "</strong></td>" +
          "<td>" +
          esc(b.kategori) +
          "</td>" +
          "<td><strong>" +
          b.stok +
          " " +
          esc(b.satuan_dasar) +
          "</strong></td>" +
          "<td>" +
          '<div style="display:flex;align-items:center;gap:8px;">' +
          '<input type="number" min="1" class="wf-input wf-input-sm" style="width:96px;" value="' +
          esc(b.stok_minimum) +
          '" id="min-stok-' +
          esc(b.id_barang) +
          '" aria-label="Batas stok minimum ' +
          esc(b.nama) +
          '" />' +
          '<button type="button" class="wf-btn wf-btn-sm" data-action="save-stok-minimum" data-id="' +
          esc(b.id_barang) +
          '">Simpan</button>' +
          "</div></td>" +
          "<td>" +
          window.WFUI.statusBadge(isLow ? "menipis" : "aman") +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    const rowsRestok = pgRestok.items
      .map(function (r) {
        return (
          "<tr>" +
          "<td>" +
          esc(r.tanggal) +
          "</td>" +
          "<td><strong>" +
          esc(r.kode_barang) +
          " - " +
          esc(r.nama_barang) +
          "</strong></td>" +
          "<td>" +
          r.stok_saat_ini +
          " / Min " +
          r.stok_minimum +
          " " +
          esc(r.satuan) +
          "</td>" +
          "<td><strong>" +
          r.jumlah_restok +
          " " +
          esc(r.satuan) +
          "</strong></td>" +
          "<td>" +
          esc(r.pemasok_nama) +
          "</td>" +
          "<td>" +
          window.WFUI.statusBadge(r.status) +
          "</td>" +
          '<td class="wf-text-right">' +
          (r.status !== "Selesai"
            ? '<button type="button" class="wf-btn wf-btn-sm" data-action="advance-restok-status" data-id="' +
              esc(r.id_restok) +
              '"><span>Lanjutkan Status</span>' +
              icon("chevron-right", "wf-icon-sm") +
              "</button>"
            : '<span style="color:var(--wf-text-muted);font-size:0.8125rem;">Selesai</span>') +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    return (
      window.WFUI.pageHeader(
        [{ label: "Persediaan & Pemasok" }, { label: "Stok Minimum & Restok" }],
        "Stok Minimum & Perencanaan Restok (" +
          hampirHabis.length +
          " Hampir Habis)"
      ) +
      '<div class="wf-stack">' +
      /* 1. Form Buat Rencana Restok (Lebar Penuh, Rata Horizontal di Desktop) */
      '<div class="wf-card">' +
      '<div class="wf-card-header"><h2 class="wf-card-title">Buat Rencana Restok Barang</h2></div>' +
      '<div class="wf-card-body">' +
      '<form id="wf-form-restok" class="wf-restok-form-grid">' +
      '<div class="wf-field">' +
      '<label class="wf-label">Pilih Barang</label>' +
      customSelect({
        id: "f-rst-brg",
        name: "barang_id",
        value: db.barang[0] ? db.barang[0].id_barang : "",
        options: db.barang.map(function (b) {
          return {
            value: b.id_barang,
            label:
              b.kode_barang +
              " - " +
              b.nama +
              " (Sisa: " +
              b.stok +
              " " +
              b.satuan_dasar +
              ")",
          };
        }),
      }) +
      "</div>" +
      '<div class="wf-field">' +
      '<label for="f-rst-qty" class="wf-label">Jumlah Rencana Restok</label>' +
      '<input id="f-rst-qty" name="jumlah_restok" type="number" min="1" class="wf-input" value="50" required />' +
      "</div>" +
      '<div class="wf-field">' +
      '<label class="wf-label">Pemasok Tujuan</label>' +
      customSelect({
        id: "f-rst-sup",
        name: "pemasok_nama",
        value: db.pemasok[0] ? db.pemasok[0].nama : "",
        options: db.pemasok.map(function (s) {
          return { value: s.nama, label: s.nama };
        }),
      }) +
      "</div>" +
      '<div class="wf-field">' +
      '<button type="submit" class="wf-btn wf-btn-primary" style="width:100%;">' +
      icon("plus", "wf-icon-sm") +
      "<span>Simpan Rencana Restok</span></button>" +
      "</div>" +
      "</form></div></div>" +
      /* 2. Tabel Batas Stok Minimum Barang (Lebar Penuh 100%, Tidak Sempit) */
      '<div class="wf-card">' +
      '<div class="wf-card-header"><h2 class="wf-card-title">Batas Stok Minimum Barang</h2></div>' +
      '<div class="wf-table-wrap"><table class="wf-table">' +
      "<thead><tr><th>Kode</th><th>Nama Barang</th><th>Kategori</th><th>Stok Saat Ini</th><th>Batas Minimum</th><th>Status</th></tr></thead>" +
      "<tbody>" +
      rowsBarang +
      "</tbody></table></div>" +
      pgStokMin.html +
      "</div>" +
      /* 3. Tabel Daftar Rencana Restok Barang (Lebar Penuh 100%) */
      '<div class="wf-card">' +
      '<div class="wf-card-header"><h2 class="wf-card-title">Daftar Rencana Restok Barang</h2></div>' +
      '<div class="wf-table-wrap"><table class="wf-table">' +
      '<thead><tr><th>Tanggal</th><th>Barang</th><th>Stok Saat Ini</th><th>Jumlah Restok</th><th>Pemasok</th><th>Status</th><th class="wf-text-right">Aksi</th></tr></thead>' +
      "<tbody>" +
      rowsRestok +
      "</tbody></table></div>" +
      pgRestok.html +
      "</div>" +
      "</div>"
    );
  }

  // ==================== 4. HALAMAN UTANG & PEMBAYARAN TEMPO PEMASOK (PEMILIK) ====================
  function renderUtangPemasokPage() {
    const db = window.WF.db;
    const totalTagihan = db.tagihan_pemasok.reduce(function (a, t) {
      return a + (Number(t.jumlah_tagihan) || 0);
    }, 0);
    const totalSisa = db.tagihan_pemasok.reduce(function (a, t) {
      return a + (Number(t.sisa_tagihan) || 0);
    }, 0);

    const pgTagihanPemasok = window.WFUI.paginate(
      db.tagihan_pemasok,
      "utangPemasok",
      5,
      [5, 10, 25],
      "tagihan pemasok"
    );

    const rowsTagihan = pgTagihanPemasok.items
      .map(function (t) {
        return (
          "<tr>" +
          '<td class="wf-font-mono"><strong>' +
          esc(t.no_surat_jalan) +
          "</strong></td>" +
          "<td><strong>" +
          esc(t.nama_pemasok) +
          "</strong></td>" +
          "<td>" +
          esc(t.tanggal_jatuh_tempo) +
          "</td>" +
          "<td>" +
          window.WF.formatRupiah(t.jumlah_tagihan) +
          "</td>" +
          "<td><strong>" +
          window.WF.formatRupiah(t.sisa_tagihan) +
          "</strong></td>" +
          "<td>" +
          window.WFUI.statusBadge(t.status) +
          "</td>" +
          '<td class="wf-text-right">' +
          (Number(t.sisa_tagihan) > 0
            ? '<button type="button" class="wf-btn wf-btn-sm wf-btn-primary" data-action="open-bayar-pemasok" data-id="' +
              esc(t.id_tagihan) +
              '">Catat Pembayaran</button>'
            : '<span style="color:var(--wf-text-muted);font-size:0.8125rem;">Lunas</span>') +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    return (
      window.WFUI.pageHeader(
        [{ label: "Persediaan & Pemasok" }, { label: "Utang & Tempo Pemasok" }],
        "Utang & Pembayaran Tempo Pemasok",
        '<button type="button" class="wf-btn wf-btn-primary" data-nav="form-tagihan-pemasok">' +
          icon("plus", "wf-icon-sm") +
          "<span>Tambah Tagihan Tempo</span></button>"
      ) +
      '<div class="wf-grid-stats" style="margin-bottom:20px;">' +
      '<div class="wf-card wf-stat-card"><div class="wf-stat-label">Total Tagihan Tempo</div><div class="wf-stat-value">' +
      window.WF.formatRupiah(totalTagihan) +
      "</div></div>" +
      '<div class="wf-card wf-stat-card"><div class="wf-stat-label">Sisa Utang Pemasok</div><div class="wf-stat-value">' +
      window.WF.formatRupiah(totalSisa) +
      "</div></div>" +
      '<div class="wf-card wf-stat-card"><div class="wf-stat-label">Tagihan Aktif</div><div class="wf-stat-value">' +
      db.tagihan_pemasok.filter(function (t) {
        return Number(t.sisa_tagihan) > 0;
      }).length +
      " Tagihan</div></div>" +
      '<div class="wf-card wf-stat-card"><div class="wf-stat-label">Mitra Pemasok</div><div class="wf-stat-value">' +
      db.pemasok.length +
      " Pemasok</div></div>" +
      "</div>" +
      '<div class="wf-card">' +
      '<div class="wf-card-header"><h2 class="wf-card-title">Daftar Tagihan Tempo Pemasok</h2></div>' +
      '<div class="wf-table-wrap"><table class="wf-table">' +
      '<thead><tr><th>No. Surat Jalan</th><th>Nama Pemasok</th><th>Jatuh Tempo</th><th>Jumlah Tagihan</th><th>Sisa Tagihan</th><th>Status</th><th class="wf-text-right">Aksi</th></tr></thead>' +
      "<tbody>" +
      rowsTagihan +
      "</tbody></table></div>" +
      pgTagihanPemasok.html +
      "</div>"
    );
  }

  function renderFormTagihanPemasokPage() {
    const db = window.WF.db;

    return (
      window.WFUI.pageHeader(
        [
          { label: "Persediaan & Pemasok" },
          { label: "Utang & Tempo Pemasok", page: "utang-pemasok" },
          { label: "Tambah Tagihan Tempo" },
        ],
        "Tambah Tagihan Tempo Pemasok",
        '<button type="button" class="wf-btn" data-nav="utang-pemasok">' +
          icon("arrow-left", "wf-icon-sm") +
          "<span>Kembali</span></button>"
      ) +
      '<div class="wf-card">' +
      '<div class="wf-card-header"><h2 class="wf-card-title">Data Tagihan &amp; Jatuh Tempo Pemasok</h2></div>' +
      '<div class="wf-card-body">' +
      '<form id="wf-form-tagihan-pemasok" class="wf-stack">' +
      '<div class="wf-grid-2">' +
      '<div class="wf-field">' +
      '<label class="wf-label">Pilih Pemasok</label>' +
      customSelect({
        id: "f-tgp-sup",
        name: "pemasok_id",
        value: db.pemasok[0] ? db.pemasok[0].id_pemasok : "",
        options: db.pemasok.map(function (s) {
          return { value: s.id_pemasok, label: s.nama };
        }),
      }) +
      "</div>" +
      '<div class="wf-field">' +
      '<label for="f-tgp-sj" class="wf-label">Nomor Surat Jalan / Faktur Pemasok</label>' +
      '<input id="f-tgp-sj" name="no_surat_jalan" type="text" class="wf-input" placeholder="Contoh: SJ-20260124-09" required />' +
      "</div></div>" +
      '<div class="wf-grid-2">' +
      '<div class="wf-field">' +
      '<label for="f-tgp-jml" class="wf-label">Jumlah Tagihan Tempo (Rp)</label>' +
      '<input id="f-tgp-jml" name="jumlah_tagihan" type="number" min="1000" class="wf-input" placeholder="Contoh: 3500000" required />' +
      "</div>" +
      '<div class="wf-field">' +
      '<label for="f-tgp-tempo" class="wf-label">Tanggal Jatuh Tempo</label>' +
      '<input id="f-tgp-tempo" name="tanggal_jatuh_tempo" type="date" class="wf-input" value="2026-02-20" required />' +
      "</div></div>" +
      '<div style="display:flex;justify-content:flex-end;gap:10px;padding-top:16px;border-top:1px solid var(--wf-border);">' +
      '<button type="button" class="wf-btn" data-nav="utang-pemasok">Batal</button>' +
      '<button type="submit" class="wf-btn wf-btn-primary">' +
      icon("check", "wf-icon-sm") +
      "<span>Simpan Tagihan</span></button>" +
      "</div>" +
      "</form></div></div>"
    );
  }

  window.WFPagesStokPemasok = {
    renderBarangMasukKeluarPage: renderBarangMasukKeluarPage,
    renderFormMutasiBarangPage: renderFormMutasiBarangPage,
    renderStokDanRestokPage: renderStokDanRestokPage,
    renderUtangPemasokPage: renderUtangPemasokPage,
    renderFormTagihanPemasokPage: renderFormTagihanPemasokPage,
  };
})();
