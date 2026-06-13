'use client';

import React, { useState } from 'react';
import {
  IconLayoutGrid, IconSkull, IconHeart, IconRocket, IconBuildingMonument, IconBulb, IconWand, IconMasksTheater, IconMicroscope,
  IconPlayerPlay, IconStar, IconSun, IconBook2, IconArrowRight, IconCoin, IconTicket, IconCircleCheck, IconClock, IconAlertCircle
} from '@tabler/icons-react';
import UserNavbar from '@/components/partials/UserNavbar';
import UserHero from '@/components/partials/UserHero';
import UserFooter from '@/components/partials/UserFooter';
import UserLayout from '@/components/layout/UserLayout';
import Link from 'next/link';

export default function FolioLibrary() {
  const [activeChip, setActiveChip] = useState('All');

  // Unified Categories mapped from `kategori` table logic
  const categories = [
    { name: 'All', icon: IconLayoutGrid },
    { name: 'Thriller', icon: IconSkull },
    { name: 'Romance', icon: IconHeart },
    { name: 'Sci-Fi', icon: IconRocket },
    { name: 'History', icon: IconBuildingMonument },
    { name: 'Self-Help', icon: IconBulb },
    { name: 'Fantasy', icon: IconWand },
    { name: 'Drama', icon: IconMasksTheater },
    { name: 'Science', icon: IconMicroscope },
  ];

  // Simulated dynamic mock user values corresponding to your `pengguna` table
  const mockUser = {
    nama_pengguna: "Aris J.",
    koin: 125,
    stamp: 8,
    hasBorrowed: true,
    activeLoanCount: 2,
    nearestDueDays: 3,
    currentBook: {
      judul: "The Last Thing He Told Me",
      penulis: "Laura Dave",
      progress: 72
    }
  };

  // Structured Books dataset explicitly utilizing fields from your `buku` table layout
  const bestsellers = [
    { id_buku: "B00001", judul: "Left to Fear", penulis: "Blake Pierce", tag: "Thriller", rating: "3.2", gradient: "from-[#6B3A1A] to-[#3A1A08]", stars: [1, 1, 1, 0, 0], koin: 5, stamp: 1, stok: 4 },
    { id_buku: "B00002", judul: "False Witness", penulis: "Karin Slaughter", tag: "Thriller", rating: "4.0", gradient: "from-[#3A2858] to-[#1A1030]", stars: [1, 1, 1, 1, 0], koin: 8, stamp: 2, stok: 2 },
    { id_buku: "B00003", judul: "Malibu Rising", penulis: "Taylor Jenkins Reid", tag: "Romance", rating: "4.1", gradient: "from-[#1A4A6A] to-[#08202E]", stars: [1, 1, 1, 1, 0], koin: 6, stamp: 1, stok: 0 }, // Out of stock simulation
    { id_buku: "B00004", judul: "Black Ice", penulis: "Brad Thor", tag: "Sci-Fi", rating: "3.8", gradient: "from-[#182040] to-[#080C20]", stars: [1, 1, 1, 0.5, 0], koin: 7, stamp: 2, stok: 7 },
    { id_buku: "B00005", judul: "Blind Tiger", penulis: "Sandra Brown", tag: "History", rating: "4.6", gradient: "from-[#5A1A1A] to-[#280808]", stars: [1, 1, 1, 1, 1], koin: 10, stamp: 3, stok: 1 }
  ];

  const justReleased = [
    { id_buku: "B00006", judul: "The Covenant of Water", displayTitle: "Covenant of Water", penulis: "Abraham Verghese", shortAuth: "A. Verghese", tag: "History", gradient: "from-[#2A5A30] to-[#102018]", koin: 12, stamp: 4 },
    { id_buku: "B00007", judul: "Tomorrow, and Tomorrow", displayTitle: "Tomorrow & Tomorrow", penulis: "Gabrielle Zevin", shortAuth: "G. Zevin", tag: "Fantasy", gradient: "from-[#6A5010] to-[#302008]", koin: 9, stamp: 2 },
    { id_buku: "B00008", judul: "Hello Beautiful", displayTitle: "Hello Beautiful", penulis: "Ann Napolitano", shortAuth: "A. Napolitano", tag: "Drama", gradient: "from-[#5A1840] to-[#280818]", koin: 6, stamp: 1 },
    { id_buku: "B00009", judul: "Fourth Wing", displayTitle: "Fourth Wing", penulis: "Rebecca Yarros", shortAuth: "R. Yarros", tag: "Fantasy", gradient: "from-[#184858] to-[#081820]", koin: 15, stamp: 5 }
  ];

  // Active user tracking datasets corresponding directly to your `peminjaman_buku` ENUM statuses
  const userLoans = [
    { id_peminjaman: "P000001", judul: "The Last Thing He Told Me", penulis: "Laura Dave", progress: "72%", txt: "~1h 20m left", status: "DIPINJAM", color: "from-[#2D5A3D] to-[#163020]" },
    { id_peminjaman: "P000002", judul: "False Witness: A Novel", penulis: "Karin Slaughter", progress: "0%", txt: "Awaiting approval", status: "DIPROSES", color: "from-[#3A2858] to-[#1A1030]" },
    { id_peminjaman: "P000003", judul: "Blind Tiger", penulis: "Sandra Brown", progress: "100%", txt: "Returned successfully", status: "DIKEMBALIKAN", color: "from-[#5A1A1A] to-[#280808]" }
  ];

  // Helper utility to render visual tags depending on the database status state
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'DIPINJAM':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800"><IconClock size={10} /> Borrowed</span>;
      case 'DIPROSES':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800"><IconClock size={10} /> Processing</span>;
      case 'DIKEMBALIKAN':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800"><IconCircleCheck size={10} /> Returned</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  return (
    <UserLayout>
      {/* ─── HERO SECTION ─── */}
      <UserHero user={mockUser} />

      {/* ─── BESTSELLERS SECTION ─── */}
      <section className="px-4 sm:px-8 lg:px-13 py-11">
        <div className="flex items-center justify-between mb-7">
          <h2 className="font-serif-elegant text-2xl sm:text-3xl font-semibold text-[#3A2818] flex items-center gap-3 after:content-[''] after:block after:w-7 after:h-[1.5px] after:bg-[#B8A080]">
            Recent Bestsellers
          </h2>
          {/* <a href="#" className="flex items-center gap-1 text-xs sm:text-sm font-medium text-[#9A7E5A] hover:text-[#56402A] hover:gap-2 transition-all group">
            See all new books <IconArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </a> */}
        </div>

        {/* Responsive Grid View for Books */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {bestsellers.map((book) => (
            <div key={book.id_buku} className="group cursor-pointer relative flex flex-col justify-between">

              {/* 3D Dynamic Transformation Visual Wrapper */}
              <div className="relative h-50 flex items-end justify-center pb-3 overflow-hidden" style={{ perspective: '800px' }}>
                <div
                  className={`w-27.5 h-40 rounded-l-xs rounded-r-lg relative overflow-hidden bg-linear-to-br ${book.gradient} shadow-[8px_16px_32px_rgba(58,40,24,.22),inset_-2px_0_6px_rgba(0,0,0,.15)] transition-all duration-350 shrink-0 group-hover:-translate-y-2.5`}
                  style={{ transform: 'perspective(500px) rotateY(-10deg) rotateX(2deg)', transformStyle: 'preserve-3d' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'perspective(500px) rotateY(-3deg) rotateX(0deg)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'perspective(500px) rotateY(-10deg) rotateX(2deg)'}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-black/22 z-10"></div>
                  <div className="absolute inset-0 flex flex-col justify-between p-3 pl-3.5 text-white">
                    <div className="font-serif-elegant text-xs font-semibold leading-tight drop-shadow-md">{book.judul}</div>
                    <div className="text-[9px] opacity-70">{book.penulis}</div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-22.5 h-4 bg-radial ellipse from-black/22 to-transparent opacity-100 transition-all duration-350 group-hover:w-27.5 group-hover:opacity-50"></div>
              </div>

              {/* Book Info Card Block */}
              <div className="bg-white rounded-[14px] p-4 pt-3.5 border border-[#D4C4AE]/22 shadow-[0_2px_10px_rgba(58,40,24,.07)] transition-all group-hover:shadow-[0_8px_30px_rgba(58,40,24,.11)] -mt-0.5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-[#9A7E5A]">{book.tag}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${book.stok > 0 ? 'bg-amber-50 text-[#7A5E3E]' : 'bg-rose-50 text-rose-700'}`}>
                    {book.stok > 0 ? `${book.stok} available` : 'Out of Stock'}
                  </span>
                </div>

                <div className="font-serif-elegant text-[15px] font-semibold text-[#3A2818] leading-tight truncate">{book.judul}</div>
                <div className="text-xs text-[#B8A080] mb-2">{book.penulis}</div>

                {/* Cost Matrix display linked to Koin or Stamp usage options */}
                <div className="flex items-center gap-3 mb-3 text-xs border-y border-[#FAF7F2] py-1.5">
                  <div className="flex items-center gap-0.5 text-[#56402A] font-semibold">
                    <IconCoin size={13} className="text-[#C8A84E]" />
                    <span>{book.koin}</span>
                  </div>
                  <div className="w-px h-3 bg-[#D4C4AE]/40"></div>
                  <div className="flex items-center gap-0.5 text-[#B8A080] font-medium">
                    <IconTicket size={13} />
                    <span>{book.stamp} Stamp</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {book.stars.map((star, i) => (
                      <IconStar key={i} size={12} className={star > 0 ? 'text-[#C8A84E] fill-[#C8A84E]' : 'text-[#D4C4AE]'} />
                    ))}
                    <span className="text-[11px] text-[#B8A080] ml-1">{book.rating}</span>
                  </div>

                  <button
                    disabled={book.stok === 0}
                    className={`px-3 py-1.5 rounded-full text-[11.5px] font-medium transition-colors ${book.stok > 0 ? 'border border-[#D4C4AE] text-[#7A5E3E] hover:bg-[#56402A] hover:border-[#56402A] hover:text-[#F5EBD9]' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}
                  >
                    Borrow
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* ─── TWO COLUMN SPLIT SECTION ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 px-4 sm:px-8 lg:px-13 pb-13">

        {/* Just Released Container */}
        <div>
          <div className="flex items-center justify-between mb-5.5">
            <h2 className="font-serif-elegant text-2xl sm:text-3xl font-semibold text-[#3A2818] flex items-center gap-3 after:content-[''] after:block after:w-7 after:h-[1.5px] after:bg-[#B8A080]">
              Just Released
            </h2>
            <Link href="/buku" className="flex items-center gap-1 text-xs sm:text-sm font-medium text-[#9A7E5A] hover:text-[#56402A] transition-all group">
              View all <IconArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* ─── CATEGORY CHIPS SCROLL (Moved Here) ─── */}
          {/* <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-2 mask-linear">
            {categories.map((chip) => (
              <button
                key={chip.name}
                onClick={() => setActiveChip(chip.name)}
                className={`flex items-center gap-1.5 px-4.5 py-2 rounded-full text-xs font-medium border transition-all duration-200 shrink-0 ${activeChip === chip.name ? 'bg-[#56402A] border-[#56402A] text-[#F5EBD9]' : 'bg-white border-[#D4C4AE] text-[#9A7E5A] hover:border-[#9A7E5A] hover:text-[#56402A] hover:bg-[#F3ECE0]'}`}
              >
                {chip.name}
              </button>
            ))}
          </div> */}

          {/* Horizontal Scroller for Quick View Grid */}
          <div className="flex gap-4.5 overflow-x-auto pb-2 scroll-smooth no-scrollbar snap-x snap-mandatory">
            {justReleased.map((book) => (
              <div key={book.id_buku} className="flex-none w-43.75 snap-start group cursor-pointer relative">

                {/* 3D Core View Block */}
                <div className="relative h-42.5 flex items-end justify-center pb-3 overflow-hidden" style={{ perspective: '800px' }}>
                  <div
                    className={`w-22.5 h-32.5 rounded-l-xs rounded-r-lg relative overflow-hidden bg-linear-to-br ${book.gradient} shadow-[8px_16px_32px_rgba(58,40,24,.22),inset_-2px_0_6px_rgba(0,0,0,.15)] transition-all duration-350 shrink-0 group-hover:-translate-y-2.5`}
                    style={{ transform: 'perspective(500px) rotateY(-10deg) rotateX(2deg)', transformStyle: 'preserve-3d' }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/22 z-10"></div>
                    <div className="absolute inset-0 flex flex-col justify-between p-2.5 pl-3 text-white">
                      <div className="font-serif-elegant text-[11px] font-semibold leading-tight">{book.displayTitle}</div>
                      <div className="text-[8px] opacity-70">{book.shortAuth}</div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-18.75 h-3 bg-radial ellipse from-black/22 to-transparent opacity-100"></div>
                </div>

                {/* Info Text Card */}
                <div className="bg-white rounded-[14px] p-3.5 pt-3 border border-[#D4C4AE]/22 shadow-[0_2px_10px_rgba(58,40,24,.07)] -mt-0.5">
                  <div className="text-[9px] font-semibold tracking-wider uppercase text-[#9A7E5A] mb-0.5">{book.tag}</div>
                  <div className="font-serif-elegant text-sm font-semibold text-[#3A2818] leading-tight truncate">{book.judul}</div>
                  <div className="text-[11px] text-[#B8A080] mb-2 truncate">{book.penulis}</div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-[#56402A] font-bold">
                      <IconCoin size={12} className="text-[#C8A84E]" />
                      <span>{book.koin}</span>
                    </div>
                    <button className="px-3 py-0.5 rounded-full border border-[#D4C4AE] text-[10.5px] font-medium text-[#7A5E3E] hover:bg-[#56402A] hover:text-white transition-colors">
                      Borrow
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Reading Tracker & Transaction Tracker Column */}
        <div>
          <div className="flex items-center justify-between mb-5.5">
            <h2 className="font-serif-elegant text-2xl sm:text-3xl font-semibold text-[#3A2818] flex items-center gap-3 after:content-[''] after:block after:w-7 after:h-[1.5px] after:bg-[#B8A080]">
              My Loan Status
            </h2>
            <a href="#" className="flex items-center gap-1 text-xs sm:text-sm font-medium text-[#9A7E5A] hover:text-[#56402A] transition-all group">
              History <IconArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          <div className="flex flex-col gap-2.5">
            {userLoans.map((item) => (
              <div key={item.id_peminjaman} className="flex items-center gap-3.5 bg-white rounded-[10px] p-3.5 px-4 border border-[#D4C4AE]/22 shadow-[0_2px_10px_rgba(58,40,24,.07)] cursor-pointer transition-all hover:translate-x-1 hover:border-[#B8A080]">
                <div className={`w-10 h-14.5 rounded-l-[3px] rounded-r-md shrink-0 overflow-hidden relative shadow-[3px_5px_14px_rgba(58,40,24,.18)] bg-linear-to-br ${item.color} flex items-center justify-center text-white/70`}>
                  <IconBook2 size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <div className="font-serif-elegant text-sm font-semibold text-[#3A2818] truncate">{item.judul}</div>
                    {renderStatusBadge(item.status)}
                  </div>
                  <div className="text-[11.5px] text-[#B8A080]">{item.penulis}</div>

                  {item.status === 'DIPINJAM' && (
                    <div className="mt-1.5">
                      <div className="h-[2.5px] bg-[#E8DDD0] rounded-full overflow-hidden">
                        <div className="h-full bg-linear-to-r from-[#9A7E5A] to-[#C8A84E]" style={{ width: item.progress }}></div>
                      </div>
                      <div className="text-[10.5px] text-[#B8A080] mt-1">{item.progress} completed · {item.txt}</div>
                    </div>
                  )}

                  {item.status === 'DIPROSES' && (
                    <p className="text-[10.5px] text-amber-600 mt-1 flex items-center gap-1">
                      <IconAlertCircle size={11} /> Waiting for admin verification.
                    </p>
                  )}

                  {item.status === 'DIKEMBALIKAN' && (
                    <p className="text-[10.5px] text-emerald-600 mt-1">
                      Returned. You earned your stamp reward!
                    </p>
                  )}
                </div>

                {item.status === 'DIPINJAM' && (
                  <button className="w-8 h-8 rounded-full shrink-0 bg-[#E8DDD0] flex items-center justify-center text-[#7A5E3E] transition-colors hover:bg-[#7A5E3E] hover:text-[#F3ECE0]" aria-label="Continue reading">
                    <IconPlayerPlay size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </UserLayout>
  );
}