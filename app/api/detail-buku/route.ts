import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  detail_bukuOrderByWithRelationInput,
  detail_bukuWhereInput,
} from "@/app/generated/prisma/models";
import { detail_buku_status } from "@/app/generated/prisma/enums";

// GET list detail_buku dengan join judul buku induk
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const search = searchParams.get("search");
    const sortFieldParam = searchParams.get("sort_field");
    const sortDirParam = searchParams.get("sort_dir");

    const usePagination = !!(pageParam && limitParam);
    const page = Number(pageParam) || 1;
    const limit = Number(limitParam) || 10;
    const offset = (page - 1) * limit;

    // 1. Dynamic Sorting setup
    const allowedSortFields = ["id_detail_buku", "id_buku", "status", "judul"];
    const sortField = allowedSortFields.includes(sortFieldParam || "")
      ? sortFieldParam ?? ""
      : "id_detail_buku";
    const sortDir = sortDirParam?.toLowerCase() === "desc" ? "desc" : "asc";

    const orderBy: detail_bukuOrderByWithRelationInput =
      sortField === "judul"
        ? { buku: { judul: sortDir } }
        : { [sortField]: sortDir };

    // 2. Dynamic Filtering setup
    const whereClause: detail_bukuWhereInput = {};
    if (search) {
      const orConditions: detail_bukuWhereInput[] = [
        { id_detail_buku: { contains: search } },
        { id_buku: { contains: search } },
        { buku: { judul: { contains: search } } },
      ];

      // Convert search to UPPERCASE to match enum naming convention (e.g., 'TERSEDIA')
      const searchUpper = search.toUpperCase();

      // Check if what the user typed is actually a valid status enum
      if (
        Object.values(detail_buku_status).includes(
          searchUpper as detail_buku_status
        )
      ) {
        orConditions.push({
          status: { equals: searchUpper as detail_buku_status }, // 👈 Use 'equals' for enums
        });
      }

      whereClause.OR = orConditions;
    }

    // 3. Execute queries in PARALLEL (Massive performance boost)
    const [itemsData, totalData] = await Promise.all([
      prisma.detail_buku.findMany({
        where: whereClause,
        include: {
          buku: { select: { judul: true } }, // Only select judul to keep it lightweight
        },
        orderBy: orderBy,
        ...(usePagination ? { skip: offset, take: limit } : {}),
      }),
      prisma.detail_buku.count({ where: whereClause }),
    ]);

    // 4. Return Response
    if (!usePagination) {
      return NextResponse.json({ data: itemsData });
    }

    return NextResponse.json({
      data: itemsData, // Ready out-of-the-box, no .map() loop needed!
      pagination: {
        totalData,
        totalPage: Math.ceil(totalData / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error Detail Buku GET:", error);
    return NextResponse.json(
      { error: "Gagal memproses data unit item" },
      { status: 500 }
    );
  }
}

// POST: Membuat unit baru MENGGUNAKAN CALL STORED PROCEDURE sp_tambah_detail_buku
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_buku, jumlah } = body;

    if (!id_buku || !jumlah) {
      return NextResponse.json(
        { error: "Parameter ID Buku dan Jumlah wajib disertakan" },
        { status: 400 }
      );
    }

    // Panggil Prosedur: sp_tambah_detail_buku(p_id_buku, p_jumlah)
    await prisma.$executeRawUnsafe(
      `CALL sp_tambah_detail_buku(?, ?)`,
      id_buku,
      Number(jumlah)
    );

    return NextResponse.json(
      {
        success: true,
        message: "Detail Buku berhasil ditambahkan",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error CALL sp_tambah_detail_buku:", error);
    return NextResponse.json(
      {
        error:
          (error as Error).message ||
          "Gagal memproses tambah detail buku",
      },
      { status: 500 }
    );
  }
}
