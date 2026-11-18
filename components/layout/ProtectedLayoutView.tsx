"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  supabase,
  getCurrentUser,
  checkPermission,
  clearSessionUser,
  setCurrentSessionUser,
  logAktivitas,
  type POSUser,
} from "@/lib/supabase";
import { ROLE_PERMISSIONS, Role } from "@/lib/db";
import { ShieldAlert } from "lucide-react";
import {
  NAV_GROUPS,
  PAGE_SEARCH_ENTRIES,
  ROLE_LABEL,
  muatDaftarAkunPeranSupabase,
  cariAkunAktifPeranSupabase,
  muatDataHeaderSupabase,
  type HeaderNotif,
  type SearchEntry,
} from "./layanan-layout";
import { SidebarUtama } from "./SidebarUtama";
import { HeaderUtama } from "./HeaderUtama";

export default function ProtectedLayoutView({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<POSUser | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => new Set(["Utama", "Menu Operasional"])
  );
  const [openSubMenus, setOpenSubMenus] = useState<Set<string>>(
    () => new Set(["penjualan", "persediaan", "laporan-sistem"])
  );
  const [footerMenuOpen, setFooterMenuOpen] = useState(false);

  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<
    "skin" | "notif" | "profile" | null
  >(null);
  const headerRightRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [skinMode, setSkinMode] = useState<"light" | "dark">("light");
  const [sidebarSkin, setSidebarSkin] = useState<"default" | "prime" | "dark">(
    "default"
  );
  const [textSize, setTextSize] = useState<"kecil" | "sedang" | "besar">(
    "sedang"
  );

  const [headerSearch, setHeaderSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [dataSearchEntries, setDataSearchEntries] = useState<SearchEntry[]>([]);

  const [notifications, setNotifications] = useState<HeaderNotif[]>([]);
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(() => new Set());
  const [roleAccounts, setRoleAccounts] = useState<Partial<Record<Role, POSUser>>>({});

  useEffect(() => {
    try {
      const savedRead = localStorage.getItem("km-read-notifs");
      if (savedRead) {
        const parsed = JSON.parse(savedRead);
        if (Array.isArray(parsed)) {
          setReadNotifIds(new Set(parsed.map(String)));
        }
      }
    } catch {
      // ignore
    }

    const savedSkinMode = localStorage.getItem("skin-mode");
    if (savedSkinMode === "dark" || savedSkinMode === "light") {
      setSkinMode(savedSkinMode);
      document.documentElement.setAttribute("data-skin", savedSkinMode);
    } else {
      document.documentElement.setAttribute("data-skin", "light");
    }

    const savedSidebarSkin = localStorage.getItem("sidebar-skin");
    if (
      savedSidebarSkin === "prime" ||
      savedSidebarSkin === "dark" ||
      savedSidebarSkin === "default"
    ) {
      setSidebarSkin(savedSidebarSkin);
    }

    const savedSize = localStorage.getItem("km-text-size");
    if (
      savedSize === "kecil" ||
      savedSize === "sedang" ||
      savedSize === "besar"
    ) {
      setTextSize(savedSize);
      document.documentElement.setAttribute("data-size", savedSize);
    } else {
      document.documentElement.setAttribute("data-size", "sedang");
    }
  }, []);

  const handleSelectSkinMode = (mode: "light" | "dark") => {
    setSkinMode(mode);
    document.documentElement.setAttribute("data-skin", mode);
    if (mode === "dark") localStorage.setItem("skin-mode", "dark");
    else localStorage.removeItem("skin-mode");
  };

  const handleSelectSidebarSkin = (skin: "default" | "prime" | "dark") => {
    setSidebarSkin(skin);
    if (skin === "default") localStorage.removeItem("sidebar-skin");
    else localStorage.setItem("sidebar-skin", skin);
  };

  const handleSelectTextSize = (size: "kecil" | "sedang" | "besar") => {
    setTextSize(size);
    document.documentElement.setAttribute("data-size", size);
    localStorage.setItem("km-text-size", size);
  };

  const handleMarkNotifRead = (id: string) => {
    setReadNotifIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem("km-read-notifs", JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleMarkAllNotifsRead = () => {
    setReadNotifIds((prev) => {
      const next = new Set(prev);
      for (const n of notifications) next.add(n.id);
      try {
        localStorage.setItem("km-read-notifs", JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  };

  useEffect(() => {
    const check = async () => {
      const u = await getCurrentUser();
      if (!u) {
        router.push("/login");
        return;
      }

      setUser(u);
      const ok = await checkPermission(pathname);
      setAllowed(ok);
      setLoading(false);

      try {
        const [headerRes, akunRes] = await Promise.all([
          muatDataHeaderSupabase(),
          muatDaftarAkunPeranSupabase(),
        ]);
        if (headerRes.notifications.length > 0) {
          setNotifications(headerRes.notifications);
        }
        setDataSearchEntries(headerRes.searchEntries);
        setRoleAccounts(akunRes.byRole);

        // Sinkronkan profil sesi dengan baris terbaru di tabel pengguna (menghapus sisa cache lama).
        const matchedLiveUser =
          akunRes.users.find((row) => row.id === u.id) ||
          akunRes.users.find((row) => row.username === u.username);
        if (
          matchedLiveUser &&
          (matchedLiveUser.nama !== u.nama || matchedLiveUser.role !== u.role)
        ) {
          setCurrentSessionUser(matchedLiveUser);
          setUser(matchedLiveUser);
        }
      } catch {
        // ignore
      }
    };
    check();
  }, [pathname, router]);

  useEffect(() => {
    setSidebarOpen(false);
    setActiveHeaderDropdown(null);
    setSearchFocused(false);
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        if (
          item.children?.some(
            (c) => pathname === c.href || pathname.startsWith(c.href + "/")
          )
        ) {
          setOpenSubMenus((prev) => {
            if (prev.has(item.id)) return prev;
            const next = new Set(prev);
            next.add(item.id);
            return next;
          });
        }
      }
    }
  }, [pathname]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        headerRightRef.current &&
        !headerRightRef.current.contains(e.target as Node)
      ) {
        setActiveHeaderDropdown(null);
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchFocused(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setActiveHeaderDropdown(null);
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const toggleSubMenu = (id: string) => {
    setOpenSubMenus((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSidebar = () => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches
    ) {
      setSidebarCollapsed((prev) => !prev);
    } else {
      setSidebarOpen((prev) => !prev);
    }
  };

  const handleLogout = async () => {
    if (user) {
      await logAktivitas({
        modul: "Autentikasi",
        aktivitas: `Logout pengguna ${user.nama} (${user.role})`,
        penggunaId: user.id,
      });
    }
    clearSessionUser();
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    router.push("/login");
  };

  const handleSwitchRole = async (targetRole: Role) => {
    const nextUser =
      roleAccounts[targetRole] ||
      (await cariAkunAktifPeranSupabase(targetRole));
    if (!nextUser) return;

    setRoleAccounts((prev) => ({ ...prev, [targetRole]: nextUser }));
    setCurrentSessionUser(nextUser);
    setUser(nextUser);
    const ok = ROLE_PERMISSIONS[targetRole].some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    );
    setAllowed(ok);
    if (!ok) {
      router.push(targetRole === "pengirim" ? "/pengiriman" : "/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div
          role="status"
          aria-label="Memuat"
          className="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"
        />
      </div>
    );
  }

  const allowedRoutes = user
    ? ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.admin
    : [];

  const isVisible = (href: string) =>
    allowedRoutes.some((r) => href === r || href.startsWith(r + "/"));

  const effectiveSidebarSkin =
    skinMode === "dark" && sidebarSkin === "default" ? "dark" : sidebarSkin;
  const isDarkSidebar =
    effectiveSidebarSkin === "dark" || effectiveSidebarSkin === "prime";
  const sidebarBgClass =
    effectiveSidebarSkin === "prime"
      ? "bg-[#1E3A8A] border-[#172554] text-white"
      : effectiveSidebarSkin === "dark"
        ? "bg-[#0F172A] border-[#1E293B] text-white"
        : "bg-white border-[#E2E8F0] text-[#1E293B]";

  const allSearchEntries = [...PAGE_SEARCH_ENTRIES, ...dataSearchEntries].filter(
    (entry) => isVisible(entry.href)
  );
  const query = headerSearch.trim().toLowerCase();
  const matchedSearchEntries =
    query.length === 0
      ? PAGE_SEARCH_ENTRIES.filter((entry) => isVisible(entry.href))
      : allSearchEntries
          .filter(
            (entry) =>
              entry.title.toLowerCase().includes(query) ||
              entry.subtitle.toLowerCase().includes(query) ||
              entry.category.toLowerCase().includes(query)
          )
          .slice(0, 8);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (matchedSearchEntries.length > 0) {
      router.push(matchedSearchEntries[0].href);
      setSearchFocused(false);
      setHeaderSearch("");
    }
  };

  const unreadNotifs = notifications.filter((n) => !readNotifIds.has(n.id));

  return (
    <div
      className={`h-screen overflow-hidden flex print:h-auto print:overflow-visible print:bg-white ${
        skinMode === "dark" ? "bg-[#0F172A]" : "bg-[#F8FAFC]"
      }`}
    >
      {/* Backdrop halus saat sidebar mobile terbuka */}
      <div
        className={`fixed inset-0 z-30 bg-[#0F172A]/40 backdrop-blur-[1px] transition-opacity duration-300 lg:hidden print:hidden ${
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <SidebarUtama
        user={user}
        pathname={pathname}
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        isDarkSidebar={isDarkSidebar}
        sidebarSkin={effectiveSidebarSkin}
        sidebarBgClass={sidebarBgClass}
        openGroups={openGroups}
        openSubMenus={openSubMenus}
        footerMenuOpen={footerMenuOpen}
        onCloseMobileSidebar={() => setSidebarOpen(false)}
        onToggleGroup={toggleGroup}
        onToggleSubMenu={toggleSubMenu}
        onToggleFooterMenu={() => setFooterMenuOpen((prev) => !prev)}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogout}
        isVisible={isVisible}
      />

      {/* Area Utama */}
      <div
        className={`flex-1 min-w-0 flex flex-col h-full transition-[padding-left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] print:h-auto print:pl-0 ${
          sidebarCollapsed ? "lg:pl-0" : "lg:pl-[260px]"
        }`}
      >
        <HeaderUtama
          user={user}
          sidebarCollapsed={sidebarCollapsed}
          skinMode={skinMode}
          sidebarSkin={sidebarSkin}
          textSize={textSize}
          headerSearch={headerSearch}
          searchFocused={searchFocused}
          matchedSearchEntries={matchedSearchEntries}
          activeHeaderDropdown={activeHeaderDropdown}
          unreadNotifs={unreadNotifs}
          headerRightRef={headerRightRef}
          searchContainerRef={searchContainerRef}
          onToggleSidebar={handleToggleSidebar}
          onChangeSearch={setHeaderSearch}
          onFocusSearch={setSearchFocused}
          onSearchSubmit={handleSearchSubmit}
          onToggleDropdown={(d) =>
            setActiveHeaderDropdown((prev) => (prev === d ? null : d))
          }
          onSelectSkinMode={handleSelectSkinMode}
          onSelectSidebarSkin={handleSelectSidebarSkin}
          onSelectTextSize={handleSelectTextSize}
          onMarkNotifRead={handleMarkNotifRead}
          onMarkAllNotifsRead={handleMarkAllNotifsRead}
          onLogout={handleLogout}
          isVisible={isVisible}
        />

        {/* Konten Halaman */}
        <main className="flex-1 overflow-y-auto print:overflow-visible">
          <div className="p-4 sm:p-6 pb-10 print:p-0">
            {allowed === false ? (
              <div className="km-card flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
                <ShieldAlert className="w-12 h-12 text-[#DC2626]" />
                <h2 className="text-xl font-bold text-[#1E293B]">
                  Akses Ditolak
                </h2>
                <p className="text-base text-[#64748B] max-w-md">
                  Peran {ROLE_LABEL[user?.role ?? ""] ?? user?.role} tidak dapat
                  membuka halaman{" "}
                  <code className="bg-[#F1F5F9] px-1.5 py-0.5 rounded text-base">
                    {pathname}
                  </code>
                  . Pilih menu lain di sebelah kiri.
                </p>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
