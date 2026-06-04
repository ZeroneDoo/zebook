import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateId } from '@/lib/generated'

// GET semua koin (dengan filter search & pagination)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const pageParam = searchParams.get("page")
    const limitParam = searchParams.get("limit")
    const search = searchParams.get("search")

    const sortFieldParam = searchParams.get("sort_field")
    const sortDirParam = searchParams.get("sort_dir")

    const usePagination = pageParam && limitParam

    const allowedSortFields = ["id_koin", "jum_koin", "harga"]
    const sortField = allowedSortFields.includes(sortFieldParam || "") ? sortFieldParam : "id_koin"
    const sortDir = sortDirParam?.toUpperCase() === "DESC" ? "DESC" : "ASC"
    const orderQuery = `ORDER BY ${sortField} ${sortDir}`

    let whereQuery = ""
    let keyword = ""

    if (search) {
      whereQuery = `WHERE id_koin LIKE ? OR CAST(jum_koin AS CHAR) LIKE ?`
      keyword = `%${search}%`
    }

    // TANPA PAGINATION
    if (!usePagination) {
      if (search) {
        const koinData = await prisma.$queryRawUnsafe(
          `SELECT id_koin, jum_koin, harga FROM koin ${whereQuery} ${orderQuery}`,
          keyword,
          keyword
        )
        return NextResponse.json({ data: koinData })
      }

      const koinData = await prisma.$queryRawUnsafe(`SELECT id_koin, jum_koin, harga FROM koin ${orderQuery}`)
      return NextResponse.json({ data: koinData })
    }

    // DENGAN PAGINATION
    const page = Number(pageParam)
    const limit = Number(limitParam)
    const offset = (page - 1) * limit

    let koinData: unknown
    let totalResult: unknown

    if (search) {
      koinData = await prisma.$queryRawUnsafe(
        `SELECT id_koin, jum_koin, harga FROM koin ${whereQuery} ${orderQuery} LIMIT ? OFFSET ?`,
        keyword,
        keyword,
        limit,
        offset
      )
      totalResult = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as total FROM koin ${whereQuery}`, keyword, keyword)
    } else {
      koinData = await prisma.$queryRawUnsafe(`SELECT id_koin, jum_koin, harga FROM koin ${orderQuery} LIMIT ? OFFSET ?`, limit, offset)
      totalResult = await prisma.$queryRaw`SELECT COUNT(*) as total FROM koin`
    }

    const totalData = Number((totalResult as unknown as { total: number }[])[0].total)

    return NextResponse.json({
      data: koinData,
      pagination: {
        totalData,
        totalPage: Math.ceil(totalData / limit),
        currentPage: page,
        limit,
      },
      sorting: { sortField, sortDir },
    })

  } catch (error) {
    console.log("error api koin: ", error)
    return NextResponse.json({ error: "Gagal mengambil data koin" }, { status: 500 })
  }
}

// POST buat paket koin baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { jum_koin, harga } = body

    if (jum_koin === undefined || harga === undefined) {
      return NextResponse.json({ error: 'Jumlah koin dan harga wajib diisi' }, { status: 400 })
    }

    // Menghasilkan id berformat 4 digit (misal: K001) menyesuaikan CHAR(4)
    const id_koin = await generateId('koin')

    const koinBaru = await prisma.koin.create({
      data: {
        id_koin,
        jum_koin: Number(jum_koin),
        harga: Number(harga)
      }
    })

    return NextResponse.json(koinBaru, { status: 201 })
  } catch (error: unknown) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal membuat paket koin' }, { status: 500 })
  }
}