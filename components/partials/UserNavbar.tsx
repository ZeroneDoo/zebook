"use client";

import { useState } from "react";
import {
	IconBooks,
	IconHeadphones,
	IconBookmark,
	IconSearch,
	IconShoppingBag,
	IconBell,
} from "@tabler/icons-react";
import Image from "next/image";

type Tab = "books" | "audiobooks";

interface UserNavbarProps {
	/** Initial active tab */
	defaultTab?: Tab;
	/** User initials shown in the avatar */
	userInitials?: string;
	/** Callback when active tab changes */
	onTabChange?: (tab: Tab) => void;
}

export default function UserNavbar({
	userInitials = "AJ",
}: UserNavbarProps) {
	const iconBtnClass =
		"w-9.5 h-9.5 rounded-full flex items-center justify-center text-[#9A7E5A] hover:bg-[#E8DDD0] hover:text-[#56402A] transition-colors";

	return (
		<nav className="sticky top-0 z-50 h-16.5 px-4 sm:px-8 lg:px-13 flex items-center justify-between bg-[#FAF7F2]/88 backdrop-blur-md border-b border-[#D4C4AE]/35">
			{/* Logo */}
			<div className="flex items-center gap-2 sm:gap-3">
				<div className="w-10 h-10 bg-linear-to-br from-[#B8A080] to-[#7A5E3E] rounded-lg">
					<Image src="/images/zebook.png" className="w-10 h-10" alt="ZeBook Logo" width={40} height={40} />
				</div>
				<div className="font-serif-elegant text-2xl font-semibold text-[#56402A] tracking-wide">
					Ze<em className="not-italic text-[#9A7E5A]">Boo</em>k
				</div>
			</div>

			{/* Actions */}
			<div className="flex items-center gap-1 sm:gap-2">
				{/* Bookmarks */}
				<button className={`relative ${iconBtnClass}`} aria-label="Bookmarks">
					<IconBookmark size={18} />
					<span className="absolute top-2.25 right-2.25 w-1.5 h-1.5 rounded-full bg-[#9A7E5A] border border-[#FAF7F2]" />
				</button>

				{/* Search — hidden on mobile */}
				<button className={`${iconBtnClass} max-sm:hidden`} aria-label="Search">
					<IconSearch size={18} />
				</button>

				{/* Cart */}
				<button className={iconBtnClass} aria-label="Cart">
					<IconShoppingBag size={18} />
				</button>

				{/* Divider */}
				<div className="w-px h-5.5 bg-[#D4C4AE] mx-1 hidden sm:block" />

				{/* Notifications — hidden on mobile */}
				<button className={`${iconBtnClass} max-sm:hidden`} aria-label="Notifications">
					<IconBell size={18} />
				</button>

				{/* Avatar */}
				<div
					className="w-9 h-9 rounded-full bg-linear-to-br from-[#B8A080] to-[#7A5E3E] flex items-center justify-center text-xs font-semibold text-[#F3ECE0] cursor-pointer tracking-wider shrink-0 select-none"
					role="button"
					aria-label="User profile"
				>
					{userInitials}
				</div>
			</div>
		</nav>
	);
}