import { FormPenggunaBody, FormPenggunaData } from "@/lib/interfaces";
import { AlertTriangle, AtSign, Eye, EyeOff, KeyRound, Pencil, Plus, Trash2, User, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { pengguna } from "@/app/generated/prisma/browser";
import Image from "next/image";
import { PasswordStrength } from "@/lib/helpers";
type ToastFn = ReturnType<typeof useToast>["toast"];

export function TambahPenggunaModal({
  onClose,
  onSuccess,
  toast
}: {
  onClose: () => void;
  onSuccess?: () => void;
  toast: ToastFn;
}) {
  const [form, setForm] = useState<FormPenggunaData>({
    nama_pengguna: "",
    email: "",
    koin: '0',
    stamp: '0',
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<FormPenggunaData>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate() {
    const e: Partial<FormPenggunaData> = {};
    if (!form.nama_pengguna.trim()) e.nama_pengguna = "Nama wajib diisi";
    else if (form.nama_pengguna.length > 32) e.nama_pengguna = "Maks. 32 karakter";
    if (!form.email.trim()) e.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Format email tidak valid";
    if (!form.password) e.password = "Password wajib diisi";
    else if (form.password.length < 6) e.password = "Minimal 6 karakter";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange<T>(field: keyof FormPenggunaData, value: T) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/pengguna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setErrors((e) => ({ ...e, email: "Email sudah digunakan" }));
          toast({ type: "error", title: "Email sudah digunakan", message: "Gunakan email yang berbeda." });
        } else {
          toast({ type: "error", title: "Gagal menyimpan", message: json.error ?? "Terjadi kesalahan." });
        }
        return;
      }

      setSuccess(true);
      toast({ type: "success", title: "Pengguna ditambahkan!", message: `${form.nama_pengguna} berhasil disimpan.` });
      setTimeout(() => { onSuccess?.(); onClose(); }, 1200);
    } catch {
      setErrors((e) => ({ ...e, email: "Gagal terhubung ke server" }));
    } finally {
      setLoading(false);
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Tambah Pengguna</h2>
            <p className="text-xs text-gray-400 mt-0.5">Isi data pengguna baru di bawah ini</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Nama Pengguna */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Nama Pengguna <span className="text-[#E8461E]">*</span>
            </label>
            <div className={`flex items-center gap-2.5 border rounded-xl px-3.5 py-2.5 transition-all ${errors.nama_pengguna ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus-within:border-[#E8461E] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100"}`}>
              <User size={15} className="text-gray-400 shrink-0" />
              <input
                type="text"
                maxLength={32}
                placeholder="Nama lengkap"
                value={form.nama_pengguna}
                onChange={(e) => handleChange<string>("nama_pengguna", e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
              />
              <span className="text-xs text-gray-300 shrink-0">{form.nama_pengguna.length}/32</span>
            </div>
            {errors.nama_pengguna && <p className="mt-1 text-xs text-red-500">{errors.nama_pengguna}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Email <span className="text-[#E8461E]">*</span>
            </label>
            <div className={`flex items-center gap-2.5 border rounded-xl px-3.5 py-2.5 transition-all ${errors.email ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus-within:border-[#E8461E] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100"}`}>
              <AtSign size={15} className="text-gray-400 shrink-0" />
              <input
                type="email"
                maxLength={32}
                placeholder="contoh@email.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Koin & Stamp (2 kolom) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Koin</label>
              <div className="flex items-center gap-2.5 border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 focus-within:border-[#E8461E] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                <span className="text-[#E8461E] font-bold text-sm shrink-0">⬡</span>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.koin}
                  onChange={(e) => handleChange<string>("koin", e.target.value ?? '0')}
                  className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none w-0"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stamp</label>
              <div className="flex items-center gap-2.5 border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 focus-within:border-[#E8461E] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                <span className="text-violet-500 text-sm shrink-0">◈</span>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.stamp}
                  onChange={(e) => handleChange<string>("stamp", e.target.value ?? '0')}
                  className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none w-0"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Password <span className="text-[#E8461E]">*</span>
            </label>
            <div className={`flex items-center gap-2.5 border rounded-xl px-3.5 py-2.5 transition-all ${errors.password ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus-within:border-[#E8461E] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100"}`}>
              <KeyRound size={15} className="text-gray-400 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 6 karakter"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-gray-400 hover:text-gray-600 shrink-0 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <PasswordStrength password={form.password} />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || success}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white shadow-md shadow-orange-200 transition-all ${success
              ? "bg-emerald-500 shadow-emerald-200"
              : "bg-[#E8461E] hover:bg-orange-600 active:scale-95 disabled:opacity-60"
              }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Menyimpan…
              </>
            ) : success ? (
              <>✓ Tersimpan</>
            ) : (
              <>
                <Plus size={15} />
                Tambah Pengguna
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function EditPenggunaModal({
  user,
  onClose,
  onSuccess,
  toast,
}: {
  user: pengguna;
  onClose: () => void;
  onSuccess?: () => void;
  toast: ToastFn;
}) {
  const [form, setForm] = useState<FormPenggunaData>({
    nama_pengguna: user.nama_pengguna ?? "",
    email: user.email,
    koin: String(user.koin),
    stamp: String(user.stamp),
    password: "", // blank = no change
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<FormPenggunaData>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate() {
    const e: Partial<FormPenggunaData> = {};
    if (!form.nama_pengguna.trim()) e.nama_pengguna = "Nama wajib diisi";
    else if (form.nama_pengguna.length > 32) e.nama_pengguna = "Maks. 32 karakter";
    if (!form.email.trim()) e.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Format email tidak valid";
    // Password is optional on edit — only validate if filled
    if (form.password && form.password.length < 6)
      e.password = "Minimal 6 karakter";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange<T>(field: keyof FormPenggunaData, value: T) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);

    try {
      // Only send password if the user actually typed one
      const body: Partial<FormPenggunaBody> & { koin: number; stamp: number } = {
        nama_pengguna: form.nama_pengguna.trim(),
        email: form.email.trim(),
        koin: Number.isFinite(Number(form.koin)) ? Number(form.koin) : 0,
        stamp: Number.isFinite(Number(form.stamp)) ? Number(form.stamp) : 0,
        ...(form.password ? { password: form.password } : {}),
      };

      const res = await fetch(`/api/pengguna/${user.id_pengguna}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          toast({ type: "error", title: "Pengguna tidak ditemukan", message: "Data mungkin sudah dihapus." });
        } else if (res.status === 409) {
          setErrors((e) => ({ ...e, email: "Email sudah digunakan" }));
          toast({ type: "error", title: "Email sudah digunakan", message: "Gunakan email yang berbeda." });
        } else {
          toast({ type: "error", title: "Gagal menyimpan", message: json.error ?? "Terjadi kesalahan." });
        }
        return;
      }

      setSuccess(true);
      toast({ type: "success", title: "Perubahan disimpan!", message: `${form.nama_pengguna} berhasil diperbarui.` });
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
            <h2 className="text-base font-bold text-gray-900">Edit Pengguna</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              ID: <span className="font-mono text-gray-500">{user.id_pengguna}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Nama Pengguna */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Nama Pengguna <span className="text-[#E8461E]">*</span>
            </label>
            <div className={`flex items-center gap-2.5 border rounded-xl px-3.5 py-2.5 transition-all ${errors.nama_pengguna ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus-within:border-[#E8461E] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100"}`}>
              <User size={15} className="text-gray-400 shrink-0" />
              <input
                type="text"
                maxLength={32}
                placeholder="Nama lengkap"
                value={form.nama_pengguna}
                onChange={(e) => handleChange<string>("nama_pengguna", e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
              />
              <span className="text-xs text-gray-300 shrink-0">{form.nama_pengguna.length}/32</span>
            </div>
            {errors.nama_pengguna && <p className="mt-1 text-xs text-red-500">{errors.nama_pengguna}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Email <span className="text-[#E8461E]">*</span>
            </label>
            <div className={`flex items-center gap-2.5 border rounded-xl px-3.5 py-2.5 transition-all ${errors.email ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus-within:border-[#E8461E] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100"}`}>
              <AtSign size={15} className="text-gray-400 shrink-0" />
              <input
                type="email"
                maxLength={64}
                placeholder="contoh@email.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Koin & Stamp */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Koin</label>
              <div className="flex items-center gap-2.5 border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 focus-within:border-[#E8461E] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                <span className="text-[#E8461E] font-bold text-sm shrink-0">⬡</span>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.koin}
                  onChange={(e) => handleChange<string>("koin", e.target.value ?? "0")}
                  className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none w-0"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stamp</label>
              <div className="flex items-center gap-2.5 border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 focus-within:border-[#E8461E] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                <span className="text-violet-500 text-sm shrink-0">◈</span>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.stamp}
                  onChange={(e) => handleChange<string>("stamp", e.target.value ?? "0")}
                  className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none w-0"
                />
              </div>
            </div>
          </div>

          {/* Password — optional on edit */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Password Baru
              <span className="ml-1.5 text-gray-400 font-normal">(kosongkan jika tidak diubah)</span>
            </label>
            <div className={`flex items-center gap-2.5 border rounded-xl px-3.5 py-2.5 transition-all ${errors.password ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus-within:border-[#E8461E] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100"}`}>
              <KeyRound size={15} className="text-gray-400 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Biarkan kosong jika tidak diubah"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-gray-400 hover:text-gray-600 shrink-0 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            {/* Strength bar — only when typing */}
            {form.password.length > 0 && (
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4].map((n) => {
                  const len = form.password.length;
                  const strength = len < 6 ? 1 : len < 10 ? 2 : len < 14 ? 3 : 4;
                  return (
                    <div
                      key={n}
                      className={`h-1 flex-1 rounded-full transition-all ${n <= strength
                        ? strength === 1 ? "bg-red-400"
                          : strength === 2 ? "bg-amber-400"
                            : strength === 3 ? "bg-emerald-400"
                              : "bg-emerald-500"
                        : "bg-gray-200"
                        }`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || success}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white shadow-md transition-all ${success
              ? "bg-emerald-500 shadow-emerald-200"
              : "bg-[#E8461E] hover:bg-orange-600 active:scale-95 shadow-orange-200 disabled:opacity-60"
              }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Menyimpan…
              </>
            ) : success ? (
              <>✓ Tersimpan</>
            ) : (
              <>
                <Pencil size={15} />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DeletePenggunaModal({
  user,
  onClose,
  onSuccess,
  toast,
}: {
  user: pengguna;
  onClose: () => void;
  onSuccess?: () => void;
  toast: ToastFn;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/pengguna/${user.id_pengguna}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          toast({ type: "warning", title: "Pengguna tidak ditemukan", message: "Data mungkin sudah dihapus." });
        } else {
          toast({ type: "error", title: "Gagal menghapus", message: json.error ?? "Terjadi kesalahan." });
        }
        onClose();
        return;
      }

      toast({ type: "success", title: "Pengguna dihapus", message: `${user.nama_pengguna} berhasil dihapus.` });
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

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Hapus Pengguna</h2>
              <p className="text-xs text-gray-400 mt-0.5">Tindakan ini tidak dapat dibatalkan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            Apakah kamu yakin ingin menghapus pengguna berikut?
          </p>

          {/* User card */}
          <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
            <Image
              unoptimized
              src={`https://api.dicebear.com/9.x/initials/svg?seed=${user.nama_pengguna}`}
              alt={`Avatar ${user?.nama_pengguna ?? 'Anonim'}`}
              width={36}
              height={36}
              className="w-9 h-9 rounded-xl shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user.nama_pengguna}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <span className="ml-auto font-mono text-xs bg-white border border-gray-200 text-gray-500 px-2 py-1 rounded-lg shrink-0">
              {user.id_pengguna}
            </span>
          </div>

          <p className="mt-3 text-xs text-red-500">
            Semua data terkait pengguna ini akan ikut terhapus secara permanen.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-40"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 active:scale-95 shadow-md shadow-red-200 transition-all disabled:opacity-60"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Menghapus…
              </>
            ) : (
              <>
                <Trash2 size={15} />
                Ya, Hapus
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}