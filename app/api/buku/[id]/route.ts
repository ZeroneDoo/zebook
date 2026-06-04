import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

// ── NEW: GET Single Buku beserta array Kategori terpilih untuk keperluan Form Edit ──
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id: id_buku } = await params

    // 1. Ambil data utama buku
    const bukuResult: { id_buku: string }[] = await prisma.$queryRawUnsafe(`SELECT * FROM buku WHERE id_buku = ?`, id_buku)
    if (!bukuResult || bukuResult.length === 0) {
      return NextResponse.json({ error: 'Buku tidak ditemukan' }, { status: 404 })
    }
    const buku = bukuResult[0]

    // 2. Ambil daftar id_kategori yang terikat dari tabel relasi/pivot Anda
    // Catatan: Ganti 'buku_kategori' di bawah ini sesuai nama tabel pivot relasi Many-to-Many Anda
    const relasiKategori: { id_kategori: string }[] = await prisma.$queryRawUnsafe(
      `SELECT id_kategori FROM buku_kategori WHERE id_buku = ?`, 
      id_buku
    )

    // Petakan hasil query menjadi array string biasa: ["KAT0001", "KAT0002"]
    const selectedKategori = relasiKategori.map((item: { id_kategori: string }) => item.id_kategori)

    // Kembalikan objek data buku lengkap dengan field selectedKategori
    return NextResponse.json({
      ...buku,
      selectedKategori
    })

  } catch (error: unknown) {
    console.error("Error GET detail buku:", error)
    return NextResponse.json({ error: "Gagal mengambil detail relasi buku" }, { status: 500 })
  }
}

// PUT untuk memperbarui data buku memanfaatkan CALL STORED PROCEDURE sp_edit_buku
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id: id_buku } = await params
    const body = await req.json()
    const { judul, deskripsi, koin, stamp, penerbit, penulis, thn_terbit, kategori_ids } = body

    const checkBuku: { id_buku: string }[] = await prisma.$queryRawUnsafe(`SELECT id_buku FROM buku WHERE id_buku = ?`, id_buku)
    if (!checkBuku || checkBuku.length === 0) {
      return NextResponse.json({ error: 'Data identifikasi buku tidak ditemukan' }, { status: 404 })
    }

    await prisma.$executeRawUnsafe(
      `CALL sp_edit_buku(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id_buku,
      judul,
      deskripsi || null,
      Number(koin) || 0,
      Number(stamp) || 0,
      penerbit,
      penulis,
      Number(thn_terbit),
      kategori_ids || ""
    )

    return NextResponse.json({ success: true, message: "Data buku berhasil diupdate" })
  } catch (error: unknown) {
    console.error("Error Stored Procedure PUT:", error)
    return NextResponse.json({ error: (error as Error).message || "Gagal memperbarui data buku" }, { status: 500 })
  }
}

// DELETE untuk melenyapkan data buku
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id: id_buku } = await params

    const checkBuku: { id_buku: string }[] = await prisma.$queryRawUnsafe(`SELECT id_buku FROM buku WHERE id_buku = ?`, id_buku)
    if (!checkBuku || checkBuku.length === 0) {
      return NextResponse.json({ error: 'Buku tidak berwujud di database' }, { status: 404 })
    }

    await prisma.$executeRawUnsafe(`DELETE FROM buku_kategori WHERE id_buku = ?`, id_buku)
    await prisma.$executeRawUnsafe(`DELETE FROM detail_buku WHERE id_buku = ?`, id_buku)
    await prisma.$executeRawUnsafe(`DELETE FROM buku WHERE id_buku = ?`, id_buku)

    return NextResponse.json({ message: 'Spesimen buku beserta unitnya berhasil dibersihkan' })
  } catch (error: unknown) {
    console.error("Error DELETE buku:", error)
    return NextResponse.json({ error: "Gagal menghapus entitas buku" }, { status: 500 })
  }
}