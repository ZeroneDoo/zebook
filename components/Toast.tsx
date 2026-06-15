"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warning" | "info";

export type ToastPosition =
	| "top-left"
	| "top-center"
	| "top-right"
	| "bottom-left"
	| "bottom-center"
	| "bottom-right";

export interface ToastData {
	id: string;
	type: ToastType;
	title: string;
	message?: string;
	duration?: number;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const ICONS = {
	success: CheckCircle2,
	error: XCircle,
	warning: AlertTriangle,
	info: Info,
};

const STYLES = {
	success: { bar: "bg-emerald-500", icon: "text-emerald-500", border: "border-emerald-100", bg: "bg-white" },
	error: { bar: "bg-red-500", icon: "text-red-500", border: "border-red-100", bg: "bg-white" },
	warning: { bar: "bg-amber-400", icon: "text-amber-500", border: "border-amber-100", bg: "bg-white" },
	info: { bar: "bg-blue-500", icon: "text-blue-500", border: "border-blue-100", bg: "bg-white" },
};

// 💡 Animasi responsif: Di mobile akan slide dari atas/bawah, di desktop mengikuti posisi sudut
const ANIMATION_STYLES: Record<ToastPosition, string> = {
	"top-left": "opacity-0 -translate-y-4 sm:translate-y-0 sm:-translate-x-8",
	"top-center": "opacity-0 -translate-y-4",
	"top-right": "opacity-0 -translate-y-4 sm:translate-y-0 sm:translate-x-8",
	"bottom-left": "opacity-0 translate-y-4 sm:translate-y-0 sm:-translate-x-8",
	"bottom-center": "opacity-0 translate-y-4",
	"bottom-right": "opacity-0 translate-y-4 sm:translate-y-0 sm:translate-x-8",
};

// ─── ToastItem ────────────────────────────────────────────────────────────────

function ToastItem({
	toast,
	onRemove,
	position = "bottom-right",
}: {
	toast: ToastData;
	onRemove: (id: string) => void;
	position?: ToastPosition;
}) {
	const duration = toast.duration ?? 4000;
	const [visible, setVisible] = useState(false);
	const [progress, setProgress] = useState(100);

	const onRemoveRef = useRef(onRemove);
	useEffect(() => { onRemoveRef.current = onRemove; }, [onRemove]);

	const rafRef = useRef<number | null>(null);
	const pausedRef = useRef(false);
	const remainingRef = useRef(duration);
	const startRef = useRef<number | null>(null);

	useEffect(() => {
		const t = setTimeout(() => setVisible(true), 10);
		return () => clearTimeout(t);
	}, []);

	useEffect(() => {
		function startCountdown() {
			startRef.current = performance.now();

			function tick(now: number) {
				if (pausedRef.current) return;
				const elapsed = now - (startRef.current ?? now);
				const pct = Math.max(0, ((remainingRef.current - elapsed) / duration) * 100);
				setProgress(pct);
				if (pct <= 0) {
					setVisible(false);
					setTimeout(() => onRemoveRef.current(toast.id), 300);
					return;
				}
				rafRef.current = requestAnimationFrame(tick);
			}

			rafRef.current = requestAnimationFrame(tick);
		}

		startCountdown();

		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [duration, toast.id]);

	function handleMouseEnter() {
		pausedRef.current = true;
		if (rafRef.current) cancelAnimationFrame(rafRef.current);
		remainingRef.current -= performance.now() - (startRef.current ?? 0);
	}

	function handleMouseLeave() {
		pausedRef.current = false;
		startRef.current = performance.now();

		function tick(now: number) {
			if (pausedRef.current) return;
			const elapsed = now - (startRef.current ?? now);
			const pct = Math.max(0, ((remainingRef.current - elapsed) / duration) * 100);
			setProgress(pct);
			if (pct <= 0) {
				setVisible(false);
				setTimeout(() => onRemoveRef.current(toast.id), 300);
				return;
			}
			rafRef.current = requestAnimationFrame(tick);
		}

		rafRef.current = requestAnimationFrame(tick);
	}

	function handleClose() {
		setVisible(false);
		setTimeout(() => onRemoveRef.current(toast.id), 300);
	}

	const style = STYLES[toast.type];
	const Icon = ICONS[toast.type];

	return (
		<div
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			className={`
            relative flex items-start gap-3 w-full sm:w-85 rounded-2xl border shadow-xl shadow-black/5
            px-4 py-3.5 overflow-hidden cursor-default select-none pointer-events-auto
            transition-all duration-300 ease-out
            ${style.bg} ${style.border}
            ${visible
					? "opacity-100 translate-y-0 sm:translate-x-0"
					: ANIMATION_STYLES[position]
				}
          `}
		>
			{/* Progress bar */}
			<div
				className={`absolute bottom-0 left-0 h-0.5 ${style.bar} transition-none rounded-b-2xl`}
				style={{ width: `${progress}%` }}
			/>

			{/* Icon */}
			<Icon size={18} className={`${style.icon} shrink-0 mt-0.5`} />

			{/* Text */}
			<div className="flex-1 min-w-0 break-words">
				<p className="text-sm font-semibold text-gray-800 Regal leading-tight">{toast.title}</p>
				{toast.message && (
					<p className="text-xs text-gray-500 mt-0.5 leading-snug">{toast.message}</p>
				)}
			</div>

			{/* Close Button — 💡 Diperbesar area tap-nya (p-1.5) agar mudah ditekan jari di HP */}
			<button
				onClick={handleClose}
				className="shrink-0 p-1.5 -mt-1 -mr-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors active:bg-gray-200"
			>
				<X size={15} />
			</button>
		</div>
	);
}

// ─── Container ────────────────────────────────────────────────────────────────

interface ToastContainerProps {
	toasts: ToastData[];
	onRemove: (id: string) => void;
	position?: ToastPosition;
}

// 💡 Penataan layout kontainer yang fleksibel dan aman di perangkat mobile
const CONTAINER_POSITION_STYLES: Record<ToastPosition, string> = {
	"top-left": "top-0 left-0 right-0 p-4 sm:top-5 sm:left-5 sm:right-auto sm:p-0 sm:items-start flex-col-reverse",
	"top-center": "top-0 left-0 right-0 p-4 sm:top-5 sm:left-1/2 sm:-translate-x-1/2 sm:p-0 sm:items-center flex-col-reverse",
	"top-right": "top-0 left-0 right-0 p-4 sm:top-5 sm:right-5 sm:left-auto sm:p-0 sm:items-end flex-col-reverse",
	"bottom-left": "bottom-0 left-0 right-0 p-4 sm:bottom-5 sm:left-5 sm:right-auto sm:p-0 sm:items-start flex-col",
	"bottom-center": "bottom-0 left-0 right-0 p-4 sm:bottom-5 sm:left-1/2 sm:-translate-x-1/2 sm:p-0 sm:items-center flex-col",
	"bottom-right": "bottom-0 left-0 right-0 p-4 sm:bottom-5 sm:right-5 sm:left-auto sm:p-0 sm:items-end flex-col",
};

export function ToastContainer({ toasts, onRemove, position = "bottom-right" }: ToastContainerProps) {
	return (
		<div
			// 💡 pointer-events-none: Mencegah kontainer kosong menghalangi klik ke tombol/input di bawahnya
			className={`fixed z-9999 flex gap-2.5 max-h-screen pointer-events-none sm:w-85 ${CONTAINER_POSITION_STYLES[position]}`}
		>
			{toasts.map((t) => (
				<ToastItem key={t.id} toast={t} onRemove={onRemove} position={position} />
			))}
		</div>
	);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
	const [toasts, setToasts] = useState<ToastData[]>([]);

	const remove = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const toast = useCallback((data: Omit<ToastData, "id">) => {
		const id = Math.random().toString(36).slice(2);
		setToasts((prev) => [...prev, { ...data, id }]);
	}, []);

	return { toasts, toast, remove };
}