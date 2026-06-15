'use client';

import React, { useState, useEffect, useRef } from 'react';
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
	IconHourglass,
	IconX
} from '@tabler/icons-react';
import UserLayout from '@/components/layout/UserLayout';

// ─── IMPORT SYSTEM TOAST KUSTOM ANDA ───
// (Asumsi komponen toast Anda disimpan di folder @/components/ui/Toast atau sejenisnya)
import { useToast, ToastContainer } from '@/components/Toast';

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

	// 💡 INISIALISASI TOAST HOOK ANDA
	const { toasts, toast, remove } = useToast();

	// --- State Management ---
	const [borrowings, setBorrowings] = useState<ApiPeminjaman[]>([]);
	const [isLoadingData, setIsLoadingData] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [cancelingId, setCancelingId] = useState<string | null>(null);

	// State Modal Konfirmasi
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [targetCancel, setTargetCancel] = useState<{ id: string; judul: string } | null>(null);

	// State Infinite Scroll
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const LIMIT = 6;

	// Filter States
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [selectedStatus, setSelectedStatus] = useState('SEMUA');

	const statusOptions = ['SEMUA', 'DIPROSES', 'DITOLAK', 'DIPINJAM', 'DIKEMBALIKAN', 'TERLAMBAT'];
	const observerTarget = useRef<HTMLDivElement>(null);
	const prevFiltersRef = useRef({ selectedStatus, startDate, endDate });

	// --- Core Fetching Logic ---
	useEffect(() => {
		const filtersChanged =
			prevFiltersRef.current.selectedStatus !== selectedStatus ||
			prevFiltersRef.current.startDate !== startDate ||
			prevFiltersRef.current.endDate !== endDate;

		let activePage = page;

		if (filtersChanged) {
			prevFiltersRef.current = { selectedStatus, startDate, endDate };
			activePage = 1;
			setPage(1);
			setHasMore(true);

			if (page !== 1) return;
		}

		async function fetchBorrowingHistory() {
			try {
				setIsLoadingData(true);
				setErrorMessage(null);

				const queryParams = new URLSearchParams({
					page: activePage.toString(),
					limit: LIMIT.toString(),
					status: selectedStatus,
					...(startDate && { startDate }),
					...(endDate && { endDate }),
				});

				const response = await fetch(`/api/peminjaman-buku?${queryParams.toString()}`);
				if (!response.ok) throw new Error('Gagal mengambil data dari server');

				const resData = await response.json();
				const newData = resData.data || [];

				if (activePage === 1) {
					setBorrowings(newData);
				} else {
					setBorrowings((prev) => [...prev, ...newData]);
				}

				const totalPage = resData.pagination?.totalPage || 1;
				setHasMore(activePage < totalPage && newData.length > 0);

			} catch (error) {
				console.error('Error fetching borrowings:', error);
				setErrorMessage('Gagal memuat riwayat peminjaman.');
			} finally {
				setIsLoadingData(false);
			}
		}

		fetchBorrowingHistory();
	}, [page, selectedStatus, startDate, endDate]);

	// Intersection Observer Engine
	useEffect(() => {
		const target = observerTarget.current;
		if (!target) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !isLoadingData) {
					setPage((prevPage) => prevPage + 1);
				}
			},
			{ threshold: 0.5 }
		);

		observer.observe(target);
		return () => {
			if (target) observer.unobserve(target);
		};
	}, [hasMore, isLoadingData]);

	const triggerCancelModal = (id_peminjaman: string, judulBuku: string) => {
		setTargetCancel({ id: id_peminjaman, judul: judulBuku });
		setIsModalOpen(true);
	};

	// ─── PROSES DELETE DENGAN TOAST INTEGRATION ───
	const executeCancelBorrowing = async () => {
		if (!targetCancel) return;
		const { id: id_peminjaman, judul: judulBuku } = targetCancel;

		try {
			setCancelingId(id_peminjaman);

			const response = await fetch(`/api/peminjaman-buku/${id_peminjaman}`, {
				method: 'DELETE',
			});

			const resData = await response.json();

			if (!response.ok) {
				throw new Error(resData.error || 'Gagal membatalkan pengajuan.');
			}

			// 1. Update UI secara lokal (Optimistic Update)
			setBorrowings((prev) => prev.filter((item) => item.id_peminjaman !== id_peminjaman));
			setIsModalOpen(false);
			setTargetCancel(null);

			// 💡 2. PEMICU TOAST SUKSES KUSTOM ANDA
			toast({
				type: 'success',
				title: 'Pembatalan Berhasil',
				message: `Pengajuan peminjaman untuk buku "${judulBuku}" telah berhasil dibatalkan.`,
				duration: 4000
			});

		} catch (error: unknown) {
			console.error("Cancel error:", error);

			// 💡 3. PEMICU TOAST ERROR KUSTOM ANDA
			toast({
				type: 'error',
				title: 'Gagal Membatalkan',
				message: (error as Error).message || 'Terjadi gangguan koneksi pada sistem internal.',
				duration: 5000
			});
		} finally {
			setCancelingId(null);
		}
	};

	const handleResetFilters = () => {
		setStartDate('');
		setEndDate('');
		setSelectedStatus('SEMUA');
		setPage(1);
		setBorrowings([]);
		setHasMore(true);
	};

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
			case 'DIKEMBALIKAN':
			case 'SELESAI':
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
						<IconCheck size={12} /> {normalizedStatus}
					</span>
				);
			case 'DITOLAK':
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-50 text-red-700 border border-red-200/60">
						<IconX size={12} /> {normalizedStatus}
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

					{/* Header Zone */}
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
							<div className="w-11 h-11 rounded-xl bg-[#56402A] flex items-center justify-center text-white shadow-[0_4px_14px_rgba(86,64,42,0.2)] shrink-0">
								<IconBook size={24} />
							</div>
							<div>
								<h1 className="font-serif-elegant text-2xl sm:text-3xl font-semibold text-[#221508]">Riwayat Peminjaman Buku</h1>
								<p className="text-xs sm:text-sm text-[#9A7E5A]">Pantau status peminjaman aktif secara real-time.</p>
							</div>
						</div>
					</div>

					{/* Filter Panel */}
					<section className="bg-white rounded-2xl p-5 border border-[#D4C4AE]/30 shadow-[0_4px_20px_rgba(58,40,24,0.04)] mb-6">
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
											className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${selectedStatus === status ? 'bg-[#56402A] text-[#F3ECE0] font-semibold' : 'text-[#9A7E5A] hover:bg-[#F3ECE0]/50'}`}
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

					{/* Main List */}
					{borrowings.length === 0 && !isLoadingData ? (
						<div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl p-12 text-center border border-[#D4C4AE]/25 min-h-[320px]">
							<IconBookmarkOff size={28} className="text-[#9A7E5A] mb-4" />
							<h3 className="font-serif-elegant font-semibold text-lg text-[#221508]">Riwayat Peminjaman Kosong</h3>
						</div>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							{borrowings.map((b) => (
								<div key={b.id_peminjaman} className="bg-white border border-[#D4C4AE]/25 rounded-xl p-4 shadow-[0_2px_10px_rgba(58,40,24,0.04)] hover:shadow-[0_8px_24px_rgba(58,40,24,0.08)] transition-all flex flex-col justify-between relative overflow-hidden group">
									<div>
										<div className="flex items-center justify-between gap-2 mb-3">
											<span className="font-mono text-[10px] font-semibold text-[#9A7E5A] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#D4C4AE]/20">
												#{b.id_peminjaman}
											</span>
											{getStatusBadge(b.status)}
										</div>
										<div className="flex gap-4 items-start mb-2">
											<div className="relative w-16 h-24 bg-[#FAF7F2] rounded-lg border overflow-hidden shrink-0">
												<Image
													src={b.detail_buku?.buku?.img_url || "https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/products/ndgciipm75.jpeg"}
													alt={b.detail_buku?.buku?.judul || "Sampul"}
													fill
													sizes="64px"
													className="object-cover"
													unoptimized
												/>
											</div>
											<div className="flex-1 min-w-0">
												<h3 className="font-serif-elegant font-semibold text-[#3A2818] text-sm sm:text-base line-clamp-2">{b.detail_buku?.buku?.judul || 'Judul Tidak Tersedia'}</h3>
												<p className="text-[11px] text-[#9A7E5A]">Peminjam: <span className="text-[#56402A] font-medium">{b.pengguna?.nama_pengguna || 'Umum'}</span></p>
											</div>
										</div>
									</div>

									<div className="mt-3 pt-3 border-t border-[#FAF7F2] space-y-1.5 text-xs text-[#56402A]">
										<div className="flex justify-between">
											<span>Batas Kembali:</span>
											<span className="font-semibold">{formatDate(b.tgl_kembali)}</span>
										</div>

										{b.status?.toUpperCase() === 'DIPROSES' && (
											<div className="pt-2">
												<button
													type="button"
													onClick={() => triggerCancelModal(b.id_peminjaman, b.detail_buku?.buku?.judul || 'Buku')}
													className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-rose-200/60 transition-all cursor-pointer"
												>
													<IconX size={14} />
													<span>Batalkan Peminjaman</span>
												</button>
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					)}

					{/* Infinite Scroll Loader */}
					<div ref={observerTarget} className="w-full py-6 flex items-center justify-center mt-4">
						{isLoadingData && <IconLoader2 size={18} className="text-[#56402A] animate-spin" />}
					</div>

				</main>
			</div>

			{/* Custom Confirmation Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div className="fixed inset-0 bg-[#221508]/40 backdrop-blur-xs" onClick={() => !cancelingId && setIsModalOpen(false)} />
					<div className="relative bg-white rounded-2xl max-w-md w-full p-6 border shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
						<h3 className="font-serif-elegant text-lg font-bold text-[#221508] mb-2">Konfirmasi Pembatalan</h3>
						<p className="text-xs text-[#9A7E5A] mb-4">Apakah Anda yakin ingin membatalkan pengajuan buku <strong>&quot;{targetCancel?.judul}&quot;</strong>?</p>
						<div className="flex justify-end gap-2">
							<button disabled={cancelingId !== null} onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs bg-gray-50 border cursor-pointer">Urungkan</button>
							<button disabled={cancelingId !== null} onClick={executeCancelBorrowing} className="px-4 py-2 rounded-xl text-xs bg-rose-600 text-white cursor-pointer disabled:bg-rose-400">
								{cancelingId !== null ? 'Memproses...' : 'Ya, Batalkan'}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* ─── 💡 WADAH UTAMA TOAST KUSTOM ANDA ─── */}
			<ToastContainer toasts={toasts} onRemove={remove} position="bottom-right" />

		</UserLayout>
	);
}