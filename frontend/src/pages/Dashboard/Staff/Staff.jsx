import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Coffee, 
  Receipt, 
  Users, 
  ShoppingBag,
  ArrowRight,
  Sparkles,
  PlusCircle
} from "lucide-react";
import api from "../../../services/api";

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
      const response = await api.get("/donhang");
      const orders = response.data || [];
      const today = new Date().toDateString();
      setStatistics({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.TrangThai === "Treo").length,
        processingOrders: orders.filter(o => o.TrangThai === "Đang xử lý" || o.TrangThai === "Đang giao").length,
        completedToday: orders.filter(o => {
          return (o.TrangThai === "Đã giao" || o.TrangThai === "Đã thanh toán") && new Date(o.NgayDat).toDateString() === today;
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
      title: "Xử Lý Đơn Hàng", 
      description: "Xem và cập nhật trạng thái đơn khách đặt", 
      icon: ShoppingBag, 
      gradient: "from-blue-600 to-blue-700", 
      path: "/staff/orders" 
    },
    { 
      title: "Menu & Giá Món", 
      description: "Tra cứu danh mục và chi tiết size phục vụ khách", 
      icon: Coffee, 
      gradient: "from-amber-600 to-amber-700", 
      path: "/staff/products" 
    },
    { 
      title: "Quản Lý Hóa Đơn", 
      description: "Tra cứu phiếu thu và in lại hóa đơn cho khách", 
      icon: Receipt, 
      gradient: "from-emerald-600 to-emerald-700", 
      path: "/staff/bills" 
    },
    { 
      title: "Thông Tin Khách Hàng", 
      description: "Tra cứu số điện thoại và địa chỉ giao hàng", 
      icon: Users, 
      gradient: "from-purple-600 to-purple-700", 
      path: "/staff/customers" 
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#2C1810] via-[#3E2723] to-[#2C1810] text-white shadow-xl shadow-[#2C1810]/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-[#E6C687]">
            <Sparkles className="w-3.5 h-3.5 text-[#C5963A]" />
            <span>P-Coffee Staff Portal</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-white">
            Bảng Làm Việc Nhân Viên
          </h1>
          <p className="text-sm text-[#D7CCC8] font-light max-w-xl">
            Tiếp nhận đơn hàng, chuẩn bị thức uống và xuất hóa đơn phục vụ khách tại quầy.
          </p>
        </div>

        <button
          onClick={() => navigate("/staff/create-order")}
          className="relative z-10 px-6 py-3.5 bg-gradient-to-r from-[#C5963A] to-[#D4A84B] hover:from-[#B8872D] hover:to-[#C5963A] text-[#1A0F0A] font-bold text-sm rounded-2xl shadow-lg shadow-[#C5963A]/20 transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Bán Hàng Tại Quầy (POS)</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-[#EFEBE9] shadow-sm flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#A1887F] uppercase tracking-wider">Tổng Đơn Hàng</p>
            <p className="text-2xl font-serif font-black text-[#2C1810] mt-0.5">
              {loading ? "..." : statistics.totalOrders}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#EFEBE9] shadow-sm flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#A1887F] uppercase tracking-wider">Chờ Xử Lý</p>
            <p className="text-2xl font-serif font-black text-amber-600 mt-0.5">
              {loading ? "..." : statistics.pendingOrders}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#EFEBE9] shadow-sm flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#A1887F] uppercase tracking-wider">Đang Pha Chế / Giao</p>
            <p className="text-2xl font-serif font-black text-purple-600 mt-0.5">
              {loading ? "..." : statistics.processingOrders}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#EFEBE9] shadow-sm flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#A1887F] uppercase tracking-wider">Hoàn Tất Hôm Nay</p>
            <p className="text-2xl font-serif font-black text-emerald-600 mt-0.5">
              {loading ? "..." : statistics.completedToday}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div>
        <h2 className="font-serif text-xl font-bold text-[#2C1810] mb-5">
          Chức Năng Nghiệp Vụ
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div 
                key={index} 
                className="group bg-white rounded-3xl p-6 cursor-pointer border border-[#EFEBE9] hover:border-[#C5963A]/40 hover:shadow-xl hover:shadow-[#2C1810]/5 transition-all duration-300 hover:-translate-y-1 flex items-center gap-5" 
                onClick={() => navigate(action.path)}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif font-bold text-[#2C1810] text-base group-hover:text-[#C5963A] transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-[#8D6E63] mt-0.5 font-light">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-[#A1887F] group-hover:text-[#C5963A] group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Staff Operational Guidelines */}
      <div className="p-6 rounded-3xl bg-white border border-[#EFEBE9] space-y-4">
        <h3 className="font-serif font-bold text-base text-[#2C1810]">
          Quy Chuẩn Phục Vụ & Pha Chế P-Coffee
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#6D4C41]">
          <div className="flex items-center gap-2 p-3 bg-[#FAF7F2] rounded-xl">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">1</span>
            <span>Ưu tiên pha chế các đơn hàng có trạng thái "Đang xử lý".</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-[#FAF7F2] rounded-xl">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">2</span>
            <span>Kiểm tra chính xác kích cỡ (Nhỏ / Vừa / Lớn) trên hóa đơn.</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-[#FAF7F2] rounded-xl">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">3</span>
            <span>In hóa đơn giao cho khách kèm theo mã đơn hàng tương ứng.</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-[#FAF7F2] rounded-xl">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">4</span>
            <span>Cập nhật trạng thái "Đã giao" ngay khi đưa món cho khách.</span>
          </div>
        </div>
      </div>

    </div>
  );
}