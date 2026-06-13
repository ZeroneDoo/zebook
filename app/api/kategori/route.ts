import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateId } from '@/lib/generated'
import { KategoriModel } from '@/lib/models'
import { Prisma } from '@/app/generated/prisma/client'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const pageParam = searchParams.get("page")
    const limitParam = searchParams.get("limit")
    const search = searchParams.get("search")
    const sortFieldParam = searchParams.get("sort_field")
    const sortDirParam = searchParams.get("sort_dir")

    const usePagination = pageParam && limitParam

    const allowedSortFields = ["id_kategori", "nama_kategori"] as const
    type SortField = typeof allowedSortFields[number]

    const sortField: SortField = allowedSortFields.includes(sortFieldParam as SortField)
      ? (sortFieldParam as SortField)
      : "id_kategori"
    const sortDir = sortDirParam?.toUpperCase() === "DESC" ? "desc" : "asc"

    const whereClause: Prisma.kategoriWhereInput = search
      ? {
          OR: [
            { id_kategori: { contains: search } },
            { nama_kategori: { contains: search } },
          ],
        }
      : {}

    if (!usePagination) {
      const kategoriData: KategoriModel[] = await prisma.kategori.findMany({
        where: whereClause,
        orderBy: { [sortField]: sortDir },
      })

      return NextResponse.json({ data: kategoriData })
    }

    const page = Number(pageParam)
    const limit = Number(limitParam)
    const offset = (page - 1) * limit

    const [kategoriData, totalData] = await prisma.$transaction([
      prisma.kategori.findMany({
        where: whereClause,
        orderBy: { [sortField]: sortDir },
        take: limit,
        skip: offset,
      }),
      prisma.kategori.count({ where: whereClause }),
    ])

    return NextResponse.json({
      data: kategoriData as KategoriModel[],
      pagination: {
        totalData,
        totalPage: Math.ceil(totalData / limit),
        currentPage: page,
        limit,
      },
      sorting: { sortField, sortDir },
    })

  } catch (error) {
    console.error("Error API Kategori GET:", error)
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