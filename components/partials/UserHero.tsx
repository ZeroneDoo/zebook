import { IconArrowRight, IconBooks, IconChevronRight, IconHeadphones, IconPlayerPlay, IconPlayerSkipBack, IconPlayerSkipForward, IconPlayerTrackNext, IconPlayerTrackPrev, IconSearch, IconUser } from "@tabler/icons-react";

export default function UserHero() {
	return (
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
					Discover thousands of books, audiobooks, and exclusive collections curated just for you.
				</p>
				<div className="flex items-center bg-white border border-[#D4C4AE] rounded-full p-2 pl-5 max-w-[320px] shadow-[0_2px_10px_rgba(58,40,24,.07)] focus-within:border-[#9A7E5A] focus-within:ring-3 focus-within:ring-[#9A7E5A]/12 transition-all">
					<IconSearch size={16} className="text-[#B8A080] mr-2.5 shrink-0" />
					<input type="text" placeholder="Titles, author, or topics…" className="flex-1 border-none outline-none text-[13.5px] text-[#3A2818] bg-transparent placeholder-[#B8A080]" />
					<button className="w-8.5 h-8.5 rounded-full bg-[#56402A] flex items-center justify-center text-[#F3ECE0] transition-all hover:bg-[#3A2818] hover:scale-105 shrink-0" aria-label="Search">
						<IconArrowRight size={16} />
					</button>
				</div>
			</div>

			{/* Center Column: Featured 3D Book Stage */}
			<div className="flex flex-col items-center justify-center relative py-6 md:py-0 order-3 lg:order-2 col-span-1 md:col-span-2 lg:col-span-1">
				<div className="relative drop-shadow-[16px_24px_40px_rgba(58,40,24,.28)] animate-levitate mb-1">
					<div
						className="w-48 h-69 rounded-l-[3px] rounded-r-[10px] relative overflow-hidden cursor-pointer transition-transform duration-400"
						style={{ transform: 'perspective(700px) rotateY(-14deg)', transformStyle: 'preserve-3d' }}
						onMouseEnter={(e) => e.currentTarget.style.transform = 'perspective(700px) rotateY(-4deg)'}
						onMouseLeave={(e) => e.currentTarget.style.transform = 'perspective(700px) rotateY(-14deg)'}
					>
						<div className="absolute inset-0 bg-linear-to-br from-[#2D5A3D] to-[#163020] flex flex-col justify-between p-5 pl-6.5 text-white">
							<div className="absolute top-3.5 right-3.5 bg-[#C8A84E] text-[#221508] text-[9px] font-semibold tracking-wider uppercase px-2 py-1 rounded">
								Bestseller
							</div>
							<div className="absolute left-0 top-0 bottom-0 w-5 bg-black/25" style={{ transform: 'translateZ(-1px)' }}></div>
							<div className="text-[9px] tracking-widest uppercase opacity-65">#1 NY Times</div>
							<div className="font-serif-elegant text-2xl font-semibold leading-snug">The Last Thing He Told Me</div>
							<div className="text-xs opacity-70">Laura Dave</div>
						</div>
					</div>
				</div>
				<div className="w-62.5 h-3 bg-linear-to-b from-[#B8A080] to-[#7A5E3E] rounded-t-xs rounded-b-md shadow-[0_8px_24px_rgba(90,60,30,.25)]"></div>
			</div>

			{/* Right Column: Mini Dashboard Cards */}
			<div className="flex flex-col gap-3.5 pb-6 order-2 lg:order-3">

				{/* Author of the Week Card */}
				<div className="bg-white rounded-[14px] border border-[#D4C4AE]/25 shadow-[0_2px_10px_rgba(58,40,24,.07)] overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(58,40,24,.11)]">
					<div className="bg-linear-to-br from-[#7A5E3E] to-[#56402A] p-4 sm:p-5 flex gap-3.5 items-center relative overflow-hidden before:content-[''] before:absolute before:-right-7.5 before:-top-7.5 before:w-25 before:h-25 before:rounded-full before:bg-white/5">
						<div className="w-13.5 h-13.5 rounded-xl bg-white/15 flex items-center justify-center shrink-0 overflow-hidden text-white/70">
							<IconUser size={24} />
						</div>
						<div className="flex-1">
							<div className="text-[9px] tracking-widest uppercase text-[#F5EBD9]/60 mb-1">Author of the Week</div>
							<div className="font-serif-elegant text-lg font-semibold text-[#F5EBD9] leading-none">Stephen King</div>
							<div className="text-[11.5px] text-[#F5EBD9]/70 mt-1 flex items-center gap-1">
								<IconBooks size={12} /> 78 books in collection
							</div>
						</div>
						<IconChevronRight className="text-[#F5EBD9]/50" size={18} />
					</div>
				</div>

				{/* Now Playing Audio Card */}
				<div className="bg-white rounded-[14px] border border-[#D4C4AE]/25 shadow-[0_2px_10px_rgba(58,40,24,.07)] overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(58,40,24,.11)]">
					<div className="p-4 sm:p-4.5">
						<div className="text-[10px] tracking-wider uppercase text-[#B8A080] mb-3">Last Listened</div>
						<div className="flex gap-3 items-center mb-3">
							<div className="w-11 h-11 rounded-lg bg-linear-to-br from-[#5A3020] to-[#3A1A10] flex items-center justify-center shrink-0 text-white/50">
								<IconHeadphones size={20} />
							</div>
							<div>
								<div className="font-serif-elegant text-[15px] font-semibold text-[#3A2818] leading-tight">False Witness: A Novel</div>
								<div className="text-xs text-[#B8A080] mt-0.5">Karin Slaughter</div>
							</div>
						</div>

						{/* Audio Progress Bar */}
						<div className="mb-2.5">
							<div className="h-0.75 bg-[#E8DDD0] rounded-full overflow-hidden">
								<div className="h-full w-[62%] bg-linear-to-r from-[#9A7E5A] to-[#C8A84E]"></div>
							</div>
							<div className="flex justify-between mt-1 text-[10px] text-[#B8A080]">
								<span>1:24:08</span><span>2:16:45</span>
							</div>
						</div>

						{/* Media Controls */}
						<div className="flex items-center justify-center gap-3.5 text-[#B8A080]">
							<button className="hover:text-[#56402A] transition-colors"><IconPlayerTrackPrev size={16} /></button>
							<button className="hover:text-[#56402A] transition-colors"><IconPlayerSkipBack size={16} /></button>
							<button className="w-8.5 h-8.5 rounded-full bg-[#56402A] flex items-center justify-center text-[#F3ECE0] transition-all hover:bg-[#221508] hover:scale-105" aria-label="Play/Pause">
								<IconPlayerPlay size={14} />
							</button>
							<button className="hover:text-[#56402A] transition-colors"><IconPlayerSkipForward size={16} /></button>
							<button className="hover:text-[#56402A] transition-colors"><IconPlayerTrackNext size={16} /></button>
						</div>
					</div>
				</div>

			</div>
		</section>
	)
}