import { supabase, logAktivitas, getCurrentUser } from "@/lib/supabase";
import type { Database } from "@/lib/types";

export type SatuanBarangRow =
  Database["public"]["Tables"]["satuan_barang"]["Row"];
export type PemasokRow = Database["public"]["Tables"]["pemasok"]["Row"];
export type TagihanPemasokRow =
  Database["public"]["Tables"]["tagihan_pemasok"]["Row"] & {
    id: string;
    pemasok?: { nama: string; kontak?: string | null } | null;
    mutasi?: { no_surat_jalan: string | null; tanggal: string } | null;
    pembayaran_pemasok?: Array<{
      id_pembayaran_pemasok: string;
      id: string;
      nominal: number;
      tanggal_bayar: string;
      keterangan: string | null;
    }>;
  };

export type BarangRow = Database["public"]["Tables"]["barang"]["Row"] & {
  id: string;
  satuan_barang?: SatuanBarangRow[];
  // Properti turunan kompatibilitas untuk tampilan katalog & POS
  harga: number;
  stok_min: number;
  satuan: string;
  satuan_utama_id?: string;
};

export interface MutasiJoined {
  id: string;
  id_detail_mutasi: string;
  satuan_pembelian: string;
  jumlah: number;
  harga_beli: number;
  subtotal: number;
  stok_sebelum: number;
  stok_sesudah: number;
  // Alias kompatibilitas tampilan tabel
  harga_satuan: number;
  total_harga: number;
  keterangan: string | null;
  mutasi: {
    id: string;
    id_mutasi: string;
    jenis: "masuk" | "keluar";
    pemasok_id: string | null;
    no_surat_jalan: string | null;
    jenis_bayar: "tunai" | "tempo" | null;
    tujuan: string | null;
    alasan: string | null;
    tanggal: string;
    pemasok?: { nama: string } | null;
    // Alias kompatibilitas tampilan tabel
    supplier?: string | null;
    no_referensi?: string | null;
  } | null;
  barang: {
    kode_barang: string;
    nama: string;
    satuan_dasar: string;
    satuan?: string;
  } | null;
}

export interface RestokJoined {
  id: string;
  id_restok: string;
  barang_id: string;
  jumlah_restok: number;
  status: string;
  tanggal: string;
  barang?: {
    kode_barang: string;
    nama: string;
    stok: number;
    stok_minimum: number;
    satuan_dasar: string;
    stok_min?: number;
    satuan?: string;
  } | null;
}

export interface FormBarangState {
  kode_barang: string;
  nama: string;
  kategori: string;
  barcode: string;
  barcode_fisik: boolean;
  harga_beli: string;
  harga: string;
  stok: string;
  stok_min: string;
  satuan: string;
  satuan_pembelian: string;
  isi_per_satuan_beli: string;
}

export interface FormMutasiState {
  jenis: "masuk" | "keluar";
  barang_id: string;
  jumlah: string;
  pemasok_id: string;
  supplier: string;
  no_referensi: string;
  jenis_bayar: "tunai" | "tempo";
  tanggal_jatuh_tempo: string;
  tujuan: string;
  keterangan: string;
}

export interface FormRestokState {
  barang_id: string;
  restok: string;
}

export interface FormTagihanPemasokState {
  pemasok_id: string;
  nama_pemasok_baru: string;
  jumlah_tagihan: string;
  tanggal_jatuh_tempo: string;
}

export interface FormBayarPemasokState {
  tagihan_id: string;
  nominal: string;
  keterangan: string;
}

export const INITIAL_KATALOG: BarangRow[] = [];
export const INITIAL_MUTASI: MutasiJoined[] = [];
export const INITIAL_RESTOK: RestokJoined[] = [];
export const INITIAL_PEMASOK: PemasokRow[] = [];
export const INITIAL_TAGIHAN_PEMASOK: TagihanPemasokRow[] = [];

export interface Code128Segment {
  key: string;
  color: "black" | "white";
  width: number;
}

