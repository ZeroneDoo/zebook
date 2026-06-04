import { AlertTriangle, Eye, EyeOff, KeyRound, Pencil, Plus, Trash2, User, X } from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/components/Toast";
import { staff } from "@/app/generated/prisma/client";
import Image from "next/image";
import { PasswordStrength } from "@/lib/helpers";

type ToastFn = ReturnType<typeof useToast>["toast"];

interface FormStaffData {
	username: string;
	nama_staff: string;
	password?: string;
}

export function TambahStaffModal({
	onClose,
	onSuccess,
	toast
}: {
	onClose: () => void;
	onSuccess?: () => void;
	toast: ToastFn;
}) {
	const [form, setForm] = useState<FormStaffData>({
		nama_staff: "",
		username: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<Partial<FormStaffData>>({});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	function validate() {
		const e: Partial<FormStaffData> = {};
		if (!form.nama_staff.trim()) e.nama_staff = "Nama wajib diisi";
		else if (form.nama_staff.length > 32) e.nama_staff = "Maks. 32 karakter";

		if (!form.username.trim()) e.username = "Username wajib diisi";
		else if (form.username.length > 32) e.username = "Maks. 32 karakter";

		if (!form.password) e.password = "Password wajib diisi";
		else if (form.password.length < 6) e.password = "Minimal 6 karakter";

		setErrors(e);
		return Object.keys(e).length === 0;
	}

	function handleChange(field: keyof FormStaffData, value: string) {
		setForm((f) => ({ ...f, [field]: value }));
		if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
	}

	async function handleSubmit() {
		if (!validate()) return;
		setLoading(true);

		try {
			const res = await fetch("/api/staff", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});

			const json = await res.json();

			if (!res.ok) {
				if (res.status === 409) {
					setErrors((e) => ({ ...e, username: "Username sudah digunakan" }));
					toast({ type: "error", title: "Username sudah digunakan", message: "Gunakan username yang berbeda." });
				} else {
					toast({ type: "error", title: "Gagal menyimpan", message: json.error ?? "Terjadi kesalahan." });
				}
				return;
			}

			setSuccess(true);
			toast({ type: "success", title: "Staff ditambahkan!", message: `${form.nama_staff} berhasil disimpan.` });
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
						<h2 className="text-base font-bold text-gray-900">Tambah Staff</h2>
						<p className="text-xs text-gray-400 mt-0.5">Isi data staff baru di bawah ini</p>
					</div>
					<button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
						<X size={18} />
					</button>
				</div>

				{/* Body */}
				<div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
					{/* Nama Staff */}
					<div>
						<label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Staff <span className="text-[#E8461E]">*</span></label>
						<div className={`flex items-center gap-2.5 border rounded-xl px-3.5 py-2.5 transition-all ${errors.nama_staff ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus-within:border-[#E8461E] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100"}`}>
							<User size={15} className="text-gray-400 shrink-0" />
							<input
								type="text"
								maxLength={32}
								placeholder="Nama lengkap"
								value={form.nama_staff}
								onChange={(e) => handleChange("nama_staff", e.target.value)}
								className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
							/>
							<span className="text-xs text-gray-300 shrink-0">{form.nama_staff.length}/32</span>
						</div>
						{errors.nama_staff && <p className="mt-1 text-xs text-red-500">{errors.nama_staff}</p>}
					</div>

					{/* Username */}
					<div>
						<label className="block text-xs font-semibold text-gray-600 mb-1.5">Username <span className="text-[#E8461E]">*</span></label>
						<div className={`flex items-center gap-2.5 border rounded-xl px-3.5 py-2.5 transition-all ${errors.username ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus-within:border-[#E8461E] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100"}`}>
							<span className="text-gray-400 text-sm font-semibold shrink-0">@</span>
							<input
								type="text"
								maxLength={32}
								placeholder="username_staff"
								value={form.username}
								onChange={(e) => handleChange("username", e.target.value)}
								className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
							/>
						</div>
						{errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
					</div>

					{/* Password */}
					<div>
						<label className="block text-xs font-semibold text-gray-600 mb-1.5">Password <span className="text-[#E8461E]">*</span></label>
						<div className={`flex items-center gap-2.5 border rounded-xl px-3.5 py-2.5 transition-all ${errors.password ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus-within:border-[#E8461E] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100"}`}>
							<KeyRound size={15} className="text-gray-400 shrink-0" />
							<input
								type={showPassword ? "text" : "password"}
								placeholder="Minimal 6 karakter"
								value={form.password}
								onChange={(e) => handleChange("password", e.target.value)}
								className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
							/>
							<button type="button" onClick={() => setShowPassword((v) => !v)} className="text-gray-400 hover:text-gray-600 shrink-0 transition-colors">
								{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
							</button>
						</div>
						<PasswordStrength password={form.password} />
						{errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
					</div>
				</div>

				{/* Footer */}
				<div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
					<button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors">Batal</button>
					<button
						onClick={handleSubmit}
						disabled={loading || success}
						className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white shadow-md transition-all ${success ? "bg-emerald-500 shadow-emerald-200" : "bg-[#E8461E] hover:bg-orange-600 active:scale-95 shadow-orange-200 disabled:opacity-60"}`}
					>
						{loading ? "Menyimpan…" : success ? "✓ Tersimpan" : <><Plus size={15} /> Tambah Staff</>}
					</button>
				</div>
			</div>
		</div>
	);
}

export function EditStaffModal({
	staff,
	onClose,
	onSuccess,
	toast,
}: {
	staff: staff;
	onClose: () => void;
	onSuccess?: () => void;
	toast: ToastFn;
}) {
	const [form, setForm] = useState<FormStaffData>({
		nama_staff: staff.nama_staff ?? "",
		username: staff.username,
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<Partial<FormStaffData>>({});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	function validate() {
		const e: Partial<FormStaffData> = {};
		if (!form.nama_staff.trim()) e.nama_staff = "Nama wajib diisi";
		else if (form.nama_staff.length > 32) e.nama_staff = "Maks. 32 karakter";

		if (!form.username.trim()) e.username = "Username wajib diisi";
		else if (form.username.length > 32) e.username = "Maks. 32 karakter";

		if (form.password && form.password.length < 6) e.password = "Minimal 6 karakter";

		setErrors(e);
		return Object.keys(e).length === 0;
	}

	function handleChange(field: keyof FormStaffData, value: string) {
		setForm((f) => ({ ...f, [field]: value }));
		if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
	}

	async function handleSubmit() {
		if (!validate()) return;
		setLoading(true);

		try {
			const body = {
				nama_staff: form.nama_staff.trim(),
				username: form.username.trim(),
				...(form.password ? { password: form.password } : {}),
			};

			const res = await fetch(`/api/staff/${staff.id_staff}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			const json = await res.json();

			if (!res.ok) {
				if (res.status === 404) {
					toast({ type: "error", title: "Staff tidak ditemukan", message: "Data mungkin sudah dihapus." });
				} else if (res.status === 409) {
					setErrors((e) => ({ ...e, username: "Username sudah digunakan" }));
					toast({ type: "error", title: "Username sudah digunakan", message: "Gunakan username yang berbeda." });
				} else {
					toast({ type: "error", title: "Gagal menyimpan", message: json.error ?? "Terjadi kesalahan." });
				}
				return;
			}

			setSuccess(true);
			toast({ type: "success", title: "Perubahan disimpan!", message: `${form.nama_staff} berhasil diperbarui.` });
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
						<h2 className="text-base font-bold text-gray-900">Edit Staff</h2>
						<p className="text-xs text-gray-400 mt-0.5">
							ID: <span className="font-mono text-gray-500">{staff.id_staff}</span>
						</p>
					</div>
					<button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
						<X size={18} />
					</button>
				</div>

				{/* Body */}
				<div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
					{/* Nama Staff */}
					<div>
						<label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Staff <span className="text-[#E8461E]">*</span></label>
						<div className={`flex items-center gap-2.5 border rounded-xl px-3.5 py-2.5 transition-all ${errors.nama_staff ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus-within:border-[#E8461E] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100"}`}>
							<User size={15} className="text-gray-400 shrink-0" />
							<input
								type="text"
								maxLength={32}
								placeholder="Nama lengkap"
								value={form.nama_staff}
								onChange={(e) => handleChange("nama_staff", e.target.value)}
								className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
							/>
						</div>
					</div>

					{/* Username */}
					<div>
						<label className="block text-xs font-semibold text-gray-600 mb-1.5">Username <span className="text-[#E8461E]">*</span></label>
						<div className={`flex items-center gap-2.5 border rounded-xl px-3.5 py-2.5 transition-all ${errors.username ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus-within:border-[#E8461E] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100"}`}>
							<span className="text-gray-400 text-sm font-semibold shrink-0">@</span>
							<input
								type="text"
								maxLength={32}
								placeholder="username_staff"
								value={form.username}
								onChange={(e) => handleChange("username", e.target.value)}
								className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
							/>
						</div>
						{errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
					</div>

					{/* Password */}
					<div>
						<label className="block text-xs font-semibold text-gray-600 mb-1.5">Password Baru <span className="text-gray-400 font-normal">(kosongkan jika tidak diubah)</span></label>
						<div className={`flex items-center gap-2.5 border rounded-xl px-3.5 py-2.5 transition-all ${errors.password ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus-within:border-[#E8461E] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100"}`}>
							<KeyRound size={15} className="text-gray-400 shrink-0" />
							<input
								type={showPassword ? "text" : "password"}
								placeholder="Biarkan kosong jika tidak diubah"
								value={form.password}
								onChange={(e) => handleChange("password", e.target.value)}
								className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
							/>
							<button type="button" onClick={() => setShowPassword((v) => !v)} className="text-gray-400 hover:text-gray-600 shrink-0 transition-colors">
								{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
							</button>
						</div>
						<PasswordStrength password={form.password} />
						{errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
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

export function DeleteStaffModal({
	staff,
	onClose,
	onSuccess,
	toast,
}: {
	staff: staff;
	onClose: () => void;
	onSuccess?: () => void;
	toast: ToastFn;
}) {
	const [loading, setLoading] = useState(false);

	async function handleDelete() {
		setLoading(true);
		try {
			const res = await fetch(`/api/staff/${staff.id_staff}`, {
				method: "DELETE",
			});

			const json = await res.json();

			if (!res.ok) {
				if (res.status === 404) {
					toast({ type: "warning", title: "Staff tidak ditemukan", message: "Data mungkin sudah dihapus." });
				} else {
					toast({ type: "error", title: "Gagal menghapus", message: json.error ?? "Terjadi kesalahan." });
				}
				onClose();
				return;
			}

			toast({ type: "success", title: "Staff dihapus", message: `${staff.nama_staff} berhasil dihapus.` });
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
							<h2 className="text-base font-bold text-gray-900">Hapus Staff</h2>
							<p className="text-xs text-gray-400 mt-0.5">Tindakan ini tidak dapat dibatalkan</p>
						</div>
					</div>
					<button onClick={onClose} disabled={loading} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
						<X size={18} />
					</button>
				</div>

				<div className="px-6 py-5">
					<p className="text-sm text-gray-600 leading-relaxed">Apakah kamu yakin ingin menghapus staff berikut?</p>
					<div className="mt-4 flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
						<Image
							unoptimized
							src={`https://api.dicebear.com/9.x/initials/svg?seed=${staff.nama_staff}`}
							alt={`Avatar ${staff?.nama_staff ?? 'Anonim'}`}
							width={36}
							height={36}
							className="w-9 h-9 rounded-xl shrink-0"
						/>
						<div className="min-w-0">
							<p className="text-sm font-semibold text-gray-800 truncate">{staff.nama_staff}</p>
							<p className="text-xs text-gray-400 truncate">@{staff.username}</p>
						</div>
						<span className="ml-auto font-mono text-xs bg-white border border-gray-200 text-gray-500 px-2 py-1 rounded-lg shrink-0">
							{staff.id_staff}
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