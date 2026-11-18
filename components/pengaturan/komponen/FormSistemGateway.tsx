"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Label,
  Switch,
  CustomSelect,
} from "@/components/ui";

interface FormSistemGatewayProps {
  loading: boolean;
  notifEnabled: boolean;
  setNotifEnabled: (v: boolean) => void;
  saluranNotif: "email" | "whatsapp";
  setSaluranNotif: (v: "email" | "whatsapp") => void;
  penerimaNotif: string;
  setPenerimaNotif: (v: string) => void;
  notifDetail: string;
  setNotifDetail: (v: string) => void;
  penyediaGateway: string;
  setPenyediaGateway: (v: string) => void;
  kunciApi: string;
  setKunciApi: (v: string) => void;
  gatewayName: string;
  setGatewayName: (v: string) => void;
  gatewayDetail: string;
  setGatewayDetail: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function FormSistemGateway({
  loading,
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
  onSubmit,
}: FormSistemGatewayProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Notifikasi Toko</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Label>Nama Toko</Label>
            <Input defaultValue="CV Kurnia Mandiri" disabled />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-900">
              Notifikasi Otomatis
            </p>
            <Switch
              checked={notifEnabled}
              onCheckedChange={setNotifEnabled}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Saluran Notifikasi</Label>
              <CustomSelect
                value={saluranNotif}
                onChange={(e) =>
                  setSaluranNotif(e.target.value as "email" | "whatsapp")
                }
                className="w-full mt-1"
              >
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </CustomSelect>
            </div>
            <div>
              <Label>Penerima Notifikasi</Label>
              <Input
                value={penerimaNotif}
                onChange={(e) => setPenerimaNotif(e.target.value)}
                placeholder="muhamadirfan.mi966@gmail.com"
              />
            </div>
          </div>
          <div>
            <Label>Keterangan Saluran</Label>
            <Input
              value={notifDetail}
              onChange={(e) => setNotifDetail(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Gateway</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Penyedia</Label>
              <CustomSelect
                value={penyediaGateway}
                onChange={(e) => setPenyediaGateway(e.target.value)}
                className="w-full mt-1"
              >
                <option value="midtrans">Midtrans</option>
                <option value="xendit">Xendit</option>
              </CustomSelect>
            </div>
            <div>
              <Label>Kunci API</Label>
              <Input
                value={kunciApi}
                onChange={(e) => setKunciApi(e.target.value)}
                placeholder="SB-Mid-server-..."
              />
            </div>
          </div>
          <div>
            <Label>Nama Penyedia</Label>
            <Input
              value={gatewayName}
              onChange={(e) => setGatewayName(e.target.value)}
            />
          </div>
          <div>
            <Label>Metode Pembayaran Aktif</Label>
            <Input
              value={gatewayDetail}
              onChange={(e) => setGatewayDetail(e.target.value)}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={loading}>
              Simpan Pengaturan
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
