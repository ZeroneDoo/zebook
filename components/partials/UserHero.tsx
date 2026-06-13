import { formatRupiah } from "@/lib/formats";
import {
	IconArrowRight,
	IconBooks,
	IconChevronRight,
	IconSearch,
	IconCoin,
	IconTicket,
	IconCompass,
	IconPlus,
	IconClock,
	IconAlertTriangle,
} from "@tabler/icons-react";

type BorrowStatus = "DIPROSES" | "DIPINJAM" | "DIKEMBALIKAN" | "DITOLAK";

interface ActiveBorrow {
	judul: string;
	penulis: string;
	tgl_kembali: string;
	status: BorrowStatus;
	denda_koin: number;
}

interface UserHeroProps {
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

function daysUntil(dateStr: string): number {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const due = new Date(dateStr);
	return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

const statusLabel: Record<BorrowStatus, string> = {
	DIPROSES: "Processing",
	DIPINJAM: "Borrowed",
	DIKEMBALIKAN: "Returned",
	DITOLAK: "Rejected",
};

const statusColor: Record<BorrowStatus, string> = {
	DIPROSES: "text-amber-600 bg-amber-50",
	DIPINJAM: "text-emerald-700 bg-emerald-50",
	DIKEMBALIKAN: "text-[#9A7E5A] bg-[#F3ECE0]",
	DITOLAK: "text-red-600 bg-red-50",
};

export default function UserHero({
	user = { nama_pengguna: "Reader", koin: 0, stamp: 0 },
	activeBorrows = [],
	onTopUp,
	onBrowse,
	onViewBorrowings,
}: UserHeroProps) {
	const hasBorrowed = activeBorrows.length > 0;
	const activeBorrow = activeBorrows.find((b) => b.status === "DIPINJAM") ?? activeBorrows[0];
	const daysLeft = activeBorrow ? daysUntil(activeBorrow.tgl_kembali) : null;
	const isOverdue = daysLeft !== null && daysLeft < 0;

	return (
		<>
			<section className="px-4 sm:px-8 lg:px-13 pt-8 sm:pt-15 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-9 items-end">
				{/* Left Column: Intro text */}
				<div className="pb-6 lg:pb-12 order-1">
					<div className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[2px] uppercase text-[#9A7E5A] mb-4 sm:mb-5.5 before:content-[''] before:block before:w-5.5 before:h-px before:bg-[#B8A080]">
						New &amp; Trending
					</div>
					<h1 className="font-serif-elegant text-4xl sm:text-5xl lg:text-[58px] leading-[1.05] font-semibold text-[#221508] mb-4">
						Explore <em className="italic text-[#9A7E5A]">New</em><br />Worlds from<br />Authors
					</h1>
					<p className="text-[14.5px] text-[#9A7E5A] leading-relaxed mb-6 sm:mb-8 max-w-72.5">
						Discover thousands of books curated just for you. Borrow with koin, return on time, and earn rewards.
					</p>
					<div className="flex items-center bg-white border border-[#D4C4AE] rounded-full p-2 pl-5 max-w-[320px] shadow-[0_2px_10px_rgba(58,40,24,.07)] focus-within:border-[#9A7E5A] focus-within:ring-3 focus-within:ring-[#9A7E5A]/12 transition-all">
						<IconSearch size={16} className="text-[#B8A080] mr-2.5 shrink-0" />
						<input
							type="text"
							placeholder="Title, author, or category…"
							className="flex-1 border-none outline-none text-[13.5px] text-[#3A2818] bg-transparent placeholder-[#B8A080]"
						/>
						<button
							className="w-8.5 h-8.5 rounded-full bg-[#56402A] flex items-center justify-center text-[#F3ECE0] transition-all hover:bg-[#3A2818] hover:scale-105 shrink-0"
							aria-label="Search"
						>
							<IconArrowRight size={16} />
						</button>
					</div>
				</div>

				{/* Center Column: Featured 3D Book */}
				<div className="flex flex-col items-center justify-center relative py-6 md:py-0 order-3 lg:order-2 col-span-1 md:col-span-2 lg:col-span-1">
					<div className="relative drop-shadow-[16px_24px_40px_rgba(58,40,24,.28)] animate-levitate mb-1">
						<div
							className="w-48 h-69 rounded-l-[3px] rounded-r-[10px] relative overflow-hidden cursor-pointer transition-transform duration-400"
							style={{ transform: "perspective(700px) rotateY(-14deg)", transformStyle: "preserve-3d" }}
							onMouseEnter={(e) => (e.currentTarget.style.transform = "perspective(700px) rotateY(-4deg)")}
							onMouseLeave={(e) => (e.currentTarget.style.transform = "perspective(700px) rotateY(-14deg)")}
						>
							<div className="absolute inset-0 bg-linear-to-br from-[#2D5A3D] to-[#163020] flex flex-col justify-between p-5 pl-6.5 text-white">
								<div className="absolute top-3.5 right-3.5 bg-[#C8A84E] text-[#221508] text-[9px] font-semibold tracking-wider uppercase px-2 py-1 rounded">
									Bestseller
								</div>
								<div className="absolute left-0 top-0 bottom-0 w-5 bg-black/25" style={{ transform: "translateZ(-1px)" }} />
								<div className="text-[9px] tracking-widest uppercase opacity-65">#1 NY Times</div>
								<div className="font-serif-elegant text-2xl font-semibold leading-snug">The Last Thing He Told Me</div>
								<div className="text-xs opacity-70">Laura Dave</div>
							</div>
						</div>
					</div>
					<div className="w-62.5 h-3 bg-linear-to-b from-[#B8A080] to-[#7A5E3E] rounded-t-xs rounded-b-md shadow-[0_8px_24px_rgba(90,60,30,.25)]" />
				</div>

				{/* Right Column: Dashboard Cards */}
				<div className="flex flex-col gap-3.5 pb-6 order-2 lg:order-3 w-full sm:min-w-[280px]">

					{/* Wallet Card — always visible */}
					<div className="bg-white rounded-[14px] border border-[#D4C4AE]/25 shadow-[0_2px_10px_rgba(58,40,24,.07)] overflow-hidden">
						<div className="bg-linear-to-br from-[#7A5E3E] to-[#56402A] p-4 sm:p-5 relative overflow-hidden before:content-[''] before:absolute before:-right-7.5 before:-top-7.5 before:w-25 before:h-25 before:rounded-full before:bg-white/5">
							<div className="text-[9px] tracking-widest uppercase text-[#F5EBD9]/60 mb-1.5">Your Balance</div>
							<div className="font-serif-elegant text-base font-medium text-[#F5EBD9] mb-3">
								Welcome back, <span className="font-semibold">{user.nama_pengguna}</span>!
							</div>
							<div className="flex items-center gap-4 border-t border-white/10 pt-3">
								<div className="flex items-center gap-1.5 text-[#F5EBD9]">
									<IconCoin size={16} className="text-[#C8A84E]" />
									<div className="text-sm font-semibold">
										{(user.koin)}{" "}
										<span className="text-[10px] font-normal text-[#F5EBD9]/60">Koin</span>
									</div>
								</div>
								<div className="w-px h-4 bg-white/20" />
								<div className="flex items-center gap-1.5 text-[#F5EBD9]">
									<IconTicket size={16} className="text-[#B8A080]" />
									<div className="text-sm font-semibold">
										{(user.stamp)}{" "}
										<span className="text-[10px] font-normal text-[#F5EBD9]/60">Stamps</span>
									</div>
								</div>
								<button
									onClick={onTopUp}
									className="ml-auto flex items-center gap-1 bg-white/15 hover:bg-white/25 text-[#F5EBD9] text-[11px] font-semibold px-2.5 py-1.5 rounded-full transition-colors"
								>
									<IconPlus size={12} />
									Top Up
								</button>
							</div>
						</div>
					</div>

					{hasBorrowed ? (
						/* Active borrowings card */
						<div className="bg-white rounded-[14px] border border-[#D4C4AE]/25 shadow-[0_2px_10px_rgba(58,40,24,.07)] overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(58,40,24,.11)]">
							<div className="p-4 sm:p-4.5">
								<div className="text-[10px] tracking-wider uppercase text-[#B8A080] mb-3 flex items-center justify-between">
									<span>Active Borrowings</span>
									<span className="text-[#9A7E5A] font-semibold">
										{activeBorrows.length} book{activeBorrows.length > 1 ? "s" : ""}
									</span>
								</div>

								{activeBorrow && (
									<div className="flex gap-3 items-start mb-3">
										<div className="w-11 h-14 rounded-md bg-linear-to-br from-[#2D5A3D] to-[#163020] flex items-center justify-center shrink-0 text-white/50">
											<IconBooks size={18} />
										</div>
										<div className="flex-1 min-w-0">
											<div className="font-serif-elegant text-[14px] font-semibold text-[#3A2818] leading-tight truncate">
												{activeBorrow.judul}
											</div>
											<div className="text-xs text-[#B8A080] mt-0.5 truncate">{activeBorrow.penulis}</div>
											<div className={`inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor[activeBorrow.status]}`}>
												{statusLabel[activeBorrow.status]}
											</div>
										</div>
									</div>
								)}

								{daysLeft !== null && activeBorrow?.status === "DIPINJAM" && (
									<div className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 mb-3 ${isOverdue ? "bg-red-50 text-red-600" : "bg-[#F3ECE0] text-[#7A5E3E]"}`}>
										{isOverdue ? <IconAlertTriangle size={14} /> : <IconClock size={14} />}
										{isOverdue
											? `${Math.abs(daysLeft)} day${Math.abs(daysLeft) > 1 ? "s" : ""} overdue${activeBorrow.denda_koin > 0 ? ` · ${activeBorrow.denda_koin} koin fine` : ""}`
											: `Due in ${daysLeft} day${daysLeft !== 1 ? "s" : ""} · ${activeBorrow.tgl_kembali}`}
									</div>
								)}

								<button
									onClick={onViewBorrowings}
									className="w-full py-2.5 rounded-full bg-[#56402A] text-[#F3ECE0] text-xs font-medium flex items-center justify-center gap-1.5 transition-all hover:bg-[#3A2818] hover:scale-[1.02]"
								>
									<span>View all borrowings</span>
									<IconArrowRight size={14} />
								</button>
							</div>
						</div>
					) : (
						/* Empty state */
						<div className="bg-white rounded-[14px] border border-[#D4C4AE]/25 shadow-[0_2px_10px_rgba(58,40,24,.07)] p-4 sm:p-4.5 flex flex-col justify-between min-h-[145px]">
							<div>
								<div className="text-[10px] tracking-wider uppercase text-[#B8A080] mb-2">Ready to Read?</div>
								<div className="flex gap-2.5 items-start mb-2">
									<div className="w-8 h-8 rounded-lg bg-[#F3ECE0] text-[#7A5E3E] flex items-center justify-center shrink-0 mt-0.5">
										<IconCompass size={18} />
									</div>
									<p className="text-xs text-[#56402A] leading-relaxed">
										You haven&apos;t borrowed any books yet. Use your koin to unlock your very first adventure!
									</p>
								</div>
							</div>
							<button
								onClick={onBrowse}
								className="w-full mt-2 py-2.5 rounded-full bg-[#56402A] text-[#F3ECE0] text-xs font-medium flex items-center justify-center gap-1.5 transition-all hover:bg-[#3A2818] hover:scale-[1.02]"
							>
								<span>Browse Catalog</span>
								<IconArrowRight size={14} />
							</button>
						</div>
					)}
				</div>
			</section>

			{/* Decorative Shelf Divider */}
			<div className="mx-4 sm:px-8 lg:mx-13 h-3.5 bg-linear-to-b from-[#D4C4AE] to-[#9A7E5A] rounded-b-lg shadow-[0_10px_28px_rgba(90,60,30,.22)]"></div>
		</>
	);
}