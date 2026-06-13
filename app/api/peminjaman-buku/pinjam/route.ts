import { NextRequest, NextResponse } from 'next/server'
import { sp_buat_peminjaman } from '@/lib/procedures'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_pengguna, id_buku, metode } = body;
    const { tgl_pinjam } = body;

    // 1. Validasi field wajib dari Client
    if (!id_pengguna || !id_buku || !metode) {
      return NextResponse.json(
        { error: "Field id_pengguna, id_buku, dan metode wajib diisi." },
        { status: 400 }
      );
    }

    // 2. Set default tgl_pinjam jika tidak dikirim dari client (default: Hari Ini)
    const tanggalPinjamDate = tgl_pinjam ? new Date(tgl_pinjam) : new Date();

    // 3. Hitung tgl_kembali otomatis secara presisi (+14 hari)
    const tanggalKembaliDate = new Date(tanggalPinjamDate);
    tanggalKembaliDate.setDate(tanggalKembaliDate.getDate() + 14);

    const peminjaman = await sp_buat_peminjaman(
      id_pengguna,
      id_buku,
      tanggalPinjamDate,
      tanggalKembaliDate,
      metode
    )

    // 5. Kembalikan respons sukses
    return NextResponse.json(
      {
        message: "Peminjaman berhasil dibuat.",
        data: peminjaman,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error pada API Peminjaman:", error);
    
    // Menangkap pesan error kustom dari SIGNAL SQLSTATE (stok habis, koin kurang, dll)
    return NextResponse.json(
      { error: (error as Error).message || "Terjadi kesalahan pada server." },
      { status: 400 }
    );
  }
}