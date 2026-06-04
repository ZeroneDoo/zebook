import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateId } from '@/lib/generated'
import bcrypt from 'bcryptjs'

// GET semua staff (dengan pagination, search, dan sorting)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const pageParam = searchParams.get("page")
    const limitParam = searchParams.get("limit")
    const search = searchParams.get("search")

    // sorting
    const sortFieldParam = searchParams.get("sort_field")
    const sortDirParam = searchParams.get("sort_dir")

    const usePagination = pageParam && limitParam

    // =========================
    // SORTING
    // =========================

    const allowedSortFields = [
      "id_staff",
      "username",
      "nama_staff",
    ]

    const sortField = allowedSortFields.includes(sortFieldParam || "")
      ? sortFieldParam
      : "id_staff"

    const sortDir =
      sortDirParam?.toUpperCase() === "DESC"
        ? "DESC"
        : "ASC"

    const orderQuery = `ORDER BY ${sortField} ${sortDir}`

    // =========================
    // BUILD QUERY
    // =========================

    let whereQuery = ""
    let keyword = ""

    if (search) {
      whereQuery = `
        WHERE username LIKE ?
        OR nama_staff LIKE ?
      `

      keyword = `%${search}%`
    }

    // =========================
    // QUERY TANPA PAGINATION
    // =========================

    if (!usePagination) {

      if (search) {
        const staff = await prisma.$queryRawUnsafe(
          `
          SELECT
            id_staff,
            username,
            nama_staff
          FROM staff
          ${whereQuery}
          ${orderQuery}
          `,
          keyword,
          keyword
        )

        return NextResponse.json({
          data: staff,
        })
      }

      const staff = await prisma.$queryRawUnsafe(
        `
        SELECT
          id_staff,
          username,
          nama_staff
        FROM staff
        ${orderQuery}
        `
      )

      return NextResponse.json({
        data: staff,
      })
    }

    // =========================
    // QUERY DENGAN PAGINATION
    // =========================

    const page = Number(pageParam)
    const limit = Number(limitParam)
    const offset = (page - 1) * limit

    let staff
    let totalResult

    if (search) {

      staff = await prisma.$queryRawUnsafe(
        `
        SELECT
          id_staff,
          username,
          nama_staff
        FROM staff
        ${whereQuery}
        ${orderQuery}
        LIMIT ?
        OFFSET ?
        `,
        keyword,
        keyword,
        limit,
        offset
      )

      totalResult = await prisma.$queryRawUnsafe(
        `
        SELECT COUNT(*) as total
        FROM staff
        ${whereQuery}
        `,
        keyword,
        keyword
      )

    } else {

      staff = await prisma.$queryRawUnsafe(
        `
        SELECT
          id_staff,
          username,
          nama_staff
        FROM staff
        ${orderQuery}
        LIMIT ?
        OFFSET ?
        `,
        limit,
        offset
      )

      totalResult = await prisma.$queryRaw`
        SELECT COUNT(*) as total
        FROM staff
      `
    }

    const totalData = Number(
      (totalResult as unknown as { total: number }[])[0].total
    )

    return NextResponse.json({
      data: staff,
      pagination: {
        totalData,
        totalPage: Math.ceil(totalData / limit),
        currentPage: page,
        limit,
      },
      sorting: {
        sortField,
        sortDir,
      },
    })

  } catch (error) {
    console.log("error apanih : ", error)

    return NextResponse.json(
      { error: "Gagal mengambil data staff" },
      { status: 500 }
    )
  }
}

// POST buat staff baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, nama_staff, password } = body

    // Validasi field yang NOT NULL di database
    if (!username || !password) {
      return NextResponse.json({ error: 'username dan password wajib diisi' }, { status: 400 })
    }

    const id_staff = await generateId('staff')
    const hashedPassword = await bcrypt.hash(password, 10)

    // Catatan: Idealnya password di-hash (misal menggunakan bcrypt) sebelum disimpan ke database
    const staff = await prisma.staff.create({
      data: { 
        id_staff, 
        username, 
        nama_staff, 
        password: hashedPassword
      }
    })

    return NextResponse.json(staff, { status: 201 })
  } catch (error: unknown) {
    if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
    ) {
        return NextResponse.json(
        { error: 'Username atau ID sudah digunakan' },
        { status: 409 }
        )
    }

    return NextResponse.json({ error: 'Gagal membuat staff' }, { status: 500 })
  }
}