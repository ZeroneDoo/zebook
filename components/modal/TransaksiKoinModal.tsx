"use client";

import { TransaksiKoinModel } from "@/lib/models";
import { X, Receipt, User, Coins, CreditCard } from "lucide-react";

interface DetailTransaksiModalProps {
	isOpen: boolean;
	onClose: () => void;
	data: TransaksiKoinModel | null; // Menerima data transaksi terpilih
}

export function DetailTransaksiModal({ isOpen, onClose, data }: DetailTransaksiModalProps) {
	if (!isOpen || !data) return null;

	// Formatter Mata Uang Rupiah
	const formatRupiah = (value: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0
		}).format(value);
	};

	return (
		<div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
			<div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all">

				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
					<div className="flex items-center gap-2.5">
						<div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-[#E8461E]">
							<Receipt size={18} />
						</div>
						<div>
							<h2 className="text-sm font-bold text-gray-900">Detail Nota Transaksi</h2>
							<p className="text-xs text-gray-400 mt-0.5">{data.id_transaksi_koin}</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
					>
						<X size={16} />
					</button>
				</div>

				{/* Body Informasi */}
				<div className="p-6 space-y-5 text-sm">

					{/* Sesi Pelanggan */}
					<div className="space-y-2">
						<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Informasi Pembeli</span>
						<div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
							<User size={16} className="text-gray-400 mt-0.5" />
							<div>
								<p className="font-semibold text-gray-800">{data.pengguna?.nama_pengguna}</p>
								<p className="text-xs text-gray-500 mt-0.5">{data.pengguna?.email}</p>
								<p className="text-xs text-gray-400 mt-1">ID: {data.id_pengguna}</p>
							</div>
						</div>
					</div>

					{/* Grid Informasi Transaksi */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1 p-3 border border-gray-100 rounded-xl">
							<div className="flex items-center gap-1.5 text-gray-400 mb-1">
								<Coins size={14} className="text-amber-500" />
								<span className="text-xs font-medium">Jumlah Koin</span>
							</div>
							<p className="text-base font-bold text-gray-900">{data.jum_koin} Koin</p>
						</div>

						<div className="space-y-1 p-3 border border-gray-100 rounded-xl">
							<div className="flex items-center gap-1.5 text-gray-400 mb-1">
								<CreditCard size={14} className="text-blue-500" />
								<span className="text-xs font-medium">Metode</span>
							</div>
							<span className="inline-block text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600">
								{data.metode_pembayaran}
							</span>
						</div>
					</div>

					{/* Sesi Total Pembayaran */}
					<div className="pt-3 border-t border-dashed border-gray-200">
						<div className="flex items-center justify-between">
							<span className="text-xs font-semibold text-gray-500">Total Nominal Bayar</span>
							<span className="text-lg font-black text-[#E8461E]">
								{formatRupiah(Number(data.harga))}
							</span>
						</div>
					</div>

				</div>

				{/* Footer */}
				<div className="px-6 py-3 border-t border-gray-100 flex justify-end bg-gray-50/50">
					<button
						onClick={onClose}
						className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all shadow-sm"
					>
						Tutup Detail
					</button>
				</div>

			</div>
		</div>
	);
}