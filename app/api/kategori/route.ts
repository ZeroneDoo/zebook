import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateId } from '@/lib/generated'

// GET semua kategori (dengan pencarian & pagination raw SQL)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const pageParam = searchParams.get("page")
    const limitParam = searchParams.get("limit")
    const search = searchParams.get("search")

    const sortFieldParam = searchParams.get("sort_field")
    const sortDirParam = searchParams.get("sort_dir")

    const usePagination = pageParam && limitParam

    const allowedSortFields = ["id_kategori", "nama_kategori"]
    const sortField = allowedSortFields.includes(sortFieldParam || "") ? sortFieldParam : "id_kategori"
    const sortDir = sortDirParam?.toUpperCase() === "DESC" ? "DESC" : "ASC"
    const orderQuery = `ORDER BY ${sortField} ${sortDir}`

    let whereQuery = ""
    let keyword = ""

    if (search) {
      whereQuery = `WHERE id_kategori LIKE ? OR nama_kategori LIKE ?`
      keyword = `%${search}%`
    }

    // TANPA PAGINATION
    if (!usePagination) {
      if (search) {
        const kategoriData = await prisma.$queryRawUnsafe(
          `SELECT id_kategori, nama_kategori FROM kategori ${whereQuery} ${orderQuery}`,
          keyword,
          keyword
        )
        return NextResponse.json({ data: kategoriData })
      }

      const kategoriData = await prisma.$queryRawUnsafe(`SELECT id_kategori, nama_kategori FROM kategori ${orderQuery}`)
      return NextResponse.json({ data: kategoriData })
    }

    // DENGAN PAGINATION
    const page = Number(pageParam)
    const limit = Number(limitParam)
    const offset = (page - 1) * limit

    let kategoriData: unknown
    let totalResult: unknown

    if (search) {
      kategoriData = await prisma.$queryRawUnsafe(
        `SELECT id_kategori, nama_kategori FROM kategori ${whereQuery} ${orderQuery} LIMIT ? OFFSET ?`,
        keyword,
        keyword,
        limit,
        offset
      )
      totalResult = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as total FROM kategori ${whereQuery}`, keyword, keyword)
    } else {
      kategoriData = await prisma.$queryRawUnsafe(`SELECT id_kategori, nama_kategori FROM kategori ${orderQuery} LIMIT ? OFFSET ?`, limit, offset)
      totalResult = await prisma.$queryRaw`SELECT COUNT(*) as total FROM kategori`
    }

    const totalData = Number((totalResult as unknown as { total: number }[])[0].total)

    return NextResponse.json({
      data: kategoriData,
      pagination: {
        totalData,
        totalPage: Math.ceil(totalData / limit),
        currentPage: page,
        limit,
      },
      sorting: { sortField, sortDir },
    })

  } catch (error) {
    console.log("error api kategori: ", error)
    return NextResponse.json({ error: "Gagal mengambil data kategori" }, { status: 500 })
  }
}

// POST buat kategori baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nama_kategori } = body

    if (!nama_kategori) {
      return NextResponse.json({ error: 'Nama kategori wajib diisi' }, { status: 400 })
    }

    // Menghasilkan id berformat 7 digit (menyesuaikan CHAR(7) di SQL)
    const id_kategori = await generateId('kategori')

    const kategoriBaru = await prisma.kategori.create({
      data: {
        id_kategori,
        nama_kategori
      }
    })

    return NextResponse.json(kategoriBaru, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Gagal membuat kategori baru' }, { status: 500 })
  }
}