import { Package } from "lucide-react";

export default function EmptyState({
  icon: Icon = Package,
  title = "Không có dữ liệu",
  description = "",
  action,
  className = "",
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="w-16 h-16 bg-coffee-50 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-coffee-300" />
      </div>
      <h3 className="text-lg font-semibold text-coffee-400 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-coffee-300 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
