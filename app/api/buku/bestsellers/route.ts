import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // 1. Ambil seluruh data sirkulasi aktif beserta ID Buku induknya (Tanpa di-take 5 dulu)
    const allLoans = await prisma.peminjaman_buku.findMany({
      where: {
        status: { in: ['DIPINJAM', 'DIKEMBALIKAN'] } 
      },
      select: {
        detail_buku: {
          select: { id_buku: true }
        }
      }
    });

    // Fallback jika belum ada transaksi peminjaman sama sekali di aplikasi
    if (allLoans.length === 0) {
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

    // 2. Hitung akumulasi total peminjaman per ID BUKU INDUK menggunakan JavaScript Map
    const bookCountMap: Record<string, number> = {};
    allLoans.forEach((loan) => {
      const bookId = loan.detail_buku?.id_buku;
      if (bookId) {
        bookCountMap[bookId] = (bookCountMap[bookId] || 0) + 1;
      }
    });

    // 3. Urutkan dari yang paling banyak dipinjam, lalu potong dapatkan TOP 5 ID BUKU UNIK
    const topBookIds = Object.keys(bookCountMap)
      .sort((a, b) => bookCountMap[b] - bookCountMap[a])
      .slice(0, 6);

    // 4. Tarik profil data buku lengkap dari database berdasarkan 5 ID terpopuler tersebut
    const bestSellerBooks = await prisma.buku.findMany({
      where: { id_buku: { in: topBookIds } },
      include: {
        buku_kategori: { include: { kategori: true } },
        _count: {
          select: {
            detail_buku: { where: { status: "TERSEDIA" } } 
          }
        }
      },
    });

    // 5. Petakan ketersediaan stok & pastikan urutan array-nya kembali sesuai ranking popularitasnya
    const sortedAndMappedBestSellers = bestSellerBooks
      .map((b) => ({
        ...b,
        stok: b._count.detail_buku, // Sinkronisasi hitungan stok real-time
      }))
      .sort((a, b) => (bookCountMap[b.id_buku] || 0) - (bookCountMap[a.id_buku] || 0));

    return NextResponse.json({ data: sortedAndMappedBestSellers });
  } catch (error) {
    console.error("Error API Bestsellers GET:", error);
    return NextResponse.json({ error: "Gagal memuat buku terlaris" }, { status: 500 });
  }
}