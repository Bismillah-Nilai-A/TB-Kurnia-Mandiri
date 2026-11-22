/*
  Halaman Transaksi Penjualan (POS), Riwayat Transaksi & Rekap Penjualan,
  Penukaran Barang + Form Proses Penukaran, serta Kasbon & Pembayaran Piutang.
  Mengacu langsung pada tata letak KatalogPos.tsx, KeranjangPos.tsx, dan PiutangPage.tsx.
*/

(function () {
  const esc = window.WFUI.esc;
  const icon = window.WFUI.icon;
  const customSelect = window.WFUI.customSelect;
  const responsiveTabs = window.WFUI.responsiveTabs;

  // ==================== 1. HALAMAN TRANSAKSI PENJUALAN (POS KASIR) ====================
  function renderTransaksiPenjualanPage() {
    const db = window.WF.db;
    const pos = window.WF.ui.pos;
    const q = (pos.search || "").trim().toLowerCase();

    const kategoriSet = ["SEMUA"];
    db.barang.forEach(function (b) {
      if (kategoriSet.indexOf(b.kategori) === -1) kategoriSet.push(b.kategori);
    });

    const filteredBarang = db.barang.filter(function (b) {
      const mKat = pos.kategori === "SEMUA" || b.kategori === pos.kategori;
      const mQ =
        !q ||
        b.nama.toLowerCase().indexOf(q) !== -1 ||
        b.kode_barang.toLowerCase().indexOf(q) !== -1 ||
        b.barcode.toLowerCase().indexOf(q) !== -1;
      return mKat && mQ;
    });

    const katalogHtml = filteredBarang
      .map(function (b) {
        const satUtama = (b.satuan_barang && b.satuan_barang[0]) || {
          id_satuan_barang: "def",
          nama_satuan: b.satuan_dasar,
          harga_jual_awal: b.harga_modal * 1.3,
        };
        const stokHabis = Number(b.stok) <= 0;

        return (
          '<div class="wf-pos-item' +
          (stokHabis ? " is-empty" : "") +
          '">' +
          "<div>" +
          '<div class="wf-flex-between">' +
          '<span class="wf-font-mono" style="font-size:0.75rem;color:var(--wf-text-muted);">' +
          esc(b.kode_barang) +
          "</span>" +
          '<span style="font-size:0.75rem;font-weight:600;color:var(--wf-text-secondary);">Stok: ' +
          b.stok +
          " " +
          esc(b.satuan_dasar) +
          "</span>" +
          "</div>" +
          '<div style="font-weight:600;margin-top:4px;font-size:0.9375rem;">' +
          esc(b.nama) +
          "</div>" +
          '<div style="font-size:0.8125rem;color:var(--wf-text-secondary);margin-top:4px;">' +
          "<strong>" +
          window.WF.formatRupiah(satUtama.harga_jual_awal) +
          "</strong> / " +
          esc(satUtama.nama_satuan) +
          "</div>" +
          "</div>" +
          '<button type="button" class="wf-btn wf-btn-sm' +
          (stokHabis ? "" : " wf-btn-primary") +
          '" style="width:100%;" data-action="pos-add-item" data-id="' +
          esc(b.id_barang) +
          '" ' +
          (stokHabis ? "disabled" : "") +
          ">" +
          (stokHabis
            ? "Stok Habis"
            : icon("plus", "wf-icon-sm") + "<span>Tambah</span>") +
          "</button>" +
          "</div>"
        );
      })
      .join("");

    let cartTotal = 0;
    let hasInvalidNego = false;

    const cartItemsHtml = pos.cart
      .map(function (c, idx) {
        const b = db.barang.find(function (x) {
          return x.id_barang === c.barang_id;
        });
        if (!b) return "";

        const satuanList = b.satuan_barang || [];
        const selectedSat =
          satuanList.find(function (s) {
            return s.id_satuan_barang === c.satuan_barang_id;
          }) || satuanList[0];

        const hargaAwal = Number(selectedSat.harga_jual_awal) || 0;
        const hargaModalSatuan =
          Number(selectedSat.harga_modal) || Number(b.harga_modal);
        const hasNego = String(c.harga_nego_input || "").trim() !== "";
        const hargaNego = hasNego ? Number(c.harga_nego_input) : hargaAwal;

        const isBelowModal = hasNego && hargaNego <= hargaModalSatuan;
        if (isBelowModal) hasInvalidNego = true;

        const hargaDipakai = hasNego ? hargaNego : hargaAwal;
        const subtotal = hargaDipakai * Number(c.jumlah);
        cartTotal += subtotal;

        return (
          '<div class="wf-cart-item">' +
          '<div class="wf-flex-between">' +
          '<strong style="font-size:0.875rem;">' +
          esc(b.nama) +
          "</strong>" +
          '<button type="button" class="wf-icon-btn" style="width:28px;height:28px;" data-action="pos-remove-item" data-idx="' +
          idx +
          '" aria-label="Hapus item">' +
          icon("trash", "wf-icon-sm") +
          "</button>" +
          "</div>" +
          '<div class="wf-grid-2" style="margin-top:8px;">' +
          '<div class="wf-field">' +
          '<label class="wf-label" style="font-size:0.75rem;">Satuan</label>' +
          customSelect({
            id: "pos-sat-" + idx,
            value: selectedSat.id_satuan_barang,
            action: "pos-change-satuan",
            idx: idx,
            size: "sm",
            options: satuanList.map(function (s) {
              return {
                value: s.id_satuan_barang,
                label:
                  s.nama_satuan +
                  " (" +
                  window.WF.formatRupiah(s.harga_jual_awal) +
                  ")",
              };
            }),
          }) +
          "</div>" +
          '<div class="wf-field">' +
          '<label class="wf-label" style="font-size:0.75rem;" for="pos-qty-' +
          idx +
          '">Jumlah</label>' +
          '<input id="pos-qty-' +
          idx +
          '" type="number" min="1" class="wf-input wf-input-sm" value="' +
          esc(c.jumlah) +
          '" data-action="pos-change-qty" data-idx="' +
          idx +
          '" />' +
          "</div>" +
          "</div>" +
          '<div class="wf-flex-between" style="margin-top:8px;">' +
          '<label for="pos-nego-' +
          idx +
          '" style="font-size:0.75rem;color:var(--wf-text-secondary);">Harga Nego (Modal ' +
          window.WF.formatRupiah(hargaModalSatuan) +
          "):</label>" +
          '<input id="pos-nego-' +
          idx +
          '" type="number" class="wf-input wf-input-sm" style="width:140px;" placeholder="' +
          esc(hargaAwal) +
          '" value="' +
          esc(c.harga_nego_input) +
          '" data-action="pos-change-nego" data-idx="' +
          idx +
          '" />' +
          "</div>" +
          (isBelowModal
            ? '<div style="margin-top:6px;padding:6px 10px;background:var(--wf-surface-alt);border:1px solid var(--wf-border-strong);font-size:0.75rem;font-weight:600;border-radius:4px;">Penawaran ditolak: harga tawar harus di atas Harga Modal (' +
              window.WF.formatRupiah(hargaModalSatuan) +
              ").</div>"
            : "") +
          '<div style="text-align:right;font-weight:700;font-size:0.875rem;margin-top:6px;">' +
          window.WF.formatRupiah(subtotal) +
          "</div>" +
          "</div>"
        );
      })
      .join("");

    const selectedPelanggan =
      db.pelanggan.find(function (p) {
        return p.id_pelanggan === pos.pelanggan_id;
      }) || db.pelanggan[0];

    const sisaLimitKasbon = Math.max(
      0,
      Number(selectedPelanggan.batas_kasbon) -
        Number(selectedPelanggan.sisa_piutang)
    );
    const isKasbonOverLimit =
      pos.jenis_pembayaran === "kasbon" &&
      (selectedPelanggan.status_kasbon !== "aktif" ||
        cartTotal > sisaLimitKasbon);

    return (
      window.WFUI.pageHeader(
        [{ label: "Penjualan & Kasir" }, { label: "Transaksi Kasir" }],
        "Transaksi Kasir (POS)",
        '<button type="button" class="wf-btn" data-action="pos-simulasi-scan">' +
          icon("barcode", "wf-icon-sm") +
          "<span>Pindai Barcode</span></button>" +
          '<button type="button" class="wf-btn" data-nav="riwayat-transaksi">Riwayat Transaksi</button>'
      ) +
      '<div class="wf-grid-pos">' +
      /* Panel Kiri: Katalog Produk (Sama tinggi dengan Keranjang & memiliki TablePagination di bagian bawah) */
      '<div class="wf-card">' +
      '<div class="wf-card-header">' +
      '<h2 class="wf-card-title">Pilih Barang</h2>' +
      '<span style="font-size:0.8125rem;font-weight:600;color:var(--wf-text-muted);">' +
      filteredBarang.length +
      " Barang</span>" +
      "</div>" +
      '<div class="wf-card-body wf-stack">' +
      '<div class="wf-pos-filter-grid">' +
      '<div class="wf-field">' +
      '<label for="pos-search-input" class="wf-sr-only">Cari Barang</label>' +
      '<div class="wf-input-group">' +
      '<span class="wf-input-icon-left">' +
      icon("search", "wf-icon-sm") +
      "</span>" +
      '<input id="pos-search-input" type="text" class="wf-input wf-input-has-left" placeholder="Cari nama, kode (A001), atau barcode..." value="' +
      esc(pos.search) +
      '" data-pos-input="search" />' +
      "</div>" +
      "</div>" +
      '<div class="wf-field">' +
      customSelect({
        id: "pos-kat-select",
        value: pos.kategori,
        posInput: "kategori",
        options: kategoriSet.map(function (k) {
          return {
            value: k,
            label: k === "SEMUA" ? "Semua Kategori" : k,
          };
        }),
      }) +
      "</div>" +
      "</div>" +
      '<div class="wf-pos-catalog-scroll">' +
      '<div class="wf-pos-catalog-grid">' +
      katalogHtml +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>" +
      /* Panel Kanan: Keranjang Belanja & Pembayaran */
      '<div class="wf-card">' +
      '<div class="wf-card-header">' +
      '<h2 class="wf-card-title">Keranjang Belanja</h2>' +
      '<span class="wf-badge wf-badge-dark">' +
      pos.cart.length +
      " Barang</span>" +
      "</div>" +
      '<div class="wf-card-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:16px;">' +
      '<div class="wf-stack">' +
      (pos.cart.length === 0
        ? '<div style="padding:24px 0;text-align:center;color:var(--wf-text-muted);font-size:0.875rem;">Keranjang masih kosong. Pilih barang dari katalog di kiri.</div>'
        : '<div class="wf-cart-list">' + cartItemsHtml + "</div>") +
      '<div class="wf-field">' +
      '<label class="wf-label">Pelanggan</label>' +
      customSelect({
        id: "pos-pelanggan",
        value: pos.pelanggan_id,
        posInput: "pelanggan_id",
        options: db.pelanggan.map(function (p) {
          return {
            value: p.id_pelanggan,
            label:
              p.nama +
              " (Limit: " +
              window.WF.formatRupiah(
                Math.max(0, Number(p.batas_kasbon) - Number(p.sisa_piutang))
              ) +
              ")",
          };
        }),
      }) +
      "</div>" +
      '<div class="wf-field">' +
      '<span class="wf-label">Metode Pembayaran</span>' +
      '<div class="wf-grid-2">' +
      ["tunai", "qris", "va", "kasbon"]
        .map(function (m) {
          const labels = {
            tunai: "Tunai",
            qris: "QRIS",
            va: "Virtual Account",
            kasbon: "Kasbon",
          };
          const active = pos.jenis_pembayaran === m;
          return (
            '<button type="button" class="wf-btn wf-btn-sm ' +
            (active ? "wf-btn-primary" : "") +
            '" data-action="pos-set-metode" data-metode="' +
            m +
            '">' +
            esc(labels[m]) +
            "</button>"
          );
        })
        .join("") +
      "</div></div>" +
      (pos.jenis_pembayaran === "tunai"
        ? '<div class="wf-field">' +
          '<label for="pos-uang-diterima" class="wf-label">Uang Diterima (Rp)</label>' +
          '<input id="pos-uang-diterima" type="number" class="wf-input" placeholder="' +
          cartTotal +
          '" value="' +
          esc(pos.uang_diterima) +
          '" data-pos-input="uang_diterima" />' +
          "</div>"
        : "") +
      (pos.jenis_pembayaran === "kasbon"
        ? '<div class="wf-subtle-panel" style="font-size:0.8125rem;">' +
          "<div>Kuota Kasbon Tersedia: <strong>" +
          window.WF.formatRupiah(sisaLimitKasbon) +
          "</strong></div>" +
          (isKasbonOverLimit
            ? '<div style="margin-top:4px;font-weight:600;">Kuota kasbon pelanggan tidak mencukupi. Pilih pelanggan proyek terdaftar.</div>'
            : '<div style="margin-top:4px;color:var(--wf-text-secondary);">Mengirim permintaan persetujuan kasbon ke Pemilik.</div>') +
          "</div>"
        : "") +
      '<div class="wf-section-divider">' +
      '<label style="display:flex;align-items:center;gap:8px;font-size:0.875rem;font-weight:600;">' +
      '<input type="checkbox" ' +
      (pos.perlu_dikirim ? "checked" : "") +
      ' data-action="pos-toggle-kirim" style="width:16px;height:16px;" />' +
      "<span>Kirim Barang ke Alamat Pelanggan</span>" +
      "</label>" +
      (pos.perlu_dikirim
        ? '<div class="wf-stack" style="margin-top:12px;">' +
          '<div class="wf-field">' +
          '<label class="wf-label" style="font-size:0.8125rem;">Petugas Pengirim</label>' +
          customSelect({
            id: "pos-pengirim",
            value: pos.pengirim_id,
            posInput: "pengirim_id",
            options: db.pengguna
              .filter(function (u) {
                return u.role === "pengirim";
              })
              .map(function (u) {
                return { value: u.id_pengguna, label: u.nama };
              }),
          }) +
          "</div>" +
          '<div class="wf-field">' +
          '<label for="pos-alamat-kirim" class="wf-label" style="font-size:0.8125rem;">Alamat Tujuan</label>' +
          '<input id="pos-alamat-kirim" type="text" class="wf-input" placeholder="Alamat lokasi pengiriman..." value="' +
          esc(pos.alamat_kirim || selectedPelanggan.alamat) +
          '" data-pos-input="alamat_kirim" />' +
          "</div></div>"
        : "") +
      "</div>" +
      "</div>" +
      '<div class="wf-stack" style="margin-top:auto;">' +
      '<div class="wf-flex-between" style="padding-top:12px;border-top:1px solid var(--wf-border);">' +
      '<span style="font-weight:600;color:var(--wf-text-secondary);">Total Tagihan</span>' +
      '<span style="font-size:1.375rem;font-weight:700;">' +
      window.WF.formatRupiah(cartTotal) +
      "</span>" +
      "</div>" +
      '<button type="button" class="wf-btn wf-btn-primary" style="width:100%;" data-action="pos-submit-checkout" ' +
      (pos.cart.length === 0 || hasInvalidNego || isKasbonOverLimit
        ? "disabled"
        : "") +
      ">" +
      icon("printer", "wf-icon-sm") +
      "<span>" +
      (pos.jenis_pembayaran === "kasbon"
        ? "Ajukan Kasbon & Simpan Nota"
        : "Proses Pembayaran & Cetak Struk") +
      "</span>" +
      "</button>" +
      "</div></div></div></div>"
    );
  }

  // ==================== 2. HALAMAN RIWAYAT TRANSAKSI & REKAP PENJUALAN ====================
  function renderRiwayatTransaksiPage() {
    const db = window.WF.db;
    const f = window.WF.ui.filters;
    const role = window.WF.ui.currentUser
      ? window.WF.ui.currentUser.role
      : "admin";
    const q = (f.riwayatSearch || "").trim().toLowerCase();

    const filtered = db.transaksi.filter(function (t) {
      const mS =
        f.riwayatStatus === "SEMUA" || t.status_bayar === f.riwayatStatus;
      const mQ =
        !q ||
        t.no_nota.toLowerCase().indexOf(q) !== -1 ||
        t.nama_pelanggan.toLowerCase().indexOf(q) !== -1;
      return mS && mQ;
    });

    const totalOmzet = filtered.reduce(function (a, t) {
      return a + (Number(t.total) || 0);
    }, 0);
    const totalPiutangNota = filtered.reduce(function (a, t) {
      return a + (Number(t.sisa_tagihan) || 0);
    }, 0);

    const pgRiwayat = window.WFUI.paginate(
      filtered,
      "riwayat",
      5,
      [5, 10, 25],
      "nota transaksi"
    );

    const rowsHtml = pgRiwayat.items
      .map(function (t) {
        const adaNego = (t.items || []).some(function (it) {
          return Number(it.harga_nego) < Number(it.harga_awal);
        });
        return (
          "<tr>" +
          '<td class="wf-font-mono"><strong>' +
          esc(t.no_nota) +
          "</strong></td>" +
          "<td>" +
          esc(t.tanggal) +
          "</td>" +
          "<td><strong>" +
          esc(t.nama_pelanggan) +
          "</strong></td>" +
          '<td style="text-transform:uppercase;font-size:0.8125rem;font-weight:600;">' +
          esc(t.jenis_pembayaran) +
          (adaNego
            ? ' <span class="wf-badge wf-badge-muted">Nego</span>'
            : "") +
          "</td>" +
          "<td><strong>" +
          window.WF.formatRupiah(t.total) +
          "</strong></td>" +
          "<td>" +
          window.WF.formatRupiah(t.sisa_tagihan) +
          "</td>" +
          "<td>" +
          window.WFUI.statusBadge(t.status_bayar) +
          "</td>" +
          '<td class="wf-text-right" style="white-space:nowrap;">' +
          '<button type="button" class="wf-btn wf-btn-sm" data-action="cetak-ulang-struk" data-id="' +
          esc(t.id_transaksi) +
          '">' +
          icon("printer", "wf-icon-sm") +
          "<span>Struk</span></button>" +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    return (
      window.WFUI.pageHeader(
        [{ label: "Penjualan & Kasir" }, { label: "Riwayat & Rekap Penjualan" }],
        "Riwayat & Rekap Penjualan",
        (role === "admin"
          ? '<button type="button" class="wf-btn" data-action="unduh-rekap-penjualan">' +
            icon("download", "wf-icon-sm") +
            "<span>Unduh Rekap</span></button>"
          : "") +
          '<button type="button" class="wf-btn wf-btn-primary" data-nav="transaksi-penjualan">' +
          icon("plus", "wf-icon-sm") +
          "<span>Transaksi Baru</span></button>"
      ) +
      '<div class="wf-grid-stats" style="margin-bottom:20px;">' +
      '<div class="wf-card wf-stat-card"><div class="wf-stat-label">Total Rekap Penjualan</div><div class="wf-stat-value">' +
      window.WF.formatRupiah(totalOmzet) +
      "</div></div>" +
      '<div class="wf-card wf-stat-card"><div class="wf-stat-label">Sisa Piutang Nota</div><div class="wf-stat-value">' +
      window.WF.formatRupiah(totalPiutangNota) +
      "</div></div>" +
      '<div class="wf-card wf-stat-card"><div class="wf-stat-label">Transaksi Harga Nego</div><div class="wf-stat-value">' +
      db.transaksi.filter(function (t) {
        return (t.items || []).some(function (i) {
          return i.harga_nego < i.harga_awal;
        });
      }).length +
      " Nota</div></div>" +
      '<div class="wf-card wf-stat-card"><div class="wf-stat-label">Penukaran Barang</div><div class="wf-stat-value">' +
      db.penukaran.length +
      " Transaksi</div></div>" +
      "</div>" +
      '<div class="wf-card">' +
      '<div class="wf-card-header">' +
      '<div class="wf-filter-bar">' +
      '<div class="wf-filter-search">' +
      '<label for="wf-rw-q" class="wf-sr-only">Cari Nota</label>' +
      '<div class="wf-input-group">' +
      '<span class="wf-input-icon-left">' +
      icon("search", "wf-icon-sm") +
      "</span>" +
      '<input id="wf-rw-q" type="text" class="wf-input wf-input-has-left" placeholder="Cari nomor nota (INV-...) atau nama pelanggan..." value="' +
      esc(f.riwayatSearch) +
      '" data-filter="riwayatSearch" />' +
      "</div>" +
      "</div>" +
      '<div class="wf-filter-select">' +
      customSelect({
        id: "wf-rw-st",
        value: f.riwayatStatus,
        filter: "riwayatStatus",
        options: [
          { value: "SEMUA", label: "Semua Status Bayar" },
          { value: "lunas", label: "Lunas" },
          { value: "belum_lunas", label: "Belum Lunas (Kasbon)" },
          { value: "sebagian", label: "Bayar Sebagian" },
        ],
      }) +
      "</div>" +
      "</div></div>" +
      '<div class="wf-table-wrap"><table class="wf-table">' +
      '<thead><tr><th>No. Nota</th><th>Tanggal</th><th>Pelanggan</th><th>Pembayaran</th><th>Total</th><th>Sisa Tagihan</th><th>Status</th><th class="wf-text-right">Aksi</th></tr></thead>' +
      "<tbody>" +
      rowsHtml +
      "</tbody></table></div>" +
      pgRiwayat.html +
      "</div>"
    );
  }

  // ==================== 3. HALAMAN PENUKARAN BARANG & FORM PROSES PENUKARAN ====================
  function renderPenukaranBarangPage() {
    const db = window.WF.db;
    const pgPenukaran = window.WFUI.paginate(
      db.penukaran,
      "penukaran",
      5,
      [5, 10, 25],
      "penukaran"
    );

    const rowsHtml = pgPenukaran.items
      .map(function (p) {
        return (
          "<tr>" +
          '<td class="wf-font-mono"><strong>' +
          esc(p.no_nota) +
          "</strong></td>" +
          "<td>" +
          esc(p.nama_pelanggan) +
          "</td>" +
          "<td>" +
          esc(p.barang_asal) +
          '<div style="font-size:0.75rem;color:var(--wf-text-muted);">Kondisi: ' +
          esc(p.kondisi_barang) +
          "</div></td>" +
          "<td>" +
          esc(p.barang_pengganti) +
          "</td>" +
          "<td>" +
          esc(p.alasan_penukaran) +
          "</td>" +
          "<td>" +
          window.WF.formatRupiah(p.selisih_harga) +
          "</td>" +
          "<td>" +
          window.WFUI.statusBadge(p.status) +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    return (
      window.WFUI.pageHeader(
        [{ label: "Penjualan & Kasir" }, { label: "Penukaran Barang" }],
        "Penukaran Barang",
        '<button type="button" class="wf-btn wf-btn-primary" data-nav="form-penukaran-barang">' +
          icon("plus", "wf-icon-sm") +
          "<span>Proses Penukaran</span></button>"
      ) +
      '<div class="wf-card">' +
      '<div class="wf-card-header"><h2 class="wf-card-title">Daftar Riwayat &amp; Pengajuan Penukaran Barang</h2></div>' +
      '<div class="wf-table-wrap"><table class="wf-table">' +
      "<thead><tr><th>No. Nota Asal</th><th>Pelanggan</th><th>Barang Dikembalikan</th><th>Barang Pengganti</th><th>Alasan Penukaran</th><th>Selisih Harga</th><th>Status</th></tr></thead>" +
      "<tbody>" +
      rowsHtml +
      "</tbody></table></div>" +
      pgPenukaran.html +
      "</div>"
    );
  }

  function renderFormPenukaranBarangPage() {
    const db = window.WF.db;

    return (
      window.WFUI.pageHeader(
        [
          { label: "Penjualan & Kasir" },
          { label: "Penukaran Barang", page: "penukaran-barang" },
          { label: "Form Penukaran Barang" },
        ],
        "Proses Penukaran Barang",
        '<button type="button" class="wf-btn" data-nav="penukaran-barang">' +
          icon("arrow-left", "wf-icon-sm") +
          "<span>Kembali</span></button>"
      ) +
      '<div class="wf-card">' +
      '<div class="wf-card-header"><h2 class="wf-card-title">Pemeriksaan Ketentuan Toko, Kondisi Barang, &amp; Selisih Harga</h2></div>' +
      '<div class="wf-card-body">' +
      '<form id="wf-form-penukaran" class="wf-stack">' +
      '<div class="wf-grid-2">' +
      '<div class="wf-field">' +
      '<label class="wf-label">Nomor Nota Transaksi Asal</label>' +
      customSelect({
        id: "f-pnk-nota",
        name: "transaksi_id",
        value: db.transaksi[0] ? db.transaksi[0].id_transaksi : "",
        options: db.transaksi.map(function (t) {
          return {
            value: t.id_transaksi,
            label:
              t.no_nota + " - " + t.nama_pelanggan + " (" + t.tanggal + ")",
          };
        }),
      }) +
      "</div>" +
      '<div class="wf-field">' +
      '<label class="wf-label">Kondisi Barang yang Dikembalikan</label>' +
      customSelect({
        id: "f-pnk-kondisi",
        name: "kondisi_barang",
        value: "Layak Jual",
        options: [
          {
            value: "Layak Jual",
            label: "Layak Jual (Menambah Kembali Stok Gudang)",
          },
          {
            value: "Rusak",
            label: "Rusak / Cacat (Dicatat sebagai Barang Rusak)",
          },
        ],
      }) +
      "</div>" +
      "</div>" +
      '<div class="wf-grid-2">' +
      '<div class="wf-field">' +
      '<label for="f-pnk-asal" class="wf-label">Barang &amp; Jumlah yang Dikembalikan</label>' +
      '<input id="f-pnk-asal" name="barang_asal" type="text" class="wf-input" placeholder="Contoh: Semen Tiga Roda PCC 50 Kg (2 Sak)" required />' +
      "</div>" +
      '<div class="wf-field">' +
      '<label class="wf-label">Pilih Barang Pengganti</label>' +
      customSelect({
        id: "f-pnk-ganti",
        name: "barang_pengganti_id",
        value: db.barang[0] ? db.barang[0].id_barang : "",
        options: db.barang.map(function (b) {
          return {
            value: b.id_barang,
            label:
              b.nama + " (Stok: " + b.stok + " " + b.satuan_dasar + ")",
          };
        }),
      }) +
      "</div>" +
      "</div>" +
      '<div class="wf-grid-2">' +
      '<div class="wf-field">' +
      '<label for="f-pnk-qty" class="wf-label">Jumlah Barang Pengganti</label>' +
      '<input id="f-pnk-qty" name="jumlah_pengganti" type="number" min="1" class="wf-input" value="2" required />' +
      "</div>" +
      '<div class="wf-field">' +
      '<label for="f-pnk-selisih" class="wf-label">Selisih Harga Dibayar Pelanggan (Rp)</label>' +
      '<input id="f-pnk-selisih" name="selisih_harga" type="number" min="0" class="wf-input" value="0" />' +
      "</div>" +
      "</div>" +
      '<div class="wf-field">' +
      '<label for="f-pnk-alasan" class="wf-label">Alasan Pengajuan Penukaran</label>' +
      '<textarea id="f-pnk-alasan" name="alasan_penukaran" class="wf-textarea" placeholder="Jelaskan alasan penukaran dan kondisi fisik barang..." required></textarea>' +
      "</div>" +
      '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;padding-top:16px;border-top:1px solid var(--wf-border);">' +
      '<button type="button" class="wf-btn" data-action="tolak-penukaran-form">' +
      icon("x", "wf-icon-sm") +
      "<span>Tolak Penukaran</span></button>" +
      '<div style="display:flex;gap:8px;">' +
      '<button type="button" class="wf-btn" data-nav="penukaran-barang">Batal</button>' +
      '<button type="submit" class="wf-btn wf-btn-primary">' +
      icon("check", "wf-icon-sm") +
      "<span>Simpan &amp; Cetak Struk</span></button>" +
      "</div></div>" +
      "</form></div></div>"
    );
  }

  // ==================== 4. HALAMAN KASBON & PEMBAYARAN PIUTANG ====================
  function renderKasbonDanPiutangPage() {
    const db = window.WF.db;
    const f = window.WF.ui.filters;
    const role = window.WF.ui.currentUser
      ? window.WF.ui.currentUser.role
      : "admin";
    const tab = f.kasbonTab || "piutang";

    const piutangNotas = db.transaksi.filter(function (t) {
      return Number(t.sisa_tagihan) > 0;
    });
    const menungguCount = db.kasbon.filter(function (k) {
      return k.status === "menunggu";
    }).length;

    const tabsHtml = responsiveTabs({
      filterKey: "kasbonTab",
      value: tab,
      options: [
        {
          value: "piutang",
          label: "Tagihan Piutang (" + piutangNotas.length + ")",
        },
        {
          value: "persetujuan",
          label: "Persetujuan Kasbon (" + menungguCount + " Menunggu)",
        },
      ],
    });

    if (tab === "persetujuan") {
      const pgKasbon = window.WFUI.paginate(
        db.kasbon,
        "kasbon",
        5,
        [5, 10, 25],
        "pengajuan kasbon"
      );
      const rowsKasbon = pgKasbon.items
        .map(function (k) {
          return (
            "<tr>" +
            '<td class="wf-font-mono"><strong>' +
            esc(k.no_nota) +
            "</strong></td>" +
            "<td><strong>" +
            esc(k.nama_pelanggan) +
            "</strong></td>" +
            "<td>" +
            esc(k.tanggal_pengajuan) +
            "</td>" +
            "<td><strong>" +
            window.WF.formatRupiah(k.jumlah_kasbon) +
            "</strong></td>" +
            "<td>" +
            window.WF.formatRupiah(k.batas_kasbon) +
            "</td>" +
            "<td>" +
            window.WFUI.statusBadge(k.status) +
            (k.alasan_penolakan
              ? '<div style="font-size:0.75rem;color:var(--wf-text-muted);margin-top:4px;">Alasan: ' +
                esc(k.alasan_penolakan) +
                "</div>"
              : "") +
            "</td>" +
            '<td class="wf-text-right" style="white-space:nowrap;">' +
            (role === "admin" && k.status === "menunggu"
              ? '<button type="button" class="wf-btn wf-btn-sm wf-btn-primary" data-action="approve-kasbon" data-id="' +
                esc(k.id_kasbon) +
                '">' +
                icon("check", "wf-icon-sm") +
                "<span>Setujui</span></button> " +
                '<button type="button" class="wf-btn wf-btn-sm" data-action="open-reject-kasbon" data-id="' +
                esc(k.id_kasbon) +
                '">' +
                icon("x", "wf-icon-sm") +
                "<span>Tolak</span></button>"
              : '<span style="font-size:0.8125rem;color:var(--wf-text-muted);">' +
                (k.status === "menunggu"
                  ? "Menunggu Pemilik"
                  : "Selesai Diproses") +
                "</span>") +
            "</td>" +
            "</tr>"
          );
        })
        .join("");

      return (
        window.WFUI.pageHeader(
          [
            { label: "Penjualan & Kasir" },
            { label: "Kasbon & Pembayaran Piutang" },
          ],
          "Kasbon & Pembayaran Piutang"
        ) +
        tabsHtml +
        '<div class="wf-card">' +
        '<div class="wf-card-header"><h2 class="wf-card-title">Daftar Permintaan Persetujuan Kasbon</h2></div>' +
        '<div class="wf-table-wrap"><table class="wf-table">' +
        '<thead><tr><th>No. Nota</th><th>Pelanggan</th><th>Waktu Pengajuan</th><th>Nominal Kasbon</th><th>Batas Kasbon</th><th>Status</th><th class="wf-text-right">Aksi</th></tr></thead>' +
        "<tbody>" +
        rowsKasbon +
        "</tbody></table></div>" +
        pgKasbon.html +
        "</div>"
      );
    }

    const pgPiutang = window.WFUI.paginate(
      piutangNotas,
      "piutang",
      5,
      [5, 10, 25],
      "tagihan piutang"
    );

    const rowsPiutang = pgPiutang.items
      .map(function (t) {
        return (
          "<tr>" +
          '<td class="wf-font-mono"><strong>' +
          esc(t.no_nota) +
          "</strong></td>" +
          "<td><strong>" +
          esc(t.nama_pelanggan) +
          "</strong></td>" +
          "<td>" +
          esc(t.tanggal) +
          "</td>" +
          "<td>" +
          window.WF.formatRupiah(t.total) +
          "</td>" +
          "<td>" +
          window.WF.formatRupiah(t.jumlah_dibayar) +
          "</td>" +
          "<td><strong>" +
          window.WF.formatRupiah(t.sisa_tagihan) +
          "</strong></td>" +
          "<td>" +
          window.WFUI.statusBadge(t.status_bayar) +
          "</td>" +
          '<td class="wf-text-right">' +
          '<button type="button" class="wf-btn wf-btn-sm wf-btn-primary" data-action="open-bayar-piutang" data-id="' +
          esc(t.id_transaksi) +
          '">Terima Pembayaran</button>' +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    return (
      window.WFUI.pageHeader(
        [
          { label: "Penjualan & Kasir" },
          { label: "Kasbon & Pembayaran Piutang" },
        ],
        "Kasbon & Pembayaran Piutang"
      ) +
      tabsHtml +
      '<div class="wf-card">' +
      '<div class="wf-card-header"><h2 class="wf-card-title">Daftar Tagihan Piutang Pelanggan</h2></div>' +
      '<div class="wf-table-wrap"><table class="wf-table">' +
      '<thead><tr><th>No. Nota</th><th>Pelanggan</th><th>Tanggal Nota</th><th>Total Tagihan</th><th>Sudah Dibayar</th><th>Sisa Tagihan</th><th>Status</th><th class="wf-text-right">Aksi</th></tr></thead>' +
      "<tbody>" +
      (rowsPiutang ||
        '<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--wf-text-muted);">Seluruh tagihan piutang pelanggan telah lunas.</td></tr>') +
      "</tbody></table></div>" +
      pgPiutang.html +
      "</div>"
    );
  }

  window.WFPagesTransaksiKasbon = {
    renderTransaksiPenjualanPage: renderTransaksiPenjualanPage,
    renderRiwayatTransaksiPage: renderRiwayatTransaksiPage,
    renderPenukaranBarangPage: renderPenukaranBarangPage,
    renderFormPenukaranBarangPage: renderFormPenukaranBarangPage,
    renderKasbonDanPiutangPage: renderKasbonDanPiutangPage,
  };
})();
