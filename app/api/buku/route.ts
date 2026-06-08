import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// GET untuk mengambil data daftar buku (disertai search & pagination)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const pageParam = searchParams.get("page")
    const limitParam = searchParams.get("limit")
    const search = searchParams.get("search")
    const sortFieldParam = searchParams.get("sort_field")
    const sortDirParam = searchParams.get("sort_dir")

    const usePagination = pageParam && limitParam

    const allowedSortFields = ["id_buku", "judul", "stok", "koin", "thn_terbit"]
    const sortField = allowedSortFields.includes(sortFieldParam || "") ? sortFieldParam : "id_buku"
    const sortDir = sortDirParam?.toUpperCase() === "DESC" ? "DESC" : "ASC"
    
    let whereQuery = ""
    let keyword = ""

    if (search) {
      whereQuery = `WHERE id_buku LIKE ? OR judul LIKE ? OR penulis LIKE ?`
      keyword = `%${search}%`
    }

    if (!usePagination) {
      const sql = `
      SELECT * FROM buku ${whereQuery} ORDER BY ${sortField} ${sortDir}`
      const queryResult = search 
        ? await prisma.$queryRawUnsafe(sql, keyword, keyword, keyword)
        : await prisma.$queryRawUnsafe(sql)
      return NextResponse.json({ data: queryResult })
    }

    const page = Number(pageParam)
    const limit = Number(limitParam)
    const offset = (page - 1) * limit

    let bukuData: unknown
    let totalResult: unknown

    if (search) {
      bukuData = await prisma.$queryRawUnsafe(
        `SELECT * FROM buku ${whereQuery} ORDER BY ${sortField} ${sortDir} LIMIT ? OFFSET ?`,
        keyword, keyword, keyword, limit, offset
      )
      totalResult = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as total FROM buku ${whereQuery}`, keyword, keyword, keyword)
    } else {
      bukuData = await prisma.$queryRawUnsafe(`SELECT * FROM buku ORDER BY ${sortField} ${sortDir} LIMIT ? OFFSET ?`, limit, offset)
      totalResult = await prisma.$queryRaw`SELECT COUNT(*) as total FROM buku`
    }

    const totalData = Number((totalResult as { total: unknown }[])[0].total)

    return NextResponse.json({
      data: bukuData,
      pagination: {
        totalData,
        totalPage: Math.ceil(totalData / limit),
        currentPage: page,
        limit,
      }
    })
  } catch (error) {
    console.error("Error API Buku GET:", error)
    return NextResponse.json({ error: "Gagal memuat buku" }, { status: 500 })
  }
}

// POST untuk membuat buku BARU memanfaatkan CALL STORED PROCEDURE sp_tambah_buku
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    const judul = formData.get("judul") as string
    const deskripsi = formData.get("deskripsi") as string
    const stok = formData.get("stok") as string
    const koin = formData.get("koin") as string
    const stamp = formData.get("stamp") as string
    const penerbit = formData.get("penerbit") as string
    const penulis = formData.get("penulis") as string
    const thn_terbit = formData.get("thn_terbit") as string
    const kategori_ids = formData.get("kategori_ids") as string
    // const body = await req.json()
    // const { judul, deskripsi, stok, koin, stamp, penerbit, penulis, thn_terbit, kategori_ids } = body

    const file = formData.get("file") as File | null

    if (!judul || !penerbit || !penulis || !thn_terbit) {
      return NextResponse.json({ error: 'Parameter judul, penerbit, penulis, dan tahun wajib terpenuhi' }, { status: 400 })
    }

    let imgUrl = "/images/placeholder-book.png"

    // Jika ada file biner yang dikirimkan, simpan ke server lokal
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Buat nama berkas unik berbasis waktu
      const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`
      const uploadDir = join(process.cwd(), "public", "images/books")
      const filePath = join(uploadDir, uniqueFilename)

      // Pastikan folder public/uploads telah terbuat
      await mkdir(uploadDir, { recursive: true })
      // Tulis file ke disk storage
      await writeFile(filePath, buffer)
      
      // Definisikan path URL publiknya
      imgUrl = `/images/books/${uniqueFilename}`
    }

    console.log("Input POST FormData Buku Berhasil Diekstrak. URL Gambar:", imgUrl)

    // Eksekusi pemanggilan MySQL Stored Procedure
    await prisma.$executeRawUnsafe(`SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci`);
    // Signature: sp_tambah_buku(p_judul, p_deskripsi, p_stok, p_koin, p_stamp, p_penerbit, p_penulis, p_thn_terbit, p_kategori_ids)
    await prisma.$executeRawUnsafe(
      `CALL sp_tambah_buku(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      judul,
      deskripsi || null,
      Number(stok) || 0,
      Number(koin) || 0,
      Number(stamp) || 0,
      penerbit,
      penulis,
      Number(thn_terbit),
      kategori_ids || "", // String terpisah koma misal: 'KAT0001,KAT0002'
      imgUrl
    )

    return NextResponse.json({ success: true, message: "Buku berhasil didaftarkan" }, { status: 201 })
  } catch (error: unknown) {
    console.error("Error Stored Procedure POST:", error)
    return NextResponse.json({ error: "Gagal memproses tambah buku" }, { status: 500 })
  }
}