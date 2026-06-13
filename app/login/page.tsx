"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react"; // Assuming NextAuth setup
import { IconMail, IconLock, IconEye, IconEyeOff, IconArrowRight } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { ToastContainer, useToast } from "@/components/Toast";

// Import your custom toast notification hooks

interface LoginForm {
	email: string;
	password: string;
}

export default function PenggunaLoginPage() {
	const router = useRouter();
	const { toasts, toast, remove } = useToast();

	const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
	const [errors, setErrors] = useState<Partial<LoginForm>>({});
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);

	// Frontend validation modified for email matching 'pengguna' schema
	function validate() {
		const e: Partial<LoginForm> = {};
		if (!form.email.trim()) {
			e.email = "Email wajib diisi";
		} else if (!/\S+@\S+\.\S+/.test(form.email)) {
			e.email = "Format email tidak valid";
		}
		if (!form.password) e.password = "Password wajib diisi";

		setErrors(e);
		return Object.keys(e).length === 0;
	}

	function handleChange(field: keyof LoginForm, value: string) {
		setForm((f) => ({ ...f, [field]: value }));
		if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!validate()) return;

		setLoading(true);
		try {
			const result = await signIn("credentials", {
				identity: form.email, // Maps to your credentials identifier backend
				password: form.password,
				role: "pengguna", // Updated role target
				redirect: false,
			});

			if (result?.error) {
				toast({
					type: "error",
					title: "Gagal Masuk",
					message: "Email atau password salah.",
				});
				return;
			}

			toast({
				type: "success",
				title: "Login Berhasil!",
				message: "Selamat datang kembali di ZeBook! Mengalihkan...",
				duration: 2000,
			});

			setTimeout(() => {
				router.push("/"); // Direct normal user to public store/home or user dashboard
				router.refresh();
			}, 1500);

		} catch {
			toast({
				type: "error",
				title: "Kesalahan Jaringan",
				message: "Tidak dapat terhubung ke server.",
			});
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 select-none">
			<div className="max-w-md w-full space-y-8 bg-white p-8 rounded-[20px] border border-[#D4C4AE]/40 shadow-[0_8px_32px_rgba(58,40,24,.05)]">

				{/* Branding Header */}
				<div className="flex flex-col items-center text-center">
					<div className="w-14 h-14 bg-linear-to-br from-[#B8A080] to-[#7A5E3E] rounded-xl overflow-hidden flex items-center justify-center shadow-sm mb-3">
						<Image src="/images/zebook.png" className="w-14 h-14 object-cover" alt="ZeBook Logo" width={56} height={56} />
					</div>
					<h2 className="font-serif-elegant text-3xl font-semibold text-[#56402A] tracking-wide">
						Ze<em className="not-italic text-[#9A7E5A]">Boo</em>k
					</h2>
					<p className="mt-2 text-sm text-[#9A7E5A]">Masuk ke akun pembaca Anda untuk melanjutkan</p>
				</div>

				{/* Form Elements Box */}
				<form className="mt-8 space-y-5" onSubmit={handleSubmit}>

					{/* Email Field Input Layout */}
					<div className="space-y-1.5">
						<label htmlFor="email" className="text-xs font-bold text-[#56402A] uppercase tracking-wider">
							Email Pembaca
						</label>
						<div className="relative">
							<IconMail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A7E5A]" size={18} />
							<input
								id="email"
								type="text"
								value={form.email}
								onChange={(e) => handleChange("email", e.target.value)}
								className={`w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2]/50 border rounded-xl text-sm text-[#3A2818] placeholder-[#B8A080] focus:outline-hidden focus:bg-white transition-all ${errors.email ? "border-red-400 focus:border-red-500" : "border-[#D4C4AE]/60 focus:border-[#7A5E3E]"
									}`}
								placeholder="nama@email.com"
								disabled={loading}
							/>
						</div>
						{errors.email && (
							<p className="text-[11px] font-medium text-red-500 pl-1">{errors.email}</p>
						)}
					</div>

					{/* Password Field Input Layout */}
					<div className="space-y-1.5">
						<label htmlFor="password" className="text-xs font-bold text-[#56402A] uppercase tracking-wider">
							Password
						</label>
						<div className="relative">
							<IconLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A7E5A]" size={18} />
							<input
								id="password"
								type={showPassword ? "text" : "password"}
								value={form.password}
								onChange={(e) => handleChange("password", e.target.value)}
								className={`w-full pl-10 pr-10 py-2.5 bg-[#FAF7F2]/50 border rounded-xl text-sm text-[#3A2818] placeholder-[#B8A080] focus:outline-hidden focus:bg-white transition-all ${errors.password ? "border-red-400 focus:border-red-500" : "border-[#D4C4AE]/60 focus:border-[#7A5E3E]"
									}`}
								placeholder="••••••••"
								disabled={loading}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A7E5A] hover:text-[#56402A] transition-colors"
								disabled={loading}
							>
								{showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
							</button>
						</div>
						{errors.password && (
							<p className="text-[11px] font-medium text-red-500 pl-1">{errors.password}</p>
						)}
					</div>

					<Link href="/forgot-password" className="text-xs font-semibold text-[#9A7E5A] hover:text-[#56402A] transition-colors">
						Lupa Password?
					</Link>

					{/* Submit Action Button */}
					<button
						type="submit"
						disabled={loading}
						className="w-full mt-2 flex items-center justify-center gap-2 bg-[#56402A] text-[#F3ECE0] py-3 rounded-xl text-sm font-semibold hover:bg-[#3A2818] shadow-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? "Memproses..." : "Masuk"}
						{!loading && <IconArrowRight size={16} />}
					</button>
				</form>

				{/* Switcher Option Footer */}
				<div className="text-center pt-2 border-t border-[#E8DDD0]/50 text-sm text-[#9A7E5A]">
					Belum memiliki akun ZeBook?{" "}
					<Link href="/register" className="font-semibold text-[#56402A] hover:underline">
						Daftar Di Sini
					</Link>
				</div>
			</div>

			{/* Mount Toast Notification Layer */}
			<ToastContainer toasts={toasts} onRemove={remove} />
		</div>
	);
}