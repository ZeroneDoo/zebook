import UserFooter from "../partials/UserFooter";
import UserNavbar from "../partials/UserNavbar";

export default function UserLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen antialiased selection:bg-[#B8A080] selection:text-white bg-[#FAF7F2] text-[#3A2818]" style={{ fontFamily: "'Jost', sans-serif" }}>
			{/* ─── NAV BAR ─── */}
			<UserNavbar userInitials="AJ" koin={125} stamp={20} />

			{children}

			{/* ─── FOOTER SECTION ─── */}
			<UserFooter />

			{/* Copyright Bar */}
			<div className="bg-[#221508] border-t border-[#D4C4AE]/10 px-4 sm:px-8 lg:px-13 py-4.5 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-[#F5EBD9]/25">
				<p>© 2026 ZeBook Digital Library. All rights reserved.</p>
				<p>Crafted with care for book lovers</p>
			</div>

		</div>
	);
}