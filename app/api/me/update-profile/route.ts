import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { authOptions } from "@/core/auth"

export async function PATCH(req: NextRequest) {
  try {
    // 1. Validasi Sesi
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id_pengguna = session.user.id;

    // 2. Periksa Keberadaan Pengguna (termasuk kolom password untuk verifikasi)
    const existing = await prisma.pengguna.findUnique({
      where: { id_pengguna },
    });
    if (!existing) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    const body = await req.json();
    const { nama_pengguna, email, passwordLama, passwordBaru } = body;

    // 3. Validasi Unik Email jika ada perubahan email
    if (email && email !== existing.email) {
      const emailTaken = await prisma.pengguna.findUnique({ where: { email } });
      if (emailTaken) {
        return NextResponse.json({ error: "Email sudah digunakan oleh akun lain" }, { status: 409 });
      }
    }

    let hashedPassword = undefined;

    // 4. Validasi Perubahan Password Keamanan Tinggi
    if (passwordBaru) {
      if (!passwordLama) {
        return NextResponse.json({ error: "Password lama wajib diisi untuk mengubah password" }, { status: 400 });
      }

      // Bandingkan password lama dengan hash di database
      const isPasswordCorrect = await bcrypt.compare(passwordLama, existing.password);
      if (!isPasswordCorrect) {
        return NextResponse.json({ error: "Password lama yang Anda masukkan salah" }, { status: 400 });
      }

      // Hash password baru jika validasi sukses
      hashedPassword = await bcrypt.hash(passwordBaru, 10);
    }

    // 5. Eksekusi Pembaruan Data ke Database
    const updated = await prisma.pengguna.update({
      where: { id_pengguna },
      data: {
        ...(nama_pengguna !== undefined && { nama_pengguna }),
        ...(email !== undefined && { email }),
        ...(hashedPassword !== undefined && { password: hashedPassword }),
      },
      select: {
        id_pengguna: true,
        nama_pengguna: true,
        email: true,
        koin: true,
        stamp: true,
      },
    });

    return NextResponse.json({ message: "Profil berhasil diperbarui", data: updated });
  } catch (error) {
    console.error("Error PATCH me/profile:", error);
    return NextResponse.json({ error: "Gagal memperbarui data profil" }, { status: 500 });
  }
}