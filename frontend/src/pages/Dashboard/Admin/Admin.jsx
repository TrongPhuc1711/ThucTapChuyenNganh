import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();

  const cards = [
    { title: "Quản lý món", desc: "Thêm, sửa, xóa sản phẩm", icon: "☕", path: "/admin/products", gradient: "from-amber-600 to-amber-700" },
    { title: "Quản lý loại món", desc: "Phân loại sản phẩm", icon: "📋", path: "/admin/categories", gradient: "from-emerald-600 to-emerald-700" },
    { title: "Quản lý nhân viên", desc: "Thông tin nhân viên", icon: "👨‍💼", path: "/admin/staffs", gradient: "from-blue-600 to-blue-700" },
    { title: "Quản lý khách hàng", desc: "Thông tin khách hàng", icon: "👥", path: "/admin/customers", gradient: "from-violet-600 to-violet-700" },
    { title: "Thống kê doanh thu", desc: "Báo cáo bán hàng", icon: "📊", path: "/admin/thongke", gradient: "from-rose-600 to-rose-700" },
    { title: "Quản lý hóa đơn", desc: "Xem và xuất hóa đơn", icon: "🧾", path: "/admin/bills", gradient: "from-teal-600 to-teal-700" },
    { title: "Quản lý đơn hàng", desc: "Xem đơn bán hàng", icon: "📦", path: "/admin/orders", gradient: "from-orange-600 to-orange-700" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-coffee-800 mb-2">Dashboard</h1>
        <p className="text-coffee-400">Quản lý tổng quan hệ thống P-Coffee</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {cards.map((card, i) => (
          <div
            key={i}
            onClick={() => navigate(card.path)}
            className="group bg-white rounded-2xl p-6 cursor-pointer border border-coffee-100/50 hover:shadow-xl hover:shadow-coffee-900/5 transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              {card.icon}
            </div>
            <h2 className="font-semibold text-coffee-800 text-lg mb-1 group-hover:text-gold transition-colors">{card.title}</h2>
            <p className="text-sm text-coffee-400">{card.desc}</p>
            <div className="mt-4 flex items-center gap-1 text-sm text-gold font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Vào quản lý
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
