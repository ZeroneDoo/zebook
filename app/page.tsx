'use client';

import React, { useState } from 'react';
import {
  // Navigation & Actions
  IconBooks, IconHeadphones, IconBookmark, IconSearch, IconShoppingBag, IconBell, IconArrowRight, IconPlus,
  // Categories
  IconLayoutGrid, IconSkull, IconHeart, IconRocket, IconBuildingMonument, IconBulb, IconWand, IconMasksTheater, IconMicroscope,
  // Dashboard & Media Controls
  IconUser, IconChevronRight, IconPlayerTrackPrev, IconPlayerSkipBack, IconPlayerPlay, IconPlayerPause, IconPlayerSkipForward, IconPlayerTrackNext,
  // Cards & Visuals
  IconStar, IconSun, IconBook2, IconInfoCircle, IconNews, IconMail, IconShield, IconSparkles, IconTrophy, IconCategory, IconPencil,
  // Social Media
  IconBrandInstagram, IconBrandX, IconBrandFacebook, IconBrandTiktok
} from '@tabler/icons-react';
import UserNavbar from '@/components/partials/UserNavbar';
import UserHero from '@/components/partials/UserHero';
import UserFooter from '@/components/partials/UserFooter';

export default function FolioLibrary() {
  // State variables for interactivity
  const [activeTab, setActiveTab] = useState<'books' | 'audiobooks'>('books');
  const [activeChip, setActiveChip] = useState('All');
  const [isPlaying, setIsPlaying] = useState(false);

  // Categories list containing structural React component assignments
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

  // const colors = {
  //   c0: '#FAF7F2', c1: '#F3ECE0', c2: '#E8DDD0', c3: '#D4C4AE',
  //   c4: '#B8A080', c5: '#9A7E5A', c6: '#7A5E3E', c7: '#56402A',
  //   c8: '#3A2818', c9: '#221508', gold: '#C8A84E'
  // };

  return (
    <div className="min-h-screen antialiased selection:bg-[#B8A080] selection:text-white bg-[#FAF7F2] text-[#3A2818]" style={{ fontFamily: "'Jost', sans-serif" }}>
      {/* ─── NAV BAR ─── */}
      <UserNavbar defaultTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} userInitials="AJ" />

      {/* ─── HERO SECTION ─── */}
      <UserHero />

      {/* Decorative Shelf Divider */}
      <div className="mx-4 sm:px-8 lg:mx-13 h-3.5 bg-linear-to-b from-[#D4C4AE] to-[#9A7E5A] rounded-b-lg shadow-[0_10px_28px_rgba(90,60,30,.22)]"></div>

      {/* ─── CATEGORY CHIPS SCROLL ─── */}
      <div className="px-4 sm:px-8 lg:px-13 pt-10 flex gap-2 overflow-x-auto no-scrollbar pb-2 mask-linear">
        {categories.map((chip) => {
          // const ChipIcon = chip.icon;
          return (
            <button
              key={chip.name}
              onClick={() => setActiveChip(chip.name)}
              className={`flex items-center gap-1.5 px-4.5 py-2 rounded-full text-xs font-medium border transition-all duration-200 shrink-0 ${activeChip === chip.name ? 'bg-[#56402A] border-[#56402A] text-[#F5EBD9]' : 'bg-white border-[#D4C4AE] text-[#9A7E5A] hover:border-[#9A7E5A] hover:text-[#56402A] hover:bg-[#F3ECE0]'}`}
            >
              {chip.name}
            </button>
          );
        })}
      </div>

      {/* ─── BESTSELLERS SECTION ─── */}
      <section className="px-4 sm:px-8 lg:px-13 py-11">
        <div className="flex items-center justify-between mb-7">
          <h2 className="font-serif-elegant text-2xl sm:text-3xl font-semibold text-[#3A2818] flex items-center gap-3 after:content-[''] after:block after:w-7 after:h-[1.5px] after:bg-[#B8A080]">
            Recent Bestsellers
          </h2>
          <a href="#" className="flex items-center gap-1 text-xs sm:text-sm font-medium text-[#9A7E5A] hover:text-[#56402A] hover:gap-2 transition-all group">
            See all <IconArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        {/* Responsive Grid View for Books */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {[
            { title: "Left to Fear", author: "Blake Pierce", tag: "Thriller", rating: "3.2", gradient: "from-[#6B3A1A] to-[#3A1A08]", stars: [1, 1, 1, 0, 0] },
            { title: "False Witness", author: "Karin Slaughter", tag: "Crime", rating: "4.0", gradient: "from-[#3A2858] to-[#1A1030]", stars: [1, 1, 1, 1, 0] },
            { title: "Malibu Rising", author: "Taylor Jenkins Reid", tag: "Literary", rating: "4.1", gradient: "from-[#1A4A6A] to-[#08202E]", stars: [1, 1, 1, 1, 0] },
            { title: "Black Ice", author: "Brad Thor", tag: "Action", rating: "3.8", gradient: "from-[#182040] to-[#080C20]", stars: [1, 1, 1, 0.5, 0] },
            { title: "Blind Tiger", author: "Sandra Brown", tag: "Historical", rating: "4.6", gradient: "from-[#5A1A1A] to-[#280808]", stars: [1, 1, 1, 1, 1] }
          ].map((book, index) => (
            <div key={index} className="group cursor-pointer relative flex flex-col justify-between">

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
                    <div className="font-serif-elegant text-xs font-semibold leading-tight drop-shadow-md">{book.title}</div>
                    <div className="text-[9px] opacity-70">{book.author}</div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-22.5 h-4 bg-radial ellipse from-black/22 to-transparent opacity-100 transition-all duration-350 group-hover:w-27.5 group-hover:opacity-50"></div>
              </div>

              {/* Book Info Card Block */}
              <div className="bg-white rounded-[14px] p-4 pt-3.5 border border-[#D4C4AE]/22 shadow-[0_2px_10px_rgba(58,40,24,.07)] transition-all group-hover:shadow-[0_8px_30px_rgba(58,40,24,.11)] -mt-0.5">
                <div className="text-[10px] font-semibold tracking-wider uppercase text-[#9A7E5A] mb-1">{book.tag}</div>
                <div className="font-serif-elegant text-[15px] font-semibold text-[#3A2818] leading-tight truncate">{book.title}</div>
                <div className="text-xs text-[#B8A080] mb-2.5">{book.author}</div>
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {book.stars.map((star, i) => (
                      <IconStar key={i} size={12} className={star > 0 ? 'text-[#C8A84E] fill-[#C8A84E]' : 'text-[#D4C4AE]'} />
                    ))}
                    <span className="text-[11px] text-[#B8A080] ml-1">{book.rating}</span>
                  </div>
                  <button className="px-3 py-1 rounded-full border border-[#D4C4AE] text-[11.5px] font-medium text-[#7A5E3E] transition-colors hover:bg-[#56402A] hover:border-[#56402A] hover:text-[#F5EBD9]">Buy Now</button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* ─── SUMMER HERO BANNER ─── */}
      <div className="mx-4 sm:mx-8 lg:mx-13 mb-12 rounded-[22px] bg-linear-to-br from-[#56402A] to-[#221508] p-8 sm:p-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-[0_2px_6px_rgba(58,40,24,.16)] before:content-[''] before:absolute before:-top-20 before:w-90 before:h-90 before:rounded-full before:bg-[#C8A84E]/5 after:content-[''] after:absolute before:right-24 after:-bottom-25 after:w-65 after:h-65 after:rounded-full after:bg-white/5">
        <div className="flex-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-[#C8A84E]/18 border border-[#C8A84E]/35 text-[#C8A84E] text-[11px] font-medium tracking-widest uppercase px-3 py-1 rounded-full mb-4.5">
            <IconSun size={12} /> Summer Collection
          </div>
          <h2 className="font-serif-elegant text-3xl sm:text-4xl text-[#F5EBD9] font-semibold leading-[1.12] mb-3.5">
            Summer&apos;s Most<br /><em>Anticipated</em> Reads
          </h2>
          <p className="text-sm text-[#F5EBD9]/60 leading-relaxed max-w-95 mb-7">
            Check out our best selling books of this season. Easily find your preferred book and start your reading journey today.
          </p>
          <button className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#C8A84E] text-[#221508] text-sm font-semibold shadow-[0_4px_22px_rgba(200,168,78,.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(200,168,78,.5)]">
            <IconLayoutGrid size={16} /> Explore Collection
          </button>
        </div>

        {/* Visual Layered Shelf Book Stack */}
        <div className="flex gap-3.5 items-end relative z-10 pr-5 shrink-0 max-sm:scale-90">
          <div className="w-19.5 h-29 rounded-l-md rounded-r-xl bg-linear-to-br from-[#6B8F71] to-[#3A5040] shadow-[8px_16px_36px_rgba(0,0,0,.4)] transition-transform duration-350 hover:-translate-y-2.5 hover:-rotate-1 relative cursor-pointer -rotate-2.5"><div className="absolute inset-y-0 left-0 w-3 bg-black/20"></div></div>
          <div className="w-22 h-33 rounded-l-md rounded-r-xl bg-linear-to-br from-[#7B6B8F] to-[#40304E] shadow-[8px_16px_36px_rgba(0,0,0,.4)] transition-transform duration-350 hover:-translate-y-2.5 hover:-rotate-1 relative cursor-pointer"><div className="absolute inset-y-0 left-0 w-3 bg-black/20"></div></div>
          <div className="w-18.5 h-27 rounded-l-md rounded-r-xl bg-linear-to-br from-[#8F6B6B] to-[#4E3030] shadow-[8px_16px_36px_rgba(0,0,0,.4)] transition-transform duration-350 hover:-translate-y-2.5 hover:-rotate-1 relative cursor-pointer rotate-1.5"><div className="absolute inset-y-0 left-0 w-3 bg-black/20"></div></div>
          <div className="w-20.5 h-30.5 rounded-l-md rounded-r-xl bg-linear-to-br from-[#8F836B] to-[#4E4230] shadow-[8px_16px_36px_rgba(0,0,0,.4)] transition-transform duration-350 hover:-translate-y-2.5 hover:-rotate-1 relative cursor-pointer -rotate-1"><div className="absolute inset-y-0 left-0 w-3 bg-black/20"></div></div>
        </div>
      </div>

      {/* ─── TWO COLUMN SPLIT SECTION ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 px-4 sm:px-8 lg:px-13 pb-13">

        {/* Just Released Container */}
        <div>
          <div className="flex items-center justify-between mb-5.5">
            <h2 className="font-serif-elegant text-2xl sm:text-3xl font-semibold text-[#3A2818] flex items-center gap-3 after:content-[''] after:block after:w-7 after:h-[1.5px] after:bg-[#B8A080]">
              Just Released
            </h2>
            <a href="#" className="flex items-center gap-1 text-xs sm:text-sm font-medium text-[#9A7E5A] hover:text-[#56402A] transition-all group">
              View all <IconArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Horizontal Scroller for Quick View Grid */}
          <div className="flex gap-4.5 overflow-x-auto pb-2 scroll-smooth no-scrollbar snap-x snap-mandatory">
            {[
              { title: "The Covenant of Water", displayTitle: "Covenant of Water", author: "Abraham Verghese", shortAuth: "A. Verghese", tag: "Literary", gradient: "from-[#2A5A30] to-[#102018]" },
              { title: "Tomorrow, and Tomorrow", displayTitle: "Tomorrow & Tomorrow", author: "Gabrielle Zevin", shortAuth: "G. Zevin", tag: "Fiction", gradient: "from-[#6A5010] to-[#302008]" },
              { title: "Hello Beautiful", displayTitle: "Hello Beautiful", author: "Ann Napolitano", shortAuth: "Ann Napolitano", tag: "Drama", gradient: "from-[#5A1840] to-[#280818]" },
              { title: "Fourth Wing", displayTitle: "Fourth Wing", author: "Rebecca Yarros", shortAuth: "R. Yarros", tag: "Fantasy", gradient: "from-[#184858] to-[#081820]" }
            ].map((book, idx) => (
              <div key={idx} className="flex-none w-43.75 snap-start group cursor-pointer relative">

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
                  <div className="font-serif-elegant text-sm font-semibold text-[#3A2818] leading-tight truncate">{book.title}</div>
                  <div className="text-[11px] text-[#B8A080] mb-2 truncate">{book.author}</div>
                  <div className="flex items-center justify-between">
                    <div className="flex text-[#C8A84E] gap-px">
                      {[...Array(5)].map((_, i) => <IconStar key={i} size={10} className="fill-[#C8A84E] text-[#C8A84E]" />)}
                    </div>
                    <button className="px-2.5 py-0.5 rounded-full border border-[#D4C4AE] text-[10.5px] font-medium text-[#7A5E3E] hover:bg-[#56402A] hover:text-white">Buy</button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Reading Tracker Column */}
        <div>
          <div className="flex items-center justify-between mb-5.5">
            <h2 className="font-serif-elegant text-2xl sm:text-3xl font-semibold text-[#3A2818] flex items-center gap-3 after:content-[''] after:block after:w-7 after:h-[1.5px] after:bg-[#B8A080]">
              My Reading List
            </h2>
            <a href="#" className="flex items-center gap-1 text-xs sm:text-sm font-medium text-[#9A7E5A] hover:text-[#56402A] transition-all group">
              Manage <IconArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          <div className="flex flex-col gap-2.5">
            {[
              { title: "The Last Thing He Told Me", author: "Laura Dave", progress: "72%", txt: "72% · ~1h 20m left", color: "from-[#2D5A3D] to-[#163020]" },
              { title: "False Witness: A Novel", author: "Karin Slaughter", progress: "35%", txt: "35% · ~3h 10m left", color: "from-[#3A2858] to-[#1A1030]" },
              { title: "Blind Tiger", author: "Sandra Brown", progress: "12%", txt: "12% · ~5h 40m left", color: "from-[#5A1A1A] to-[#280808]" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3.5 bg-white rounded-[10px] p-3.5 px-4 border border-[#D4C4AE]/22 shadow-[0_2px_10px_rgba(58,40,24,.07)] cursor-pointer transition-all hover:translate-x-1 hover:border-[#B8A080]">
                <div className={`w-10 h-14.5 rounded-l-[3px] rounded-r-md shrink-0 overflow-hidden relative shadow-[3px_5px_14px_rgba(58,40,24,.18)] bg-linear-to-br ${item.color} flex items-center justify-center text-white/70`}>
                  <IconBook2 size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-serif-elegant text-sm font-semibold text-[#3A2818] truncate">{item.title}</div>
                  <div className="text-[11.5px] text-[#B8A080] mt-px">{item.author}</div>
                  <div className="mt-1.5">
                    <div className="h-[2.5px] bg-[#E8DDD0] rounded-full overflow-hidden">
                      <div className="h-full bg-linear-to-r from-[#9A7E5A] to-[#C8A84E]" style={{ width: item.progress }}></div>
                    </div>
                    <div className="text-[10.5px] text-[#B8A080] mt-1">{item.txt}</div>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full shrink-0 bg-[#E8DDD0] flex items-center justify-center text-[#7A5E3E] transition-colors hover:bg-[#7A5E3E] hover:text-[#F3ECE0]" aria-label="Continue reading">
                  <IconPlayerPlay size={12} />
                </button>
              </div>
            ))}

            {/* Dotted Call-to-action placeholder */}
            <div className="flex items-center justify-center gap-2 rounded-[10px] p-3.5 px-4 border border-dashed border-[#D4C4AE] bg-transparent text-[#B8A080] cursor-pointer transition-colors hover:bg-white hover:text-[#7A5E3E]">
              <IconPlus size={16} />
              <span className="text-[13px] font-medium">Add to reading list</span>
            </div>
          </div>
        </div>

      </div>

      {/* ─── FOOTER SECTION ─── */}
      <UserFooter />

      {/* Copyright Bar */}
      <div className="bg-[#221508] border-t border-[#D4C4AE]/10 px-4 sm:px-8 lg:px-13 py-4.5 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-[#F5EBD9]/25">
        <p>© 2026 Folio Digital Library. All rights reserved.</p>
        <p>Crafted with care for book lovers</p>
      </div>

    </div>
  );
}