"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Pagination } from "@/lib/interfaces";
import { DeleteDetailBukuModal, EditDetailBukuModal, TambahDetailBukuModal } from "@/components/modal/DetailBukuModal";
import { Breadcrumb } from "@/components/dashboard/BreadCrumb";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { ColumnDef, DataTable } from "@/components/dashboard/DataTable";
import { ToastContainer, useToast } from "@/components/Toast";
import { DetailBukuModel } from "@/lib/models";


interface ApiResponse {
	data: DetailBukuModel[];
	pagination: Pagination;
}

const PER_PAGE = 6;

export default function DetailBukuPage() {
	const { toasts, toast, remove } = useToast();
	const [items, setItems] = useState<DetailBukuModel[]>([]);
	const [pagination, setPagination] = useState<Pagination>({
		totalData: 0,
		totalPage: 1,
		currentPage: 1,
		limit: PER_PAGE,
	});

	const [search, setSearch] = useState("");
	const [sortField, setSortField] = useState<string>("id_detail_buku");
	const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
	const [selected, setSelected] = useState<string[]>([]);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);

	// Modal States
	const [showTambah, setShowTambah] = useState(false);
	const [editItem, setEditItem] = useState<DetailBukuModel | null>(null);
	const [hapusItem, setHapusItem] = useState<DetailBukuModel | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);

	const getStatusBadge = (status: DetailBukuModel["status"]) => {
		const config = {
			TERSEDIA: "bg-emerald-50 text-emerald-600 border-emerald-200",
			DIPESAN: "bg-amber-50 text-amber-600 border-amber-200",
			DIPINJAM: "bg-blue-50 text-blue-600 border-blue-200",
			HILANG: "bg-gray-100 text-gray-500 border-gray-200",
			RUSAK: "bg-red-50 text-red-600 border-red-200",
		};
		return config[status] || "bg-gray-50 text-gray-600 border-gray-200";
	};

	const columns: ColumnDef<DetailBukuModel>[] = [
		{
			field: "id_detail_buku",
			label: "ID Unit Item",
			sortable: true,
			render: (row) => (
				<span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg tracking-wider">
					{row.id_detail_buku}
				</span>
			),
		},
		{
			field: "judul",
			label: "Buku Utama",
			sortable: true,
			render: (row) => (
				<div className="max-w-xs md:max-w-md">
					<p className="font-semibold text-gray-800 text-sm truncate leading-tight">
						{row.buku.judul || "Judul tidak ditemukan"}
					</p>
					<p className="font-mono text-[11px] text-gray-400 mt-0.5 tracking-wide">
						ID Buku: {row.id_buku}
					</p>
				</div>
			),
		},
		{
			field: "status",
			label: "Status Item",
			sortable: true,
			render: (row) => (
				<span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(row.status)}`}>
					<span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
					{row.status}
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

				const res = await fetch("/api/detail-buku?" + params);
				if (!res.ok) throw new Error();

				const json: ApiResponse = await res.json();
				if (!cancelled) {
					setItems(json.data);
					setPagination(json.pagination);
				}
			} catch (err) {
				console.error("Gagal mengambil detail buku:", err);
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
			{/* Modals Container */}
			{showTambah && (
				<TambahDetailBukuModal
					onClose={() => setShowTambah(false)}
					onSuccess={refetch}
					toast={toast}
				/>
			)}

			{editItem && (
				<EditDetailBukuModal
					item={editItem}
					onClose={() => setEditItem(null)}
					onSuccess={refetch}
					toast={toast}
				/>
			)}

			{hapusItem && (
				<DeleteDetailBukuModal
					item={hapusItem}
					onClose={() => setHapusItem(null)}
					onSuccess={refetch}
					toast={toast}
				/>
			)}

			<ToastContainer toasts={toasts} onRemove={remove} />

			<div className="space-y-5">
				<div>
					<Breadcrumb items={[
						{ label: "Dashboard", href: "/admin/dashboard" },
						{ label: "Detail Buku (Unit Item)" }
					]} />

					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">Kelola Detail Buku</h1>
							<p className="text-sm text-gray-400 mt-0.5">
								{totalData} total unit buku teradaftar
							</p>
						</div>
						<button
							onClick={() => setShowTambah(true)}
							className="flex items-center gap-2 bg-[#E8461E] hover:bg-orange-600 active:scale-95 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-orange-200 transition-all duration-200"
						>
							<Plus size={16} />
							Generate Unit Item
						</button>
					</div>
				</div>

				{/* Search Engine component */}
				<SearchBar
					placeholder="Cari ID unit, judul buku, atau ID buku..."
					onSearch={handleSearch}
					selected={selected}
				/>

				{/* Data Table */}
				<DataTable
					columns={columns}
					data={items}
					rowKey="id_detail_buku"
					pagination={{ total: totalData, page, totalPage, perPage: PER_PAGE }}
					loading={loading}
					sortField={sortField}
					sortDir={sortDir}
					onSort={(field, dir) => { setSortField(field); setSortDir(dir); }}
					onPageChange={setPage}
					onSelectionChange={() => setSelected}
					showActions
					onEdit={setEditItem}
					onDelete={setHapusItem}
				/>
			</div>
		</AdminLayout>
	);
}