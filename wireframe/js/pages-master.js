/*
  Halaman Master Data (Data Barang, Form Tambah/Ubah Barang, Cetak Barcode,
  Data Pelanggan, Form Tambah/Ubah Pelanggan, & Detail Riwayat Pelanggan).
  Menggunakan CustomSelect, SVG icon konsisten, dan tata letak bersih tanpa card-di-dalam-card.
*/

(function () {
  const esc = window.WFUI.esc;
  const icon = window.WFUI.icon;
  const customSelect = window.WFUI.customSelect;

  // ==================== 1. HALAMAN DATA BARANG (PEMILIK) ====================
  function renderDataBarangPage() {
    const db = window.WF.db;
    const f = window.WF.ui.filters;
    const q = (f.barangSearch || "").trim().toLowerCase();

    const kategoriSet = ["SEMUA"];
    db.barang.forEach(function (b) {
      if (kategoriSet.indexOf(b.kategori) === -1) kategoriSet.push(b.kategori);
    });

    const filtered = db.barang.filter(function (b) {
      const matchKat = f.barangKategori === "SEMUA" || b.kategori === f.barangKategori;
      const matchQ =
        !q ||
        b.nama.toLowerCase().indexOf(q) !== -1 ||
        b.kode_barang.toLowerCase().indexOf(q) !== -1 ||
        b.barcode.toLowerCase().indexOf(q) !== -1;
      return matchKat && matchQ;
    });

    const pgBarang = window.WFUI.paginate(
      filtered,
      "barang",
      5,
      [5, 10, 25],
      "barang"
    );

    const rowsHtml = pgBarang.items
      .map(function (b) {
        const satuanList = (b.satuan_barang || [])
          .map(function (s) {
            return (
              "<div><strong>" +
              esc(s.nama_satuan) +
              "</strong>: " +
              window.WF.formatRupiah(s.harga_jual_awal) +
              " (+" +
              s.margin_persen +
              "%)</div>"
            );
          })
          .join("");
        const stokStatus =
          Number(b.stok) <= 0
            ? "habis"
            : Number(b.stok) <= Number(b.stok_minimum)
              ? "menipis"
              : "aman";

        return (
          "<tr>" +
          '<td class="wf-font-mono"><strong>' +
          esc(b.kode_barang) +
          '</strong><div style="font-size:0.75rem;color:var(--wf-text-muted);">' +
          esc(b.barcode) +
          "</div></td>" +
          "<td><strong>" +
          esc(b.nama) +
          '</strong><div style="font-size:0.75rem;color:var(--wf-text-muted);">' +
          esc(b.kategori) +
          " &middot; " +
          (b.barcode_fisik ? "Barcode Produk" : "Barcode Meja Kasir") +
          "</div></td>" +
          "<td><div>Beli: " +
          window.WF.formatRupiah(b.harga_beli) +
          " / " +
          esc(b.satuan_pembelian) +
          '</div><div style="font-size:0.75rem;color:var(--wf-text-muted);">Modal Dasar: ' +
          window.WF.formatRupiah(b.harga_modal) +
          " / " +
          esc(b.satuan_dasar) +
          "</div></td>" +
          '<td style="font-size:0.8125rem;">' +
          satuanList +
          "</td>" +
          "<td><strong>" +
          b.stok +
          " " +
          esc(b.satuan_dasar) +
          '</strong><div style="font-size:0.75rem;color:var(--wf-text-muted);">Min: ' +
          b.stok_minimum +
          " " +
          esc(b.satuan_dasar) +
          "</div></td>" +
          "<td>" +
          window.WFUI.statusBadge(stokStatus) +
          "</td>" +
          '<td class="wf-text-right" style="white-space:nowrap;">' +
          '<button type="button" class="wf-btn wf-btn-sm" data-action="edit-barang" data-id="' +
          esc(b.id_barang) +
          '">' +
          icon("edit", "wf-icon-sm") +
          "<span>Ubah</span></button> " +
          '<button type="button" class="wf-btn wf-btn-sm" data-action="confirm-delete-barang" data-id="' +
          esc(b.id_barang) +
          '">' +
          icon("trash", "wf-icon-sm") +
          "<span>Hapus</span></button>" +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    return (
      window.WFUI.pageHeader(
        [{ label: "Persediaan & Pemasok" }, { label: "Data Barang & Barcode" }],
        "Data Barang & Multi-Satuan",
        '<button type="button" class="wf-btn" data-nav="cetak-barcode">' +
          icon("barcode", "wf-icon-sm") +
          "<span>Cetak Label Barcode</span></button>" +
          '<button type="button" class="wf-btn wf-btn-primary" data-action="open-add-barang">' +
          icon("plus", "wf-icon-sm") +
          "<span>Tambah Barang</span></button>"
      ) +
      '<div class="wf-card">' +
      '<div class="wf-card-header">' +
      '<div class="wf-filter-bar">' +
      '<div class="wf-filter-search">' +
      '<label for="wf-filter-brg-q" class="wf-sr-only">Cari Barang</label>' +
      '<div class="wf-input-group">' +
      '<span class="wf-input-icon-left">' +
      icon("search", "wf-icon-sm") +
      "</span>" +
      '<input id="wf-filter-brg-q" type="text" class="wf-input wf-input-has-left" placeholder="Cari nama, kode barang, atau barcode..." value="' +
      esc(f.barangSearch) +
      '" data-filter="barangSearch" />' +
      "</div>" +
      "</div>" +
      '<div class="wf-filter-select">' +
      customSelect({
        id: "wf-filter-brg-kat",
        value: f.barangKategori,
        filter: "barangKategori",
        options: kategoriSet.map(function (k) {
          return {
            value: k,
            label: k === "SEMUA" ? "Semua Kategori" : "Kategori: " + k,
          };
        }),
      }) +
      "</div>" +
      "</div>" +
      '<div style="font-size:0.8125rem;font-weight:600;color:var(--wf-text-secondary);">Total: ' +
      filtered.length +
      " Barang</div>" +
      "</div>" +
      '<div class="wf-table-wrap">' +
      '<table class="wf-table">' +
      '<thead><tr><th>Kode &amp; Barcode</th><th>Nama Barang</th><th>Harga Beli &amp; Modal</th><th>Satuan Jual (+30%)</th><th>Stok</th><th>Status</th><th class="wf-text-right">Aksi</th></tr></thead>' +
      "<tbody>" +
      (rowsHtml ||
        '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--wf-text-muted);">Tidak ada data barang yang sesuai filter.</td></tr>') +
      "</tbody></table></div>" +
      pgBarang.html +
      "</div>"
    );
  }

  // ==================== 2. HALAMAN FORM TAMBAH / UBAH BARANG ====================
  function renderFormBarangPage() {
    const params = window.WF.ui.pageParams || {};
    const editId = params.id_barang;
    const existing = editId
      ? window.WF.db.barang.find(function (b) {
          return b.id_barang === editId;
        })
      : null;

    const isEdit = Boolean(existing);
    const b = existing || {
      kode_barang: "A00" + (window.WF.db.barang.length + 1),
      nama: "",
      kategori: "Material Dasar",
      barcode: "89910020000" + (window.WF.db.barang.length + 1),
      barcode_fisik: true,
      satuan_dasar: "Sak",
      stok: 0,
      stok_minimum: 10,
      satuan_pembelian: "Palet (40 Sak)",
      isi_per_satuan_beli: 40,
      harga_beli: 2200000,
      harga_modal: 55000,
      satuan_barang: [
        {
          nama_satuan: "Sak",
          jumlah_konversi: 1,
          margin_persen: 30,
          harga_jual_awal: 71500,
        },
        {
          nama_satuan: "DO (50 Sak)",
          jumlah_konversi: 50,
          margin_persen: 25,
          harga_jual_awal: 3437500,
        },
      ],
    };

    const sat2 = (b.satuan_barang && b.satuan_barang[1]) || {
      nama_satuan: "",
      jumlah_konversi: 10,
      margin_persen: 28,
    };

    return (
      window.WFUI.pageHeader(
        [
          { label: "Persediaan & Pemasok" },
          { label: "Data Barang & Barcode", page: "data-barang" },
          { label: isEdit ? "Ubah Barang" : "Tambah Barang" },
        ],
        isEdit ? "Ubah Data Barang (" + b.kode_barang + ")" : "Tambah Barang Baru",
        '<button type="button" class="wf-btn" data-nav="data-barang">' +
          icon("arrow-left", "wf-icon-sm") +
          "<span>Kembali</span></button>"
      ) +
      '<div class="wf-card">' +
      '<div class="wf-card-header"><h2 class="wf-card-title">Identitas, Harga Modal, &amp; Multi-Satuan Jual</h2></div>' +
      '<div class="wf-card-body">' +
      '<form id="wf-form-barang" class="wf-stack" data-edit-id="' +
      esc(editId || "") +
      '">' +
      '<div class="wf-grid-2">' +
      '<div class="wf-field">' +
      '<label for="f-brg-kode" class="wf-label">Kode Barang</label>' +
      '<input id="f-brg-kode" name="kode_barang" type="text" class="wf-input" value="' +
      esc(b.kode_barang) +
      '" required />' +
      "</div>" +
      '<div class="wf-field">' +
      '<label for="f-brg-kategori" class="wf-label">Kategori Material</label>' +
      '<input id="f-brg-kategori" name="kategori" type="text" class="wf-input" value="' +
      esc(b.kategori) +
      '" placeholder="Mis: Semen, Material Dasar, Besi & Baja" required />' +
      "</div>" +
      "</div>" +
      '<div class="wf-grid-2">' +
      '<div class="wf-field">' +
      '<label for="f-brg-nama" class="wf-label">Nama Lengkap Barang</label>' +
      '<input id="f-brg-nama" name="nama" type="text" class="wf-input" value="' +
      esc(b.nama) +
      '" placeholder="Contoh: Semen Tiga Roda PCC 50 Kg" required />' +
      "</div>" +
      '<div class="wf-field">' +
      '<label for="f-brg-barcode" class="wf-label">Nomor Barcode</label>' +
      '<input id="f-brg-barcode" name="barcode" type="text" class="wf-input" value="' +
      esc(b.barcode) +
      '" required />' +
      "</div>" +
      "</div>" +
      '<div class="wf-grid-2">' +
      '<div class="wf-field">' +
      '<label class="wf-label">Penempatan Label Barcode</label>' +
      customSelect({
        id: "f-brg-jenis-barcode",
        name: "barcode_fisik",
        value: b.barcode_fisik ? "true" : "false",
        options: [
          { value: "true", label: "Ditempel di Kemasan Produk" },
          {
            value: "false",
            label: "Daftar Barcode Meja Kasir (Barang Curah / Pasir / Hebel)",
          },
        ],
      }) +
      "</div>" +
      '<div class="wf-field">' +
      '<label for="f-brg-sat-dasar" class="wf-label">Satuan Jual Dasar</label>' +
      '<input id="f-brg-sat-dasar" name="satuan_dasar" type="text" class="wf-input" value="' +
      esc(b.satuan_dasar) +
      '" placeholder="Mis: Sak, Kubik, Batang" required />' +
      "</div>" +
      "</div>" +
      '<div class="wf-section-divider">' +
      '<div class="wf-grid-2">' +
      '<div class="wf-field">' +
      '<label for="f-brg-sat-beli" class="wf-label">Satuan Pembelian Pemasok</label>' +
      '<input id="f-brg-sat-beli" name="satuan_pembelian" type="text" class="wf-input" value="' +
      esc(b.satuan_pembelian) +
      '" placeholder="Mis: Palet (40 Sak) atau Truk" required />' +
      "</div>" +
      '<div class="wf-field">' +
      '<label for="f-brg-isi-beli" class="wf-label">Isi Konversi ke Satuan Dasar</label>' +
      '<input id="f-brg-isi-beli" name="isi_per_satuan_beli" type="number" min="1" class="wf-input" value="' +
      esc(b.isi_per_satuan_beli) +
      '" required />' +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="wf-grid-2">' +
      '<div class="wf-field">' +
      '<label for="f-brg-harga-beli" class="wf-label">Harga Beli per Satuan Pemasok (Rp)</label>' +
      '<input id="f-brg-harga-beli" name="harga_beli" type="number" min="100" class="wf-input" value="' +
      esc(b.harga_beli) +
      '" required />' +
      '<span class="wf-hint">Harga Jual Awal satuan dasar dihitung otomatis: Harga Modal + Margin 30%.</span>' +
      "</div>" +
      '<div class="wf-grid-2">' +
      '<div class="wf-field">' +
      '<label for="f-brg-stok" class="wf-label">Stok Saat Ini</label>' +
      '<input id="f-brg-stok" name="stok" type="number" min="0" class="wf-input" value="' +
      esc(b.stok) +
      '" required />' +
      "</div>" +
      '<div class="wf-field">' +
      '<label for="f-brg-stok-min" class="wf-label">Stok Minimum</label>' +
      '<input id="f-brg-stok-min" name="stok_minimum" type="number" min="1" class="wf-input" value="' +
      esc(b.stok_minimum) +
      '" required />' +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="wf-section-divider">' +
      '<div class="wf-grid-2">' +
      '<div class="wf-field">' +
      '<label for="f-brg-sat2-nama" class="wf-label">Satuan Jual Grosir / Tambahan (Opsional)</label>' +
      '<input id="f-brg-sat2-nama" name="sat2_nama" type="text" class="wf-input" value="' +
      esc(sat2.nama_satuan) +
      '" placeholder="Mis: Truk (10 Kubik) / DO (50 Sak)" />' +
      "</div>" +
      '<div class="wf-field">' +
      '<label for="f-brg-sat2-konv" class="wf-label">Jumlah Konversi Satuan Grosir</label>' +
      '<input id="f-brg-sat2-konv" name="sat2_konversi" type="number" min="1" class="wf-input" value="' +
      esc(sat2.jumlah_konversi || 10) +
      '" />' +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div style="display:flex;justify-content:flex-end;gap:10px;padding-top:16px;border-top:1px solid var(--wf-border);">' +
      '<button type="button" class="wf-btn" data-nav="data-barang">Batal</button>' +
      '<button type="submit" class="wf-btn wf-btn-primary">' +
      icon("check", "wf-icon-sm") +
      "<span>Simpan Data Barang</span></button>" +
      "</div>" +
      "</form></div></div>"
    );
  }

  // ==================== 3. HALAMAN CETAK LABEL BARCODE ====================
  function renderCetakBarcodePage() {
    const db = window.WF.db;
    const produkFisik = db.barang.filter(function (b) {
      return b.barcode_fisik;
    });
    const mejaKasir = db.barang.filter(function (b) {
      return !b.barcode_fisik;
    });

    function renderBarcodeCards(list, tipeLabel) {
      return list
        .map(function (b) {
          const hargaDasar =
            b.satuan_barang && b.satuan_barang[0]
              ? b.satuan_barang[0].harga_jual_awal
              : b.harga_modal * 1.3;
          return (
            '<div class="wf-subtle-panel" style="background:#ffffff;text-align:center;">' +
            '<div style="font-size:0.6875rem;font-weight:700;color:var(--wf-text-muted);text-transform:uppercase;letter-spacing:0.05em;">CV KURNIA MANDIRI &middot; ' +
            esc(tipeLabel) +
            "</div>" +
            '<div style="font-weight:700;font-size:0.9375rem;margin-top:4px;">' +
            esc(b.nama) +
            "</div>" +
            '<div class="wf-barcode-bars">||| | |||| || ||| |||| | |||</div>' +
            '<div class="wf-font-mono" style="font-size:0.8125rem;color:var(--wf-text-secondary);">' +
            esc(b.barcode) +
            " (" +
            esc(b.kode_barang) +
            ")</div>" +
            '<div style="font-weight:700;font-size:0.875rem;margin-top:4px;">' +
            window.WF.formatRupiah(hargaDasar) +
            " / " +
            esc(b.satuan_dasar) +
            "</div>" +
            "</div>"
          );
        })
        .join("");
    }

    return (
      window.WFUI.pageHeader(
        [
          { label: "Persediaan & Pemasok" },
          { label: "Data Barang & Barcode", page: "data-barang" },
          { label: "Cetak Label Barcode" },
        ],
        "Cetak Label Barcode Produk & Meja Kasir",
        '<button type="button" class="wf-btn" data-nav="data-barang">' +
          icon("arrow-left", "wf-icon-sm") +
          "<span>Kembali</span></button>" +
          '<button type="button" class="wf-btn wf-btn-primary" data-action="simulasi-cetak-barcode">' +
          icon("printer", "wf-icon-sm") +
          "<span>Cetak Label Barcode</span></button>"
      ) +
      '<div class="wf-stack">' +
      '<div class="wf-card">' +
      '<div class="wf-card-header"><h2 class="wf-card-title">Lembar Barcode Meja Kasir (Material Curah Tanpa Kemasan)</h2></div>' +
      '<div class="wf-card-body">' +
      '<div class="wf-grid-2">' +
      renderBarcodeCards(mejaKasir, "KATALOG MEJA KASIR") +
      "</div></div></div>" +
      '<div class="wf-card">' +
      '<div class="wf-card-header"><h2 class="wf-card-title">Stiker Label Barcode Kemasan Produk</h2></div>' +
      '<div class="wf-card-body">' +
      '<div class="wf-grid-2">' +
      renderBarcodeCards(produkFisik, "LABEL PRODUK") +
      "</div></div></div>" +
      "</div>"
    );
  }

  // ==================== 4. HALAMAN DATA PELANGGAN (PEMILIK & KASIR) ====================
  function renderDataPelangganPage() {
    const db = window.WF.db;
    const f = window.WF.ui.filters;
    const role = window.WF.ui.currentUser ? window.WF.ui.currentUser.role : "admin";
    const q = (f.pelangganSearch || "").trim().toLowerCase();

    const filtered = db.pelanggan.filter(function (p) {
      const matchJ = f.pelangganJenis === "SEMUA" || p.jenis === f.pelangganJenis;
      const matchQ =
        !q ||
        p.nama.toLowerCase().indexOf(q) !== -1 ||
        p.alamat.toLowerCase().indexOf(q) !== -1 ||
        p.kontak.toLowerCase().indexOf(q) !== -1;
      return matchJ && matchQ;
    });

    const pgPelanggan = window.WFUI.paginate(
      filtered,
      "pelanggan",
      5,
      [5, 10, 25],
      "pelanggan"
    );

    const rowsHtml = pgPelanggan.items
      .map(function (p) {
        return (
          "<tr>" +
          "<td><strong>" +
          esc(p.nama) +
          '</strong><div style="font-size:0.75rem;color:var(--wf-text-muted);">Terdaftar: ' +
          esc(p.created_at) +
          "</div></td>" +
          '<td style="text-transform:uppercase;font-weight:600;font-size:0.8125rem;">' +
          esc(p.jenis) +
          "</td>" +
          "<td>" +
          esc(p.kontak) +
          "</td>" +
          "<td>" +
          esc(p.alamat) +
          "</td>" +
          "<td>" +
          window.WF.formatRupiah(p.batas_kasbon) +
          "</td>" +
          "<td><strong>" +
          window.WF.formatRupiah(p.sisa_piutang) +
          "</strong></td>" +
          "<td>" +
          window.WFUI.statusBadge(p.status_kasbon) +
          "</td>" +
          '<td class="wf-text-right" style="white-space:nowrap;">' +
          '<button type="button" class="wf-btn wf-btn-sm" data-action="detail-pelanggan" data-id="' +
          esc(p.id_pelanggan) +
          '">Riwayat</button> ' +
          '<button type="button" class="wf-btn wf-btn-sm" data-action="edit-pelanggan" data-id="' +
          esc(p.id_pelanggan) +
          '">' +
          icon("edit", "wf-icon-sm") +
          "<span>Ubah</span></button>" +
          (role === "admin" && p.id_pelanggan !== "pel-01"
            ? ' <button type="button" class="wf-btn wf-btn-sm" data-action="confirm-delete-pelanggan" data-id="' +
              esc(p.id_pelanggan) +
              '">' +
              icon("trash", "wf-icon-sm") +
              "<span>Hapus</span></button>"
            : "") +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    return (
      window.WFUI.pageHeader(
        [{ label: "Penjualan & Kasir" }, { label: "Data Pelanggan" }],
        "Data Pelanggan",
        '<button type="button" class="wf-btn wf-btn-primary" data-action="open-add-pelanggan">' +
          icon("plus", "wf-icon-sm") +
          "<span>Tambah Pelanggan</span></button>"
      ) +
      '<div class="wf-card">' +
      '<div class="wf-card-header">' +
      '<div class="wf-filter-bar">' +
      '<div class="wf-filter-search">' +
      '<label for="wf-filter-pel-q" class="wf-sr-only">Cari Pelanggan</label>' +
      '<div class="wf-input-group">' +
      '<span class="wf-input-icon-left">' +
      icon("search", "wf-icon-sm") +
      "</span>" +
      '<input id="wf-filter-pel-q" type="text" class="wf-input wf-input-has-left" placeholder="Cari nama pelanggan, proyek, atau alamat..." value="' +
      esc(f.pelangganSearch) +
      '" data-filter="pelangganSearch" />' +
      "</div>" +
      "</div>" +
      '<div class="wf-filter-select">' +
      customSelect({
        id: "wf-filter-pel-j",
        value: f.pelangganJenis,
        filter: "pelangganJenis",
        options: [
          { value: "SEMUA", label: "Semua Jenis Pelanggan" },
          { value: "proyek", label: "Proyek / Kontraktor" },
          { value: "perorangan", label: "Perorangan" },
        ],
      }) +
      "</div>" +
      "</div>" +
      '<div style="font-size:0.8125rem;font-weight:600;color:var(--wf-text-secondary);">Total: ' +
      filtered.length +
      " Pelanggan</div>" +
      "</div>" +
      '<div class="wf-table-wrap">' +
      '<table class="wf-table">' +
      '<thead><tr><th>Nama Pelanggan</th><th>Jenis</th><th>Kontak</th><th>Alamat</th><th>Batas Kasbon</th><th>Sisa Piutang</th><th>Status Kasbon</th><th class="wf-text-right">Aksi</th></tr></thead>' +
      "<tbody>" +
      rowsHtml +
      "</tbody></table></div>" +
      pgPelanggan.html +
      "</div>"
    );
  }

  // ==================== 5. HALAMAN FORM TAMBAH / UBAH PELANGGAN ====================
  function renderFormPelangganPage() {
    const params = window.WF.ui.pageParams || {};
    const editId = params.id_pelanggan;
    const existing = editId
      ? window.WF.db.pelanggan.find(function (p) {
          return p.id_pelanggan === editId;
        })
      : null;
    const isEdit = Boolean(existing);
    const p = existing || {
      nama: "",
      jenis: "proyek",
      kontak: "",
      alamat: "",
      batas_kasbon: 15000000,
      status_kasbon: "aktif",
    };

    return (
      window.WFUI.pageHeader(
        [
          { label: "Penjualan & Kasir" },
          { label: "Data Pelanggan", page: "data-pelanggan" },
          { label: isEdit ? "Ubah Pelanggan" : "Tambah Pelanggan" },
        ],
        isEdit ? "Ubah Data Pelanggan" : "Tambah Pelanggan Baru",
        '<button type="button" class="wf-btn" data-nav="data-pelanggan">' +
          icon("arrow-left", "wf-icon-sm") +
          "<span>Kembali</span></button>"
      ) +
      '<div class="wf-card">' +
      '<div class="wf-card-header"><h2 class="wf-card-title">Identitas &amp; Batas Kasbon Pelanggan</h2></div>' +
      '<div class="wf-card-body">' +
      '<form id="wf-form-pelanggan" class="wf-stack" data-edit-id="' +
      esc(editId || "") +
      '">' +
      '<div class="wf-grid-2">' +
      '<div class="wf-field">' +
      '<label for="f-pel-nama" class="wf-label">Nama Pelanggan / Perusahaan Proyek</label>' +
      '<input id="f-pel-nama" name="nama" type="text" class="wf-input" value="' +
      esc(p.nama) +
      '" placeholder="Contoh: CV Maju Bersama Konstruksi" required />' +
      "</div>" +
      '<div class="wf-field">' +
      '<label class="wf-label">Jenis Pelanggan</label>' +
      customSelect({
        id: "f-pel-jenis",
        name: "jenis",
        value: p.jenis,
        options: [
          { value: "proyek", label: "Proyek / Kontraktor" },
          { value: "perorangan", label: "Perorangan / Renovasi Rumah" },
        ],
      }) +
      "</div>" +
      "</div>" +
      '<div class="wf-grid-2">' +
      '<div class="wf-field">' +
      '<label for="f-pel-kontak" class="wf-label">Nomor Telepon / WhatsApp</label>' +
      '<input id="f-pel-kontak" name="kontak" type="text" class="wf-input" value="' +
      esc(p.kontak) +
      '" placeholder="Contoh: 0812-8877-6655" required />' +
      "</div>" +
      '<div class="wf-field">' +
      '<label for="f-pel-batas" class="wf-label">Batas Maksimal Kasbon (Rp)</label>' +
      '<input id="f-pel-batas" name="batas_kasbon" type="number" min="0" class="wf-input" value="' +
      esc(p.batas_kasbon) +
      '" required />' +
      "</div>" +
      "</div>" +
      '<div class="wf-field">' +
      '<label for="f-pel-alamat" class="wf-label">Alamat Lengkap Lokasi Proyek / Rumah</label>' +
      '<textarea id="f-pel-alamat" name="alamat" class="wf-textarea" placeholder="Masukkan alamat pengiriman lengkap..." required>' +
      esc(p.alamat) +
      "</textarea>" +
      "</div>" +
      '<div class="wf-field">' +
      '<label class="wf-label">Status Fasilitas Kasbon</label>' +
      customSelect({
        id: "f-pel-status",
        name: "status_kasbon",
        value: p.status_kasbon,
        options: [
          { value: "aktif", label: "Aktif (Dapat Mengajukan Kasbon)" },
          {
            value: "nonaktif",
            label: "Nonaktif (Hanya Pembelian Tunai / Non-Kasbon)",
          },
        ],
      }) +
      "</div>" +
      '<div style="display:flex;justify-content:flex-end;gap:10px;padding-top:16px;border-top:1px solid var(--wf-border);">' +
      '<button type="button" class="wf-btn" data-nav="data-pelanggan">Batal</button>' +
      '<button type="submit" class="wf-btn wf-btn-primary">' +
      icon("check", "wf-icon-sm") +
      "<span>Simpan Pelanggan</span></button>" +
      "</div>" +
      "</form></div></div>"
    );
  }

  // ==================== 6. HALAMAN DETAIL RIWAYAT TRANSAKSI & PIUTANG PELANGGAN ====================
  function renderDetailPelangganPage() {
    const params = window.WF.ui.pageParams || {};
    const p =
      window.WF.db.pelanggan.find(function (x) {
        return x.id_pelanggan === params.id_pelanggan;
      }) || window.WF.db.pelanggan[1];

    const trxList = window.WF.db.transaksi.filter(function (t) {
      return t.pelanggan_id === p.id_pelanggan;
    });
    const sisaLimit = Math.max(0, Number(p.batas_kasbon) - Number(p.sisa_piutang));

    return (
      window.WFUI.pageHeader(
        [
          { label: "Penjualan & Kasir" },
          { label: "Data Pelanggan", page: "data-pelanggan" },
          { label: "Riwayat Pelanggan" },
        ],
        p.nama,
        '<button type="button" class="wf-btn" data-nav="data-pelanggan">' +
          icon("arrow-left", "wf-icon-sm") +
          "<span>Kembali</span></button>" +
          '<button type="button" class="wf-btn wf-btn-primary" data-nav="kasbon-dan-piutang">Kelola Piutang</button>'
      ) +
      '<div class="wf-grid-stats">' +
      '<div class="wf-card wf-stat-card"><div class="wf-stat-label">Jenis &amp; Kontak</div><div style="font-weight:700;font-size:1.0625rem;text-transform:uppercase;">' +
      esc(p.jenis) +
      " &middot; " +
      esc(p.kontak) +
      "</div></div>" +
      '<div class="wf-card wf-stat-card"><div class="wf-stat-label">Batas Maksimal Kasbon</div><div class="wf-stat-value">' +
      window.WF.formatRupiah(p.batas_kasbon) +
      "</div></div>" +
      '<div class="wf-card wf-stat-card"><div class="wf-stat-label">Sisa Tagihan Piutang</div><div class="wf-stat-value">' +
      window.WF.formatRupiah(p.sisa_piutang) +
      "</div></div>" +
      '<div class="wf-card wf-stat-card"><div class="wf-stat-label">Kuota Kasbon Tersedia</div><div class="wf-stat-value">' +
      window.WF.formatRupiah(sisaLimit) +
      "</div></div>" +
      "</div>" +
      '<div class="wf-card" style="margin-top:20px;">' +
      '<div class="wf-card-header"><h2 class="wf-card-title">Daftar Nota Transaksi Pelanggan</h2></div>' +
      '<div class="wf-table-wrap"><table class="wf-table">' +
      "<thead><tr><th>No. Nota</th><th>Tanggal</th><th>Metode Bayar</th><th>Total Belanja</th><th>Sisa Tagihan</th><th>Status</th></tr></thead>" +
      "<tbody>" +
      (trxList.length === 0
        ? '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--wf-text-muted);">Belum ada riwayat transaksi untuk pelanggan ini.</td></tr>'
        : trxList
            .map(function (t) {
              return (
                "<tr>" +
                '<td class="wf-font-mono"><strong>' +
                esc(t.no_nota) +
                "</strong></td>" +
                "<td>" +
                esc(t.tanggal) +
                "</td>" +
                '<td style="text-transform:uppercase;">' +
                esc(t.jenis_pembayaran) +
                "</td>" +
                "<td>" +
                window.WF.formatRupiah(t.total) +
                "</td>" +
                "<td><strong>" +
                window.WF.formatRupiah(t.sisa_tagihan) +
                "</strong></td>" +
                "<td>" +
                window.WFUI.statusBadge(t.status_bayar) +
                "</td>" +
                "</tr>"
              );
            })
            .join("")) +
      "</tbody></table></div></div>"
    );
  }

  window.WFPagesMaster = {
    renderDataBarangPage: renderDataBarangPage,
    renderFormBarangPage: renderFormBarangPage,
    renderCetakBarcodePage: renderCetakBarcodePage,
    renderDataPelangganPage: renderDataPelangganPage,
    renderFormPelangganPage: renderFormPelangganPage,
    renderDetailPelangganPage: renderDetailPelangganPage,
  };
})();
