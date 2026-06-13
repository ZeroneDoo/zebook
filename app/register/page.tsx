"use client";

import { useState } from "react";
import { IconMail, IconLock, IconUser, IconEye, IconEyeOff, IconArrowRight } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Import your server action and toast hooks
import { handleRegister } from "./actions";
import { ToastContainer, useToast } from "@/components/Toast";

export default function RegisterPage() {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState({ nama_pengguna: "", email: "", password: "" });

	// Initialize custom toast notification hooks
	const { toasts, toast, remove } = useToast();

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		// Client-side quick checks
		if (formData.password.length < 6) {
			toast({
				type: "warning",
				title: "Password Terlalu Pendek",
				message: "Password minimal harus memiliki 6 karakter.",
			});
			setIsSubmitting(false);
			return;
		}

		// Execute server action execution layer
		const result = await handleRegister(formData);

		if (!result.success) {
			toast({
				type: "error",
				title: "Pendaftaran Gagal",
				message: result.error || "Terjadi kesalahan tidak terduga.",
			});
			setIsSubmitting(false);
		} else {
			toast({
				type: "success",
				title: "Pendaftaran Berhasil!",
				message: "Akun ZeBook Anda telah dibuat. Mengalihkan ke halaman login...",
				duration: 3000,
			});

			// Clear input states and redirect
			setFormData({ nama_pengguna: "", email: "", password: "" });
			setTimeout(() => {
				router.push("/login");
			}, 3000);
		}
	};

	return (
		<div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 select-none">
			<div className="max-w-md w-full space-y-8 bg-white p-8 rounded-[20px] border border-[#D4C4AE]/40 shadow-[0_8px_32px_rgba(58,40,24,.05)]">

				{/* Branding Header Layout */}
				<div className="flex flex-col items-center text-center">
					<div className="w-14 h-14 bg-linear-to-br from-[#B8A080] to-[#7A5E3E] rounded-xl overflow-hidden flex items-center justify-center shadow-sm mb-3">
						<Image src="/images/zebook.png" className="w-14 h-14 object-cover" alt="ZeBook Logo" width={56} height={56} />
					</div>
					<h2 className="font-serif-elegant text-3xl font-semibold text-[#56402A] tracking-wide">
						Ze<em className="not-italic text-[#9A7E5A]">Boo</em>k
					</h2>
					<p className="mt-2 text-sm text-[#9A7E5A]">Mulai petualangan membaca dengan membuat akun baru</p>
				</div>

				{/* Form Elements Box Wrapper */}
				<form className="mt-8 space-y-5" onSubmit={handleSubmit}>

					{/* Nama Pengguna Field (nama_pengguna) */}
					<div className="space-y-1.5">
						<label htmlFor="nama_pengguna" className="text-xs font-bold text-[#56402A] uppercase tracking-wider">
							Nama Pengguna <span className="text-[#B8A080] font-normal">(Opsional)</span>
						</label>
						<div className="relative">
							<IconUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A7E5A]" size={18} />
							<input
								id="nama_pengguna"
								type="text"
								maxLength={32}
								value={formData.nama_pengguna}
								onChange={(e) => setFormData({ ...formData, nama_pengguna: e.target.value })}
								className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2]/50 border border-[#D4C4AE]/60 rounded-xl text-sm text-[#3A2818] placeholder-[#B8A080] focus:outline-hidden focus:border-[#7A5E3E] focus:bg-white transition-all"
								placeholder="Nama Lengkap Anda"
								disabled={isSubmitting}
							/>
						</div>
					</div>

					{/* Email Field (email) */}
					<div className="space-y-1.5">
						<label htmlFor="email" className="text-xs font-bold text-[#56402A] uppercase tracking-wider">
							Email *
						</label>
						<div className="relative">
							<IconMail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A7E5A]" size={18} />
							<input
								id="email"
								type="email"
								maxLength={32}
								value={formData.email}
								onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2]/50 border border-[#D4C4AE]/60 rounded-xl text-sm text-[#3A2818] placeholder-[#B8A080] focus:outline-hidden focus:border-[#7A5E3E] focus:bg-white transition-all"
								placeholder="nama@email.com"
								required
								disabled={isSubmitting}
							/>
						</div>
					</div>

					{/* Password Field (password) */}
					<div className="space-y-1.5">
						<label htmlFor="password" className="text-xs font-bold text-[#56402A] uppercase tracking-wider">
							Password *
						</label>
						<div className="relative">
							<IconLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A7E5A]" size={18} />
							<input
								id="password"
								type={showPassword ? "text" : "password"}
								maxLength={255}
								value={formData.password}
								onChange={(e) => setFormData({ ...formData, password: e.target.value })}
								className="w-full pl-10 pr-10 py-2.5 bg-[#FAF7F2]/50 border border-[#D4C4AE]/60 rounded-xl text-sm text-[#3A2818] placeholder-[#B8A080] focus:outline-hidden focus:border-[#7A5E3E] focus:bg-white transition-all"
								placeholder="Minimal 6 karakter"
								required
								disabled={isSubmitting}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A7E5A] hover:text-[#56402A] transition-colors"
								disabled={isSubmitting}
							>
								{showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
							</button>
						</div>
					</div>

					{/* Submit Button Trigger */}
					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full mt-2 flex items-center justify-center gap-2 bg-[#56402A] text-[#F3ECE0] py-3 rounded-xl text-sm font-semibold hover:bg-[#3A2818] shadow-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isSubmitting ? "Mendaftarkan..." : "Daftar Akun"}
						{!isSubmitting && <IconArrowRight size={16} />}
					</button>
				</form>

				{/* Footer Link Options */}
				<div className="text-center pt-2 border-t border-[#E8DDD0]/50 text-sm text-[#9A7E5A]">
					Sudah memiliki akun?{" "}
					<Link href="/login" className="font-semibold text-[#56402A] hover:underline">
						Masuk di Sini
					</Link>
				</div>
			</div>

			{/* Mount the toast notification display portal container here */}
			<ToastContainer toasts={toasts} onRemove={remove} />
		</div>
	);
}