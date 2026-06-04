"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound, Mail, ArrowRight, Loader2, BookCopy, User2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface LoginForm {
	username: string;
	password: string;
}

// ─── Shared input wrapper ─────────────────────────────────────────────────────

function InputField({
	label,
	error,
	required,
	children,
}: {
	label: string;
	error?: string;
	required?: boolean;
	children: React.ReactNode;
}) {
	return (
		<div>
			<label className="block text-xs font-semibold text-gray-600 mb-1.5">
				{label} {required && <span className="text-[#E8461E]">*</span>}
			</label>
			<div
				className={`flex items-center gap-2.5 border rounded-xl px-3.5 py-2.5 transition-all ${error
					? "border-red-400 bg-red-50"
					: "border-gray-200 bg-gray-50 focus-within:border-[#E8461E] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100"
					}`}
			>
				{children}
			</div>
			{error && <p className="mt-1 text-xs text-red-500">{error}</p>}
		</div>
	);
}

// ─── Login ────────────────────────────────────────────────────────────────────

function LoginPanel() {
	const router = useRouter()

	const [form, setForm] = useState<LoginForm>({ username: "", password: "" });
	const [errors, setErrors] = useState<Partial<LoginForm>>({});
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [serverError, setServerError] = useState("");

	function validate() {
		const e: Partial<LoginForm> = {};
		if (!form.username.trim()) e.username = "Username wajib diisi";
		if (!form.password) e.password = "Password wajib diisi";
		setErrors(e);
		return Object.keys(e).length === 0;
	}

	function handleChange(field: keyof LoginForm, value: string) {
		setForm((f) => ({ ...f, [field]: value }));
		if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
		if (serverError) setServerError("");
	}

	async function handleSubmit() {
		if (!validate()) return;
		setLoading(true);
		try {
			const result = await signIn("credentials", {
				identity: form.username,
				password: form.password,
				role: "staff",
				redirect: false,
			})

			if (result?.error) {
				setServerError("Username atau password salah.")
				return
			}

			router.push("/admin/dashboard")  // ✅ next.js router
			router.refresh()
		} catch {
			setServerError("Tidak dapat terhubung ke server.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="space-y-5">
			<InputField label="Username" error={errors.username} required>
				<User2 size={15} className="text-gray-400 shrink-0" />
				<input
					type="username"
					placeholder="username_admin"
					value={form.username}
					onChange={(e) => handleChange("username", e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
					className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
				/>
			</InputField>

			<InputField label="Password" error={errors.password} required>
				<KeyRound size={15} className="text-gray-400 shrink-0" />
				<input
					type={showPassword ? "text" : "password"}
					placeholder="Masukkan password"
					value={form.password}
					onChange={(e) => handleChange("password", e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
					className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
				/>
				<button
					type="button"
					onClick={() => setShowPassword((v) => !v)}
					className="text-gray-400 hover:text-gray-600 shrink-0 transition-colors"
				>
					{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
				</button>
			</InputField>

			{serverError && (
				<div className="px-3.5 py-2.5 bg-red-50 border border-red-100 rounded-xl">
					<p className="text-xs text-red-500 font-medium">{serverError}</p>
				</div>
			)}

			<button
				onClick={handleSubmit}
				disabled={loading}
				className="w-full flex items-center justify-center gap-2 bg-[#E8461E] hover:bg-orange-600 active:scale-[0.98] disabled:opacity-60 text-white text-sm font-semibold py-3 sm:py-2.5 rounded-xl shadow-md shadow-orange-200 transition-all duration-200"
			>
				{loading ? (
					<><Loader2 size={16} className="animate-spin" /> Masuk…</>
				) : (
					<><ArrowRight size={16} /> Masuk</>
				)}
			</button>
		</div>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuthPage() {
	return (
		<div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start sm:justify-center sm:p-4">

			{/* Background decoration */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">

				{/* Large ambient blobs */}
				<div className="absolute -top-40 -right-40 w-500px h-500px bg-orange-200 rounded-full opacity-30 blur-[100px] animate-[pulse_8s_ease-in-out_infinite]" />
				<div className="absolute -bottom-40 -left-40 w-500px h-500px bg-amber-100 rounded-full opacity-40 blur-[100px] animate-[pulse_10s_ease-in-out_infinite_2s]" />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-600px h-300px bg-orange-50 rounded-full opacity-50 blur-[80px]" />

				{/* ── Circles ── */}
				<div className="absolute top-[12%] left-[15%] w-3 h-3 bg-[#E8461E] rounded-full opacity-20 blur-[2px] animate-[float_6s_ease-in-out_infinite]" />
				<div className="absolute top-[25%] right-[20%] w-2 h-2 bg-orange-400 rounded-full opacity-25 blur-[1px] animate-[float_8s_ease-in-out_infinite_1s]" />
				<div className="absolute top-[60%] left-[8%] w-4 h-4 bg-amber-300 rounded-full opacity-20 blur-[3px] animate-[float_7s_ease-in-out_infinite_2s]" />
				<div className="absolute top-[70%] right-[12%] w-2.5 h-2.5 bg-[#E8461E] rounded-full opacity-15 blur-[2px] animate-[float_9s_ease-in-out_infinite_0.5s]" />
				<div className="absolute top-[40%] left-[5%] w-1.5 h-1.5 bg-orange-300 rounded-full opacity-30 animate-[float_5s_ease-in-out_infinite_3s]" />
				<div className="absolute top-[15%] right-[8%] w-5 h-5 bg-amber-200 rounded-full opacity-25 blur-4px animate-[float_11s_ease-in-out_infinite_1.5s]" />
				<div className="absolute bottom-[20%] left-[30%] w-2 h-2 bg-[#E8461E] rounded-full opacity-20 blur-[1px] animate-[float_7s_ease-in-out_infinite_4s]" />
				<div className="absolute bottom-[35%] right-[25%] w-3.5 h-3.5 bg-orange-200 rounded-full opacity-20 blur-[3px] animate-[float_6s_ease-in-out_infinite_2.5s]" />
				<div className="absolute top-[82%] left-[55%] w-2 h-2 bg-amber-400 rounded-full opacity-25 animate-[float_9s_ease-in-out_infinite_1s]" />
				<div className="absolute top-[5%] left-[45%] w-3 h-3 bg-orange-300 rounded-full opacity-20 blur-[2px] animate-[float_10s_ease-in-out_infinite_3.5s]" />

				{/* ── Rectangles / pills ── */}
				<div className="absolute top-[8%] left-[30%] w-10 h-3 bg-[#E8461E] rounded-md opacity-10 blur-[2px] animate-[floatSpin_9s_ease-in-out_infinite]" />
				<div className="absolute top-[45%] right-[6%] w-14 h-2 bg-orange-300 rounded-full opacity-15 blur-[1px] animate-[floatSpin_12s_ease-in-out_infinite_2s]" />
				<div className="absolute bottom-[28%] left-[18%] w-8 h-4 bg-amber-400 rounded-lg opacity-12 blur-[3px] animate-[floatSpin_8s_ease-in-out_infinite_1s]" />
				<div className="absolute top-[55%] left-[2%] w-12 h-2.5 bg-[#E8461E] rounded-md opacity-10 blur-[2px] animate-[floatSpin_14s_ease-in-out_infinite_3s]" />
				<div className="absolute bottom-[10%] right-[30%] w-16 h-2 bg-orange-200 rounded-full opacity-20 blur-[1px] animate-[floatSpin_10s_ease-in-out_infinite_0.5s]" />
				<div className="absolute top-[33%] left-[40%] w-6 h-6 bg-amber-300 rounded-md opacity-10 blur-[3px] animate-[floatSpin_7s_ease-in-out_infinite_4s]" />
				<div className="absolute top-[75%] right-[40%] w-10 h-3 bg-orange-400 rounded-lg opacity-15 blur-[2px] animate-[floatSpin_11s_ease-in-out_infinite_1.5s]" />

				{/* ── Diamonds (rotated squares) ── */}
				<div className="absolute top-[20%] left-[60%] w-4 h-4 bg-[#E8461E] opacity-15 blur-[1px] rotate-45 animate-[float_8s_ease-in-out_infinite_2s]" />
				<div className="absolute top-[65%] left-[25%] w-3 h-3 bg-orange-300 opacity-20 blur-[2px] rotate-45 animate-[float_6s_ease-in-out_infinite_3.5s]" />
				<div className="absolute bottom-[15%] right-[18%] w-5 h-5 bg-amber-400 opacity-12 blur-[3px] rotate-45 animate-[float_10s_ease-in-out_infinite_1s]" />
				<div className="absolute top-[88%] left-[70%] w-2.5 h-2.5 bg-[#E8461E] opacity-20 rotate-45 animate-[float_7s_ease-in-out_infinite_2.5s]" />
				<div className="absolute top-[3%] right-[35%] w-4 h-4 bg-orange-200 opacity-15 blur-[2px] rotate-45 animate-[float_9s_ease-in-out_infinite_4.5s]" />

				{/* ── Rings (border-only circles) ── */}
				<div className="absolute top-[18%] left-[72%] w-8 h-8 border border-[#E8461E] rounded-full opacity-15 animate-[floatSpin_13s_ease-in-out_infinite]" />
				<div className="absolute top-[50%] left-[3%] w-6 h-6 border border-orange-300 rounded-full opacity-20 animate-[floatSpin_9s_ease-in-out_infinite_2s]" />
				<div className="absolute bottom-[22%] right-[8%] w-10 h-10 border border-amber-300 rounded-full opacity-15 animate-[floatSpin_11s_ease-in-out_infinite_1s]" />
				<div className="absolute top-[78%] left-[12%] w-5 h-5 border border-[#E8461E] rounded-full opacity-12 animate-[floatSpin_8s_ease-in-out_infinite_3s]" />
				<div className="absolute top-[38%] right-[3%] w-7 h-7 border border-orange-400 rounded-full opacity-10 animate-[floatSpin_15s_ease-in-out_infinite_0.5s]" />

				{/* ── Cross / plus shapes ── */}
				<div className="absolute top-[30%] left-[88%] opacity-10 animate-[float_10s_ease-in-out_infinite_2s]">
					<div className="relative w-5 h-5">
						<div className="absolute top-1/2 left-0 w-full h-2px -translate-y-1/2 bg-[#E8461E] rounded-full blur-[1px]" />
						<div className="absolute left-1/2 top-0 h-full w-2px -translate-x-1/2 bg-[#E8461E] rounded-full blur-[1px]" />
					</div>
				</div>
				<div className="absolute bottom-[40%] left-[45%] opacity-12 animate-[float_7s_ease-in-out_infinite_3s]">
					<div className="relative w-4 h-4">
						<div className="absolute top-1/2 left-0 w-full h-2px -translate-y-1/2 bg-orange-400 rounded-full" />
						<div className="absolute left-1/2 top-0 h-full w-2px -translate-x-1/2 bg-orange-400 rounded-full" />
					</div>
				</div>
				<div className="absolute top-[90%] right-[50%] opacity-15 animate-[float_12s_ease-in-out_infinite_1s]">
					<div className="relative w-6 h-6">
						<div className="absolute top-1/2 left-0 w-full h-2px -translate-y-1/2 bg-amber-400 rounded-full blur-[1px]" />
						<div className="absolute left-1/2 top-0 h-full w-2px -translate-x-1/2 bg-amber-400 rounded-full blur-[1px]" />
					</div>
				</div>

				{/* ── Tiny dots cluster ── */}
				<div className="absolute top-[48%] right-[15%] flex gap-1.5 opacity-20 animate-[float_8s_ease-in-out_infinite_2s]">
					<div className="w-1 h-1 bg-[#E8461E] rounded-full" />
					<div className="w-1 h-1 bg-[#E8461E] rounded-full" />
					<div className="w-1 h-1 bg-[#E8461E] rounded-full" />
				</div>
				<div className="absolute top-[22%] left-[25%] flex flex-col gap-1.5 opacity-15 animate-[float_11s_ease-in-out_infinite_4s]">
					<div className="w-1 h-1 bg-orange-400 rounded-full" />
					<div className="w-1 h-1 bg-orange-400 rounded-full" />
					<div className="w-1 h-1 bg-orange-400 rounded-full" />
				</div>
			</div>

			<style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-18px) translateX(8px); }
          66% { transform: translateY(10px) translateX(-6px); }
        }
        @keyframes floatSpin {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          33% { transform: translateY(-14px) translateX(6px) rotate(45deg); }
          66% { transform: translateY(8px) translateX(-5px) rotate(-20deg); }
        }
      `}</style>

			<div className="relative w-full max-w-md sm:mt-0">

				{/* Logo */}
				<div className="flex items-center justify-center gap-2.5 mt-8 mb-5 sm:mt-0 sm:mb-8">
					<div className="w-10 h-10 bg-[#E8461E] rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
						<BookCopy size={20} className="text-white fill-white" />
					</div>
					<span className="text-2xl font-bold text-gray-900 tracking-tight">ZeBook</span>
				</div>

				{/* Card */}
				<div className="bg-white rounded-none sm:rounded-2xl border sm:border-gray-100 shadow-none sm:shadow-xl sm:shadow-black/5 overflow-hidden">

					{/* Form area */}
					<div className="px-4 py-6 sm:px-6 sm:py-7">
						<div className="mb-5">
							<h1 className="text-base font-bold text-gray-900">
								Selamat datang kembali
							</h1>
							<p className="text-xs text-gray-400 mt-0.5">
								Masuk ke panel admin ZeBook
							</p>
						</div>

						<LoginPanel />
					</div>
				</div>

				<p className="text-center text-xs text-gray-300 mt-4 sm:mt-6">
					© {new Date().getFullYear()} ZeBook. All rights reserved.
				</p>
			</div>
		</div>
	);
}