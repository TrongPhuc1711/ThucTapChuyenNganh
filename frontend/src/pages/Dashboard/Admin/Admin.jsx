import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Coffee,
  FolderTree,
  UserCheck,
  Users,
  BarChart3,
  Receipt,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles
} from "lucide-react";
import api from "../../../services/api";

export default function Admin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchQuickStats();
  }, []);

  const fetchQuickStats = async () => {
    try {
      const [ordersRes, prodsRes, custsRes] = await Promise.all([
        api.get("/donhang").catch(() => ({ data: [] })),
        api.get("/mon").catch(() => ({ data: [] })),
        api.get("/khachhang").catch(() => ({ data: [] }))
      ]);

      const orders = ordersRes.data || [];
      const revenue = orders
        .filter(o => o.TrangThai === "Đã thanh toán" || o.TrangThai === "Đã giao")
        .reduce((sum, o) => sum + (Number(o.TongTien) || 0), 0);

      setStats({
        totalOrders: orders.length,
        totalProducts: (prodsRes.data || []).length,
        totalCustomers: (custsRes.data || []).length,
        totalRevenue: revenue,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const cards = [
    {
      title: "Quản lý món",
      desc: "Thêm mới, sửa giá, cập nhật kích cỡ & hình ảnh",
      icon: Coffee,
      path: "/admin/products",
      gradient: "from-amber-600 to-amber-700",
      accent: "text-amber-600 bg-amber-50"
    },
    {
      title: "Quản lý loại món",
      desc: "Phân nhóm danh mục thức uống & bánh ngọt",
      icon: FolderTree,
      path: "/admin/categories",
      gradient: "from-emerald-600 to-emerald-700",
      accent: "text-emerald-600 bg-emerald-50"
    },
    {
      title: "Quản lý đơn hàng",
      desc: "Theo dõi trạng thái, xác nhận & hủy đơn",
      icon: ShoppingBag,
      path: "/admin/orders",
      gradient: "from-orange-600 to-orange-700",
      accent: "text-orange-600 bg-orange-50"
    },
    {
      title: "Quản lý hóa đơn",
      desc: "Tra cứu lịch sử thanh toán & in lại hóa đơn",
      icon: Receipt,
      path: "/admin/bills",
      gradient: "from-teal-600 to-teal-700",
      accent: "text-teal-600 bg-teal-50"
    },
    {
      title: "Thống kê doanh thu",
      desc: "Báo cáo chi tiết theo ngày, tháng, năm",
      icon: BarChart3,
      path: "/admin/thongke",
      gradient: "from-rose-600 to-rose-700",
      accent: "text-rose-600 bg-rose-50"
    },
    {
      title: "Quản lý nhân viên",
      desc: "Phân quyền và tài khoản nhân sự quầy",
      icon: UserCheck,
      path: "/admin/staffs",
      gradient: "from-blue-600 to-blue-700",
      accent: "text-blue-600 bg-blue-50"
    },
    {
      title: "Quản lý khách hàng",
      desc: "Danh sách người dùng và lịch sử tích điểm",
      icon: Users,
      path: "/admin/customers",
      gradient: "from-violet-600 to-violet-700",
      accent: "text-violet-600 bg-violet-50"
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#2C1810] via-[#3E2723] to-[#2C1810] text-white shadow-xl shadow-[#2C1810]/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#C5963A]/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-[#E6C687]">
            <Sparkles className="w-3.5 h-3.5 text-[#C5963A]" />
            <span>P-Coffee Management Portal</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-white">
            Trung Tâm Quản Trị Hệ Thống
          </h1>
          <p className="text-sm text-[#D7CCC8] font-light max-w-xl">
            Kiểm soát menu, đơn hàng, hóa đơn và phân tích số liệu tài chính thời gian thực.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/create-order")}
          className="relative z-10 px-6 py-3.5 bg-gradient-to-r from-[#C5963A] to-[#D4A84B] hover:from-[#B8872D] hover:to-[#C5963A] text-[#1A0F0A] font-bold text-sm rounded-2xl shadow-lg shadow-[#C5963A]/20 transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
        >
          + Bán Hàng Tại Quầy (POS)
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-[#EFEBE9] shadow-sm flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#A1887F] uppercase tracking-wider">Tổng đơn hàng</p>
            <p className="text-2xl font-serif font-black text-[#2C1810] mt-0.5">
              {isLoading ? "..." : stats.totalOrders}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#EFEBE9] shadow-sm flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#A1887F] uppercase tracking-wider">Doanh thu tạm tính</p>
            <p className="text-2xl font-serif font-black text-[#C5963A] mt-0.5">
              {isLoading ? "..." : `${stats.totalRevenue.toLocaleString("vi-VN")}đ`}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#EFEBE9] shadow-sm flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#A1887F] uppercase tracking-wider">Món trong menu</p>
            <p className="text-2xl font-serif font-black text-[#2C1810] mt-0.5">
              {isLoading ? "..." : stats.totalProducts}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#EFEBE9] shadow-sm flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#A1887F] uppercase tracking-wider">Khách hàng</p>
            <p className="text-2xl font-serif font-black text-[#2C1810] mt-0.5">
              {isLoading ? "..." : stats.totalCustomers}
            </p>
          </div>
        </div>
      </div>

      {/* Feature Navigation Grid */}
      <div>
        <h2 className="font-serif text-xl font-bold text-[#2C1810] mb-5">
          Danh Mục Quản Lý
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                onClick={() => navigate(card.path)}
                className="group bg-white rounded-3xl p-6 cursor-pointer border border-[#EFEBE9] hover:border-[#C5963A]/40 hover:shadow-xl hover:shadow-[#2C1810]/5 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  
                  <h3 className="font-serif font-bold text-[#2C1810] text-lg mb-1.5 group-hover:text-[#C5963A] transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-[#8D6E63] leading-relaxed font-light">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#FAF7F2] flex items-center justify-between text-xs font-bold text-[#C5963A]">
                  <span>Mở bảng điều khiển</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
