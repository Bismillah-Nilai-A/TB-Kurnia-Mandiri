"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Label,
  CustomSelect,
} from "@/components/ui";
import { StatusBadge } from "@/components/ui/status-badge";
import { usernameToSyntheticEmail } from "@/lib/supabase";
import {
  Plus,
  KeyRound,
  UserX,
  UserCheck,
  Download,
  RefreshCw,
  X,
} from "lucide-react";
import type { Role } from "@/lib/types";
import type {
  UserRow,
  LogRow,
  NotifRow,
  TabPengaturan,
} from "../layanan-pengaturan";

interface TabelPenggunaLogNotifProps {
  activeTab: TabPengaturan;
  users: UserRow[];
  logs: LogRow[];
  filterModul: string;
  setFilterModul: (v: string) => void;
  modulList: string[];
  notifs: NotifRow[];
  showUserModal: boolean;
  setShowUserModal: (v: boolean) => void;
  userForm: {
    nama: string;
    username: string;
    password: string;
    role: Role;
  };
  setUserForm: (v: {
    nama: string;
    username: string;
    password: string;
    role: Role;
  }) => void;
  onCreateUser: (e: React.FormEvent) => void;
  onChangeUserRole: (u: UserRow, newRole: Role) => void;
  onResetPassword: (u: UserRow) => void;
  onToggleUserStatus: (u: UserRow) => void;
  onDownloadLogsCSV: () => void;
  onTriggerCronNotif: () => void;
}

export function TabelPenggunaLogNotif({
  activeTab,
  users,
  logs,
  filterModul,
  setFilterModul,
  modulList,
  notifs,
  showUserModal,
  setShowUserModal,
  userForm,
  setUserForm,
  onCreateUser,
  onChangeUserRole,
  onResetPassword,
  onToggleUserStatus,
  onDownloadLogsCSV,
  onTriggerCronNotif,
}: TabelPenggunaLogNotifProps) {
  return (
    <>
      {activeTab === "pengguna" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Daftar Pengguna</CardTitle>
            <Button size="sm" onClick={() => setShowUserModal(true)}>
              <Plus className="w-4 h-4" />
              <span>Tambah Pengguna</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500">
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Peran</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {u.nama}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-blue-600">
                        @{u.username}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-500">
                        {usernameToSyntheticEmail(u.username)}
                      </td>
                      <td className="py-3 px-4">
                        <CustomSelect
                          value={u.role}
                          onChange={(e) =>
                            onChangeUserRole(u, e.target.value as Role)
                          }
                          aria-label={`Peran ${u.nama}`}
                          className="w-36"
                        >
                          <option value="admin">Pemilik</option>
                          <option value="kasir">Kasir</option>
                          <option value="pengirim">Pengirim</option>
                        </CustomSelect>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge
                          status={u.status}
                          tone={u.status === "aktif" ? "success" : "danger"}
                          label={u.status === "aktif" ? "Aktif" : "Nonaktif"}
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => onResetPassword(u)}
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Reset Sandi</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => onToggleUserStatus(u)}
                          >
                            {u.status === "aktif" ? (
                              <>
                                <UserX className="w-3.5 h-3.5 text-red-600" />
                                <span>Nonaktifkan</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Aktifkan</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "log" && (
        <Card>
          <CardHeader className="flex flex-wrap flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle>Log Aktivitas</CardTitle>
              <CustomSelect
                value={filterModul}
                onChange={(e) => setFilterModul(e.target.value)}
                aria-label="Filter modul log"
                className="w-48"
              >
                {modulList.map((m) => (
                  <option key={m} value={m}>
                    Modul: {m}
                  </option>
                ))}
              </CustomSelect>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={onDownloadLogsCSV}
            >
              <Download className="w-4 h-4" />
              <span>Unduh CSV</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500">
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Pengguna</th>
                    <th className="py-3 px-4">Modul</th>
                    <th className="py-3 px-4">Aktivitas</th>
                    <th className="py-3 px-4">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs
                    .filter(
                      (l) => filterModul === "SEMUA" || l.modul === filterModul
                    )
                    .map((l) => (
                      <tr key={l.id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-4 text-gray-500 whitespace-nowrap">
                          {new Date(l.waktu).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-gray-900">
                          {l.pengguna?.nama || "Sistem"}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold">
                            {l.modul}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-gray-800">
                          {l.aktivitas}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-xs text-gray-500 max-w-xs truncate">
                          {l.data_sesudah
                            ? JSON.stringify(l.data_sesudah)
                            : "-"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "notifikasi" && (
        <Card>
          <CardHeader className="flex flex-wrap flex-row items-center justify-between gap-3">
            <CardTitle>Riwayat Pengiriman Notifikasi</CardTitle>
            <Button
              size="sm"
              variant="secondary"
              onClick={onTriggerCronNotif}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Kirim Ulang Antrean</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500">
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Jenis</th>
                    <th className="py-3 px-4">Penerima</th>
                    <th className="py-3 px-4">Saluran</th>
                    <th className="py-3 px-4">Isi Pesan</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {notifs.map((n) => (
                    <tr key={n.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-4 text-gray-500 whitespace-nowrap">
                        {new Date(n.waktu).toLocaleString("id-ID")}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-gray-800">
                        {n.jenis}
                      </td>
                      <td className="py-2.5 px-4 text-blue-600">
                        {n.penerima}
                      </td>
                      <td className="py-2.5 px-4 uppercase font-medium">
                        {n.saluran}
                      </td>
                      <td className="py-2.5 px-4 text-gray-700 max-w-md">
                        {n.pesan}
                      </td>
                      <td className="py-2.5 px-4">
                        <StatusBadge
                          status={n.status_kirim}
                          tone={
                            n.status_kirim === "terkirim"
                              ? "success"
                              : "warning"
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900">
                Tambah Akun Pengguna Baru
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={onCreateUser} className="flex flex-col gap-3">
              <div>
                <Label>Nama Lengkap Staf</Label>
                <Input
                  placeholder="Contoh: Rina Wulandari"
                  value={userForm.nama}
                  onChange={(e) =>
                    setUserForm({ ...userForm, nama: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Username Login</Label>
                <Input
                  placeholder="Contoh: rina"
                  value={userForm.username}
                  onChange={(e) =>
                    setUserForm({ ...userForm, username: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Password Awal</Label>
                <Input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm({ ...userForm, password: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Peran (Role)</Label>
                <CustomSelect
                  value={userForm.role}
                  onChange={(e) =>
                    setUserForm({ ...userForm, role: e.target.value as Role })
                  }
                  aria-label="Pilih peran pengguna"
                  className="w-full mt-1"
                >
                  <option value="kasir">Kasir</option>
                  <option value="pengirim">Pengirim</option>
                  <option value="admin">Pemilik</option>
                </CustomSelect>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowUserModal(false)}
                >
                  Batal
                </Button>
                <Button type="submit">Buat Akun</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
