import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@/app/generated/prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth';

export async function GET(req: NextRequest) {
  try {
    // ✅ 1. Validate session first before anything else
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");
    const search = searchParams.get("search") || "";
    const sortFieldParam = searchParams.get("sort_field");
    const sortDirParam = searchParams.get("sort_dir");
    const penggunaId = searchParams.get("id_pengguna") // 👈 add this

    const skip = (page - 1) * limit;

    const allowedSortFields = ["id_transaksi_koin", "jum_koin", "harga"];
    const sortField = allowedSortFields.includes(sortFieldParam || "")
      ? sortFieldParam ?? "id_transaksi_koin"
      : "id_transaksi_koin";
    const sortDir = sortDirParam?.toLowerCase() === "asc" ? "asc" : "desc";

    const whereCondition: Prisma.transaksi_koinWhereInput = {
      // 👇 if id_pengguna is provided, filter by it (pengguna side)
      // if not, get all (admin side)
      ...(penggunaId && { id_pengguna: penggunaId }),
      ...(search && {
        OR: [
          { id_transaksi_koin: { contains: search } },
          { pengguna: { nama_pengguna: { contains: search } } },
        ],
      }),
    };

    const [transaksi, totalData] = await prisma.$transaction([
      prisma.transaksi_koin.findMany({
        where: whereCondition,
        include: {
          pengguna: { select: { nama_pengguna: true, email: true } },
          koin: true,
        },
        skip,
        take: limit,
        orderBy: { [sortField]: sortDir },
      }),
      prisma.transaksi_koin.count({ where: whereCondition }),
    ]);

    return NextResponse.json({
      data: transaksi,
      pagination: {
        totalData,
        totalPage: Math.ceil(totalData / limit),
        currentPage: page,
        limit,
      },
    });

  } catch (error) {
    console.error("Error GET transaksi koin:", error);
    return NextResponse.json({ error: "Gagal mengambil riwayat transaksi" }, { status: 500 });
  }
}