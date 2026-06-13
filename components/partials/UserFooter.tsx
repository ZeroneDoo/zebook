import {
	IconBookmark,
	IconBooks,
	IconBrandFacebook,
	IconBrandInstagram,
	IconBrandTiktok,
	IconBrandX,
	IconCategory,
	IconCoin,
	IconHistory,
	IconInfoCircle,
	IconMail,
	IconNews,
	IconPencil,
	IconSettings,
	IconShield,
	IconSparkles,
	IconTrophy,
} from "@tabler/icons-react";

export default function UserFooter() {
	return (
		<footer className="bg-[#221508] p-6 sm:p-10 lg:p-13 lg:pb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 text-[#F5EBD9]/45">
			{/* Brand */}
			<div className="flex flex-col justify-between">
				<div>
					<div className="font-serif-elegant text-2xl font-semibold text-[#D4C4AE] tracking-wide">
						Ze<em className="not-italic text-[#B8A080]">Boo</em>k
					</div>
					<p className="text-xs text-[#F5EBD9]/45 leading-relaxed max-w-55 mt-2.5">
						Your digital lending library. Discover books, borrow with koin, and earn stamps with every return.
					</p>
				</div>
				<div className="flex gap-2.5 mt-5">
					{[IconBrandInstagram, IconBrandX, IconBrandFacebook, IconBrandTiktok].map((SocialIcon, idx) => (
						<div
							key={idx}
							className="w-8.5 h-8.5 rounded-full border border-[#D4C4AE]/20 flex items-center justify-center text-[#F5EBD9]/40 cursor-pointer transition-all hover:border-[#B8A080] hover:text-[#D4C4AE]"
						>
							<SocialIcon size={16} />
						</div>
					))}
				</div>
			</div>

			{/* Explore */}
			<div>
				<h4 className="text-[10.5px] font-semibold tracking-widest uppercase text-[#B8A080] mb-4">Explore</h4>
				<ul className="space-y-2.5 text-sm">
					<li><a href="#" className="flex items-center gap-2 hover:text-[#D4C4AE] transition-colors"><IconSparkles size={14} /> New Releases</a></li>
					<li><a href="#" className="flex items-center gap-2 hover:text-[#D4C4AE] transition-colors"><IconTrophy size={14} /> Bestsellers</a></li>
					<li><a href="#" className="flex items-center gap-2 hover:text-[#D4C4AE] transition-colors"><IconCategory size={14} /> Categories</a></li>
					<li><a href="#" className="flex items-center gap-2 hover:text-[#D4C4AE] transition-colors"><IconPencil size={14} /> Authors</a></li>
				</ul>
			</div>

			{/* Account */}
			<div>
				<h4 className="text-[10.5px] font-semibold tracking-widest uppercase text-[#B8A080] mb-4">Account</h4>
				<ul className="space-y-2.5 text-sm">
					<li><a href="#" className="flex items-center gap-2 hover:text-[#D4C4AE] transition-colors"><IconBooks size={14} /> My Borrowings</a></li>
					<li><a href="#" className="flex items-center gap-2 hover:text-[#D4C4AE] transition-colors"><IconHistory size={14} /> Borrow History</a></li>
					<li><a href="#" className="flex items-center gap-2 hover:text-[#D4C4AE] transition-colors"><IconCoin size={14} /> Top Up Koin</a></li>
					<li><a href="#" className="flex items-center gap-2 hover:text-[#D4C4AE] transition-colors"><IconSettings size={14} /> Settings</a></li>
				</ul>
			</div>

			{/* Company */}
			<div>
				<h4 className="text-[10.5px] font-semibold tracking-widest uppercase text-[#B8A080] mb-4">Company</h4>
				<ul className="space-y-2.5 text-sm">
					<li><a href="#" className="flex items-center gap-2 hover:text-[#D4C4AE] transition-colors"><IconInfoCircle size={14} /> About Us</a></li>
					<li><a href="#" className="flex items-center gap-2 hover:text-[#D4C4AE] transition-colors"><IconNews size={14} /> Blog</a></li>
					<li><a href="#" className="flex items-center gap-2 hover:text-[#D4C4AE] transition-colors"><IconMail size={14} /> Contact</a></li>
					<li><a href="#" className="flex items-center gap-2 hover:text-[#D4C4AE] transition-colors"><IconShield size={14} /> Privacy</a></li>
				</ul>
			</div>
		</footer>
	);
}