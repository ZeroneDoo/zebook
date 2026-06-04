import { AlertTriangle, Pencil, Plus, Tag, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { kategori } from "@/app/generated/prisma/client";

type ToastFn = ReturnType<typeof useToast>["toast"];

interface FormKategoriData {
	nama_kategori: string;
}

export function TambahKategoriModal({
	onClose,
	onSuccess,
	toast
}: {
	onClose: () => void;
	onSuccess?: () => void;
	toast: ToastFn;
}) {
	const [form, setForm] = useState<FormKategoriData>({
		nama_kategori: "",
	});
	const [errors, setErrors] = useState<Partial<FormKategoriData>>({});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	function validate() {
		const e: Partial<FormKategoriData> = {};
		if (!form.nama_kategori.trim()) e.nama_kategori = "Nama kategori wajib diisi";
		else if (form.nama_kategori.length > 50) e.nama_kategori = "Maksimal 50 karakter";

		setErrors(e);
		return Object.keys(e).length === 0;
	}

	function handleChange(value: string) {
		setForm({ nama_kategori: value });
		if (errors.nama_kategori) setErrors({});
	}

	async function handleSubmit() {
		if (!validate()) return;
		setLoading(true);

		try {
			const res = await fetch("/api/kategori", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});

			const json = await res.json();

			if (!res.ok) {
				toast({ type: "error", title: "Gagal menyimpan", message: json.error ?? "Terjadi kesalahan." });
				return;
			}

			setSuccess(true);
			toast({ type: "success", title: "Kategori ditambahkan!", message: `${form.nama_kategori} berhasil disimpan.` });
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
						<h2 className="text-base font-bold text-gray-900">Tambah Kategori</h2>
						<p className="text-xs text-gray-400 mt-0.5">Buat kategori klasifikasi baru</p>
					</div>
					<button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
						<X size={18} />
					</button>
				</div>

				{/* Body */}
				<div className="px-6 py-5 space-y-4">
					<div>
						<label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Kategori <span className="text-[#E8461E]">*</span></label>
						<div className={`flex items-center gap-2.5 border rounded-xl px-3.5 py-2.5 transition-all ${errors.nama_kategori ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus-within:border-[#E8461E] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100"}`}>
							<Tag size={15} className="text-gray-400 shrink-0" />
							<input
								type="text"
								maxLength={50}
								placeholder="Contoh: Fiksi, Sains, Sejarah"
								value={form.nama_kategori}
								onChange={(e) => handleChange(e.target.value)}
								className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
							/>
							<span className="text-xs text-gray-300 shrink-0">{form.nama_kategori.length}/50</span>
						</div>
						{errors.nama_kategori && <p className="mt-1 text-xs text-red-500">{errors.nama_kategori}</p>}
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
						{loading ? "Menyimpan…" : success ? "✓ Tersimpan" : <><Plus size={15} /> Tambah Kategori</>}
					</button>
				</div>
			</div>
		</div>
	);
}

export function EditKategoriModal({
	kategori,
	onClose,
	onSuccess,
	toast,
}: {
	kategori: kategori;
	onClose: () => void;
	onSuccess?: () => void;
	toast: ToastFn;
}) {
	const [form, setForm] = useState<FormKategoriData>({
		nama_kategori: kategori.nama_kategori ?? "",
	});
	const [errors, setErrors] = useState<Partial<FormKategoriData>>({});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	function validate() {
		const e: Partial<FormKategoriData> = {};
		if (!form.nama_kategori.trim()) e.nama_kategori = "Nama kategori wajib diisi";
		else if (form.nama_kategori.length > 50) e.nama_kategori = "Maksimal 50 karakter";

		setErrors(e);
		return Object.keys(e).length === 0;
	}

	function handleChange(value: string) {
		setForm({ nama_kategori: value });
		if (errors.nama_kategori) setErrors({});
	}

	async function handleSubmit() {
		if (!validate()) return;
		setLoading(true);

		try {
			const res = await fetch(`/api/kategori/${kategori.id_kategori}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});

			const json = await res.json();

			if (!res.ok) {
				toast({ type: "error", title: "Gagal menyimpan", message: json.error ?? "Terjadi kesalahan." });
				return;
			}

			setSuccess(true);
			toast({ type: "success", title: "Perubahan disimpan!", message: "Nama kategori berhasil diperbarui." });
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
						<h2 className="text-base font-bold text-gray-900">Edit Kategori</h2>
						<p className="text-xs text-gray-400 mt-0.5">
							ID: <span className="font-mono text-gray-500">{kategori.id_kategori}</span>
						</p>
					</div>
					<button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
						<X size={18} />
					</button>
				</div>

				{/* Body */}
				<div className="px-6 py-5 space-y-4">
					<div>
						<label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Kategori <span className="text-[#E8461E]">*</span></label>
						<div className={`flex items-center gap-2.5 border rounded-xl px-3.5 py-2.5 transition-all ${errors.nama_kategori ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus-within:border-[#E8461E] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100"}`}>
							<Tag size={15} className="text-gray-400 shrink-0" />
							<input
								type="text"
								maxLength={50}
								placeholder="Nama kategori"
								value={form.nama_kategori}
								onChange={(e) => handleChange(e.target.value)}
								className="flex-1 bg-transparent text-sm text-gray-800 outline-none"
							/>
						</div>
						{errors.nama_kategori && <p className="mt-1 text-xs text-red-500">{errors.nama_kategori}</p>}
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

export function DeleteKategoriModal({ // Berubah nama fungsi menyesuaikan import di page
	kategori,
	onClose,
	onSuccess,
	toast,
}: {
	kategori: kategori;
	onClose: () => void;
	onSuccess?: () => void;
	toast: ToastFn;
}) {
	const [loading, setLoading] = useState(false);

	async function handleDelete() {
		setLoading(true);
		try {
			const res = await fetch(`/api/kategori/${kategori.id_kategori}`, {
				method: "DELETE",
			});

			if (!res.ok) {
				toast({ type: "error", title: "Gagal menghapus", message: "Terjadi kesalahan saat menghapus data." });
				onClose();
				return;
			}

			toast({ type: "success", title: "Kategori dihapus", message: "Kategori berhasil dihapus secara permanen." });
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
							<h2 className="text-base font-bold text-gray-900">Hapus Kategori</h2>
							<p className="text-xs text-gray-400 mt-0.5">Tindakan ini permanen</p>
						</div>
					</div>
					<button onClick={onClose} disabled={loading} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
						<X size={18} />
					</button>
				</div>

				<div className="px-6 py-5">
					<p className="text-sm text-gray-600 leading-relaxed">Apakah kamu yakin ingin menghapus kategori berikut?</p>
					<div className="mt-4 flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
						<div className="flex items-center gap-2.5 min-w-0">
							<Tag size={16} className="text-[#E8461E] shrink-0" />
							<span className="text-sm font-semibold text-gray-800 truncate">{kategori.nama_kategori}</span>
						</div>
						<span className="font-mono text-xs bg-white border border-gray-200 text-gray-500 px-2 py-1 rounded-lg shrink-0 ml-2">
							{kategori.id_kategori}
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

// Tambahan alias export untuk mencegah error mis-import penamaan di halaman utama