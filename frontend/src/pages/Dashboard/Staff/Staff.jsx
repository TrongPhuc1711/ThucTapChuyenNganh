import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

export default function Staff() {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState({ totalOrders: 0, pendingOrders: 0, processingOrders: 0, completedToday: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStatistics(); }, []);
  const fetchStatistics = async () => {
    try {
      const response = await api.get("/donhang");
      const orders = response.data;
      const today = new Date().toDateString();
      setStatistics({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.TrangThai === "Treo").length,
        processingOrders: orders.filter(o => o.TrangThai === "Đang xử lý" || o.TrangThai === "Đang giao").length,
        completedToday: orders.filter(o => {
          return o.TrangThai === "Đã giao" && new Date(o.NgayDat).toDateString() === today;
        }).length
      });
    } catch (error) {
      console.error("Lỗi tải thống kê:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { title: "Xem đơn hàng", description: "Quản lý và cập nhật trạng thái đơn hàng", icon: "📦", gradient: "from-blue-500 to-blue-600", path: "/staff/orders" },
    { title: "Danh sách món", description: "Xem menu và tìm kiếm món cho khách", icon: "☕", gradient: "from-amber-500 to-amber-600", path: "/staff/products" },
    { title: "Hóa đơn", description: "Xem và in hóa đơn", icon: "🧾", gradient: "from-emerald-500 to-emerald-600", path: "/staff/bills" },
    { title: "Khách hàng", description: "Tra cứu thông tin khách hàng", icon: "👥", gradient: "from-purple-500 to-purple-600", path: "/staff/customers" }
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-coffee-200 border-t-gold rounded-full animate-spin"></div></div>;

  return (
    <div className="animate-fade-in">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-coffee-800 mb-2">Chào mừng đến với <span className="text-gold">P-Coffee</span> 🌟</h1>
        <p className="text-coffee-400">Hệ thống quản lý dành cho nhân viên</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Tổng đơn hàng", value: statistics.totalOrders, icon: "📊", gradient: "from-blue-500 to-blue-600" },
          { label: "Đơn chờ xử lý", value: statistics.pendingOrders, icon: "⏳", gradient: "from-amber-500 to-amber-600" },
          { label: "Đang xử lý", value: statistics.processingOrders, icon: "🚚", gradient: "from-purple-500 to-purple-600" },
          { label: "Hoàn thành hôm nay", value: statistics.completedToday, icon: "✅", gradient: "from-emerald-500 to-emerald-600" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-coffee-100/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center text-xl shadow-lg`}>{stat.icon}</div>
              <div><p className="text-2xl font-bold text-coffee-800">{stat.value}</p><p className="text-xs text-coffee-400">{stat.label}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="font-heading text-xl font-bold text-coffee-800 mb-4">Chức năng chính</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <div key={index} className="group bg-white rounded-2xl p-5 cursor-pointer border border-coffee-100/50 hover:shadow-xl hover:shadow-coffee-900/5 transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-4" onClick={() => navigate(action.path)}>
              <div className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>{action.icon}</div>
              <div className="flex-1"><h3 className="font-semibold text-coffee-800 group-hover:text-gold transition-colors">{action.title}</h3><p className="text-sm text-coffee-400">{action.description}</p></div>
              <svg className="w-5 h-5 text-coffee-300 group-hover:text-gold group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-coffee-700/5 rounded-2xl p-6 border border-coffee-200/50">
        <h3 className="font-semibold text-coffee-700 mb-3">📌 Lưu ý quan trọng</h3>
        <ul className="space-y-2 text-sm text-coffee-500">
          <li className="flex items-center gap-2"><span className="w-5 h-5 bg-success-light text-success rounded-full flex items-center justify-center text-xs">✓</span> Cập nhật trạng thái đơn hàng kịp thời</li>
          <li className="flex items-center gap-2"><span className="w-5 h-5 bg-success-light text-success rounded-full flex items-center justify-center text-xs">✓</span> Kiểm tra thông tin đơn hàng trước khi xác nhận</li>
          <li className="flex items-center gap-2"><span className="w-5 h-5 bg-success-light text-success rounded-full flex items-center justify-center text-xs">✓</span> Hỗ trợ khách hàng tra cứu menu và đơn hàng</li>
          <li className="flex items-center gap-2"><span className="w-5 h-5 bg-success-light text-success rounded-full flex items-center justify-center text-xs">✓</span> Báo cáo sự cố hoặc vấn đề cho quản lý</li>
        </ul>
      </div>
    </div>
  );
}