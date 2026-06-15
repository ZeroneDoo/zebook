// app/api/admin/dashboard/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Sesuaikan lokasi prisma client Anda

export async function GET() {
  try {
    // 1. Ambil data agregat untuk Stats Card
    const totalUsers = await prisma.pengguna.count();
    const totalBooks = await prisma.buku.count();
    const activeLoans = await prisma.peminjaman_buku.count({ where: { status: "DIPINJAM" } });
    const pendingLoans = await prisma.peminjaman_buku.count({ where: { status: "DIPROSES" } });

    // 2. Ambil data peminjaman 7 hari terakhir untuk grafik tren
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const rawLoans = await prisma.peminjaman_buku.findMany({
      where: {
        tgl_pinjam: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        tgl_pinjam: true,
      },
    });

    // 3. Rumuskan struktur data 7 hari terakhir (Mengisi hari kosong dengan angka 0)
    const chartMap: Record<string, { label: string; total: number }> = {};
    
    for (let i = 6; i >= 0; i--) {
      const dateTarget = new Date();
      dateTarget.setDate(dateTarget.getDate() - i);
      
      const key = dateTarget.toISOString().split("T")[0]; // Format: YYYY-MM-DD
      const label = dateTarget.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
      });

      chartMap[key] = { label, total: 0 };
    }

    // Isikan jumlah baris data asli ke dalam map hari sirkulasi
    rawLoans.forEach((loan) => {
      const loanKey = new Date(loan.tgl_pinjam).toISOString().split("T")[0];
      if (chartMap[loanKey]) {
        chartMap[loanKey].total += 1;
      }
    });

    const circulationChartData = Object.values(chartMap);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalBooks,
        activeLoans,
        pendingLoans,
      },
      chartData: circulationChartData,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat visualisasi tren dashboard" },
      { status: 500 }
    );
  }
}