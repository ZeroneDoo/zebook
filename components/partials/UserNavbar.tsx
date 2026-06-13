"use client";

import { useState, useRef, useEffect } from "react";
import {
	IconCoin,
	IconPlus,
	IconTicket,
	IconUser,
	IconBook,
	IconLogout,
	IconChevronDown,
	IconLoader2,
	IconLogin,
	IconUserPlus,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useCurrentUser } from "@/lib/hooks";

interface Notification {
	id: string;
	type: "approved" | "rejected" | "due_soon" | "overdue";
	message: string;
	time: string;
	read: boolean;
}

interface UserNavbarProps {
	userInitials?: string;
	userName?: string;
	userEmail?: string;
	koin?: number;
	stamp?: number;
	notifications?: Notification[];
	onTopUp?: () => void;
	onLogout?: () => void;
	topUpHref?: string;
	transaksiKoinHref?: string;
	peminjamanBukuHref?: string;
	profileHref?: string;
}

export default function UserNavbar({
	onLogout,
	topUpHref = "/top-up",
	transaksiKoinHref = "/transaksi-koin",
	peminjamanBukuHref = "/peminjaman",
	profileHref = "/profile",
}: UserNavbarProps) {
	const { user, isLoading } = useCurrentUser();

	const [profileOpen, setProfileOpen] = useState(false);
	const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

	// Menutup dropdown profil jika pengguna mengklik di luar area navbar
	const navbarRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
				setProfileOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		console.log("🔄 Perubahan Status Akun:", {
			isLoading,
			user_bernilai: user,
			tipeData: typeof user
		});
	}, [user, isLoading]); // Akan memicu log baru setiap kali salah satu nilai ini berubah

	return (
		<>
			<nav ref={navbarRef} className="sticky top-0 z-50 h-16.5 px-4 sm:px-8 lg:px-13 flex items-center justify-between bg-[#FAF7F2]/88 backdrop-blur-md border-b border-[#D4C4AE]/35">
				{/* ─── LOGO ZEBOOK ─── */}
				<Link href={'/'} className="flex items-center gap-2 sm:gap-3 cursor-pointer">
					<div className="w-10 h-10 bg-linear-to-br from-[#B8A080] to-[#7A5E3E] rounded-lg overflow-hidden flex items-center justify-center">
						<Image src="/images/zebook.png" className="w-10 h-10 object-cover" alt="ZeBook Logo" width={40} height={40} />
					</div>
					<div className="font-serif-elegant text-2xl font-semibold text-[#56402A] tracking-wide">
						Ze<em className="not-italic text-[#9A7E5A]">Boo</em>k
					</div>
				</Link>

				{/* ─── BAGIAN AKSI UTAMA (KANAN) ─── */}
				<div className="flex items-center gap-2 sm:gap-3">

					{isLoading ? (
						/* 1. STATE LOADING: Menampilkan indikator loading ringkas */
						<div className="flex items-center gap-2 text-[#9A7E5A] text-xs font-medium px-3 py-1.5">
							<IconLoader2 size={16} className="animate-spin text-[#56402A]" />
							<span>Memuat...</span>
						</div>
					) : (user && user.nama_pengguna) ? (
						/* 2. STATE AUTHENTICATED: Jika login, tampilkan Saldo & Dropdown Profil */
						<>
							{/* Tampilan Saldo — Desktop */}
							<div className="hidden md:flex items-center gap-2">
								<div className="flex items-center gap-1.5 bg-white border border-[#D4C4AE] rounded-full pl-3.5 pr-1 py-1 shadow-[0_1px_6px_rgba(58,40,24,.07)]">
									<IconCoin size={15} className="text-[#C8A84E] shrink-0" />
									<span className="text-sm font-semibold text-[#3A2818] min-w-6">
										{Number(user?.koin || 0)}
									</span>
									<Link
										href={topUpHref}
										aria-label="Top up koin"
										className="ml-1 flex items-center gap-1 bg-[#56402A] text-[#F3ECE0] text-[11px] font-semibold px-2.5 py-1.5 rounded-full hover:bg-[#3A2818] transition-colors"
									>
										<IconPlus size={12} />
										Top Up
									</Link>
								</div>

								<div className="flex items-center gap-1.5 bg-white border border-[#D4C4AE] rounded-full px-3.5 py-1.5 shadow-[0_1px_6px_rgba(58,40,24,.07)] h-[34px]">
									<IconTicket size={15} className="text-[#9A7E5A] shrink-0" />
									<span className="text-xs font-medium text-[#7A5E3E]">Stamps:</span>
									<span className="text-sm font-semibold text-[#3A2818]">
										{Number(user?.stamp || 0)}
									</span>
								</div>
							</div>

							{/* Tampilan Saldo — Mobile */}
							<div className="md:hidden flex items-center gap-3 bg-white border border-[#D4C4AE] rounded-full pl-3.5 pr-2 py-1.5 shadow-[0_2px_8px_rgba(58,40,24,.06)] text-sm font-bold text-[#3A2818] h-10.5">
								<div className="flex items-center gap-1">
									<IconCoin size={16} className="text-[#C8A84E] shrink-0" />
									<span>{Number(user?.koin || 0)}</span>
								</div>
								<div className="w-px h-4 bg-[#D4C4AE]" />
								<div className="flex items-center gap-1">
									<IconTicket size={16} className="text-[#9A7E5A] shrink-0" />
									<span>{Number(user?.stamp || 0)}</span>
								</div>
								<Link
									href={topUpHref}
									aria-label="Top up koin"
									className="w-6.5 h-6.5 bg-[#56402A] text-white rounded-full flex items-center justify-center hover:bg-[#3A2818] transition-colors shrink-0"
								>
									<IconPlus size={12} />
								</Link>
							</div>

							<div className="w-px h-5.5 bg-[#D4C4AE] mx-0.5 hidden sm:block" />

							{/* Tombol Avatar & Menu Dropdown Profil */}
							<div className="relative">
								<button
									onClick={() => setProfileOpen((v) => !v)}
									className="flex items-center gap-1 p-0.5 rounded-full hover:bg-[#E8DDD0]/40 transition-colors focus:outline-hidden cursor-pointer"
									aria-label="User profile menu"
									aria-expanded={profileOpen}
								>
									<Image
										unoptimized
										src={`https://api.dicebear.com/9.x/initials/svg?seed=${user?.nama_pengguna}`}
										alt={`Avatar ${user?.nama_pengguna ?? 'Anonim'}`}
										width={40}
										height={40}
										sizes="40px"
										className="w-10 h-10 rounded-full tracking-wider shrink-0 select-none shadow-sm"
									/>
									<IconChevronDown size={14} className={`text-[#9A7E5A] transition-transform duration-200 hidden md:block ${profileOpen ? "rotate-180" : ""}`} />
								</button>

								{profileOpen && (
									<div className="absolute right-0 top-12 w-60 bg-white rounded-[14px] border border-[#D4C4AE]/40 shadow-[0_8px_32px_rgba(58,40,24,.14)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
										<div className="px-4 py-3 bg-[#FAF7F2] border-b border-[#E8DDD0]">
											<p className="text-sm font-semibold text-[#3A2818] truncate">{user?.nama_pengguna}</p>
											<p className="text-[11px] text-[#9A7E5A] truncate mt-0.5">{user?.email}</p>
										</div>

										<div className="p-1.5 flex flex-col gap-0.5">
											<Link
												href={transaksiKoinHref}
												onClick={() => setProfileOpen(false)}
												className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[#56402A] rounded-lg hover:bg-[#FAF7F2] hover:text-[#3A2818] transition-colors text-left"
											>
												<IconCoin size={18} className="text-[#9A7E5A] shrink-0" />
												Transaksi Koin
											</Link>

											<Link
												href={peminjamanBukuHref}
												onClick={() => setProfileOpen(false)}
												className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[#56402A] rounded-lg hover:bg-[#FAF7F2] hover:text-[#3A2818] transition-colors text-left"
											>
												<IconBook size={18} className="text-[#9A7E5A] shrink-0" />
												Peminjaman Buku
											</Link>

											<Link
												href={profileHref}
												onClick={() => setProfileOpen(false)}
												className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[#56402A] rounded-lg hover:bg-[#FAF7F2] hover:text-[#3A2818] transition-colors text-left"
											>
												<IconUser size={18} className="text-[#9A7E5A] shrink-0" />
												Profile
											</Link>

											<div className="h-px bg-[#E8DDD0]/60 my-1" />

											<button
												type="button"
												onClick={() => {
													setProfileOpen(false);
													setLogoutConfirmOpen(true);
												}}
												className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors text-left cursor-pointer"
											>
												<IconLogout size={18} className="shrink-0" />
												Logout
											</button>
										</div>
									</div>
								)}
							</div>
						</>
					) : (
						/* 3. STATE UNAUTHENTICATED: Jika BELUM login, profil disembunyikan dan tombol ini tampil */
						<div className="flex items-center gap-2 sm:gap-3 animate-in fade-in duration-200">
							<Link
								href="/login"
								className="flex items-center gap-2 text-sm sm:text-base font-bold text-[#56402A] hover:text-[#3A2818] px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
							>
								<IconLogin size={18} className="shrink-0" />
								Masuk
							</Link>
							<Link
								href="/register"
								className="flex items-center gap-2 bg-[#56402A] text-[#F3ECE0] text-sm sm:text-base font-bold px-5 py-2.5 rounded-xl hover:bg-[#3A2818] transition-all shadow-[0_3px_8px_rgba(86,64,42,0.16)] cursor-pointer"
							>
								<IconUserPlus size={18} className="shrink-0" />
								Daftar
							</Link>
						</div>
					)}

				</div>
			</nav>

			{/* ─── MODAL DIALOG KONFIRMASI LOGOUT ─── */}
			{logoutConfirmOpen && (
				<div className="fixed inset-0 z-10000 flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
						onClick={() => setLogoutConfirmOpen(false)}
					/>

					<div className="relative bg-white border border-[#D4C4AE]/50 rounded-[20px] max-w-sm w-full p-6 shadow-[0_12px_40px_rgba(58,40,24,.15)] animate-in fade-in zoom-in-95 duration-150 text-center select-none">
						<div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
							<IconLogout size={22} />
						</div>

						<h3 className="text-base font-bold text-[#3A2818]">Konfirmasi Keluar</h3>
						<p className="text-xs text-[#9A7E5A] mt-2 leading-relaxed px-2">
							Apakah Anda yakin ingin keluar dari sesi akun ZeBook saat ini? Anda harus masuk kembali nanti.
						</p>

						<div className="grid grid-cols-2 gap-3 mt-6">
							<button
								type="button"
								onClick={() => setLogoutConfirmOpen(false)}
								className="w-full py-2.5 px-4 border border-[#D4C4AE]/70 rounded-xl text-xs font-semibold text-[#56402A] hover:bg-[#FAF7F2] transition-colors cursor-pointer focus:outline-hidden"
							>
								Batal
							</button>
							<button
								type="button"
								onClick={() => {
									setLogoutConfirmOpen(false);
									if (onLogout) onLogout();
								}}
								className="w-full py-2.5 px-4 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer focus:outline-hidden shadow-xs"
							>
								Keluar
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}