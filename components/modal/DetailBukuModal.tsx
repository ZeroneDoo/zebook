import { AlertTriangle, Plus, Sliders, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";
import { detail_buku, detail_buku_status } from "@/app/generated/prisma/client";
import { DetailBukuModel } from "@/lib/models";
import { detailBukuStatus } from "@/lib/enums";

type ToastFn = ReturnType<typeof useToast>["toast"];

interface MasterBuku {
	id_buku: string;
	judul: string;
}

export function TambahDetailBukuModal({
	onClose,
	onSuccess,
	toast
}: {
	onClose: () => void;
	onSuccess?: () => void;
	toast: ToastFn;
}) {
	const [bukuOptions, setBukuOptions] = useState<MasterBuku[]>([]);
	const [selectedIdBuku, setSelectedIdBuku] = useState("");
	const [jumlah, setJumlah] = useState("1");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	// Mengambil data master buku untuk dihubungkan
	useEffect(() => {
		fetch("/api/buku")
			.then((res) => res.json())
			.then((json) => { if (json.data) setBukuOptions(json.data); })
			.catch((err) => console.error("Gagal load katalog buku:", err));
	}, []);

	async function handleSubmit() {
		if (!selectedIdBuku) {
			toast({ type: "error", title: "Validasi Gagal", message: "Silakan pilih katalog buku utama." });
			return;
		}
		if (Number(jumlah) <= 0 || isNaN(Number(jumlah))) {
			toast({ type: "error", title: "Validasi Gagal", message: "Jumlah generate minimal 1 item." });
			return;
		}

		setLoading(true);
		try {
			const res = await fetch("/api/detail-buku", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id_buku: selectedIdBuku,
					jumlah: parseInt(jumlah)
				}),
			});

			const json = await res.json();
			if (!res.ok) throw new Error(json.error);

			setSuccess(true);
			toast({ type: "success", title: "Unit Ter-generate!", message: `${jumlah} unit salinan berhasil diproduksi oleh Stored Procedure.` });
			setTimeout(() => { onSuccess?.(); onClose(); }, 1200);
		} catch (err: unknown) {
			toast({ type: "error", title: "Eksekusi SP Gagal", message: (err as Error).message || "Terjadi galat internal." });
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
			<div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
					<div>
						<h2 className="text-base font-bold text-gray-900">Generate Unit Buku</h2>
						<p className="text-xs text-gray-400 mt-0.5">Memasukkan unit buku baru ke sistem</p>
					</div>
					<button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X size={18} /></button>
				</div>

				<div className="px-6 py-5 space-y-4 text-sm">
					{/* Pilih Buku Utama */}
					<div>
						<label className="block text-xs font-semibold text-gray-600 mb-1.5">Hubungkan ke Buku <span className="text-[#E8461E]">*</span></label>
						<select
							value={selectedIdBuku}
							onChange={(e) => setSelectedIdBuku(e.target.value)}
							className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 outline-none focus:bg-white focus:border-[#E8461E]"
						>
							<option value="">-- Pilih Buku --</option>
							{bukuOptions.map((b) => (
								<option key={b.id_buku} value={b.id_buku}>
									[{b.id_buku}] {b.judul}
								</option>
							))}
						</select>
					</div>

					{/* Input Jumlah Unit Salinan */}
					<div>
						<label className="block text-xs font-semibold text-gray-600 mb-1.5">Jumlah Unit <span className="text-[#E8461E]">*</span></label>
						<input
							type="number"
							min="1"
							max="50"
							value={jumlah}
							onChange={(e) => setJumlah(e.target.value)}
							className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-[#E8461E]"
							placeholder="Contoh: 5"
						/>
						{/* <p className="text-[11px] text-gray-400 mt-1 italic">Sistem akan otomatis menghitung penomoran ID (Format: DBxx) lewat Looping MySQL SP</p> */}
					</div>
				</div>

				<div className="px-6 py-3 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
					<button onClick={onClose} className="px-4 py-2 rounded-xl font-semibold text-gray-500 hover:bg-gray-100">Batal</button>
					<button
						onClick={handleSubmit}
						disabled={loading || success}
						className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-white shadow-md transition-all ${success ? "bg-emerald-500 shadow-emerald-200" : "bg-[#E8461E] hover:bg-orange-600 disabled:opacity-50"}`}
					>
						{loading ? "Memproses…" : success ? "✓ Berhasil" : <><Plus size={15} /> Tambah Detail</>}
					</button>
				</div>
			</div>
		</div>
	);
}

export function EditDetailBukuModal({
	item,
	onClose,
	onSuccess,
	toast,
}: {
	item: DetailBukuModel;
	onClose: () => void;
	onSuccess?: () => void;
	toast: ToastFn;
}) {
	const [status, setStatus] = useState(item.status);
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	async function handleUpdate() {
		setLoading(true);
		try {
			const res = await fetch(`/api/detail-buku/${item.id_detail_buku}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status }),
			});

			const json = await res.json();
			if (!res.ok) throw new Error(json.error);

			setSuccess(true);
			toast({ type: "success", title: "Status Ter-update", message: `ID unit ${item.id_detail_buku} sukses disetel ke ${status}.` });
			setTimeout(() => { onSuccess?.(); onClose(); }, 1200);
		} catch (err: unknown) {
			toast({ type: "error", title: "Gagal Mengubah Status", message: (err as Error).message || "Prosedur SQL mendeteksi kesalahan." });
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
			<div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
					<div>
						<h2 className="text-base font-bold text-gray-900">Ubah Status Unit</h2>
						<p className="text-xs text-gray-400 mt-0.5">Unit ID: <span className="font-mono text-gray-600 font-bold">{item.id_detail_buku}</span></p>
					</div>
					<button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X size={18} /></button>
				</div>

				<div className="px-6 py-4 space-y-4 text-sm">
					<div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
						<span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide">Buku Terkait</span>
						<span className="text-gray-700 font-medium line-clamp-2 mt-0.5">{item.buku.judul}</span>
					</div>

					<div>
						<label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1"><Sliders size={13} /> Pilih Status Terkini</label>
						<select
							value={status}
							onChange={(e) => setStatus(e.target.value as detail_buku_status)}
							className="w-full border border-gray-200 bg-white rounded-xl px-3 py-2.5 outline-none focus:border-[#E8461E]"
						>
							{Object.values(detailBukuStatus).map((s) => (
								<option key={s} value={s}>
									{s}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="px-6 py-3 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50/50">
					<button onClick={onClose} className="px-4 py-2 rounded-xl font-semibold text-gray-500 hover:bg-gray-100">Batal</button>
					<button
						onClick={handleUpdate}
						disabled={loading || success}
						className={`px-5 py-2 rounded-xl font-semibold text-white shadow-md transition-all ${success ? "bg-emerald-500 shadow-emerald-200" : "bg-[#E8461E] hover:bg-orange-600"}`}
					>
						{loading ? "Menyimpan…" : success ? "✓ Diperbarui" : "Simpan Perubahan"}
					</button>
				</div>
			</div>
		</div>
	);
}

export function DeleteDetailBukuModal({
	item,
	onClose,
	onSuccess,
	toast,
}: {
	item: DetailBukuModel;
	onClose: () => void;
	onSuccess?: () => void;
	toast: ToastFn;
}) {
	const [loading, setLoading] = useState(false);

	async function handleDelete() {
		setLoading(true);
		try {
			const res = await fetch(`/api/detail-buku/${item.id_detail_buku}`, { method: "DELETE" });
			if (!res.ok) throw new Error();

			toast({ type: "success", title: "Item Dihapus", message: "Satu salinan buku berhasil dimusnahkan dari data fisik." });
			onSuccess?.();
			onClose();
		} catch {
			toast({ type: "error", title: "Gagal Menghapus", message: "Salinan terkunci oleh foreign key transaksi." });
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && !loading && onClose()}>
			<div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500"><AlertTriangle size={16} /></div>
						<h2 className="text-sm font-bold text-gray-900">Hapus Unit Salinan</h2>
					</div>
					<button onClick={onClose} disabled={loading} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X size={16} /></button>
				</div>
				<div className="px-6 py-4 text-sm text-gray-600">
					<p>Apakah Anda yakin menghapus unit salinan spesifik ini?</p>
					<div className="mt-3 p-3 bg-red-50/50 border border-red-100 rounded-xl flex items-center justify-between">
						<span className="font-mono text-xs font-bold text-red-700 bg-white border px-2 py-1 rounded shadow-sm">{item.id_detail_buku}</span>
						<span className="text-xs text-gray-400 font-mono truncate max-w-[180px]">Ref: {item.id_buku}</span>
					</div>
				</div>
				<div className="px-6 py-3 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
					<button onClick={onClose} disabled={loading} className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-lg">Batal</button>
					<button onClick={handleDelete} disabled={loading} className="px-4 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg">{loading ? "Menghapus…" : "Ya, Lenyapkan"}</button>
				</div>
			</div>
		</div>
	);
}