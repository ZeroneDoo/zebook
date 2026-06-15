'use client';

import React, { useState, useEffect } from 'react';
import {
  IconLayoutGrid, IconSkull, IconHeart, IconRocket, IconBuildingMonument, IconBulb, IconWand, IconMasksTheater, IconMicroscope,
  IconStar, IconCoin, IconTicket, IconArrowRight, IconLoader2,
  IconBooks
} from '@tabler/icons-react';
import UserHero from '@/components/partials/UserHero';
import UserLayout from '@/components/layout/UserLayout';
import Link from 'next/link';
import Image from 'next/image';

// Interface untuk mencocokkan tipe data dari Prisma API Anda
interface KategoriDetail {
  id_kategori: string;
  nama_kategori: string;
}

interface BukuKategoriRel {
  kategori: KategoriDetail;
}

interface DynamicBukuModel {
  id_buku: string;
  judul: string;
  penulis: string;
  stok: number;
  koin: number;
  stamp?: number;
  img_url?: string;
  buku_kategori?: BukuKategoriRel[];
  // Menambahkan opsional rating & stars bawaan API jika ada di kemudian hari
  rating?: string;
  stars?: number[];
}

export default function FolioLibrary() {
  const [activeChip, setActiveChip] = useState('All');
  const [justReleasedBooks, setJustReleasedBooks] = useState<DynamicBukuModel[]>([]);
  const [loadingJustReleased, setLoadingJustReleased] = useState(true);

  const [bestsellerBooks, setBestsellerBooks] = useState<DynamicBukuModel[]>([]);
  const [loadingBestsellers, setLoadingBestsellers] = useState(true);

  // Mengambil data dari endpoint API Buku secara dinamis (Hanya 5 Data)
  useEffect(() => {
    // 1. Fetch Data Just Released
    async function fetchJustReleased() {
      try {
        setLoadingJustReleased(true);
        const response = await fetch('/api/buku?page=1&limit=10&sort_field=id_buku&sort_dir=DESC');
        const result = await response.json();
        if (result?.data) setJustReleasedBooks(result.data);
      } catch (error) {
        console.error("Gagal memuat dynamic menu buku:", error);
      } finally {
        setLoadingJustReleased(false);
      }
    }

    // 2. Fetch Data Real Bestsellers dari API baru
    async function fetchBestsellers() {
      try {
        setLoadingBestsellers(true);
        const response = await fetch('/api/buku/bestsellers');
        const result = await response.json();
        if (result?.data) setBestsellerBooks(result.data);
      } catch (error) {
        console.error("Gagal memuat bestsellers data:", error);
      } finally {
        setLoadingBestsellers(false);
      }
    }

    fetchJustReleased();
    fetchBestsellers();
  }, []);


  return (
    <UserLayout>
      {/* ─── HERO SECTION ─── */}
      <UserHero topBook={bestsellerBooks[0]} />

      {/* ─── BESTSELLERS SECTION ─── */}
      <section className="px-4 sm:px-8 lg:px-13 py-11">
        <div className="flex items-center justify-between mb-7">
          <h2 className="font-serif-elegant text-2xl sm:text-3xl font-semibold text-[#3A2818] flex items-center gap-3 after:content-[''] after:block after:w-7 after:h-[1.5px] after:bg-[#B8A080]">
            Buku Paling Sering Dipinjam
          </h2>
        </div>

        {loadingBestsellers ? (
          <div className="w-full flex flex-col items-center justify-center py-12 gap-2 text-sm text-[#9A7E5A] font-medium">
            <IconLoader2 size={24} className="animate-spin text-[#56402A]" />
            <span>Menganalisis data buku terpopuler...</span>
          </div>
        ) : bestsellerBooks.length < 1 ? (
          /* KONDISI JIKA DATA KOSONG */
          <div className="w-full flex flex-col items-center justify-center py-14 px-4 border border-dashed border-[#D4C4AE] rounded-[14px] bg-[#FAF7F2]/50 text-center">
            <IconBooks size={32} className="text-[#9A7E5A] mb-2.5" />
            {/* Teks Empty State disesuaikan */}
            <h3 className="font-serif-elegant text-base font-semibold text-[#3A2818]">Belum Ada Buku Terfavorit</h3>
            <p className="text-xs text-[#9A7E5A] max-w-xs mt-1 leading-relaxed">
              Daftar buku yang paling banyak dipinjam belum tersedia saat ini. Silakan jelajahi katalog umum kami terlebih dahulu.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {bestsellerBooks.slice(1).map((book, index) => {
              const activeCover = book.img_url || "https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/products/ndgciipm75.jpeg";
              // const gradient = cardGradients[index % cardGradients.length]; // Distribusi warna estetik otomatis
              const isAvailable = book.stok > 0;
              const peringkat = index + 2;
              const hasCategories = book.buku_kategori && book.buku_kategori.length > 0;

              return (
                <div key={book.id_buku} className="group cursor-pointer relative flex flex-col justify-between">

                  {/* 3D Dynamic Visual Wrapper */}
                  <div className="relative h-50 flex items-end justify-center pb-3 overflow-hidden" style={{ perspective: '800px' }}>
                    <div
                      className={`w-27.5 h-40 rounded-l-xs rounded-r-lg relative overflow-hidden bg-linear-to-br  shadow-[8px_16px_32px_rgba(58,40,24,.22),inset_-2px_0_6px_rgba(0,0,0,.15)] transition-all duration-350 shrink-0 group-hover:-translate-y-2.5`}
                      style={{ transform: 'perspective(500px) rotateY(-10deg) rotateX(2deg)', transformStyle: 'preserve-3d' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'perspective(500px) rotateY(-3deg) rotateX(0deg)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'perspective(500px) rotateY(-10deg) rotateX(2deg)'}
                    >
                      {/* Gunakan gambar asli cover buku jika tersedia */}
                      {book.img_url ? (
                        <Image src={activeCover} alt={book.judul} fill className="object-cover opacity-85" unoptimized />
                      ) : null}

                      <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-black/22 z-10"></div>
                    </div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-22.5 h-4 bg-radial ellipse from-black/22 to-transparent opacity-100 transition-all duration-350 group-hover:w-27.5 group-hover:opacity-50"></div>
                  </div>

                  {/* Book Info Card Block */}
                  <div className="bg-white rounded-[14px] p-4 pt-3.5 border border-[#D4C4AE]/22 shadow-[0_2px_10px_rgba(58,40,24,.07)] transition-all group-hover:shadow-[0_8px_30px_rgba(58,40,24,.11)] -mt-0.5">
                    {/* TAG PERINGKAT ELEGAN (#2, #3, dst) */}
                    <span className="text-[8px] font-extrabold tracking-wide uppercase px-2 py-0.5 bg-[#C8A84E] text-[#221508] rounded-md block shadow-xs w-fit mb-2">
                      # PERINGKAT {peringkat}
                    </span>
                    <div className="flex items-center gap-1 mb-1.5 min-h-4.5 flex-wrap shrink-0">

                      {hasCategories ? (
                        book.buku_kategori?.map((rel) => (
                          <span
                            key={rel.kategori.id_kategori}
                            className="text-[7px] sm:text-[7.5px] font-bold tracking-wide uppercase px-1.5 py-0.5 bg-[#FAF7F2] text-[#9A7E5A] border border-[#D4C4AE]/35 rounded-md block"
                          >
                            {rel.kategori.nama_kategori}
                          </span>
                        ))
                      ) : (
                        <span className="text-[7px] sm:text-[7.5px] font-bold tracking-wide uppercase px-1.5 py-0.5 bg-[#FAF7F2] text-[#9A7E5A] border border-[#D4C4AE]/35 rounded-md block">
                          Umum
                        </span>
                      )}
                    </div>

                    <div className="font-serif-elegant text-[15px] font-semibold text-[#3A2818] leading-tight truncate">{book.judul}</div>
                    <div className="text-xs text-[#B8A080] mb-2 truncate">{book.penulis}</div>

                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5 text-xs">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="flex items-center gap-0.5 text-[#56402A] font-semibold">
                          <IconCoin size={13} className="text-[#C8A84E]" />
                          <span>{book.koin}</span>
                        </div>
                        <div className="w-px h-3 bg-[#D4C4AE]/40"></div>
                        <div className="flex items-center gap-0.5 text-[#B8A080] font-medium">
                          <IconTicket size={13} />
                          <span>{book.stamp || 0} Stamp</span>
                        </div>
                      </div>

                      <div className={`text-[7.5px] sm:text-[9px] font-extrabold tracking-wide uppercase px-1.5 sm:px-2 py-0.5 rounded-md border ${isAvailable
                        ? "text-emerald-800 bg-emerald-50 border-emerald-200/50"
                        : "text-red-800 bg-red-50 border-red-200/50"
                        }`}>
                        {isAvailable ? `Stok: ${book.stok}` : "Habis"}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── DYNAMIC JUST RELEASED SECTION ─── */}
      <section className="px-4 sm:px-8 lg:px-13 pb-16">
        <div className="flex items-center justify-between mb-7">
          <h2 className="font-serif-elegant text-2xl sm:text-3xl font-semibold text-[#3A2818] flex items-center gap-3 after:content-[''] after:block after:w-7 after:h-[1.5px] after:bg-[#B8A080]">
            Rilisan Terbaru
          </h2>
          <Link href="/buku" className="flex items-center gap-1 text-xs sm:text-sm font-medium text-[#9A7E5A] hover:text-[#56402A] transition-all group">
            Lihat Semua <IconArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loadingJustReleased ? (
          <div className="w-full flex flex-col items-center justify-center py-12 gap-2 text-sm text-[#9A7E5A] font-medium">
            <IconLoader2 size={24} className="animate-spin text-[#56402A]" />
            <span>Memuat buku terbaru...</span>
          </div>
        ) : justReleasedBooks.length < 1 ? (
          /* KONDISI JIKA DATA JUST RELEASED KOSONG */
          <div className="w-full flex flex-col items-center justify-center py-14 px-4 border border-dashed border-[#D4C4AE] rounded-[14px] bg-[#FAF7F2]/50 text-center">
            <IconBooks size={32} className="text-[#9A7E5A] mb-2.5" />
            <h3 className="font-serif-elegant text-base font-semibold text-[#3A2818]">Belum Ada Buku Baru</h3>
            <p className="text-xs text-[#9A7E5A] max-w-xs mt-1 leading-relaxed">
              Katalog buku terbitan terbaru belum ditambahkan ke sistem. Silakan hubungi pustakawan atau kembali nanti.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-10 sm:gap-y-12 gap-x-4 sm:gap-x-6 justify-center">
            {justReleasedBooks.map((book, index) => {
              const activeCover = book.img_url || "https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/products/ndgciipm75.jpeg";
              const isAvailable = book.stok > 0;
              const hasCategories = book.buku_kategori && book.buku_kategori.length > 0;

              return (
                <Link
                  key={book.id_buku}
                  href={`/buku/${book.id_buku}`}
                  /* Mengubah w-43.75 menjadi w-full max-w-[175px] agar kartu mengecil secara fleksibel di perangkat seluler */
                  className="w-full max-w-43.75 group cursor-pointer relative mx-auto block"
                >
                  {/* Mengatur ketinggian bungkus efek 3D agar kartu putih melekat erat (pressed) di bawah buku */}
                  <div className="relative h-38 sm:h-42.5 flex items-end justify-center pb-1 sm:pb-3" style={{ perspective: '800px' }}>
                    <div
                      className="w-22.5 h-32.5 rounded-l-xs rounded-r-lg relative overflow-hidden bg-stone-200 shadow-[6px_12px_24px_rgba(58,40,24,.18),inset_-2px_0_6px_rgba(0,0,0,.12)] transition-all duration-350 shrink-0 group-hover:-translate-y-2 z-20"
                      style={{ transform: 'perspective(500px) rotateY(-10deg) rotateX(2deg)', transformStyle: 'preserve-3d' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'perspective(500px) rotateY(-3deg) rotateX(0deg)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'perspective(500px) rotateY(-10deg) rotateX(2deg)'}
                    >
                      <Image
                        src={activeCover}
                        alt={book.judul}
                        fill
                        sizes="90px"
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/22 z-10" />
                    </div>
                    {/* Memperbaiki glitch visual bayangan lantai menjadi bentuk elips blur halus */}
                    <div className="absolute bottom-1 sm:bottom-0 left-1/2 -translate-x-1/2 w-16 sm:w-18.75 h-1.5 bg-black/10 blur-xs rounded-full z-10" />
                  </div>

                  {/* Menggunakan padding dinamis (p-2.5 di mobile, p-3.5 di desktop) serta margin negatif untuk mengunci celah */}
                  <div className="bg-white rounded-[14px] p-2.5 sm:p-3.5 pt-2.5 sm:pt-3 border border-[#D4C4AE]/22 shadow-[0_2px_10px_rgba(58,40,24,.07)] -mt-1 sm:-mt-0.5 relative z-10">
                    {/* Ditambahkan flex-nowrap dan overflow-x-auto agar tag kategori berjejer horizontal & tidak menumpuk ke bawah di mobile */}
                    <div className="flex items-center gap-1 mb-1.5 min-h-[18px] flex-wrap shrink-0">
                      {hasCategories ? (
                        book.buku_kategori?.map((rel) => (
                          <span
                            key={rel.kategori.id_kategori}
                            className="text-[7px] sm:text-[7.5px] font-bold tracking-wide uppercase px-1.5 py-0.5 bg-[#FAF7F2] text-[#9A7E5A] border border-[#D4C4AE]/35 rounded-md block"
                          >
                            {rel.kategori.nama_kategori}
                          </span>
                        ))
                      ) : (
                        <span className="text-[7px] sm:text-[7.5px] font-bold tracking-wide uppercase px-1.5 py-0.5 bg-[#FAF7F2] text-[#9A7E5A] border border-[#D4C4AE]/35 rounded-md block">
                          Umum
                        </span>
                      )}
                    </div>

                    {/* Menyesuaikan ukuran font judul dan penulis agar lebih pas di mobile */}
                    <div className="font-serif-elegant text-xs sm:text-sm font-semibold text-[#3A2818] leading-tight truncate group-hover:text-[#56402A] transition-colors">
                      {book.judul}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-[#B8A080] mb-2 truncate">
                      {book.penulis}
                    </div>

                    {/* Menata ulang bagian koin, tiket, dan stok agar membungkus dengan rapi tanpa berhimpitan di resolusi kecil */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-[#56402A] font-bold">
                          <IconCoin size={12} className="text-[#C8A84E]" />
                          <span>{book.koin}</span>
                        </div>
                        <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-[#56402A] font-bold">
                          <IconTicket size={12} className="text-[#C8A84E]" />
                          <span>{book.stamp}</span>
                        </div>
                      </div>

                      <div className={`text-[7.5px] sm:text-[9px] font-extrabold tracking-wide uppercase px-1.5 sm:px-2 py-0.5 rounded-md border ${isAvailable
                        ? "text-emerald-800 bg-emerald-50 border-emerald-200/50"
                        : "text-red-800 bg-red-50 border-red-200/50"
                        }`}>
                        {isAvailable ? `Stok: ${book.stok}` : "Habis"}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </UserLayout >
  );
}