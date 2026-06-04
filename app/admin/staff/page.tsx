"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Pagination } from "@/lib/interfaces";
import { DeleteStaffModal, EditStaffModal, TambahStaffModal } from "@/components/modal/StaffModal";
import { staff } from "@/app/generated/prisma/client";
import Image from "next/image";
import { Breadcrumb } from "@/components/dashboard/BreadCrumb";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { ColumnDef, DataTable } from "@/components/dashboard/DataTable";
import { ToastContainer, useToast } from "@/components/Toast";

interface ApiResponse {
  data: staff[];
  pagination: Pagination;
}

const PER_PAGE = 6;

export default function StaffPage() {
  const { toasts, toast, remove } = useToast();
  const [staffs, setStaffs] = useState<staff[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    totalData: 0,
    totalPage: 1,
    currentPage: 1,
    limit: PER_PAGE,
  });

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<string>("id_staff");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // modal states
  const [showTambah, setShowTambah] = useState(false);
  const [editStaff, setEditStaff] = useState<staff | null>(null);
  const [hapusStaff, setHapusStaff] = useState<staff | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const columns: ColumnDef<staff>[] = [
    {
      field: "nama_staff",
      label: "Staff",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Image
            unoptimized
            src={`https://api.dicebear.com/9.x/initials/svg?seed=${row.nama_staff}`}
            alt={`Avatar ${row?.nama_staff ?? 'Anonim'}`}
            width={36}
            height={36}
            className="w-9 h-9 rounded-xl shadow-sm shrink-0"
          />
          <div>
            <p className="font-semibold text-gray-800 text-sm leading-tight">
              {row.nama_staff}
            </p>
            <p className="text-xs text-gray-400 leading-tight">@{row.username}</p>
          </div>
        </div>
      ),
    },
    {
      field: "id_staff",
      label: "ID Staff",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg tracking-wider">
          {row.id_staff}
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

        const res = await fetch("/api/staff?" + params);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: ApiResponse = await res.json();

        if (!cancelled) {
          setStaffs(json.data);
          setPagination(json.pagination);
        }
      } catch (err) {
        console.error("Gagal mengambil data staff:", err);
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
        <TambahStaffModal
          onClose={() => setShowTambah(false)}
          onSuccess={refetch}
          toast={toast}
        />
      )}

      {editStaff && (
        <EditStaffModal
          staff={editStaff}
          onClose={() => setEditStaff(null)}
          onSuccess={refetch}
          toast={toast}
        />
      )}

      {hapusStaff && (
        <DeleteStaffModal
          staff={hapusStaff}
          onClose={() => setHapusStaff(null)}
          onSuccess={refetch}
          toast={toast}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={remove} />

      <div className="space-y-5">
        <div>
          <Breadcrumb items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Staff" }
          ]} />

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {totalData} staff terdaftar
              </p>
            </div>
            <button
              onClick={() => setShowTambah(true)}
              className="flex items-center gap-2 bg-[#E8461E] hover:bg-orange-600 active:scale-95 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-orange-200 transition-all duration-200"
            >
              <Plus size={16} />
              Tambah Staff
            </button>
          </div>
        </div>

        {/* ── Filter & Search ── */}
        <SearchBar
          placeholder="Cari nama atau username…"
          onSearch={handleSearch}
          selected={selected}
        />

        {/* ── Table ── */}
        <DataTable
          columns={columns}
          data={staffs}
          rowKey="id_staff"
          pagination={{ total: totalData, page, totalPage, perPage: PER_PAGE }}
          loading={loading}
          sortField={sortField}
          sortDir={sortDir}
          onSort={(field, dir) => { setSortField(field); setSortDir(dir); }}
          onPageChange={setPage}
          onSelectionChange={() => setSelected}
          showActions
          onEdit={setEditStaff}
          onDelete={setHapusStaff}
        />
      </div>
    </AdminLayout>
  );
}