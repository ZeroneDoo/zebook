'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
	IconCalendar,
	IconBook,
	IconFilter,
	IconRefresh,
	IconArrowLeft,
	IconBookmarkOff,
	IconClock,
	IconCheck,
	IconAlertCircle,
	IconLoader2,
	IconCoin,
	IconTicket,
	IconHourglass
} from '@tabler/icons-react';
import UserLayout from '@/components/layout/UserLayout';

interface ApiPeminjaman {
	id_peminjaman: string;
	id_pengguna: string;
	id_buku: string;
	tgl_pinjam: string;
	tgl_kembali: string;
	koin_reward: number;
	denda_koin: number;
	stamp_reward: number;
	status: string;
	detail_buku?: {
		id_detail_buku: string;
		id_buku: string;
		status: boolean;
		buku?: {
			judul: string;
			img_url?: string;
			koin?: number;
			stamp?: number;
		};
	};
	pengguna?: {
		nama_pengguna: string;
		email: string;
	};
}

export default function PeminjamanPage() {
	const router = useRouter();

	// --- State Management Dinamis ---
	const [borrowings, setBorrowings] = useState<ApiPeminjaman[]>([]);
	const [isLoadingData, setIsLoadingData] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	// Filter States
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [selectedStatus, setSelectedStatus] = useState('SEMUA');

	const statusOptions = ['SEMUA', 'DIPROSES', 'DIPINJAM', 'SELESAI', 'TERLAMBAT'];

	// --- Fetch Data dari API ---
	useEffect(() => {
		async function fetchBorrowingHistory() {
			try {
				setIsLoadingData(true);
				setErrorMessage(null);

				const response = await fetch('/api/peminjaman-buku?limit=100');
				if (!response.ok) throw new Error('Gagal mengambil data riwayat peminjaman');

				const resData = await response.json();
				setBorrowings(resData.data || []);
			} catch (error) {
				console.error('Error fetching borrowings:', error);
				setErrorMessage('Gagal memuat riwayat peminjaman dari server.');
			} finally {
				setIsLoadingData(false);
			}
		}

		fetchBorrowingHistory();
	}, []);

	const handleResetFilters = () => {
		setStartDate('');
		setEndDate('');
		setSelectedStatus('SEMUA');
	};

	// --- Engine Penyaringan Data (Client-side Filter) ───
	const filteredBorrowings = borrowings.filter((b) => {
		const matchesStatus = selectedStatus === 'SEMUA' || b.status.toUpperCase() === selectedStatus.toUpperCase();
		const cleanPinjamDate = b.tgl_pinjam ? b.tgl_pinjam.split('T')[0] : '';
		const matchesStartDate = !startDate || cleanPinjamDate >= startDate;
		const matchesEndDate = !endDate || cleanPinjamDate <= endDate;

		return matchesStatus && matchesStartDate && matchesEndDate;
	});

	const formatDate = (dateStr?: string) => {
		if (!dateStr) return '-';
		const date = new Date(dateStr);
		return date.toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	const getStatusBadge = (status: string) => {
		const normalizedStatus = (status || '').toUpperCase();
		switch (normalizedStatus) {
			case 'DIPROSES':
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
						<IconHourglass size={12} className="animate-pulse" /> {normalizedStatus}
					</span>
				);
			case 'DIPINJAM':
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
						<IconClock size={12} /> {normalizedStatus}
					</span>
				);
			case 'SELESAI':
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
						<IconCheck size={12} /> {normalizedStatus}
					</span>
				);
			case 'TERLAMBAT':
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
						<IconAlertCircle size={12} /> {normalizedStatus}
					</span>
				);
			default:
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-50 text-gray-700 border border-gray-200">
						{normalizedStatus || 'PENDING'}
					</span>
				);
		}
	};

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
								<IconBook size={24} />
							</div>
							<div>
								<h1 className="font-serif-elegant text-2xl sm:text-3xl font-semibold text-[#221508]">Riwayat Peminjaman Buku</h1>
								<p className="text-xs sm:text-sm text-[#9A7E5A]">Pantau status peminjaman aktif, batas waktu pengembalian, dan histori bacaan Anda.</p>
							</div>
						</div>
					</div>

					{/* ─── PANEL FILTER UTAMA ─── */}
					<section className="bg-white rounded-2xl p-5 border border-[#D4C4AE]/30 shadow-[0_4px_20px_rgba(58,40,24,0.04)] mb-8">
						<div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#56402A] mb-4 pb-2 border-b border-[#FAF7F2]">
							<IconFilter size={14} />
							<span>Panel Penyaringan Peminjaman</span>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
							<div className="space-y-1.5 lg:col-span-3">
								<label className="text-xs font-medium text-[#9A7E5A]">Tanggal Pinjam Mulai</label>
								<input
									type="date"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
									className="w-full bg-[#FAF7F2] border border-[#D4C4AE]/50 rounded-xl px-3.5 py-2 text-xs text-[#3A2818] focus:outline-hidden focus:border-[#56402A] transition-colors"
								/>
							</div>

							<div className="space-y-1.5 lg:col-span-3">
								<label className="text-xs font-medium text-[#9A7E5A]">Tanggal Pinjam Selesai</label>
								<input
									type="date"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
									className="w-full bg-[#FAF7F2] border border-[#D4C4AE]/50 rounded-xl px-3.5 py-2 text-xs text-[#3A2818] focus:outline-hidden focus:border-[#56402A] transition-colors"
								/>
							</div>

							<div className="space-y-1.5 md:col-span-2 lg:col-span-4">
								<label className="text-xs font-medium text-[#9A7E5A] block">Status Peminjaman</label>
								<div className="flex flex-wrap gap-1.5 bg-[#FAF7F2] p-1 rounded-xl border border-[#D4C4AE]/30 w-fit">
									{statusOptions.map((status) => (
										<button
											key={status}
											type="button"
											onClick={() => setSelectedStatus(status)}
											className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${selectedStatus === status
												? 'bg-[#56402A] text-[#F3ECE0] font-semibold shadow-xs'
												: 'text-[#9A7E5A] hover:text-[#56402A] hover:bg-[#F3ECE0]/50'
												}`}
										>
											{status}
										</button>
									))}
								</div>
							</div>

							<button
								onClick={handleResetFilters}
								className="w-full py-2.5 bg-gray-100 hover:bg-[#F3ECE0] text-[#9A7E5A] hover:text-[#56402A] rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-gray-200 lg:col-span-2 cursor-pointer h-[38px]"
							>
								<IconRefresh size={14} />
								Reset
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
							<p className="text-xs text-[#9A7E5A]">Menyinkronkan data sirkulasi buku...</p>
						</div>
					) : filteredBorrowings.length === 0 ? (
						<div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl p-12 text-center border border-[#D4C4AE]/25 shadow-[0_4px_24px_rgba(58,40,24,0.02)] min-h-[320px]">
							<div className="w-16 h-16 rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#9A7E5A] mb-4 border border-[#D4C4AE]/20">
								<IconBookmarkOff size={28} className="stroke-[1.5]" />
							</div>
							<h3 className="font-serif-elegant font-semibold text-lg text-[#221508]">Riwayat Peminjaman Kosong</h3>
							<p className="text-xs text-[#9A7E5A] mt-1.5 max-w-sm leading-relaxed">
								Tidak ditemukan riwayat data sirkulasi buku yang cocok dengan parameter filter aktif Anda saat ini.
							</p>
							<button
								onClick={handleResetFilters}
								className="mt-5 px-4 py-2 bg-[#FAF7F2] hover:bg-[#F3ECE0] border border-[#D4C4AE]/40 rounded-xl text-xs font-semibold text-[#56402A] transition-all cursor-pointer"
							>
								Tampilkan Semua Peminjaman
							</button>
						</div>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							{filteredBorrowings.map((b) => (
								<div
									key={b.id_peminjaman}
									className="bg-white border border-[#D4C4AE]/25 rounded-xl p-4 shadow-[0_2px_10px_rgba(58,40,24,0.04)] hover:shadow-[0_8px_24px_rgba(58,40,24,0.08)] transition-all flex flex-col justify-between relative overflow-hidden group"
								>
									<div>
										<div className="flex items-center justify-between gap-2 mb-3">
											<span className="font-mono text-[10px] font-semibold text-[#9A7E5A] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#D4C4AE]/20">
												#{b.id_peminjaman}
											</span>
											{getStatusBadge(b.status)}
										</div>

										<div className="flex gap-4 items-start mb-2">
											<div className="relative w-16 h-24 bg-[#FAF7F2] rounded-lg border border-[#D4C4AE]/30 shadow-xs overflow-hidden shrink-0">
												<Image
													src={b.detail_buku?.buku?.img_url || "https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/products/ndgciipm75.jpeg"}
													alt={b.detail_buku?.buku?.judul || "Sampul Buku"}
													fill
													sizes="64px"
													className="object-cover group-hover:scale-105 transition-transform duration-300"
													unoptimized
												/>
											</div>

											<div className="flex-1 min-w-0">
												<h3 className="font-serif-elegant font-semibold text-[#3A2818] text-sm sm:text-base leading-tight mb-1 group-hover:text-[#56402A] transition-colors line-clamp-2">
													{b.detail_buku?.buku?.judul || 'Judul Tidak Tersedia'}
												</h3>
												<p className="text-[11px] text-[#9A7E5A] mb-2.5">Peminjam: <span className="text-[#56402A] font-medium">{b.pengguna?.nama_pengguna || 'Umum'}</span></p>

												{/* Informasi Koin Refund & Reward Stamp Ter-update */}
												<div className="flex flex-col gap-1.5 mt-1.5">
													{b.detail_buku?.buku?.koin !== undefined && (
														<div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50/70 border border-amber-200/40 text-[10px] text-amber-900 w-fit">
															<IconCoin size={12} className="text-amber-500 shrink-0" />
															<span><strong className="font-bold text-amber-700">{b.koin_reward} Koin</strong> | yang dikembalikan</span>
														</div>
													)}
													{b.detail_buku?.buku?.stamp !== undefined && (
														<div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-orange-50/70 border border-orange-200/40 text-[10px] text-orange-900 w-fit">
															<IconTicket size={12} className="text-orange-500 shrink-0" />
															<span><strong className="font-bold text-orange-700">{b.stamp_reward} Stamp</strong> | yang di dapat (jika buku dikembalikan tepat waktu)</span>
														</div>
													)}
												</div>
											</div>
										</div>
									</div>

									<div className="mt-3 pt-3 border-t border-[#FAF7F2] space-y-1.5 text-xs text-[#56402A]">
										<div className="flex justify-between">
											<span className="text-[#B8A080] flex items-center gap-1"><IconCalendar size={13} /> Tgl Pinjam:</span>
											<span className="font-medium text-[#3A2818]">{formatDate(b.tgl_pinjam)}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-[#B8A080] flex items-center gap-1"><IconCalendar size={13} /> Batas Kembali:</span>
											<span className={`font-semibold ${b.status?.toUpperCase() === 'TERLAMBAT' ? 'text-rose-600' : 'text-[#3A2818]'}`}>
												{formatDate(b.tgl_kembali)}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</main>
			</div>
		</UserLayout>
	);
}