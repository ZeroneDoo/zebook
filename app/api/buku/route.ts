import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { BukuModel } from '@/lib/models'
import { Prisma } from '@/app/generated/prisma/client'

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

    const allowedSortFields = ["id_buku", "judul", "stok", "koin", "thn_terbit"] as const
    type SortField = typeof allowedSortFields[number]

    const sortField: SortField = allowedSortFields.includes(sortFieldParam as SortField)
      ? (sortFieldParam as SortField)
      : "id_buku"
    const sortDir = sortDirParam?.toUpperCase() === "DESC" ? "desc" : "asc"

    const whereClause: Prisma.bukuWhereInput = search
      ? {
          OR: [
            { id_buku: { contains: search } },
            { judul: { contains: search } },
            { penulis: { contains: search } },
          ],
        }
      : {}

    // Ditambahkan _count dengan filter kondisi status "TERSEDIA"
    const includeClause = {
      buku_kategori: {
        include: {
          kategori: true,
        },
      },
      detail_buku: true,
      _count: {
        select: {
          detail_buku: {
            where: { status: "TERSEDIA" },
          },
        },
      },
    } satisfies Prisma.bukuInclude

    // ─── 1. KONDISI TANPA PAGINASI ───
    if (!usePagination) {
      const bukuData = await prisma.buku.findMany({
        where: whereClause,
        include: includeClause,
        orderBy: { [sortField]: sortDir },
      })

      // Petakan data untuk menimpa properti 'stok' secara dinamis
      const mappedData = bukuData.map((buku) => ({
        ...buku,
        stok: buku._count.detail_buku,
      })) as BukuModel[]

      return NextResponse.json({ data: mappedData })
    }

    // ─── 2. KONDISI DENGAN PAGINASI ───
    const page = Number(pageParam)
    const limit = Number(limitParam)
    const offset = (page - 1) * limit

    const [bukuData, totalData] = await prisma.$transaction([
      prisma.buku.findMany({
        where: whereClause,
        include: includeClause,
        orderBy: { [sortField]: sortDir },
        take: limit,
        skip: offset,
      }),
      prisma.buku.count({ where: whereClause }),
    ])

    // Petakan data hasil pagination untuk menimpa properti 'stok' secara dinamis
    const mappedData = bukuData.map((buku) => ({
      ...buku,
      stok: buku._count.detail_buku,
    })) as BukuModel[]

    return NextResponse.json({
      data: mappedData,
      pagination: {
        totalData,
        totalPage: Math.ceil(totalData / limit),
        currentPage: page,
        limit,
      },
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

    const file = formData.get("file") as File | null

    if (!judul || !penerbit || !penulis || !thn_terbit) {
      return NextResponse.json({ error: 'Parameter judul, penerbit, penulis, dan tahun wajib terpenuhi' }, { status: 400 })
    }

    let imgUrl = "/images/placeholder-book.png"

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`
      const uploadDir = join(process.cwd(), "public", "images/books")
      const filePath = join(uploadDir, uniqueFilename)

      await mkdir(uploadDir, { recursive: true })
      await writeFile(filePath, buffer)
      
      imgUrl = `/images/books/${uniqueFilename}`
    }

    console.log("Input POST FormData Buku Berhasil Diekstrak. URL Gambar:", imgUrl)

    await prisma.$executeRawUnsafe(`SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci`);
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
      kategori_ids || "", 
      imgUrl
    )

    return NextResponse.json({ success: true, message: "Buku berhasil didaftarkan" }, { status: 201 })
  } catch (error: unknown) {
    console.error("Error Stored Procedure POST:", error)
    return NextResponse.json({ error: "Gagal memproses tambah buku" }, { status: 500 })
  }
}