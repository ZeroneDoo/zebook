import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");
    const search = searchParams.get("search") || "";
    
    // Parsing parameter sorting
    const sortFieldParam = searchParams.get("sort_field");
    const sortDirParam = searchParams.get("sort_dir");

    const skip = (page - 1) * limit;

    // Proteksi pengurutan field yang diperbolehkan sesuai skema database
    const allowedSortFields = ["id_transaksi_koin", "jum_koin", "harga"];
    const sortField = allowedSortFields.includes(sortFieldParam || "")
      ? sortFieldParam ?? "id_transaksi_koin"
      : "id_transaksi_koin";

    const sortDir = sortDirParam?.toLowerCase() === "asc" ? "asc" : "desc";

    // Menyusun kondisi pencarian global (Bisa berdasarkan ID Transaksi atau Nama Pengguna)
    const whereCondition = search ? {
      OR: [
        { id_transaksi_koin: { contains: search } },
        { pengguna: { nama_pengguna: { contains: search } } }
      ]
    } : {};

    // Eksekusi transaksi database secara simultan
    const [transaksi, totalData] = await prisma.$transaction([
      prisma.transaksi_koin.findMany({
        where: whereCondition,
        include: {
          pengguna: { select: { nama_pengguna: true, email: true } },
          koin: true
        },
        skip,
        take: limit,
        orderBy: { [sortField]: sortDir }
      }),
      prisma.transaksi_koin.count({ where: whereCondition })
    ]);

    return NextResponse.json({
      data: transaksi,
      pagination: {
        totalData,
        totalPage: Math.ceil(totalData / limit),
        currentPage: page,
        limit,
      }
    });

  } catch (error) {
    console.error("Error GET transaksi koin:", error);
    return NextResponse.json({ error: "Gagal mengambil riwayat transaksi" }, { status: 500 });
  }
}