export function renderCode128SVG(value: string): Code128Segment[] {
  return value.split("").flatMap((ch, idx) => {
    const code = ch.charCodeAt(0);
    return [
      { key: `${idx}-a`, color: "black" as const, width: (code % 3) + 1 },
      {
        key: `${idx}-s`,
        color: "white" as const,
        width: ((code >> 1) % 2) + 1,
      },
      {
        key: `${idx}-b`,
        color: "black" as const,
        width: ((code >> 2) % 3) + 1,
      },
    ];
  });
}

export function mapBarangWithSatuan(raw: Record<string, unknown>): BarangRow {
  const satuanList: SatuanBarangRow[] = Array.isArray(raw.satuan_barang)
    ? (raw.satuan_barang as Array<Record<string, unknown>>).map((s) => ({
        ...(s as unknown as SatuanBarangRow),
        id_satuan_barang: String(s.id_satuan_barang || s.id),
        id: String(s.id_satuan_barang || s.id),
      }))
    : [];
  const primarySatuan =
    satuanList.find(
      (s) =>
        s.nama_satuan.toLowerCase() ===
        String(raw.satuan_dasar || "").toLowerCase()
    ) ||
    satuanList[0] ||
    null;

  const hargaModal = Number(raw.harga_modal ?? raw.harga_beli ?? 0);
  const hargaJualAwal = primarySatuan
    ? Number(primarySatuan.harga_jual_awal)
    : Math.round(hargaModal * 1.3);
  const stokNum = Number(raw.stok ?? 0);
  const stokMinNum = Number(raw.stok_minimum ?? 5);
  const satuanDasar = String(
    raw.satuan_dasar || primarySatuan?.nama_satuan || "Pcs"
  );
  const idBarang = String(raw.id_barang || raw.id);

  return {
    id_barang: idBarang,
    id: idBarang,
    kode_barang: String(raw.kode_barang),
    nama: String(raw.nama),
    kategori: String(raw.kategori),
    barcode: raw.barcode ? String(raw.barcode) : null,
    barcode_fisik: Boolean(raw.barcode_fisik ?? true),
    satuan_dasar: satuanDasar,
    stok: stokNum,
    stok_minimum: stokMinNum,
    satuan_pembelian: String(raw.satuan_pembelian || satuanDasar),
    isi_per_satuan_beli: Number(raw.isi_per_satuan_beli ?? 1),
    harga_beli: Number(raw.harga_beli ?? hargaModal),
    harga_modal: hargaModal,
    created_at: String(raw.created_at || new Date().toISOString()),
    satuan_barang: satuanList,
    harga: hargaJualAwal,
    stok_min: stokMinNum,
    satuan: satuanDasar,
    satuan_utama_id: primarySatuan?.id_satuan_barang || primarySatuan?.id,
  };
}

