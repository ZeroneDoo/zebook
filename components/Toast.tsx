"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warning" | "info";

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

// ─── ToastItem ────────────────────────────────────────────────────────────────

function ToastItem({
	toast,
	onRemove,
}: {
	toast: ToastData;
	onRemove: (id: string) => void;
}) {
	const duration = toast.duration ?? 4000;
	const [visible, setVisible] = useState(false);
	const [progress, setProgress] = useState(100);

	// Stable ref for onRemove — never causes re-runs when parent re-renders
	const onRemoveRef = useRef(onRemove);
	useEffect(() => { onRemoveRef.current = onRemove; }, [onRemove]);

	const rafRef = useRef<number | null>(null);
	const pausedRef = useRef(false);
	const remainingRef = useRef(duration);
	const startRef = useRef<number | null>(null);

	// Slide in on mount
	useEffect(() => {
		const t = setTimeout(() => setVisible(true), 10);
		return () => clearTimeout(t);
	}, []); // ← empty: runs once on mount only

	// Countdown — also runs once on mount only
	// Uses refs for everything so no dependency churn
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
	}, []); // ← empty: timer starts once, never restarts due to re-renders

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
        relative flex items-start gap-3 w-full sm:w-80 rounded-2xl border shadow-lg shadow-black/5
        px-4 py-3.5 overflow-hidden cursor-default select-none
        transition-all duration-300 ease-out
        ${style.bg} ${style.border}
        ${visible
					? "opacity-100 translate-y-0 sm:translate-x-0"
					: "opacity-0 translate-y-4 sm:translate-y-0 sm:translate-x-8"}
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
			<div className="flex-1 min-w-0">
				<p className="text-sm font-semibold text-gray-800 leading-tight">{toast.title}</p>
				{toast.message && (
					<p className="text-xs text-gray-400 mt-0.5 leading-snug">{toast.message}</p>
				)}
			</div>

			{/* Close */}
			<button
				onClick={handleClose}
				className="shrink-0 p-0.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors"
			>
				<X size={14} />
			</button>
		</div>
	);
}

// ─── Container ────────────────────────────────────────────────────────────────

interface ToastContainerProps {
	toasts: ToastData[];
	onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
	return (
		<div className="fixed z-9999 flex flex-col gap-2 sm:gap-2.5
      bottom-0 left-0 right-0 p-3 items-stretch
      sm:bottom-5 sm:right-5 sm:left-auto sm:p-0 sm:w-80 sm:items-end"
		>
			{toasts.map((t) => (
				<ToastItem key={t.id} toast={t} onRemove={onRemove} />
			))}
		</div>
	);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
	const [toasts, setToasts] = useState<ToastData[]>([]);

	// Stable reference — never changes, so ToastItem's onRemoveRef
	// always points to the latest version without triggering re-runs
	const remove = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const toast = useCallback((data: Omit<ToastData, "id">) => {
		const id = Math.random().toString(36).slice(2);
		setToasts((prev) => [...prev, { ...data, id }]);
	}, []);

	return { toasts, toast, remove };
}