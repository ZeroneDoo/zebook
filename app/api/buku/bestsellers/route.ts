import { NextRequest, NextResponse } from "next/server";
import prisma  from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const topLoans = await prisma.peminjaman_buku.groupBy({
      by: ['id_detail_buku'],
      _count: { id_peminjaman: true },
      where: {
        status: { in: ['DIPINJAM', 'DIKEMBALIKAN'] } 
      },
      orderBy: {
        _count: { id_peminjaman: 'desc' },
      },
      take: 5,
    });

    if (topLoans.length === 0) {
      const fallbackBooks = await prisma.buku.findMany({
        take: 5,
        include: {
          buku_kategori: { include: { kategori: true } },
          _count: {
            select: { detail_buku: { where: { status: "TERSEDIA" } } }
          }
        }
      });
      
      const mappedFallback = fallbackBooks.map(b => ({ ...b, stok: b._count.detail_buku }));
      return NextResponse.json({ data: mappedFallback });
    }

    const detailBukuIds = topLoans.map((item) => item.id_detail_buku);
    const detailItems = await prisma.detail_buku.findMany({
      where: { id_detail_buku: { in: detailBukuIds } },
      select: { id_buku: true, id_detail_buku: true },
    });

    const uniqueBookIds = Array.from(new Set(detailItems.map((d) => d.id_buku)));

    const bestSellerBooks = await prisma.buku.findMany({
      where: { id_buku: { in: uniqueBookIds } },
      include: {
        buku_kategori: { include: { kategori: true } },
        _count: {
          select: {
            detail_buku: { where: { status: "TERSEDIA" } } // Hitung dynamic stock
          }
        }
      },
    });

    // Urutkan dan petakan stok dari hasil agregasi terfilter
    const sortedAndMappedBestSellers = bestSellerBooks
      .map((b) => ({
        ...b,
        stok: b._count.detail_buku, // Mengganti kolom stok statis dengan hitungan real-time
      }))
      .sort((a, b) => {
        const countA = topLoans.find(t => detailItems.find(d => d.id_buku === a.id_buku)?.id_detail_buku === t.id_detail_buku)?._count.id_peminjaman || 0;
        const countB = topLoans.find(t => detailItems.find(d => d.id_buku === b.id_buku)?.id_detail_buku === t.id_detail_buku)?._count.id_peminjaman || 0;
        return countB - countA;
      });

    return NextResponse.json({ data: sortedAndMappedBestSellers });
  } catch (error) {
    console.error("Error API Bestsellers GET:", error);
    return NextResponse.json({ error: "Gagal memuat buku terlaris" }, { status: 500 });
  }
}