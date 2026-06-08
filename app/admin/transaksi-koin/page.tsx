"use client";

import { useEffect, useState, useCallback } from "react";
import { Eye, ArrowLeftRight } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Breadcrumb } from "@/components/dashboard/BreadCrumb";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { ColumnDef, DataTable } from "@/components/dashboard/DataTable";
import { DetailTransaksiModal } from "@/components/modal/TransaksiKoinModal";
import { ToastContainer, useToast } from "@/components/Toast";
import { Pagination } from "@/lib/interfaces";
import { TransaksiKoinModel } from "@/lib/models";

interface ApiResponse {
	data: TransaksiKoinModel[];
	pagination: Pagination;
}

const PER_PAGE = 6;

export default function DetailTransaksiKoinPage() {
	const { toasts, toast, remove } = useToast();
	const [transaksiList, setTransaksiList] = useState<TransaksiKoinModel[]>([]);
	const [loading, setLoading] = useState(false);

	const [search, setSearch] = useState("");
	const [sortField, setSortField] = useState<string>("id_transaksi_koin");
	const [sortDir, setSortDir] = useState<"asc" | "desc">("desc"); // Default riwayat biasanya desc (terbaru)
	const [selected, setSelected] = useState<string[]>([]);
	const [page, setPage] = useState(1);
	const [refreshKey, setRefreshKey] = useState(0);

	// State Manajemen Modal Detail View
	const [selectedTransaksi, setSelectedTransaksi] = useState<TransaksiKoinModel | null>(null);
	const [showDetailModal, setShowDetailModal] = useState(false);

	const [pagination, setPagination] = useState<Pagination>({
		totalData: 0,
		totalPage: 1,
		currentPage: 1,
		limit: PER_PAGE,
	});

	// Definisi Kolom Tabel sesuai pola komponen Anda
	const columns: ColumnDef<TransaksiKoinModel>[] = [
		{
			field: "id_transaksi_koin",
			label: "ID Transaksi",
			sortable: true,
			render: (row) => (
				<span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg tracking-wider">
					{row.id_transaksi_koin}
				</span>
			)
		},
		{
			field: "id_pengguna", // Field pencarian relasi di handle backend
			label: "Nama Pengguna",
			render: (row) => row.pengguna?.nama_pengguna || "Tidak Diketahui"
		},
		{
			field: "jum_koin",
			label: "Jumlah Koin",
			sortable: true,
			render: (row) => `${row.jum_koin} Koin`
		},
		{
			field: "harga",
			label: "Total Harga",
			sortable: true,
			render: (row) => new Intl.NumberFormat("id-ID", {
				style: "currency",
				currency: "IDR",
				minimumFractionDigits: 0
			}).format(Number(row.harga))
		},
		{
			field: "metode_pembayaran",
			label: "Metode Pembayaran",
			render: (row) => (
				<span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-orange-50 text-[#E8461E]">
					{row.metode_pembayaran}
				</span>
			)
		},
	];

	useEffect(() => {
		let cancelled = false;

		async function fetchData() {
			setLoading(true);
			try {
				const params = new URLSearchParams({
					search,
					sort_field: sortField || "",
					sort_dir: sortDir,
					page: page.toString(),
					limit: PER_PAGE.toString(),
				});

				const res = await fetch("/api/transaksi-koin?" + params);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);

				const json: ApiResponse = await res.json();

				if (!cancelled) {
					setTransaksiList(json.data);
					setPagination(json.pagination);
				}
			} catch (err) {
				console.error("Gagal mengambil data transaksi koin:", err);
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		fetchData();
		return () => { cancelled = true; };
	}, [search, sortField, sortDir, page, refreshKey]);

	const handleSearch = useCallback((value: string) => {
		setSearch(value);
		setPage(1);
	}, []);

	const openDetail = (transaksi: TransaksiKoinModel) => {
		setSelectedTransaksi(transaksi);
		setShowDetailModal(true);
	};

	const { totalData, totalPage } = pagination;

	return (
		<AdminLayout>
			<ToastContainer toasts={toasts} onRemove={remove} />

			<div className="space-y-5">
				<div>
					<Breadcrumb items={[
						{ label: "Dashboard", href: "/admin/dashboard" },
						{ label: "Detail Transaksi Koin" }
					]} />

					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi Koin</h1>
							<p className="text-sm text-gray-400 mt-0.5">
								{totalData} total catatan transaksi masuk
							</p>
						</div>
					</div>
				</div>

				{/* Filter & Search Bar */}
				<SearchBar
					placeholder="Cari ID transaksi atau nama pembeli…"
					onSearch={handleSearch}
					selected={selected}
				/>

				{/* Table Display dengan aksi Eye (Lihat Detail) */}
				<DataTable
					columns={columns}
					data={transaksiList}
					rowKey="id_transaksi_koin"
					pagination={{ total: totalData, page, totalPage, perPage: PER_PAGE }}
					loading={loading}
					sortField={sortField}
					sortDir={sortDir}
					onSort={(field, dir) => { setSortField(field); setSortDir(dir); }}
					onPageChange={setPage}
					onSelectionChange={() => setSelected}
					showActions
					// Kustomisasi tombol aksi utama dialihkan ke fungsi modal view (Eye icon)
					onEdit={openDetail}
				/>
			</div>

			{/* Komponen Modal Detail View */}
			<DetailTransaksiModal
				isOpen={showDetailModal}
				onClose={() => {
					setShowDetailModal(false);
					setSelectedTransaksi(null);
				}}
				data={selectedTransaksi}
			/>
		</AdminLayout>
	);
}