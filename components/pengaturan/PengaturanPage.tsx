"use client";

import { PageHeader } from "@/components/ui/page-header";
import { ResponsiveTabs } from "@/components/ui";
import { Settings, Users, Shield, Bell, CheckCircle2 } from "lucide-react";
import { usePengaturan } from "./use-pengaturan";
import { FormSistemGateway } from "./komponen/FormSistemGateway";
import { TabelPenggunaLogNotif } from "./komponen/TabelPenggunaLogNotif";

export function PengaturanPage() {
  const {
    activeTab,
    setActiveTab,
    loading,
    message,
    error,
    notifEnabled,
    setNotifEnabled,
    saluranNotif,
    setSaluranNotif,
    penerimaNotif,
    setPenerimaNotif,
    notifDetail,
    setNotifDetail,
    penyediaGateway,
    setPenyediaGateway,
    kunciApi,
    setKunciApi,
    gatewayName,
    setGatewayName,
    gatewayDetail,
    setGatewayDetail,
    users,
    showUserModal,
    setShowUserModal,
    userForm,
    setUserForm,
    logs,
    filterModul,
    setFilterModul,
    modulList,
    notifs,
    handleSaveSystemSettings,
    handleCreateUser,
    handleChangeUserRole,
    handleToggleUserStatus,
    handleResetPassword,
    handleDownloadLogsCSV,
    handleTriggerCronNotif,
  } = usePengaturan();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        crumbs={[{ label: "Laporan & Sistem" }, { label: "Pengaturan" }]}
        title="Pengaturan"
      />

      <ResponsiveTabs
        value={activeTab}
        onChange={(v) => setActiveTab(v)}
        aria-label="Pilih tab pengaturan"
        options={[
          {
            id: "sistem",
            label: "Sistem & Pembayaran",
            icon: Settings,
          },
          {
            id: "pengguna",
            label: `Pengguna (${users.length})`,
            icon: Users,
          },
          {
            id: "log",
            label: `Log Aktivitas (${logs.length})`,
            icon: Shield,
          },
          {
            id: "notifikasi",
            label: `Riwayat Notifikasi (${notifs.length})`,
            icon: Bell,
          },
        ]}
      />

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {activeTab === "sistem" && (
        <FormSistemGateway
          loading={loading}
          notifEnabled={notifEnabled}
          setNotifEnabled={setNotifEnabled}
          saluranNotif={saluranNotif}
          setSaluranNotif={setSaluranNotif}
          penerimaNotif={penerimaNotif}
          setPenerimaNotif={setPenerimaNotif}
          notifDetail={notifDetail}
          setNotifDetail={setNotifDetail}
          penyediaGateway={penyediaGateway}
          setPenyediaGateway={setPenyediaGateway}
          kunciApi={kunciApi}
          setKunciApi={setKunciApi}
          gatewayName={gatewayName}
          setGatewayName={setGatewayName}
          gatewayDetail={gatewayDetail}
          setGatewayDetail={setGatewayDetail}
          onSubmit={handleSaveSystemSettings}
        />
      )}

      <TabelPenggunaLogNotif
        activeTab={activeTab}
        users={users}
        logs={logs}
        filterModul={filterModul}
        setFilterModul={setFilterModul}
        modulList={modulList}
        notifs={notifs}
        showUserModal={showUserModal}
        setShowUserModal={setShowUserModal}
        userForm={userForm}
        setUserForm={setUserForm}
        onCreateUser={handleCreateUser}
        onChangeUserRole={handleChangeUserRole}
        onResetPassword={handleResetPassword}
        onToggleUserStatus={handleToggleUserStatus}
        onDownloadLogsCSV={handleDownloadLogsCSV}
        onTriggerCronNotif={handleTriggerCronNotif}
      />
    </div>
  );
}
