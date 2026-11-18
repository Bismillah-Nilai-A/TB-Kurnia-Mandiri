"use client";

import type { RefObject } from "react";
import Link from "next/link";
import {
  LogOut,
  X,
  Settings,
  Bell,
  Search,
  UserCog,
  CheckCircle2,
  AlertTriangle,
  Check,
  CheckCheck,
} from "lucide-react";
import type { POSUser } from "@/lib/supabase";
import {
  ROLE_LABEL,
  initials,
  type HeaderNotif,
  type SearchEntry,
} from "./layanan-layout";

function MenuToggleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 4H21V6H3V4ZM3 11H15V13H3V11ZM3 18H21V20H3V18Z" />
    </svg>
  );
}

interface HeaderUtamaProps {
  user: POSUser | null;
  sidebarCollapsed: boolean;
  skinMode: "light" | "dark";
  sidebarSkin: "default" | "prime" | "dark";
  textSize: "kecil" | "sedang" | "besar";
  headerSearch: string;
  searchFocused: boolean;
  matchedSearchEntries: SearchEntry[];
  activeHeaderDropdown: "skin" | "notif" | "profile" | null;
  unreadNotifs: HeaderNotif[];
  headerRightRef: RefObject<HTMLDivElement | null>;
  searchContainerRef: RefObject<HTMLDivElement | null>;
  onToggleSidebar: () => void;
  onChangeSearch: (val: string) => void;
  onFocusSearch: (focused: boolean) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onToggleDropdown: (dropdown: "skin" | "notif" | "profile") => void;
  onSelectSkinMode: (mode: "light" | "dark") => void;
  onSelectSidebarSkin: (skin: "default" | "prime" | "dark") => void;
  onSelectTextSize: (size: "kecil" | "sedang" | "besar") => void;
  onMarkNotifRead: (id: string) => void;
  onMarkAllNotifsRead: () => void;
  onLogout: () => void;
  isVisible: (href: string) => boolean;
}

