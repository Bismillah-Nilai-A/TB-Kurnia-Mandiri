/*
  Halaman Pengiriman Lapangan & Sistem:
  1. Penugasan Pengiriman, Laporan Kendala (LaporanKendala), & Riwayat Pengiriman
  2. Halaman Form Proses Pengiriman Barang (Cek Kelengkapan -> Muat -> Serah Terima / Foto Bukti / Pengajuan Penukaran)
  3. Halaman Pengguna & Hak Akses + Halaman Form Tambah/Ubah Akun
  4. Halaman Log Aktivitas Sistem
  Menggunakan CustomSelect, ResponsiveTabs, dan SVG icon konsisten.
*/

(function () {
  const esc = window.WFUI.esc;
  const icon = window.WFUI.icon;
  const customSelect = window.WFUI.customSelect;
  const responsiveTabs = window.WFUI.responsiveTabs;

  // ==================== 1. HALAMAN PENGIRIMAN BARANG ====================
  function renderPengirimanBarangPage() {
    const db = window.WF.db;
    const f = window.WF.ui.filters;
    const u = window.WF.ui.currentUser;
    const role = u ? u.role : "admin";
    const rawTab = f.pengirimanTab || "penugasan";
    // Sesuai SRS (UC-21 vs UC-27): Kasir tidak memiliki tab Laporan Kendala, hanya Daftar Penugasan & Riwayat
    const tab =
      role === "kasir" && rawTab === "kendala" ? "penugasan" : rawTab;

    const tabOptions = [
      {
        value: "penugasan",
        label: "Daftar Penugasan (" + db.pengiriman.length + ")",
      },
    ];
    if (role !== "kasir") {
      tabOptions.push({
        value: "kendala",
        label: "Laporan Kendala (" + db.laporan_kendala.length + ")",
      });
    }
    tabOptions.push({
      value: "riwayat",
      label: "Riwayat & Bukti Penerimaan",
    });

    const tabsHtml = responsiveTabs({
      filterKey: "pengirimanTab",
      value: tab,
      options: tabOptions,
    });

    // TAB 2: LAPORAN KENDALA PENGIRIMAN
    if (tab === "kendala") {
      const rowsKendala = db.laporan_kendala
        .map(function (k) {
          return (
            "<tr>" +
            "<td>" +
            esc(k.created_at) +
            "</td>" +
            '<td class="wf-font-mono"><strong>' +
            esc(k.no_nota) +
            "</strong></td>" +
            "<td>" +
            esc(k.nama_pengirim) +
            "</td>" +
            "<td><strong>" +
            esc(k.jenis_kendala) +
            "</strong></td>" +
            "<td>" +
            esc(k.deskripsi) +
            "</td>" +
            "</tr>"
          );
        })
        .join("");

      return (
        window.WFUI.pageHeader(
          [
            { label: "Pengiriman Lapangan" },
            { label: "Penugasan & Proses Kirim" },
          ],
          "Penugasan & Proses Kirim"
        ) +
        tabsHtml +
        '<div class="wf-stack">' +
        (role === "pengirim"
          ? '<div class="wf-card">' +
            '<div class="wf-card-header"><h2 class="wf-card-title">Lapor Kendala Pengiriman</h2></div>' +
            '<div class="wf-card-body">' +
            '<form id="wf-form-kendala" class="wf-stack">' +
            '<div class="wf-grid-2">' +
            '<div class="wf-field">' +
            '<label class="wf-label">Penugasan Pengiriman</label>' +
            customSelect({
              id: "f-knd-krm",
              name: "pengiriman_id",
              value: db.pengiriman[0] ? db.pengiriman[0].id_pengiriman : "",
              options: db.pengiriman.map(function (p) {
                return {
                  value: p.id_pengiriman,
                  label:
                    p.no_nota + " - " + p.nama_pelanggan + " (" + p.status + ")",
                };
              }),
            }) +
            "</div>" +
            '<div class="wf-field">' +
            '<label class="wf-label">Jenis Kendala Lapangan</label>' +
            customSelect({
              id: "f-knd-jenis",
              name: "jenis_kendala",
              value: "Akses Jalan Sempit / Ditutup",
              options: [
                {
                  value: "Akses Jalan Sempit / Ditutup",
                  label: "Akses Jalan Sempit / Ditutup",
                },
                {
                  value: "Kendaraan Armada Mengalami Gangguan",
                  label: "Kendaraan Armada Mengalami Gangguan",
                },
                {
                  value: "Alamat Tujuan Tidak Ditemukan",
                  label: "Alamat Tujuan Tidak Ditemukan",
                },
                {
                  value: "Penerima Tidak Berada di Lokasi",
                  label: "Penerima Tidak Berada di Lokasi",
                },
                {
                  value: "Cuaca Buruk / Hujan Deras",
                  label: "Cuaca Buruk / Hujan Deras",
                },
              ],
            }) +
            "</div>" +
            "</div>" +
            '<div class="wf-field">' +
            '<label for="f-knd-desc" class="wf-label">Deskripsi Detail Kendala</label>' +
            '<textarea id="f-knd-desc" name="deskripsi" class="wf-textarea" placeholder="Jelaskan situasi di lapangan secara jelas..." required></textarea>' +
            "</div>" +
            '<div><button type="submit" class="wf-btn wf-btn-primary">' +
            icon("check", "wf-icon-sm") +
            "<span>Simpan Laporan Kendala</span></button></div>" +
            "</form></div></div>"
          : "") +
        '<div class="wf-card">' +
        '<div class="wf-card-header"><h2 class="wf-card-title">Riwayat Laporan Kendala</h2></div>' +
        '<div class="wf-table-wrap"><table class="wf-table">' +
        "<thead><tr><th>Waktu</th><th>No. Nota</th><th>Pengirim</th><th>Jenis Kendala</th><th>Deskripsi</th></tr></thead>" +
        "<tbody>" +
        rowsKendala +
        "</tbody></table></div></div>" +
        "</div>"
      );
    }

    // TAB 3: RIWAYAT & BUKTI PENERIMAAN PENGIRIMAN
    if (tab === "riwayat") {
      const selesaiList = db.pengiriman.filter(function (p) {
        return p.status === "Selesai" || p.status === "Ada Kendala";
      });
      const pgRiwayatKirim = window.WFUI.paginate(
        selesaiList,
        "riwayatKirim",
        4,
        [4, 8, 16],
        "pengiriman selesai"
      );

      return (
        window.WFUI.pageHeader(
          [
            { label: "Pengiriman Lapangan" },
            { label: "Penugasan & Proses Kirim" },
          ],
          "Penugasan & Proses Kirim"
        ) +
        tabsHtml +
        '<div class="wf-card">' +
        '<div class="wf-card-header"><h2 class="wf-card-title">Daftar Pengiriman Selesai &amp; Bukti Tanda Terima</h2></div>' +
        '<div class="wf-table-wrap"><table class="wf-table">' +
        "<thead><tr><th>No. Nota</th><th>Pelanggan &amp; Alamat</th><th>Pengirim</th><th>Waktu Terima</th><th>Bukti / Catatan</th><th>Status</th></tr></thead>" +
        "<tbody>" +
        pgRiwayatKirim.items
          .map(function (p) {
            return (
              "<tr>" +
              '<td class="wf-font-mono"><strong>' +
              esc(p.no_nota) +
              "</strong></td>" +
              "<td><strong>" +
              esc(p.nama_pelanggan) +
              '</strong><div style="font-size:0.75rem;color:var(--wf-text-muted);">' +
              esc(p.alamat_tujuan) +
              "</div></td>" +
              "<td>" +
              esc(p.nama_pengirim) +
              "</td>" +
              "<td>" +
              esc(p.tanggal_terima) +
              "</td>" +
              "<td>" +
              (p.foto_bukti_url
                ? '<button type="button" class="wf-btn wf-btn-sm" data-action="detail-penugasan-modal" data-id="' +
                  esc(p.id_pengiriman) +
                  '">' +
                  icon("image", "wf-icon-sm") +
                  "<span>" +
                  esc(p.foto_bukti_url) +
                  "</span></button>"
                : p.alasan_penukaran
                  ? "Pengajuan Penukaran: " + esc(p.alasan_penukaran)
                  : "-") +
              "</td>" +
              "<td>" +
              window.WFUI.statusBadge(p.status) +
              "</td>" +
              "</tr>"
            );
          })
          .join("") +
        "</tbody></table></div>" +
        pgRiwayatKirim.html +
        "</div>"
      );
    }

    // TAB 1: DAFTAR PENUGASAN PENGIRIMAN
    const filteredKirim = db.pengiriman.filter(function (p) {
      return f.pengirimanStatus === "SEMUA" || p.status === f.pengirimanStatus;
    });
    const pgKirim = window.WFUI.paginate(
      filteredKirim,
      "pengiriman",
      4,
      [4, 8, 16],
      "penugasan pengiriman"
    );

    const rowsKirim = pgKirim.items
      .map(function (p) {
        return (
          "<tr>" +
          '<td class="wf-font-mono"><strong>' +
          esc(p.no_nota) +
          '</strong><div style="font-size:0.75rem;color:var(--wf-text-muted);">' +
          esc(p.tanggal_penugasan) +
          "</div></td>" +
          "<td><strong>" +
          esc(p.nama_pelanggan) +
          '</strong><div style="font-size:0.75rem;color:var(--wf-text-muted);">' +
          esc(p.kontak_pelanggan) +
          "</div></td>" +
          "<td>" +
          esc(p.alamat_tujuan) +
          "</td>" +
          "<td>" +
          esc(p.ringkasan_barang) +
          "</td>" +
          "<td><strong>" +
          esc(p.nama_pengirim) +
          "</strong></td>" +
          "<td>" +
          window.WFUI.statusBadge(p.status) +
          "</td>" +
          '<td class="wf-text-right" style="white-space:nowrap;">' +
          (role === "pengirim"
            ? p.status !== "Selesai"
              ? '<button type="button" class="wf-btn wf-btn-sm wf-btn-primary" data-action="buka-proses-pengiriman" data-id="' +
                esc(p.id_pengiriman) +
                '">Proses</button>'
              : '<span style="color:var(--wf-text-muted);font-size:0.8125rem;">Selesai</span>'
            : '<button type="button" class="wf-btn wf-btn-sm" data-action="detail-penugasan-modal" data-id="' +
              esc(p.id_pengiriman) +
              '">Detail</button>') +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    return (
      window.WFUI.pageHeader(
        [
          { label: "Pengiriman Lapangan" },
          { label: "Penugasan & Proses Kirim" },
        ],
        "Penugasan & Proses Kirim",
        role === "kasir"
          ? '<button type="button" class="wf-btn wf-btn-primary" data-action="open-tambah-penugasan">' +
            icon("plus", "wf-icon-sm") +
            "<span>Buat Penugasan</span></button>"
          : ""
      ) +
      tabsHtml +
      '<div class="wf-card">' +
      '<div class="wf-card-header">' +
      '<h2 class="wf-card-title">Daftar Penugasan Pengiriman</h2>' +
      customSelect({
        id: "wf-filter-krm-st",
        value: f.pengirimanStatus,
        filter: "pengirimanStatus",
        width: "240px",
        size: "sm",
        options: [
          { value: "SEMUA", label: "Semua Status Pengiriman" },
          { value: "Menunggu Dikirim", label: "Menunggu Dikirim" },
          { value: "Dalam Perjalanan", label: "Dalam Perjalanan" },
          { value: "Selesai", label: "Selesai" },
          { value: "Ada Kendala", label: "Ada Kendala" },
        ],
      }) +
      "</div>" +
      '<div class="wf-table-wrap"><table class="wf-table">' +
      '<thead><tr><th>No. Nota &amp; Waktu</th><th>Pelanggan</th><th>Alamat Tujuan</th><th>Daftar Barang</th><th>Pengirim</th><th>Status</th><th class="wf-text-right">Aksi</th></tr></thead>' +
      "<tbody>" +
      rowsKirim +
      "</tbody></table></div>" +
      pgKirim.html +
      "</div>"
    );
  }

  // ==================== 2. HALAMAN FORM PROSES PENGIRIMAN BARANG ====================
  function renderFormProsesPengirimanPage() {
    const params = window.WF.ui.pageParams || {};
    const k =
      window.WF.db.pengiriman.find(function (x) {
        return x.id_pengiriman === params.id_pengiriman;
      }) || window.WF.db.pengiriman[0];

    return (
      window.WFUI.pageHeader(
        [
          { label: "Pengiriman Lapangan" },
          { label: "Penugasan & Proses Kirim", page: "pengiriman-barang" },
          { label: "Proses Pengiriman" },
        ],
        "Proses Pengiriman",
        '<button type="button" class="wf-btn" data-nav="pengiriman-barang">' +
          icon("arrow-left", "wf-icon-sm") +
          "<span>Kembali</span></button>"
      ) +
      '<div class="wf-stack">' +
      '<div class="wf-card">' +
      '<div class="wf-card-header"><h2 class="wf-card-title">Detail Penugasan Pengiriman</h2>' +
      window.WFUI.statusBadge(k.status) +
      "</div>" +
      '<div class="wf-card-body wf-grid-2" style="font-size:0.875rem;">' +
      '<div class="wf-stack" style="gap:8px;">' +
      "<div><span style=\"color:var(--wf-text-muted);\">Nomor Nota:</span> <strong>" +
      esc(k.no_nota) +
      "</strong></div>" +
      "<div><span style=\"color:var(--wf-text-muted);\">Pemesan:</span> <strong>" +
      esc(k.nama_pelanggan) +
      "</strong> (" +
      esc(k.kontak_pelanggan) +
      ")</div>" +
      "<div><span style=\"color:var(--wf-text-muted);\">Alamat Tujuan:</span> " +
      esc(k.alamat_tujuan) +
      "</div>" +
      "</div>" +
      '<div class="wf-stack" style="gap:8px;">' +
      "<div><span style=\"color:var(--wf-text-muted);\">Petugas Pengirim:</span> <strong>" +
      esc(k.nama_pengirim) +
      "</strong></div>" +
      "<div><span style=\"color:var(--wf-text-muted);\">Rincian Barang:</span> " +
      esc(k.ringkasan_barang) +
      "</div>" +
      "</div>" +
      "</div></div>" +
      '<div class="wf-grid-2">' +
      /* Tahap 1: Pemeriksaan Kelengkapan & Muat ke Kendaraan */
      '<div class="wf-card">' +
      '<div class="wf-card-header"><h2 class="wf-card-title">1. Pemeriksaan &amp; Muat Kendaraan</h2></div>' +
      '<div class="wf-card-body wf-stack">' +
      '<p style="margin:0;font-size:0.875rem;color:var(--wf-text-secondary);">Periksa kelengkapan barang di gudang sebelum dimuat ke kendaraan armada.</p>' +
      '<button type="button" class="wf-btn wf-btn-primary" data-action="kirim-muat-kendaraan" data-id="' +
      esc(k.id_pengiriman) +
      '">' +
      icon("truck", "wf-icon-sm") +
      "<span>Barang Lengkap, Muat ke Kendaraan</span></button>" +
      '<button type="button" class="wf-btn" data-action="kirim-lapor-tidak-lengkap" data-id="' +
      esc(k.id_pengiriman) +
      '">' +
      icon("alert", "wf-icon-sm") +
      "<span>Laporkan Barang Tidak Lengkap</span></button>" +
      "</div></div>" +
      /* Tahap 2: Penyerahan Barang di Lokasi Pelanggan */
      '<div class="wf-card">' +
      '<div class="wf-card-header"><h2 class="wf-card-title">2. Serah Terima di Lokasi Pelanggan</h2></div>' +
      '<div class="wf-card-body wf-stack">' +
      '<form id="wf-form-bukti-kirim" class="wf-stack" data-id="' +
      esc(k.id_pengiriman) +
      '">' +
      '<div class="wf-field">' +
      '<label for="f-krm-bukti-file" class="wf-label">Bukti Foto Penerimaan &amp; Tanda Terima</label>' +
      '<div class="wf-upload-box">' +
      '<div class="wf-upload-preview">' +
      '<svg class="wf-wireframe-cross" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' +
      '<line x1="0" y1="0" x2="100" y2="100" vector-effect="non-scaling-stroke"></line>' +
      '<line x1="100" y1="0" x2="0" y2="100" vector-effect="non-scaling-stroke"></line>' +
      "</svg>" +
      '<div class="wf-upload-preview-badge">' +
      icon("camera", "wf-icon-md") +
      "</div>" +
      '<div id="f-krm-bukti-preview-text" class="wf-upload-preview-caption">' +
      esc(
        k.foto_bukti_url ||
          "bukti-serah-terima-" + k.no_nota.toLowerCase() + ".jpg"
      ) +
      "</div>" +
      "</div>" +
      '<div class="wf-upload-footer">' +
      '<div class="wf-upload-meta">' +
      '<div id="f-krm-bukti-filename" class="wf-upload-filename">' +
      esc(
        k.foto_bukti_url ||
          "bukti-serah-terima-" + k.no_nota.toLowerCase() + ".jpg"
      ) +
      "</div>" +
      '<div class="wf-upload-hint">JPG / PNG (Maks. 5 MB) &middot; Bukti serah terima lapangan</div>' +
      "</div>" +
      '<label for="f-krm-bukti-file" class="wf-btn wf-btn-sm" style="cursor:pointer;">' +
      icon("upload", "wf-icon-sm") +
      "<span>Pilih / Unggah Foto</span></label>" +
      '<input id="f-krm-bukti-file" type="file" accept="image/*" class="wf-sr-only" data-action="kirim-pilih-foto" />' +
      '<input id="f-krm-bukti" name="foto_bukti_url" type="hidden" value="' +
      esc(
        k.foto_bukti_url ||
          "bukti-serah-terima-" + k.no_nota.toLowerCase() + ".jpg"
      ) +
      '" />' +
      "</div>" +
      "</div>" +
      "</div>" +
      '<button type="submit" class="wf-btn wf-btn-primary">' +
      icon("check", "wf-icon-sm") +
      "<span>Selesaikan Pengiriman (Selesai)</span></button>" +
      "</form>" +
      '<div class="wf-section-divider">' +
      '<form id="wf-form-tukar-kirim" class="wf-stack" data-id="' +
      esc(k.id_pengiriman) +
      '">' +
      '<div class="wf-field">' +
      '<label for="f-krm-tukar" class="wf-label">Pengajuan Penukaran dari Pelanggan (Jika Tidak Sesuai)</label>' +
      '<input id="f-krm-tukar" name="alasan_penukaran" type="text" class="wf-input" placeholder="Alasan penukaran & kondisi barang..." required />' +
      "</div>" +
      '<button type="submit" class="wf-btn">Catat Pengajuan Penukaran</button>' +
      "</form></div>" +
      "</div></div>" +
      "</div></div>"
    );
  }

  // ==================== 3. HALAMAN PENGGUNA & HAK AKSES (PEMILIK) ====================
  function renderPenggunaDanHakAksesPage() {
    const db = window.WF.db;

    const pgPengguna = window.WFUI.paginate(
      db.pengguna,
      "pengguna",
      5,
      [5, 10, 25],
      "pengguna"
    );

    const rowsHtml = pgPengguna.items
      .map(function (u) {
        return (
          "<tr>" +
          "<td><strong>" +
          esc(u.nama) +
          "</strong></td>" +
          '<td class="wf-font-mono">' +
          esc(u.username) +
          "</td>" +
          "<td>" +
          esc(window.WF.ROLE_LABELS[u.role]) +
          "</td>" +
          "<td>" +
          window.WFUI.statusBadge(u.status) +
          "</td>" +
          "<td>" +
          esc(u.created_at) +
          "</td>" +
          '<td class="wf-text-right" style="white-space:nowrap;">' +
          '<button type="button" class="wf-btn wf-btn-sm" data-action="edit-pengguna" data-id="' +
          esc(u.id_pengguna) +
          '">' +
          icon("edit", "wf-icon-sm") +
          "<span>Ubah</span></button> " +
          '<button type="button" class="wf-btn wf-btn-sm" data-action="reset-password-pengguna" data-id="' +
          esc(u.id_pengguna) +
          '">Reset Sandi</button> ' +
          (u.username !== "admin"
            ? '<button type="button" class="wf-btn wf-btn-sm" data-action="toggle-status-pengguna" data-id="' +
              esc(u.id_pengguna) +
              '">' +
              (u.status === "aktif" ? "Nonaktifkan" : "Aktifkan") +
              "</button>"
            : "") +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    return (
      window.WFUI.pageHeader(
        [{ label: "Sistem & Audit" }, { label: "Pengguna & Hak Akses" }],
        "Pengguna & Hak Akses",
        '<button type="button" class="wf-btn wf-btn-primary" data-action="open-add-pengguna">' +
          icon("plus", "wf-icon-sm") +
          "<span>Tambah Pengguna</span></button>"
      ) +
      '<div class="wf-card">' +
      '<div class="wf-card-header"><h2 class="wf-card-title">Daftar Akun Pengguna</h2></div>' +
      '<div class="wf-table-wrap"><table class="wf-table">' +
      '<thead><tr><th>Nama Lengkap</th><th>Username</th><th>Peran &amp; Hak Akses</th><th>Status</th><th>Terdaftar</th><th class="wf-text-right">Aksi</th></tr></thead>' +
      "<tbody>" +
      rowsHtml +
      "</tbody></table></div>" +
      pgPengguna.html +
      "</div>"
    );
  }

  function renderFormPenggunaPage() {
    const params = window.WF.ui.pageParams || {};
    const editId = params.id_pengguna;
    const existing = editId
      ? window.WF.db.pengguna.find(function (u) {
          return u.id_pengguna === editId;
        })
      : null;
    const isEdit = Boolean(existing);
    const u = existing || {
      nama: "",
      username: "",
      role: "kasir",
      status: "aktif",
    };

    return (
      window.WFUI.pageHeader(
        [
          { label: "Sistem & Audit" },
          { label: "Pengguna & Hak Akses", page: "pengguna-dan-hak-akses" },
          { label: isEdit ? "Ubah Pengguna" : "Tambah Pengguna" },
        ],
        isEdit ? "Ubah Pengguna" : "Tambah Pengguna",
        '<button type="button" class="wf-btn" data-nav="pengguna-dan-hak-akses">' +
          icon("arrow-left", "wf-icon-sm") +
          "<span>Kembali</span></button>"
      ) +
      '<div class="wf-card">' +
      '<div class="wf-card-header"><h2 class="wf-card-title">Data Akun &amp; Penetapan Peran</h2></div>' +
      '<div class="wf-card-body">' +
      '<form id="wf-form-pengguna" class="wf-stack" data-edit-id="' +
      esc(editId || "") +
      '">' +
      '<div class="wf-field">' +
      '<label for="f-usr-nama" class="wf-label">Nama Lengkap Pegawai</label>' +
      '<input id="f-usr-nama" name="nama" type="text" class="wf-input" value="' +
      esc(u.nama) +
      '" placeholder="Contoh: Rina Amelia (Kasir 2)" required />' +
      "</div>" +
      '<div class="wf-grid-2">' +
      '<div class="wf-field">' +
      '<label for="f-usr-uname" class="wf-label">Username Login</label>' +
      '<input id="f-usr-uname" name="username" type="text" class="wf-input" value="' +
      esc(u.username) +
      '" required />' +
      "</div>" +
      '<div class="wf-field">' +
      '<label for="f-usr-pass" class="wf-label">Kata Sandi ' +
      (isEdit ? "(Kosongkan jika tetap)" : "Awal") +
      "</label>" +
      '<input id="f-usr-pass" name="password" type="password" class="wf-input" placeholder="Masukkan kata sandi..." ' +
      (isEdit ? "" : "required") +
      " />" +
      "</div></div>" +
      '<div class="wf-grid-2">' +
      '<div class="wf-field">' +
      '<label class="wf-label">Peran &amp; Hak Akses</label>' +
      customSelect({
        id: "f-usr-role",
        name: "role",
        value: u.role,
        options: [
          {
            value: "admin",
            label: "Pemilik / Admin (Akses Seluruh Fitur)",
          },
          {
            value: "kasir",
            label: "Pegawai Toko / Kasir (Akses Fitur Kasir)",
          },
          {
            value: "pengirim",
            label: "Karyawan Lapangan / Pengirim (Akses Fitur Pengiriman)",
          },
        ],
      }) +
      "</div>" +
      '<div class="wf-field">' +
      '<label class="wf-label">Status Akun</label>' +
      customSelect({
        id: "f-usr-status",
        name: "status",
        value: u.status,
        options: [
          { value: "aktif", label: "Aktif" },
          { value: "nonaktif", label: "Nonaktif" },
        ],
      }) +
      "</div></div>" +
      '<div style="display:flex;justify-content:flex-end;gap:10px;padding-top:16px;border-top:1px solid var(--wf-border);">' +
      '<button type="button" class="wf-btn" data-nav="pengguna-dan-hak-akses">Batal</button>' +
      '<button type="submit" class="wf-btn wf-btn-primary">' +
      icon("check", "wf-icon-sm") +
      "<span>Simpan Akun</span></button>" +
      "</div>" +
      "</form></div></div>"
    );
  }

  // ==================== 4. HALAMAN LOG AKTIVITAS SISTEM (PEMILIK) ====================
  function renderLogAktivitasPage() {
    const db = window.WF.db;
    const f = window.WF.ui.filters;
    const q = (f.logSearch || "").trim().toLowerCase();

    const filtered = db.log_aktivitas.filter(function (l) {
      const mR = f.logRole === "SEMUA" || l.peran === f.logRole;
      const mQ =
        !q ||
        l.nama_pengguna.toLowerCase().indexOf(q) !== -1 ||
        l.modul.toLowerCase().indexOf(q) !== -1 ||
        l.aktivitas.toLowerCase().indexOf(q) !== -1;
      return mR && mQ;
    });

    const pgLogs = window.WFUI.paginate(
      filtered,
      "logAktivitas",
      5,
      [5, 10, 25],
      "log aktivitas"
    );

    const rowsHtml = pgLogs.items
      .map(function (l) {
        return (
          "<tr>" +
          "<td>" +
          esc(l.waktu) +
          "</td>" +
          "<td><strong>" +
          esc(l.nama_pengguna) +
          "</strong></td>" +
          '<td><span class="wf-badge wf-badge-muted">' +
          esc(l.peran) +
          "</span></td>" +
          "<td>" +
          esc(l.modul) +
          "</td>" +
          "<td>" +
          esc(l.aktivitas) +
          "</td>" +
          '<td class="wf-text-right">' +
          '<button type="button" class="wf-btn wf-btn-sm" data-action="detail-log-modal" data-id="' +
          esc(l.id_log) +
          '">Detail</button>' +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    return (
      window.WFUI.pageHeader(
        [{ label: "Sistem & Audit" }, { label: "Log Aktivitas Sistem" }],
        "Log Aktivitas Sistem",
        '<button type="button" class="wf-btn" data-action="unduh-log-aktivitas">' +
          icon("download", "wf-icon-sm") +
          "<span>Unduh Log</span></button>"
      ) +
      '<div class="wf-card">' +
      '<div class="wf-card-header">' +
      '<div class="wf-filter-bar">' +
      '<div class="wf-filter-search">' +
      '<label for="wf-log-q" class="wf-sr-only">Cari Log</label>' +
      '<div class="wf-input-group">' +
      '<span class="wf-input-icon-left">' +
      icon("search", "wf-icon-sm") +
      "</span>" +
      '<input id="wf-log-q" type="text" class="wf-input wf-input-has-left" placeholder="Cari pengguna, modul, atau aktivitas..." value="' +
      esc(f.logSearch) +
      '" data-filter="logSearch" />' +
      "</div>" +
      "</div>" +
      '<div class="wf-filter-select">' +
      customSelect({
        id: "wf-log-role",
        value: f.logRole,
        filter: "logRole",
        options: [
          { value: "SEMUA", label: "Semua Peran" },
          { value: "Pemilik", label: "Pemilik / Admin" },
          { value: "Kasir", label: "Kasir" },
          { value: "Pengirim", label: "Pengirim" },
        ],
      }) +
      "</div></div></div>" +
      '<div class="wf-table-wrap"><table class="wf-table">' +
      '<thead><tr><th>Waktu</th><th>Pengguna</th><th>Peran</th><th>Modul</th><th>Aktivitas</th><th class="wf-text-right">Detail</th></tr></thead>' +
      "<tbody>" +
      rowsHtml +
      "</tbody></table></div>" +
      pgLogs.html +
      "</div>"
    );
  }

  window.WFPagesPengirimanSistem = {
    renderPengirimanBarangPage: renderPengirimanBarangPage,
    renderFormProsesPengirimanPage: renderFormProsesPengirimanPage,
    renderPenggunaDanHakAksesPage: renderPenggunaDanHakAksesPage,
    renderFormPenggunaPage: renderFormPenggunaPage,
    renderLogAktivitasPage: renderLogAktivitasPage,
  };
})();
