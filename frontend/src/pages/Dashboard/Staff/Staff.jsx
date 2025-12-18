import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../styles/Dashboard/Staff/StaffDashboard.css";

export default function Staff() {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:4000/api/donhang", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const orders = response.data;
      const today = new Date().toDateString();

      setStatistics({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.TrangThai === "Treo").length,
        processingOrders: orders.filter(o => o.TrangThai === "Đang xử lý" || o.TrangThai === "Đang giao").length,
        completedToday: orders.filter(o => {
          return o.TrangThai === "Đã giao" && 
                 new Date(o.NgayDat).toDateString() === today;
        }).length
      });
    } catch (error) {
      console.error("Lỗi tải thống kê:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Xem đơn hàng",
      description: "Quản lý và cập nhật trạng thái đơn hàng",
      icon: "📦",
      color: "#3498db",
      path: "/staff/orders"
    },
    {
      title: "Danh sách món",
      description: "Xem menu và tìm kiếm món cho khách",
      icon: "☕",
      color: "#e67e22",
      path: "/staff/products"
    },
    {
      title: "Hóa đơn",
      description: "Xem và in hóa đơn",
      icon: "🧾",
      color: "#27ae60",
      path: "/staff/bills"
    },
    {
      title: "Khách hàng",
      description: "Tra cứu thông tin khách hàng",
      icon: "👥",
      color: "#9b59b6",
      path: "/staff/customers"
    }
  ];

  if (loading) {
    return (
      <div className="staff-container">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="staff-container">
      <div className="welcome-section">
        <h1>🌟 Chào mừng đến với P-Coffee</h1>
        <p>Hệ thống quản lý dành cho nhân viên</p>
      </div>

      {/* Thống kê nhanh */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{statistics.totalOrders}</h3>
            <p>Tổng đơn hàng</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{statistics.pendingOrders}</h3>
            <p>Đơn chờ xử lý</p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">🚚</div>
          <div className="stat-info">
            <h3>{statistics.processingOrders}</h3>
            <p>Đang xử lý</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{statistics.completedToday}</h3>
            <p>Hoàn thành hôm nay</p>
          </div>
        </div>
      </div>

      {/* Các chức năng nhanh */}
      <div className="quick-actions">
        <h2>Chức năng chính</h2>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <div 
              key={index}
              className="action-card"
              onClick={() => navigate(action.path)}
              style={{ borderLeftColor: action.color }}
            >
              <div className="action-icon" style={{ color: action.color }}>
                {action.icon}
              </div>
              <div className="action-content">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
              <div className="action-arrow">→</div>
            </div>
          ))}
        </div>
      </div>

      {/* Lưu ý cho nhân viên */}
      <div className="staff-notes">
        <h3>📌 Lưu ý quan trọng</h3>
        <ul>
          <li>✓ Cập nhật trạng thái đơn hàng kịp thời</li>
          <li>✓ Kiểm tra thông tin đơn hàng trước khi xác nhận</li>
          <li>✓ Hỗ trợ khách hàng tra cứu menu và đơn hàng</li>
          <li>✓ Báo cáo sự cố hoặc vấn đề cho quản lý</li>
        </ul>
      </div>
    </div>
  );
}