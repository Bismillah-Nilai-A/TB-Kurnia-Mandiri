"use client";

import Link from "next/link";
import { LogOut, X, ChevronDown } from "lucide-react";
import type { POSUser } from "@/lib/supabase";
import type { Role } from "@/lib/db";
import {
  NAV_GROUPS,
  ROLE_LABEL,
  initials,
  type NavDropdownItem,
} from "./layanan-layout";

interface SidebarUtamaProps {
  user: POSUser | null;
  pathname: string;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  isDarkSidebar: boolean;
  sidebarSkin?: "default" | "prime" | "dark";
  sidebarBgClass: string;
  openGroups: Set<string>;
  openSubMenus: Set<string>;
  footerMenuOpen: boolean;
  onCloseMobileSidebar: () => void;
  onToggleGroup: (label: string) => void;
  onToggleSubMenu: (id: string) => void;
  onToggleFooterMenu: () => void;
  onSwitchRole: (role: Role) => void;
  onLogout: () => void;
  isVisible: (href: string) => boolean;
}

export function SidebarUtama({
  user,
  pathname,
  sidebarOpen,
  sidebarCollapsed,
  isDarkSidebar,
  sidebarSkin = "default",
  sidebarBgClass,
  openGroups,
  openSubMenus,
  footerMenuOpen,
  onCloseMobileSidebar,
  onToggleGroup,
  onToggleSubMenu,
  onToggleFooterMenu,
  onSwitchRole,
  onLogout,
  isVisible,
}: SidebarUtamaProps) {
  const isRouteActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const isBlueSidebar = sidebarSkin === "prime";
  const sidebarDividerClass = isBlueSidebar
    ? "border-[#2563EB]/35"
    : isDarkSidebar
      ? "border-[#1E293B]"
      : "border-[#E2E8F0]";
  const sidebarHeaderDividerClass = isBlueSidebar
    ? "border-[#2563EB]/35"
    : isDarkSidebar
      ? "border-[#1E293B]"
      : "border-[#F1F5F9]";
  const onlineDotRingClass = isBlueSidebar
    ? "ring-[#1E3A8A]"
    : isDarkSidebar
      ? "ring-[#0F172A]"
      : "ring-white";

  return (
    <aside
      id="sidebar-menu"
      className={`fixed inset-y-0 left-0 z-40 w-[260px] shrink-0 border-r flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform print:hidden ${sidebarBgClass} ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } ${sidebarCollapsed ? "lg:-translate-x-full" : "lg:translate-x-0"}`}
    >
      {/* Sidebar Header (.sidebar-header) */}
      <div
        className={`h-[72px] shrink-0 flex items-center justify-between px-5 border-b ${sidebarHeaderDividerClass}`}
      >
        <Link
          href="/dashboard"
          className={`inline-flex items-baseline text-[22px] font-bold tracking-tight ${
            isDarkSidebar ? "text-white" : "text-[#1E293B]"
          }`}
        >
          <span>Kurnia Mandiri</span>
          <span
            className={`ml-1 inline-block w-1.5 h-1.5 rounded-full ${
              isDarkSidebar ? "bg-[#60A5FA]" : "bg-[#2563EB]"
            }`}
            aria-hidden="true"
          />
        </Link>
        <button
          type="button"
          onClick={onCloseMobileSidebar}
          className={`lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-lg cursor-pointer ${
            isDarkSidebar
              ? "text-white/70 hover:bg-white/10"
              : "text-[#64748B] hover:bg-[#F1F5F9]"
          }`}
          aria-label="Tutup menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Sidebar Body (.sidebar-body) */}
      <nav
        id="sidebarMenu"
        className="flex-1 overflow-y-auto py-2"
        aria-label="Menu utama"
      >
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items
            .map((item) => {
              if (item.href) {
                return isVisible(item.href) ? item : null;
              }
              const children = (item.children || []).filter((c) =>
                isVisible(c.href)
              );
              return children.length > 0 ? { ...item, children } : null;
            })
            .filter((x): x is NavDropdownItem => x !== null);

          if (visibleItems.length === 0) return null;
          const groupOpen = openGroups.has(group.label);

          return (
            <div
              key={group.label}
              className={`border-b pb-2 mb-1 last:border-b-0 ${sidebarHeaderDividerClass}`}
            >
              <button
                type="button"
                onClick={() => onToggleGroup(group.label)}
                aria-expanded={groupOpen}
                className={`w-full flex items-center justify-between px-5 pt-3 pb-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  isDarkSidebar
                    ? "text-white/80 hover:text-white"
                    : "text-[#64748B] hover:text-[#1E293B]"
                }`}
              >
                <span>{group.label}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ease-in-out ${
                    groupOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                  groupOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <ul className="flex flex-col gap-0.5 px-3 mt-1">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;

                      if (item.href) {
                        const active = isRouteActive(item.href);
                        return (
                          <li key={item.id}>
                            <Link
                              href={item.href}
                              aria-current={active ? "page" : undefined}
                              className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-base transition-all duration-200 ${
                                active
                                  ? isDarkSidebar
                                    ? "bg-white/15 font-semibold text-white"
                                    : "bg-[#EFF6FF] font-semibold text-[#1D4ED8] border-l-[3px] border-[#2563EB] pl-[9px]"
                                  : isDarkSidebar
                                    ? "font-medium text-white/80 hover:bg-white/10 hover:text-white"
                                    : "font-medium text-[#334155] hover:bg-[#F1F5F9] hover:text-[#1E293B]"
                              }`}
                            >
                              <Icon
                                className={`h-5 w-5 shrink-0 ${
                                  active
                                    ? isDarkSidebar
                                      ? "text-[#60A5FA]"
                                      : "text-[#2563EB]"
                                    : isDarkSidebar
                                      ? "text-white/60"
                                      : "text-[#64748B]"
                                }`}
                                aria-hidden="true"
                              />
                              <span className="truncate">{item.label}</span>
                            </Link>
                          </li>
                        );
                      }

                      const children = item.children || [];
                      const hasActiveChild = children.some((c) =>
                        isRouteActive(c.href)
                      );
                      const subOpen = openSubMenus.has(item.id);

                      return (
                        <li key={item.id} className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => onToggleSubMenu(item.id)}
                            aria-expanded={subOpen}
                            className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-base transition-all duration-200 cursor-pointer ${
                              hasActiveChild
                                ? isDarkSidebar
                                  ? "font-semibold text-white bg-white/10"
                                  : "font-semibold text-[#1D4ED8] bg-[#EFF6FF]/60"
                                : isDarkSidebar
                                  ? "font-medium text-white/80 hover:bg-white/10 hover:text-white"
                                  : "font-medium text-[#334155] hover:bg-[#F1F5F9] hover:text-[#1E293B]"
                            }`}
                          >
                            <span className="flex items-center gap-3 min-w-0">
                              <Icon
                                className={`h-5 w-5 shrink-0 ${
                                  hasActiveChild
                                    ? isDarkSidebar
                                      ? "text-[#60A5FA]"
                                      : "text-[#2563EB]"
                                    : isDarkSidebar
                                      ? "text-white/60"
                                      : "text-[#64748B]"
                                }`}
                                aria-hidden="true"
                              />
                              <span className="truncate">{item.label}</span>
                            </span>
                            <ChevronDown
                              className={`h-4 w-4 shrink-0 transition-transform duration-300 ease-in-out ${
                                subOpen ? "rotate-180" : ""
                              } ${
                                isDarkSidebar
                                  ? "text-white/60"
                                  : "text-[#64748B]"
                              }`}
                              aria-hidden="true"
                            />
                          </button>

                          <div
                            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                              subOpen
                                ? "grid-rows-[1fr] opacity-100"
                                : "grid-rows-[0fr] opacity-0"
                            }`}
                          >
                            <div className="overflow-hidden">
                              <div className="flex flex-col py-1 pl-4">
                                {children.map((sub) => {
                                  const subActive = isRouteActive(sub.href);
                                  return (
                                    <Link
                                      key={sub.href}
                                      href={sub.href}
                                      aria-current={
                                        subActive ? "page" : undefined
                                      }
                                      className={`group relative flex min-h-10 items-center pl-7 pr-3 py-1.5 text-base rounded-lg transition-all duration-150 ${
                                        subActive
                                          ? isDarkSidebar
                                            ? "font-semibold text-white bg-white/15"
                                            : "font-semibold text-[#1D4ED8] bg-[#EFF6FF]"
                                          : isDarkSidebar
                                            ? "font-normal text-white/85 hover:text-white hover:bg-white/10"
                                            : "font-normal text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC]"
                                      }`}
                                    >
                                      <span
                                        aria-hidden="true"
                                        className={`absolute left-2.5 top-1/2 -translate-y-1/2 h-[2px] transition-all duration-200 ${
                                          subActive
                                            ? isDarkSidebar
                                              ? "w-3.5 bg-[#60A5FA]"
                                              : "w-3.5 bg-[#2563EB]"
                                            : isDarkSidebar
                                              ? "w-1.5 bg-white/40 group-hover:w-3"
                                              : "w-1.5 bg-[#94A3B8] group-hover:w-3"
                                        }`}
                                      />
                                      <span className="truncate">
                                        {sub.label}
                                      </span>
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer (.sidebar-footer) */}
      {user && (
        <div className={`shrink-0 border-t ${sidebarDividerClass}`}>
          <button
            type="button"
            onClick={onToggleFooterMenu}
            aria-expanded={footerMenuOpen}
            className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors cursor-pointer ${
              isDarkSidebar ? "hover:bg-white/10" : "hover:bg-[#F8FAFC]"
            }`}
          >
            <span
              className="relative h-10 w-10 shrink-0 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-base font-bold"
              aria-hidden="true"
            >
              {initials(user.nama)}
              <span
                className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#16A34A] ring-2 ${onlineDotRingClass}`}
              />
            </span>
            <span className="flex-1 min-w-0 leading-tight">
              <span
                className={`block text-base font-semibold truncate ${
                  isDarkSidebar ? "text-white" : "text-[#1E293B]"
                }`}
              >
                {user.nama.replace(/\s*\(.*?\)\s*/g, "")}
              </span>
              <span
                className={`block text-xs ${
                  isDarkSidebar ? "text-white/80" : "text-[#64748B]"
                }`}
              >
                {ROLE_LABEL[user.role] ?? user.role}
              </span>
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${
                footerMenuOpen ? "rotate-180" : ""
              } ${isDarkSidebar ? "text-white/80" : "text-[#64748B]"}`}
              aria-hidden="true"
            />
          </button>

          <div
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
              footerMenuOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div
                className={`px-3.5 pb-3.5 pt-2 border-t flex flex-col gap-2.5 ${sidebarHeaderDividerClass}`}
              >
                <div className="flex flex-col gap-1.5">
                  <span
                    className={`text-xs font-semibold ${
                      isDarkSidebar ? "text-white/80" : "text-[#64748B]"
                    }`}
                  >
                    Peran Aktif
                  </span>
                  <div
                    className={`grid grid-cols-3 rounded-lg p-1 ${
                      isDarkSidebar
                        ? "bg-black/25 border border-black/20"
                        : "bg-[#F1F5F9]"
                    }`}
                  >
                    {(["admin", "kasir", "pengirim"] as Role[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => onSwitchRole(r)}
                        aria-pressed={user.role === r}
                        className={`min-h-9 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          user.role === r
                            ? "bg-[#2563EB] text-white shadow-xs"
                            : isDarkSidebar
                              ? "text-white/80 hover:bg-white/10 hover:text-white"
                              : "text-[#64748B] hover:text-[#1E293B]"
                        }`}
                      >
                        {ROLE_LABEL[r]}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className={`flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-xs font-semibold transition-colors cursor-pointer ${
                    isDarkSidebar
                      ? "text-[#FCA5A5] hover:bg-red-500/20 hover:text-white"
                      : "text-[#DC2626] hover:bg-[#FEF2F2]"
                  }`}
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
