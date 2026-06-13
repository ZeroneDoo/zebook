import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sp_konfirmasi_peminjaman, sp_proses_pengembalian } from '@/lib/procedures';
import { Prisma } from '@/app/generated/prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth';

export async function GET(req: NextRequest) {
  try {
    // ✅ 1. Validate session first
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

    const skip = (page - 1) * limit;

    const allowedSortFields = ["id_peminjaman", "tgl_pinjam", "tgl_kembali", "status"] as const
    type SortField = typeof allowedSortFields[number]

    const sortField: SortField = allowedSortFields.includes(sortFieldParam as SortField)
      ? (sortFieldParam as SortField)
      : "id_peminjaman"
    const sortDir = sortDirParam?.toLowerCase() === "desc" ? "desc" : "asc"

    // ✅ 2. Role-based filter
    const penggunaId = session.user.role === "pengguna"
      ? session.user.id                           // pengguna: always their own
      : searchParams.get("id_pengguna") ?? undefined // staff: optional filter

    const whereCondition: Prisma.peminjaman_bukuWhereInput = {
      ...(penggunaId && { id_pengguna: penggunaId }),
      ...(search && {
        OR: [
          { id_peminjaman: { contains: search } },
          { pengguna: { nama_pengguna: { contains: search } } },
          { detail_buku: { buku: { judul: { contains: search } } } },
        ],
      }),
    }

    const [peminjaman, totalData] = await prisma.$transaction([
      prisma.peminjaman_buku.findMany({
        where: whereCondition,
        include: {
          pengguna: { select: { nama_pengguna: true, email: true } },
          detail_buku: {
            include: {
              buku: { select: { judul: true, img_url: true, koin: true, stamp: true } }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { [sortField]: sortDir }
      }),
      prisma.peminjaman_buku.count({ where: whereCondition })
    ]);

    return NextResponse.json({
      data: peminjaman,
      pagination: {
        totalData,
        totalPage: Math.ceil(totalData / limit),
        currentPage: page,
        limit,
      }
    });

  } catch (error) {
    console.error("Error GET peminjaman:", error);
    return NextResponse.json({ error: "Gagal memuat data peminjaman" }, { status: 500 });
  }
}

// 2. POST: Eksekusi Stored Procedure Berdasarkan Tipe Aksi
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id_peminjaman, keputusan, denda_koin } = body;

    if (!id_peminjaman) {
      return NextResponse.json({ error: "ID Peminjaman wajib disertakan" }, { status: 400 });
    }

    if (action === "konfirmasi") {
      if (!keputusan || !["DITERIMA", "DITOLAK"].includes(keputusan)) {
        return NextResponse.json({ error: "Keputusan tidak valid (DITERIMA/DITOLAK)" }, { status: 400 });
      }
      await sp_konfirmasi_peminjaman(id_peminjaman, keputusan)
      return NextResponse.json({ message: `Peminjaman berhasil ${keputusan.toLowerCase()}` });

    } else if (action === "pengembalian") {
      const denda = parseInt(denda_koin ?? "0");
      if (isNaN(denda) || denda < 0) {
        return NextResponse.json({ error: "Denda koin tidak boleh bernilai negatif" }, { status: 400 });
      }
      await sp_proses_pengembalian(id_peminjaman, denda)
      return NextResponse.json({ message: "Pengembalian buku berhasil diproses" });
    }

    return NextResponse.json({ error: "Aksi tidak dikenal" }, { status: 400 });

  } catch (error: unknown) {
    const dbMessage = (error as { message?: string }).message?.split("Message: ")?.[1] || "Gagal memproses data di database";
    return NextResponse.json({ error: dbMessage.trim() }, { status: 400 });
  }
}