export function HeaderUtama({
  user,
  sidebarCollapsed,
  skinMode,
  sidebarSkin,
  textSize,
  headerSearch,
  searchFocused,
  matchedSearchEntries,
  activeHeaderDropdown,
  unreadNotifs,
  headerRightRef,
  searchContainerRef,
  onToggleSidebar,
  onChangeSearch,
  onFocusSearch,
  onSearchSubmit,
  onToggleDropdown,
  onSelectSkinMode,
  onSelectSidebarSkin,
  onSelectTextSize,
  onMarkNotifRead,
  onMarkAllNotifsRead,
  onLogout,
  isVisible,
}: HeaderUtamaProps) {
  const query = headerSearch.trim().toLowerCase();

  return (
    <header
      className={`h-[72px] shrink-0 border-b flex items-center justify-between gap-3 px-4 lg:px-6 print:hidden ${
        skinMode === "dark"
          ? "bg-[#1E293B] border-[#334155]"
          : "bg-white border-[#E2E8F0]"
      }`}
    >
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          id="menuSidebar"
          type="button"
          onClick={onToggleSidebar}
          className="h-10 w-10 shrink-0 inline-flex items-center justify-center rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-[#F1F5F9] transition-colors cursor-pointer focus:outline-none"
          aria-label="Buka atau tutup sidebar"
          aria-expanded={!sidebarCollapsed}
          aria-controls="sidebar-menu"
        >
          <MenuToggleIcon className="h-6 w-6" />
        </button>

        {/* Form Search di Header (.form-search) */}
        <div ref={searchContainerRef} className="relative flex-1 hidden sm:block">
          <form
            onSubmit={onSearchSubmit}
            className={`flex items-center h-10 px-3.5 rounded-lg border transition-all duration-150 ${
              skinMode === "dark"
                ? searchFocused
                  ? "border-[#60A5FA] bg-[#0F172A] shadow-xs"
                  : "border-[#334155] bg-[#0F172A] hover:bg-[#1E293B] hover:border-[#475569]"
                : searchFocused
                  ? "border-[#2563EB] bg-white shadow-xs"
                  : "border-transparent bg-[#F1F5F9] hover:bg-[#E2E8F0]/70 hover:border-[#CBD5E1]"
            }`}
          >
            <input
              type="text"
              value={headerSearch}
              onChange={(e) => onChangeSearch(e.target.value)}
              onFocus={() => onFocusSearch(true)}
              placeholder="Cari halaman, barang (A001), atau nota..."
              aria-label="Cari halaman, barang, atau nota"
              style={
                skinMode === "dark"
                  ? { backgroundColor: "transparent", color: "#F8FAFC" }
                  : undefined
              }
              className={`w-full bg-transparent text-xs border-none outline-none focus:outline-none focus:ring-0 ${
                skinMode === "dark"
                  ? "text-[#F8FAFC] placeholder:text-[#94A3B8]"
                  : "text-[#1E293B] placeholder:text-[#64748B]"
              }`}
            />
            {headerSearch ? (
              <button
                type="button"
                aria-label="Bersihkan pencarian"
                onClick={() => onChangeSearch("")}
                className="text-[#64748B] hover:text-[#1E293B] p-0.5 rounded cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <Search
                className={`h-4 w-4 shrink-0 transition-colors ${
                  searchFocused ? "text-[#2563EB]" : "text-[#64748B]"
                }`}
                aria-hidden="true"
              />
            )}
          </form>

          {searchFocused && (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-xl border border-[#E2E8F0] bg-white p-1.5 shadow-xl max-h-80 overflow-y-auto">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                {query.length === 0
                  ? "Pintasan Halaman"
                  : `Hasil Pencarian (${matchedSearchEntries.length})`}
              </div>
              {matchedSearchEntries.length === 0 ? (
                <p className="px-3 py-3 text-xs text-[#64748B]">
                  Tidak ada halaman, barang, atau nota yang cocok.
                </p>
              ) : (
                matchedSearchEntries.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      onFocusSearch(false);
                      onChangeSearch("");
                    }}
                    className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs transition-colors hover:bg-[#EFF6FF] group"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1E293B] group-hover:text-[#1D4ED8] truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-[#64748B] truncate">
                        {item.subtitle}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-semibold text-[#64748B] group-hover:bg-white group-hover:text-[#1D4ED8]">
                      {item.category}
                    </span>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Kanan Header: Setting (.dropdown-skin), Notifikasi (.dropdown-notification), Profil (.dropdown-profile) */}
      <div ref={headerRightRef} className="flex items-center gap-2 sm:gap-3">
        {/* 1. Tombol Setting / Skin (.dropdown-skin) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => onToggleDropdown("skin")}
            aria-label="Pengaturan tampilan"
            aria-expanded={activeHeaderDropdown === "skin"}
            className={`h-10 w-10 inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer focus:outline-none ${
              activeHeaderDropdown === "skin"
                ? "bg-[#EFF6FF] text-[#2563EB]"
                : "text-[#64748B] hover:text-[#2563EB] hover:bg-[#F1F5F9]"
            }`}
          >
            <Settings className="h-5 w-5" />
          </button>

          {activeHeaderDropdown === "skin" && (
            <div className="fixed right-3 top-[76px] z-50 w-[min(276px,calc(100vw-24px))] rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xl sm:absolute sm:right-0 sm:top-[calc(100%+8px)] sm:w-[268px]">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-2">
                Mode Tampilan
              </label>
              <nav className="grid grid-cols-2 rounded-lg border border-[#CBD5E1] overflow-hidden divide-x divide-[#CBD5E1]">
                {(
                  [
                    { id: "light", label: "Terang" },
                    { id: "dark", label: "Gelap" },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onSelectSkinMode(m.id)}
                    className={`py-2 px-3 text-xs font-semibold transition-colors cursor-pointer ${
                      skinMode === m.id
                        ? "bg-[#2563EB] text-white"
                        : "bg-white text-[#475569] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </nav>

              <hr className="my-4 border-[#E2E8F0]" />

              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-2">
                Warna Sidebar
              </label>
              <nav className="grid grid-cols-3 rounded-lg border border-[#CBD5E1] overflow-hidden divide-x divide-[#CBD5E1]">
                {(
                  [
                    { id: "default", label: "Standar" },
                    { id: "prime", label: "Biru" },
                    { id: "dark", label: "Gelap" },
                  ] as const
                ).map((sk) => (
                  <button
                    key={sk.id}
                    type="button"
                    onClick={() => onSelectSidebarSkin(sk.id)}
                    className={`py-2 px-2 text-xs font-semibold transition-colors cursor-pointer ${
                      sidebarSkin === sk.id
                        ? "bg-[#2563EB] text-white"
                        : "bg-white text-[#475569] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    {sk.label}
                  </button>
                ))}
              </nav>

              <hr className="my-4 border-[#E2E8F0]" />

              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-2">
                Ukuran Teks
              </label>
              <nav className="grid grid-cols-3 rounded-lg border border-[#CBD5E1] overflow-hidden divide-x divide-[#CBD5E1]">
                {(
                  [
                    { id: "kecil", label: "Kecil" },
                    { id: "sedang", label: "Sedang" },
                    { id: "besar", label: "Besar" },
                  ] as const
                ).map((sz) => (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => onSelectTextSize(sz.id)}
                    className={`py-2 px-2 text-xs font-semibold transition-colors cursor-pointer ${
                      textSize === sz.id
                        ? "bg-[#2563EB] text-white"
                        : "bg-white text-[#475569] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    {sz.label}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>

        {/* 2. Tombol Notifikasi (.dropdown-notification) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => onToggleDropdown("notif")}
            aria-label="Notifikasi"
            aria-expanded={activeHeaderDropdown === "notif"}
            className={`relative h-10 w-10 inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer focus:outline-none ${
              activeHeaderDropdown === "notif"
                ? "bg-[#EFF6FF] text-[#2563EB]"
                : "text-[#64748B] hover:text-[#2563EB] hover:bg-[#F1F5F9]"
            }`}
          >
            <Bell className="h-5 w-5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#DC2626] text-white text-[11px] font-bold flex items-center justify-center">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {activeHeaderDropdown === "notif" && (
            <div className="fixed right-3 left-3 top-[76px] z-50 ml-auto max-w-[360px] rounded-xl border border-[#E2E8F0] bg-white shadow-xl overflow-hidden sm:left-auto sm:absolute sm:right-0 sm:top-[calc(100%+8px)] sm:w-96 sm:max-w-none">
              <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base font-bold text-[#1E293B]">
                    Notifikasi
                  </span>
                  {unreadNotifs.length > 0 && (
                    <span className="whitespace-nowrap text-xs font-semibold text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded-md">
                      {unreadNotifs.length} belum dibaca
                    </span>
                  )}
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllNotifsRead}
                    title="Tandai semua sudah dibaca"
                    className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
                  >
                    <CheckCheck className="h-4 w-4" />
                    <span>Baca Semua</span>
                  </button>
                )}
              </div>
              {unreadNotifs.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-[#64748B]">
                  Belum ada notifikasi baru dari database.
                </div>
              ) : (
                <ul className="divide-y divide-[#F1F5F9] max-h-80 overflow-y-auto">
                  {unreadNotifs.map((n) => (
                    <li
                      key={n.id}
                      className="px-4 py-3 hover:bg-[#F8FAFC] flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <span
                          className={`mt-0.5 h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${
                            n.tone === "warning"
                              ? "bg-[#FEF3C7] text-[#92400E]"
                              : n.tone === "success"
                                ? "bg-[#DCFCE7] text-[#15803D]"
                                : "bg-[#EFF6FF] text-[#1D4ED8]"
                          }`}
                        >
                          {n.tone === "warning" ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-[#1E293B] leading-snug">
                            {n.title}
                          </p>
                          <span className="block text-xs text-[#64748B] mt-0.5">
                            {n.time}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onMarkNotifRead(n.id)}
                        title="Tandai sudah dibaca"
                        aria-label={`Tandai notifikasi dibaca: ${n.title}`}
                        className="mt-0.5 h-8 w-8 shrink-0 inline-flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#16A34A] hover:bg-[#DCFCE7] hover:border-[#BBF7D0] transition-colors cursor-pointer"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {isVisible("/pengaturan") && (
                <div className="px-4 py-2.5 bg-[#F8FAFC] border-t border-[#E2E8F0] text-center">
                  <Link
                    href="/pengaturan"
                    className="text-xs font-semibold text-[#1D4ED8] hover:underline"
                  >
                    Lihat Riwayat Notifikasi
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Tombol Profil (.dropdown-profile) */}
        {user && (
          <div className="relative">
            <button
              type="button"
              onClick={() => onToggleDropdown("profile")}
              aria-label="Menu profil pengguna"
              aria-expanded={activeHeaderDropdown === "profile"}
              className="flex items-center gap-2.5 rounded-lg p-1 hover:bg-[#F1F5F9] transition-colors cursor-pointer focus:outline-none"
            >
              <div className="hidden sm:block text-right leading-tight">
                <span className="block text-xs font-semibold text-[#1E293B]">
                  {user.nama.replace(/\s*\(.*?\)\s*/g, "")}
                </span>
                <span className="block text-xs text-[#64748B]">
                  {ROLE_LABEL[user.role] ?? user.role}
                </span>
              </div>
              <span className="relative h-10 w-10 shrink-0 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold">
                {initials(user.nama)}
                <span
                  className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#16A34A] ring-2 ${
                    skinMode === "dark" ? "ring-[#1E293B]" : "ring-white"
                  }`}
                />
              </span>
            </button>

            {activeHeaderDropdown === "profile" && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xl flex flex-col gap-3">
                <div className="flex items-center gap-3 pb-3 border-b border-[#F1F5F9]">
                  <span className="h-11 w-11 shrink-0 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-base font-bold">
                    {initials(user.nama)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1E293B] truncate">
                      {user.nama.replace(/\s*\(.*?\)\s*/g, "")}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {ROLE_LABEL[user.role] ?? user.role} (@{user.username})
                    </p>
                  </div>
                </div>

                {isVisible("/pengaturan") && (
                  <Link
                    href="/pengaturan"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#334155] hover:bg-[#F1F5F9] hover:text-[#1E293B]"
                  >
                    <UserCog className="h-4 w-4 text-[#64748B]" />
                    <span>Pengaturan Akun</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Keluar</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
