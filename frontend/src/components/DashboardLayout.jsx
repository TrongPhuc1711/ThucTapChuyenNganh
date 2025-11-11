import { useNavigate } from "react-router-dom";
import "../styles/Dashboard/Layout.css";

export default function DashboardLayout({ title, children }) {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <button onClick={() => navigate("/admin")} className="btn-back">
          🔙Quay lại
        </button>
        <h1>{title}</h1>
      </div>

      <div className="dashboard-content">
        {children}
      </div>
    </div>
  );
}
