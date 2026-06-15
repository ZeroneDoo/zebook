"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation"; // 💡 DIUBAH: Tambah useRouter
import { useSession } from "next-auth/react";
import {
  IconCoin,
  IconTicket,
  IconChevronLeft,
  IconBook,
  IconCalendar,
  IconFileText,
  IconShare,
  IconNotes,
  IconClock,
  IconAlertCircle,
  IconLoader2,
} from "@tabler/icons-react";

import { useToast, ToastContainer } from "@/components/Toast";
import UserLayout from "@/components/layout/UserLayout";
import { useCurrentUser } from "@/lib/hooks";

interface KategoriDetail {
  id_kategori: string;
  nama_kategori: string;
}

interface BukuKategoriRelasi {
  id_buku: string;
  id_kategori: string;
  kategori: KategoriDetail;
}

interface DynamicBookData {
  id_buku: string;
  judul: string;
  deskripsi: string | null;
  stok: number;
  koin: number;
  stamp: number;
  penerbit: string;
  penulis: string;
  thn_terbit: number;
  img_url: string;
  selectedKategori: string[];
  buku_kategori: BukuKategoriRelasi[];
}

export default function BookDetailPage() {
  const { user } = useCurrentUser();
  const { id } = useParams();
  const router = useRouter(); // 💡 DIUBAH: Inisialisasi router
  const { toasts, toast, remove } = useToast();
  const { data: session, status } = useSession();

  // --- State Management ---
  const [book, setBook] = useState<DynamicBookData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [isBorrowed, setIsBorrowed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"koin" | "stamp">("koin");

  const durasiPinjamHariDefault = 14;

  // --- Fetching Pipeline ---
  useEffect(() => {
    if (!id) return;

    async function fetchBookDetail() {
      try {
        setLoading(true);
        const response = await fetch(`/api/buku/${id}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error("Buku tidak ditemukan di pustaka.");
          throw new Error("Gagal memuat data dari server.");
        }
        const data = await response.json();
        setBook(data);
      } catch (error: unknown) {
        console.error("Fetch detail error:", error);
        toast({
          type: "error",
          title: "Gagal Memuat",
          message: (error as Error).message || "Terjadi kesalahan koneksi server.",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchBookDetail();
  }, [id, toast]);

  const handleConfirmBorrow = async () => {
    if (!book || !session?.user) return;

    const isKoinCukup = (user?.koin ?? 0) >= book.koin;
    const isStampCukup = (user?.stamp ?? 0) >= book.stamp;

    if (paymentMethod === "koin" && !isKoinCukup) return;
    if (paymentMethod === "stamp" && !isStampCukup) return;

    setIsModalOpen(false);
    setIsBorrowing(true);

    try {
      const response = await fetch("/api/peminjaman-buku/pinjam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_pengguna: session.user.id,
          id_buku: book.id_buku,
          metode: paymentMethod,
          tgl_pinjam: new Date().toISOString(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal memproses peminjaman.");
      }

      setIsBorrowed(true);
      toast({
        type: "success",
        title: "Peminjaman Berhasil!",
        message: `Buku dipinjam menggunakan ${paymentMethod.toUpperCase()} selama 14 hari.`,
        duration: 4000,
      });

      // 💡 DIUBAH: Langsung redirect ke halaman /peminjaman tanpa timeout
      router.push("/peminjaman");

    } catch (error: unknown) {
      toast({
        type: "error",
        title: "Transaksi Gagal",
        message: (error as Error).message || "Terjadi kesalahan koneksi.",
      });
    } finally {
      setIsBorrowing(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <UserLayout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-3">
          <IconLoader2 size={40} className="text-[#56402A] animate-spin" />
          <p className="text-xs font-semibold text-[#9A7E5A] tracking-wide">Membuka lembaran pustaka...</p>
        </div>
      </UserLayout>
    );
  }

  if (!book) {
    return (
      <UserLayout>
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-4">
          <IconAlertCircle size={48} className="text-red-600/80" />
          <h2 className="font-serif-elegant text-xl font-bold text-[#3A2818]">Koleksi Tidak Tersedia</h2>
          <p className="text-sm text-[#9A7E5A] max-w-sm">Buku tidak terdaftar atau telah dihapus dari database.</p>
          <Link href="/buku" className="px-5 py-2.5 bg-[#56402A] text-white rounded-xl text-xs font-bold shadow-md">
            Kembali ke Katalog
          </Link>
        </div>
      </UserLayout>
    );
  }

  const isStokTersedia = book.stok > 0;
  const hasCategories = book.buku_kategori && book.buku_kategori.length > 0;

  const isBalanceEnough = paymentMethod === "koin"
    ? (user?.koin ?? 0) >= book.koin
    : (user?.stamp ?? 0) >= book.stamp;

  return (
    <UserLayout>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 select-none relative">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <Link
              href="/buku"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#9A7E5A] hover:text-[#56402A] transition-colors"
            >
              <IconChevronLeft size={18} />
              Kembali ke Jelajah
            </Link>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard.writeText(window.location.href);
                  toast({ type: "success", title: "Tautan Disalin", message: "Link buku berhasil disalin." });
                }
              }}
              className="p-2 bg-white border border-[#D4C4AE]/40 hover:bg-[#FAF7F2] rounded-xl text-[#9A7E5A] hover:text-[#56402A] transition-colors cursor-pointer"
            >
              <IconShare size={18} />
            </button>
          </div>

          {/* Main Content Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* Left Frame - Sampul Buku */}
            <div className="lg:col-span-1 flex flex-col items-center">
              <div className="relative w-64 h-96 rounded-2xl bg-white border border-[#D4C4AE]/60 shadow-[0_16px_40px_rgba(58,40,24,.12)] overflow-hidden group">
                <div className="absolute inset-0 bg-linear-to-b from-transparent to-[#3A2818]/5 pointer-events-none z-10" />

                <Image
                  src={book.img_url || "https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/products/ndgciipm75.jpeg"}
                  alt={book.judul}
                  fill
                  sizes="256px"
                  className={`object-cover transition-transform duration-300 ${!isStokTersedia ? "blur-[1.5px] grayscale-20" : "group-hover:scale-102"}`}
                  priority
                  unoptimized
                />

                {!isStokTersedia && (
                  <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center z-20 animate-fade-in">
                    <span className="bg-red-600 border border-red-500 text-white text-xs font-black tracking-widest uppercase px-4 py-2 rounded-xl shadow-lg">
                      Stok Habis
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Frame: Core Book Details */}
            <div className="lg:col-span-2 space-y-6">

              {/* Title Info Section */}
              <div className="bg-white rounded-[20px] border border-[#D4C4AE]/40 p-6 shadow-[0_4px_24px_rgba(58,40,24,.02)]">
                <div className="flex flex-wrap gap-2 mb-3">
                  {hasCategories ? (
                    book.buku_kategori.map((rel) => (
                      <span
                        key={rel.id_kategori}
                        className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 bg-[#FAF7F2] text-[#9A7E5A] border border-[#D4C4AE]/40 rounded-lg shadow-2xs"
                      >
                        {rel.kategori.nama_kategori}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 bg-[#FAF7F2] text-[#9A7E5A] border border-[#D4C4AE]/40 rounded-lg shadow-2xs">
                      Umum
                    </span>
                  )}
                </div>

                <h1 className="font-serif-elegant text-2xl sm:text-3xl font-bold text-[#3A2818] leading-tight mt-1">
                  {book.judul}
                </h1>
                <p className="text-sm font-medium text-[#9A7E5A] mt-2">
                  Oleh <span className="text-[#56402A] font-semibold">{book.penulis}</span>
                </p>

                <div className="flex items-center gap-4 pt-2 border-t border-[#E8DDD0]/50 mt-4 text-xs font-medium text-[#9A7E5A]">
                  <div>Stok: <span className={`font-bold ${isStokTersedia ? "text-emerald-700" : "text-red-700"}`}>{book.stok} Tersedia</span></div>
                  <div className="w-1 h-1 rounded-full bg-[#D4C4AE]" />
                  <div>ID Buku: <span className="font-mono text-[#3A2818]">{book.id_buku}</span></div>
                </div>
              </div>

              {/* Action Box Card */}
              <div className="bg-[#56402A] rounded-[20px] p-6 text-[#F3ECE0] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_12px_32px_rgba(86,64,42,.15)]">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[11px] font-bold text-[#FAF7F2]/60 uppercase tracking-widest block">Opsi Metode Pinjam ({durasiPinjamHariDefault} Hari)</span>
                  <div className="flex items-center gap-3 justify-center sm:justify-start flex-wrap">
                    {isBorrowed ? (
                      <span className="text-2xl font-black tracking-wide">Sedang Diproses ...</span>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5">
                          <IconCoin size={24} className="text-amber-400 shrink-0" />
                          <span className="text-2xl font-black tracking-wide">
                            {book.koin} Koin
                          </span>
                        </div>
                        <span className="text-xl font-medium text-[#FAF7F2]/30">/</span>
                        <div className="flex items-center gap-1.5">
                          <IconTicket size={24} className="text-amber-400 shrink-0" />
                          <span className="text-2xl font-black tracking-wide">
                            {book.stamp} Stamp
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {!isBorrowed && (
                  <button
                    onClick={() => {
                      if (!session?.user) {
                        toast({
                          type: "error",
                          title: "Akses Ditolak",
                          message: "Silakan login ke akun Anda terlebih dahulu untuk meminjam buku.",
                        });
                        return;
                      }
                      setPaymentMethod("koin");
                      setIsModalOpen(true);
                    }}
                    disabled={isBorrowing || !isStokTersedia}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-500 disabled:text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed text-[#3A2818] px-8 py-3.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
                  >
                    <IconClock size={18} />
                    {isBorrowing ? "Memproses..." : !isStokTersedia ? "Stok Habis" : "Pinjam Buku"}
                  </button>
                )}
              </div>

              {/* Book Synopsis */}
              <div className="bg-white rounded-[20px] border border-[#D4C4AE]/40 p-6 sm:p-8 space-y-4 shadow-[0_4px_24px_rgba(58,40,24,.02)]">
                <h2 className="font-serif-elegant text-lg font-bold text-[#56402A] border-b border-[#E8DDD0]/60 pb-2 flex items-center gap-2">
                  <IconNotes size={20} />
                  Sinopsis Buku
                </h2>
                <div
                  className="text-sm text-[#3A2818] leading-relaxed font-normal 
                   [&_ul]:list-disc [&_ul]:pl-5 
                   [&_ol]:list-decimal [&_ol]:pl-5 
                   [&_li]:margin-bottom-1 
                   [&_hr]:my-4 [&_hr]:border-[#E8DDD0]/60"
                  dangerouslySetInnerHTML={{
                    __html: book.deskripsi || "Tidak ada sinopsis resmi untuk kompilasi buku ini."
                  }}
                />
              </div>

              {/* Technical Metadata Matrix Table */}
              <div className="bg-white rounded-[20px] border border-[#D4C4AE]/40 p-6 shadow-[0_4px_24px_rgba(58,40,24,.02)] space-y-4">
                <h2 className="font-serif-elegant text-base font-bold text-[#56402A] flex items-center gap-2">
                  <IconFileText size={18} />
                  Informasi Detail
                </h2>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs border-t border-[#E8DDD0]/50 pt-4">
                  <div className="space-y-1">
                    <span className="text-[#9A7E5A] block font-medium">Penerbit</span>
                    <span className="text-[#3A2818] font-semibold flex items-center gap-1.5">
                      <IconFileText size={14} className="text-[#9A7E5A]" /> {book.penerbit}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#9A7E5A] block font-medium">Tahun Terbit</span>
                    <span className="text-[#3A2818] font-semibold flex items-center gap-1.5">
                      <IconCalendar size={14} className="text-[#9A7E5A]" /> {book.thn_terbit}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#9A7E5A] block font-medium">Kode Registrasi</span>
                    <span className="font-mono font-semibold flex items-center gap-1.5 text-amber-800">
                      #{book.id_buku}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Modal Window */}
        {isModalOpen && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white max-w-sm w-full rounded-[24px] border border-[#D4C4AE]/50 p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 shrink-0">
                  <IconAlertCircle size={24} />
                </div>
                <div>
                  <h3 className="font-serif-elegant text-lg font-bold text-[#3A2818]">Metode Konfirmasi</h3>
                  <p className="text-xs text-[#9A7E5A] mt-0.5">Hai <span className="font-bold text-[#56402A]">{session?.user?.name || "Pembaca"}</span>, silakan pilih saldo pemotongan.</p>
                </div>
              </div>

              {/* Panel Seleksi Pembayaran */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#56402A] tracking-wider uppercase block">Pilih Saldo Pembayaran</span>
                <div className="grid grid-cols-2 gap-3">

                  {/* Opsi Koin */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("koin")}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer gap-0.5 ${paymentMethod === "koin"
                      ? "bg-[#56402A] border-[#56402A] text-white shadow-xs"
                      : "bg-[#FAF7F2] border-[#D4C4AE]/50 text-[#9A7E5A] hover:border-[#56402A]"
                      }`}
                  >
                    <IconCoin size={20} className={paymentMethod === "koin" ? "text-amber-400" : "text-[#9A7E5A]"} />
                    <span className="text-xs font-bold mt-1">Gunakan Koin</span>
                    <span className="text-[9px] opacity-75">Miliki: {user?.koin}</span>
                  </button>

                  {/* Opsi Stamp */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("stamp")}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer gap-0.5 ${paymentMethod === "stamp"
                      ? "bg-[#56402A] border-[#56402A] text-white shadow-xs"
                      : "bg-[#FAF7F2] border-[#D4C4AE]/50 text-[#9A7E5A] hover:border-[#56402A]"
                      }`}
                  >
                    <IconTicket size={20} className={paymentMethod === "stamp" ? "text-amber-400" : "text-[#9A7E5A]"} />
                    <span className="text-xs font-bold mt-1">Tukar Stamp</span>
                    <span className="text-[9px] opacity-75">Miliki: {user?.stamp}</span>
                  </button>

                </div>
              </div>

              {/* Summary Metrics */}
              <div className="bg-[#FAF7F2] rounded-xl border border-[#D4C4AE]/30 p-4 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#9A7E5A]">Judul Buku</span>
                  <span className="text-[#3A2818] font-semibold max-w-45 text-right truncate">{book.judul}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9A7E5A]">Durasi Pinjam</span>
                  <span className="text-[#3A2818] font-bold">{durasiPinjamHariDefault} Hari</span>
                </div>
                <div className="h-px bg-[#E8DDD0]/60 my-1" />
                <div className="flex justify-between items-center">
                  <span className="text-[#9A7E5A]">Biaya Pemotongan</span>
                  <div className="flex items-center gap-1 font-bold text-[#3A2818]">
                    {paymentMethod === "koin" ? (
                      <>
                        <IconCoin size={14} className="text-amber-500" />
                        <span className={(user?.koin ?? 0) < book.koin ? "text-red-600 line-through" : ""}>{book.koin} Koin</span>
                      </>
                    ) : (
                      <>
                        <IconTicket size={14} className="text-amber-500" />
                        <span className={(user?.stamp ?? 0) < book.stamp ? "text-red-600 line-through" : ""}>{book.stamp} Stamp</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Teks Warning jika Saldo Kurang */}
              {!isBalanceEnough && (
                <p className="text-[11px] font-semibold text-red-600 text-center bg-red-50 py-2 rounded-lg border border-red-200/60 animate-pulse">
                  ⚠️ Saldo {paymentMethod === "koin" ? "Koin" : "Stamp"} Anda tidak mencukupi.
                </p>
              )}

              {/* Action Control Panel */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-[#D4C4AE] text-[#9A7E5A] hover:text-[#56402A] hover:bg-[#FAF7F2] rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer"
                >
                  Batal
                </button>

                <button
                  onClick={handleConfirmBorrow}
                  disabled={!isBalanceEnough}
                  className="flex-1 py-3 bg-[#56402A] hover:bg-[#3A2818] disabled:bg-stone-400 disabled:text-stone-200 disabled:opacity-50 disabled:cursor-not-allowed text-[#F3ECE0] rounded-xl text-xs font-bold tracking-wide shadow-sm transition-all"
                >
                  Konfirmasi Pinjam
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer toasts={toasts} onRemove={remove} />
      </div>
    </UserLayout>
  );
}