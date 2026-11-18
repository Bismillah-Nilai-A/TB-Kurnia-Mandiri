"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  SearchField,
  CustomSelect,
} from "@/components/ui";
import type { BarangRow, CartItem } from "../layanan-transaksi";

interface KatalogPosProps {
  searchProduk: string;
  setSearchProduk: (val: string) => void;
  kategoriProduk: string;
  setKategoriProduk: (val: string) => void;
  categories: string[];
  loading: boolean;
  filteredProducts: BarangRow[];
  cart: CartItem[];
  addToCart: (item: BarangRow) => void;
}

export function KatalogPos({
  searchProduk,
  setSearchProduk,
  kategoriProduk,
  setKategoriProduk,
  categories,
  loading,
  filteredProducts,
  cart,
  addToCart,
}: KatalogPosProps) {
  return (
    <div className="lg:col-span-7 flex flex-col">
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle>Pilih Barang</CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px] items-center gap-2.5 mt-2">
            <SearchField
              placeholder="Cari nama barang, kode, atau scan barcode..."
              value={searchProduk}
              onChange={(e) => setSearchProduk(e.target.value)}
              className="w-full"
            />
            <CustomSelect
              value={kategoriProduk}
              onChange={(e) => setKategoriProduk(e.target.value)}
              aria-label="Filter kategori barang"
              className="w-full"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "Semua" ? "Semua Kategori" : cat}
                </option>
              ))}
            </CustomSelect>
          </div>
        </CardHeader>
        <CardContent className="flex-1 max-h-[540px] overflow-y-auto pt-4">
          {loading ? (
            <p className="text-sm text-gray-500 py-8 text-center">
              Memuat katalog barang...
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredProducts.slice(0, 60).map((item) => {
                const inCart = cart.find((c) => c.barang.id === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => addToCart(item)}
                    disabled={item.stok <= 0}
                    className={`text-left p-3.5 rounded-lg border transition flex flex-col justify-between gap-2 cursor-pointer ${
                      inCart
                        ? "border-[#2563EB] bg-[#EFF6FF]"
                        : "border-[#E2E8F0] hover:border-[#2563EB] hover:bg-[#F8FAFC]"
                    } ${item.stok <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-[#1D4ED8]">
                          {item.kode_barang}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-semibold ${
                            item.stok <= item.stok_min
                              ? "bg-[#FEF3C7] text-[#92400E]"
                              : "bg-[#F1F5F9] text-[#64748B]"
                          }`}
                        >
                          {item.stok} {item.satuan}
                        </span>
                      </div>
                      <p className="font-semibold text-[#1E293B] text-base mt-1 line-clamp-1">
                        {item.nama}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-[#E2E8F0]">
                      <span className="text-base font-bold text-[#1E293B]">
                        Rp {Number(item.harga).toLocaleString("id-ID")}
                      </span>
                      {inCart && (
                        <span className="text-xs font-bold text-[#1D4ED8] bg-white px-2 py-0.5 rounded border border-[#BFDBFE]">
                          {inCart.jumlah}x
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
