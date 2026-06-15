'use client';

import { useCurrentUser } from "@/lib/hooks";
import {
	IconArrowRight,
	IconBooks,
	IconCoin,
	IconTicket,
	IconLoader2,
} from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";

type BorrowStatus = "DIPROSES" | "DIPINJAM" | "DIKEMBALIKAN" | "DITOLAK";

interface ActiveBorrow {
	judul: string;
	penulis: string;
	tgl_kembali: string;
	status: BorrowStatus;
	denda_koin: number;
}

// Interface Buku diselaraskan agar cocok dengan model Prisma
interface DynamicBukuModel {
	id_buku: string;
	judul: string;
	penulis: string;
	stok: number;
	koin: number;
	stamp?: number;
	img_url?: string;
}

interface UserHeroProps {
	topBook?: DynamicBukuModel; // Tambahkan prop baru ini
	user?: {
		nama_pengguna: string;
		koin: number;
		stamp: number;
	};
	activeBorrows?: ActiveBorrow[];
	onTopUp?: () => void;
	onBrowse?: () => void;
	onViewBorrowings?: () => void;
}

export default function UserHero({ topBook }: UserHeroProps) {
	const { user, isLoading } = useCurrentUser();

	return (
		<>
			<section className="px-4 sm:px-8 lg:px-13 pt-8 sm:pt-15 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-9 items-end">

				{/* Kolom Kiri: Teks Utama */}
				<div className="pb-6 lg:pb-12 order-1">
					<div className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[2px] uppercase text-[#9A7E5A] mb-4 before:content-[''] before:block before:w-5.5 before:h-px before:bg-[#B8A080]">
						Rekomendasi
					</div>
					<h1 className="font-serif-elegant text-4xl sm:text-5xl lg:text-[52px] leading-[1.1] font-semibold text-[#221508] mb-4">
						Jelajahi Dunia <br /> lewat <em className="italic text-[#9A7E5A]">Buku</em>
					</h1>
					<p className="text-[14px] text-[#9A7E5A] leading-relaxed mb-6 max-w-72.5">
						Temukan ribuan buku pilihan. Pinjam dengan mudah menggunakan koin dan kumpulkan stamp hadiahmu.
					</p>

					{/* Bar Pencarian */}
					<Link
						href="/buku"
						className="inline-flex items-center justify-center gap-2.5 bg-[#56402A] rounded-full px-6 py-3 shadow-xs hover:bg-[#3A2818] hover:shadow-md transition-all group w-full sm:w-auto"
					>
						<span className="text-[13.5px] font-semibold text-[#F3ECE0]">Mulai Jelajah</span>
						<IconArrowRight size={16} className="text-[#F3ECE0] group-hover:translate-x-0.5 transition-transform" />
					</Link>
				</div>

				{/* Kolom Tengah: Buku 3D Terpopuler #1 */}
				<div className="flex flex-col items-center justify-center relative py-6 md:py-0 order-3 lg:order-2 col-span-1 md:col-span-2 lg:col-span-1">
					<div className="relative drop-shadow-[16px_24px_40px_rgba(58,40,24,.28)] animate-levitate mb-1">
						<div
							className="w-48 h-69 rounded-l-[3px] rounded-r-[10px] relative overflow-hidden cursor-pointer transition-transform duration-400 group"
							style={{ transform: "perspective(700px) rotateY(-14deg)", transformStyle: "preserve-3d" }}
							onMouseEnter={(e) => (e.currentTarget.style.transform = "perspective(700px) rotateY(-4deg)")}
							onMouseLeave={(e) => (e.currentTarget.style.transform = "perspective(700px) rotateY(-14deg)")}
						>
							{topBook ? (
								<Link href={`/buku/${topBook.id_buku}`} className="absolute inset-0 block bg-[#000000] text-white">
									{topBook.img_url ? (
										<Image
											src={topBook.img_url}
											alt={topBook.judul}
											fill
											className="object-cover opacity-75"
											unoptimized
										/>
									) : null}
									<div className="absolute inset-0 flex flex-col justify-between p-5 pl-6.5 z-10">
										<div className="self-end bg-[#C8A84E] text-[#221508] text-[9px] font-semibold tracking-wider uppercase px-2 py-1 rounded shadow-xs">
											#1 Sering Dipinjam
										</div>
										<div className="absolute left-0 top-0 bottom-0 w-5 bg-black/25" style={{ transform: "translateZ(-1px)" }} />
										<div>
											{/* <div className="text-[9px] tracking-widest uppercase opacity-65 mb-1">Terpopuler</div> */}
											<div className="font-serif-elegant text-xl font-semibold leading-snug line-clamp-2 mb-1 group-hover:text-[#F3ECE0] transition-colors">{topBook.judul}</div>
											<div className="text-xs opacity-70 truncate">{topBook.penulis}</div>
										</div>
									</div>
								</Link>
							) : (
								/* Shimmer / State Tunggu sebelum API selesai loading */
								<div className="absolute inset-0 bg-stone-200 animate-pulse flex items-center justify-center text-stone-400 text-xs">
									Memuat sampul...
								</div>
							)}
						</div>
					</div>
					<div className="w-62.5 h-3 bg-linear-to-b from-[#B8A080] to-[#7A5E3E] rounded-t-xs rounded-b-md shadow-[0_8px_24px_rgba(90,60,30,.25)]" />
				</div>

				{/* Kolom Kanan: Dashboard Dynamic Cards */}
				<div className="flex flex-col gap-3.5 pb-6 order-2 lg:order-3 w-full sm:min-w-70">
					{/* CARD 1: INFO SALDO / LOGIN CTA */}
					{isLoading ? (
						<div className="flex justify-center items-center h-25">
							<div className="flex items-center gap-2 text-[#9A7E5A] text-xs font-medium px-3 py-1.5">
								<IconLoader2 size={16} className="animate-spin text-[#56402A]" />
								<span>Memuat...</span>
							</div>
						</div>
					) : (
						<div className="bg-white rounded-[14px] border border-[#D4C4AE]/25 shadow-xs overflow-hidden">
							<div className="bg-linear-to-br from-[#7A5E3E] to-[#56402A] p-4.5 text-[#F5EBD9]">
								{(user && user.nama_pengguna) ? (
									<>
										<div className="text-sm mb-3">Halo, <span className="font-semibold">{user.nama_pengguna}</span></div>
										<div className="flex items-center gap-4 border-t border-white/10 pt-3 text-sm font-semibold">
											<div className="flex items-center gap-1.5">
												<IconCoin size={16} className="text-[#C8A84E]" />
												<span>{user.koin} <span className="text-[11px] font-normal opacity-60">Koin</span></span>
											</div>
											<div className="w-px h-4 bg-white/20" />
											<div className="flex items-center gap-1.5">
												<IconTicket size={16} className="text-[#B8A080]" />
												<span>{user.stamp} <span className="text-[11px] font-normal opacity-60">Stamp</span></span>
											</div>
										</div>
									</>
								) : (
									<div className="flex flex-col gap-2.5">
										<div>
											<div className="text-[9px] tracking-widest uppercase opacity-50 mb-0.5">Selamat Datang</div>
											<div className="font-serif-elegant text-base font-semibold">Mulai Membaca di ZeBook</div>
										</div>
										<p className="text-xs opacity-75 leading-relaxed">
											Masuk sekarang untuk mengklaim Koin gratis, mengumpulkan Stamp, dan mulai membaca.
										</p>
										<button
											onClick={() => window.location.href = "/login"}
											className="w-full mt-1 bg-[#C8A84E] text-[#221508] font-semibold text-xs py-2.5 rounded-full hover:bg-[#A68A3C] transition-colors text-center shadow-xs"
										>
											Masuk / Daftar
										</button>
									</div>
								)}
							</div>
						</div>
					)}

					{/* CARD 2: KARTU BAWAH */}
					<div className="bg-[#F3ECE0] rounded-[14px] border border-[#D4C4AE] p-4 shadow-xs min-h-38.75 flex flex-col justify-between">
						<div>
							<div className="text-[10px] tracking-wider uppercase text-[#9A7E5A] font-semibold mb-3">Keuntungan Anggota</div>
							<div className="flex flex-col gap-3">
								<div className="flex items-start gap-2.5">
									<IconCoin size={16} className="text-[#9A7E5A] shrink-0 mt-0.5" />
									<p className="text-xs text-[#3A2818] leading-tight">Gunakan <b>Koin</b> untuk meminjam buku favoritmu.</p>
								</div>
								<div className="flex items-start gap-2.5">
									<IconBooks size={16} className="text-[#9A7E5A] shrink-0 mt-0.5" />
									<p className="text-xs text-[#3A2818] leading-tight">Akses penuh ke banyak katalog buku.</p>
								</div>
								<div className="flex items-start gap-2.5">
									<IconTicket size={16} className="text-[#9A7E5A] shrink-0 mt-0.5" />
									<p className="text-xs text-[#3A2818] leading-tight">Kumpulkan <b>Stamp</b> setiap mengembalikan tepat waktu untuk ditukar meminjam buku favoritmu.</p>
								</div>
							</div>
						</div>
						<div className="text-[10px] text-[#9A7E5A]/80 italic text-center mt-2 border-t border-[#D4C4AE]/40 pt-2">
							Bergabunglah bersama pembaca lainnya
						</div>
					</div>
				</div>
			</section>

			{/* Pembatas Rak */}
			<div className="mx-4 sm:px-8 lg:mx-13 h-2.5 bg-linear-to-b from-[#D4C4AE] to-[#9A7E5A] rounded-b-lg shadow-sm" />
		</>
	);
}