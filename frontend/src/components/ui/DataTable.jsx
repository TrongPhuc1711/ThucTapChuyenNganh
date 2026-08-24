import EmptyState from "./EmptyState";
import { Table } from "lucide-react";

export default function DataTable({
  columns = [],
  data = [],
  emptyTitle = "Không có dữ liệu",
  emptyDescription = "",
  emptyIcon,
  onRowClick,
  className = "",
}) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon || Table}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="bg-coffee-50/50">
            {columns.map((col, i) => (
              <th
                key={i}
                className={`
                  px-4 py-3 text-xs font-semibold text-coffee-500
                  uppercase tracking-wider
                  ${col.align === "center" ? "text-center" : "text-left"}
                  ${col.align === "right" ? "text-right" : ""}
                  ${col.className || ""}
                `}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-coffee-50">
          {data.map((row, rowIdx) => (
            <tr
              key={row.id || rowIdx}
              className={`
                hover:bg-coffee-50/30 transition-colors
                ${onRowClick ? "cursor-pointer" : ""}
              `}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className={`
                    px-4 py-3 text-sm
                    ${col.align === "center" ? "text-center" : "text-left"}
                    ${col.align === "right" ? "text-right" : ""}
                    ${col.cellClassName || ""}
                  `}
                >
                  {col.render
                    ? col.render(row[col.key], row, rowIdx)
                    : row[col.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
