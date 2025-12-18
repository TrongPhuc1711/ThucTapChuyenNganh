import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Dashboard/Layout.css";

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
    <div className="dashboard-container">
      <div className="dashboard-header">
        {/* Gọi hàm handleBack thay vì navigate trực tiếp */}
        <button onClick={handleBack} className="btn-back">
          ← Quay lại
        </button>
        <h1>{title}</h1>
      </div>

      <div className="dashboard-content">
        {children}
      </div>
    </div>
  );
}