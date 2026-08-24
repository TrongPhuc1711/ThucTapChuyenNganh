import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  className = ""
}) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  if (totalItems <= pageSize) {
    return (
      <div className={`p-4 border-t border-[#FAF7F2] flex items-center justify-between text-xs text-[#8D6E63] font-sans ${className}`}>
        <span>
          Hiển thị <strong>{totalItems}</strong> trên <strong>{totalItems}</strong> mục
        </span>
      </div>
    );
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift("...");
    }
    if (currentPage + delta < totalPages - 1) {
      range.push("...");
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  return (
    <div className={`p-4 sm:p-5 border-t border-[#FAF7F2] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans ${className}`}>
      <div className="text-[#8D6E63] text-center sm:text-left">
        Hiển thị <strong className="text-[#2C1810] font-semibold">{startItem}</strong> - <strong className="text-[#2C1810] font-semibold">{endItem}</strong> trên <strong className="text-[#2C1810] font-semibold">{totalItems}</strong> mục
      </div>

      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-xl border border-[#EFEBE9] bg-white text-[#4E342E] hover:bg-[#FAF7F2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Trước</span>
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, idx) => {
          if (page === "...") {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 text-[#A1887F]">
                ...
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <button
              key={`page-${page}`}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center ${
                isActive
                  ? "bg-[#C5963A] text-[#1A0F0A] shadow-md shadow-[#C5963A]/20"
                  : "border border-[#EFEBE9] bg-white text-[#6D4C41] hover:bg-[#FAF7F2]"
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-xl border border-[#EFEBE9] bg-white text-[#4E342E] hover:bg-[#FAF7F2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-medium"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
