/*
  Komponen UI Standar Wireframe Grayscale TB Kurnia Mandiri
  Mengacu langsung pada komponen aplikasi asli (SidebarUtama, HeaderUtama, PageHeader,
  CustomSelect, ResponsiveTabs, StatusBadge, dan Modal).
  - Sidebar tanpa tombol X dan tanpa info akun di bawah (karena profil & Keluar berada di dropdown Header).
  - Header dilengkapi tombol Pengaturan Tampilan (Settings), Notifikasi (Bell), dan Dropdown Profil (Keluar).
*/

(function () {
  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initials(nama) {
    return String(nama || "U")
      .replace(/\(.*?\)/g, "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(function (w) {
        return (w[0] || "").toUpperCase();
      })
      .join("");
  }

  const ICON_PATHS = {
    dashboard:
      '<rect x="3" y="3" width="7" height="9" rx="1"></rect><rect x="14" y="3" width="7" height="5" rx="1"></rect><rect x="14" y="12" width="7" height="9" rx="1"></rect><rect x="3" y="16" width="7" height="5" rx="1"></rect>',
    receipt:
      '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path><path d="M14 8H8"></path><path d="M16 12H8"></path><path d="M13 16H8"></path>',
    users:
      '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
    package:
      '<path d="M16.5 9.4 7.55 4.24"></path><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line>',
    truck:
      '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle>',
    settings:
      '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>',
    shield:
      '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path>',
    "user-check":
      '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline>',
    "user-cog":
      '<circle cx="18" cy="15" r="3"></circle><circle cx="9" cy="7" r="4"></circle><path d="M10 15H6a4 4 0 0 0-4 4v2"></path><path d="m21.7 16.4-.9-.3"></path><path d="m15.2 13.9-.9-.3"></path><path d="m16.6 18.7.3-.9"></path><path d="m19.1 12.2.3-.9"></path><path d="m19.6 18.7-.4-1"></path><path d="m16.8 12.3-.4-1"></path><path d="m14.3 16.6 1-.4"></path><path d="m20.7 13.8 1-.4"></path>',
    user:
      '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
    lock:
      '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
    eye:
      '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle>',
    "eye-off":
      '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"></path><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"></path><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"></path><path d="m2 2 20 20"></path>',
    "log-in":
      '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" x2="3" y1="12" y2="12"></line>',
    "log-out":
      '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line>',
    search:
      '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>',
    bell:
      '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>',
    menu:
      '<path d="M4 6h16"></path><path d="M4 12h10"></path><path d="M4 18h16"></path>',
    image:
      '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>',
    sun:
      '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>',
    moon:
      '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>',
    "chevron-down": '<path d="m6 9 6 6 6-6"></path>',
    "chevron-right": '<path d="m9 18 6-6-6-6"></path>',
    "chevron-left": '<path d="m15 18-6-6 6-6"></path>',
    "arrow-left": '<path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path>',
    plus: '<path d="M5 12h14"></path><path d="M12 5v14"></path>',
    minus: '<path d="M5 12h14"></path>',
    check: '<path d="M20 6 9 17l-5-5"></path>',
    "check-circle":
      '<circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path>',
    clock:
      '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
    alert:
      '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path>',
    x: '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>',
    trash:
      '<path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>',
    edit:
      '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>',
    refresh:
      '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path>',
    printer:
      '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"></path><rect x="6" y="14" width="12" height="8" rx="1"></rect>',
    download:
      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line>',
    barcode:
      '<path d="M3 5v14"></path><path d="M8 5v14"></path><path d="M12 5v14"></path><path d="M17 5v14"></path><path d="M21 5v14"></path>',
    banknote:
      '<rect width="20" height="12" x="2" y="6" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path>',
  };

  function icon(name, extraClass) {
    const body = ICON_PATHS[name] || ICON_PATHS.package;
    return (
      '<svg class="wf-icon' +
      (extraClass ? " " + esc(extraClass) : "") +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      body +
      "</svg>"
    );
  }

  // Komponen CustomSelect konsisten (mengacu components/ui/custom-select.tsx, anti-overflow)
  function customSelect(cfg) {
    const selectId = cfg.id || (cfg.name ? "sel-" + cfg.name : "sel-auto");
    const options = cfg.options || [];
    const currentVal =
      cfg.value !== undefined && cfg.value !== null
        ? String(cfg.value)
        : options[0]
          ? String(options[0].value)
          : "";
    const selectedOpt =
      options.find(function (o) {
        return String(o.value) === currentVal;
      }) ||
      options[0] || { value: currentVal, label: currentVal };

    const isOpen =
      window.WF && window.WF.ui && window.WF.ui.openSelectId === selectId;

    const dataAttrs =
      (cfg.filter ? ' data-filter="' + esc(cfg.filter) + '"' : "") +
      (cfg.posInput ? ' data-pos-input="' + esc(cfg.posInput) + '"' : "") +
      (cfg.setFilter ? ' data-set-filter="' + esc(cfg.setFilter) + '"' : "") +
      (cfg.pageSizeKey
        ? ' data-page-size-key="' + esc(cfg.pageSizeKey) + '"'
        : "") +
      (cfg.action ? ' data-action="' + esc(cfg.action) + '"' : "") +
      (cfg.idx !== undefined ? ' data-idx="' + esc(cfg.idx) + '"' : "");

    const optsHtml = options
      .map(function (o) {
        const isSel = String(o.value) === String(selectedOpt.value);
        return (
          '<button type="button" role="option" aria-selected="' +
          (isSel ? "true" : "false") +
          '" class="wf-custom-select-option' +
          (isSel ? " is-selected" : "") +
          '" data-select-option="' +
          esc(selectId) +
          '" data-value="' +
          esc(o.value) +
          '" data-label="' +
          esc(o.label) +
          '">' +
          "<span>" +
          esc(o.label) +
          "</span>" +
          '<span class="wf-option-check">' +
          icon("check", "wf-icon-sm") +
          "</span>" +
          "</button>"
        );
      })
      .join("");

    return (
      '<div class="wf-custom-select' +
      (isOpen ? " is-open" : "") +
      (cfg.size === "sm" ? " wf-custom-select-sm" : "") +
      (cfg.placement === "top" ? " wf-custom-select-top" : "") +
      '" data-select-wrap="' +
      esc(selectId) +
      '"' +
      (cfg.width ? ' style="width:' + esc(cfg.width) + ';max-width:100%;"' : "") +
      dataAttrs +
      ">" +
      '<input type="hidden" id="' +
      esc(selectId) +
      '"' +
      (cfg.name ? ' name="' + esc(cfg.name) + '"' : "") +
      ' value="' +
      esc(selectedOpt.value) +
      '" />' +
      '<button type="button" class="wf-custom-select-trigger" data-toggle-select="' +
      esc(selectId) +
      '" aria-haspopup="listbox" aria-expanded="' +
      (isOpen ? "true" : "false") +
      '">' +
      '<span class="wf-custom-select-label">' +
      esc(selectedOpt.label) +
      "</span>" +
      '<span class="wf-custom-select-chevron">' +
      icon("chevron-down", "wf-icon-sm") +
      "</span>" +
      "</button>" +
      '<div class="wf-custom-select-menu" role="listbox">' +
      optsHtml +
      "</div>" +
      "</div>"
    );
  }

  // Komponen ResponsiveTabs (mengacu components/ui/responsive-tabs.tsx)
  function responsiveTabs(cfg) {
    const filterKey = cfg.filterKey;
    const currentVal = cfg.value;
    const options = cfg.options || [];

    const mobileSelect = customSelect({
      id: "rtab-" + filterKey,
      value: currentVal,
      setFilter: filterKey,
      options: options,
    });

    const desktopBtns = options
      .map(function (o) {
        const active = String(o.value) === String(currentVal);
        return (
          '<button type="button" role="tab" aria-selected="' +
          (active ? "true" : "false") +
          '" class="wf-tab-btn' +
          (active ? " is-active" : "") +
          '" data-set-filter="' +
          esc(filterKey) +
          '" data-val="' +
          esc(o.value) +
          '">' +
          esc(o.label) +
          "</button>"
        );
      })
      .join("");

    return (
      '<div class="wf-responsive-tabs">' +
      '<div class="wf-tabs-mobile">' +
      mobileSelect +
      "</div>" +
      '<div class="wf-tabs wf-tabs-desktop" role="tablist">' +
      desktopBtns +
      "</div>" +
      "</div>"
    );
  }

  // Badge status grayscale dengan ikon SVG (mengacu components/ui/status-badge.tsx)
  function statusBadge(statusText) {
    const raw = String(statusText || "").toLowerCase();
    let cls = "wf-badge wf-badge-outline";
    let iconName = "clock";
    let label = statusText;

    if (
      raw === "lunas" ||
      raw === "disetujui" ||
      raw === "terkirim" ||
      raw === "selesai" ||
      raw === "aktif" ||
      raw === "aman" ||
      raw === "berhasil" ||
      raw === "barang masuk"
    ) {
      cls = "wf-badge wf-badge-dark";
      iconName = "check-circle";
      if (raw === "lunas") label = "Lunas";
      else if (raw === "disetujui") label = "Disetujui";
      else if (raw === "terkirim") label = "Terkirim";
      else if (raw === "selesai") label = "Selesai";
      else if (raw === "aktif") label = "Aktif";
      else if (raw === "aman") label = "Stok Aman";
    } else if (
      raw === "belum_lunas" ||
      raw === "belum lunas" ||
      raw === "sebagian" ||
      raw === "menunggu" ||
      raw === "menunggu muat" ||
      raw === "dalam perjalanan" ||
      raw === "direncanakan" ||
      raw === "dipesan" ||
      raw === "menipis"
    ) {
      cls = "wf-badge wf-badge-dashed";
      iconName = "clock";
      if (raw === "belum_lunas") label = "Belum Lunas";
      else if (raw === "sebagian") label = "Bayar Sebagian";
      else if (raw === "menunggu") label = "Menunggu";
      else if (raw === "menipis") label = "Stok Menipis";
    } else if (
      raw === "ditolak" ||
      raw === "nonaktif" ||
      raw === "berkendala" ||
      raw === "pengajuan penukaran" ||
      raw === "jatuh tempo" ||
      raw === "habis" ||
      raw === "rusak"
    ) {
      cls = "wf-badge wf-badge-outline";
      iconName = "alert";
      if (raw === "ditolak") label = "Ditolak";
      else if (raw === "nonaktif") label = "Nonaktif";
      else if (raw === "habis") label = "Stok Habis";
    } else {
      cls = "wf-badge wf-badge-muted";
    }

    return (
      '<span class="' +
      cls +
      '">' +
      icon(iconName, "wf-icon-sm") +
      "<span>" +
      esc(label) +
      "</span></span>"
    );
  }

  function pageHeader(crumbs, title, actionsHtml) {
    const list = crumbs || [];
    const crumbItems = list
      .map(function (c, i) {
        const isLast = i === list.length - 1;
        const sep =
          i > 0
            ? '<span aria-hidden="true">' +
              icon("chevron-right", "wf-icon-sm") +
              "</span>"
            : "";
        if (c.page && !isLast) {
          return (
            '<li class="wf-breadcrumb-item">' +
            sep +
            '<button type="button" class="wf-breadcrumb-link" data-nav="' +
            esc(c.page) +
            '">' +
            esc(c.label) +
            "</button></li>"
          );
        }
        return (
          '<li class="wf-breadcrumb-item">' +
          sep +
          '<span class="' +
          (isLast ? "wf-breadcrumb-current" : "") +
          '">' +
          esc(c.label) +
          "</span></li>"
        );
      })
      .join("");

    return (
      '<div class="wf-page-header">' +
      '<div style="min-width:0;">' +
      '<nav aria-label="Breadcrumb">' +
      '<ol class="wf-breadcrumb">' +
      crumbItems +
      "</ol>" +
      "</nav>" +
      '<h1 class="wf-page-title">' +
      esc(title) +
      "</h1>" +
      "</div>" +
      (actionsHtml
        ? '<div class="wf-page-actions">' + actionsHtml + "</div>"
        : "") +
      "</div>"
    );
  }

  // Sidebar tanpa tombol X dan tanpa info akun di bagian bawah (sesuai permintaan revisi)
  function renderSidebar() {
    const u = window.WF.ui.currentUser;
    if (!u) return "";
    const role = u.role;
    const currentPage = window.WF.ui.currentPage;
    const sidebarSkin = window.WF.ui.sidebarSkin || "default";

    const parentPageMap = {
      "form-barang": "data-barang",
      "cetak-barcode": "data-barang",
      "form-pelanggan": "data-pelanggan",
      "detail-pelanggan": "data-pelanggan",
      "form-penukaran-barang": "penukaran-barang",
      "form-mutasi-barang": "barang-masuk-keluar",
      "form-tagihan-pemasok": "utang-pemasok",
      "form-proses-pengiriman": "pengiriman-barang",
      "form-pengguna": "pengguna-dan-hak-akses",
    };
    const activeMenuPage = parentPageMap[currentPage] || currentPage;

    const itemIconMap = {
      dashboard: "dashboard",
      "grup-penjualan": "receipt",
      "grup-piutang": "users",
      "grup-persediaan": "package",
      "grup-pengiriman": "truck",
      "grup-sistem": "settings",
    };

    const groupsHtml = window.WF.MENU_GROUPS.map(function (group) {
      const visibleItems = group.items
        .map(function (item) {
          if (item.roles.indexOf(role) === -1) return null;
          if (item.children) {
            const visibleChildren = item.children.filter(function (c) {
              return c.roles.indexOf(role) !== -1;
            });
            if (visibleChildren.length === 0) return null;
            return Object.assign({}, item, { children: visibleChildren });
          }
          return item;
        })
        .filter(Boolean);

      if (visibleItems.length === 0) return "";
      const isGroupOpen = window.WF.ui.openGroups[group.label] !== false;

      const itemsHtml = visibleItems
        .map(function (item) {
          const ic = icon(itemIconMap[item.id] || "package");
          if (item.page) {
            const isActive = activeMenuPage === item.page;
            return (
              "<li>" +
              '<button type="button" class="wf-nav-link ' +
              (isActive ? "is-active" : "") +
              '" data-nav="' +
              esc(item.page) +
              '">' +
              '<span class="wf-nav-link-main">' +
              ic +
              "<span>" +
              esc(item.label) +
              "</span></span>" +
              "</button>" +
              "</li>"
            );
          }

          const hasActiveChild = item.children.some(function (c) {
            return c.page === activeMenuPage;
          });
          const subOpen = window.WF.ui.openSubMenus[item.id] !== false;

          const subItemsHtml = item.children
            .map(function (sub) {
              const subActive = activeMenuPage === sub.page;
              return (
                "<li>" +
                '<button type="button" class="wf-subnav-link ' +
                (subActive ? "is-active" : "") +
                '" data-nav="' +
                esc(sub.page) +
                '">' +
                "<span>" +
                esc(sub.label) +
                "</span>" +
                "</button>" +
                "</li>"
              );
            })
            .join("");

          return (
            "<li>" +
            '<button type="button" class="wf-nav-link ' +
            (hasActiveChild ? "is-active" : "") +
            '" data-toggle-submenu="' +
            esc(item.id) +
            '" aria-expanded="' +
            (subOpen ? "true" : "false") +
            '">' +
            '<span class="wf-nav-link-main">' +
            ic +
            "<span>" +
            esc(item.label) +
            "</span></span>" +
            '<span class="wf-chevron-rot ' +
            (subOpen ? "" : "is-closed") +
            '">' +
            icon("chevron-down", "wf-icon-sm") +
            "</span>" +
            "</button>" +
            (subOpen
              ? '<ul class="wf-subnav-list">' + subItemsHtml + "</ul>"
              : "") +
            "</li>"
          );
        })
        .join("");

      return (
        '<div class="wf-nav-group">' +
        '<button type="button" class="wf-nav-group-btn" data-toggle-group="' +
        esc(group.label) +
        '" aria-expanded="' +
        (isGroupOpen ? "true" : "false") +
        '">' +
        "<span>" +
        esc(group.label) +
        "</span>" +
        '<span class="wf-chevron-rot ' +
        (isGroupOpen ? "" : "is-closed") +
        '">' +
        icon("chevron-down", "wf-icon-sm") +
        "</span>" +
        "</button>" +
        (isGroupOpen ? '<ul class="wf-nav-list">' + itemsHtml + "</ul>" : "") +
        "</div>"
      );
    }).join("");

    return (
      '<div class="wf-sidebar-backdrop ' +
      (window.WF.ui.sidebarMobileOpen ? "is-active" : "") +
      '" data-action="close-mobile-sidebar"></div>' +
      '<aside class="wf-sidebar ' +
      (window.WF.ui.sidebarCollapsed ? "is-collapsed-desktop " : "") +
      (window.WF.ui.sidebarMobileOpen ? "is-open-mobile" : "") +
      '" data-sidebar-skin="' +
      esc(sidebarSkin) +
      '" aria-label="Navigasi Sidebar">' +
      '<div class="wf-sidebar-header">' +
      '<a href="#dashboard" class="wf-brand-wordmark" data-nav="dashboard">' +
      "<span>Kurnia Mandiri</span>" +
      '<span class="wf-brand-dot" aria-hidden="true"></span>' +
      "</a>" +
      "</div>" +
      '<nav class="wf-sidebar-nav">' +
      groupsHtml +
      "</nav>" +
      "</aside>"
    );
  }

  // Header dilengkapi Tombol Setting (Pengaturan Tampilan), Notifikasi, & Dropdown Profil (Keluar)
  function renderHeader() {
    const u = window.WF.ui.currentUser;
    if (!u) return "";

    const unreadNotifs = window.WF.db.notifikasi.filter(function (n) {
      return !n.dibaca;
    });

    const skinMode = window.WF.ui.skinMode || "light";
    const sidebarSkin = window.WF.ui.sidebarSkin || "default";
    const textSize = window.WF.ui.textSize || "sedang";

    const q = (window.WF.ui.headerSearch || "").trim().toLowerCase();
    const searchResults = [];

    if (window.WF.ui.headerSearchOpen) {
      window.WF.MENU_GROUPS.forEach(function (g) {
        g.items.forEach(function (it) {
          if (it.page && window.WF.canAccess(it.page, u.role)) {
            if (!q || it.label.toLowerCase().indexOf(q) !== -1) {
              searchResults.push({
                kategori: "Halaman",
                judul: it.label,
                sub: g.label,
                page: it.page,
              });
            }
          }
          if (it.children) {
            it.children.forEach(function (c) {
              if (window.WF.canAccess(c.page, u.role)) {
                if (!q || c.label.toLowerCase().indexOf(q) !== -1) {
                  searchResults.push({
                    kategori: "Halaman",
                    judul: c.label,
                    sub: g.label + " / " + it.label,
                    page: c.page,
                  });
                }
              }
            });
          }
        });
      });

      if (q && window.WF.canAccess("barang-masuk-keluar", u.role)) {
        window.WF.db.barang.forEach(function (b) {
          if (
            b.nama.toLowerCase().indexOf(q) !== -1 ||
            b.kode_barang.toLowerCase().indexOf(q) !== -1
          ) {
            searchResults.push({
              kategori: "Barang",
              judul: b.kode_barang + " - " + b.nama,
              sub: "Stok: " + b.stok + " " + b.satuan_dasar,
              page: u.role === "admin" ? "data-barang" : "barang-masuk-keluar",
            });
          }
        });
      }

      if (q && window.WF.canAccess("riwayat-transaksi", u.role)) {
        window.WF.db.transaksi.forEach(function (t) {
          if (
            t.no_nota.toLowerCase().indexOf(q) !== -1 ||
            t.nama_pelanggan.toLowerCase().indexOf(q) !== -1
          ) {
            searchResults.push({
              kategori: "Nota",
              judul: t.no_nota + " (" + t.nama_pelanggan + ")",
              sub: window.WF.formatRupiah(t.total),
              page: "riwayat-transaksi",
            });
          }
        });
      }
    }

    const searchDropdownHtml = window.WF.ui.headerSearchOpen
      ? '<div class="wf-search-dropdown">' +
        '<div style="padding:6px 10px;font-size:0.6875rem;font-weight:700;color:var(--wf-text-muted);text-transform:uppercase;letter-spacing:0.05em;">' +
        (q
          ? "Hasil Pencarian (" + searchResults.length + ")"
          : "Pintasan Halaman") +
        "</div>" +
        (searchResults.length === 0
          ? '<div style="padding:12px 10px;font-size:0.875rem;color:var(--wf-text-secondary);">Tidak ada hasil yang cocok.</div>'
          : searchResults
              .slice(0, 8)
              .map(function (r) {
                return (
                  '<button type="button" class="wf-nav-link" data-nav="' +
                  esc(r.page) +
                  '" style="min-height:38px;padding:6px 10px;">' +
                  '<div style="min-width:0;">' +
                  '<div style="font-weight:600;font-size:0.875rem;color:var(--wf-text);">' +
                  esc(r.judul) +
                  "</div>" +
                  '<div style="font-size:0.75rem;color:var(--wf-text-muted);">' +
                  esc(r.sub) +
                  "</div>" +
                  "</div>" +
                  '<span class="wf-badge wf-badge-muted">' +
                  esc(r.kategori) +
                  "</span>" +
                  "</button>"
                );
              })
              .join("")) +
        "</div>"
      : "";

    // 1. Popover Pengaturan Tampilan (mengacu HeaderUtama.tsx .dropdown-skin)
    const skinDropdownHtml = window.WF.ui.skinDropdownOpen
      ? '<div class="wf-skin-dropdown" role="dialog" aria-label="Pengaturan Tampilan">' +
        '<span class="wf-skin-group-label">Mode Tampilan</span>' +
        '<div class="wf-skin-segmented wf-skin-segmented-2">' +
        [
          { id: "light", label: "Terang" },
          { id: "dark", label: "Gelap" },
        ]
          .map(function (m) {
            return (
              '<button type="button" class="wf-skin-seg-btn ' +
              (skinMode === m.id ? "is-active" : "") +
              '" data-action="set-skin-mode" data-val="' +
              m.id +
              '">' +
              esc(m.label) +
              "</button>"
            );
          })
          .join("") +
        "</div>" +
        '<hr style="margin:14px 0;border:0;border-top:1px solid var(--wf-border);" />' +
        '<span class="wf-skin-group-label">Warna Sidebar</span>' +
        '<div class="wf-skin-segmented wf-skin-segmented-3">' +
        [
          { id: "default", label: "Standar" },
          { id: "prime", label: "Biru" },
          { id: "dark", label: "Gelap" },
        ]
          .map(function (sk) {
            return (
              '<button type="button" class="wf-skin-seg-btn ' +
              (sidebarSkin === sk.id ? "is-active" : "") +
              '" data-action="set-sidebar-skin" data-val="' +
              sk.id +
              '">' +
              esc(sk.label) +
              "</button>"
            );
          })
          .join("") +
        "</div>" +
        '<hr style="margin:14px 0;border:0;border-top:1px solid var(--wf-border);" />' +
        '<span class="wf-skin-group-label">Ukuran Teks</span>' +
        '<div class="wf-skin-segmented wf-skin-segmented-3">' +
        [
          { id: "kecil", label: "Kecil" },
          { id: "sedang", label: "Sedang" },
          { id: "besar", label: "Besar" },
        ]
          .map(function (sz) {
            return (
              '<button type="button" class="wf-skin-seg-btn ' +
              (textSize === sz.id ? "is-active" : "") +
              '" data-action="set-text-size" data-val="' +
              sz.id +
              '">' +
              esc(sz.label) +
              "</button>"
            );
          })
          .join("") +
        "</div>" +
        "</div>"
      : "";

    // 2. Popover Notifikasi (mengacu HeaderUtama.tsx .dropdown-notification)
    const notifDropdownHtml = window.WF.ui.notifDropdownOpen
      ? '<div class="wf-notif-dropdown">' +
        '<div style="padding:12px 16px;border-bottom:1px solid var(--wf-border);display:flex;align-items:center;justify-content:space-between;">' +
        '<strong style="font-size:0.875rem;">Notifikasi (' +
        unreadNotifs.length +
        ")</strong>" +
        (unreadNotifs.length > 0
          ? '<button type="button" class="wf-btn wf-btn-sm" data-action="mark-all-notifs-read">' +
            icon("check", "wf-icon-sm") +
            "<span>Baca Semua</span></button>"
          : "") +
        "</div>" +
        (unreadNotifs.length === 0
          ? '<div style="padding:24px 16px;text-align:center;font-size:0.875rem;color:var(--wf-text-muted);">Belum ada notifikasi baru.</div>'
          : unreadNotifs
              .map(function (n) {
                return (
                  '<div style="padding:12px 16px;border-bottom:1px solid var(--wf-border);display:flex;align-items:flex-start;justify-content:space-between;gap:10px;">' +
                  '<div style="flex:1;min-width:0;">' +
                  '<div style="font-size:0.75rem;font-weight:600;color:var(--wf-text-secondary);">' +
                  esc(n.jenis) +
                  " &middot; " +
                  esc(n.saluran) +
                  "</div>" +
                  '<div style="font-size:0.8125rem;margin-top:2px;color:var(--wf-text);">' +
                  esc(n.pesan) +
                  "</div>" +
                  '<div style="font-size:0.75rem;color:var(--wf-text-muted);margin-top:4px;">' +
                  esc(n.waktu) +
                  "</div>" +
                  "</div>" +
                  '<button type="button" class="wf-icon-btn" style="width:32px;height:32px;" data-mark-notif="' +
                  esc(n.id_notifikasi) +
                  '" title="Tandai sudah dibaca" aria-label="Tandai notifikasi dibaca">' +
                  icon("check", "wf-icon-sm") +
                  "</button>" +
                  "</div>"
                );
              })
              .join("")) +
        "</div>"
      : "";

    // 3. Popover Profil Pengguna + Tombol Keluar (tanpa Pengaturan Akun yang sudah dihapus)
    const cleanName = u.nama.replace(/\s*\(.*?\)\s*/g, "");
    const profileDropdownHtml = window.WF.ui.profileDropdownOpen
      ? '<div class="wf-profile-dropdown" role="menu" aria-label="Menu Profil Pengguna">' +
        '<div style="display:flex;align-items:center;gap:12px;padding-bottom:12px;border-bottom:1px solid var(--wf-border);margin-bottom:10px;">' +
        '<span class="wf-avatar" style="width:42px;height:42px;font-size:0.9375rem;" aria-hidden="true">' +
        esc(initials(u.nama)) +
        "</span>" +
        '<div style="min-width:0;flex:1;">' +
        '<div style="font-weight:700;font-size:0.875rem;color:var(--wf-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' +
        esc(cleanName) +
        "</div>" +
        '<div style="font-size:0.75rem;color:var(--wf-text-muted);">' +
        esc(window.WF.ROLE_LABELS[u.role]) +
        " (@" +
        esc(u.username) +
        ")</div>" +
        "</div>" +
        "</div>" +
        '<button type="button" class="wf-nav-link" data-action="logout" style="min-height:38px;padding:7px 10px;font-weight:600;color:var(--wf-text);">' +
        '<span class="wf-nav-link-main">' +
        icon("log-out", "wf-icon-sm") +
        "<span>Keluar</span></span>" +
        "</button>" +
        "</div>"
      : "";

    return (
      '<header class="wf-header">' +
      '<div class="wf-header-left">' +
      '<button type="button" class="wf-icon-btn" data-action="toggle-sidebar" aria-label="Buka atau tutup sidebar">' +
      icon("menu") +
      "</button>" +
      '<div class="wf-header-search">' +
      '<label for="wf-global-search" class="wf-sr-only">Cari halaman, barang, atau nota</label>' +
      '<div class="wf-input-group">' +
      '<span class="wf-input-icon-left">' +
      icon("search", "wf-icon-sm") +
      "</span>" +
      '<input id="wf-global-search" type="text" class="wf-input wf-input-has-left" style="min-height:40px;" placeholder="Cari halaman, barang (A001), atau nota..." value="' +
      esc(window.WF.ui.headerSearch) +
      '" data-input="header-search" autocomplete="off" />' +
      "</div>" +
      searchDropdownHtml +
      "</div>" +
      "</div>" +
      '<div class="wf-header-right">' +
      /* 1. Tombol Setting / Pengaturan Tampilan */
      '<div style="position:relative;">' +
      '<button type="button" class="wf-icon-btn ' +
      (window.WF.ui.skinDropdownOpen ? "is-active" : "") +
      '" data-action="toggle-skin-dropdown" aria-label="Pengaturan tampilan" aria-expanded="' +
      (window.WF.ui.skinDropdownOpen ? "true" : "false") +
      '">' +
      icon("settings") +
      "</button>" +
      skinDropdownHtml +
      "</div>" +
      /* 2. Tombol Notifikasi */
      '<div style="position:relative;">' +
      '<button type="button" class="wf-icon-btn ' +
      (window.WF.ui.notifDropdownOpen ? "is-active" : "") +
      '" data-action="toggle-notif-dropdown" aria-label="Notifikasi" aria-expanded="' +
      (window.WF.ui.notifDropdownOpen ? "true" : "false") +
      '">' +
      icon("bell") +
      (unreadNotifs.length > 0
        ? '<span class="wf-notif-badge">' + unreadNotifs.length + "</span>"
        : "") +
      "</button>" +
      notifDropdownHtml +
      "</div>" +
      /* 3. Tombol Profil & Dropdown Keluar */
      '<div style="position:relative;">' +
      '<button type="button" class="wf-profile-trigger ' +
      (window.WF.ui.profileDropdownOpen ? "is-active" : "") +
      '" data-action="toggle-profile-dropdown" aria-label="Menu profil pengguna" aria-expanded="' +
      (window.WF.ui.profileDropdownOpen ? "true" : "false") +
      '">' +
      '<div class="wf-header-user-info">' +
      '<div style="font-weight:600;font-size:0.75rem;color:var(--wf-text);">' +
      esc(cleanName) +
      "</div>" +
      '<div style="color:var(--wf-text-muted);font-size:0.75rem;">' +
      esc(window.WF.ROLE_LABELS[u.role]) +
      "</div>" +
      "</div>" +
      '<span class="wf-avatar" aria-hidden="true">' +
      esc(initials(u.nama)) +
      '<span class="wf-avatar-dot"></span>' +
      "</span>" +
      "</button>" +
      profileDropdownHtml +
      "</div>" +
      "</div>" +
      "</header>"
    );
  }

  function renderModals() {
    let html = "";
    const m = window.WF.ui.modal;
    if (m) {
      html +=
        '<div class="wf-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="wf-modal-title">' +
        '<div class="wf-modal">' +
        '<div class="wf-card-header">' +
        '<h2 id="wf-modal-title" class="wf-card-title">' +
        esc(m.title) +
        "</h2>" +
        '<button type="button" class="wf-icon-btn" style="width:32px;height:32px;" data-action="close-modal" aria-label="Tutup dialog">' +
        icon("x", "wf-icon-sm") +
        "</button>" +
        "</div>" +
        '<div class="wf-card-body">' +
        m.bodyHtml +
        '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:20px;padding-top:14px;border-top:1px solid var(--wf-border);">' +
        '<button type="button" class="wf-btn" data-action="close-modal">Batal</button>' +
        (m.confirmAction
          ? '<button type="button" class="wf-btn wf-btn-primary" data-action="' +
            esc(m.confirmAction) +
            '" data-id="' +
            esc(m.confirmId || "") +
            '">' +
            esc(m.confirmLabel || "Simpan") +
            "</button>"
          : "") +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>";
    }

    const r = window.WF.ui.receiptModal;
    if (r) {
      html +=
        '<div class="wf-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="wf-receipt-title">' +
        '<div class="wf-modal">' +
        '<div class="wf-card-header">' +
        '<h2 id="wf-receipt-title" class="wf-card-title">' +
        esc(r.title) +
        "</h2>" +
        '<button type="button" class="wf-icon-btn" style="width:32px;height:32px;" data-action="close-receipt" aria-label="Tutup struk">' +
        icon("x", "wf-icon-sm") +
        "</button>" +
        "</div>" +
        '<div class="wf-card-body">' +
        '<div class="wf-receipt-box">' +
        r.lines
          .map(function (line) {
            return "<div>" + esc(line) + "</div>";
          })
          .join("") +
        "</div>" +
        '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;">' +
        '<button type="button" class="wf-btn" data-action="close-receipt">Selesai</button>' +
        '<button type="button" class="wf-btn wf-btn-primary" data-action="print-receipt">' +
        icon("printer", "wf-icon-sm") +
        "<span>Cetak Struk</span></button>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>";
    }

    return html;
  }

  // Komponen TablePagination Interaktif (mengacu components/ui/table-pagination.tsx pada proyek utama)
  function paginate(list, key, defaultPageSize, pageSizeOptions, itemLabel) {
    const arr = list || [];
    const totalItems = arr.length;
    const opts = pageSizeOptions || [5, 10, 25];
    const label = itemLabel || "data";

    if (!window.WF.ui.pagination) window.WF.ui.pagination = {};
    if (!window.WF.ui.pagination[key]) {
      window.WF.ui.pagination[key] = {
        page: 1,
        pageSize: defaultPageSize || opts[0],
      };
    }

    const state = window.WF.ui.pagination[key];
    const pageSize = Number(state.pageSize) || defaultPageSize || opts[0];
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(Math.max(1, Number(state.page) || 1), totalPages);
    state.page = safePage;
    state.pageSize = pageSize;

    const startIdx = (safePage - 1) * pageSize;
    const endIdx = Math.min(totalItems, startIdx + pageSize);
    const items = arr.slice(startIdx, endIdx);

    if (totalItems <= 0) {
      return { items: [], html: "" };
    }

    const startItem = startIdx + 1;
    const endItem = endIdx;

    // Susun daftar nomor halaman seperti TablePagination.tsx
    const pageNums = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pageNums.push(i);
    } else {
      pageNums.push(1);
      if (safePage > 3) pageNums.push("...");
      const s = Math.max(2, safePage - 1);
      const e = Math.min(totalPages - 1, safePage + 1);
      for (let p = s; p <= e; p++) pageNums.push(p);
      if (safePage < totalPages - 2) pageNums.push("...");
      pageNums.push(totalPages);
    }

    const pageBtnsHtml = pageNums
      .map(function (p) {
        if (p === "...") {
          return '<span style="padding:0 4px;font-weight:600;">...</span>';
        }
        const active = p === safePage;
        return (
          '<button type="button" class="wf-page-num' +
          (active ? " is-active" : "") +
          '" data-page-key="' +
          esc(key) +
          '" data-page-val="' +
          p +
          '" aria-label="Halaman ' +
          p +
          '"' +
          (active ? ' aria-current="page"' : "") +
          ">" +
          p +
          "</button>"
        );
      })
      .join("");

    const minOpt = Math.min.apply(null, opts);
    const sizeSelectorHtml =
      totalItems > minOpt
        ? customSelect({
            id: "pg-size-" + key,
            value: String(pageSize),
            pageSizeKey: key,
            size: "sm",
            placement: "top",
            width: "108px",
            options: opts.map(function (o) {
              return { value: String(o), label: o + " / hal" };
            }),
          })
        : "";

    const html =
      '<div class="wf-pagination">' +
      '<div class="wf-pagination-left">' +
      "<span>Menampilkan <strong>" +
      startItem +
      "-" +
      endItem +
      "</strong> dari <strong>" +
      totalItems +
      "</strong> " +
      esc(label) +
      "</span>" +
      sizeSelectorHtml +
      "</div>" +
      (totalPages > 1
        ? '<div class="wf-pagination-right">' +
          '<div class="wf-page-controls">' +
          '<button type="button" class="wf-page-btn" data-page-key="' +
          esc(key) +
          '" data-page-val="' +
          (safePage - 1) +
          '" ' +
          (safePage <= 1 ? "disabled" : "") +
          ' aria-label="Halaman sebelumnya">' +
          icon("chevron-left", "wf-icon-sm") +
          '<span class="wf-page-nav-text">Sebelumnya</span>' +
          "</button>" +
          '<span class="wf-page-mobile-ind">Hal ' +
          safePage +
          " / " +
          totalPages +
          "</span>" +
          '<div class="wf-page-numbers">' +
          pageBtnsHtml +
          "</div>" +
          '<button type="button" class="wf-page-btn" data-page-key="' +
          esc(key) +
          '" data-page-val="' +
          (safePage + 1) +
          '" ' +
          (safePage >= totalPages ? "disabled" : "") +
          ' aria-label="Halaman berikutnya">' +
          '<span class="wf-page-nav-text">Berikutnya</span>' +
          icon("chevron-right", "wf-icon-sm") +
          "</button>" +
          "</div>" +
          (totalItems > 100
            ? '<div class="wf-page-jump">' +
              '<label for="pg-jump-' +
              esc(key) +
              '" class="wf-page-jump-label">Ke hal:</label>' +
              '<input id="pg-jump-' +
              esc(key) +
              '" type="number" min="1" max="' +
              totalPages +
              '" value="' +
              safePage +
              '" class="wf-page-jump-input" data-jump-input="' +
              esc(key) +
              '" aria-label="Pindah ke halaman" />' +
              '<button type="button" class="wf-page-btn" data-page-jump="' +
              esc(key) +
              '" data-max-page="' +
              totalPages +
              '">Buka</button>' +
              "</div>"
            : "") +
          "</div>"
        : "") +
      "</div>";

    return {
      items: items,
      html: html,
      totalItems: totalItems,
      currentPage: safePage,
      totalPages: totalPages,
    };
  }

  window.WFUI = {
    esc: esc,
    initials: initials,
    icon: icon,
    customSelect: customSelect,
    responsiveTabs: responsiveTabs,
    paginate: paginate,
    statusBadge: statusBadge,
    pageHeader: pageHeader,
    renderSidebar: renderSidebar,
    renderHeader: renderHeader,
    renderModals: renderModals,
  };
})();
