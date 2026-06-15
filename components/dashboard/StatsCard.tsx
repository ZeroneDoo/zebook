// components/dashboard/StatsCard.tsx
import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  className?: string; // Untuk kustomisasi warna latar/border per kartu
}

export default function StatsCard({
  title,
  value,
  icon,
  description,
  className = '',
}: StatsCardProps) {
  return (
    <div 
      className={`p-5 rounded-2xl border bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] ${className}`}
    >
      {/* ─── SISI KIRI: INFORMASI TEKS ─── */}
      <div className="space-y-1 flex-1 min-w-0">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider truncate">
          {title}
        </p>
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
          {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
        </h3>
        {description && (
          <p className="text-xs text-gray-500 font-medium truncate">
            {description}
          </p>
        )}
      </div>

      {/* ─── SISI KANAN: WADAH IKON ─── */}
      <div className="p-3 bg-white/90 backdrop-blur-xs rounded-xl border border-gray-100 shadow-[0_2px_6px_rgba(0,0,0,0.02)] flex items-center justify-center shrink-0 ml-4">
        {icon}
      </div>
    </div>
  );
}