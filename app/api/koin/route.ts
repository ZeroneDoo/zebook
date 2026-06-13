import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateId } from '@/lib/generated'
import { Prisma } from '@/app/generated/prisma/client'
import { KoinModel } from '@/lib/models'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const pageParam = searchParams.get("page")
    const limitParam = searchParams.get("limit")
    const search = searchParams.get("search")
    const sortFieldParam = searchParams.get("sort_field")
    const sortDirParam = searchParams.get("sort_dir")

    const usePagination = pageParam && limitParam

    const allowedSortFields = ["id_koin", "jum_koin", "harga"] as const
    type SortField = typeof allowedSortFields[number]

    const sortField: SortField = allowedSortFields.includes(sortFieldParam as SortField)
      ? (sortFieldParam as SortField)
      : "id_koin"
    const sortDir = sortDirParam?.toUpperCase() === "DESC" ? "desc" : "asc"

    const whereClause: Prisma.koinWhereInput = search
      ? {
          OR: [
            { id_koin: { contains: search } },
            { jum_koin: { equals: isNaN(Number(search)) ? undefined : Number(search) } },
          ],
        }
      : {}

    if (!usePagination) {
      const koinData: KoinModel[] = await prisma.koin.findMany({
        where: whereClause,
        orderBy: { [sortField]: sortDir },
      })

      return NextResponse.json({ data: koinData })
    }

    const page = Number(pageParam)
    const limit = Number(limitParam)
    const offset = (page - 1) * limit

    const [koinData, totalData] = await prisma.$transaction([
      prisma.koin.findMany({
        where: whereClause,
        orderBy: { [sortField]: sortDir },
        take: limit,
        skip: offset,
      }),
      prisma.koin.count({ where: whereClause }),
    ])

    return NextResponse.json({
      data: koinData as KoinModel[],
      pagination: {
        totalData,
        totalPage: Math.ceil(totalData / limit),
        currentPage: page,
        limit,
      },
      sorting: { sortField, sortDir },
    })

  } catch (error) {
    console.error("Error API Koin GET:", error)
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