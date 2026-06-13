"use server";

import { registerPengguna } from "@/lib/register";

export async function handleRegister(formData: { nama_pengguna: string; email: string; password: string }) {
    const { nama_pengguna, email, password } = formData;

    // Server-side validation safeguards
    if (!email || !password) {
        return { success: false, error: "Email dan Password wajib diisi." };
    }
    if (password.length < 6) {
        return { success: false, error: "Password minimal harus memiliki 6 karakter." };
    }

    try {
        await registerPengguna(nama_pengguna, email, password);
        return { success: true };
    } catch (error) {
        // 1. Safe type guard: verify the error is an object containing a 'code' property
        if (
            error && 
            typeof error === "object" && 
            "code" in error && 
            error.code === "P2002"
        ) {
            return { success: false, error: "Email ini sudah terdaftar. Gunakan email lain." };
        }
        
        return { success: false, error: "Terjadi kesalahan pada server. Silakan coba lagi nanti." };
    }
}