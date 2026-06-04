"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, BookOpen, Calendar, User, Building } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Pagination } from "@/lib/interfaces";
import { DeleteBukuModal, EditBukuModal, TambahBukuModal } from "@/components/modal/BukuModal";
import { Breadcrumb } from "@/components/dashboard/BreadCrumb";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { ColumnDef, DataTable } from "@/components/dashboard/DataTable";
import { ToastContainer, useToast } from "@/components/Toast";
import { buku } from "@/app/generated/prisma/client";

// Definisikan interface sesuai skema tabel buku Anda

interface ApiResponse {
	data: buku[];
	pagination: Pagination;
}

const PER_PAGE = 6;

export default function BukuPage() {
	const { toasts, toast, remove } = useToast();
	const [bukus, setBukus] = useState<buku[]>([]);
	const [pagination, setPagination] = useState<Pagination>({
		totalData: 0,
		totalPage: 1,
		currentPage: 1,
		limit: PER_PAGE,
	});

	const [search, setSearch] = useState("");
	const [sortField, setSortField] = useState<string>("id_buku");
	const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
	const [selected, setSelected] = useState<string[]>([]);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);

	// Modal states
	const [showTambah, setShowTambah] = useState(false);
	const [editBuku, setEditBuku] = useState<buku | null>(null);
	const [hapusBuku, setHapusBuku] = useState<buku | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);

	const columns: ColumnDef<buku>[] = [
		{
			field: "judul",
			label: "Informasi Buku",
			sortable: true,
			render: (row) => (
				<div className="flex items-start gap-3 max-w-sm">
					<div className="w-10 h-12 rounded-lg bg-orange-50 border border-orange-100 flex flex-col items-center justify-center text-[#E8461E] shrink-0 shadow-sm">
						<BookOpen size={18} />
					</div>
					<div className="min-w-0">
						<p className="font-bold text-gray-800 text-sm truncate leading-snug">
							{row.judul}
						</p>
						<p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
							<User size={11} /> {row.penulis} &bull; <Building size={11} /> {row.penerbit}
						</p>
					</div>
				</div>
			),
		},
		{
			field: "stok",
			label: "Stok",
			sortable: true,
			render: (row) => (
				<span className={`text-xs font-bold px-2.5 py-1 rounded-full ${row.stok > 0 ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-red-50 text-red-600 border border-red-100"
					}`}>
					{row.stok} Eks
				</span>
			),
		},
		{
			field: "koin",
			label: "Koin/Stamp",
			render: (row) => (
				<div className="flex flex-col gap-0.5">
					<div className="flex items-center gap-1">
						<span className="text-sm font-bold text-[#E8461E]">⬡</span>
						<span className="text-sm font-semibold text-gray-700">
							{row.koin.toLocaleString("id-ID")}
						</span>
					</div>
					<div className="flex items-center gap-1">
						<span className="text-sm text-violet-400">◈</span>
						<span className="text-sm font-semibold text-gray-700">{row.stamp}</span>
					</div>
					{/* <span className="text-xs text-purple-600 font-semibold flex items-center gap-1">
						🎟️ {row.stamp} Stamp
					</span> */}
				</div>
			),
		},
		{
			field: "thn_terbit",
			label: "Tahun Terbit",
			sortable: true,
			render: (row) => (
				<span className="text-xs text-gray-600 font-medium flex items-center gap-1">
					<Calendar size={13} className="text-gray-400" />
					{row.thn_terbit}
				</span>
			),
		},
		{
			field: "id_buku",
			label: "ID Buku",
			sortable: true,
			render: (row) => (
				<span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg tracking-wider">
					{row.id_buku}
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

				const res = await fetch("/api/buku?" + params);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);

				const json: ApiResponse = await res.json();

				if (!cancelled) {
					setBukus(json.data);
					setPagination(json.pagination);
				}
			} catch (err) {
				console.error("Gagal mengambil data buku:", err);
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
			{/* Modals */}
			{showTambah && (
				<TambahBukuModal
					onClose={() => setShowTambah(false)}
					onSuccess={refetch}
					toast={toast}
				/>
			)}

			{editBuku && (
				<EditBukuModal
					buku={editBuku}
					onClose={() => setEditBuku(null)}
					onSuccess={refetch}
					toast={toast}
				/>
			)}

			{hapusBuku && (
				<DeleteBukuModal
					buku={hapusBuku}
					onClose={() => setHapusBuku(null)}
					onSuccess={refetch}
					toast={toast}
				/>
			)}

			<ToastContainer toasts={toasts} onRemove={remove} />

			<div className="space-y-5">
				<div>
					<Breadcrumb items={[
						{ label: "Dashboard", href: "/admin/dashboard" },
						{ label: "Buku" }
					]} />

					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">Kelola Buku</h1>
							<p className="text-sm text-gray-400 mt-0.5">
								{totalData} koleksi buku terdaftar
							</p>
						</div>
						<button
							onClick={() => setShowTambah(true)}
							className="flex items-center gap-2 bg-[#E8461E] hover:bg-orange-600 active:scale-95 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-orange-200 transition-all duration-200"
						>
							<Plus size={16} />
							Tambah Buku
						</button>
					</div>
				</div>

				{/* Filter & Search Bar */}
				<SearchBar
					placeholder="Cari judul, penulis, atau ID buku…"
					onSearch={handleSearch}
					selected={selected}
				/>

				{/* Table Display */}
				<DataTable
					columns={columns}
					data={bukus}
					rowKey="id_buku"
					pagination={{ total: totalData, page, totalPage, perPage: PER_PAGE }}
					loading={loading}
					sortField={sortField}
					sortDir={sortDir}
					onSort={(field, dir) => { setSortField(field); setSortDir(dir); }}
					onPageChange={setPage}
					onSelectionChange={() => setSelected}
					showActions
					onEdit={setEditBuku}
					onDelete={setHapusBuku}
				/>
			</div>
		</AdminLayout>
	);
}