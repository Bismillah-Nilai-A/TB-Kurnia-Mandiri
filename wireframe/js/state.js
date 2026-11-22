/*
  State Management & Hak Akses Prototype Wireframe TB Kurnia Mandiri
  Seluruh perubahan disimpan di memori browser selama sesi prototype (tanpa koneksi database).
*/

(function () {
  const STORAGE_KEY = "tbkm_wireframe_prototype_state_v3";

  function cloneInitialData() {
    return JSON.parse(JSON.stringify(window.WF_INITIAL_DATA));
  }

  function loadStore() {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // Abaikan jika sessionStorage dibatasi browser
    }
    return cloneInitialData();
  }

  function saveStore() {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(window.WF.db));
    } catch (e) {
      // Abaikan
    }
  }

  // Struktur menu berdasarkan analisis Use Case Diagram terbaru
  // Pemilik: akses semua fitur Pemilik + Kasir + Pengirim
  // Kasir: hanya akses fitur Kasir
  // Pengirim: hanya akses fitur Pengirim
  const MENU_GROUPS = [
    {
      label: "Utama",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          page: "dashboard",
          roles: ["admin", "kasir", "pengirim"],
        },
      ],
    },
    {
      label: "Penjualan & Kasir",
      items: [
        {
          id: "grup-penjualan",
          label: "Penjualan & POS",
          roles: ["admin", "kasir"],
          children: [
            {
              page: "transaksi-penjualan",
              label: "Transaksi Penjualan (POS)",
              roles: ["admin", "kasir"],
            },
            {
              page: "riwayat-transaksi",
              label: "Riwayat & Rekap Penjualan",
              roles: ["admin", "kasir"],
            },
            {
              page: "penukaran-barang",
              label: "Penukaran Barang",
              roles: ["admin", "kasir"],
            },
          ],
        },
        {
          id: "grup-piutang",
          label: "Pelanggan & Kasbon",
          roles: ["admin", "kasir"],
          children: [
            {
              page: "data-pelanggan",
              label: "Data Pelanggan",
              roles: ["admin", "kasir"],
            },
            {
              page: "kasbon-dan-piutang",
              label: "Kasbon & Pembayaran Piutang",
              roles: ["admin", "kasir"],
            },
          ],
        },
      ],
    },
    {
      label: "Persediaan & Pemasok",
      items: [
        {
          id: "grup-persediaan",
          label: "Barang & Gudang",
          roles: ["admin", "kasir"],
          children: [
            {
              page: "data-barang",
              label: "Data Barang & Barcode",
              roles: ["admin"],
            },
            {
              page: "barang-masuk-keluar",
              label: "Barang Masuk & Keluar",
              roles: ["admin", "kasir"],
            },
            {
              page: "stok-dan-restok",
              label: "Stok Minimum & Restok",
              roles: ["admin"],
            },
            {
              page: "utang-pemasok",
              label: "Utang & Tempo Pemasok",
              roles: ["admin"],
            },
          ],
        },
      ],
    },
    {
      label: "Pengiriman Lapangan",
      items: [
        {
          id: "grup-pengiriman",
          label: "Operasional Pengiriman",
          roles: ["admin", "kasir", "pengirim"],
          children: [
            {
              page: "pengiriman-barang",
              label: "Penugasan & Proses Kirim",
              roles: ["admin", "kasir", "pengirim"],
            },
          ],
        },
      ],
    },
    {
      label: "Sistem & Audit",
      items: [
        {
          id: "grup-sistem",
          label: "Manajemen Sistem",
          roles: ["admin"],
          children: [
            {
              page: "pengguna-dan-hak-akses",
              label: "Pengguna & Hak Akses",
              roles: ["admin"],
            },
            {
              page: "log-aktivitas",
              label: "Log Aktivitas Sistem",
              roles: ["admin"],
            },
          ],
        },
      ],
    },
  ];

  // Pemetaan hak akses halaman per role (termasuk sub-halaman form/detail)
  const PAGE_ACCESS = {
    login: ["admin", "kasir", "pengirim"],
    dashboard: ["admin", "kasir", "pengirim"],
    "transaksi-penjualan": ["admin", "kasir"],
    "riwayat-transaksi": ["admin", "kasir"],
    "penukaran-barang": ["admin", "kasir"],
    "form-penukaran-barang": ["admin", "kasir"],
    "data-pelanggan": ["admin", "kasir"],
    "form-pelanggan": ["admin", "kasir"],
    "detail-pelanggan": ["admin", "kasir"],
    "kasbon-dan-piutang": ["admin", "kasir"],
    "data-barang": ["admin"],
    "form-barang": ["admin"],
    "cetak-barcode": ["admin"],
    "barang-masuk-keluar": ["admin", "kasir"],
    "form-mutasi-barang": ["admin", "kasir"],
    "stok-dan-restok": ["admin"],
    "utang-pemasok": ["admin"],
    "form-tagihan-pemasok": ["admin"],
    "pengiriman-barang": ["admin", "kasir", "pengirim"],
    "form-proses-pengiriman": ["admin", "pengirim"],
    "pengguna-dan-hak-akses": ["admin"],
    "form-pengguna": ["admin"],
    "log-aktivitas": ["admin"],
  };

  const ROLE_LABELS = {
    admin: "Pemilik / Admin",
    kasir: "Pegawai Toko (Kasir)",
    pengirim: "Karyawan Lapangan (Pengirim)",
  };

  window.WF = {
    db: loadStore(),
    MENU_GROUPS: MENU_GROUPS,
    PAGE_ACCESS: PAGE_ACCESS,
    ROLE_LABELS: ROLE_LABELS,

    ui: {
      currentUser: null, // null = halaman login
      currentPage: "login",
      pageParams: {},
      loginSelectedRole: "admin", // Tab aktif pada halaman login (tanpa auto-fill input)
      loginError: "",
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      openGroups: {
        Utama: true,
        "Penjualan & Kasir": true,
        "Persediaan & Pemasok": true,
        "Pengiriman Lapangan": true,
        "Sistem & Audit": true,
      },
      openSubMenus: {
        "grup-penjualan": true,
        "grup-piutang": true,
        "grup-persediaan": true,
        "grup-pengiriman": true,
        "grup-sistem": true,
      },
      headerSearch: "",
      headerSearchOpen: false,
      notifDropdownOpen: false,
      skinDropdownOpen: false,
      profileDropdownOpen: false,
      skinMode: "light", // light | dark
      sidebarSkin: "default", // default | prime | dark
      textSize: "sedang", // kecil | sedang | besar
      openSelectId: null,
      flashMessage: "",
      modal: null, // { title, bodyHtml, onConfirm, confirmLabel }
      receiptModal: null, // { title, lines }

      // State halaman Transaksi POS
      pos: {
        search: "",
        kategori: "SEMUA",
        cart: [
          {
            barang_id: "brg-01",
            satuan_barang_id: "sat-01a",
            jumlah: 2,
            harga_nego_input: "",
          },
        ],
        pelanggan_id: "pel-01",
        jenis_pembayaran: "tunai",
        uang_diterima: "",
        perlu_dikirim: false,
        alamat_kirim: "",
        pengirim_id: "usr-03",
      },

      // State paginasi untuk seluruh tabel & katalog POS (mengacu TablePagination aplikasi utama)
      pagination: {
        posKatalog: { page: 1, pageSize: 6 },
        barang: { page: 1, pageSize: 5 },
        pelanggan: { page: 1, pageSize: 5 },
        riwayat: { page: 1, pageSize: 5 },
        penukaran: { page: 1, pageSize: 5 },
        piutang: { page: 1, pageSize: 5 },
        kasbon: { page: 1, pageSize: 5 },
        stokBarang: { page: 1, pageSize: 5 },
        mutasi: { page: 1, pageSize: 5 },
        stokMin: { page: 1, pageSize: 5 },
        restok: { page: 1, pageSize: 5 },
        utangPemasok: { page: 1, pageSize: 5 },
        pengiriman: { page: 1, pageSize: 4 },
        kendala: { page: 1, pageSize: 4 },
        riwayatKirim: { page: 1, pageSize: 4 },
        pengguna: { page: 1, pageSize: 5 },
        logAktivitas: { page: 1, pageSize: 5 },
      },

      // Filter per halaman
      filters: {
        barangSearch: "",
        barangKategori: "SEMUA",
        barangPage: 1,
        pelangganSearch: "",
        pelangganJenis: "SEMUA",
        kasbonTab: "piutang", // piutang | persetujuan
        piutangSearch: "",
        mutasiJenis: "SEMUA",
        restokTab: "hampir-habis",
        pemasokStatus: "SEMUA",
        pemasokTab: "tagihan",
        riwayatSearch: "",
        riwayatStatus: "SEMUA",
        riwayatPeriode: "2026-01",
        penukaranStatus: "SEMUA",
        pengirimanTab: "penugasan", // penugasan | kendala | riwayat
        pengirimanStatus: "SEMUA",
        pengirimanTanggal: "",
        logRole: "SEMUA",
        logModul: "SEMUA",
        logSearch: "",
      },
    },

    save: saveStore,

    resetAllData: function () {
      window.WF.db = cloneInitialData();
      saveStore();
      window.WF.setFlash("Seluruh data simulasi berhasil dikembalikan ke kondisi awal.");
      window.WF.render();
    },

    formatRupiah: function (num) {
      const n = Number(num) || 0;
      return "Rp " + n.toLocaleString("id-ID");
    },

    nowString: function () {
      const d = new Date();
      const pad = function (v) {
        return String(v).padStart(2, "0");
      };
      return (
        d.getFullYear() +
        "-" +
        pad(d.getMonth() + 1) +
        "-" +
        pad(d.getDate()) +
        " " +
        pad(d.getHours()) +
        ":" +
        pad(d.getMinutes())
      );
    },

    canAccess: function (page, role) {
      const r = role || (window.WF.ui.currentUser && window.WF.ui.currentUser.role);
      if (!r) return page === "login";
      const allowed = PAGE_ACCESS[page] || ["admin"];
      return allowed.indexOf(r) !== -1;
    },

    setFlash: function (msg) {
      window.WF.ui.flashMessage = msg;
    },

    recordLog: function (modul, aktivitas, dataSebelum, dataSesudah) {
      const u = window.WF.ui.currentUser;
      const roleName = u
        ? u.role === "admin"
          ? "Pemilik"
          : u.role === "kasir"
            ? "Kasir"
            : "Pengirim"
        : "Sistem";
      window.WF.db.log_aktivitas.unshift({
        id_log: "log-" + Date.now(),
        pengguna_id: u ? u.id_pengguna : "sys",
        nama_pengguna: u ? u.nama : "Sistem",
        peran: roleName,
        modul: modul,
        aktivitas: aktivitas,
        data_sebelum: dataSebelum || "-",
        data_sesudah: dataSesudah || "-",
        waktu: window.WF.nowString(),
      });
      saveStore();
    },

    pushNotif: function (jenis, penerima, saluran, pesan) {
      window.WF.db.notifikasi.unshift({
        id_notifikasi: "ntf-" + Date.now(),
        jenis: jenis,
        penerima: penerima,
        saluran: saluran,
        pesan: pesan,
        status_kirim: "terkirim",
        waktu: window.WF.nowString(),
        dibaca: false,
      });
      saveStore();
    },

    navigate: function (page, params) {
      if (page !== "login" && !window.WF.ui.currentUser) {
        window.WF.ui.currentPage = "login";
        window.WF.render();
        return;
      }
      window.WF.ui.currentPage = page;
      window.WF.ui.pageParams = params || {};
      window.WF.ui.sidebarMobileOpen = false;
      window.WF.ui.headerSearchOpen = false;
      window.WF.ui.notifDropdownOpen = false;
      window.WF.ui.skinDropdownOpen = false;
      window.WF.ui.profileDropdownOpen = false;
      window.WF.ui.openSelectId = null;
      window.scrollTo(0, 0);
      window.WF.render();
    },

    openModal: function (config) {
      window.WF.ui.modal = config;
      window.WF.render();
    },

    closeModal: function () {
      window.WF.ui.modal = null;
      window.WF.render();
    },

    openReceipt: function (title, lines) {
      window.WF.ui.receiptModal = { title: title, lines: lines };
      window.WF.render();
    },

    closeReceipt: function () {
      window.WF.ui.receiptModal = null;
      window.WF.render();
    },
  };
})();
