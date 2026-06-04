import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
	label: string;
	href?: string;
}

interface BreadcrumbProps {
	items: BreadcrumbItem[];
	showHomeIcon?: boolean;
}

export function Breadcrumb({ items, showHomeIcon = true }: BreadcrumbProps) {
	return (
		<nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
			{items.map((item, index) => {
				const isLast = index === items.length - 1;
				const isFirst = index === 0;

				return (
					<span key={index} className="flex items-center gap-1.5">
						{/* Separator — shown before every item except the first */}
						{!isFirst && (
							<ChevronRight size={12} className="text-gray-300" />
						)}

						{isLast ? (
							/* Current / active page */
							<span className="text-gray-600 font-medium">{item.label}</span>
						) : (
							/* Clickable ancestor */
							<Link
								href={item.href ?? "#"}
								className="flex items-center gap-1 hover:text-[#E8461E] transition-colors"
							>
								{isFirst && showHomeIcon && <Home size={12} />}
								{item.label}
							</Link>
						)}
					</span>
				);
			})}
		</nav>
	);
}