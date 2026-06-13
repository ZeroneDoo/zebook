'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconHistory,
  IconCoin,
  IconCreditCard,
  IconFilter,
  IconRefresh,
  IconArrowUpRight,
  IconReceiptOff,
  IconArrowLeft,
  IconLoader2,
  IconWallet
} from '@tabler/icons-react';
import UserLayout from '@/components/layout/UserLayout';
import { useCurrentUser } from '@/lib/hooks';
import { formatRupiah } from '@/lib/formats';

// Interface disesuaikan langsung dengan properti asli dari API Anda
interface ApiTransaksiKoin {
  id_transaksi_koin: string;
  id_pengguna: string;
  id_koin: string;
  jum_koin: number;
  harga: string | number; // Menambahkan properti harga di tingkat akar (root) sesuai respons API
  metode_pembayaran: string;
  tgl_transaksi?: string;
  createdAt?: string;
  status?: string;
  koin?: {
    id_koin: string;
    jum_koin: number;
    harga: number | string;
  };
}

export default function TransaksiPage() {
  const router = useRouter();
  const { user, isLoading: isLoadingUser } = useCurrentUser();

  // --- State Management ---
  const [transactions, setTransactions] = useState<ApiTransaksiKoin[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter State
  const [selectedMethod, setSelectedMethod] = useState('SEMUA');

  // --- Dataset Metode Pembayaran ---
  const paymentMethods = [
    { id: 'all', name: 'Semua', group: 'All', value: 'SEMUA' },
    { id: 'qris', name: 'QRIS Instant Go', group: 'QRIS', value: 'QRIS' },
    { id: 'gopay', name: 'GoPay', group: 'E-Wallet', value: 'E_MONEY' },
    { id: 'bca', name: 'BCA Virtual Account', group: 'Bank Transfer', value: 'VA' },
    { id: 'indomaret', name: 'Indomaret', group: 'Outlet', value: 'OUTLET' },
  ];

  // --- Fetch Data dari API ---
  useEffect(() => {
    async function fetchTransactionHistory() {
      if (!user?.id_pengguna) return;

      try {
        setIsLoadingData(true);
        setErrorMessage(null);

        const response = await fetch(`/api/transaksi-koin?id_pengguna=${user.id_pengguna}&limit=100`);
        if (!response.ok) throw new Error('Gagal mengambil riwayat transaksi koin');

        const resData = await response.json();
        setTransactions(resData.data || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setErrorMessage('Gagal memuat riwayat transaksi dari server.');
      } finally {
        setIsLoadingData(false);
      }
    }

    if (!isLoadingUser) {
      fetchTransactionHistory();
    }
  }, [user, isLoadingUser]);

  const handleResetFilters = () => {
    setSelectedMethod('SEMUA');
  };

  // --- Logika Penyaringan Data ---
  const filteredTransactions = transactions.filter((tr) => {
    const dbMethod = (tr.metode_pembayaran || '').toUpperCase();
    const currentFilter = selectedMethod.toUpperCase();

    return currentFilter === 'SEMUA' || dbMethod === currentFilter;
  });

  // Helper untuk memetakan string database ke nama tampilan UI yang rapih
  const getMethodDetails = (dbValue: string) => {
    const found = paymentMethods.find((m) => m.value.toUpperCase() === dbValue.toUpperCase());
    return found
      ? { name: found.name, group: found.group }
      : { name: dbValue, group: 'Lainnya' };
  };

  // Helper untuk memformat string/number harga menjadi format Rupiah yang rapi
  // const formatRupiah = (value: string | number) => {
  //   const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;
  //   if (isNaN(numericValue)) return 'Rp 0';
  //   return `Rp ${numericValue}`;
  // };

  return (
    <UserLayout>
      <div className="min-h-screen flex flex-col text-[#3A2818]" style={{ fontFamily: "'Jost', sans-serif" }}>
        <main className="flex-1 px-4 sm:px-8 lg:px-13 py-8 max-w-6xl w-full mx-auto flex flex-col">

          {/* ─── NAVIGATION & HEADER ZONE ─── */}
          <div className="mb-8 flex flex-col gap-4">
            <div>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#D4C4AE]/40 text-[#56402A] hover:bg-[#F3ECE0]/50 text-xs font-semibold transition-all shadow-xs group cursor-pointer"
              >
                <IconArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                <span>Kembali</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#56402A] flex items-center justify-center text-white shadow-[0_4px_14px_rgba(86,64,42,0.2)]">
                <IconHistory size={24} />
              </div>
              <div>
                <h1 className="font-serif-elegant text-2xl sm:text-3xl font-semibold text-[#221508]">Riwayat Transaksi Koin</h1>
                <p className="text-xs sm:text-sm text-[#9A7E5A]">Lacak mutasi saldo masuk dan riwayat pembelian paket koin premium Anda.</p>
              </div>
            </div>
          </div>

          {/* ─── PANEL FILTER UTAMA ─── */}
          <section className="bg-white rounded-2xl p-5 border border-[#D4C4AE]/30 shadow-[0_4px_20px_rgba(58,40,24,0.04)] mb-8">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#56402A] mb-4 pb-2 border-b border-[#FAF7F2]">
              <IconFilter size={14} />
              <span>Panel Penyaringan Data</span>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
              {/* TOGGLE METHOD BUTTONS */}
              <div className="space-y-1.5 w-full md:flex-1">
                <label className="text-xs font-medium text-[#9A7E5A] block">Metode Pembayaran</label>
                <div className="flex flex-wrap gap-1.5 bg-[#FAF7F2] p-1 rounded-xl border border-[#D4C4AE]/30 w-fit">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${selectedMethod === method.value
                          ? 'bg-[#56402A] text-[#F3ECE0] font-semibold shadow-xs'
                          : 'text-[#9A7E5A] hover:text-[#56402A] hover:bg-[#F3ECE0]/50'
                        }`}
                    >
                      {method.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleResetFilters}
                className="w-full md:w-32 py-2.5 bg-gray-100 hover:bg-[#F3ECE0] text-[#9A7E5A] hover:text-[#56402A] rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-gray-200 cursor-pointer h-[38px]"
              >
                <IconRefresh size={14} />
                Reset Filter
              </button>
            </div>
          </section>

          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm font-medium">
              {errorMessage}
            </div>
          )}

          {/* ─── KONTEN UTAMA ─── */}
          {isLoadingData ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl p-12 border border-[#D4C4AE]/25 min-h-[320px]">
              <IconLoader2 size={32} className="text-[#56402A] animate-spin mb-2" />
              <p className="text-xs text-[#9A7E5A]">Sinkronisasi riwayat koin...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl p-12 text-center border border-[#D4C4AE]/25 shadow-[0_4px_24px_rgba(58,40,24,0.02)] min-h-[320px]">
              <div className="w-16 h-16 rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#9A7E5A] mb-4 border border-[#D4C4AE]/20">
                <IconReceiptOff size={28} className="stroke-[1.5]" />
              </div>
              <h3 className="font-serif-elegant font-semibold text-lg text-[#221508]">Tidak Ada Riwayat Transaksi</h3>
              <p className="text-xs text-[#9A7E5A] mt-1.5 max-w-sm leading-relaxed">
                Kami tidak menemukan catatan mutasi koin dengan metode pembayaran yang dipilih saat ini.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-5 px-4 py-2 bg-[#FAF7F2] hover:bg-[#F3ECE0] border border-[#D4C4AE]/40 rounded-xl text-xs font-semibold text-[#56402A] transition-all cursor-pointer"
              >
                Tampilkan Semua Transaksi
              </button>
            </div>
          ) : (
            /* DATA CARDS DISPLAY GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTransactions.map((tr) => {
                const methodInfo = getMethodDetails(tr.metode_pembayaran);

                return (
                  <div
                    key={tr.id_transaksi_koin}
                    className="bg-white border border-[#D4C4AE]/25 rounded-xl p-5 shadow-[0_2px_10px_rgba(58,40,24,0.04)] hover:shadow-[0_8px_24px_rgba(58,40,24,0.08)] transition-all flex flex-col justify-between relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500" />

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3.5">
                        <span className="font-mono text-[11px] font-semibold text-[#9A7E5A] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#D4C4AE]/20">
                          {tr.id_transaksi_koin}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 uppercase">
                          {tr.status || 'SUCCESS'}
                        </span>
                      </div>

                      <h3 className="font-serif-elegant font-semibold text-[#3A2818] text-base leading-snug mb-3 group-hover:text-[#56402A] transition-colors">
                        Top Up {tr.koin?.jum_koin ?? tr.jum_koin ?? 0} Koin Premium
                      </h3>

                      {/* ─── BLOK INFORMASI HARGA & METODE PEMBAYARAN ─── */}
                      <div className="grid grid-cols-2 gap-3 mt-2 pt-3 border-t border-[#FAF7F2] text-xs">
                        {/* Kolom Informasi Harga (Menggantikan Waktu Transaksi) */}
                        <div className="space-y-0.5">
                          <span className="block text-[10px] text-[#9A7E5A] uppercase font-bold tracking-wider">Harga</span>
                          <span className="flex items-center gap-1.5 text-[#3A2818] font-semibold mt-0.5">
                            <IconWallet size={14} className="text-[#B8A080] shrink-0" />
                            <span className="text-amber-900">{formatRupiah(Number(tr.harga))}</span>
                          </span>
                        </div>

                        {/* Kolom Informasi Metode Pembayaran */}
                        <div className="space-y-0.5">
                          <span className="block text-[10px] text-[#9A7E5A] uppercase font-bold tracking-wider">Metode Pembayaran</span>
                          <span className="flex items-center gap-1.5 text-[#3A2818] font-medium mt-0.5" title={`Grup: ${methodInfo.group}`}>
                            <IconCreditCard size={14} className="text-[#B8A080] shrink-0" />
                            <span className="truncate">{methodInfo.name}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between bg-[#FAF7F2] p-3 rounded-xl border border-[#D4C4AE]/15">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#9A7E5A]">Nominal Koin</span>
                      <div className="flex items-center gap-1 font-bold text-base text-emerald-600">
                        <IconArrowUpRight size={16} />
                        <span>+{tr.koin?.jum_koin ?? tr.jum_koin ?? 0}</span>
                        <IconCoin size={14} className="text-[#C8A84E] fill-[#C8A84E]/10" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </UserLayout>
  );
}