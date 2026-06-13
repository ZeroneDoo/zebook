'use client';

import React, { useState, useEffect } from 'react';
import {
  IconCoin,
  IconCreditCard,
  IconArrowRight,
  IconAlertTriangle,
  IconX,
  IconArrowLeft,
  IconLoader2
} from '@tabler/icons-react';
import UserLayout from '@/components/layout/UserLayout';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/hooks';
import { useToast, ToastContainer } from '@/components/Toast';
import { formatRupiah } from '@/lib/formats';

// SINKRONISASI: Import utilitas toast Anda di sini 
// (Sesuaikan path jika Anda menyimpannya di file terpisah, misal: '@/components/Toast')

interface KoinPackage {
  id_koin: string;
  jum_koin: number;
  harga: number;
}

export default function TopUpPage() {
  const { user, refresh } = useCurrentUser();
  const router = useRouter();
  
  // Inisialisasi sistem toast
  const { toasts, toast, remove } = useToast();

  // --- State Management ---
  const [coinPackages, setCoinPackages] = useState<KoinPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<{
    id: string;
    name: string;
    group: string;
    value: string;
  } | null>(null);

  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const paymentMethods = [
    { id: 'qris', name: 'QRIS Instant Go', group: 'QRIS', value: 'QRIS' },
    { id: 'gopay', name: 'GoPay', group: 'E-Wallet', value: 'E-MONEY' },
    { id: 'bca', name: 'BCA Virtual Account', group: 'Bank Transfer', value: 'VA' },
    { id: 'indomaret', name: 'Indomaret', group: 'Outlet', value: 'OUTLET' },
  ];

  useEffect(() => {
    async function fetchPackages() {
      try {
        setIsLoadingPackages(true);
        const response = await fetch('/api/koin');
        if (!response.ok) throw new Error('Gagal memuat paket koin');

        const resData = await response.json();
        setCoinPackages(resData.data || []);
      } catch (error) {
        console.error('Error fetching packages:', error);
        toast({
          type: 'error',
          title: 'Gagal Memuat Paket',
          message: 'Gagal mengambil daftar paket koin dari server pustaka.'
        });
      } finally {
        setIsLoadingPackages(false);
      }
    }
    fetchPackages();
  }, [toast]);

  const currentPkg = coinPackages.find(p => p.id_koin === selectedPackage);
  const currentMethod = selectedMethod;

  const handleOpenConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user) {
      toast({
        type: 'warning',
        title: 'Akses Ditolak',
        message: 'Sesi masuk tidak ditemukan. Silakan login kembali.'
      });
      return;
    }

    if (selectedPackage && selectedMethod) {
      setIsModalOpen(true);
    }
  };

  // --- Kirim Data ke API POST dengan Trigger Toast ---
  const handleConfirmPayment = async () => {
    if (!currentPkg || !selectedMethod || !user) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const response = await fetch('/api/koin/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_pengguna: user.id_pengguna,
          metode_bayar: selectedMethod.value,
          id_koin: currentPkg.id_koin,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Terjadi kesalahan saat memproses transaksi');
      }

      // 🟢 KONDISI BERHASIL
      setIsModalOpen(false);
      setSelectedPackage(null);
      setSelectedMethod(null);

      // Sinkronisasi pembaruan koin di header/sisi client
      refresh();

      // Pemicu Toast Sukses
      toast({
        type: 'success',
        title: 'Pembayaran Berhasil!',
        message: `Sukses menambahkan koin wallet Anda melalui sistem ${selectedMethod.name}.`,
        duration: 5000
      });

    } catch (error: unknown) {
      // 🔴 KONDISI GAGAL
      console.error('Payment Error:', error);
      const messageError = (error as Error).message || 'Gagal memproses pembelian koin.';
      
      setErrorMessage(messageError);
      setIsModalOpen(false);

      // Pemicu Toast Gagal
      toast({
        type: 'error',
        title: 'Top Up Gagal',
        message: messageError,
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UserLayout>
      <main className="px-4 sm:px-8 lg:px-13 py-10 max-w-6xl mx-auto">

        {/* Navigation & Header Zone */}
        <div className="mb-8 flex flex-col gap-4">
          <div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#D4C4AE]/40 text-[#56402A] hover:bg-[#F3ECE0]/50 text-xs font-semibold transition-all shadow-xs group cursor-pointer"
              title="Kembali ke halaman sebelumnya"
            >
              <IconArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Kembali</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#56402A] flex items-center justify-center text-white shadow-[0_4px_14px_rgba(86,64,42,0.2)]">
              <IconCoin size={24} />
            </div>
            <div>
              <h1 className="font-serif-elegant text-2xl sm:text-3xl font-semibold text-[#221508]">Top Up Koin Premium</h1>
              <p className="text-xs sm:text-sm text-[#9A7E5A]">Isi ulang koin akun Anda untuk menyewa berbagai buku digital pilihan.</p>
            </div>
          </div>
        </div>

        {/* Inline Error (Sebagai fallback pengaman di atas form) */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3 animate-fadeIn">
            <IconAlertTriangle className="text-rose-600 shrink-0" size={20} />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
          <form onSubmit={handleOpenConfirmation} className="space-y-6">

            {/* Bagian 1: Pilih Paket Koin */}
            <div>
              <h3 className="text-base font-semibold uppercase tracking-wider text-[#9A7E5A] mb-3">1. Pilih Paket Koin</h3>

              {isLoadingPackages ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 border border-dashed border-[#D4C4AE]/60 rounded-xl bg-white">
                  <IconLoader2 size={28} className="text-[#56402A] animate-spin" />
                  <p className="text-xs text-[#9A7E5A]">Mengambil daftar paket eksklusif...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 select-none">
                  {coinPackages.map((pkg) => (
                    <div
                      key={pkg.id_koin}
                      onClick={() => setSelectedPackage(pkg.id_koin)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all flex justify-between items-center bg-white ${selectedPackage === pkg.id_koin ? 'border-[#56402A] ring-2 ring-[#56402A]/10 shadow-md' : 'border-[#D4C4AE]/40 hover:border-[#9A7E5A]'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-[#C8A84E]">
                          <IconCoin size={22} />
                        </div>
                        <div>
                          <div className="font-bold text-[#3A2818]">{formatRupiah(pkg.jum_koin)} Koin</div>
                        </div>
                      </div>
                      <div className="font-semibold text-sm text-[#56402A]">Rp {formatRupiah(pkg.harga)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bagian 2: Metode Pembayaran */}
            <div>
              <h3 className="text-base font-semibold uppercase tracking-wider text-[#9A7E5A] mb-3">2. Metode Pembayaran</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedMethod(method)}
                    className={`cursor-pointer rounded-xl p-3.5 border transition-all flex items-center justify-between bg-white ${selectedMethod?.id === method.id ? 'border-[#56402A] ring-2 ring-[#56402A]/10 bg-[#FAF7F2]' : 'border-[#D4C4AE]/40 hover:border-[#9A7E5A]'}`}
                  >
                    <div className="flex items-center gap-3">
                      <IconCreditCard size={18} className="text-[#9A7E5A]" />
                      <div>
                        <div className="text-sm font-medium text-[#3A2818]">{method.name}</div>
                        <div className="text-[10px] text-[#B8A080]">{method.group}</div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedMethod?.id === method.id ? 'border-[#56402A] bg-[#56402A]' : 'border-gray-300'}`}>
                      {selectedMethod?.id === method.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={selectedPackage === null || !selectedMethod || isSubmitting}
              className={`w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${selectedPackage !== null && selectedMethod && !isSubmitting ? 'bg-[#56402A] text-[#F3ECE0] hover:bg-[#3A2818] shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              {isSubmitting ? 'Memproses Transaksi...' : 'Lanjutkan ke Pembayaran'}
              {!isSubmitting && <IconArrowRight size={16} />}
            </button>
          </form>

          <div className="bg-white rounded-2xl p-5 border border-[#D4C4AE]/30 shadow-xs h-fit space-y-4">
            <h4 className="font-serif-elegant font-semibold text-[#3A2818] text-base flex items-center gap-2">
              <IconAlertTriangle size={18} className="text-[#C8A84E]" /> Aturan Pengisian
            </h4>
            <ul className="text-xs text-[#9A7E5A] space-y-2.5 list-disc pl-4 leading-relaxed">
              <li>Setiap transaksi isi ulang koin bersifat instan dan otomatis diperbarui setelah sistem mendeteksi pembayaran sukses.</li>
              <li>Koin yang sudah dibeli tidak dapat ditukarkan kembali menjadi uang tunai.</li>
            </ul>
          </div>
        </div>
      </main>

      {/* ─── MODAL KONFIRMASI PEMBAYARAN NYATA ─── */}
      {isModalOpen && currentPkg && currentMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-[#D4C4AE]/30 animate-scaleUp">

            <div className="bg-linear-to-br from-[#56402A] to-[#221508] p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-serif-elegant font-semibold text-lg">Konfirmasi Pembayaran</h3>
                <p className="text-xs text-[#F5EBD9]/60">Periksa detail tagihan transaksi Anda</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="text-[#F5EBD9]/60 hover:text-white transition-colors cursor-pointer disabled:opacity-30"
              >
                <IconX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-[#3A2818]">
              <div className="flex justify-between py-2 border-b border-[#FAF7F2]">
                <span className="text-[#9A7E5A]">Produk</span>
                <span className="font-semibold flex items-center gap-1">
                  <IconCoin size={14} className="text-[#C8A84E]" /> {currentPkg.jum_koin} Koin
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#FAF7F2]">
                <span className="text-[#9A7E5A]">Metode Pembayaran</span>
                <span className="font-semibold">{currentMethod.name}</span>
              </div>
              <div className="flex justify-between py-2 bg-[#FAF7F2] px-3 rounded-lg">
                <span className="text-[#56402A] font-medium">Total Bayar</span>
                <span className="font-serif-elegant font-bold text-[#56402A] text-base">
                  Rp {formatRupiah(currentPkg.harga)}
                </span>
              </div>

              <div className="text-[11px] text-[#9A7E5A] bg-amber-50 p-3 rounded-lg border border-amber-100 flex items-start gap-2">
                <IconAlertTriangle size={16} className="text-[#C8A84E] shrink-0 mt-0.5" />
                <span>Dengan menekan tombol di bawah, Anda menyetujui transaksi pengisian saldo ZeBook Library.</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl border border-[#D4C4AE] font-medium text-xs text-[#9A7E5A] hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#56402A] text-[#F3ECE0] font-semibold text-xs hover:bg-[#3A2818] shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer disabled:bg-stone-400"
                >
                  {isSubmitting ? (
                    <>
                      <IconLoader2 size={14} className="animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    'Konfirmasi & Bayar'
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* RENDER CONTAINER TOAST DISINI */}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </UserLayout>
  );
}