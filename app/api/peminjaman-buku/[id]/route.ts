import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Sesuaikan dengan path konfigurasi prisma Anda
import { peminjaman_buku } from '@/app/generated/prisma/client';

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    // 1. Mengambil ID peminjaman dari parameter URL dinamis
    const { id: id_peminjaman } = await params;

    // 2. Proteksi Awal: Cari data peminjaman & cek statusnya saat ini di database
    const checkPeminjaman: peminjaman_buku[] = await prisma.$queryRawUnsafe(
      `SELECT status FROM peminjaman_buku WHERE id_peminjaman = ?`, 
      id_peminjaman
    );

    // Jika data tidak ditemukan
    if (!checkPeminjaman || checkPeminjaman.length === 0) {
      return NextResponse.json(
        { error: 'Spesimen data peminjaman tidak ditemukan di database' }, 
        { status: 404 }
      );
    }

    const currentStatus = checkPeminjaman[0].status || '';

    // 3. Validasi Krusial: Tolak pembatalan jika status BUKAN 'DIPROSES'
    if (currentStatus.toUpperCase() !== 'DIPROSES') {
      return NextResponse.json(
        { error: `Peminjaman tidak dapat dibatalkan karena status sudah ${currentStatus}` }, 
        { status: 400 }
      );
    }

    // 4. Eksekusi pembersihan data dari database jika lolos validasi
    await prisma.$executeRawUnsafe(
      `DELETE FROM peminjaman_buku WHERE id_peminjaman = ?`, 
      id_peminjaman
    );

    return NextResponse.json({ 
      message: 'Peminjaman berhasil dibatalkan dan entitas sirkulasi dibersihkan' 
    });

  } catch (error: unknown) {
    console.error("Error DELETE peminjaman:", error);
    return NextResponse.json(
      { error: "Gagal mengeksekusi pembatalan entitas peminjaman" }, 
      { status: 500 }
    );
  }
}