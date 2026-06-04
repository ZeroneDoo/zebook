import { AlertTriangle, BookOpen, Building, Layers, Pencil, Plus, User, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";
import { buku } from "@/app/generated/prisma/client";

type ToastFn = ReturnType<typeof useToast>["toast"];

interface FormBukuData {
	judul: string;
	deskripsi: string;
	stok: string;
	koin: string;
	stamp: string;
	penerbit: string;
	penulis: string;
	thn_terbit: string;
	selectedKategori: string[]; // Menyimpan array ID kategori yang dipilih
}

// Interface ringkas untuk mengambil opsi kategori dari API Kategori sebelumnya
interface KategoriOption {
	id_kategori: string;
	nama_kategori: string;
}

export function TambahBukuModal({
	onClose,
	onSuccess,
	toast
}: {
	onClose: () => void;
	onSuccess?: () => void;
	toast: ToastFn;
}) {
	const [form, setForm] = useState<FormBukuData>({
		judul: "",
		deskripsi: "",
		stok: "0",
		koin: "0",
		stamp: "0",
		penerbit: "",
		penulis: "",
		thn_terbit: new Date().getFullYear().toString(),
		selectedKategori: [],
	});

	const [kategoriOptions, setKategoriOptions] = useState<KategoriOption[]>([]);
	const [errors, setErrors] = useState<Partial<FormBukuData>>({});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	// Load daftar kategori dari API menu Kategori yang dibuat sebelumnya
	useEffect(() => {
		fetch("/api/kategori")
			.then((res) => res.json())
			.then((json) => { if (json.data) setKategoriOptions(json.data); })
			.catch((err) => console.error("Gagal load kategori:", err));
	}, []);

	function validate(isEdit = false) {
		const e: Partial<FormBukuData> = {};
		if (!form.judul.trim()) e.judul = "Judul buku wajib diisi";
		if (!form.penerbit.trim()) e.penerbit = "Penerbit wajib diisi";
		if (!form.penulis.trim()) e.penulis = "Penulis wajib diisi";
		if (!form.thn_terbit || isNaN(Number(form.thn_terbit))) e.thn_terbit = "Tahun tidak valid";
		if (!isEdit && (Number(form.stok) < 0)) e.stok = "Stok minimal 0";
		if (Number(form.koin) < 0) e.koin = "Koin tidak boleh negatif";
		if (Number(form.stamp) < 0) e.stamp = "Stamp tidak boleh negatif";

		setErrors(e);
		return Object.keys(e).length === 0;
	}

	function handleChange(field: keyof FormBukuData, value: unknown) {
		setForm((f) => ({ ...f, [field]: value }));
		if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
	}

	const toggleKategori = (id: string) => {
		const current = [...form.selectedKategori];
		const index = current.indexOf(id);
		if (index > -1) current.splice(index, 1);
		else current.push(id);
		handleChange("selectedKategori", current);
	};

	async function handleSubmit() {
		if (!validate()) return;
		setLoading(true);

		try {
			// Satukan kategori array menjadi comma separated string (TEXT) untuk Stored Procedure
			const kategoriIdsString = form.selectedKategori.join(",");

			const res = await fetch("/api/buku", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...form,
					stok: parseInt(form.stok),
					koin: parseInt(form.koin),
					stamp: parseInt(form.stamp),
					thn_terbit: parseInt(form.thn_terbit),
					kategori_ids: kategoriIdsString
				}),
			});

			const json = await res.json();
			if (!res.ok) throw new Error(json.error);

			setSuccess(true);
			toast({ type: "success", title: "Buku Berhasil Ditambahkan!", message: `Koleksi "${form.judul}" berhasil diproses oleh sistem.` });
			setTimeout(() => { onSuccess?.(); onClose(); }, 1200);
		} catch (err: unknown) {
			toast({ type: "error", title: "Gagal menyimpan", message: (err as Error).message ?? "Terjadi kesalahan." });
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
			<div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
					<div>
						<h2 className="text-base font-bold text-gray-900">Tambah Buku Baru</h2>
						<p className="text-xs text-gray-400 mt-0.5">Penambahan buku otomatis memicu pemrosesan data unit item</p>
					</div>
					<button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X size={18} /></button>
				</div>

				<div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 text-sm">
					{/* Row 1: Judul */}
					<div>
						<label className="block text-xs font-semibold text-gray-600 mb-1">Judul Buku <span className="text-[#E8461E]">*</span></label>
						<div className={`flex items-center gap-2 border rounded-xl px-3 py-2 bg-gray-50 focus-within:bg-white focus-within:border-[#E8461E] focus-within:ring-2 focus-within:ring-orange-100 ${errors.judul ? "border-red-400 bg-red-50" : "border-gray-200"}`}>
							<BookOpen size={15} className="text-gray-400" />
							<input type="text" placeholder="Masukkan judul buku" value={form.judul} onChange={(e) => handleChange("judul", e.target.value)} className="flex-1 bg-transparent outline-none text-gray-800" />
						</div>
						{errors.judul && <p className="text-xs text-red-500 mt-1">{errors.judul}</p>}
					</div>

					{/* Row 2: Penulis & Penerbit */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-xs font-semibold text-gray-600 mb-1">Penulis <span className="text-[#E8461E]">*</span></label>
							<div className="flex items-center gap-2 border rounded-xl px-3 py-2 bg-gray-50 focus-within:bg-white border-gray-200 focus-within:border-[#E8461E]">
								<User size={15} className="text-gray-400" />
								<input type="text" placeholder="Nama penulis" value={form.penulis} onChange={(e) => handleChange("penulis", e.target.value)} className="flex-1 bg-transparent outline-none" />
							</div>
						</div>
						<div>
							<label className="block text-xs font-semibold text-gray-600 mb-1">Penerbit <span className="text-[#E8461E]">*</span></label>
							<div className="flex items-center gap-2 border rounded-xl px-3 py-2 bg-gray-50 focus-within:bg-white border-gray-200 focus-within:border-[#E8461E]">
								<Building size={15} className="text-gray-400" />
								<input type="text" placeholder="Nama penerbit" value={form.penerbit} onChange={(e) => handleChange("penerbit", e.target.value)} className="flex-1 bg-transparent outline-none" />
							</div>
						</div>
					</div>

					{/* Row 3: Deskripsi */}
					<div>
						<label className="block text-xs font-semibold text-gray-600 mb-1">Deskripsi / Sinopsis</label>
						<textarea placeholder="Tulis deskripsi ringkas..." value={form.deskripsi} onChange={(e) => handleChange("deskripsi", e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:bg-white outline-none focus:border-[#E8461E] resize-none" />
					</div>

					{/* Row 4: Koin, Stamp, Stok, Tahun */}
					<div className="grid grid-cols-4 gap-3">
						<div>
							<label className="block text-xs font-semibold text-gray-600 mb-1">Stok Awal <span className="text-[#E8461E]">*</span></label>
							<input type="number" min="0" value={form.stok} onChange={(e) => handleChange("stok", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:bg-white outline-none focus:border-[#E8461E]" />
						</div>
						<div>
							<label className="block text-xs font-semibold text-gray-600 mb-1">Tarif Koin</label>
							<input type="number" min="0" value={form.koin} onChange={(e) => handleChange("koin", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:bg-white outline-none focus:border-[#E8461E]" />
						</div>
						<div>
							<label className="block text-xs font-semibold text-gray-600 mb-1">Reward Stamp</label>
							<input type="number" min="0" value={form.stamp} onChange={(e) => handleChange("stamp", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:bg-white outline-none focus:border-[#E8461E]" />
						</div>
						<div>
							<label className="block text-xs font-semibold text-gray-600 mb-1">Tahun Terbit</label>
							<input type="number" value={form.thn_terbit} onChange={(e) => handleChange("thn_terbit", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:bg-white outline-none focus:border-[#E8461E]" />
						</div>
					</div>

					{/* Row 5: Pilih Kategori Multiselect */}
					<div>
						<label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
							<Layers size={13} /> Klasifikasi Kategori (Multiselect)
						</label>
						<div className="flex flex-wrap gap-2 border border-gray-300 p-3 rounded-xl bg-gray-50/50 max-h-28 overflow-y-auto">
							{kategoriOptions.length === 0 ? (
								<p className="text-xs text-gray-400 italic">Belum ada kategori terdaftar</p>
							) : (
								kategoriOptions.map((k) => {
									const active = form.selectedKategori.includes(k.id_kategori);
									return (
										<button key={k.id_kategori} type="button" onClick={() => toggleKategori(k.id_kategori)} className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${active ? "bg-orange-500 border-orange-600 text-white shadow-sm" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-150"
											}`}>
											{k.nama_kategori}
										</button>
									);
								})
							)}
						</div>
					</div>
				</div>

				<div className="px-6 py-3 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0 bg-gray-50/50">
					<button onClick={onClose} className="px-4 py-2 rounded-xl font-semibold text-gray-500 hover:bg-gray-100 transition-colors">Batal</button>
					<button
						onClick={handleSubmit}
						disabled={loading || success}
						className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-white shadow-md transition-all ${success ? "bg-emerald-500 shadow-emerald-200" : "bg-[#E8461E] hover:bg-orange-600 disabled:opacity-60"}`}
					>
						{loading ? "Menyimpan..." : success ? "✓ Tersimpan" : <><Plus size={15} /> Tambah Buku</>}
					</button>
				</div>
			</div>
		</div>
	);
}

export function EditBukuModal({
	buku,
	onClose,
	onSuccess,
	toast,
}: {
	buku: buku;
	onClose: () => void;
	onSuccess?: () => void;
	toast: ToastFn;
}) {
	const [form, setForm] = useState<FormBukuData>({
		judul: buku.judul || "",
		deskripsi: buku.deskripsi || "",
		stok: buku.stok?.toString() || "0",
		koin: buku.koin?.toString() || "0",
		stamp: buku.stamp?.toString() || "0",
		penerbit: buku.penerbit || "",
		penulis: buku.penulis || "",
		thn_terbit: buku.thn_terbit?.toString() || "",
		selectedKategori: [], // Awalnya kosong sebelum di-load dari API detail
	});

	const [kategoriOptions, setKategoriOptions] = useState<KategoriOption[]>([]);
	const [errors, setErrors] = useState<Partial<FormBukuData>>({});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	useEffect(() => {
		// 1. Ambil semua master pilihan kategori dari API master
		fetch("/api/kategori")
			.then((res) => res.json())
			.then((json) => { if (json.data) setKategoriOptions(json.data); })
			.catch((err) => console.error("Gagal memuat master opsi kategori:", err));

		// 2. MODIFIKASI: Ambil relasi kategori aktif milik buku ini agar langsung Ter-Centang
		if (buku?.id_buku) {
			fetch(`/api/buku/${buku.id_buku}`)
				.then((res) => res.json())
				.then((data) => {
					if (data && data.selectedKategori) {
						setForm((f) => ({
							...f,
							selectedKategori: data.selectedKategori // Mengisi state dengan array ID kategori ter-save
						}));
					}
				})
				.catch((err) => console.error("Gagal memuat kategori terikat pada buku:", err));
		}
	}, [buku]);

	function handleChange(field: keyof FormBukuData, value: unknown) {
		setForm((f) => ({ ...f, [field]: value }));
		if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
	}

	const toggleKategori = (id: string) => {
		const current = [...form.selectedKategori];
		const index = current.indexOf(id);
		if (index > -1) current.splice(index, 1); // Hapus jika sudah di-klik lagi
		else current.push(id); // Tambah jika dipilih
		handleChange("selectedKategori", current);
	};

	async function handleSubmit() {
		if (!form.judul.trim() || !form.penerbit.trim() || !form.penulis.trim()) {
			toast({ type: "error", title: "Validasi Gagal", message: "Judul, Penulis, dan Penerbit wajib diisi!" });
			return;
		}
		setLoading(true);

		try {
			// Gabungkan array ID pilihan kembali menjadi format Comma Separated TEXT untuk Stored Procedure
			const kategoriIdsString = form.selectedKategori.join(",");

			const res = await fetch(`/api/buku/${buku.id_buku}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					judul: form.judul,
					deskripsi: form.deskripsi,
					koin: parseInt(form.koin),
					stamp: parseInt(form.stamp),
					penerbit: form.penerbit,
					penulis: form.penulis,
					thn_terbit: parseInt(form.thn_terbit),
					kategori_ids: kategoriIdsString // Dikirimkan kembali ke SP
				}),
			});

			const json = await res.json();
			if (!res.ok) throw new Error(json.error);

			setSuccess(true);
			toast({ type: "success", title: "Pembaruan Berhasil!", message: "Data buku berhasil diperbarui" });
			setTimeout(() => { onSuccess?.(); onClose(); }, 1200);
		} catch (err: unknown) {
			toast({ type: "error", title: "Gagal mengedit", message: (err as Error).message ?? "Terjadi kesalahan." });
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
			<div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
					<div>
						<h2 className="text-base font-bold text-gray-900">Edit Buku</h2>
						<p className="text-xs text-gray-400 mt-0.5">ID: <span className="font-mono text-gray-600 font-bold">{buku.id_buku}</span></p>
					</div>
					<button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X size={18} /></button>
				</div>

				<div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 text-sm">
					<div>
						<label className="block text-xs font-semibold text-gray-600 mb-1">Judul Buku <span className="text-[#E8461E]">*</span></label>
						<div className="flex items-center gap-2 border rounded-xl px-3 py-2 border-gray-200 bg-gray-50 focus-within:bg-white focus-within:border-[#E8461E]">
							<BookOpen size={15} className="text-gray-400" />
							<input type="text" value={form.judul} onChange={(e) => handleChange("judul", e.target.value)} className="flex-1 bg-transparent outline-none" />
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-xs font-semibold text-gray-600 mb-1">Penulis <span className="text-[#E8461E]">*</span></label>
							<div className="flex items-center gap-2 border rounded-xl px-3 py-2 border-gray-200 bg-gray-50 focus-within:bg-white focus-within:border-[#E8461E]">
								<User size={15} className="text-gray-400" />
								<input type="text" value={form.penulis} onChange={(e) => handleChange("penulis", e.target.value)} className="flex-1 bg-transparent outline-none" />
							</div>
						</div>
						<div>
							<label className="block text-xs font-semibold text-gray-600 mb-1">Penerbit <span className="text-[#E8461E]">*</span></label>
							<div className="flex items-center gap-2 border rounded-xl px-3 py-2 border-gray-200 bg-gray-50 focus-within:bg-white focus-within:border-[#E8461E]">
								<Building size={15} className="text-gray-400" />
								<input type="text" value={form.penerbit} onChange={(e) => handleChange("penerbit", e.target.value)} className="flex-1 bg-transparent outline-none" />
							</div>
						</div>
					</div>

					<div>
						<label className="block text-xs font-semibold text-gray-600 mb-1">Deskripsi / Sinopsis</label>
						<textarea value={form.deskripsi} onChange={(e) => handleChange("deskripsi", e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:bg-white outline-none focus:border-[#E8461E] resize-none" />
					</div>

					<div className="grid grid-cols-3 gap-3">
						<div>
							<label className="block text-xs font-semibold text-gray-600 mb-1">Tarif Koin</label>
							<input type="number" value={form.koin} onChange={(e) => handleChange("koin", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:bg-white outline-none focus:border-[#E8461E]" />
						</div>
						<div>
							<label className="block text-xs font-semibold text-gray-600 mb-1">Reward Stamp</label>
							<input type="number" value={form.stamp} onChange={(e) => handleChange("stamp", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:bg-white outline-none focus:border-[#E8461E]" />
						</div>
						<div>
							<label className="block text-xs font-semibold text-gray-600 mb-1">Tahun Terbit</label>
							<input type="number" value={form.thn_terbit} onChange={(e) => handleChange("thn_terbit", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:bg-white outline-none focus:border-[#E8461E]" />
						</div>
					</div>

					<div>
						<label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
							<Layers size={13} /> Modifikasi Kategori Terkait
						</label>
						<div className="flex flex-wrap gap-2 border border-gray-300 p-3 rounded-xl bg-gray-50/50 max-h-24 overflow-y-auto">
							{kategoriOptions.map((k) => {
								const active = form.selectedKategori.includes(k.id_kategori);
								return (
									<button key={k.id_kategori} type="button" onClick={() => toggleKategori(k.id_kategori)} className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${active ? "bg-orange-500 border-orange-600 text-white shadow-sm" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-150"
										}`}>
										{k.nama_kategori}
									</button>
								);
							})}
						</div>
					</div>
				</div>

				<div className="px-6 py-3 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0 bg-gray-50/50">
					<button onClick={onClose} className="px-4 py-2 rounded-xl font-semibold text-gray-500 hover:bg-gray-100">Batal</button>
					<button
						onClick={handleSubmit}
						disabled={loading || success}
						className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-white shadow-md transition-all ${success ? "bg-emerald-500 shadow-emerald-200" : "bg-[#E8461E] hover:bg-orange-600"}`}
					>
						{loading ? "Menyimpan…" : success ? "✓ Tersimpan" : <><Pencil size={15} /> Simpan Perubahan</>}
					</button>
				</div>
			</div>
		</div>
	);
}

export function DeleteBukuModal({
	buku,
	onClose,
	onSuccess,
	toast,
}: {
	buku: buku;
	onClose: () => void;
	onSuccess?: () => void;
	toast: ToastFn;
}) {
	const [loading, setLoading] = useState(false);

	async function handleDelete() {
		setLoading(true);
		try {
			const res = await fetch(`/api/buku/${buku.id_buku}`, { method: "DELETE" });
			if (!res.ok) throw new Error();

			toast({ type: "success", title: "Buku Terhapus", message: "Koleksi buku berhasil disingkirkan dari sistem." });
			onSuccess?.();
			onClose();
		} catch {
			toast({ type: "error", title: "Gagal menghapus", message: "Terjadi hambatan koneksi data." });
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && !loading && onClose()}>
			<div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
					<div className="flex items-center gap-2.5">
						<div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500"><AlertTriangle size={16} /></div>
						<div>
							<h2 className="text-sm font-bold text-gray-900">Hapus Katalog Buku</h2>
							<p className="text-[11px] text-gray-400">Tindakan bersifat irreversible</p>
						</div>
					</div>
					<button onClick={onClose} disabled={loading} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X size={16} /></button>
				</div>
				<div className="px-6 py-4 text-sm text-gray-600">
					<p>Yakin ingin menghapus item buku berikut beserta relasinya?</p>
					<div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
						<span className="font-semibold text-gray-800 truncate max-w-[200px]">{buku.judul}</span>
						<span className="font-mono text-xs bg-white border border-gray-200 text-gray-500 px-2 py-1 rounded-lg shrink-0">{buku.id_buku}</span>
					</div>
				</div>
				<div className="px-6 py-3 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
					<button onClick={onClose} disabled={loading} className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-lg">Batal</button>
					<button onClick={handleDelete} disabled={loading} className="px-4 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-sm">{loading ? "Menghapus…" : "Ya, Hapus Buku"}</button>
				</div>
			</div>
		</div>
	);
}