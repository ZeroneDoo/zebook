"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Users, UserCog, BookOpen, BookText,
  Coins, ArrowLeftRight, BookMarked, Settings,
  HelpCircle, LogOut, ChevronDown, X, LayoutList,
  BookCopy, AlertTriangle
} from "lucide-react";

interface SubItem { label: string; icon: React.ElementType; href: string; badge?: string | number; }
interface NavGroup { label: string; icon: React.ElementType; children: SubItem[]; }
interface NavFlat { label: string; icon: React.ElementType; href: string; badge?: string | number; }
type MenuItem = NavFlat | NavGroup;
interface SidebarProps { isOpen: boolean; onClose: () => void; }
function isGroup(item: MenuItem): item is NavGroup { return "children" in item; }

const menuItems: MenuItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  {
    label: "Pengguna", icon: Users, children: [
      { label: "Pengguna", icon: Users, href: "/admin/pengguna" },
      { label: "Staff", icon: UserCog, href: "/admin/staff" },
    ]
  },
  {
    label: "Buku", icon: BookOpen, children: [
      { label: "Buku", icon: BookOpen, href: "/admin/buku" },
      { label: "Detail Buku", icon: BookText, href: "/admin/detail-buku" },
      { label: "Kategori", icon: LayoutList, href: "/admin/kategori" },
    ]
  },
  {
    label: "Koin", icon: Coins, children: [
      { label: "Koin", icon: Coins, href: "/admin/koin" },
      { label: "Transaksi Koin", icon: ArrowLeftRight, href: "/admin/transaksi-koin" },
    ]
  },
  { label: "Peminjaman Buku", icon: BookMarked, href: "/admin/peminjaman-buku" },
];

// const generalItems: NavFlat[] = [
//   { label: "Settings", icon: Settings, href: "/admin/settings" },
//   { label: "Help Desk", icon: HelpCircle, href: "/admin/help" },
// ];

function SubNavItem({ item, onClick }: { item: SubItem; onClick: () => void }) {
  const pathname = usePathname();
  const active = pathname === item.href;
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        group flex items-center justify-between
        w-full pl-10 pr-4 py-2 rounded-xl
        text-sm font-medium transition-all duration-200
        ${active
          ? "bg-orange-50 text-[#E8461E]"
          : "text-gray-500 hover:bg-orange-50 hover:text-[#E8461E]"
        }
      `}
    >
      <div className="flex items-center gap-2.5">
        <Icon size={15} className={`transition-colors ${active ? "text-[#E8461E]" : "text-gray-400 group-hover:text-[#E8461E]"}`} />
        <span>{item.label}</span>
      </div>
      {active && <span className="w-1.5 h-1.5 rounded-full bg-[#E8461E]" />}
    </Link>
  );
}

function FlatNavItem({ item, onClick }: { item: NavFlat; onClick: () => void }) {
  const pathname = usePathname();
  const active = pathname === item.href;
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        group flex items-center justify-between
        px-3 py-2.5 rounded-xl
        text-sm font-medium transition-all duration-200
        ${active
          ? "bg-[#E8461E] text-white shadow-md shadow-orange-200"
          : "text-gray-500 hover:bg-orange-50 hover:text-[#E8461E]"
        }
      `}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={`transition-colors duration-200 ${active ? "text-white" : "text-gray-400 group-hover:text-[#E8461E]"}`} />
        <span>{item.label}</span>
      </div>
      {item.badge && (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-orange-100 text-[#E8461E]"}`}>
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function DropdownNavItem({ group, onSelect }: { group: NavGroup; onSelect: () => void }) {
  const pathname = usePathname();
  const Icon = group.icon;
  const isChildActive = group.children.some((child) => pathname === child.href);
  const [open, setOpen] = useState(isChildActive);

  return (
    <div>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`
          group flex items-center justify-between
          w-full px-3 py-2.5 rounded-xl
          text-sm font-medium transition-all duration-200
          ${isChildActive
            ? "bg-orange-50 text-[#E8461E]"
            : "text-gray-500 hover:bg-orange-50 hover:text-[#E8461E]"
          }
        `}
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className={`transition-colors ${isChildActive ? "text-[#E8461E]" : "text-gray-400 group-hover:text-[#E8461E]"}`} />
          <span>{group.label}</span>
        </div>
        <ChevronDown
          size={16}
          className={`transition-all duration-200 ${open ? "rotate-180" : ""} ${isChildActive ? "text-[#E8461E]" : "text-gray-400 group-hover:text-[#E8461E]"}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-60 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
        <div className="space-y-1">
          {group.children.map((child) => (
            <SubNavItem key={child.label} item={child} onClick={onSelect} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── LOGOUT MODAL ──────────────────────────────────────────
function LogoutModal({
  onCancel,
  onConfirm,
  isLoading,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && !isLoading && onCancel()}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle size={16} className="text-red-500" />
            </div>
            <h2 className="text-sm font-bold text-gray-900">Konfirmasi Keluar</h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-1 text-gray-400 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-4 text-sm text-gray-600 leading-relaxed">
          <p>
            Apakah Anda yakin ingin mengakhiri sesi administrasi ini dan keluar dari dashboard{" "}
            <span className="font-semibold text-gray-900">ZeBook</span>?
          </p>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-md shadow-red-100 active:scale-95 transition-all disabled:opacity-50"
          >
            <LogOut size={13} />
            {isLoading ? "Keluar..." : "Ya, Keluar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [showModal, setShowModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/admin/auth" });
    setIsLoggingOut(false);
    setShowModal(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64
          bg-white border-r border-gray-100
          flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          shadow-sm
        `}
      >
        {/* Header / Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#E8461E] rounded-xl flex items-center justify-center shadow-md shadow-orange-200">
              <BookCopy size={18} className="text-white" fill="white" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">ZeBook</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Menu</p>
            <div className="space-y-1">
              {menuItems.map((item) =>
                isGroup(item) ? (
                  <DropdownNavItem key={item.label} group={item} onSelect={onClose} />
                ) : (
                  <FlatNavItem key={item.label} item={item} onClick={onClose} />
                )
              )}
            </div>
          </div>
          {/* <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">General</p>
            <div className="space-y-1">
              {generalItems.map((item) => (
                <FlatNavItem key={item.label} item={item} onClick={onClose} />
              ))}
            </div>
          </div> */}
        </nav>

        {/* Logout Button */}
        <div className="px-3 pb-5 pt-2 border-t border-gray-100">
          <button
            onClick={() => setShowModal(true)}
            className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#E8461E] hover:bg-red-50 transition-all duration-200"
          >
            <LogOut size={18} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Logout Modal */}
      {showModal && (
        <LogoutModal
          onCancel={() => setShowModal(false)}
          onConfirm={handleConfirmLogout}
          isLoading={isLoggingOut}
        />
      )}
    </>
  );
}