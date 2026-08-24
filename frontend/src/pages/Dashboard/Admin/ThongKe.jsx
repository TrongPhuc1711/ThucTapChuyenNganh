import { useState } from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  Calendar, 
  TrendingUp, 
  ShoppingBag, 
  Coffee, 
  BarChart2, 
  Search,
  ArrowUpRight
} from "lucide-react";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";
import Button from "../../../components/ui/Button";

export default function ThongKe() {
  const [ngay, setNgay] = useState(""); 
  const [thang, setThang] = useState(""); 
  const [nam, setNam] = useState("");
  const [kq, setKq] = useState(null); 
  const [loading, setLoading] = useState(false); 
  const [loaiThongKe, setLoaiThongKe] = useState("");

  const fetchNgay = async () => { 
    if (!ngay) { alert("Vui lòng chọn ngày!"); return; } 
    try { 
      setLoading(true); 
      const res = await api.get(`/thongke/ngay?date=${ngay}`); 
      setKq(res.data); 
      setLoaiThongKe("ngày " + new Date(ngay).toLocaleDateString("vi-VN")); 
    } catch (error) { 
      console.error(error); 
      alert("Có lỗi xảy ra khi lấy thống kê ngày!"); 
    } finally { 
      setLoading(false); 
    } 
  };

  const fetchThang = async () => { 
    if (!thang) { alert("Vui lòng chọn tháng!"); return; } 
    try { 
      setLoading(true); 
      const [y, m] = thang.split("-"); 
      const res = await api.get(`/thongke/thang?year=${y}&month=${m}`); 
      setKq(res.data); 
      setLoaiThongKe(`tháng ${m}/${y}`); 
    } catch (error) { 
      console.error(error); 
      alert("Có lỗi xảy ra khi lấy thống kê tháng!"); 
    } finally { 
      setLoading(false); 
    } 
  };

  const fetchNam = async () => { 
    if (!nam) { alert("Vui lòng nhập năm!"); return; } 
    try { 
      setLoading(true); 
      const res = await api.get(`/thongke/nam?year=${nam}`); 
      setKq(res.data); 
      setLoaiThongKe("năm " + nam); 
    } catch (error) { 
      console.error(error); 
      alert("Có lỗi xảy ra khi lấy thống kê năm!"); 
    } finally { 
      setLoading(false); 
    } 
  };

  const preparePieData = () => { 
    if (!kq?.ChiTiet) return []; 
    return kq.ChiTiet.map(item => ({ name: item.TenMon, value: Number(item.ThanhTien) })); 
  };

  const prepareLineData = () => { 
    if (!kq?.ChiTiet) return []; 
    return kq.ChiTiet.map(item => ({ name: item.TenMon, soLuong: item.SoLuong, doanhThu: item.ThanhTien })); 
  };

  const COLORS = ['#c5963a', '#2c1810', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <DashboardLayout title="Báo Cáo & Thống Kê Doanh Thu">
      <div className="space-y-8 animate-fade-in">
        
        {/* Filter Toolbar Card */}
        <div className="bg-white rounded-3xl border border-[#EFEBE9] shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-[#FAF7F2] pb-4">
            <Calendar className="w-5 h-5 text-[#C5963A]" />
            <h2 className="font-serif text-xl font-bold text-[#2C1810]">
              Chọn Khoảng Thời Gian Thống Kê
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Filter by Day */}
            <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#EFEBE9] space-y-3 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold text-[#4E342E] uppercase tracking-wider mb-2">
                  Theo Ngày Cụ Thể
                </label>
                <input 
                  type="date" 
                  value={ngay} 
                  onChange={(e) => setNgay(e.target.value)} 
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#EFEBE9] text-xs font-semibold text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#C5963A]/30"
                />
              </div>
              <Button 
                onClick={fetchNgay} 
                loading={loading}
                variant="primary"
                size="sm"
                className="w-full font-bold"
              >
                Xem Thống Kê Ngày
              </Button>
            </div>

            {/* Filter by Month */}
            <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#EFEBE9] space-y-3 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold text-[#4E342E] uppercase tracking-wider mb-2">
                  Theo Tháng & Năm
                </label>
                <input 
                  type="month" 
                  value={thang} 
                  onChange={(e) => setThang(e.target.value)} 
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#EFEBE9] text-xs font-semibold text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#C5963A]/30"
                />
              </div>
              <Button 
                onClick={fetchThang} 
                loading={loading}
                variant="primary"
                size="sm"
                className="w-full font-bold"
              >
                Xem Thống Kê Tháng
              </Button>
            </div>

            {/* Filter by Year */}
            <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#EFEBE9] space-y-3 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold text-[#4E342E] uppercase tracking-wider mb-2">
                  Theo Toàn Bộ Năm
                </label>
                <input 
                  type="number" 
                  placeholder="VD: 2025" 
                  value={nam} 
                  onChange={(e) => setNam(e.target.value)} 
                  min="2000" 
                  max="2100" 
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#EFEBE9] text-xs font-semibold text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#C5963A]/30 font-mono"
                />
              </div>
              <Button 
                onClick={fetchNam} 
                loading={loading}
                variant="primary"
                size="sm"
                className="w-full font-bold"
              >
                Xem Thống Kê Năm
              </Button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {kq && !loading && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Header Result */}
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl font-bold text-[#2C1810]">
                Số Liệu Báo Cáo
              </h3>
              <span className="px-4 py-1.5 bg-[#C5963A]/10 text-[#C5963A] text-xs font-bold rounded-full border border-[#C5963A]/20">
                Thống kê theo {loaiThongKe}
              </span>
            </div>

            {/* KPI Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-xl shadow-emerald-700/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">Tổng Doanh Thu</span>
                  <TrendingUp className="w-5 h-5 text-emerald-200" />
                </div>
                <p className="font-serif font-black text-3xl">
                  {kq.DoanhThu?.toLocaleString('vi-VN')} <span className="text-lg font-normal">đ</span>
                </p>
              </div>

              {kq.SoDonHang !== undefined && (
                <div className="p-6 rounded-3xl bg-gradient-to-br from-[#2C1810] to-[#4E342E] text-white shadow-xl shadow-[#2C1810]/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#D7CCC8]">Tổng Đơn Bán</span>
                    <ShoppingBag className="w-5 h-5 text-[#C5963A]" />
                  </div>
                  <p className="font-serif font-black text-3xl">
                    {kq.SoDonHang?.toLocaleString('vi-VN')} <span className="text-lg font-normal">đơn</span>
                  </p>
                </div>
              )}

              {kq.SanPhamBan !== undefined && (
                <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-xl shadow-amber-700/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-100">Ly Đã Phục Vụ</span>
                    <Coffee className="w-5 h-5 text-amber-200" />
                  </div>
                  <p className="font-serif font-black text-3xl">
                    {kq.SanPhamBan?.toLocaleString('vi-VN')} <span className="text-lg font-normal">ly</span>
                  </p>
                </div>
              )}
            </div>

            {/* Visual Charts */}
            {(kq.ChiTiet && kq.ChiTiet.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Pie Chart */}
                <div className="bg-white rounded-3xl border border-[#EFEBE9] shadow-sm p-6 sm:p-8 space-y-4">
                  <h4 className="font-serif font-bold text-lg text-[#2C1810]">
                    Tỷ Trọng Doanh Thu Theo Món
                  </h4>
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={preparePieData()} 
                          cx="50%" 
                          cy="50%" 
                          outerRadius={100} 
                          innerRadius={50}
                          dataKey="value"
                          paddingAngle={3}
                        >
                          {preparePieData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')} đ`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Line Chart */}
                <div className="bg-white rounded-3xl border border-[#EFEBE9] shadow-sm p-6 sm:p-8 space-y-4">
                  <h4 className="font-serif font-bold text-lg text-[#2C1810]">
                    Số Lượng Bán & Doanh Thu Từng Món
                  </h4>
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={prepareLineData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#FAF7F2" />
                        <XAxis dataKey="name" angle={-30} textAnchor="end" height={60} tick={{ fontSize: 10 }} />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip formatter={(value, name) => name === 'doanhThu' ? `${value.toLocaleString('vi-VN')} đ` : `${value} ly`} />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="soLuong" stroke="#C5963A" strokeWidth={3} name="Số lượng (ly)" />
                        <Line yAxisId="right" type="monotone" dataKey="doanhThu" stroke="#10B981" strokeWidth={3} name="Doanh thu (đ)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            )}

            {/* Detail Breakdown Table */}
            {(kq.ChiTiet || kq.ChiTietTheoMon) && (
              <div className="bg-white rounded-3xl border border-[#EFEBE9] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#FAF7F2]">
                  <h4 className="font-serif font-bold text-lg text-[#2C1810]">
                    Bảng Kê Chi Tiết Sản Phẩm Bán Ra
                  </h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#FAF7F2] border-b border-[#EFEBE9]">
                        <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">STT</th>
                        <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">Tên Món</th>
                        <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider text-center">Số Lượng</th>
                        <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">Đơn Giá</th>
                        <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">Thành Tiền</th>
                        <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider text-right">% Doanh Thu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FAF7F2] text-sm">
                      {kq.ChiTiet && kq.ChiTiet.length > 0 ? (
                        kq.ChiTiet.map((item, index) => (
                          <tr key={index} className="hover:bg-[#FAF7F2]/60 transition-colors">
                            <td className="px-5 py-4 text-xs font-mono font-bold text-[#A1887F]">
                              #{index + 1}
                            </td>
                            <td className="px-5 py-4 font-serif font-bold text-[#2C1810]">
                              {item.TenMon}
                            </td>
                            <td className="px-5 py-4 text-center font-bold text-[#4E342E]">
                              {item.SoLuong}
                            </td>
                            <td className="px-5 py-4 text-xs text-[#6D4C41] font-mono">
                              {Number(item.DonGia || 0).toLocaleString('vi-VN')} đ
                            </td>
                            <td className="px-5 py-4 font-serif font-black text-[#C5963A]">
                              {Number(item.ThanhTien || 0).toLocaleString('vi-VN')} đ
                            </td>
                            <td className="px-5 py-4 text-right">
                              <span className="px-2.5 py-1 bg-[#FAF7F2] text-[#C5963A] text-xs font-bold rounded-lg border border-[#EFEBE9]">
                                {((item.ThanhTien / kq.DoanhThu) * 100).toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-xs text-[#A1887F] italic">
                            Không có dữ liệu chi tiết
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Empty placeholder */}
        {!kq && !loading && (
          <div className="bg-white rounded-3xl border border-[#EFEBE9] shadow-sm p-16 text-center space-y-3">
            <BarChart2 className="w-16 h-16 text-[#A1887F] mx-auto opacity-30" />
            <h4 className="font-serif font-bold text-lg text-[#2C1810]">
              Chưa Chọn Mốc Thời Gian
            </h4>
            <p className="text-xs text-[#8D6E63] max-w-sm mx-auto">
              Hãy chọn theo Ngày, Tháng hoặc Năm ở bảng trên rồi bấm "Xem Thống Kê" để hiển thị biểu đồ.
            </p>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}