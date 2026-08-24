import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function DashboardLayout({ title, children, showBack = true }) {
  const navigate = useNavigate();

  return (
    <div className="animate-page-enter">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-coffee-100/50 text-coffee-400 hover:text-coffee-700 hover:bg-coffee-50 hover:border-coffee-200 transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <h1 className="font-heading text-xl lg:text-2xl font-bold text-coffee-800">
          {title}
        </h1>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}