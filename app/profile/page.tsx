"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IconUser,
  IconMail,
  IconCoin,
  IconTicket,
  IconId,
  IconLock,
  IconDeviceFloppy,
  IconChevronDown,
  IconLoader2,
  IconArrowLeft,
  IconEyeOff,
  IconEye,
} from "@tabler/icons-react";
import UserLayout from "@/components/layout/UserLayout";
// Import sistem custom toast Anda di sini
import { useToast, ToastContainer } from "@/components/Toast";
import Image from "next/image";

interface UserData {
  id_pengguna: string;
  nama_pengguna: string;
  email: string;
  koin: number;
  stamp: number;
}

export default function ProfilePage() {
  const router = useRouter();

  // Mengaktifkan custom toast hook
  const { toasts, toast, remove } = useToast();

  // State data utama dari DB
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Profile details form state
  const [namaPengguna, setNamaPengguna] = useState("");
  const [email, setEmail] = useState("");

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPasswordBaru, setKonfirmasiPasswordBaru] = useState("");

  // Password visibility toggles
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Form submission processing state
  const [isSaving, setIsSaving] = useState(false);

  // ─── FETCH INITIAL DATA (GET) ───
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setIsLoadingData(true);
        const response = await fetch("/api/me");

        if (!response.ok) {
          throw new Error("Gagal memuat profil pengguna");
        }

        const data: UserData = await response.json();
        setUser(data);
        setNamaPengguna(data.nama_pengguna || "");
        setEmail(data.email || "");
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          type: "error",
          title: "Gagal Memuat Data",
          message: "Gagal mengambil data profil dari server.",
        });
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchUserProfile();
  }, [toast]);

  // ─── SUBMIT DATA UPDATE (PATCH) ───
  const handleUpdateProfile = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (!email) {
      toast({
        type: "warning",
        title: "Validasi Gagal",
        message: "Email tidak boleh kosong.",
      });
      setIsSaving(false);
      return;
    }

    // Validasi Password di Sisi Klien
    if (isChangingPassword) {
      if (!passwordLama || !passwordBaru || !konfirmasiPasswordBaru) {
        toast({
          type: "warning",
          title: "Kolom Belum Lengkap",
          message: "Semua kolom password wajib diisi jika ingin mengubah password.",
        });
        setIsSaving(false);
        return;
      }
      if (passwordBaru.length < 6) {
        toast({
          type: "warning",
          title: "Password Terlalu Pendek",
          message: "Password baru minimal harus memiliki 6 karakter.",
        });
        setIsSaving(false);
        return;
      }
      if (passwordBaru !== konfirmasiPasswordBaru) {
        toast({
          type: "error",
          title: "Konfirmasi Salah",
          message: "Konfirmasi password baru tidak cocok.",
        });
        setIsSaving(false);
        return;
      }
    }

    try {
      const payload = {
        nama_pengguna: namaPengguna,
        email: email,
        ...(isChangingPassword && { password: passwordBaru }),
      };

      const response = await fetch("/api/me/update-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Gagal memperbarui profil.");
      }

      setUser(resData.data);

      // Memicu Toast Notifikasi Sukses
      toast({
        type: "success",
        title: "Pembaruan Berhasil",
        message: "Profil dan pengaturan Anda berhasil diperbarui!",
      });

      setPasswordLama("");
      setPasswordBaru("");
      setKonfirmasiPasswordBaru("");
      setIsChangingPassword(false);
    } catch (error: unknown) {
      // Memicu Toast Notifikasi Gagal
      toast({
        type: "error",
        title: "Pembaruan Gagal",
        message: (error as Error).message || "Gagal memperbarui data. Silakan coba lagi.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) {
    return (
      <UserLayout>
        <div className="min-h-screen flex flex-col items-center justify-center text-[#3A2818]">
          <IconLoader2 size={36} className="text-[#56402A] animate-spin mb-2" />
          <p className="text-xs text-[#9A7E5A] tracking-wide">Memuat informasi akun Anda...</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 select-none">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Tombol Kembali */}
          <div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#D4C4AE]/40 text-[#56402A] hover:bg-[#F3ECE0]/50 text-xs font-semibold transition-all shadow-xs group cursor-pointer"
            >
              <IconArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Kembali</span>
            </button>
          </div>

          {/* 1. Header Balance Card Component */}
          <div className="bg-white rounded-[20px] border border-[#D4C4AE]/40 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5 shadow-[0_8px_32px_rgba(58,40,24,.03)]">
            {/* <div className="w-20 h-20 rounded-full bg-linear-to-br from-[#B8A080] to-[#7A5E3E] flex items-center justify-center text-2xl font-semibold text-[#F3ECE0] tracking-wider shrink-0 shadow-inner">
              {user?.nama_pengguna ? user.nama_pengguna.substring(0, 2).toUpperCase() : "UU"}
            </div> */}
            <Image
              unoptimized
              src={`https://api.dicebear.com/9.x/initials/svg?seed=${user?.nama_pengguna}`}
              alt={`Avatar ${user?.nama_pengguna ?? 'Anonim'}`}
              width={80}
              height={80}
              sizes="80px"
              className="w-20 h-20 rounded-full tracking-wider shrink-0 select-none shadow-sm"
            />
            <div className="text-center sm:text-left flex-1 min-w-0">
              <h1 className="font-serif-elegant text-2xl font-bold text-[#56402A] truncate">
                {user?.nama_pengguna || "Pengguna ZeBook"}
              </h1>
              <p className="text-sm text-[#9A7E5A] truncate mt-0.5">{user?.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF7F2] border border-[#D4C4AE]/50 rounded-md text-xs font-medium text-[#7A5E3E]">
                <IconId size={14} />
                ID: {user?.id_pengguna}
              </div>
            </div>
          </div>

          {/* 2. Wallet Balances Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-[20px] border border-[#D4C4AE]/40 p-5 flex items-center justify-between shadow-[0_4px_20px_rgba(58,40,24,.02)]">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#9A7E5A] uppercase tracking-wider block">Saldo Koin</span>
                <span className="text-2xl font-bold text-[#3A2818] block">{user?.koin ?? 0}</span>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-[#C8A84E]">
                <IconCoin size={26} />
              </div>
            </div>

            <div className="bg-white rounded-[20px] border border-[#D4C4AE]/40 p-5 flex items-center justify-between shadow-[0_4px_20px_rgba(58,40,24,.02)]">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#9A7E5A] uppercase tracking-wider block">Koleksi Stamp</span>
                <span className="text-2xl font-bold text-[#3A2818] block">{user?.stamp ?? 0}</span>
              </div>
              <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-[#9A7E5A]">
                <IconTicket size={26} />
              </div>
            </div>
          </div>

          {/* 3. Core Account Management Form Section */}
          <div className="bg-white rounded-[20px] border border-[#D4C4AE]/40 shadow-[0_8px_32px_rgba(58,40,24,.03)] overflow-hidden">
            <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E8DDD0] flex items-center gap-2">
              <IconUser size={18} className="text-[#56402A]" />
              <h2 className="text-sm font-bold text-[#56402A] uppercase tracking-wide">Pengaturan Akun</h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 sm:p-8 space-y-5">
              {/* Read-only ID Block */}
              {/* <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#56402A] uppercase tracking-wider flex items-center gap-1">
                  ID Pengguna <span className="text-[#B8A080] font-normal text-[11px]">(Tidak dapat diubah)</span>
                </label>
                <div className="relative">
                  <IconId className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B8A080]" size={18} />
                  <input
                    type="text"
                    value={user?.id_pengguna || ""}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-100/80 border border-[#D4C4AE]/40 rounded-xl text-sm text-[#9A7E5A] font-mono cursor-not-allowed select-none"
                  />
                </div>
              </div> */}

              {/* Nama Pengguna Field */}
              <div className="space-y-1.5">
                <label htmlFor="nama_pengguna" className="text-xs font-bold text-[#56402A] uppercase tracking-wider">
                  Nama Pengguna
                </label>
                <div className="relative">
                  <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A7E5A]" size={18} />
                  <input
                    id="nama_pengguna"
                    type="text"
                    maxLength={32}
                    value={namaPengguna}
                    onChange={(e) => setNamaPengguna(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2]/50 border border-[#D4C4AE]/60 rounded-xl text-sm text-[#3A2818] placeholder-[#B8A080] focus:outline-hidden focus:border-[#7A5E3E] focus:bg-white transition-all"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-bold text-[#56402A] uppercase tracking-wider">
                  Alamat Email *
                </label>
                <div className="relative">
                  <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A7E5A]" size={18} />
                  <input
                    id="email"
                    type="email"
                    maxLength={32}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2]/50 border border-[#D4C4AE]/60 rounded-xl text-sm text-[#3A2818] placeholder-[#B8A080] focus:outline-hidden focus:border-[#7A5E3E] focus:bg-white transition-all"
                    placeholder="nama@email.com"
                    required
                  />
                </div>
              </div>

              {/* Accordion Ubah Password */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  className="flex items-center justify-between w-full py-3 px-4 bg-[#FAF7F2] hover:bg-[#E8DDD0]/30 border border-[#D4C4AE]/60 rounded-xl text-sm font-semibold text-[#56402A] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <IconLock size={16} />
                    Ubah Password Akun
                  </span>
                  <IconChevronDown size={16} className={`transition-transform duration-200 ${isChangingPassword ? "rotate-180" : ""}`} />
                </button>

                {isChangingPassword && (
                  <div className="mt-4 p-4 border border-[#D4C4AE]/40 rounded-xl bg-[#FAF7F2]/20 space-y-4">
                    {/* Password Lama */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#56402A] uppercase tracking-wider">Password Lama</label>
                      <div className="relative">
                        <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A7E5A]" size={18} />
                        <input
                          type={showOldPass ? "text" : "password"}
                          maxLength={255}
                          value={passwordLama}
                          onChange={(e) => setPasswordLama(e.target.value)}
                          placeholder="Masukkan password saat ini"
                          className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#D4C4AE]/60 rounded-xl text-sm text-[#3A2818] focus:outline-hidden focus:border-[#7A5E3E]"
                        />
                        <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A7E5A]">
                          {showOldPass ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Password Baru */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#56402A] uppercase tracking-wider">Password Baru</label>
                      <div className="relative">
                        <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A7E5A]" size={18} />
                        <input
                          type={showNewPass ? "text" : "password"}
                          maxLength={255}
                          value={passwordBaru}
                          onChange={(e) => setPasswordBaru(e.target.value)}
                          placeholder="Minimal 6 karakter"
                          className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#D4C4AE]/60 rounded-xl text-sm text-[#3A2818] focus:outline-hidden focus:border-[#7A5E3E]"
                        />
                        <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A7E5A]">
                          {showNewPass ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Konfirmasi Password Baru */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#56402A] uppercase tracking-wider">Konfirmasi Password Baru</label>
                      <div className="relative">
                        <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A7E5A]" size={18} />
                        <input
                          type={showConfirmPass ? "text" : "password"}
                          maxLength={255}
                          value={konfirmasiPasswordBaru}
                          onChange={(e) => setKonfirmasiPasswordBaru(e.target.value)}
                          placeholder="Ulangi password baru Anda"
                          className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#D4C4AE]/60 rounded-xl text-sm text-[#3A2818] focus:outline-hidden focus:border-[#7A5E3E]"
                        />
                        <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A7E5A]">
                          {showConfirmPass ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="pt-4 border-t border-[#E8DDD0]/50 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#56402A] text-[#F3ECE0] px-6 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#3A2818] shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IconDeviceFloppy size={16} />
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* RENDER LAYAR TOAST UTAMA DI SINI */}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </UserLayout>
  );
}