export async function fetchAllBarangData(): Promise<{
  items: BarangRow[];
  mutasiList: MutasiJoined[];
  restokList: RestokJoined[];
  pemasokList: PemasokRow[];
  tagihanPemasokList: TagihanPemasokRow[];
}> {
  const [brgRes, mutRes, rstRes, pmkRes, tghRes] = await Promise.all([
    supabase
      .from("barang")
      .select("*, satuan_barang(*)")
      .order("kode_barang", { ascending: true }),
    supabase
      .from("detail_mutasi_barang")
      .select(
        `
        id_detail_mutasi, satuan_pembelian, jumlah, harga_beli, subtotal, stok_sebelum, stok_sesudah,
        mutasi:mutasi_barang(id_mutasi, jenis, pemasok_id, no_surat_jalan, jenis_bayar, tujuan, alasan, tanggal, pemasok:pemasok_id(nama)),
        barang:barang_id(kode_barang, nama, satuan_dasar)
      `
      )
      .order("id_detail_mutasi", { ascending: false })
      .limit(100),
    supabase
      .from("rencana_restok")
      .select(
        `
        id_restok, barang_id, jumlah_restok, status, tanggal,
        barang:barang_id(kode_barang, nama, stok, stok_minimum, satuan_dasar)
      `
      )
      .order("tanggal", { ascending: false }),
    supabase.from("pemasok").select("*").order("nama", { ascending: true }),
    supabase
      .from("tagihan_pemasok")
      .select(
        `
        *,
        pemasok:pemasok_id(nama, kontak),
        mutasi:mutasi_id(no_surat_jalan, tanggal),
        pembayaran_pemasok(id_pembayaran_pemasok, nominal, tanggal_bayar, keterangan)
      `
      )
      .order("tanggal_jatuh_tempo", { ascending: true }),
  ]);

  if (brgRes.error) throw brgRes.error;

  const items = ((brgRes.data || []) as Array<Record<string, unknown>>).map(
    mapBarangWithSatuan
  );

  const mutasiList: MutasiJoined[] = (
    (mutRes.data || []) as Array<Record<string, unknown>>
  ).map((m) => {
    const rawMut = (m.mutasi as Record<string, unknown>) || null;
    const rawBrg = (m.barang as Record<string, unknown>) || null;
    const pmk = (rawMut?.pemasok as Record<string, unknown>) || null;
    const hargaBeli = Number(m.harga_beli ?? 0);
    const subtotal = Number(m.subtotal ?? 0);
    const idDetailMutasi = String(m.id_detail_mutasi || m.id);

    return {
      id: idDetailMutasi,
      id_detail_mutasi: idDetailMutasi,
      satuan_pembelian: String(m.satuan_pembelian || "Pcs"),
      jumlah: Number(m.jumlah ?? 0),
      harga_beli: hargaBeli,
      subtotal,
      stok_sebelum: Number(m.stok_sebelum ?? 0),
      stok_sesudah: Number(m.stok_sesudah ?? 0),
      harga_satuan: hargaBeli,
      total_harga: subtotal,
      keterangan: rawMut?.alasan ? String(rawMut.alasan) : null,
      mutasi: rawMut
        ? {
            id: String(rawMut.id_mutasi || rawMut.id),
            id_mutasi: String(rawMut.id_mutasi || rawMut.id),
            jenis: (rawMut.jenis as "masuk" | "keluar") || "masuk",
            pemasok_id: rawMut.pemasok_id ? String(rawMut.pemasok_id) : null,
            no_surat_jalan: rawMut.no_surat_jalan
              ? String(rawMut.no_surat_jalan)
              : null,
            jenis_bayar:
              (rawMut.jenis_bayar as "tunai" | "tempo" | null) || null,
            tujuan: rawMut.tujuan ? String(rawMut.tujuan) : null,
            alasan: rawMut.alasan ? String(rawMut.alasan) : null,
            tanggal: String(rawMut.tanggal),
            pemasok: pmk ? { nama: String(pmk.nama) } : null,
            supplier: pmk ? String(pmk.nama) : null,
            no_referensi: rawMut.no_surat_jalan
              ? String(rawMut.no_surat_jalan)
              : null,
          }
        : null,
      barang: rawBrg
        ? {
            kode_barang: String(rawBrg.kode_barang),
            nama: String(rawBrg.nama),
            satuan_dasar: String(rawBrg.satuan_dasar || "Pcs"),
            satuan: String(rawBrg.satuan_dasar || "Pcs"),
          }
        : null,
    };
  });

  const restokList: RestokJoined[] = (
    (rstRes.data || []) as Array<Record<string, unknown>>
  ).map((r) => {
    const rawBrg = (r.barang as Record<string, unknown>) || null;
    const jumlahRestok = Number(r.jumlah_restok ?? 0);
    const idRestok = String(r.id_restok || r.id);
    return {
      id: idRestok,
      id_restok: idRestok,
      barang_id: String(r.barang_id),
      jumlah_restok: jumlahRestok,
      status: String(r.status || "direncanakan"),
      tanggal: String(r.tanggal),
      barang: rawBrg
        ? {
            kode_barang: String(rawBrg.kode_barang),
            nama: String(rawBrg.nama),
            stok: Number(rawBrg.stok ?? 0),
            stok_minimum: Number(rawBrg.stok_minimum ?? 5),
            satuan_dasar: String(rawBrg.satuan_dasar || "Pcs"),
            stok_min: Number(rawBrg.stok_minimum ?? 5),
            satuan: String(rawBrg.satuan_dasar || "Pcs"),
          }
        : null,
    };
  });

  const pemasokList: PemasokRow[] = (
    (pmkRes.data || []) as Array<Record<string, unknown>>
  ).map((p) => ({
    ...(p as unknown as PemasokRow),
    id_pemasok: String(p.id_pemasok || p.id),
    id: String(p.id_pemasok || p.id),
  }));

  const tagihanPemasokList: TagihanPemasokRow[] = (
    (tghRes.data || []) as Array<Record<string, unknown>>
  ).map((t) => {
    const pbList = Array.isArray(t.pembayaran_pemasok)
      ? (t.pembayaran_pemasok as Array<Record<string, unknown>>).map((pb) => ({
          id_pembayaran_pemasok: String(pb.id_pembayaran_pemasok || pb.id),
          id: String(pb.id_pembayaran_pemasok || pb.id),
          nominal: Number(pb.nominal || 0),
          tanggal_bayar: String(pb.tanggal_bayar),
          keterangan: pb.keterangan ? String(pb.keterangan) : null,
        }))
      : [];
    return {
      ...(t as unknown as TagihanPemasokRow),
      id_tagihan: String(t.id_tagihan || t.id),
      id: String(t.id_tagihan || t.id),
      pembayaran_pemasok: pbList,
    };
  });

  return {
    items,
    mutasiList,
    restokList,
    pemasokList,
    tagihanPemasokList,
  };
}

