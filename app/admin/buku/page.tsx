"use client";

import { useEffect, useState, useCallback } from "react";
// Tambahkan icon X untuk tombol close modal pratinjau gambar
import { Plus, Calendar, User, Building, X } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Pagination } from "@/lib/interfaces";
import { DeleteBukuModal, EditBukuModal, TambahBukuModal } from "@/components/modal/BukuModal";
import { Breadcrumb } from "@/components/dashboard/BreadCrumb";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { ColumnDef, DataTable } from "@/components/dashboard/DataTable";
import { ToastContainer, useToast } from "@/components/Toast";
import { buku } from "@/app/generated/prisma/client";
import Image from "next/image";

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

	// State Baru: Pratinjau Gambar Sampul
	const [previewImage, setPreviewImage] = useState<{ src: string; title: string } | null>(null);

	const columns: ColumnDef<buku>[] = [
		{
			field: "judul",
			label: "Informasi Buku",
			sortable: true,
			render: (row) => (
				<div className="flex items-start gap-3 max-w-sm">
					{/* MODIFIKASI: Menambahkan properti interaktif (cursor-pointer, group, onClick) */}
					<div
						className="relative w-12 h-14 rounded-md border border-orange-100 shrink-0 shadow-sm overflow-hidden cursor-pointer group hover:border-orange-300 transition-colors"
						onClick={() => setPreviewImage({ src: row.img_url, title: row.judul })}
						title="Klik untuk memperbesar sampul"
					>
						<Image
							src={row.img_url}
							alt={row.judul}
							fill
							className="object-cover group-hover:scale-110 transition-transform duration-200" // Efek zoom saat hover
							sizes="48px"
							priority={false}
						/>
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

			{/* MODAL BARU: Image Preview Modal */}
			{previewImage && (
				<div
					className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
					onClick={() => setPreviewImage(null)}
				>
					<div
						className="relative max-w-sm w-full bg-white rounded-2xl p-4 shadow-2xl flex flex-col items-center border border-gray-100"
						onClick={(e) => e.stopPropagation()} // Mencegah modal tertutup saat area gambar diklik
					>
						<button
							onClick={() => setPreviewImage(null)}
							className="absolute top-3 right-3 p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors z-10"
						>
							<X size={16} />
						</button>

						<div className="w-full text-center mb-3 px-6">
							<h3 className="font-bold text-gray-900 truncate text-sm">{previewImage.title}</h3>
							<p className="text-[11px] text-gray-400">Pratinjau Sampul Buku</p>
						</div>

						{/* Wadah Gambar Proporsional */}
						<div className="relative w-full aspect-3/4 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden shadow-inner">
							<Image
								src={previewImage.src}
								alt={previewImage.title}
								fill
								className="object-contain p-2" // Menggunakan object-contain agar seluruh sampul terlihat tanpa terpotong
								sizes="(max-w-sm) 100vw, 350px"
								priority
							/>
						</div>
					</div>
				</div>
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