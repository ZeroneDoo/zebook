// components/dashboard/CirculationChart.tsx
import React from "react";

interface ChartItem {
  label: string;
  total: number;
}

interface CirculationChartProps {
  data: ChartItem[];
}

export default function CirculationChart({ data }: CirculationChartProps) {
  // Cari nilai peminjaman tertinggi untuk menentukan skala tinggi grafik (minimal skala 5 agar tidak rata tanah)
  const maxVolume = Math.max(...data.map((d) => d.total), 5);

  return (
    <div className="w-full bg-[#FAF7F2]/40 border border-[#D4C4AE]/20 rounded-2xl p-4 sm:p-6">
      {/* Batang Grafik Container */}
      <div className="h-64 flex items-end gap-3 sm:gap-6 px-2 border-b border-[#D4C4AE]/40 pb-2">
        {data.map((item, index) => {
          // Hitung persentase tinggi batang secara dinamis
          const barHeightPercentage = (item.total / maxVolume) * 100;

          return (
            <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              
              {/* Tooltip Angka saat di-Hover */}
              <div className="absolute -top-8 bg-[#56402A] text-[#FAF7F2] text-[11px] font-bold px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xs z-10 before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-[#56402A]">
                {item.total} Buku
              </div>

              {/* Batang Grafik Utama */}
              <div
                style={{ height: `${barHeightPercentage}%` }}
                className="w-full bg-[#D4C4AE]/60 group-hover:bg-[#56402A] rounded-t-lg transition-all duration-300 relative overflow-hidden flex items-end justify-center"
              >
                {/* Efek aksen gradasi halus di dalam batang yang aktif */}
                {item.total > 0 && (
                  <div className="absolute inset-x-0 bottom-0 top-0 bg-linear-to-t from-black/10 to-transparent" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Label Sumbu X (Tanggal & Hari) */}
      <div className="flex justify-between gap-3 sm:gap-6 px-2 mt-3">
        {data.map((item, index) => (
          <div key={index} className="flex-1 text-center">
            <p className="text-[10px] sm:text-xs font-semibold text-[#56402A] truncate">
              {item.label.split(",")[0]}
            </p>
            <p className="text-[9px] text-[#9A7E5A] font-mono mt-0.5">
              {item.label.split(",")[1] || item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}