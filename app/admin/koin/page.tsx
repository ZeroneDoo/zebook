"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Coins } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Pagination } from "@/lib/interfaces";
import { DeleteKoinModal, EditKoinModal, TambahKoinModal } from "@/components/modal/KoinModal";
import { koin } from "@/app/generated/prisma/client";
import { Breadcrumb } from "@/components/dashboard/BreadCrumb";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { ColumnDef, DataTable } from "@/components/dashboard/DataTable";
import { ToastContainer, useToast } from "@/components/Toast";
import { formatNumber, formatRupiah } from "@/lib/formats";

interface ApiResponse {
	data: koin[];
	pagination: Pagination;
}

const PER_PAGE = 6;

export default function KoinPage() {
	const { toasts, toast, remove } = useToast();
	const [koins, setKoins] = useState<koin[]>([]);
	const [pagination, setPagination] = useState<Pagination>({
		totalData: 0,
		totalPage: 1,
		currentPage: 1,
		limit: PER_PAGE,
	});

	const [search, setSearch] = useState("");
	const [sortField, setSortField] = useState<string>("id_koin");
	const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
	const [selected, setSelected] = useState<string[]>([]);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);

	// Modal states
	const [showTambah, setShowTambah] = useState(false);
	const [editKoin, setEditKoin] = useState<koin | null>(null);
	const [hapusKoin, setHapusKoin] = useState<koin | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);

	const columns: ColumnDef<koin>[] = [
		{
			field: "jum_koin",
			label: "Jumlah Koin",
			sortable: true,
			render: (row) => (
				<div className="flex items-center gap-3">
					<div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0 shadow-sm border border-amber-100">
						<Coins size={18} className="animate-pulse" />
					</div>
					<div>
						<p className="font-bold text-gray-800 text-sm leading-tight">
							{formatNumber(Number(row.jum_koin))} Koin
						</p>
						<p className="text-xs text-gray-400 leading-tight">Paket Koin</p>
					</div>
				</div>
			),
		},
		{
			field: "harga",
			label: "Harga (IDR)",
			sortable: true,
			render: (row) => (
				<span className="font-semibold text-sm text-gray-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-xl">
					Rp {Number(row.harga)}
				</span>
			),
		},
		{
			field: "id_koin",
			label: "ID Koin",
			sortable: true,
			render: (row) => (
				<span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg tracking-wider">
					{row.id_koin}
				</span>
			),
		},
	];

	function refetch() {
		setRefreshKey((k) => k + 1);
	}

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

				const res = await fetch("/api/koin?" + params);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);

				const json: ApiResponse = await res.json();

				if (!cancelled) {
					setKoins(json.data);
					setPagination(json.pagination);
				}
			} catch (err) {
				console.error("Gagal mengambil data koin:", err);
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

	const { totalData, totalPage } = pagination;

	return (
		<AdminLayout>
			{/* ── Modals ── */}
			{showTambah && (
				<TambahKoinModal
					onClose={() => setShowTambah(false)}
					onSuccess={refetch}
					toast={toast}
				/>
			)}

			{editKoin && (
				<EditKoinModal
					koin={editKoin}
					onClose={() => setEditKoin(null)}
					onSuccess={refetch}
					toast={toast}
				/>
			)}

			{hapusKoin && (
				<DeleteKoinModal
					koin={hapusKoin}
					onClose={() => setHapusKoin(null)}
					onSuccess={refetch}
					toast={toast}
				/>
			)}

			<ToastContainer toasts={toasts} onRemove={remove} />

			<div className="space-y-5">
				<div>
					<Breadcrumb items={[
						{ label: "Dashboard", href: "/admin/dashboard" },
						{ label: "Koin" }
					]} />

					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">Kelola Koin</h1>
							<p className="text-sm text-gray-400 mt-0.5">
								{totalData} paket koin tersedia
							</p>
						</div>
						<button
							onClick={() => setShowTambah(true)}
							className="flex items-center gap-2 bg-[#E8461E] hover:bg-orange-600 active:scale-95 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-orange-200 transition-all duration-200"
						>
							<Plus size={16} />
							Tambah Koin
						</button>
					</div>
				</div>

				{/* ── Filter & Search ── */}
				<SearchBar
					placeholder="Cari jumlah koin atau ID…"
					onSearch={handleSearch}
					selected={selected}
				/>

				{/* ── Table ── */}
				<DataTable
					columns={columns}
					data={koins}
					rowKey="id_koin"
					pagination={{ total: totalData, page, totalPage, perPage: PER_PAGE }}
					loading={loading}
					sortField={sortField}
					sortDir={sortDir}
					onSort={(field, dir) => { setSortField(field); setSortDir(dir); }}
					onPageChange={setPage}
					onSelectionChange={() => setSelected}
					showActions
					onEdit={setEditKoin}
					onDelete={setHapusKoin}
				/>
			</div>
		</AdminLayout>
	);
}