export async function simpanBarangKeDatabase(
  formData: FormBarangState,
  editingItem: BarangRow | null
): Promise<void> {
  const hargaBeliNum = Number(formData.harga_beli) || 0;
  const isiPerBeli = Math.max(1, Number(formData.isi_per_satuan_beli) || 1);
  const hargaModalNum = Math.round((hargaBeliNum / isiPerBeli) * 100) / 100;
  const hargaJualNum =
    Number(formData.harga) || Math.round(hargaModalNum * 1.3);
  const marginPersen =
    hargaModalNum > 0
      ? Math.round(((hargaJualNum - hargaModalNum) / hargaModalNum) * 10000) /
        100
      : 30;
  const stokNum = Number(formData.stok) || 0;
  const stokMinimumNum = Number(formData.stok_min) || 5;
  const satuanDasar = (formData.satuan.trim() || "Pcs").slice(0, 15);
  const satuanPembelian = (
    formData.satuan_pembelian?.trim() || satuanDasar
  ).slice(0, 15);

  const payload = {
    kode_barang: formData.kode_barang.trim().slice(0, 20),
    nama: formData.nama.trim().slice(0, 50),
    kategori: formData.kategori.trim().slice(0, 30),
    barcode: formData.barcode.trim()
      ? formData.barcode.trim().slice(0, 30)
      : null,
    barcode_fisik: formData.barcode_fisik ?? true,
    satuan_dasar: satuanDasar,
    stok: stokNum,
    stok_minimum: stokMinimumNum,
    satuan_pembelian: satuanPembelian,
    isi_per_satuan_beli: isiPerBeli,
    harga_beli: hargaBeliNum,
    harga_modal: hargaModalNum,
  };

  if (editingItem) {
    const { error: updateErr } = await supabase
      .from("barang")
      .update(payload)
      .eq("id_barang", editingItem.id_barang || editingItem.id);
    if (updateErr) throw updateErr;

    if (editingItem.satuan_utama_id) {
      await supabase
        .from("satuan_barang")
        .update({
          nama_satuan: satuanDasar,
          harga_modal: hargaModalNum,
          margin_persen: marginPersen,
          harga_jual_awal: hargaJualNum,
        })
        .eq("id_satuan_barang", editingItem.satuan_utama_id);
    } else {
      await supabase.from("satuan_barang").insert({
        barang_id: editingItem.id_barang || editingItem.id,
        nama_satuan: satuanDasar,
        jumlah_konversi: 1,
        harga_modal: hargaModalNum,
        margin_persen: marginPersen,
        harga_jual_awal: hargaJualNum,
      });
    }

    await logAktivitas({
      modul: "Barang",
      aktivitas: `Mengubah barang ${payload.kode_barang}`.slice(0, 50),
      dataSebelum: {
        kode_barang: editingItem.kode_barang,
        nama: editingItem.nama,
        harga_beli: editingItem.harga_beli,
        stok: editingItem.stok,
      },
      dataSesudah: payload,
    });
  } else {
    const { data: inserted, error: insertErr } = await supabase
      .from("barang")
      .insert(payload)
      .select("id_barang")
      .single();
    if (insertErr || !inserted)
      throw insertErr || new Error("Gagal menambah barang");

    await supabase.from("satuan_barang").insert({
      barang_id: inserted.id_barang,
      nama_satuan: satuanDasar,
      jumlah_konversi: 1,
      harga_modal: hargaModalNum,
      margin_persen: marginPersen,
      harga_jual_awal: hargaJualNum,
    });

    await logAktivitas({
      modul: "Barang",
      aktivitas: `Menambah barang ${payload.kode_barang}`.slice(0, 50),
      dataSesudah: payload,
    });
  }
}

