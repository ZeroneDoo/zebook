import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    // 1. Mengambil ID peminjaman dari parameter URL dinamis
    const { id: id_peminjaman } = await params;

    // 2. Proteksi Awal: Cari data peminjaman & ambil status serta ID detail buku terkait
    const peminjaman = await prisma.peminjaman_buku.findUnique({
      where: { id_peminjaman },
      select: {
        status: true,
        id_detail_buku: true,
      },
    });

    // Jika data peminjaman tidak ditemukan
    if (!peminjaman) {
      return NextResponse.json(
        { error: 'Spesimen data peminjaman tidak ditemukan di database' }, 
        { status: 404 }
      );
    }

    // 3. Validasi Krusial: Tolak pembatalan jika status BUKAN 'DIPROSES'
    if (peminjaman.status !== 'DIPROSES') {
      return NextResponse.json(
        { error: `Peminjaman tidak dapat dibatalkan karena status sudah ${peminjaman.status}` }, 
        { status: 400 }
      );
    }

    // 4. Eksekusi Atomik menggunakan Prisma Transaction
    // Kedua perintah di bawah wajib sukses bersamaan atau gagal bersamaan
    await prisma.$transaction([
      // A. Ubah status detail buku yang bersangkutan kembali menjadi TERSEDIA
      prisma.detail_buku.update({
        where: { id_detail_buku: peminjaman.id_detail_buku },
        data: { status: 'TERSEDIA' },
      }),
      
      // B. Hapus entitas sirkulasi peminjaman dari database
      prisma.peminjaman_buku.delete({
        where: { id_peminjaman },
      }),
    ]);

    return NextResponse.json({ 
      message: 'Peminjaman berhasil dibatalkan dan status buku telah dikembalikan menjadi TERSEDIA' 
    });

  } catch (error: unknown) {
    console.error("Error DELETE peminjaman:", error);
    return NextResponse.json(
      { error: "Gagal mengeksekusi pembatalan entitas peminjaman" }, 
      { status: 500 }
    );
  }
}