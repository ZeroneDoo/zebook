"use client";

import { useState } from "react";
import { X, CheckCircle, XCircle, RefreshCw, AlertTriangle } from "lucide-react";
import { useToast } from "../Toast";
import { PeminjamanBukuModel } from "@/lib/models";

type ToastFn = ReturnType<typeof useToast>["toast"];

interface ModalProps {
	data: PeminjamanBukuModel; 
	onClose: () => void;
	onSuccess: () => void;
	toast: ToastFn;
}

// 1. MODAL KONFIRMASI (TERIMA / TOLAK REQUEST)
export function KonfirmasiPeminjamanModal({ data, onClose, onSuccess, toast }: ModalProps) {
	const [loading, setLoading] = useState(false);

	const handleDecision = async (keputusan: "DITERIMA" | "DITOLAK") => {
		setLoading(true);
		try {
			const res = await fetch("/api/peminjaman-buku", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "konfirmasi", id_peminjaman: data.id_peminjaman, keputusan }),
			});
			const json = await res.json();

			if (!res.ok) throw new Error(json.error || "Gagal memproses konfirmasi");

			toast({ title: "Berhasil!", message: json.message, type: "success" });
			onSuccess();
			onClose();
		} catch (err: unknown) {
			toast({ title: "Gagal", message: (err as Error).message, type: "error" });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
			<div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
					<h2 className="text-sm font-bold text-gray-900">Konfirmasi Permintaan Pinjam</h2>
					<button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
				</div>
				<div className="p-6 space-y-4">
					<div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-sm space-y-1.5 text-gray-700">
						<p><strong>ID:</strong> {data.id_peminjaman}</p>
						<p><strong>Peminjam:</strong> {data.pengguna?.nama_pengguna}</p>
						<p><strong>Buku:</strong> {data.detail_buku?.buku?.judul}</p>
						<p><strong>Metode Pembayaran:</strong> {data.metode} ({data.metode === "KOIN" ? `${data.koin_reward} Koin` : "Stamp Buku"})</p>
					</div>
					<p className="text-xs text-gray-400 text-center">Menolak peminjaman ini akan membatalkan penguncian buku, sedangkan menerima akan memotong saldo pengguna.</p>
				</div>
				<div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
					<button
						onClick={() => handleDecision("DITOLAK")}
						disabled={loading}
						className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50"
					>
						<XCircle size={16} /> Tolak
					</button>
					<button
						onClick={() => handleDecision("DITERIMA")}
						disabled={loading}
						className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-500 hover:bg-green-600 active:scale-95 transition-all disabled:opacity-50"
					>
						<CheckCircle size={16} /> Terima & Pinjamkan
					</button>
				</div>
			</div>
		</div>
	);
}

// 2. MODAL PROSES PENGEMBALIAN & DENDA
export function ProsesPengembalianModal({ data, onClose, onSuccess, toast }: ModalProps) {
	const [dendaKoin, setDendaKoin] = useState("0");
	const [loading, setLoading] = useState(false);

	// Deteksi keterlambatan secara visual di UI modal
	const IsTerlambat = new Date() > new Date(data.tgl_kembali);

	const handleReturn = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			const res = await fetch("/api/peminjaman-buku", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "pengembalian", id_peminjaman: data.id_peminjaman, denda_koin: dendaKoin }),
			});
			const json = await res.json();

			if (!res.ok) throw new Error(json.error || "Gagal memproses pengembalian");

			toast({ title: "Berhasil!", message: json.message, type: "success" });
			onSuccess();
			onClose();
		} catch (err: unknown) {
			toast({ title: "Gagal Proses", message: (err as Error).message, type: "error" });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
			<form onSubmit={handleReturn} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
					<h2 className="text-sm font-bold text-gray-900">Proses Pengembalian Buku</h2>
					<button type="button" onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
				</div>
				<div className="p-6 space-y-4">
					{IsTerlambat && (
						<div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-medium">
							<AlertTriangle size={16} className="shrink-0 mt-0.5" />
							<div>Peminjaman melewati batas tanggal kembali! Prosedur mengharuskan pengisian nilai denda koin jika ada.</div>
						</div>
					)}
					<div className="space-y-2">
						<label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Input Nominal Denda Koin</label>
						<input
							type="number"
							min="0"
							value={dendaKoin}
							onChange={(e) => setDendaKoin(e.target.value)}
							className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E8461E]/20 focus:border-[#E8461E]"
							placeholder="0"
							required
						/>
						<p className="text-[11px] text-gray-400">Jika pengembalian tepat waktu, denda diisi 0 dan user akan mendapat Stamp Reward.</p>
					</div>
				</div>
				<div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
					>
						Batal
					</button>
					<button
						type="submit"
						disabled={loading}
						className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#E8461E] hover:bg-orange-600 active:scale-95 shadow-md shadow-orange-100 transition-all disabled:opacity-50"
					>
						<RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Proses Masuk Buku
					</button>
				</div>
			</form>
		</div>
	);
}