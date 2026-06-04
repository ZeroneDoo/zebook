import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> }

// PUT: Memperbarui status unit item MENGGUNAKAN CALL STORED PROCEDURE sp_update_status_detail
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id: id_detail_buku } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status baru wajib diisi" }, { status: 400 });
    }

    // Panggil Prosedur: sp_update_status_detail(p_id_detail, p_status)
    // SP ini secara otomatis memancarkan SIGNAL SQLSTATE '45000' jika ID tidak ditemukan
    await prisma.$executeRawUnsafe(
      `CALL sp_update_status_detail(?, ?)` ,
      id_detail_buku,
      status
    );

    return NextResponse.json({ success: true, message: "Status eksemplar berhasil diperbarui via SP" });
  } catch (error: unknown) {
    console.error("Error CALL sp_update_status_detail:", error);
    return NextResponse.json({ error: (error as Error).message || "Gagal memperbarui status via Stored Procedure" }, { status: 500 });
  }
}

// DELETE: Menghapus salinan unit item dari database
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id: id_detail_buku } = await params;

    // Cek eksistensi
    const check: { id_detail_buku: string }[] = await prisma.$queryRawUnsafe(`SELECT id_detail_buku FROM detail_buku WHERE id_detail_buku = ?`, id_detail_buku);
    if (!check || check.length === 0) {
      return NextResponse.json({ error: "Item unit tidak berwujud di records database" }, { status: 404 });
    }

    // Eksekusi penghapusan raw
    await prisma.$executeRawUnsafe(`DELETE FROM detail_buku WHERE id_detail_buku = ?`, id_detail_buku);

    return NextResponse.json({ message: "Satu kuantitas eksemplar fisik dibersihkan dari sistem" });
  } catch (error: unknown) {
    console.error("Error DELETE detail buku:", error);
    return NextResponse.json({ error: (error as Error).message || "Gagal menghapus item karena keterikatan data transaksi pinjam" }, { status: 500 });
  }
}