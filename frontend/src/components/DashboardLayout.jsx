import { useNavigate, useLocation } from "react-router-dom";

export default function DashboardLayout({ title, children }) {
  const navigate = useNavigate();
  const location = useLocation(); // Lấy thông tin URL hiện tại

  // Logic: Nếu URL chứa chữ "staff" thì về "/staff", ngược lại về "/admin"
  const handleBack = () => {
    if (location.pathname.includes("/staff")) {
      navigate("/staff");
    } else {
      navigate("/admin");
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-coffee-500 bg-white rounded-xl border border-coffee-100 hover:bg-coffee-50 hover:text-coffee-700 transition-all duration-200 hover:shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>
        <h1 className="font-heading text-2xl font-bold text-coffee-800">{title}</h1>
      </div>

      {/* Content */}
      <div>
        {children}
      </div>
    </div>
  );
}