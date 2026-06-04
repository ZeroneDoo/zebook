"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Download, Trash2 } from "lucide-react";

interface SearchBarProps {
  /** Called with the debounced search value */
  onSearch: (value: string) => void;
  /** Debounce delay in ms (default: 400) */
  debounceMs?: number;
  placeholder?: string;
  selected?: unknown[];
  onDelete?: () => void;
  onExport?: () => void;
  initialValue?: string;
}

export function SearchBar({
  onSearch,
  debounceMs = 400,
  placeholder = "Cari…",
  selected = [],
  onDelete,
  onExport,
  initialValue = "",
}: SearchBarProps) {
  const [searchInput, setSearchInput] = useState(initialValue);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isTyping) return;

    const timer = setTimeout(() => {
      onSearch(searchInput);
      setIsTyping(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchInput, debounceMs, onSearch, isTyping]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchInput(e.target.value);
      setIsTyping(true);
    },
    []
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">

        {/* Search input */}
        <div className="relative w-full sm:flex-1 sm:max-w-xs">
          {isTyping ? (
            <Loader2
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E8461E] animate-spin"
            />
          ) : (
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          )}

          <input
            type="text"
            value={searchInput}
            onChange={handleChange}
            placeholder={placeholder}
            className={`w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border rounded-xl outline-none transition-all ${isTyping
                ? "border-[#E8461E] ring-2 ring-orange-100"
                : "border-gray-200 focus:border-[#E8461E] focus:ring-2 focus:ring-orange-100"
              }`}
          />

          {isTyping && (
            <div className="absolute bottom-0 left-0 h-0.5 bg-[#E8461E] rounded-b-xl animate-[grow_0.4s_linear_forwards]" />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Download size={13} />
            Ekspor
          </button>
        </div>
      </div>

      {/* Bulk-selection bar */}
      {selected.length > 0 && (
        <div className="mt-3 flex items-center gap-3 px-3 py-2 bg-orange-50 border border-orange-100 rounded-xl">
          <span className="text-xs font-semibold text-[#E8461E]">
            {selected.length} dipilih
          </span>
          <button
            onClick={onDelete}
            className="text-xs text-gray-500 hover:text-red-600 font-medium transition-colors flex items-center gap-1"
          >
            <Trash2 size={12} />
            Hapus
          </button>
        </div>
      )}
    </div>
  );
}