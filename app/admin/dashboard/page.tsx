// app/admin/dashboard/page.tsx (Atau lokasi HomePage Anda)
"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import CirculationChart from "@/components/dashboard/CirculationChart"; // Hubungkan ke file grafik baru
import {
  IconUsers,
  IconBooks,
  IconBookmark,
  IconHourglassLow,
  IconLoader2,
  IconPresentationAnalytics
} from "@tabler/icons-react";

interface DashboardData {
  stats: {
    totalUsers: number;
    totalBooks: number;
    activeLoans: number;
    pendingLoans: number;
  };
  chartData: Array<{
    label: string;
    total: number;
  }>;
}

export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/dashboard");
        if (!response.ok) throw new Error("Gagal mengambil data sirkulasi");

        const resData = await response.json();
        if (resData.success) {
          setData(resData);
        } else {
          throw new Error(resData.error);
        }
      } catch (err: unknown) {
        setError((err as Error).message || "Terjadi kesalahan sistem internal.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2 text-gray-500">
          <IconLoader2 className="animate-spin text-[#56402A]" size={32} />
          <p className="text-sm font-medium text-[#9A7E5A]">Menganalisis matriks perpustakaan...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm font-medium m-6">
          Gagal Memuat Dashboard: {error}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto text-[#3A2818]" style={{ fontFamily: "'Jost', sans-serif" }}>

        {/* Header Dashboard */}
        <div>
          <h1 className="text-2xl font-bold text-[#221508]">Ringkasan Eksekutif E-Library</h1>
          <p className="text-sm text-[#9A7E5A]">Analisis komprehensif pertumbuhan anggota dan sirkulasi peminjaman.</p>
        </div>

        {/* Grid Ringkasan Informasi Utama */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Anggota"
            value={data?.stats.totalUsers || 0}
            icon={<IconUsers size={24} className="text-blue-600" />}
            description="Pengguna terdaftar"
            className="bg-blue-50/40 border-blue-100/70"
          />
          <StatsCard
            title="Koleksi Buku"
            value={data?.stats.totalBooks || 0}
            icon={<IconBooks size={24} className="text-emerald-600" />}
            description="Judul buku aktif"
            className="bg-emerald-50/40 border-emerald-100/70"
          />
          <StatsCard
            title="Sedang Dipinjam"
            value={data?.stats.activeLoans || 0}
            icon={<IconBookmark size={24} className="text-amber-600" />}
            description="Buku di luar rak"
            className="bg-amber-50/40 border-amber-100/70"
          />
          <StatsCard
            title="Menunggu Tindakan"
            value={data?.stats.pendingLoans || 0}
            icon={<IconHourglassLow size={24} className="text-rose-600" />}
            description="Butuh konfirmasi staff"
            className="bg-rose-50/40 border-rose-100/70"
          />
        </div>

        {/* ─── TAMPILAN GRAFIK TREN UTAMA ─── */}
        <div className="bg-white rounded-2xl border border-[#D4C4AE]/30 shadow-[0_4px_20px_rgba(58,40,24,0.02)] p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 shrink-0 rounded-lg bg-[#56402A]/10 text-[#56402A] flex items-center justify-center">
              <IconPresentationAnalytics size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#221508]">Grafik Aktivitas Sirkulasi</h2>
              <p className="text-xs text-[#9A7E5A]">Visualisasi volume peminjaman buku selama 7 hari terakhir.</p>
            </div>
          </div>

          {/* Render Komponen Grafik */}
          <CirculationChart data={data?.chartData || []} />
        </div>

      </div>
    </AdminLayout>
  );
}