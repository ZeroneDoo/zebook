"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Pagination, UserRow } from "@/lib/interfaces";
import { DeletePenggunaModal, EditPenggunaModal, TambahPenggunaModal } from "@/components/modal/PenggunaModal";
import { pengguna } from "@/app/generated/prisma/client";
import Image from "next/image";
import { Breadcrumb } from "@/components/dashboard/BreadCrumb";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { ColumnDef, DataTable } from "@/components/dashboard/DataTable";
import { ToastContainer, useToast } from "@/components/Toast";
import { formatRupiah } from "@/lib/formats";

interface ApiResponse {
  data: pengguna[];
  pagination: Pagination;
}

const PER_PAGE = 6;

export default function PenggunaPage() {
  const { toasts, toast, remove } = useToast();
  const [penggunas, setPenggunas] = useState<pengguna[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    totalData: 0,
    totalPage: 1,
    currentPage: 1,
    limit: PER_PAGE,
  });

  // search: dua state — input (langsung) dan query (debounced)
  const [search, setSearch] = useState("");

  const [sortField, setSortField] = useState<keyof UserRow | string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // modal states
  const [showTambah, setShowTambah] = useState(false);
  const [editUser, setEditUser] = useState<pengguna | null>(null);
  const [hapusUser, setHapusUser] = useState<pengguna | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const columns: ColumnDef<pengguna>[] = [
    {
      field: "nama_pengguna",
      label: "Pengguna",
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <Image
            unoptimized
            src={`https://api.dicebear.com/9.x/initials/svg?seed=${user.nama_pengguna}`}
            alt={`Avatar ${user?.nama_pengguna ?? 'Anonim'}`}
            width={36}
            height={36}
            className="w-9 h-9 rounded-xl shadow-sm shrink-0"
          />
          <div>
            <p className="font-semibold text-gray-800 text-sm leading-tight">
              {user.nama_pengguna}
            </p>
            <p className="text-xs text-gray-400 leading-tight">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      field: "id_pengguna",
      label: "ID",
      sortable: true,
      render: (user) => (
        <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg tracking-wider">
          {user.id_pengguna}
        </span>
      ),
    },
    {
      field: "koin",
      label: "Koin",
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-[#E8461E]">⬡</span>
          <span className="text-sm font-semibold text-gray-700">
            {user.koin}
          </span>
        </div>
      ),
    },
    {
      field: "stamp",
      label: "Stamp",
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-1">
          <span className="text-sm text-violet-400">◈</span>
          <span className="text-sm font-semibold text-gray-700">{user.stamp}</span>
        </div>
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

        const res = await fetch("/api/pengguna?" + params);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: ApiResponse = await res.json();

        if (!cancelled) {
          setPenggunas(json.data);
          setPagination(json.pagination);
        }
      } catch (err) {
        console.error("Gagal mengambil data pengguna:", err);
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
        <TambahPenggunaModal
          onClose={() => setShowTambah(false)}
          onSuccess={refetch}
          toast={toast}
        />
      )}

      {editUser && (
        <EditPenggunaModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSuccess={refetch}
          toast={toast}
        />
      )}

      {hapusUser && (
        <DeletePenggunaModal
          user={hapusUser}
          onClose={() => setHapusUser(null)}
          onSuccess={refetch}
          toast={toast}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={remove} />

      <div className="space-y-5">
        <div>
          <Breadcrumb items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Pengguna" }
          ]} />

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kelola Pengguna</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {totalData} pengguna terdaftar
              </p>
            </div>
            <button
              onClick={() => setShowTambah(true)}
              className="flex items-center gap-2 bg-[#E8461E] hover:bg-orange-600 active:scale-95 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-orange-200 transition-all duration-200"
            >
              <Plus size={16} />
              Tambah Pengguna
            </button>
          </div>
        </div>

        {/* ── Filter & Search ── */}
        <SearchBar
          placeholder="Cari nama, email, atau ID…"
          onSearch={handleSearch}
          selected={selected}
        // onDelete={handleBulkDelete}
        // onExport={handleExport}
        />

        {/* ── Table ── */}
        <DataTable
          columns={columns}
          data={penggunas}
          rowKey="id_pengguna"
          pagination={{ total: totalData, page, totalPage, perPage: PER_PAGE }}
          loading={loading}
          sortField={sortField}
          sortDir={sortDir}
          onSort={(field, dir) => { setSortField(field); setSortDir(dir); }}
          onPageChange={setPage}
          onSelectionChange={() => setSelected}
          showActions
          onEdit={setEditUser}
          onDelete={setHapusUser}
        />
      </div>
    </AdminLayout>
  );
}