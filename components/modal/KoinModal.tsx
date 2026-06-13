import { AlertTriangle, Coins, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { koin } from "@/app/generated/prisma/client";
import { formatRupiah } from "@/lib/formats";

type ToastFn = ReturnType<typeof useToast>["toast"];

interface FormKoinData {
	jum_koin: string;
	harga: string;
}

export function TambahKoinModal({
	onClose,
	onSuccess,
	toast
}: {
	onClose: () => void;
	onSuccess?: () => void;
	toast: ToastFn;
}) {
	const [form, setForm] = useState<FormKoinData>({
		jum_koin: "",
		harga: "",
	});
	const [errors, setErrors] = useState<Partial<FormKoinData>>({});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	function validate() {
		const e: Partial<FormKoinData> = {};
		if (!form.jum_koin || Number(form.jum_koin) <= 0) e.jum_koin = "Jumlah koin harus lebih besar dari 0";
		if (!form.harga || Number(form.harga) < 0) e.harga = "Harga tidak boleh negatif";

		setErrors(e);
		return Object.keys(e).length === 0;
	}

	function handleChange(field: keyof FormKoinData, value: string) {
		setForm((f) => ({ ...f, [field]: value }));
		if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
	}

	async function handleSubmit() {
		if (!validate()) return;
		setLoading(true);

		try {
			const res = await fetch("/api/koin", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					jum_koin: parseInt(form.jum_koin),
					harga: parseFloat(form.harga)
				}),
			});

			const json = await res.json();

			if (!res.ok) {
				toast({ type: "error", title: "Gagal menyimpan", message: json.error ?? "Terjadi kesalahan." });
				return;
			}

			setSuccess(true);
			toast({ type: "success", title: "Paket koin ditambahkan!", message: "Berhasil menyimpan paket koin baru." });
			setTimeout(() => { onSuccess?.(); onClose(); }, 1200);
		} catch {
			toast({ type: "error", title: "Koneksi gagal", message: "Gagal terhubung ke server." });
		} finally {
			setLoading(false);
		}
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
			onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
		>
			<div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
					<div>
						<h2 className="text-base font-bold text-gray-900">Tambah Paket Koin</h2>
						<p className="text-xs text-gray-400 mt-0.5">Isi detail kuantitas dan nominal harga</p>
					</div>
					<button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
						<X size={18} />
					</button>
				</div>

				{/* Body */}
				<div className="px-6 py-5 space-y-4">
					{/* Jumlah Koin */}
					<div>
						<label className="block text-xs font-semibold text-gray-600 mb-1.5">Jumlah Koin <span className="text-[#E8461E]">*</span></label>
						<div className={`flex items-center gap-2.5 border rounded-xl px-3.5 py-2.5 transition-all ${errors.jum_koin ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus-within:border-[#E8461E] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100"}`}>
							<Coins size={15} className="text-amber-500 shrink-0" />
							<input
								type="number"
								placeholder="Contoh: 100"
								value={form.jum_koin}
								onChange={(e) => handleChange("jum_koin", e.target.value)}
								className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
							/>
						</div>
						{errors.jum_koin && <p className="mt-1 text-xs text-red-500">{errors.jum_koin}</p>}
					</div>

					{/* Harga */}
					<div>
						<label className="block text-xs font-semibold text-gray-600 mb-1.5">Harga Rupiah (IDR) <span className="text-[#E8461E]">*</span></label>
						<div className={`flex items-center gap-2.5 border rounded-xl px-3.5 py-2.5 transition-all ${errors.harga ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus-within:border-[#E8461E] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100"}`}>
							<span className="text-gray-400 text-xs font-bold shrink-0">Rp</span>
							<input
								type="number"
								step="0.01"
								placeholder="Contoh: 15000"
								value={form.harga}
								onChange={(e) => handleChange("harga", e.target.value)}
								className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
							/>
						</div>
						{errors.harga && <p className="mt-1 text-xs text-red-500">{errors.harga}</p>}
					</div>
				</div>

				{/* Footer */}
				<div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
					<button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors">Batal</button>
					<button
						onClick={handleSubmit}
						disabled={loading || success}
						className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white shadow-md transition-all ${success ? "bg-emerald-500 shadow-emerald-200" : "bg-[#E8461E] hover:bg-orange-600 active:scale-95 shadow-orange-200"}`}
					>
						{loading ? "Menyimpan…" : success ? "✓ Tersimpan" : <><Plus size={15} /> Tambah Koin</>}
					</button>
				</div>
			</div>
		</div>
	);
}

export function EditKoinModal({
	koin,
	onClose,
	onSuccess,
	toast,
}: {
	koin: koin;
	onClose: () => void;
	onSuccess?: () => void;
	toast: ToastFn;
}) {
	const [form, setForm] = useState<FormKoinData>({
		jum_koin: koin.jum_koin?.toString() || "0",
		harga: koin.harga?.toString() || "0.00",
	});
	const [errors, setErrors] = useState<Partial<FormKoinData>>({});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	function validate() {
		const e: Partial<FormKoinData> = {};
		if (!form.jum_koin || Number(form.jum_koin) <= 0) e.jum_koin = "Jumlah koin harus lebih besar dari 0";
		if (!form.harga || Number(form.harga) < 0) e.harga = "Harga tidak boleh negatif";

		setErrors(e);
		return Object.keys(e).length === 0;
	}

	function handleChange(field: keyof FormKoinData, value: string) {
		setForm((f) => ({ ...f, [field]: value }));
		if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
	}

	async function handleSubmit() {
		if (!validate()) return;
		setLoading(true);

		try {
			const res = await fetch(`/api/koin/${koin.id_koin}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					jum_koin: parseInt(form.jum_koin),
					harga: parseFloat(form.harga)
				}),
			});

			const json = await res.json();

			if (!res.ok) {
				toast({ type: "error", title: "Gagal menyimpan", message: json.error ?? "Terjadi kesalahan." });
				return;
			}

			setSuccess(true);
			toast({ type: "success", title: "Perubahan disimpan!", message: "Paket koin berhasil diperbarui." });
			setTimeout(() => { onSuccess?.(); onClose(); }, 1200);
		} catch {
			toast({ type: "error", title: "Koneksi gagal", message: "Tidak dapat terhubung ke server." });
		} finally {
			setLoading(false);
		}
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
			onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
		>
			<div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
					<div>
						<h2 className="text-base font-bold text-gray-900">Edit Paket Koin</h2>
						<p className="text-xs text-gray-400 mt-0.5">
							ID: <span className="font-mono text-gray-500">{koin.id_koin}</span>
						</p>
					</div>
					<button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
						<X size={18} />
					</button>
				</div>

				{/* Body */}
				<div className="px-6 py-5 space-y-4">
					{/* Jumlah Koin */}
					<div>
						<label className="block text-xs font-semibold text-gray-600 mb-1.5">Jumlah Koin <span className="text-[#E8461E]">*</span></label>
						<div className={`flex items-center gap-2.5 border rounded-xl px-3.5 py-2.5 transition-all ${errors.jum_koin ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus-within:border-[#E8461E] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100"}`}>
							<Coins size={15} className="text-amber-500 shrink-0" />
							<input
								type="number"
								placeholder="Jumlah koin"
								value={form.jum_koin}
								onChange={(e) => handleChange("jum_koin", e.target.value)}
								className="flex-1 bg-transparent text-sm text-gray-800 outline-none"
							/>
						</div>
						{errors.jum_koin && <p className="mt-1 text-xs text-red-500">{errors.jum_koin}</p>}
					</div>

					{/* Harga */}
					<div>
						<label className="block text-xs font-semibold text-gray-600 mb-1.5">Harga Rupiah (IDR) <span className="text-[#E8461E]">*</span></label>
						<div className={`flex items-center gap-2.5 border rounded-xl px-3.5 py-2.5 transition-all ${errors.harga ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus-within:border-[#E8461E] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100"}`}>
							<span className="text-gray-400 text-xs font-bold shrink-0">Rp</span>
							<input
								type="number"
								step="0.01"
								placeholder="Harga"
								value={form.harga}
								onChange={(e) => handleChange("harga", e.target.value)}
								className="flex-1 bg-transparent text-sm text-gray-800 outline-none"
							/>
						</div>
						{errors.harga && <p className="mt-1 text-xs text-red-500">{errors.harga}</p>}
					</div>
				</div>

				{/* Footer */}
				<div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
					<button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors">Batal</button>
					<button
						onClick={handleSubmit}
						disabled={loading || success}
						className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white shadow-md transition-all ${success ? "bg-emerald-500 shadow-emerald-200" : "bg-[#E8461E] hover:bg-orange-600 active:scale-95 shadow-orange-200"}`}
					>
						{loading ? "Menyimpan…" : success ? "✓ Tersimpan" : <><Pencil size={15} /> Simpan Perubahan</>}
					</button>
				</div>
			</div>
		</div>
	);
}

export function DeleteKoinModal({
	koin,
	onClose,
	onSuccess,
	toast,
}: {
	koin: koin;
	onClose: () => void;
	onSuccess?: () => void;
	toast: ToastFn;
}) {
	const [loading, setLoading] = useState(false);

	async function handleDelete() {
		setLoading(true);
		try {
			const res = await fetch(`/api/koin/${koin.id_koin}`, {
				method: "DELETE",
			});

			if (!res.ok) {
				toast({ type: "error", title: "Gagal menghapus", message: "Terjadi kesalahan sistem saat menghapus." });
				onClose();
				return;
			}

			toast({ type: "success", title: "Paket koin dihapus", message: "Paket koin berhasil dihapus secara permanen." });
			onSuccess?.();
			onClose();
		} catch {
			toast({ type: "error", title: "Koneksi gagal", message: "Tidak dapat terhubung ke server." });
		} finally {
			setLoading(false);
		}
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
			onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
		>
			<div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
				<div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
					<div className="flex items-center gap-3">
						<div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
							<AlertTriangle size={18} className="text-red-500" />
						</div>
						<div>
							<h2 className="text-base font-bold text-gray-900">Hapus Paket Koin</h2>
							<p className="text-xs text-gray-400 mt-0.5">Tindakan ini permanen</p>
						</div>
					</div>
					<button onClick={onClose} disabled={loading} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
						<X size={18} />
					</button>
				</div>

				<div className="px-6 py-5">
					<p className="text-sm text-gray-600 leading-relaxed">Apakah kamu yakin ingin menghapus paket koin berikut?</p>
					<div className="mt-4 flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
						<div className="flex items-center gap-2.5">
							<Coins size={16} className="text-amber-500" />
							<span className="text-sm font-bold text-gray-800">{formatRupiah(Number(koin.jum_koin))} Koin</span>
						</div>
						<span className="font-mono text-xs bg-white border border-gray-200 text-gray-500 px-2 py-1 rounded-lg shrink-0">
							{koin.id_koin}
						</span>
					</div>
				</div>

				<div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
					<button onClick={onClose} disabled={loading} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors">Batal</button>
					<button
						onClick={handleDelete}
						disabled={loading}
						className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 active:scale-95 shadow-md shadow-red-200 transition-all"
					>
						{loading ? "Menghapus…" : <><Trash2 size={15} /> Ya, Hapus</>}
					</button>
				</div>
			</div>
		</div>
	);
}