"use client";

import { useState } from "react";
import {
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	ChevronDown,
	ChevronsUpDown,
	Loader2,
	Pencil,
	Trash2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortDir = "asc" | "desc";

export interface ColumnDef<T> {
	/** Unique key, can be keyof T or a custom string for computed columns */
	field: string;
	label: string;
	/** Whether this column is sortable (requires field to match a sortable API param) */
	sortable?: boolean;
	/** Custom render function. Falls back to String(row[field]) if omitted. */
	render?: (row: T) => React.ReactNode;
	/** Extra className for <td> */
	className?: string;
	/** Align header label */
	align?: "left" | "right" | "center";
}

export interface PaginationMeta {
	total: number;       // total rows across all pages
	page: number;        // current page (1-based)
	totalPage: number;   // total number of pages
	perPage: number;
}

interface DataTableProps<T extends { [key: string]: unknown }> {
	/** Column definitions */
	columns: ColumnDef<T>[];
	/** Current page data */
	data: T[];
	/** Row identity — used for selection */
	rowKey: keyof T;
	/** Pagination metadata */
	pagination: PaginationMeta;
	/** Loading / busy state */
	loading?: boolean;
	/** Currently sorted field */
	sortField?: string;
	/** Sort direction */
	sortDir?: SortDir;
	/** Called when a sortable header is clicked */
	onSort?: (field: string, dir: SortDir) => void;
	/** Called when page changes */
	onPageChange?: (page: number) => void;
	/** Called with the current set of selected rowKey values */
	onSelectionChange?: (selected: unknown[]) => void;
	/** Show action column (edit / delete) */
	showActions?: boolean;
	onEdit?: (row: T) => void;
	onDelete?: (row: T) => void;
	/** Placeholder shown when data is empty */
	emptyMessage?: string;
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({
	field,
	sortField,
	sortDir,
}: {
	field: string;
	sortField?: string;
	sortDir?: SortDir;
}) {
	if (field !== sortField)
		return <ChevronsUpDown size={12} className="ml-1 text-gray-300" />;
	return sortDir === "asc" ? (
		<ChevronUp size={12} className="ml-1 text-[#E8461E]" />
	) : (
		<ChevronDown size={12} className="ml-1 text-[#E8461E]" />
	);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DataTable<T extends { [key: string]: unknown }>({
	columns,
	data,
	rowKey,
	pagination,
	loading = false,
	sortField,
	sortDir = "asc",
	onSort,
	onPageChange,
	onSelectionChange,
	showActions = false,
	onEdit,
	onDelete,
	emptyMessage = "Tidak ada data ditemukan.",
}: DataTableProps<T>) {
	const [selected, setSelected] = useState<unknown[]>([]);

	const { total, page, totalPage, perPage } = pagination;
	const firstItem = total === 0 ? 0 : (page - 1) * perPage + 1;
	const lastItem = Math.min(page * perPage, total);

	// ── Selection helpers ──
	function toggleAll() {
		const next =
			selected.length === data.length && data.length > 0
				? []
				: data.map((r) => r[rowKey]);
		setSelected(next);
		onSelectionChange?.(next);
	}

	function toggleOne(id: unknown) {
		const next = selected.includes(id)
			? selected.filter((s) => s !== id)
			: [...selected, id];
		setSelected(next);
		onSelectionChange?.(next);
	}

	// ── Sort toggle ──
	function handleSort(field: string) {
		if (!onSort) return;
		const newDir: SortDir =
			field === sortField && sortDir === "asc" ? "desc" : "asc";
		onSort(field, newDir);
	}

	// ── Page buttons: show max 5 around current page ──
	const pageNumbers = buildPageNumbers(page, totalPage);

	const skeletonCols =
		1 + columns.length + (showActions ? 1 : 0); // checkbox + cols + actions

	return (
		<div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					{/* ── Head ── */}
					<thead>
						<tr className="border-b border-gray-100 bg-gray-50/70">
							{/* Checkbox */}
							<th className="px-4 py-3 w-10">
								<input
									type="checkbox"
									checked={
										selected.length === data.length && data.length > 0
									}
									onChange={toggleAll}
									className="accent-[#E8461E] w-4 h-4 rounded cursor-pointer"
								/>
							</th>

							{columns.map((col) => (
								<th
									key={col.field}
									onClick={() => col.sortable && handleSort(col.field)}
									className={[
										"px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider",
										col.sortable
											? "cursor-pointer select-none hover:text-gray-700 transition-colors"
											: "",
										col.align === "right"
											? "text-right"
											: col.align === "center"
												? "text-center"
												: "text-left",
									]
										.filter(Boolean)
										.join(" ")}
								>
									<span className="inline-flex items-center">
										{col.label}
										{col.sortable && (
											<SortIcon
												field={col.field}
												sortField={sortField}
												sortDir={sortDir}
											/>
										)}
									</span>
								</th>
							))}

							{showActions && (
								<th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
									Aksi
								</th>
							)}
						</tr>
					</thead>

					{/* ── Body ── */}
					<tbody className="divide-y divide-gray-50">
						{loading ? (
							/* Skeleton rows */
							Array.from({ length: perPage }).map((_, i) => (
								<tr key={i} className="animate-pulse">
									<td className="px-4 py-3.5">
										<div className="w-4 h-4 bg-gray-200 rounded" />
									</td>
									{Array.from({ length: skeletonCols - 1 }).map((_, j) => (
										<td key={j} className="px-4 py-3.5">
											<div className="w-24 h-3 bg-gray-200 rounded" />
										</td>
									))}
								</tr>
							))
						) : data.length === 0 ? (
							<tr>
								<td
									colSpan={skeletonCols}
									className="py-16 text-center text-gray-400 text-sm"
								>
									{emptyMessage}
								</td>
							</tr>
						) : (
							data.map((row) => {
								const id = row[rowKey];
								const isSelected = selected.includes(id);
								return (
									<tr
										key={String(id)}
										className={`group transition-colors ${isSelected
											? "bg-orange-50/60"
											: "hover:bg-gray-50/80"
											}`}
									>
										{/* Checkbox */}
										<td className="px-4 py-3.5">
											<input
												type="checkbox"
												checked={isSelected}
												onChange={() => toggleOne(id)}
												className="accent-[#E8461E] w-4 h-4 rounded cursor-pointer"
											/>
										</td>

										{/* Data cells */}
										{columns.map((col) => (
											<td
												key={col.field}
												className={[
													"px-4 py-3.5",
													col.align === "right"
														? "text-right"
														: col.align === "center"
															? "text-center"
															: "",
													col.className ?? "",
												]
													.filter(Boolean)
													.join(" ")}
											>
												{col.render
													? col.render(row)
													: String(row[col.field] ?? "")}
											</td>
										))}

										{/* Actions */}
										{showActions && (
											<td className="px-4 py-3.5">
												<div className="flex items-center justify-end gap-1">
													{onEdit && (
														<button
															onClick={() => onEdit(row)}
															className="p-1.5 rounded-lg text-gray-400 hover:text-[#E8461E] hover:bg-orange-50 transition-all"
															title="Edit"
														>
															<Pencil size={14} />
														</button>
													)}
													{onDelete && (
														<button
															onClick={() => onDelete(row)}
															className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
															title="Hapus"
														>
															<Trash2 size={14} />
														</button>
													)}
												</div>
											</td>
										)}
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			</div>

			{/* ── Pagination ── */}
			<div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
				<p className="text-xs text-gray-400">
					{loading ? (
						<span className="inline-flex items-center gap-1.5 text-gray-400">
							<Loader2 size={11} className="animate-spin" />
							Memuat data…
						</span>
					) : (
						<>
							Menampilkan{" "}
							<span className="font-semibold text-gray-600">
								{firstItem}–{lastItem}
							</span>{" "}
							dari{" "}
							<span className="font-semibold text-gray-600">{total}</span>{" "}
							data
						</>
					)}
				</p>

				<div className="flex items-center gap-1">
					<button
						onClick={() => onPageChange?.(Math.max(1, page - 1))}
						disabled={page === 1 || loading}
						className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
					>
						<ChevronLeft size={16} />
					</button>

					{pageNumbers.map((p, i) =>
						p === "..." ? (
							<span
								key={`ellipsis-${i}`}
								className="w-8 h-8 flex items-center justify-center text-xs text-gray-400"
							>
								…
							</span>
						) : (
							<button
								key={p}
								onClick={() => onPageChange?.(p as number)}
								disabled={loading}
								className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all disabled:cursor-not-allowed ${p === page
									? "bg-[#E8461E] text-white shadow-sm shadow-orange-200"
									: "text-gray-500 hover:bg-gray-100"
									}`}
							>
								{p}
							</button>
						)
					)}

					<button
						onClick={() => onPageChange?.(Math.min(totalPage, page + 1))}
						disabled={page === totalPage || loading}
						className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
					>
						<ChevronRight size={16} />
					</button>
				</div>
			</div>
		</div>
	);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildPageNumbers(
	current: number,
	total: number
): (number | "...")[] {
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

	const pages: (number | "...")[] = [1];

	if (current > 3) pages.push("...");

	const start = Math.max(2, current - 1);
	const end = Math.min(total - 1, current + 1);
	for (let i = start; i <= end; i++) pages.push(i);

	if (current < total - 2) pages.push("...");
	pages.push(total);

	return pages;
}