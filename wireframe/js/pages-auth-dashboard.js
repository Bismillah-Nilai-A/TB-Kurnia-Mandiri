/*
  Halaman Autentikasi (Login) & Halaman Dashboard Berdasarkan Role Aktor
  1. Login mengikuti tata letak 2 panel http://localhost:3000/login (LoginPage.tsx):
     - Panel kiri: Kurnia Mandiri., Masuk Akun, tab Pemilik/Kasir/Pengirim (tanpa auto-fill),
       input Username & Kata Sandi manual, tombol Masuk ke Sistem, footer © 2026 CV Kurnia Mandiri + tombol mode tampilan.
     - Panel kanan: Bingkai wireframe gambar dengan garis menyilang (X) dan ikon picture + caption CV Kurnia Mandiri / Toko Bahan Bangunan.
  2. Dashboard mengikuti tata letak DashboardPage.tsx aplikasi asli.
*/

(function () {
  const esc = window.WFUI.esc;
  const icon = window.WFUI.icon;

  function renderLoginPage() {
    const selectedRole = window.WF.ui.loginSelectedRole || "admin";
    const err = window.WF.ui.loginError || "";
    const isDark = window.WF.ui.skinMode === "dark";

    const roleTabs = [
      { id: "admin", label: "Pemilik", iconName: "shield" },
      { id: "kasir", label: "Kasir", iconName: "user-check" },
      { id: "pengirim", label: "Pengirim", iconName: "truck" },
    ];

    const tabsHtml = roleTabs
      .map(function (r) {
        const active = selectedRole === r.id;
        return (
          '<button type="button" class="wf-role-tab" data-select-login-role="' +
          esc(r.id) +
          '" aria-pressed="' +
          (active ? "true" : "false") +
          '">' +
          icon(r.iconName, "wf-icon-sm") +
          "<span>" +
          esc(r.label) +
          "</span>" +
          "</button>"
        );
      })
      .join("");

    return (
      '<main class="wf-login-stage">' +
      '<div class="wf-login-card">' +
      /* Panel Kiri (5 Kolom): Form Autentikasi */
      '<section class="wf-login-form-panel" aria-labelledby="wf-login-heading">' +
      "<div>" +
      '<div class="wf-brand-header">' +
      '<div class="wf-brand-wordmark">' +
      "<span>Kurnia Mandiri</span>" +
      '<span class="wf-brand-dot" aria-hidden="true"></span>' +
      "</div>" +
      "</div>" +
      '<h1 id="wf-login-heading" style="margin:20px 0 18px;font-size:1.625rem;font-weight:700;letter-spacing:-0.02em;">Masuk Akun</h1>' +
      '<form id="wf-login-form" class="wf-stack" novalidate>' +
      "<div>" +
      '<span id="wf-role-ctx-label" class="wf-sr-only">Pilih peran</span>' +
      '<div class="wf-role-tabs" role="group" aria-labelledby="wf-role-ctx-label">' +
      tabsHtml +
      "</div>" +
      "</div>" +
      (err
        ? '<div class="wf-alert" role="alert"><span style="display:inline-flex;align-items:center;gap:8px;">' +
          icon("alert", "wf-icon-sm") +
          "<span>" +
          esc(err) +
          "</span></span></div>"
        : "") +
      '<div class="wf-field">' +
      '<label for="wf-login-username" class="wf-label">Username</label>' +
      '<div class="wf-input-group">' +
      '<span class="wf-input-icon-left">' +
      icon("user", "wf-icon-sm") +
      "</span>" +
      '<input id="wf-login-username" name="username" type="text" class="wf-input wf-input-has-left" placeholder="Masukkan username" value="" autocomplete="off" required />' +
      "</div>" +
      "</div>" +
      '<div class="wf-field">' +
      '<label for="wf-login-password" class="wf-label">Kata Sandi</label>' +
      '<div class="wf-input-group">' +
      '<span class="wf-input-icon-left">' +
      icon("lock", "wf-icon-sm") +
      "</span>" +
      '<input id="wf-login-password" name="password" type="password" class="wf-input wf-input-has-left wf-input-has-right" placeholder="Masukkan kata sandi" value="" autocomplete="off" required />' +
      '<button type="button" class="wf-input-btn-right" data-action="toggle-login-password" aria-label="Tampilkan atau sembunyikan kata sandi">' +
      icon("eye", "wf-icon-sm") +
      "</button>" +
      "</div>" +
      "</div>" +
      '<button type="submit" class="wf-btn wf-btn-primary" style="width:100%;margin-top:4px;">' +
      icon("log-in", "wf-icon-sm") +
      "<span>Masuk ke Sistem</span>" +
      "</button>" +
      "</form>" +
      "</div>" +
      '<div style="margin-top:28px;padding-top:16px;border-top:1px solid var(--wf-border);display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:0.875rem;color:var(--wf-text-muted);">' +
      "<span>&copy; 2026 CV Kurnia Mandiri</span>" +
      '<button type="button" class="wf-icon-btn" style="border:1px solid var(--wf-border-input);background:var(--wf-surface-subtle);" data-action="toggle-skin-mode" aria-label="Ganti mode tampilan" title="' +
      (isDark ? "Mode Terang" : "Mode Gelap") +
      '">' +
      icon(isDark ? "sun" : "moon", "wf-icon-sm") +
      "</button>" +
      "</div>" +
      "</section>" +
      /* Panel Kanan (7 Kolom): Placeholder Gambar Wireframe (Garis Menyilang + Icon Picture) */
      '<aside class="wf-login-visual-panel" aria-label="CV Kurnia Mandiri">' +
      '<div class="wf-login-image-wireframe">' +
      '<svg class="wf-wireframe-cross" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' +
      '<line x1="0" y1="0" x2="100" y2="100" vector-effect="non-scaling-stroke"></line>' +
      '<line x1="100" y1="0" x2="0" y2="100" vector-effect="non-scaling-stroke"></line>' +
      "</svg>" +
      '<div class="wf-wireframe-image-badge" aria-label="Placeholder Gambar">' +
      icon("image", "wf-icon-lg") +
      "</div>" +
      "</div>" +
      '<div class="wf-login-caption">' +
      '<h2 style="margin:0;font-size:1rem;font-weight:600;color:var(--wf-text);">CV Kurnia Mandiri</h2>' +
      '<p style="margin:2px 0 0;font-size:0.875rem;color:var(--wf-text-muted);">Toko Bahan Bangunan</p>' +
      "</div>" +
      "</aside>" +
      "</div>" +
      "</main>"
    );
  }

  function renderDashboardPage() {
    const u = window.WF.ui.currentUser;
    const role = u ? u.role : "admin";
    const db = window.WF.db;

    const totalPenjualan = db.transaksi.reduce(function (acc, t) {
      return acc + (Number(t.total) || 0);
    }, 0);
    const stokMenipis = db.barang.filter(function (b) {
      return Number(b.stok) <= Number(b.stok_minimum);
    });
    const totalPiutang = db.pelanggan.reduce(function (acc, p) {
      return acc + (Number(p.sisa_piutang) || 0);
    }, 0);
    const kasbonMenunggu = db.kasbon.filter(function (k) {
      return k.status === "menunggu";
    });
    const totalUtangPemasok = db.tagihan_pemasok.reduce(function (acc, t) {
      return acc + (Number(t.sisa_tagihan) || 0);
    }, 0);

    // 1. DASHBOARD KARYAWAN LAPANGAN / PENGIRIM
    if (role === "pengirim") {
      const daftarKirim = db.pengiriman;
      const menungguMuat = daftarKirim.filter(function (k) {
        return k.status === "Menunggu Dikirim";
      }).length;
      const dalamPerjalanan = daftarKirim.filter(function (k) {
        return k.status === "Dalam Perjalanan";
      }).length;
      const selesaiKirim = daftarKirim.filter(function (k) {
        return k.status === "Selesai";
      }).length;

      return (
        window.WFUI.pageHeader(
          [{ label: "Utama" }, { label: "Dashboard" }],
          "Dashboard",
          '<button type="button" class="wf-btn" data-nav="dashboard">' +
            icon("refresh", "wf-icon-sm") +
            "<span>Muat Ulang</span></button>" +
            '<button type="button" class="wf-btn wf-btn-primary" data-nav="pengiriman-barang">' +
            icon("truck", "wf-icon-sm") +
            "<span>Daftar Penugasan</span></button>"
        ) +
        '<div class="wf-grid-stats">' +
        '<div class="wf-card wf-stat-card">' +
        '<div class="wf-stat-top"><span class="wf-stat-label">Total Penugasan</span><span class="wf-stat-icon">' +
        icon("truck") +
        "</span></div>" +
        '<div class="wf-stat-value">' +
        daftarKirim.length +
        " Pengiriman</div>" +
        '<div class="wf-stat-sub">Penugasan pengiriman hari ini</div>' +
        "</div>" +
        '<div class="wf-card wf-stat-card">' +
        '<div class="wf-stat-top"><span class="wf-stat-label">Menunggu Dikirim</span><span class="wf-stat-icon">' +
        icon("package") +
        "</span></div>" +
        '<div class="wf-stat-value">' +
        menungguMuat +
        " Tugas</div>" +
        '<div class="wf-stat-sub">Periksa kelengkapan di gudang</div>' +
        "</div>" +
        '<div class="wf-card wf-stat-card">' +
        '<div class="wf-stat-top"><span class="wf-stat-label">Dalam Perjalanan</span><span class="wf-stat-icon">' +
        icon("clock") +
        "</span></div>" +
        '<div class="wf-stat-value">' +
        dalamPerjalanan +
        " Armada</div>" +
        '<div class="wf-stat-sub">Menuju alamat pelanggan</div>' +
        "</div>" +
        '<div class="wf-card wf-stat-card">' +
        '<div class="wf-stat-top"><span class="wf-stat-label">Selesai</span><span class="wf-stat-icon">' +
        icon("check-circle") +
        "</span></div>" +
        '<div class="wf-stat-value">' +
        selesaiKirim +
        " Lokasi</div>" +
        '<div class="wf-stat-sub">Bukti serah terima tersimpan</div>' +
        "</div>" +
        "</div>" +
        '<div class="wf-card" style="margin-top:20px;">' +
        '<div class="wf-card-header">' +
        '<h2 class="wf-card-title">Penugasan Pengiriman Aktif</h2>' +
        '<button type="button" class="wf-btn wf-btn-sm" data-nav="pengiriman-barang"><span>Lihat Semua</span>' +
        icon("chevron-right", "wf-icon-sm") +
        "</button>" +
        "</div>" +
        '<div class="wf-table-wrap">' +
        '<table class="wf-table">' +
        '<thead><tr><th>No. Nota</th><th>Pemesan</th><th>Alamat Tujuan</th><th>Barang</th><th>Status</th><th class="wf-text-right">Aksi</th></tr></thead>' +
        "<tbody>" +
        daftarKirim
          .map(function (k) {
            return (
              "<tr>" +
              '<td class="wf-font-mono"><strong>' +
              esc(k.no_nota) +
              "</strong></td>" +
              "<td>" +
              esc(k.nama_pelanggan) +
              "</td>" +
              "<td>" +
              esc(k.alamat_tujuan) +
              "</td>" +
              "<td>" +
              esc(k.ringkasan_barang) +
              "</td>" +
              "<td>" +
              window.WFUI.statusBadge(k.status) +
              "</td>" +
              '<td class="wf-text-right">' +
              (k.status !== "Selesai"
                ? '<button type="button" class="wf-btn wf-btn-sm wf-btn-primary" data-action="buka-proses-pengiriman" data-id="' +
                  esc(k.id_pengiriman) +
                  '">Proses</button>'
                : '<span style="color:var(--wf-text-muted);font-size:0.8125rem;">Selesai</span>') +
              "</td>" +
              "</tr>"
            );
          })
          .join("") +
        "</tbody></table></div></div>"
      );
    }

    // 2. DASHBOARD PEMILIK / ADMIN & PEGAWAI TOKO (KASIR)
    const actionsHtml =
      '<button type="button" class="wf-btn" data-nav="dashboard">' +
      icon("refresh", "wf-icon-sm") +
      "<span>Muat Ulang</span></button>" +
      '<button type="button" class="wf-btn wf-btn-primary" data-nav="transaksi-penjualan">' +
      icon("plus", "wf-icon-sm") +
      "<span>Transaksi Baru</span></button>";

    const statCardFourth =
      role === "admin"
        ? '<div class="wf-card wf-stat-card">' +
          '<div class="wf-stat-top"><span class="wf-stat-label">Utang Tempo Pemasok</span><span class="wf-stat-icon">' +
          icon("package") +
          "</span></div>" +
          '<div class="wf-stat-value">' +
          window.WF.formatRupiah(totalUtangPemasok) +
          "</div>" +
          '<button type="button" class="wf-breadcrumb-link" data-nav="utang-pemasok"><span>Lihat Tagihan Pemasok</span>' +
          icon("chevron-right", "wf-icon-sm") +
          "</button>" +
          "</div>"
        : '<div class="wf-card wf-stat-card">' +
          '<div class="wf-stat-top"><span class="wf-stat-label">Jumlah Pelanggan</span><span class="wf-stat-icon">' +
          icon("users") +
          "</span></div>" +
          '<div class="wf-stat-value">' +
          db.pelanggan.length +
          " Pelanggan</div>" +
          '<button type="button" class="wf-breadcrumb-link" data-nav="data-pelanggan"><span>Kelola Pelanggan</span>' +
          icon("chevron-right", "wf-icon-sm") +
          "</button>" +
          "</div>";

    const rowsTransaksi = db.transaksi
      .slice(0, 6)
      .map(function (t) {
        return (
          "<tr>" +
          '<td class="wf-font-mono"><strong>' +
          esc(t.no_nota) +
          "</strong></td>" +
          "<td>" +
          esc(t.nama_pelanggan) +
          "</td>" +
          "<td>" +
          esc(t.tanggal) +
          "</td>" +
          '<td style="text-transform:uppercase;font-size:0.8125rem;font-weight:600;">' +
          esc(t.jenis_pembayaran) +
          "</td>" +
          "<td>" +
          window.WFUI.statusBadge(t.status_bayar) +
          "</td>" +
          '<td class="wf-text-right"><strong>' +
          window.WF.formatRupiah(t.total) +
          "</strong></td>" +
          "</tr>"
        );
      })
      .join("");

    const rowsStokMenipis = stokMenipis
      .map(function (b) {
        return (
          "<tr>" +
          '<td class="wf-font-mono">' +
          esc(b.kode_barang) +
          "</td>" +
          "<td><strong>" +
          esc(b.nama) +
          "</strong></td>" +
          "<td>" +
          b.stok +
          " " +
          esc(b.satuan_dasar) +
          ' <span style="color:var(--wf-text-muted);">(Min: ' +
          b.stok_minimum +
          ")</span></td>" +
          "<td>" +
          window.WFUI.statusBadge("menipis") +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    return (
      window.WFUI.pageHeader(
        [{ label: "Utama" }, { label: "Dashboard" }],
        "Dashboard",
        actionsHtml
      ) +
      '<div class="wf-grid-stats">' +
      '<div class="wf-card wf-stat-card">' +
      '<div class="wf-stat-top"><span class="wf-stat-label">Total Penjualan (' +
      db.transaksi.length +
      ' Nota)</span><span class="wf-stat-icon">' +
      icon("banknote") +
      "</span></div>" +
      '<div class="wf-stat-value">' +
      window.WF.formatRupiah(totalPenjualan) +
      "</div>" +
      '<button type="button" class="wf-breadcrumb-link" data-nav="riwayat-transaksi"><span>Lihat Rekap Penjualan</span>' +
      icon("chevron-right", "wf-icon-sm") +
      "</button>" +
      "</div>" +
      '<div class="wf-card wf-stat-card">' +
      '<div class="wf-stat-top"><span class="wf-stat-label">Stok Perlu Diisi</span><span class="wf-stat-icon">' +
      icon("alert") +
      "</span></div>" +
      '<div class="wf-stat-value">' +
      stokMenipis.length +
      " Barang</div>" +
      '<button type="button" class="wf-breadcrumb-link" data-nav="' +
      (role === "admin" ? "stok-dan-restok" : "barang-masuk-keluar") +
      '"><span>Lihat Stok Menipis</span>' +
      icon("chevron-right", "wf-icon-sm") +
      "</button>" +
      "</div>" +
      '<div class="wf-card wf-stat-card">' +
      '<div class="wf-stat-top"><span class="wf-stat-label">Piutang &amp; Kasbon (' +
      kasbonMenunggu.length +
      ' Menunggu)</span><span class="wf-stat-icon">' +
      icon("receipt") +
      "</span></div>" +
      '<div class="wf-stat-value">' +
      window.WF.formatRupiah(totalPiutang) +
      "</div>" +
      '<button type="button" class="wf-breadcrumb-link" data-nav="kasbon-dan-piutang"><span>Kelola Kasbon &amp; Piutang</span>' +
      icon("chevron-right", "wf-icon-sm") +
      "</button>" +
      "</div>" +
      statCardFourth +
      "</div>" +
      '<div class="wf-stack" style="margin-top:20px;">' +
      '<div class="wf-card">' +
      '<div class="wf-card-header">' +
      '<h2 class="wf-card-title">Transaksi Terakhir</h2>' +
      '<button type="button" class="wf-btn wf-btn-sm" data-nav="riwayat-transaksi"><span>Lihat Semua</span>' +
      icon("chevron-right", "wf-icon-sm") +
      "</button>" +
      "</div>" +
      '<div class="wf-table-wrap">' +
      '<table class="wf-table">' +
      '<thead><tr><th>No. Nota</th><th>Pelanggan</th><th>Waktu</th><th>Bayar</th><th>Status</th><th class="wf-text-right">Total</th></tr></thead>' +
      "<tbody>" +
      rowsTransaksi +
      "</tbody></table></div></div>" +
      '<div class="wf-card">' +
      '<div class="wf-card-header">' +
      '<h2 class="wf-card-title">Barang Hampir Habis</h2>' +
      '<button type="button" class="wf-btn wf-btn-sm" data-nav="' +
      (role === "admin" ? "stok-dan-restok" : "barang-masuk-keluar") +
      '"><span>Kelola Stok</span>' +
      icon("chevron-right", "wf-icon-sm") +
      "</button>" +
      "</div>" +
      '<div class="wf-table-wrap">' +
      '<table class="wf-table">' +
      "<thead><tr><th>Kode</th><th>Nama Barang</th><th>Sisa Stok</th><th>Status</th></tr></thead>" +
      "<tbody>" +
      (rowsStokMenipis ||
        '<tr><td colspan="4" style="text-align:center;color:var(--wf-text-muted);">Seluruh stok barang dalam kondisi aman.</td></tr>') +
      "</tbody></table></div></div>" +
      "</div>"
    );
  }

  window.WFPagesAuthDashboard = {
    renderLoginPage: renderLoginPage,
    renderDashboardPage: renderDashboardPage,
  };
})();