export async function hapusBarangDariDatabase(item: BarangRow): Promise<void> {
  const { error: delError } = await supabase
    .from("barang")
    .delete()
    .eq("id_barang", item.id_barang || item.id);
  if (delError) throw delError;

  await logAktivitas({
    modul: "Barang",
    aktivitas: `Menghapus barang ${item.kode_barang}`.slice(0, 50),
    dataSebelum: { kode_barang: item.kode_barang, nama: item.nama },
  });
}

export async function simpanMutasiKeDatabase(
  mutasiForm: FormMutasiState,
  items: BarangRow[]
): Promise<void> {
  const targetItem = items.find((i) => i.id === mutasiForm.barang_id);
  if (!targetItem) {
    throw new Error("Pilih barang terlebih dahulu.");
  }
  const qty = Number(mutasiForm.jumlah) || 0;
  if (qty <= 0) {
    throw new Error("Jumlah mutasi harus lebih dari 0.");
  }

  const stokSebelum = Number(targetItem.stok);
  const konversiBeli =
    mutasiForm.jenis === "masuk"
      ? Math.max(1, Number(targetItem.isi_per_satuan_beli) || 1)
      : 1;
  const deltaStokDasar = qty * konversiBeli;
  const stokSesudah =
    mutasiForm.jenis === "masuk"
      ? stokSebelum + deltaStokDasar
      : stokSebelum - deltaStokDasar;

  if (stokSesudah < 0) {
    throw new Error(
      `Stok tidak mencukupi! Stok saat ini: ${stokSebelum} ${targetItem.satuan_dasar}.`
    );
  }

  const user = await getCurrentUser();
  const hargaBeliSatuan =
    mutasiForm.jenis === "masuk"
      ? Number(targetItem.harga_beli) || Number(targetItem.harga_modal)
      : Number(targetItem.harga_modal);
  const subtotal = hargaBeliSatuan * qty;

  // Pastikan pemasok_id tersedia bila Barang Masuk
  let pemasokId: string | null = mutasiForm.pemasok_id || null;
  if (mutasiForm.jenis === "masuk" && !pemasokId) {
    const supplierName = (mutasiForm.supplier || "Pemasok Umum")
      .trim()
      .slice(0, 50);
    const { data: existingSup } = await supabase
      .from("pemasok")
      .select("id_pemasok")
      .ilike("nama", supplierName)
      .limit(1)
      .maybeSingle();

    if (existingSup?.id_pemasok) {
      pemasokId = existingSup.id_pemasok;
    } else {
      const { data: createdSup } = await supabase
        .from("pemasok")
        .insert({ nama: supplierName })
        .select("id_pemasok")
        .single();
      pemasokId = createdSup?.id_pemasok || null;
    }
  }

  // 1. Insert mutasi_barang header sesuai Class Diagram
  const { data: mutHeader, error: mutErr } = await supabase
    .from("mutasi_barang")
    .insert({
      pengguna_id: user?.id || null,
      pemasok_id: mutasiForm.jenis === "masuk" ? pemasokId : null,
      jenis: mutasiForm.jenis,
      no_surat_jalan: (
        mutasiForm.no_referensi || `SJ-${Date.now().toString().slice(-6)}`
      ).slice(0, 30),
      jenis_bayar:
        mutasiForm.jenis === "masuk" ? mutasiForm.jenis_bayar || "tunai" : null,
      tujuan:
        mutasiForm.jenis === "keluar"
          ? (mutasiForm.tujuan || "Operasional Toko").slice(0, 50)
          : "Gudang Utama",
      alasan: mutasiForm.keterangan || null,
      tanggal: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (mutErr || !mutHeader) throw mutErr || new Error("Gagal membuat mutasi");
  const mutasiId = mutHeader.id_mutasi || mutHeader.id;
  const targetBarangId = targetItem.id_barang || targetItem.id;

  // 2. Insert detail_mutasi_barang sesuai Class Diagram
  const { error: detErr } = await supabase.from("detail_mutasi_barang").insert({
    mutasi_id: mutasiId,
    barang_id: targetBarangId,
    satuan_pembelian: targetItem.satuan_pembelian || targetItem.satuan_dasar,
    jumlah: qty,
    harga_beli: hargaBeliSatuan,
    subtotal,
    stok_sebelum: stokSebelum,
    stok_sesudah: stokSesudah,
  });
  if (detErr) throw detErr;

  // 3. Jika Barang Masuk dengan Pembayaran Tempo -> Simpan ke tagihan_pemasok (Activity Diagram Kasir Bagian 2)
  if (
    mutasiForm.jenis === "masuk" &&
    mutasiForm.jenis_bayar === "tempo" &&
    pemasokId
  ) {
    const defaultDue = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    await supabase.from("tagihan_pemasok").insert({
      pemasok_id: pemasokId,
      mutasi_id: mutasiId,
      jumlah_tagihan: subtotal,
      sisa_tagihan: subtotal,
      tanggal_jatuh_tempo: mutasiForm.tanggal_jatuh_tempo || defaultDue,
      status: "belum_lunas",
    });
  }

  // 4. Update stok barang
  const { error: updErr } = await supabase
    .from("barang")
    .update({ stok: stokSesudah })
    .eq("id_barang", targetBarangId);
  if (updErr) throw updErr;

  // 5. Jika stok mencapai batas minimum, kirim notifikasi otomatis
  if (stokSesudah <= Number(targetItem.stok_minimum)) {
    await supabase.from("notifikasi").insert({
      jenis: "stok_hampir_habis",
      penerima: "muhamadirfan.mi966@gmail.com",
      saluran: "email",
      pesan: `Stok ${targetItem.kode_barang} - ${targetItem.nama} menipis (Sisa: ${stokSesudah} ${targetItem.satuan_dasar}, Min: ${targetItem.stok_minimum}).`,
      status_kirim: "pending",
      waktu: new Date().toISOString(),
    });
    fetch("/api/cron/notifikasi", { method: "POST" }).catch(() => {});
  }

  await logAktivitas({
    modul: "Mutasi Barang",
    aktivitas:
      `Mutasi ${mutasiForm.jenis} ${targetItem.kode_barang} (${qty})`.slice(
        0,
        50
      ),
    dataSebelum: { stok: stokSebelum },
    dataSesudah: { stok: stokSesudah, jumlah: qty },
  });
}

export async function simpanRestokKeDatabase(
  restokForm: FormRestokState,
  items: BarangRow[]
): Promise<void> {
  const targetItem = items.find((i) => i.id === restokForm.barang_id);
  if (!targetItem) throw new Error("Pilih barang untuk rencana restok.");

  const qty = Number(restokForm.restok) || 10;
  const { error: rstErr } = await supabase.from("rencana_restok").insert({
    barang_id: targetItem.id,
    jumlah_restok: qty,
    status: "direncanakan",
    tanggal: new Date().toISOString(),
  });
  if (rstErr) throw rstErr;

  await supabase.from("notifikasi").insert({
    jenis: "stok_hampir_habis",
    penerima: "muhamadirfan.mi966@gmail.com",
    saluran: "email",
    pesan: `Rencana restok dibuat untuk ${targetItem.kode_barang} - ${targetItem.nama} sebanyak ${qty} ${targetItem.satuan_dasar} (Sisa stok: ${targetItem.stok}).`,
    status_kirim: "pending",
    waktu: new Date().toISOString(),
  });
  fetch("/api/cron/notifikasi", { method: "POST" }).catch(() => {});

  await logAktivitas({
    modul: "Rencana Restok",
    aktivitas: `Restok ${targetItem.kode_barang} (${qty})`.slice(0, 50),
    dataSesudah: {
      barang: targetItem.nama,
      jumlah_restok: qty,
    },
  });
}

export async function ubahStatusRestokDiDatabase(
  r: RestokJoined,
  nextStatus: string
): Promise<void> {
  const { error: updErr } = await supabase
    .from("rencana_restok")
    .update({ status: nextStatus })
    .eq("id_restok", r.id_restok || r.id);
  if (updErr) throw updErr;

  await logAktivitas({
    modul: "Rencana Restok",
    aktivitas:
      `Status restok ${r.barang?.kode_barang || ""} -> ${nextStatus}`.slice(
        0,
        50
      ),
    dataSebelum: { status: r.status || "direncanakan" },
    dataSesudah: { status: nextStatus },
  });
}

export async function tambahTagihanPemasokKeDatabase(
  form: FormTagihanPemasokState
): Promise<void> {
  let pemasokId = form.pemasok_id;
  if (!pemasokId && form.nama_pemasok_baru.trim()) {
    const { data: newSup, error: supErr } = await supabase
      .from("pemasok")
      .insert({ nama: form.nama_pemasok_baru.trim().slice(0, 50) })
      .select("id_pemasok")
      .single();
    if (supErr || !newSup) throw supErr || new Error("Gagal menambah pemasok");
    pemasokId = newSup.id_pemasok;
  }
  if (!pemasokId) throw new Error("Pilih pemasok terlebih dahulu.");

  const nominal = Number(form.jumlah_tagihan) || 0;
  if (nominal <= 0) throw new Error("Jumlah tagihan harus lebih dari 0.");

  const { error } = await supabase.from("tagihan_pemasok").insert({
    pemasok_id: pemasokId,
    jumlah_tagihan: nominal,
    sisa_tagihan: nominal,
    tanggal_jatuh_tempo: form.tanggal_jatuh_tempo,
    status: "belum_lunas",
  });
  if (error) throw error;

  await logAktivitas({
    modul: "Tagihan Pemasok",
    aktivitas: `Tambah tagihan tempo pemasok Rp ${nominal}`.slice(0, 50),
    dataSesudah: {
      pemasok_id: pemasokId,
      jumlah_tagihan: nominal,
      tanggal_jatuh_tempo: form.tanggal_jatuh_tempo,
    },
  });
}

export async function catatPembayaranPemasokKeDatabase(
  tagihan: TagihanPemasokRow,
  nominalBayar: number,
  keterangan?: string
): Promise<void> {
  const sisa = Number(tagihan.sisa_tagihan);
  if (nominalBayar <= 0 || nominalBayar > sisa) {
    throw new Error(
      `Nominal pembayaran harus antara Rp 1 hingga Rp ${sisa.toLocaleString("id-ID")}.`
    );
  }

  const sisaBaru = Math.max(0, sisa - nominalBayar);
  const statusBaru = sisaBaru === 0 ? "lunas" : "belum_lunas";
  const tagihanId = tagihan.id_tagihan || tagihan.id;

  const { error: payErr } = await supabase.from("pembayaran_pemasok").insert({
    tagihan_id: tagihanId,
    nominal: nominalBayar,
    keterangan: keterangan || "Pembayaran tempo pemasok",
    tanggal_bayar: new Date().toISOString(),
  });
  if (payErr) throw payErr;

  const { error: updErr } = await supabase
    .from("tagihan_pemasok")
    .update({
      sisa_tagihan: sisaBaru,
      status: statusBaru,
    })
    .eq("id_tagihan", tagihanId);
  if (updErr) throw updErr;

  await logAktivitas({
    modul: "Pembayaran Pemasok",
    aktivitas:
      `Bayar tempo ${tagihan.pemasok?.nama || "Pemasok"} Rp ${nominalBayar}`.slice(
        0,
        50
      ),
    dataSebelum: { sisa_tagihan: sisa, status: tagihan.status },
    dataSesudah: { sisa_tagihan: sisaBaru, status: statusBaru },
  });
}
