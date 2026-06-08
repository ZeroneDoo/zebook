"use client";

import { useEffect, useState, useCallback } from "react";
import { User, BookOpen, CheckSquare, RefreshCw } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Breadcrumb } from "@/components/dashboard/BreadCrumb";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { ColumnDef, DataTable } from "@/components/dashboard/DataTable";
import { ToastContainer, useToast } from "@/components/Toast";
import { Pagination } from "@/lib/interfaces";
import { KonfirmasiPeminjamanModal, ProsesPengembalianModal } from "@/components/modal/PeminjamanBukuModal";
import { PeminjamanBukuModel } from "@/lib/models";

interface ApiResponse {
	data: PeminjamanBukuModel[];
	pagination: Pagination;
}

const PER_PAGE = 6;

export default function PeminjamanPage() {
	const { toasts, toast, remove } = useToast();
	const [peminjamans, setPeminjamans] = useState<PeminjamanBukuModel[]>([]);
	const [pagination, setPagination] = useState<Pagination>({
		totalData: 0,
		totalPage: 1,
		currentPage: 1,
		limit: PER_PAGE,
	});

	const [search, setSearch] = useState("");
	const [sortField, setSortField] = useState<string>("id_peminjaman");
	const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
	const [selected, setSelected] = useState<string[]>([]);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);

	// States Modal Alur Bisnis
	const [modalKonfirmasiData, setModalKonfirmasiData] = useState<PeminjamanBukuModel | null>(null);
	const [modalPengembalianData, setModalPengembalianData] = useState<PeminjamanBukuModel | null>(null);

	function refetch() {
		setRefreshKey((k) => k + 1);
	}

	const columns: ColumnDef<PeminjamanBukuModel>[] = [
		{
			field: "id_peminjaman",
			label: "Nota Pinjam",
			sortable: true,
			render: (row) => (
				<span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg tracking-wider">
					{row.id_peminjaman}
				</span>
			),
		},
		{
			field: "id_pengguna",
			label: "Informasi Transaksi",
			render: (row) => (
				<div className="flex flex-col gap-0.5 max-w-xs">
					<span className="font-semibold text-gray-800 text-sm flex items-center gap-1.5">
						<User size={13} className="text-gray-400" /> {row.pengguna?.nama_pengguna || "N/A"}
					</span>
					<span className="text-xs text-gray-400 flex items-center gap-1.5 truncate">
						<BookOpen size={13} /> {row.detail_buku?.buku?.judul || "Buku Tidak Diketahui"}
					</span>
				</div>
			),
		},
		{
			field: "tgl_pinjam",
			label: "Masa Peminjaman",
			sortable: true,
			render: (row) => {
				const fmt = (d: Date | string) =>
					new Date(d).toLocaleDateString("id-ID", {
						day: "numeric",
						month: "short",
						year: "numeric"
					});

				return (
					<div className="text-xs text-gray-600 space-y-0.5">
						<p><span className="text-gray-400">Pinjam:</span> {fmt(row.tgl_pinjam)}</p>
						<p><span className="text-gray-400">Tempo:</span> {fmt(row.tgl_kembali)}</p>
					</div>
				);
			},
		},
		{
			field: "status",
			label: "Status",
			sortable: true,
			render: (row) => {
				const style: Record<string, string> = {
					DIPROSES: "bg-amber-50 text-amber-600 border border-amber-100",
					DIPINJAM: "bg-blue-50 text-blue-600 border border-blue-100",
					DIKEMBALIKAN: "bg-green-50 text-green-600 border border-green-100",
					DITOLAK: "bg-gray-50 text-gray-500 border border-gray-100"
				};
				return (
					<span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${style[row.status] || ""}`}>
						{row.status}
					</span>
				);
			},
		},
		{
			field: "aksi",
			label: "Aksi",
			render: (row) => (
				<div className="flex items-center gap-2">
					{row.status === "DIPROSES" && (
						<button
							onClick={() => setModalKonfirmasiData(row)}
							className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg transition-all"
						>
							<CheckSquare size={14} /> Konfirmasi
						</button>
					)}
					{row.status === "DIPINJAM" && (
						<button
							onClick={() => setModalPengembalianData(row)}
							className="flex items-center gap-1 text-xs font-bold text-[#E8461E] bg-orange-50 border border-orange-200 hover:bg-orange-100 px-2.5 py-1.5 rounded-lg transition-all"
						>
							<RefreshCw size={14} /> Kembalikan Buku
						</button>
					)}
					{["DIKEMBALIKAN", "DITOLAK"].includes(row.status) && (
						<span className="text-xs text-gray-400 italic">Selesai</span>
					)}
				</div>
			),
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
				const res = await fetch("/api/peminjaman-buku?" + params);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const json: ApiResponse = await res.json();
				if (!cancelled) {
					setPeminjamans(json.data);
					setPagination(json.pagination);
				}
			} catch (err) {
				console.error("Gagal mengambil data peminjaman:", err);
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
			{/* ── Modals Pemrosesan Prosedur ── */}
			{modalKonfirmasiData && (
				<KonfirmasiPeminjamanModal
					data={modalKonfirmasiData}
					onClose={() => setModalKonfirmasiData(null)}
					onSuccess={refetch}
					toast={toast}
				/>
			)}

			{modalPengembalianData && (
				<ProsesPengembalianModal
					data={modalPengembalianData}
					onClose={() => setModalPengembalianData(null)}
					onSuccess={refetch}
					toast={toast}
				/>
			)}

			<ToastContainer toasts={toasts} onRemove={remove} />

			<div className="space-y-5">
				<div>
					<Breadcrumb items={[
						{ label: "Dashboard", href: "/admin/dashboard" },
						{ label: "Peminjaman Buku" }
					]} />
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">Kelola Sirkulasi Peminjaman</h1>
							<p className="text-sm text-gray-400 mt-0.5">
								{totalData} total log sirkulasi buku terekam
							</p>
						</div>
					</div>
				</div>

				{/* Filter & Search Bar */}
				<SearchBar
					placeholder="Cari ID nota, nama peminjam, atau judul buku…"
					onSearch={handleSearch}
					selected={selected}
				/>

				{/* Table Display */}
				<DataTable
					columns={columns}
					data={peminjamans}
					rowKey="id_peminjaman"
					pagination={{ total: totalData, page, totalPage, perPage: PER_PAGE }}
					loading={loading}
					sortField={sortField}
					sortDir={sortDir}
					onSort={(field, dir) => { setSortField(field); setSortDir(dir); }}
					onPageChange={setPage}
					onSelectionChange={() => setSelected}
				/>
			</div>
		</AdminLayout>
	);
}