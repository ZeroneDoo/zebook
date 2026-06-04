import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateId } from '@/lib/generated'
import { penggunaWhereInput } from '@/app/generated/prisma/models';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const search = searchParams.get("search");
    const sortFieldParam = searchParams.get("sort_field");
    const sortDirParam = searchParams.get("sort_dir");

    const usePagination = !!(pageParam && limitParam);

    const allowedSortFields = ["id_pengguna", "nama_pengguna", "email", "koin", "stamp"];
    const sortField = allowedSortFields.includes(sortFieldParam || "") ? sortFieldParam ?? "" : "id_pengguna";
    // Prisma expects lowercase 'asc' or 'desc'
    const sortDir = sortDirParam?.toUpperCase() === "DESC" ? "desc" : "asc"; 

    // Build standard Prisma filtering object
    const whereClause: penggunaWhereInput = search
      ? {
          OR: [
            { nama_pengguna: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {};

    const page = Number(pageParam) || 1;
    const limit = Number(limitParam) || 10;
    const offset = (page - 1) * limit;

    const [pengguna, totalData] = await Promise.all([
      prisma.pengguna.findMany({
        where: whereClause,
        select: {
          id_pengguna: true,
          nama_pengguna: true,
          email: true,
          koin: true,
          stamp: true,
        },
        orderBy: { [sortField]: sortDir },
        // Conditionally spread pagination if usePagination is true
        ...(usePagination ? { skip: offset, take: limit } : {}),
      }),
      // Only run count if pagination is required to save DB resources
      usePagination ? prisma.pengguna.count({ where: whereClause }) : Promise.resolve(0),
    ]);
    
    if (!usePagination) {
      return NextResponse.json({ data: pengguna });
    }

    return NextResponse.json({
      data: pengguna,
      pagination: {
        totalData,
        totalPage: Math.ceil(totalData / limit),
        currentPage: page,
        limit,
      },
      sorting: {
        sortField,
        sortDir: sortDir.toUpperCase(), // Keeping your original casing for frontend compatibility
      },
    });

  } catch (error) {
    console.error("error apanih : ", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pengguna" },
      { status: 500 }
    );
  }
}

// POST buat pengguna baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nama_pengguna, email, koin, stamp, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'email, dan password wajib diisi' }, { status: 400 })
    }

    const id_pengguna = await generateId('pengguna')
    const hashedPassword = await bcrypt.hash(password, 10)

    const pengguna = await prisma.pengguna.create({
      data: { 
        id_pengguna, 
        nama_pengguna, 
        email, 
        koin : Number(koin) ?? 0,
        stamp : Number(stamp) ?? 0,
        password: hashedPassword
      }
    })

    return NextResponse.json(pengguna, { status: 201 })
  } catch (error: unknown) {
    if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
    ) {
        return NextResponse.json(
        { error: 'Email atau ID sudah digunakan' },
        { status: 409 }
        )
    }

    return NextResponse.json({ error: 'Gagal membuat pengguna' }, { status: 500 })
  }
}