import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

type Params = { params: Promise<{ id: string }> }

// ── GET Single Buku (Tetap Sama) ──
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id: id_buku } = await params

    const bukuResult: { id_buku: string }[] = await prisma.$queryRawUnsafe(`SELECT * FROM buku WHERE id_buku = ?`, id_buku)
    if (!bukuResult || bukuResult.length === 0) {
      return NextResponse.json({ error: 'Buku tidak ditemukan' }, { status: 404 })
    }
    const buku = bukuResult[0]

    const relasiKategori: { id_kategori: string }[] = await prisma.$queryRawUnsafe(
      `SELECT id_kategori FROM buku_kategori WHERE id_buku = ?`, 
      id_buku
    )

    const selectedKategori = relasiKategori.map((item: { id_kategori: string }) => item.id_kategori)

    return NextResponse.json({
      ...buku,
      selectedKategori
    })

  } catch (error: unknown) {
    console.error("Error GET detail buku:", error)
    return NextResponse.json({ error: "Gagal mengambil detail relasi buku" }, { status: 500 })
  }
}

// ── PUT (UPDATED): Membaca FormData & Mendukung Update File Gambar ──
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id: id_buku } = await params
    
    // 1. Baca data dari FormData
    const formData = await req.formData()
    
    const judul = formData.get("judul") as string
    const deskripsi = formData.get("deskripsi") as string
    const koin = formData.get("koin") as string
    const stamp = formData.get("stamp") as string
    const penerbit = formData.get("penerbit") as string
    const penulis = formData.get("penulis") as string
    const thn_terbit = formData.get("thn_terbit") as string
    const kategori_ids = formData.get("kategori_ids") as string
    const file = formData.get("file") as File | null

    // 2. Ambil data buku lama untuk mendapatkan img_url yang sudah ada saat ini
    const checkBuku: { id_buku: string; img_url: string | null }[] = await prisma.$queryRawUnsafe(
      `SELECT id_buku, img_url FROM buku WHERE id_buku = ?`, 
      id_buku
    )
    if (!checkBuku || checkBuku.length === 0) {
      return NextResponse.json({ error: 'Data identifikasi buku tidak ditemukan' }, { status: 404 })
    }

    // Default: Ambil URL gambar yang sudah ada di database
    let finalImgUrl = checkBuku[0].img_url || "/placeholder-book.png"

    // 3. Jika user mengunggah file gambar baru di modal edit, timpa variabel finalImgUrl
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`
      const uploadDir = join(process.cwd(), "public", "images/books/")
      const filePath = join(uploadDir, uniqueFilename)

      await mkdir(uploadDir, { recursive: true })
      await writeFile(filePath, buffer)
      
      finalImgUrl = `/images/books/${uniqueFilename}`
    }

    // 4. Panggil Stored Procedure dengan 10 Parameter lengkap!
    await prisma.$executeRawUnsafe(
      `CALL sp_edit_buku(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id_buku,
      judul,
      deskripsi || null,
      Number(koin) || 0,
      Number(stamp) || 0,
      penerbit,
      penulis,
      Number(thn_terbit),
      kategori_ids || "",
      finalImgUrl // <--- Parameter ke-10 (p_img_url)
    )

    return NextResponse.json({ success: true, message: "Data buku berhasil diupdate" })
  } catch (error: unknown) {
    console.error("Error Stored Procedure PUT via FormData:", error)
    return NextResponse.json({ error: (error as Error).message || "Gagal memperbarui data buku" }, { status: 500 })
  }
}

// ── DELETE (Tetap Sama) ──
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