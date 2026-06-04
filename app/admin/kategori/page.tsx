"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Tag } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Pagination } from "@/lib/interfaces";
import { DeleteKategoriModal, EditKategoriModal, TambahKategoriModal } from "@/components/modal/KategoriModal"; // Sesuaikan nama file jika berbeda
import { kategori } from "@/app/generated/prisma/client";
import { Breadcrumb } from "@/components/dashboard/BreadCrumb";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { ColumnDef, DataTable } from "@/components/dashboard/DataTable";
import { ToastContainer, useToast } from "@/components/Toast";

interface ApiResponse {
	data: kategori[];
	pagination: Pagination;
}

const PER_PAGE = 6;

export default function KategoriPage() {
	const { toasts, toast, remove } = useToast();
	const [kategoris, setKategoris] = useState<kategori[]>([]);
	const [pagination, setPagination] = useState<Pagination>({
		totalData: 0,
		totalPage: 1,
		currentPage: 1,
		limit: PER_PAGE,
	});

	const [search, setSearch] = useState("");
	const [sortField, setSortField] = useState<string>("id_kategori");
	const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
	const [selected, setSelected] = useState<string[]>([]);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);

	// Modal states
	const [showTambah, setShowTambah] = useState(false);
	const [editKategori, setEditKategori] = useState<kategori | null>(null);
	const [hapusKategori, setHapusKategori] = useState<kategori | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);

	const columns: ColumnDef<kategori>[] = [
		{
			field: "nama_kategori",
			label: "Nama Kategori",
			sortable: true,
			render: (row) => (
				<div className="flex items-center gap-3">
					<div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-[#E8461E] shrink-0 shadow-sm border border-orange-100">
						<Tag size={16} />
					</div>
					<div>
						<p className="font-semibold text-gray-800 text-sm leading-tight">
							{row.nama_kategori}
						</p>
						<p className="text-xs text-gray-400 leading-tight">Kategori Buku</p>
					</div>
				</div>
			),
		},
		{
			field: "id_kategori",
			label: "ID Kategori",
			sortable: true,
			render: (row) => (
				<span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg tracking-wider">
					{row.id_kategori}
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

				const res = await fetch("/api/kategori?" + params);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);

				const json: ApiResponse = await res.json();

				if (!cancelled) {
					setKategoris(json.data);
					setPagination(json.pagination);
				}
			} catch (err) {
				console.error("Gagal mengambil data kategori:", err);
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
				<TambahKategoriModal
					onClose={() => setShowTambah(false)}
					onSuccess={refetch}
					toast={toast}
				/>
			)}

			{editKategori && (
				<EditKategoriModal
					kategori={editKategori}
					onClose={() => setEditKategori(null)}
					onSuccess={refetch}
					toast={toast}
				/>
			)}

			{hapusKategori && (
				<DeleteKategoriModal
					kategori={hapusKategori}
					onClose={() => setHapusKategori(null)}
					onSuccess={refetch}
					toast={toast}
				/>
			)}

			<ToastContainer toasts={toasts} onRemove={remove} />

			<div className="space-y-5">
				<div>
					<Breadcrumb items={[
						{ label: "Dashboard", href: "/admin/dashboard" },
						{ label: "Kategori" }
					]} />

					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">Kategori</h1>
							<p className="text-sm text-gray-400 mt-0.5">
								{totalData} kategori terdaftar
							</p>
						</div>
						<button
							onClick={() => setShowTambah(true)}
							className="flex items-center gap-2 bg-[#E8461E] hover:bg-orange-600 active:scale-95 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-orange-200 transition-all duration-200"
						>
							<Plus size={16} />
							Tambah Kategori
						</button>
					</div>
				</div>

				{/* ── Filter & Search ── */}
				<SearchBar
					placeholder="Cari nama kategori…"
					onSearch={handleSearch}
					selected={selected}
				/>

				{/* ── Table ── */}
				<DataTable
					columns={columns}
					data={kategoris}
					rowKey="id_kategori"
					pagination={{ total: totalData, page, totalPage, perPage: PER_PAGE }}
					loading={loading}
					sortField={sortField}
					sortDir={sortDir}
					onSort={(field, dir) => { setSortField(field); setSortDir(dir); }}
					onPageChange={setPage}
					onSelectionChange={() => setSelected}
					showActions
					onEdit={setEditKategori}
					onDelete={setHapusKategori}
				/>
			</div>
		</AdminLayout>
	);
}