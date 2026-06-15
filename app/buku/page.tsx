"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	IconSearch,
	IconCoin,
	IconAdjustmentsHorizontal,
	IconLoader2,
	IconTicket,
	IconArrowLeft,
	IconBooks,
} from "@tabler/icons-react";

import { useToast, ToastContainer } from "@/components/Toast";
import UserLayout from "@/components/layout/UserLayout";

interface KategoriItem {
	id_kategori: string;
	nama_kategori: string;
}

interface BukuKategoriRelasi {
	kategori: KategoriItem;
}

interface APIBukuItem {
	id_buku: string;
	judul: string;
	penulis: string;
	koin: number;
	stamp: number;
	thn_terbit: string;
	stok: number;
	img_url?: string;
	buku_kategori?: BukuKategoriRelasi[];
}

interface PaginationMeta {
	totalData: number;
	totalPage: number;
	currentPage: number;
	limit: number;
}

export default function BookCatalogPage() {
	const { toasts, toast, remove } = useToast();
	const observerTarget = useRef<HTMLDivElement>(null);

	// --- State Management ---
	const [books, setBooks] = useState<APIBukuItem[]>([]);
	const [categories, setCategories] = useState<string[]>(["Semua"]);
	const [pagination, setPagination] = useState<PaginationMeta | null>(null);
	const [loadingBooks, setLoadingBooks] = useState<boolean>(true);

	// Control States
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [debouncedSearch, setDebouncedSearch] = useState<string>("");
	const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
	const [sortConfig, setSortConfig] = useState<string>("judul-ASC");
	const [currentPage, setCurrentPage] = useState<number>(1);

	// --- EFFECT 1: Ambil Debounce Search Input ---
	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearch(searchQuery);
			setCurrentPage(1);
		}, 500);
		return () => clearTimeout(handler);
	}, [searchQuery]);

	// --- EFFECT 2: Load Filter Kategori dari API Kategori ---
	useEffect(() => {
		let ignore = false;
		async function loadCategories() {
			try {
				const response = await fetch("/api/kategori");
				if (!response.ok) throw new Error("Gagal memuat kategori");
				const result = await response.json();

				if (!ignore && result.data) {
					const dynamicNames = result.data.map((cat: KategoriItem) => cat.nama_kategori);
					setCategories(["Semua", ...dynamicNames]);
				}
			} catch (error) {
				console.error("Error loading categories:", error);
			}
		}
		loadCategories();
		return () => { ignore = true; };
	}, []);

	// --- EFFECT 3: Pipeline Pengambilan Data ---
	useEffect(() => {
		let ignore = false;

		async function startFetchingBooks() {
			setLoadingBooks(true);
			try {
				const [sortField, sortDir] = sortConfig.split("-");
				const params = new URLSearchParams({
					page: currentPage.toString(),
					limit: "10",
					sort_field: sortField,
					sort_dir: sortDir,
				});

				if (debouncedSearch) {
					params.append("search", debouncedSearch);
				}

				const response = await fetch(`/api/buku?${params.toString()}`);
				if (!response.ok) throw new Error("Gagal mengambil data buku");

				const result = await response.json();

				if (!ignore) {
					const freshData = result.data || [];

					setBooks(prev => {
						if (currentPage === 1) return freshData;

						const existingIds = new Set(prev.map(book => book.id_buku));
						const uniqueFreshData = freshData.filter((book: APIBukuItem) => !existingIds.has(book.id_buku));

						return [...prev, ...uniqueFreshData];
					});

					setPagination(result.pagination || null);
				}
			} catch (error) {
				console.error("Fetch books error:", error);
				if (!ignore && currentPage === 1) {
					toast({
						type: "error",
						title: "Koneksi Gagal",
						message: "Gagal memuat katalog buku dari server.",
					});
				}
			} finally {
				if (!ignore) {
					setLoadingBooks(false);
				}
			}
		}

		startFetchingBooks();
		return () => { ignore = true; };
	}, [currentPage, debouncedSearch, selectedCategory, sortConfig, toast]);

	// --- EFFECT 4: Intersection Observer untuk Infinite Scroll ---
	useEffect(() => {
		if (!pagination || loadingBooks) return;
		if (currentPage >= pagination.totalPage) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setCurrentPage(prev => prev + 1);
				}
			},
			{ threshold: 0.5 }
		);

		const currentTarget = observerTarget.current;
		if (currentTarget) {
			observer.observe(currentTarget);
		}

		return () => {
			if (currentTarget) {
				observer.unobserve(currentTarget);
			}
		};
	}, [pagination, loadingBooks, currentPage]);

	// --- Mengembalikan Lapisan Filter Kategori Klien yang Valid ---
	const filteredBooks = books.filter((book) => {
		if (selectedCategory === "Semua") return true;
		return book.buku_kategori?.some(
			(rel) => rel.kategori?.nama_kategori?.toLowerCase() === selectedCategory.toLowerCase()
		);
	});

	return (
		<UserLayout>
			<div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 select-none">
				<div className="max-w-6xl mx-auto space-y-8">

					{/* ─── NAVIGATION & HEADER ZONE ─── */}
					<div className="mb-8 flex flex-col gap-4">
						<div>
							<Link
								href={'/'}
								className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#D4C4AE]/40 text-[#56402A] hover:bg-[#F3ECE0]/50 text-xs font-semibold transition-all shadow-xs group cursor-pointer"
							>
								<IconArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
								<span>Kembali</span>
							</Link>
						</div>

						<div className="flex items-center gap-3">
							<div className="w-11 h-11 rounded-xl bg-[#56402A] flex items-center justify-center text-white shadow-[0_4px_14px_rgba(86,64,42,0.2)] shrink-0">
								<IconBooks size={24} />
							</div>
							<div>
								<h1 className="font-serif-elegant text-2xl sm:text-3xl font-semibold text-[#221508]">Jelajah Koleksi</h1>
								<p className="text-xs sm:text-sm text-[#9A7E5A]">Gulir ke bawah untuk memuat koleksi buku secara otomatis tanpa jeda</p>
							</div>
						</div>
					</div>

					{/* --- Control Panel --- */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
						<div className="md:col-span-2 relative">
							<IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A7E5A]" size={20} />
							<input
								type="text"
								placeholder="Cari Judul buku, atau penulis..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-11 pr-4 py-3 bg-white border border-[#D4C4AE]/60 rounded-2xl text-sm text-[#3A2818] placeholder-[#B8A080] focus:outline-hidden focus:border-[#7A5E3E] shadow-xs transition-all"
							/>
						</div>

						<div className="relative">
							<IconAdjustmentsHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A7E5A]" size={18} />
							<select
								value={sortConfig}
								onChange={(e) => {
									setSortConfig(e.target.value);
									setCurrentPage(1);
								}}
								className="w-full pl-11 pr-10 py-3 bg-white border border-[#D4C4AE]/60 rounded-2xl text-sm text-[#3A2818] appearance-none focus:outline-hidden focus:border-[#7A5E3E] shadow-xs transition-all cursor-pointer font-medium"
							>
								<option value="judul-ASC">Judul: A - Z</option>
								<option value="judul-DESC">Judul: Z - A</option>
								<option value="koin-ASC">Koin: Terendah</option>
								<option value="koin-DESC">Koin: Tertinggi</option>
								<option value="thn_terbit-DESC">Tahun: Terbaru</option>
								<option value="stok-DESC">Stok: Terbanyak</option>
							</select>
						</div>
					</div>

					{/* --- Dynamic Category Horizontal Bar --- */}
					<div className="space-y-3">
						<div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
							{categories.map((category) => (
								<button
									key={category}
									onClick={() => {
										setSelectedCategory(category);
										setCurrentPage(1);
									}}
									className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${selectedCategory === category
										? "bg-[#56402A] border-[#56402A] text-[#F3ECE0] shadow-md"
										: "bg-white border-[#D4C4AE]/50 text-[#9A7E5A] hover:text-[#56402A] hover:border-[#56402A]"
										}`}
								>
									{category}
								</button>
							))}
						</div>

						<div className="text-xs font-bold text-[#56402A] bg-white border border-[#D4C4AE]/40 px-3 py-1.5 rounded-xl shadow-xs w-fit animate-in fade-in duration-200">
							Tercatat: <span className="text-[#9A7E5A]">{pagination?.totalData || 0}</span> Buku
						</div>
					</div>

					{/* --- Main Content View Block --- */}
					{filteredBooks.length > 0 ? (
						<div className="space-y-10">
							{/* Mengoptimalkan celah gap antar grid agar lebih rapat dan indah di layar seluler */}
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-8 sm:gap-y-12 gap-x-4 sm:gap-x-6 justify-center">
								{filteredBooks.map((book) => {
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

							{/* --- Target Detektor Infinite Scroll --- */}
							<div ref={observerTarget} className="w-full flex justify-center py-6">
								{loadingBooks && (
									<div className="flex items-center gap-2 text-sm text-[#9A7E5A] font-medium">
										<IconLoader2 size={20} className="animate-spin text-[#56402A]" />
										<span>Memuat baris buku selanjutnya...</span>
									</div>
								)}
								{!loadingBooks && pagination && currentPage >= pagination.totalPage && (
									<p className="text-xs text-[#B8A080] italic tracking-wide">
										— Anda telah mencapai batas akhir pustaka —
									</p>
								)}
							</div>
						</div>
					) : (
						/* Fallback Layar Kosong */
						!loadingBooks && (
							<div className="text-center py-16 bg-white rounded-2xl border border-[#D4C4AE]/30 max-w-md mx-auto space-y-3 shadow-xs">
								<div className="text-[#9A7E5A] flex justify-center">
									<IconSearch size={40} className="stroke-1.5" />
								</div>
								<h3 className="font-serif-elegant text-base font-bold text-[#3A2818]">Buku Tidak Ditemukan</h3>
								<p className="text-xs text-[#9A7E5A] max-w-xs mx-auto px-4">
									Tidak ada koleksi dalam database yang cocok dengan kriteria filter saat ini.
								</p>
							</div>
						)
					)}

					{/* Loading Awal */}
					{loadingBooks && books.length === 0 && (
						<div className="flex flex-col items-center justify-center py-24 space-y-3">
							<IconLoader2 size={36} className="text-[#56402A] animate-spin" />
							<p className="text-xs font-medium text-[#9A7E5A]">Menyinkronkan basis data...</p>
						</div>
					)}

				</div>

				<ToastContainer toasts={toasts} onRemove={remove} />
			</div>
		</UserLayout>
	);
}