/*
  Controller Utama & Event Handler Prototype Interaktif TB Kurnia Mandiri
  Menghubungkan seluruh navigasi, CustomSelect, form submit, filter, dialog konfirmasi, dan struk thermal.
*/

(function () {
  const esc = window.WFUI.esc;
  const icon = window.WFUI.icon;
  const customSelect = window.WFUI.customSelect;

  function renderPageContent() {
    const page = window.WF.ui.currentPage;
    const u = window.WF.ui.currentUser;

    if (!u || page === "login") {
      return window.WFPagesAuthDashboard.renderLoginPage();
    }

    if (!window.WF.canAccess(page, u.role)) {
      return (
        '<div class="wf-card"><div class="wf-card-body" style="text-align:center;padding:48px 20px;">' +
        '<h1 style="margin:0 0 8px;font-size:1.375rem;">Akses Dibatasi</h1>' +
        '<p style="color:var(--wf-text-secondary);max-width:460px;margin:0 auto 18px;">Akun dengan peran <strong>' +
        esc(window.WF.ROLE_LABELS[u.role]) +
        "</strong> tidak memiliki akses ke halaman ini.</p>" +
        '<button type="button" class="wf-btn wf-btn-primary" data-nav="dashboard">Kembali ke Dashboard</button>' +
        "</div></div>"
      );
    }

    switch (page) {
      case "dashboard":
        return window.WFPagesAuthDashboard.renderDashboardPage();
      case "transaksi-penjualan":
        return window.WFPagesTransaksiKasbon.renderTransaksiPenjualanPage();
      case "riwayat-transaksi":
        return window.WFPagesTransaksiKasbon.renderRiwayatTransaksiPage();
      case "penukaran-barang":
        return window.WFPagesTransaksiKasbon.renderPenukaranBarangPage();
      case "form-penukaran-barang":
        return window.WFPagesTransaksiKasbon.renderFormPenukaranBarangPage();
      case "kasbon-dan-piutang":
        return window.WFPagesTransaksiKasbon.renderKasbonDanPiutangPage();
      case "data-barang":
        return window.WFPagesMaster.renderDataBarangPage();
      case "form-barang":
        return window.WFPagesMaster.renderFormBarangPage();
      case "cetak-barcode":
        return window.WFPagesMaster.renderCetakBarcodePage();
      case "data-pelanggan":
        return window.WFPagesMaster.renderDataPelangganPage();
      case "form-pelanggan":
        return window.WFPagesMaster.renderFormPelangganPage();
      case "detail-pelanggan":
        return window.WFPagesMaster.renderDetailPelangganPage();
      case "barang-masuk-keluar":
        return window.WFPagesStokPemasok.renderBarangMasukKeluarPage();
      case "form-mutasi-barang":
        return window.WFPagesStokPemasok.renderFormMutasiBarangPage();
      case "stok-dan-restok":
        return window.WFPagesStokPemasok.renderStokDanRestokPage();
      case "utang-pemasok":
        return window.WFPagesStokPemasok.renderUtangPemasokPage();
      case "form-tagihan-pemasok":
        return window.WFPagesStokPemasok.renderFormTagihanPemasokPage();
      case "pengiriman-barang":
        return window.WFPagesPengirimanSistem.renderPengirimanBarangPage();
      case "form-proses-pengiriman":
        return window.WFPagesPengirimanSistem.renderFormProsesPengirimanPage();
      case "pengguna-dan-hak-akses":
        return window.WFPagesPengirimanSistem.renderPenggunaDanHakAksesPage();
      case "form-pengguna":
        return window.WFPagesPengirimanSistem.renderFormPenggunaPage();
      case "log-aktivitas":
        return window.WFPagesPengirimanSistem.renderLogAktivitasPage();
      default:
        return window.WFPagesAuthDashboard.renderDashboardPage();
    }
  }

  window.WF.render = function () {
    const root = document.getElementById("wf-app");
    if (!root) return;

    const u = window.WF.ui.currentUser;
    const isLogin = !u || window.WF.ui.currentPage === "login";
    const flash = window.WF.ui.flashMessage;

    const flashHtml = flash
      ? '<div class="wf-alert" role="status">' +
        '<span style="display:inline-flex;align-items:center;gap:8px;">' +
        icon("check-circle", "wf-icon-sm") +
        "<span>" +
        esc(flash) +
        "</span></span>" +
        '<button type="button" class="wf-icon-btn" style="width:28px;height:28px;" data-action="clear-flash" aria-label="Tutup pesan">' +
        icon("x", "wf-icon-sm") +
        "</button>" +
        "</div>"
      : "";

    if (isLogin) {
      root.innerHTML = renderPageContent() + window.WFUI.renderModals();
      return;
    }

    root.innerHTML =
      '<div class="wf-shell">' +
      window.WFUI.renderSidebar() +
      '<div class="wf-main-wrap ' +
      (window.WF.ui.sidebarCollapsed ? "is-expanded" : "") +
      '">' +
      window.WFUI.renderHeader() +
      '<main class="wf-content">' +
      flashHtml +
      renderPageContent() +
      "</main>" +
      "</div>" +
      "</div>" +
      window.WFUI.renderModals();
  };

  function closeAllCustomSelects() {
    window.WF.ui.openSelectId = null;
    const openWraps = document.querySelectorAll(".wf-custom-select.is-open");
    openWraps.forEach(function (el) {
      el.classList.remove("is-open");
      const trig = el.querySelector(".wf-custom-select-trigger");
      if (trig) trig.setAttribute("aria-expanded", "false");
    });
  }

  // ==================== EVENT DELEGATION INTERAKSI ====================
  document.addEventListener("click", function (e) {
    // 0. Penanganan CustomSelect (buka/tutup & pilih opsi tanpa menghilangkan ketikan form)
    const toggleSelBtn = e.target.closest("[data-toggle-select]");
    if (toggleSelBtn) {
      e.preventDefault();
      const selId = toggleSelBtn.getAttribute("data-toggle-select");
      const wrap = toggleSelBtn.closest(".wf-custom-select");
      const wasOpen = wrap && wrap.classList.contains("is-open");
      closeAllCustomSelects();
      if (wrap && !wasOpen) {
        wrap.classList.add("is-open");
        toggleSelBtn.setAttribute("aria-expanded", "true");
        window.WF.ui.openSelectId = selId;
      }
      return;
    }

    const optBtn = e.target.closest("[data-select-option]");
    if (optBtn) {
      e.preventDefault();
      const selId = optBtn.getAttribute("data-select-option");
      const val = optBtn.getAttribute("data-value");
      const lbl = optBtn.getAttribute("data-label");
      const wrap = optBtn.closest(".wf-custom-select");

      if (wrap) {
        const hiddenInput = document.getElementById(selId);
        if (hiddenInput) hiddenInput.value = val;
        const labelEl = wrap.querySelector(".wf-custom-select-label");
        if (labelEl) labelEl.textContent = lbl;
        wrap
          .querySelectorAll(".wf-custom-select-option")
          .forEach(function (btn) {
            const match = btn.getAttribute("data-value") === val;
            btn.classList.toggle("is-selected", match);
            btn.setAttribute("aria-selected", match ? "true" : "false");
          });
        closeAllCustomSelects();

        const filterKey = wrap.getAttribute("data-filter");
        if (filterKey) {
          window.WF.ui.filters[filterKey] = val;
          window.WF.render();
          return;
        }
        const setFilterKey = wrap.getAttribute("data-set-filter");
        if (setFilterKey) {
          window.WF.ui.filters[setFilterKey] = val;
          window.WF.render();
          return;
        }
        const posKey = wrap.getAttribute("data-pos-input");
        if (posKey) {
          window.WF.ui.pos[posKey] = val;
          window.WF.render();
          return;
        }
        const pageSizeKey = wrap.getAttribute("data-page-size-key");
        if (pageSizeKey) {
          if (!window.WF.ui.pagination) window.WF.ui.pagination = {};
          window.WF.ui.pagination[pageSizeKey] = {
            page: 1,
            pageSize: Number(val) || 5,
          };
          window.WF.render();
          return;
        }
        const act = wrap.getAttribute("data-action");
        if (act === "pos-change-satuan") {
          const idx = Number(wrap.getAttribute("data-idx"));
          if (window.WF.ui.pos.cart[idx]) {
            window.WF.ui.pos.cart[idx].satuan_barang_id = val;
            window.WF.render();
          }
          return;
        }
      }
      return;
    }

    // Tutup CustomSelect jika klik di luar
    if (!e.target.closest(".wf-custom-select")) {
      closeAllCustomSelects();
    }

    // Tutup dropdown Header (Setting, Notifikasi, Profil, Search) jika klik di luar area terkait
    if (
      !e.target.closest(".wf-header-right") &&
      !e.target.closest(".wf-header-search")
    ) {
      if (
        window.WF.ui.skinDropdownOpen ||
        window.WF.ui.notifDropdownOpen ||
        window.WF.ui.profileDropdownOpen ||
        window.WF.ui.headerSearchOpen
      ) {
        window.WF.ui.skinDropdownOpen = false;
        window.WF.ui.notifDropdownOpen = false;
        window.WF.ui.profileDropdownOpen = false;
        window.WF.ui.headerSearchOpen = false;
        if (!e.target.closest("[data-nav],[data-action],[data-toggle-group],[data-toggle-submenu],[data-set-filter],[data-mark-notif]")) {
          window.WF.render();
        }
      }
    }

    const target = e.target.closest(
      "[data-nav],[data-action],[data-select-login-role],[data-toggle-group],[data-toggle-submenu],[data-set-filter],[data-mark-notif],[data-page-key],[data-page-jump]"
    );
    if (!target) return;

    // 0b. Navigasi nomor halaman & tombol Sebelumnya/Berikutnya pada TablePagination
    const pageKey = target.getAttribute("data-page-key");
    if (pageKey) {
      e.preventDefault();
      const nextP = Number(target.getAttribute("data-page-val")) || 1;
      if (!window.WF.ui.pagination) window.WF.ui.pagination = {};
      if (!window.WF.ui.pagination[pageKey]) {
        window.WF.ui.pagination[pageKey] = { page: nextP, pageSize: 5 };
      } else {
        window.WF.ui.pagination[pageKey].page = nextP;
      }
      window.WF.render();
      return;
    }

    // 0c. Tombol lompat halaman ("Ke hal: ... Buka") pada TablePagination
    const jumpKey = target.getAttribute("data-page-jump");
    if (jumpKey) {
      e.preventDefault();
      const maxPage = Number(target.getAttribute("data-max-page")) || 1;
      const jumpInput = document.querySelector(
        '[data-jump-input="' + jumpKey + '"]'
      );
      const rawVal = jumpInput ? Number(jumpInput.value) : 1;
      const targetPage = Math.min(
        Math.max(1, Math.floor(rawVal || 1)),
        maxPage
      );
      if (!window.WF.ui.pagination) window.WF.ui.pagination = {};
      if (!window.WF.ui.pagination[jumpKey]) {
        window.WF.ui.pagination[jumpKey] = { page: targetPage, pageSize: 5 };
      } else {
        window.WF.ui.pagination[jumpKey].page = targetPage;
      }
      window.WF.render();
      return;
    }

    // 1. Pilih tab role pada Halaman Login (TANPA mengisi input username/password otomatis)
    const loginRole = target.getAttribute("data-select-login-role");
    if (loginRole) {
      e.preventDefault();
      window.WF.ui.loginSelectedRole = loginRole;
      window.WF.ui.loginError = "";
      window.WF.render();
      const unameEl = document.getElementById("wf-login-username");
      const passEl = document.getElementById("wf-login-password");
      if (unameEl) unameEl.value = "";
      if (passEl) passEl.value = "";
      return;
    }

    // 2. Navigasi halaman
    const navPage = target.getAttribute("data-nav");
    if (navPage) {
      e.preventDefault();
      window.WF.ui.flashMessage = "";
      window.WF.navigate(navPage);
      return;
    }

    // 3. Buka/tutup grup & sub-menu sidebar
    const grp = target.getAttribute("data-toggle-group");
    if (grp) {
      window.WF.ui.openGroups[grp] = window.WF.ui.openGroups[grp] === false;
      window.WF.render();
      return;
    }
    const sub = target.getAttribute("data-toggle-submenu");
    if (sub) {
      window.WF.ui.openSubMenus[sub] = window.WF.ui.openSubMenus[sub] === false;
      window.WF.render();
      return;
    }

    // 4. Filter Tab
    const filterKey = target.getAttribute("data-set-filter");
    if (filterKey && target.hasAttribute("data-val")) {
      window.WF.ui.filters[filterKey] = target.getAttribute("data-val");
      window.WF.render();
      return;
    }

    // 5. Tandai satu notifikasi dibaca
    const notifId = target.getAttribute("data-mark-notif");
    if (notifId) {
      const n = window.WF.db.notifikasi.find(function (x) {
        return x.id_notifikasi === notifId;
      });
      if (n) n.dibaca = true;
      window.WF.save();
      window.WF.render();
      return;
    }

    // 6. Aksi-aksi tombol
    const action = target.getAttribute("data-action");
    const id = target.getAttribute("data-id");
    const db = window.WF.db;

    switch (action) {
      case "toggle-login-password": {
        const passInput = document.getElementById("wf-login-password");
        if (passInput) {
          const isPass = passInput.type === "password";
          passInput.type = isPass ? "text" : "password";
          target.innerHTML = icon(isPass ? "eye-off" : "eye", "wf-icon-sm");
        }
        break;
      }

      case "reset-prototype-data":
        window.WF.resetAllData();
        break;

      case "clear-flash":
        window.WF.ui.flashMessage = "";
        window.WF.render();
        break;

      case "logout":
        window.WF.recordLog("Autentikasi", "Logout dari sistem", "-", "-");
        window.WF.ui.currentUser = null;
        window.WF.ui.currentPage = "login";
        window.WF.ui.loginError = "";
        window.WF.ui.flashMessage = "";
        window.WF.render();
        break;

      case "toggle-sidebar":
        if (window.innerWidth >= 1024) {
          window.WF.ui.sidebarCollapsed = !window.WF.ui.sidebarCollapsed;
        } else {
          window.WF.ui.sidebarMobileOpen = !window.WF.ui.sidebarMobileOpen;
        }
        window.WF.render();
        break;

      case "close-mobile-sidebar":
        window.WF.ui.sidebarMobileOpen = false;
        window.WF.render();
        break;

      case "toggle-notif-dropdown":
        window.WF.ui.notifDropdownOpen = !window.WF.ui.notifDropdownOpen;
        window.WF.ui.skinDropdownOpen = false;
        window.WF.ui.profileDropdownOpen = false;
        window.WF.ui.headerSearchOpen = false;
        window.WF.render();
        break;

      case "toggle-skin-dropdown":
        window.WF.ui.skinDropdownOpen = !window.WF.ui.skinDropdownOpen;
        window.WF.ui.notifDropdownOpen = false;
        window.WF.ui.profileDropdownOpen = false;
        window.WF.ui.headerSearchOpen = false;
        window.WF.render();
        break;

      case "toggle-profile-dropdown":
        window.WF.ui.profileDropdownOpen = !window.WF.ui.profileDropdownOpen;
        window.WF.ui.skinDropdownOpen = false;
        window.WF.ui.notifDropdownOpen = false;
        window.WF.ui.headerSearchOpen = false;
        window.WF.render();
        break;

      case "toggle-skin-mode": {
        const nextMode = window.WF.ui.skinMode === "dark" ? "light" : "dark";
        window.WF.ui.skinMode = nextMode;
        if (document.documentElement) {
          document.documentElement.setAttribute("data-skin", nextMode);
        }
        window.WF.render();
        break;
      }

      case "set-skin-mode": {
        const modeVal = target.getAttribute("data-val") || "light";
        window.WF.ui.skinMode = modeVal;
        if (document.documentElement) {
          document.documentElement.setAttribute("data-skin", modeVal);
        }
        window.WF.render();
        break;
      }

      case "set-sidebar-skin":
        window.WF.ui.sidebarSkin = target.getAttribute("data-val") || "default";
        window.WF.render();
        break;

      case "set-text-size": {
        const szVal = target.getAttribute("data-val") || "sedang";
        window.WF.ui.textSize = szVal;
        if (document.documentElement) {
          document.documentElement.setAttribute("data-size", szVal);
        }
        window.WF.render();
        break;
      }

      case "mark-all-notifs-read":
        db.notifikasi.forEach(function (n) {
          n.dibaca = true;
        });
        window.WF.save();
        window.WF.render();
        break;

      case "close-modal":
        window.WF.closeModal();
        break;

      case "close-receipt":
        window.WF.closeReceipt();
        break;

      case "print-receipt":
        window.WF.closeReceipt();
        window.WF.setFlash(
          "Perintah cetak struk berhasil dikirim ke Printer Thermal."
        );
        window.WF.render();
        break;

      // ---- BARANG ----
      case "open-add-barang":
        window.WF.navigate("form-barang", {});
        break;

      case "edit-barang":
        window.WF.navigate("form-barang", { id_barang: id });
        break;

      case "confirm-delete-barang": {
        const brg = db.barang.find(function (b) {
          return b.id_barang === id;
        });
        if (!brg) break;
        window.WF.openModal({
          title: "Hapus Data Barang",
          bodyHtml:
            "<p style=\"margin:0;\">Apakah Anda yakin ingin menghapus barang <strong>" +
            esc(brg.kode_barang + " - " + brg.nama) +
            "</strong> dari daftar katalog?</p>",
          confirmAction: "execute-delete-barang",
          confirmId: id,
          confirmLabel: "Hapus Barang",
        });
        break;
      }

      case "execute-delete-barang": {
        const idx = db.barang.findIndex(function (b) {
          return b.id_barang === id;
        });
        if (idx !== -1) {
          const removed = db.barang.splice(idx, 1)[0];
          window.WF.recordLog(
            "Data Barang",
            "Menghapus barang " + removed.kode_barang + " - " + removed.nama,
            "Stok: " + removed.stok,
            "Dihapus"
          );
          window.WF.setFlash("Barang " + removed.nama + " berhasil dihapus.");
        }
        window.WF.closeModal();
        break;
      }

      case "simulasi-cetak-barcode":
        window.WF.recordLog(
          "Data Barang",
          "Mencetak lembar label barcode produk & meja kasir",
          "-",
          db.barang.length + " label barcode"
        );
        window.WF.setFlash(
          "Cetak label barcode kemasan & daftar barcode meja kasir berhasil dijalankan."
        );
        window.WF.render();
        break;

      // ---- PELANGGAN ----
      case "open-add-pelanggan":
        window.WF.navigate("form-pelanggan", {});
        break;

      case "edit-pelanggan":
        window.WF.navigate("form-pelanggan", { id_pelanggan: id });
        break;

      case "detail-pelanggan":
        window.WF.navigate("detail-pelanggan", { id_pelanggan: id });
        break;

      case "confirm-delete-pelanggan": {
        const pel = db.pelanggan.find(function (p) {
          return p.id_pelanggan === id;
        });
        if (!pel) break;
        window.WF.openModal({
          title: "Hapus Pelanggan",
          bodyHtml:
            "<p style=\"margin:0;\">Hapus pelanggan <strong>" +
            esc(pel.nama) +
            "</strong> dari sistem?</p>",
          confirmAction: "execute-delete-pelanggan",
          confirmId: id,
          confirmLabel: "Hapus Pelanggan",
        });
        break;
      }

      case "execute-delete-pelanggan": {
        const idx = db.pelanggan.findIndex(function (p) {
          return p.id_pelanggan === id;
        });
        if (idx !== -1) {
          const removed = db.pelanggan.splice(idx, 1)[0];
          window.WF.recordLog(
            "Data Pelanggan",
            "Menghapus data pelanggan " + removed.nama,
            removed.nama,
            "Dihapus"
          );
          window.WF.setFlash(
            "Pelanggan " + removed.nama + " berhasil dihapus."
          );
        }
        window.WF.closeModal();
        break;
      }

      // ---- TRANSAKSI POS ----
      case "pos-simulasi-scan": {
        const sample = db.barang[1] || db.barang[0];
        if (sample) {
          window.WF.ui.pos.cart.push({
            barang_id: sample.id_barang,
            satuan_barang_id: sample.satuan_barang[0].id_satuan_barang,
            jumlah: 1,
            harga_nego_input: "",
          });
          window.WF.setFlash(
            "Barcode " +
              sample.barcode +
              " (" +
              sample.nama +
              ") ditambahkan ke keranjang."
          );
          window.WF.render();
        }
        break;
      }

      case "pos-add-item": {
        const brg = db.barang.find(function (b) {
          return b.id_barang === id;
        });
        if (!brg) break;
        const existingItem = window.WF.ui.pos.cart.find(function (c) {
          return c.barang_id === id;
        });
        if (existingItem) {
          existingItem.jumlah += 1;
        } else {
          window.WF.ui.pos.cart.push({
            barang_id: brg.id_barang,
            satuan_barang_id: brg.satuan_barang[0].id_satuan_barang,
            jumlah: 1,
            harga_nego_input: "",
          });
        }
        window.WF.render();
        break;
      }

      case "pos-remove-item": {
        const idx = Number(target.getAttribute("data-idx"));
        window.WF.ui.pos.cart.splice(idx, 1);
        window.WF.render();
        break;
      }

      case "pos-set-metode":
        window.WF.ui.pos.jenis_pembayaran = target.getAttribute("data-metode");
        window.WF.render();
        break;

      case "pos-toggle-kirim":
        window.WF.ui.pos.perlu_dikirim = !window.WF.ui.pos.perlu_dikirim;
        window.WF.render();
        break;

      case "pos-submit-checkout": {
        const pos = window.WF.ui.pos;
        if (pos.cart.length === 0) break;
        const pel =
          db.pelanggan.find(function (p) {
            return p.id_pelanggan === pos.pelanggan_id;
          }) || db.pelanggan[0];

        let total = 0;
        const detailItems = [];
        pos.cart.forEach(function (c) {
          const b = db.barang.find(function (x) {
            return x.id_barang === c.barang_id;
          });
          if (!b) return;
          const sat =
            b.satuan_barang.find(function (s) {
              return s.id_satuan_barang === c.satuan_barang_id;
            }) || b.satuan_barang[0];
          const hAwal = Number(sat.harga_jual_awal);
          const hNego =
            String(c.harga_nego_input || "").trim() !== ""
              ? Number(c.harga_nego_input)
              : hAwal;
          const sub = hNego * Number(c.jumlah);
          total += sub;

          const penguranganStok =
            Number(c.jumlah) * Number(sat.jumlah_konversi || 1);
          b.stok = Math.max(0, Number(b.stok) - penguranganStok);
          if (b.stok <= b.stok_minimum) {
            window.WF.pushNotif(
              "Stok Hampir Habis",
              "Pemilik & Kasir",
              "Email & WhatsApp",
              "Stok " +
                b.nama +
                " tersisa " +
                b.stok +
                " " +
                b.satuan_dasar +
                " (Batas minimum: " +
                b.stok_minimum +
                ")."
            );
          }

          detailItems.push({
            id_detail_transaksi: "dt-" + Date.now() + "-" + detailItems.length,
            barang_id: b.id_barang,
            nama_barang: b.nama,
            satuan_barang_id: sat.id_satuan_barang,
            nama_satuan: sat.nama_satuan,
            jumlah: Number(c.jumlah),
            harga_modal: Number(sat.harga_modal),
            harga_awal: hAwal,
            harga_nego: hNego,
            harga_satuan: hNego,
            subtotal: sub,
          });
        });

        const noNota = "INV-20260124-00" + (db.transaksi.length + 1);
        const isKasbon = pos.jenis_pembayaran === "kasbon";
        const newTrx = {
          id_transaksi: "trx-" + Date.now(),
          no_nota: noNota,
          pengguna_id: window.WF.ui.currentUser.id_pengguna,
          nama_kasir: window.WF.ui.currentUser.nama,
          pelanggan_id: pel.id_pelanggan,
          nama_pelanggan: pel.nama,
          jenis_pembayaran: pos.jenis_pembayaran,
          total: total,
          jumlah_dibayar: isKasbon ? 0 : total,
          sisa_tagihan: isKasbon ? total : 0,
          status_bayar: isKasbon ? "belum_lunas" : "lunas",
          perlu_dikirim: pos.perlu_dikirim,
          tanggal: window.WF.nowString(),
          items: detailItems,
        };
        db.transaksi.unshift(newTrx);

        if (isKasbon) {
          pel.sisa_piutang = Number(pel.sisa_piutang) + total;
          db.kasbon.unshift({
            id_kasbon: "ksb-" + Date.now(),
            pelanggan_id: pel.id_pelanggan,
            nama_pelanggan: pel.nama,
            transaksi_id: newTrx.id_transaksi,
            no_nota: noNota,
            jumlah_kasbon: total,
            batas_kasbon: pel.batas_kasbon,
            sisa_piutang_sebelum: pel.sisa_piutang - total,
            status: "menunggu",
            alasan_penolakan: "",
            tanggal_pengajuan: window.WF.nowString(),
            tanggal_keputusan: "-",
          });
          window.WF.pushNotif(
            "Pengajuan Kasbon",
            "Pemilik",
            "Email & WhatsApp",
            "Permintaan persetujuan kasbon baru " +
              noNota +
              " (" +
              pel.nama +
              ") sebesar " +
              window.WF.formatRupiah(total)
          );
        }

        if (pos.perlu_dikirim) {
          const kurir =
            db.pengguna.find(function (u) {
              return u.id_pengguna === pos.pengirim_id;
            }) || db.pengguna[2];
          db.pengiriman.unshift({
            id_pengiriman: "krm-" + Date.now(),
            transaksi_id: newTrx.id_transaksi,
            no_nota: noNota,
            nama_pelanggan: pel.nama,
            kontak_pelanggan: pel.kontak,
            pengirim_id: kurir.id_pengguna,
            nama_pengirim: kurir.nama.replace(/\s*\(.*?\)\s*/g, ""),
            alamat_tujuan: pos.alamat_kirim || pel.alamat,
            ringkasan_barang: detailItems
              .map(function (i) {
                return i.jumlah + " " + i.nama_satuan + " " + i.nama_barang;
              })
              .join(", "),
            status: "Menunggu Muat",
            foto_bukti_url: "",
            alasan_penukaran: "",
            foto_barang_url: "",
            tanggal_penugasan: window.WF.nowString(),
            tanggal_terima: "-",
          });
          window.WF.pushNotif(
            "Penugasan Pengiriman",
            kurir.nama,
            "Email & WhatsApp",
            "Penugasan pengiriman baru untuk nota " +
              noNota +
              " ke " +
              (pos.alamat_kirim || pel.alamat)
          );
        }

        window.WF.recordLog(
          "Transaksi Penjualan",
          "Menyimpan transaksi " +
            noNota +
            " (" +
            pos.jenis_pembayaran.toUpperCase() +
            ")",
          "-",
          "Total: " + window.WF.formatRupiah(total)
        );

        pos.cart = [];
        pos.uang_diterima = "";
        window.WF.save();

        const receiptLines = [
          "======================================",
          "          CV KURNIA MANDIRI           ",
          "     TOKO BAHAN & MATERIAL BANGUNAN   ",
          "======================================",
          "No. Nota  : " + noNota,
          "Tanggal   : " + newTrx.tanggal,
          "Pelanggan : " + pel.nama,
          "Metode    : " + newTrx.jenis_pembayaran.toUpperCase(),
          "--------------------------------------",
        ];
        detailItems.forEach(function (it) {
          receiptLines.push(it.nama_barang);
          receiptLines.push(
            "  " +
              it.jumlah +
              " " +
              it.nama_satuan +
              " x " +
              window.WF.formatRupiah(it.harga_satuan) +
              " = " +
              window.WF.formatRupiah(it.subtotal)
          );
        });
        receiptLines.push("--------------------------------------");
        receiptLines.push("TOTAL TAGIHAN : " + window.WF.formatRupiah(total));
        receiptLines.push(
          "STATUS BAYAR  : " +
            (isKasbon ? "KASBON (MENUNGGU PERSETUJUAN)" : "LUNAS")
        );
        receiptLines.push("======================================");
        window.WF.openReceipt(
          "Struk Transaksi Penjualan (" + noNota + ")",
          receiptLines
        );
        break;
      }

      case "cetak-ulang-struk": {
        const t = db.transaksi.find(function (x) {
          return x.id_transaksi === id;
        });
        if (!t) break;
        const lines = [
          "======================================",
          "      CETAK ULANG NOTA TRANSAKSI      ",
          "          CV KURNIA MANDIRI           ",
          "======================================",
          "No. Nota  : " + t.no_nota,
          "Tanggal   : " + t.tanggal,
          "Pelanggan : " + t.nama_pelanggan,
          "Metode    : " + t.jenis_pembayaran.toUpperCase(),
          "--------------------------------------",
          "Total     : " + window.WF.formatRupiah(t.total),
          "Sisa      : " + window.WF.formatRupiah(t.sisa_tagihan),
          "Status    : " + t.status_bayar.toUpperCase(),
          "======================================",
        ];
        window.WF.openReceipt("Cetak Ulang Struk (" + t.no_nota + ")", lines);
        break;
      }

      case "unduh-rekap-penjualan":
        window.WF.recordLog(
          "Laporan Penjualan",
          "Mengunduh file rekap penjualan (Excel / PDF)",
          "-",
          db.transaksi.length + " baris transaksi"
        );
        window.WF.setFlash(
          "Unduh Rekap Penjualan (Excel / PDF) berhasil dijalankan."
        );
        window.WF.render();
        break;

      case "tolak-penukaran-form":
        window.WF.recordLog(
          "Penukaran Barang",
          "Menolak pengajuan penukaran barang karena tidak memenuhi ketentuan toko",
          "-",
          "Status: Ditolak"
        );
        window.WF.setFlash(
          "Pengajuan penukaran barang ditolak karena melewati batas ketentuan toko."
        );
        window.WF.navigate("penukaran-barang");
        break;

      // ---- KASBON & PIUTANG ----
      case "approve-kasbon": {
        const k = db.kasbon.find(function (x) {
          return x.id_kasbon === id;
        });
        if (!k) break;
        k.status = "disetujui";
        k.tanggal_keputusan = window.WF.nowString();
        window.WF.pushNotif(
          "Persetujuan Kasbon",
          "Kasir",
          "Email & WhatsApp",
          "Pemilik menyetujui kasbon nota " +
            k.no_nota +
            " (" +
            k.nama_pelanggan +
            ")."
        );
        window.WF.recordLog(
          "Kasbon & Piutang",
          "Menyetujui permintaan kasbon " + k.no_nota,
          "Status: Menunggu",
          "Status: Disetujui"
        );
        window.WF.setFlash(
          "Permintaan kasbon " +
            k.no_nota +
            " berhasil disetujui dan notifikasi dikirim ke Kasir."
        );
        window.WF.render();
        break;
      }

      case "open-reject-kasbon": {
        const k = db.kasbon.find(function (x) {
          return x.id_kasbon === id;
        });
        if (!k) break;
        window.WF.openModal({
          title: "Tolak Permintaan Kasbon (" + k.no_nota + ")",
          bodyHtml:
            '<div class="wf-field">' +
            '<label for="modal-alasan-tolak" class="wf-label">Alasan Penolakan Kasbon</label>' +
            '<textarea id="modal-alasan-tolak" class="wf-textarea" placeholder="Contoh: Tagihan nota sebelumnya belum dilunasi..."></textarea>' +
            "</div>",
          confirmAction: "execute-reject-kasbon",
          confirmId: id,
          confirmLabel: "Simpan Penolakan",
        });
        break;
      }

      case "execute-reject-kasbon": {
        const k = db.kasbon.find(function (x) {
          return x.id_kasbon === id;
        });
        const alasanEl = document.getElementById("modal-alasan-tolak");
        const alasan = alasanEl ? alasanEl.value.trim() : "";
        if (!alasan) {
          alert("Alasan penolakan kasbon wajib diisi.");
          return;
        }
        if (k) {
          k.status = "ditolak";
          k.alasan_penolakan = alasan;
          k.tanggal_keputusan = window.WF.nowString();
          window.WF.pushNotif(
            "Penolakan Kasbon",
            "Kasir",
            "Email & WhatsApp",
            "Kasbon " + k.no_nota + " ditolak Pemilik. Alasan: " + alasan
          );
          window.WF.recordLog(
            "Kasbon & Piutang",
            "Menolak kasbon " + k.no_nota + " (" + alasan + ")",
            "Status: Menunggu",
            "Status: Ditolak"
          );
          window.WF.setFlash(
            "Permintaan kasbon " + k.no_nota + " telah ditolak."
          );
        }
        window.WF.closeModal();
        break;
      }

      case "open-bayar-piutang": {
        const t = db.transaksi.find(function (x) {
          return x.id_transaksi === id;
        });
        if (!t) break;
        window.WF.openModal({
          title: "Terima Pembayaran Piutang (" + t.no_nota + ")",
          bodyHtml:
            '<div class="wf-stack">' +
            '<div style="font-size:0.875rem;">Pelanggan: <strong>' +
            esc(t.nama_pelanggan) +
            "</strong> &middot; Sisa Tagihan: <strong>" +
            window.WF.formatRupiah(t.sisa_tagihan) +
            "</strong></div>" +
            '<div class="wf-field">' +
            '<label class="wf-label">Metode Pembayaran Piutang</label>' +
            customSelect({
              id: "modal-metode-piutang",
              value: "Tunai",
              options: [
                { value: "Tunai", label: "Pembayaran Tunai di Kasir" },
                {
                  value: "Transfer Bank",
                  label: "Transfer Bank (Periksa Bukti Transfer)",
                },
              ],
            }) +
            "</div>" +
            '<div class="wf-field">' +
            '<label for="modal-nominal-piutang" class="wf-label">Nominal Pembayaran (Rp)</label>' +
            '<input id="modal-nominal-piutang" type="number" min="1000" max="' +
            t.sisa_tagihan +
            '" class="wf-input" value="' +
            t.sisa_tagihan +
            '" />' +
            "</div></div>",
          confirmAction: "execute-bayar-piutang",
          confirmId: id,
          confirmLabel: "Simpan & Cetak Bukti",
        });
        break;
      }

      case "execute-bayar-piutang": {
        const t = db.transaksi.find(function (x) {
          return x.id_transaksi === id;
        });
        if (!t) break;
        const nom =
          Number(document.getElementById("modal-nominal-piutang").value) || 0;
        const met = document.getElementById("modal-metode-piutang").value;
        if (nom <= 0 || nom > t.sisa_tagihan) {
          alert("Nominal pembayaran harus di antara Rp 1 hingga sisa tagihan.");
          return;
        }
        t.jumlah_dibayar = Number(t.jumlah_dibayar) + nom;
        t.sisa_tagihan = Math.max(0, Number(t.sisa_tagihan) - nom);
        t.status_bayar = t.sisa_tagihan === 0 ? "lunas" : "sebagian";

        const pel = db.pelanggan.find(function (p) {
          return p.id_pelanggan === t.pelanggan_id;
        });
        if (pel) {
          pel.sisa_piutang = Math.max(0, Number(pel.sisa_piutang) - nom);
        }

        window.WF.recordLog(
          "Pembayaran Piutang",
          "Menerima pembayaran piutang " +
            t.no_nota +
            " sebesar " +
            window.WF.formatRupiah(nom),
          "Sisa Sebelumnya: " + window.WF.formatRupiah(t.sisa_tagihan + nom),
          "Sisa Sekarang: " + window.WF.formatRupiah(t.sisa_tagihan)
        );
        window.WF.closeModal();
        window.WF.openReceipt("Bukti Pembayaran Piutang (" + t.no_nota + ")", [
          "======================================",
          "       BUKTI PEMBAYARAN PIUTANG       ",
          "          CV KURNIA MANDIRI           ",
          "======================================",
          "No. Nota       : " + t.no_nota,
          "Pelanggan      : " + t.nama_pelanggan,
          "Metode Bayar   : " + met,
          "Nominal Bayar  : " + window.WF.formatRupiah(nom),
          "Sisa Tagihan   : " + window.WF.formatRupiah(t.sisa_tagihan),
          "Status Piutang : " + t.status_bayar.toUpperCase(),
          "======================================",
        ]);
        break;
      }

      // ---- MUTASI, STOK, & UTANG PEMASOK ----
      case "open-mutasi-form":
        window.WF.navigate("form-mutasi-barang", {
          jenis: target.getAttribute("data-jenis") || "masuk",
        });
        break;

      case "save-stok-minimum": {
        const b = db.barang.find(function (x) {
          return x.id_barang === id;
        });
        const inputEl = document.getElementById("min-stok-" + id);
        if (b && inputEl) {
          const oldMin = b.stok_minimum;
          b.stok_minimum = Math.max(1, Number(inputEl.value) || 1);
          window.WF.recordLog(
            "Stok & Restok",
            "Mengubah batas stok minimum " + b.nama,
            "Min Lama: " + oldMin,
            "Min Baru: " + b.stok_minimum
          );
          window.WF.setFlash(
            "Batas stok minimum " +
              b.nama +
              " diperbarui menjadi " +
              b.stok_minimum +
              " " +
              b.satuan_dasar +
              "."
          );
          window.WF.render();
        }
        break;
      }

      case "advance-restok-status": {
        const r = db.rencana_restok.find(function (x) {
          return x.id_restok === id;
        });
        if (r) {
          r.status = r.status === "Direncanakan" ? "Dipesan" : "Selesai";
          window.WF.save();
          window.WF.setFlash(
            "Status rencana restok " +
              r.nama_barang +
              " diubah menjadi " +
              r.status +
              "."
          );
          window.WF.render();
        }
        break;
      }

      case "open-bayar-pemasok": {
        const t = db.tagihan_pemasok.find(function (x) {
          return x.id_tagihan === id;
        });
        if (!t) break;
        window.WF.openModal({
          title: "Pembayaran Tempo Pemasok (" + t.no_surat_jalan + ")",
          bodyHtml:
            '<div class="wf-stack">' +
            '<div style="font-size:0.875rem;">Pemasok: <strong>' +
            esc(t.nama_pemasok) +
            "</strong> &middot; Sisa Tagihan: <strong>" +
            window.WF.formatRupiah(t.sisa_tagihan) +
            "</strong></div>" +
            '<div class="wf-field">' +
            '<label for="modal-nom-pemasok" class="wf-label">Nominal Pembayaran ke Pemasok (Rp)</label>' +
            '<input id="modal-nom-pemasok" type="number" min="1000" max="' +
            t.sisa_tagihan +
            '" class="wf-input" value="' +
            t.sisa_tagihan +
            '" />' +
            "</div>" +
            '<div class="wf-field">' +
            '<label for="modal-ket-pemasok" class="wf-label">Keterangan / Referensi Transfer</label>' +
            '<input id="modal-ket-pemasok" type="text" class="wf-input" placeholder="Contoh: Pelunasan via Transfer Bank" />' +
            "</div></div>",
          confirmAction: "execute-bayar-pemasok",
          confirmId: id,
          confirmLabel: "Simpan Pembayaran",
        });
        break;
      }

      case "execute-bayar-pemasok": {
        const t = db.tagihan_pemasok.find(function (x) {
          return x.id_tagihan === id;
        });
        if (!t) break;
        const nom =
          Number(document.getElementById("modal-nom-pemasok").value) || 0;
        if (nom <= 0 || nom > t.sisa_tagihan) {
          alert("Nominal pembayaran tidak boleh melebihi sisa tagihan pemasok.");
          return;
        }
        t.sisa_tagihan = Math.max(0, Number(t.sisa_tagihan) - nom);
        t.status = t.sisa_tagihan === 0 ? "Lunas" : "Belum Lunas";
        window.WF.recordLog(
          "Utang Pemasok",
          "Mencatat pembayaran tempo ke " +
            t.nama_pemasok +
            " (" +
            t.no_surat_jalan +
            ")",
          "Nominal: " + window.WF.formatRupiah(nom),
          "Sisa: " + window.WF.formatRupiah(t.sisa_tagihan)
        );
        window.WF.setFlash(
          "Pembayaran tempo ke " + t.nama_pemasok + " berhasil disimpan."
        );
        window.WF.closeModal();
        break;
      }

      // ---- PENGIRIMAN ----
      case "buka-proses-pengiriman":
        window.WF.navigate("form-proses-pengiriman", { id_pengiriman: id });
        break;

      case "detail-penugasan-modal": {
        const k = db.pengiriman.find(function (x) {
          return x.id_pengiriman === id;
        });
        if (!k) break;
        window.WF.openModal({
          title: "Detail Penugasan Pengiriman (" + k.no_nota + ")",
          bodyHtml:
            '<div class="wf-stack" style="font-size:0.875rem;">' +
            "<div><strong>Pemesan:</strong> " +
            esc(k.nama_pelanggan) +
            " (" +
            esc(k.kontak_pelanggan) +
            ")</div>" +
            "<div><strong>Alamat Tujuan:</strong> " +
            esc(k.alamat_tujuan) +
            "</div>" +
            "<div><strong>Barang:</strong> " +
            esc(k.ringkasan_barang) +
            "</div>" +
            "<div><strong>Pengirim:</strong> " +
            esc(k.nama_pengirim) +
            " &middot; <strong>Status:</strong> " +
            esc(k.status) +
            "</div>" +
            "</div>",
        });
        break;
      }

      case "open-tambah-penugasan": {
        const kurirList = db.pengguna.filter(function (u) {
          return u.role === "pengirim";
        });
        window.WF.openModal({
          title: "Buat Penugasan Pengiriman",
          bodyHtml:
            '<div class="wf-stack">' +
            '<div class="wf-field"><label for="m-krm-nota" class="wf-label">Nomor Nota Transaksi</label>' +
            '<input id="m-krm-nota" type="text" class="wf-input" value="INV-20260124-009" /></div>' +
            '<div class="wf-field"><label for="m-krm-pel" class="wf-label">Nama Pelanggan</label>' +
            '<input id="m-krm-pel" type="text" class="wf-input" value="PT Mitra Karya Mandiri" /></div>' +
            '<div class="wf-field"><label class="wf-label">Pilih Pengirim</label>' +
            customSelect({
              id: "m-krm-kurir",
              value: kurirList[0] ? kurirList[0].nama : "",
              options: kurirList.map(function (u) {
                return { value: u.nama, label: u.nama };
              }),
            }) +
            "</div>" +
            '<div class="wf-field"><label for="m-krm-alamat" class="wf-label">Alamat Tujuan Pengiriman</label>' +
            '<input id="m-krm-alamat" type="text" class="wf-input" value="Perumahan Pesona Khayangan Tahap 3, Depok" /></div>' +
            '<div class="wf-field"><label for="m-krm-brg" class="wf-label">Ringkasan Muatan Barang</label>' +
            '<input id="m-krm-brg" type="text" class="wf-input" value="50 Sak Semen Tiga Roda, 10 Kubik Hebel" /></div>' +
            "</div>",
          confirmAction: "execute-tambah-penugasan",
          confirmLabel: "Simpan Penugasan",
        });
        break;
      }

      case "execute-tambah-penugasan": {
        const noNota =
          document.getElementById("m-krm-nota").value.trim() || "INV-NEW";
        const pel =
          document.getElementById("m-krm-pel").value.trim() || "Pelanggan";
        const kurir = document.getElementById("m-krm-kurir").value;
        const alamat = document.getElementById("m-krm-alamat").value.trim();
        const brg = document.getElementById("m-krm-brg").value.trim();

        db.pengiriman.unshift({
          id_pengiriman: "krm-" + Date.now(),
          transaksi_id: "trx-manual",
          no_nota: noNota,
          nama_pelanggan: pel,
          kontak_pelanggan: "0812-3456-7890",
          pengirim_id: "usr-03",
          nama_pengirim: kurir.replace(/\s*\(.*?\)\s*/g, ""),
          alamat_tujuan: alamat,
          ringkasan_barang: brg,
          status: "Menunggu Muat",
          foto_bukti_url: "",
          alasan_penukaran: "",
          foto_barang_url: "",
          tanggal_penugasan: window.WF.nowString(),
          tanggal_terima: "-",
        });
        window.WF.pushNotif(
          "Penugasan Pengiriman",
          kurir,
          "Email & WhatsApp",
          "Penugasan pengiriman baru " + noNota + " menuju " + alamat
        );
        window.WF.recordLog(
          "Pengiriman Barang",
          "Membuat penugasan pengiriman " + noNota + " untuk " + kurir,
          "-",
          alamat
        );
        window.WF.setFlash(
          "Penugasan pengiriman " + noNota + " berhasil dibuat."
        );
        window.WF.closeModal();
        break;
      }

      case "kirim-muat-kendaraan": {
        const k = db.pengiriman.find(function (x) {
          return x.id_pengiriman === id;
        });
        if (k) {
          k.status = "Dalam Perjalanan";
          window.WF.recordLog(
            "Pengiriman Barang",
            "Memeriksa kelengkapan & memuat barang " +
              k.no_nota +
              " ke kendaraan",
            "Status: Menunggu Muat",
            "Status: Dalam Perjalanan"
          );
          window.WF.setFlash(
            "Barang " +
              k.no_nota +
              " telah dimuat ke kendaraan. Status kini: Dalam Perjalanan."
          );
          window.WF.render();
        }
        break;
      }

      case "kirim-lapor-tidak-lengkap": {
        const k = db.pengiriman.find(function (x) {
          return x.id_pengiriman === id;
        });
        if (k) {
          k.status = "Berkendala";
          window.WF.pushNotif(
            "Barang Tidak Lengkap",
            "Kasir",
            "Email & WhatsApp",
            "Pengirim melaporkan muatan barang nota " +
              k.no_nota +
              " di gudang belum lengkap."
          );
          window.WF.recordLog(
            "Pengiriman Barang",
            "Melaporkan barang tidak lengkap pada penugasan " + k.no_nota,
            "Menunggu Muat",
            "Laporan ketidaklengkapan dikirim ke Kasir"
          );
          window.WF.setFlash(
            "Laporan barang tidak lengkap untuk " +
              k.no_nota +
              " telah dikirim ke Kasir."
          );
          window.WF.render();
        }
        break;
      }

      // ---- PENGGUNA & LOG ----
      case "open-add-pengguna":
        window.WF.navigate("form-pengguna", {});
        break;

      case "edit-pengguna":
        window.WF.navigate("form-pengguna", { id_pengguna: id });
        break;

      case "reset-password-pengguna": {
        const usr = db.pengguna.find(function (u) {
          return u.id_pengguna === id;
        });
        if (usr) {
          const tempPass = "KM-" + Math.floor(1000 + Math.random() * 9000);
          usr.password = tempPass;
          window.WF.recordLog(
            "Pengguna & Hak Akses",
            "Mereset password akun " + usr.username,
            "-",
            "Password sementara dibuat"
          );
          window.WF.setFlash(
            "Kata sandi sementara untuk akun " +
              usr.nama +
              " berhasil dibuat: " +
              tempPass +
              "."
          );
          window.WF.render();
        }
        break;
      }

      case "toggle-status-pengguna": {
        const usr = db.pengguna.find(function (u) {
          return u.id_pengguna === id;
        });
        if (usr) {
          usr.status = usr.status === "aktif" ? "nonaktif" : "aktif";
          window.WF.recordLog(
            "Pengguna & Hak Akses",
            "Mengubah status akun " + usr.username + " menjadi " + usr.status,
            "-",
            "Status: " + usr.status
          );
          window.WF.setFlash(
            "Status akun " + usr.nama + " diubah menjadi " + usr.status + "."
          );
          window.WF.render();
        }
        break;
      }

      case "detail-log-modal": {
        const l = db.log_aktivitas.find(function (x) {
          return x.id_log === id;
        });
        if (!l) break;
        window.WF.openModal({
          title: "Detail Log Aktivitas (" + l.modul + ")",
          bodyHtml:
            '<div class="wf-stack" style="font-size:0.875rem;">' +
            "<div><strong>Waktu:</strong> " +
            esc(l.waktu) +
            "</div>" +
            "<div><strong>Pengguna:</strong> " +
            esc(l.nama_pengguna) +
            " (" +
            esc(l.peran) +
            ")</div>" +
            "<div><strong>Aktivitas:</strong> " +
            esc(l.aktivitas) +
            "</div>" +
            '<div class="wf-subtle-panel"><strong>Data Sebelum:</strong><div style="margin-top:4px;">' +
            esc(l.data_sebelum) +
            "</div></div>" +
            '<div class="wf-subtle-panel"><strong>Data Sesudah:</strong><div style="margin-top:4px;">' +
            esc(l.data_sesudah) +
            "</div></div>" +
            "</div>",
        });
        break;
      }

      case "unduh-log-aktivitas":
        window.WF.setFlash(
          "Unduh file Log Aktivitas (Excel / PDF) berhasil dijalankan."
        );
        window.WF.render();
        break;
    }
  });

  // Tutup CustomSelect atau dropdown dengan tombol Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeAllCustomSelects();
    }
  });

  // ==================== INPUT & CHANGE HANDLERS ====================
  document.addEventListener("input", function (e) {
    const t = e.target;

    if (t.getAttribute("data-input") === "header-search") {
      window.WF.ui.headerSearch = t.value;
      window.WF.ui.headerSearchOpen = true;
      window.WF.render();
      const inputEl = document.getElementById("wf-global-search");
      if (inputEl) {
        inputEl.focus();
        inputEl.setSelectionRange(t.value.length, t.value.length);
      }
      return;
    }

    const filterKey = t.getAttribute("data-filter");
    if (filterKey && t.tagName === "INPUT") {
      window.WF.ui.filters[filterKey] = t.value;
      const idAttr = t.id;
      window.WF.render();
      if (idAttr) {
        const el = document.getElementById(idAttr);
        if (el) {
          el.focus();
          el.setSelectionRange(t.value.length, t.value.length);
        }
      }
      return;
    }

    const posInput = t.getAttribute("data-pos-input");
    if (posInput && t.tagName === "INPUT") {
      window.WF.ui.pos[posInput] = t.value;
      const idAttr = t.id;
      window.WF.render();
      if (idAttr) {
        const el = document.getElementById(idAttr);
        if (el && el.type === "text") {
          el.focus();
          el.setSelectionRange(t.value.length, t.value.length);
        } else if (el) {
          el.focus();
        }
      }
      return;
    }
  });

  document.addEventListener("change", function (e) {
    const t = e.target;
    const action = t.getAttribute("data-action");
    const idx = Number(t.getAttribute("data-idx"));
    if (action === "pos-change-qty" && window.WF.ui.pos.cart[idx]) {
      window.WF.ui.pos.cart[idx].jumlah = Math.max(1, Number(t.value) || 1);
      window.WF.render();
    } else if (action === "pos-change-nego" && window.WF.ui.pos.cart[idx]) {
      window.WF.ui.pos.cart[idx].harga_nego_input = t.value;
      window.WF.render();
    }
  });

  // ==================== FORM SUBMIT HANDLERS ====================
  document.addEventListener("submit", function (e) {
    const form = e.target;
    e.preventDefault();
    const db = window.WF.db;

    // 1. SUBMIT LOGIN (Kredensial diketik manual oleh pengguna)
    if (form.id === "wf-login-form") {
      const uname = (form.username.value || "").trim();
      const pass = (form.password.value || "").trim();
      const selectedRole = window.WF.ui.loginSelectedRole || "admin";

      if (!uname || !pass) {
        window.WF.ui.loginError = "Username dan kata sandi wajib diisi.";
        window.WF.render();
        return;
      }

      const matched =
        db.pengguna.find(function (u) {
          return (
            u.role === selectedRole &&
            u.username.toLowerCase() === uname.toLowerCase()
          );
        }) ||
        db.pengguna.find(function (u) {
          return u.role === selectedRole;
        });

      window.WF.ui.currentUser = matched || {
        id_pengguna: "usr-sim",
        nama: uname + " (" + window.WF.ROLE_LABELS[selectedRole] + ")",
        username: uname,
        role: selectedRole,
        status: "aktif",
      };
      window.WF.ui.loginError = "";
      window.WF.recordLog(
        "Autentikasi",
        "Login berhasil sebagai " + window.WF.ui.currentUser.nama,
        "-",
        "Role: " + selectedRole
      );
      window.WF.navigate("dashboard");
      return;
    }

    // 2. SUBMIT FORM TAMBAH / UBAH BARANG (Hitung otomatis Harga Modal & Margin 30%)
    if (form.id === "wf-form-barang") {
      const editId = form.getAttribute("data-edit-id");
      const hargaBeli = Number(form.harga_beli.value) || 0;
      const isiKonv = Math.max(1, Number(form.isi_per_satuan_beli.value) || 1);
      const hargaModal = Math.round(hargaBeli / isiKonv);
      const hargaJualAwal = Math.round(hargaModal * 1.3);
      const satDasar = form.satuan_dasar.value.trim() || "Unit";

      const satuanBarang = [
        {
          id_satuan_barang: "sat-" + Date.now() + "-1",
          nama_satuan: satDasar,
          jumlah_konversi: 1,
          harga_modal: hargaModal,
          margin_persen: 30,
          harga_jual_awal: hargaJualAwal,
        },
      ];

      const sat2Nama = (form.sat2_nama.value || "").trim();
      const sat2Konv = Number(form.sat2_konversi.value) || 1;
      if (sat2Nama && sat2Konv > 1) {
        satuanBarang.push({
          id_satuan_barang: "sat-" + Date.now() + "-2",
          nama_satuan: sat2Nama,
          jumlah_konversi: sat2Konv,
          harga_modal: hargaModal * sat2Konv,
          margin_persen: 28,
          harga_jual_awal: Math.round(hargaModal * sat2Konv * 1.28),
        });
      }

      const payload = {
        id_barang: editId || "brg-" + Date.now(),
        kode_barang: form.kode_barang.value.trim(),
        nama: form.nama.value.trim(),
        kategori: form.kategori.value.trim(),
        barcode: form.barcode.value.trim(),
        barcode_fisik: form.barcode_fisik.value === "true",
        satuan_dasar: satDasar,
        stok: Number(form.stok.value) || 0,
        stok_minimum: Number(form.stok_minimum.value) || 5,
        satuan_pembelian: form.satuan_pembelian.value.trim(),
        isi_per_satuan_beli: isiKonv,
        harga_beli: hargaBeli,
        harga_modal: hargaModal,
        created_at: window.WF.nowString(),
        satuan_barang: satuanBarang,
      };

      if (editId) {
        const idx = db.barang.findIndex(function (b) {
          return b.id_barang === editId;
        });
        if (idx !== -1) db.barang[idx] = payload;
        window.WF.recordLog(
          "Data Barang",
          "Mengubah data barang " + payload.kode_barang + " - " + payload.nama,
          "-",
          "Harga Jual Awal (+30%): " + window.WF.formatRupiah(hargaJualAwal)
        );
        window.WF.setFlash(
          "Data barang " + payload.nama + " berhasil diperbarui."
        );
      } else {
        db.barang.unshift(payload);
        window.WF.recordLog(
          "Data Barang",
          "Menambah barang baru " + payload.kode_barang + " - " + payload.nama,
          "-",
          "Harga Modal: " +
            window.WF.formatRupiah(hargaModal) +
            " | Harga Jual Awal (+30%): " +
            window.WF.formatRupiah(hargaJualAwal)
        );
        window.WF.setFlash(
          "Barang " +
            payload.nama +
            " berhasil disimpan dengan Harga Jual Awal " +
            window.WF.formatRupiah(hargaJualAwal) +
            " / " +
            satDasar +
            "."
        );
      }
      window.WF.navigate("data-barang");
      return;
    }

    // 3. SUBMIT FORM PELANGGAN
    if (form.id === "wf-form-pelanggan") {
      const editId = form.getAttribute("data-edit-id");
      const existing = editId
        ? db.pelanggan.find(function (p) {
            return p.id_pelanggan === editId;
          })
        : null;

      const payload = {
        id_pelanggan: editId || "pel-" + Date.now(),
        nama: form.nama.value.trim(),
        jenis: form.jenis.value,
        kontak: form.kontak.value.trim(),
        alamat: form.alamat.value.trim(),
        batas_kasbon: Number(form.batas_kasbon.value) || 0,
        status_kasbon: form.status_kasbon.value,
        sisa_piutang: existing ? existing.sisa_piutang : 0,
        created_at: existing ? existing.created_at : window.WF.nowString(),
      };

      if (editId) {
        const idx = db.pelanggan.findIndex(function (p) {
          return p.id_pelanggan === editId;
        });
        if (idx !== -1) db.pelanggan[idx] = payload;
        window.WF.setFlash(
          "Data pelanggan " + payload.nama + " berhasil diperbarui."
        );
      } else {
        db.pelanggan.push(payload);
        window.WF.setFlash(
          "Pelanggan baru " + payload.nama + " berhasil ditambahkan."
        );
      }
      window.WF.recordLog(
        "Data Pelanggan",
        (editId ? "Mengubah" : "Menambah") + " pelanggan " + payload.nama,
        "-",
        "Batas Kasbon: " + window.WF.formatRupiah(payload.batas_kasbon)
      );
      window.WF.navigate("data-pelanggan");
      return;
    }

    // 4. SUBMIT FORM PENUKARAN BARANG
    if (form.id === "wf-form-penukaran") {
      const trx =
        db.transaksi.find(function (t) {
          return t.id_transaksi === form.transaksi_id.value;
        }) || db.transaksi[0];
      const brgGanti =
        db.barang.find(function (b) {
          return b.id_barang === form.barang_pengganti_id.value;
        }) || db.barang[0];
      const qtyGanti = Number(form.jumlah_pengganti.value) || 1;
      const selisih = Number(form.selisih_harga.value) || 0;
      const kondisi = form.kondisi_barang.value;

      brgGanti.stok = Math.max(0, Number(brgGanti.stok) - qtyGanti);

      const newPnk = {
        id_penukaran: "pnk-" + Date.now(),
        transaksi_id: trx.id_transaksi,
        no_nota: trx.no_nota,
        nama_pelanggan: trx.nama_pelanggan,
        status: "selesai",
        alasan_penukaran: form.alasan_penukaran.value.trim(),
        alasan_penolakan: "",
        barang_asal: form.barang_asal.value.trim(),
        kondisi_barang: kondisi,
        barang_pengganti:
          brgGanti.nama + " (" + qtyGanti + " " + brgGanti.satuan_dasar + ")",
        selisih_harga: selisih,
        tanggal_pengajuan: window.WF.nowString(),
        tanggal_selesai: window.WF.nowString(),
      };
      db.penukaran.unshift(newPnk);
      window.WF.recordLog(
        "Penukaran Barang",
        "Memproses penukaran barang nota " + trx.no_nota,
        newPnk.barang_asal + " (" + kondisi + ")",
        "Diganti: " + newPnk.barang_pengganti
      );
      window.WF.navigate("penukaran-barang");
      window.WF.openReceipt("Struk Penukaran Barang (" + trx.no_nota + ")", [
        "======================================",
        "        STRUK PENUKARAN BARANG        ",
        "          CV KURNIA MANDIRI           ",
        "======================================",
        "Nota Asal        : " + trx.no_nota,
        "Pelanggan        : " + trx.nama_pelanggan,
        "Barang Kembali   : " + newPnk.barang_asal,
        "Kondisi Kembali  : " + kondisi,
        "Barang Pengganti : " + newPnk.barang_pengganti,
        "Selisih Dibayar  : " + window.WF.formatRupiah(selisih),
        "======================================",
      ]);
      return;
    }

    // 5. SUBMIT FORM MUTASI BARANG MASUK / KELUAR
    if (form.id === "wf-form-mutasi") {
      const jenis = form.getAttribute("data-jenis") || "masuk";
      const brg =
        db.barang.find(function (b) {
          return b.id_barang === form.barang_id.value;
        }) || db.barang[0];
      const qty = Math.max(1, Number(form.jumlah.value) || 1);
      const stokSebelum = Number(brg.stok);
      const stokSesudah =
        jenis === "masuk" ? stokSebelum + qty : Math.max(0, stokSebelum - qty);
      brg.stok = stokSesudah;

      const sup =
        jenis === "masuk"
          ? db.pemasok.find(function (s) {
              return s.id_pemasok === form.pemasok_id.value;
            })
          : null;
      const noSj =
        jenis === "masuk"
          ? form.no_surat_jalan.value.trim()
          : "OUT-" + Date.now();
      const jenisBayar = jenis === "masuk" ? form.jenis_bayar.value : "-";
      const hargaBeli =
        jenis === "masuk" ? Number(form.harga_beli.value) || 0 : 0;

      const newMut = {
        id_mutasi: "mut-" + Date.now(),
        pengguna_id: window.WF.ui.currentUser.id_pengguna,
        nama_pengguna: window.WF.ui.currentUser.nama,
        pemasok_id: sup ? sup.id_pemasok : null,
        nama_pemasok: sup ? sup.nama : "-",
        jenis: jenis,
        no_surat_jalan: noSj,
        jenis_bayar: jenisBayar,
        tujuan: jenis === "masuk" ? "Gudang Utama" : form.tujuan.value.trim(),
        alasan:
          jenis === "masuk" ? "Penerimaan Pemasok" : form.alasan.value.trim(),
        tanggal: window.WF.nowString(),
        barang_nama: brg.nama,
        satuan_pembelian: brg.satuan_dasar,
        jumlah: qty,
        harga_beli: hargaBeli,
        subtotal: hargaBeli,
        stok_sebelum: stokSebelum,
        stok_sesudah: stokSesudah,
      };
      db.mutasi_barang.unshift(newMut);

      if (jenis === "masuk" && jenisBayar === "tempo" && sup) {
        db.tagihan_pemasok.unshift({
          id_tagihan: "tgp-" + Date.now(),
          pemasok_id: sup.id_pemasok,
          nama_pemasok: sup.nama,
          mutasi_id: newMut.id_mutasi,
          no_surat_jalan: noSj,
          jumlah_tagihan: hargaBeli,
          sisa_tagihan: hargaBeli,
          tanggal_jatuh_tempo: form.tanggal_jatuh_tempo.value || "2026-02-15",
          status: "Belum Lunas",
          created_at: window.WF.nowString(),
          riwayat_bayar: [],
        });
      }

      window.WF.recordLog(
        "Barang Masuk & Keluar",
        "Mencatat barang " +
          jenis +
          " (" +
          brg.nama +
          " sebanyak " +
          qty +
          " " +
          brg.satuan_dasar +
          ")",
        "Stok Sebelum: " + stokSebelum,
        "Stok Sesudah: " + stokSesudah
      );
      window.WF.setFlash(
        "Mutasi barang " +
          brg.nama +
          " berhasil disimpan. Stok kini: " +
          stokSesudah +
          " " +
          brg.satuan_dasar +
          "."
      );
      window.WF.navigate("barang-masuk-keluar");
      return;
    }

    // 6. SUBMIT FORM RENCANA RESTOK
    if (form.id === "wf-form-restok") {
      const brg =
        db.barang.find(function (b) {
          return b.id_barang === form.barang_id.value;
        }) || db.barang[0];
      const qty = Number(form.jumlah_restok.value) || 50;
      const supNama = form.pemasok_nama.value;

      db.rencana_restok.unshift({
        id_restok: "rst-" + Date.now(),
        barang_id: brg.id_barang,
        kode_barang: brg.kode_barang,
        nama_barang: brg.nama,
        stok_saat_ini: brg.stok,
        stok_minimum: brg.stok_minimum,
        jumlah_restok: qty,
        satuan: brg.satuan_dasar,
        pemasok_nama: supNama,
        status: "Direncanakan",
        tanggal: window.WF.nowString(),
      });
      window.WF.recordLog(
        "Stok & Restok",
        "Merencanakan restok " +
          brg.nama +
          " sebanyak " +
          qty +
          " " +
          brg.satuan_dasar,
        "Stok: " + brg.stok,
        "Rencana Restok: " + qty
      );
      window.WF.setFlash("Rencana restok " + brg.nama + " berhasil disimpan.");
      window.WF.render();
      return;
    }

    // 7. SUBMIT FORM TAGIHAN PEMASOK
    if (form.id === "wf-form-tagihan-pemasok") {
      const sup =
        db.pemasok.find(function (s) {
          return s.id_pemasok === form.pemasok_id.value;
        }) || db.pemasok[0];
      const jml = Number(form.jumlah_tagihan.value) || 0;
      const noSj = form.no_surat_jalan.value.trim();

      db.tagihan_pemasok.unshift({
        id_tagihan: "tgp-" + Date.now(),
        pemasok_id: sup.id_pemasok,
        nama_pemasok: sup.nama,
        mutasi_id: "-",
        no_surat_jalan: noSj,
        jumlah_tagihan: jml,
        sisa_tagihan: jml,
        tanggal_jatuh_tempo: form.tanggal_jatuh_tempo.value,
        status: "Belum Lunas",
        created_at: window.WF.nowString(),
        riwayat_bayar: [],
      });
      window.WF.recordLog(
        "Utang Pemasok",
        "Menambah tagihan tempo pemasok " + sup.nama + " (" + noSj + ")",
        "-",
        "Tagihan: " + window.WF.formatRupiah(jml)
      );
      window.WF.setFlash(
        "Tagihan tempo pemasok " + sup.nama + " berhasil ditambahkan."
      );
      window.WF.navigate("utang-pemasok");
      return;
    }

    // 8. SUBMIT BUKTI PENERIMAAN PENGIRIMAN
    if (form.id === "wf-form-bukti-kirim") {
      const id = form.getAttribute("data-id");
      const k = db.pengiriman.find(function (x) {
        return x.id_pengiriman === id;
      });
      if (k) {
        k.status = "Terkirim";
        k.foto_bukti_url = form.foto_bukti_url.value.trim();
        k.tanggal_terima = window.WF.nowString();
        window.WF.pushNotif(
          "Pengiriman Selesai",
          "Kasir & Pemilik",
          "Email & WhatsApp",
          "Pengiriman " +
            k.no_nota +
            " (" +
            k.nama_pelanggan +
            ") telah selesai diterima beserta bukti foto."
        );
        window.WF.recordLog(
          "Pengiriman Barang",
          "Mengunggah bukti penerimaan & menyelesaikan pengiriman " + k.no_nota,
          "Dalam Perjalanan",
          "Terkirim (" + k.foto_bukti_url + ")"
        );
        window.WF.setFlash(
          "Pengiriman " +
            k.no_nota +
            " selesai (Terkirim) dan bukti penerimaan tersimpan."
        );
        window.WF.navigate("pengiriman-barang");
      }
      return;
    }

    // 9. SUBMIT PENGAJUAN PENUKARAN DARI LOKASI PENGIRIMAN
    if (form.id === "wf-form-tukar-kirim") {
      const id = form.getAttribute("data-id");
      const k = db.pengiriman.find(function (x) {
        return x.id_pengiriman === id;
      });
      if (k) {
        k.status = "Pengajuan Penukaran";
        k.alasan_penukaran = form.alasan_penukaran.value.trim();
        window.WF.pushNotif(
          "Pengajuan Penukaran",
          "Kasir",
          "Email & WhatsApp",
          "Pelanggan pada pengiriman " +
            k.no_nota +
            " mengajukan penukaran: " +
            k.alasan_penukaran
        );
        window.WF.recordLog(
          "Pengiriman Barang",
          "Mencatat pengajuan penukaran dari lokasi pelanggan (" +
            k.no_nota +
            ")",
          "Dalam Perjalanan",
          "Pengajuan Penukaran: " + k.alasan_penukaran
        );
        window.WF.setFlash(
          "Pengajuan penukaran barang pada " +
            k.no_nota +
            " berhasil dikirim ke Kasir."
        );
        window.WF.navigate("pengiriman-barang");
      }
      return;
    }

    // 10. SUBMIT LAPORAN KENDALA PENGIRIMAN
    if (form.id === "wf-form-kendala") {
      const k =
        db.pengiriman.find(function (x) {
          return x.id_pengiriman === form.pengiriman_id.value;
        }) || db.pengiriman[0];
      const jenis = form.jenis_kendala.value;
      const desc = form.deskripsi.value.trim();

      k.status = "Berkendala";
      db.laporan_kendala.unshift({
        id_laporan: "knd-" + Date.now(),
        pengiriman_id: k.id_pengiriman,
        no_nota: k.no_nota,
        nama_pengirim: k.nama_pengirim,
        jenis_kendala: jenis,
        deskripsi: desc,
        created_at: window.WF.nowString(),
      });
      window.WF.pushNotif(
        "Kendala Pengiriman",
        "Kasir & Pemilik",
        "Email & WhatsApp",
        "Laporan kendala pada " + k.no_nota + ": " + jenis + " - " + desc
      );
      window.WF.recordLog(
        "Laporan Kendala",
        "Melaporkan kendala pengiriman " + k.no_nota + " (" + jenis + ")",
        "-",
        desc
      );
      window.WF.setFlash(
        "Laporan kendala pengiriman " + k.no_nota + " berhasil disimpan."
      );
      window.WF.render();
      return;
    }

    // 11. SUBMIT FORM TAMBAH / UBAH PENGGUNA
    if (form.id === "wf-form-pengguna") {
      const editId = form.getAttribute("data-edit-id");
      const existing = editId
        ? db.pengguna.find(function (u) {
            return u.id_pengguna === editId;
          })
        : null;

      const payload = {
        id_pengguna: editId || "usr-" + Date.now(),
        nama: form.nama.value.trim(),
        username: form.username.value.trim(),
        password:
          form.password.value.trim() || (existing ? existing.password : "123"),
        role: form.role.value,
        status: form.status.value,
        created_at: existing ? existing.created_at : window.WF.nowString(),
      };

      if (editId) {
        const idx = db.pengguna.findIndex(function (u) {
          return u.id_pengguna === editId;
        });
        if (idx !== -1) db.pengguna[idx] = payload;
        window.WF.setFlash(
          "Hak akses akun " + payload.nama + " berhasil diperbarui."
        );
      } else {
        db.pengguna.push(payload);
        window.WF.setFlash(
          "Akun pengguna baru " + payload.nama + " berhasil ditambahkan."
        );
      }
      window.WF.recordLog(
        "Pengguna & Hak Akses",
        (editId ? "Mengubah" : "Menambah") +
          " akun " +
          payload.username +
          " (" +
          payload.role +
          ")",
        "-",
        "Status: " + payload.status
      );
      window.WF.navigate("pengguna-dan-hak-akses");
      return;
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    window.WF.render();
  });
})();
