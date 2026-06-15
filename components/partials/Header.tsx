"use client";

import { Bell, HelpCircle, ChevronDown, Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const name = session?.user?.name ?? "Admin";

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 shadow-sm">
      <div className="flex items-center justify-between h-16 gap-4">
        {/* Hamburger - mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div></div>

        {/* Right actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Notifications */}
          {/* <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E8461E] rounded-full ring-2 ring-white" />
          </button> */}

          {/* Help */}
          {/* <button className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors hidden sm:flex">
            <HelpCircle size={18} />
          </button> */}

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

          {/* User profile */}
          <button className="flex items-center gap-2 sm:gap-2.5 pl-1 pr-2 sm:pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors group">
            {/* Avatar */}
            <Image
              unoptimized
              src={`https://api.dicebear.com/9.x/initials/svg?seed=${name}`}
              alt={`Avatar ${name}`}
              width={36}
              height={36}
              className="w-9 h-9 rounded-xl shadow-sm shrink-0"
            />
            {/* Name - hidden on mobile */}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-800 leading-tight">
                {name}
              </p>
              <p className="text-xs text-gray-400 leading-tight">Admin</p>
            </div>
            <ChevronDown
              size={14}
              className="text-gray-400 hidden sm:block group-hover:text-gray-600 transition-colors"
            />
          </button>
        </div>
      </div>
    </header>
  );
}