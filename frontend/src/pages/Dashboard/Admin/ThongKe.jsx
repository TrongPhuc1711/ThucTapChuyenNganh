import { useState } from "react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";
import { Aperture } from "lucide-react";

export default function ThongKe() {
  const [ngay, setNgay] = useState(""); const [thang, setThang] = useState(""); const [nam, setNam] = useState("");
  const [kq, setKq] = useState(null); const [loading, setLoading] = useState(false); const [loaiThongKe, setLoaiThongKe] = useState("");

  const fetchNgay = async () => { if (!ngay) { alert("Vui lòng chọn ngày!"); return; } try { setLoading(true); const res = await api.get(`/thongke/ngay?date=${ngay}`); setKq(res.data); setLoaiThongKe("ngày " + new Date(ngay).toLocaleDateString("vi-VN")); } catch (error) { console.error("Lỗi khi lấy thống kê ngày:", error); alert("Có lỗi xảy ra. Vui lòng thử lại!"); } finally { setLoading(false); } };
  const fetchThang = async () => { if (!thang) { alert("Vui lòng chọn tháng!"); return; } try { setLoading(true); const [y, m] = thang.split("-"); const res = await api.get(`/thongke/thang?year=${y}&month=${m}`); setKq(res.data); setLoaiThongKe(`tháng ${m}/${y}`); } catch (error) { console.error("Lỗi khi lấy thống kê tháng:", error); alert("Có lỗi xảy ra. Vui lòng thử lại!"); } finally { setLoading(false); } };
  const fetchNam = async () => { if (!nam) { alert("Vui lòng nhập năm!"); return; } try { setLoading(true); const res = await api.get(`/thongke/nam?year=${nam}`); setKq(res.data); setLoaiThongKe("năm " + nam); } catch (error) { console.error("Lỗi khi lấy thống kê năm:", error); alert("Có lỗi xảy ra. Vui lòng thử lại!"); } finally { setLoading(false); } };
  const preparePieData = () => { if (!kq?.ChiTiet) return []; return kq.ChiTiet.map(item => ({ name: item.TenMon, value: Number(item.ThanhTien) })); };
  const prepareLineData = () => { if (!kq?.ChiTiet) return []; return kq.ChiTiet.map((item, index) => ({ name: item.TenMon, soLuong: item.SoLuong, doanhThu: item.ThanhTien })); };
  const COLORS = ['#c5963a', '#6d4c41', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <DashboardLayout title="Thống Kê Doanh Thu">
      {/* Form */}
      <div className="bg-white rounded-2xl border border-coffee-100/50 shadow-sm p-6 mb-6">
        <h2 className="font-heading text-xl font-bold text-coffee-800 mb-5">Chọn khoảng thời gian</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-coffee-50/50 rounded-xl p-4 border border-coffee-100/50">
            <label className="block text-sm font-medium text-coffee-600 mb-2">Theo Ngày</label>
            <input type="date" value={ngay} onChange={(e) => setNgay(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white border border-coffee-100 text-coffee-800 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm mb-3" />
            <button className="w-full py-2.5 bg-gradient-to-r from-coffee-700 to-coffee-600 text-white font-medium rounded-xl hover:from-coffee-600 hover:to-coffee-500 transition-all text-sm shadow-md shadow-coffee-700/20 disabled:opacity-50" onClick={fetchNgay} disabled={loading}>{loading ? "Đang tải..." : "Xem Thống Kê"}</button>
          </div>
          <div className="bg-coffee-50/50 rounded-xl p-4 border border-coffee-100/50">
            <label className="block text-sm font-medium text-coffee-600 mb-2">Theo Tháng</label>
            <input type="month" value={thang} onChange={(e) => setThang(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white border border-coffee-100 text-coffee-800 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm mb-3" />
            <button className="w-full py-2.5 bg-gradient-to-r from-coffee-700 to-coffee-600 text-white font-medium rounded-xl hover:from-coffee-600 hover:to-coffee-500 transition-all text-sm shadow-md shadow-coffee-700/20 disabled:opacity-50" onClick={fetchThang} disabled={loading}>{loading ? "Đang tải..." : "Xem Thống Kê"}</button>
          </div>
          <div className="bg-coffee-50/50 rounded-xl p-4 border border-coffee-100/50">
            <label className="block text-sm font-medium text-coffee-600 mb-2">Theo Năm</label>
            <input type="number" placeholder="VD: 2025" value={nam} onChange={(e) => setNam(e.target.value)} min="2000" max="2100" className="w-full px-4 py-2.5 rounded-xl bg-white border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm mb-3" />
            <button className="w-full py-2.5 bg-gradient-to-r from-coffee-700 to-coffee-600 text-white font-medium rounded-xl hover:from-coffee-600 hover:to-coffee-500 transition-all text-sm shadow-md shadow-coffee-700/20 disabled:opacity-50" onClick={fetchNam} disabled={loading}>{loading ? "Đang tải..." : "Xem Thống Kê"}</button>
          </div>
        </div>
      </div>

      {/* Results */}
      {kq && !loading && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between"><h2 className="font-heading text-xl font-bold text-coffee-800">Kết quả thống kê</h2><span className="px-3 py-1 bg-gold/10 text-gold text-sm font-medium rounded-full">Theo {loaiThongKe}</span></div>
          
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg"><p className="text-emerald-100 text-sm mb-1">💵 Doanh thu</p><p className="text-3xl font-bold">{kq.DoanhThu?.toLocaleString('vi-VN')} <span className="text-lg font-normal">đ</span></p></div>
            {kq.SoDonHang !== undefined && <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg"><p className="text-blue-100 text-sm mb-1">📦 Số đơn hàng</p><p className="text-3xl font-bold">{kq.SoDonHang?.toLocaleString('vi-VN')} <span className="text-lg font-normal">đơn</span></p></div>}
            {kq.SanPhamBan !== undefined && <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg"><p className="text-purple-100 text-sm mb-1">☕ Sản phẩm đã bán</p><p className="text-3xl font-bold">{kq.SanPhamBan?.toLocaleString('vi-VN')} <span className="text-lg font-normal">sp</span></p></div>}
          </div>

          {/* Charts */}
          {(kq.ChiTiet && kq.ChiTiet.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-coffee-100/50 shadow-sm p-6">
                <h3 className="font-semibold text-coffee-800 mb-4">Biểu đồ doanh thu theo món</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart><Pie data={preparePieData()} cx="50%" cy="50%" labelLine={false} label={(entry) => `${entry.name}: ${(entry.value / kq.DoanhThu * 100).toFixed(1)}%`} outerRadius={110} fill="#8884d8" dataKey="value">{preparePieData().map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip formatter={(value) => value.toLocaleString('vi-VN') + ' đ'} /><Legend /></PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-2xl border border-coffee-100/50 shadow-sm p-6">
                <h3 className="font-semibold text-coffee-800 mb-4">📈 Biểu đồ số lượng & doanh thu</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={prepareLineData()}><CartesianGrid strokeDasharray="3 3" stroke="#efebe9" /><XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{fontSize: 11}} /><YAxis yAxisId="left" /><YAxis yAxisId="right" orientation="right" /><Tooltip formatter={(value, name) => { if (name === 'doanhThu') return value.toLocaleString('vi-VN') + ' đ'; return value + ' sp'; }} /><Legend /><Line yAxisId="left" type="monotone" dataKey="soLuong" stroke="#c5963a" strokeWidth={2} name="Số lượng" /><Line yAxisId="right" type="monotone" dataKey="doanhThu" stroke="#10b981" strokeWidth={2} name="Doanh thu" /></LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Detail Table */}
          {(kq.ChiTiet || kq.ChiTietTheoMon) && (
            <div className="bg-white rounded-2xl border border-coffee-100/50 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-coffee-50"><h3 className="font-semibold text-coffee-800">Chi tiết thống kê</h3></div>
              <div className="overflow-x-auto"><table className="w-full"><thead><tr className="bg-coffee-50/50"><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">STT</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Tên món</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Số lượng</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Đơn giá</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Thành tiền</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">% DT</th></tr></thead>
                <tbody className="divide-y divide-coffee-50">{kq.ChiTiet && kq.ChiTiet.length > 0 ? kq.ChiTiet.map((item, index) => (
                  <tr key={index} className="hover:bg-coffee-50/30 transition-colors"><td className="px-4 py-3 text-sm text-coffee-500">{index + 1}</td><td className="px-4 py-3 text-sm font-medium text-coffee-800">{item.TenMon}</td><td className="px-4 py-3 text-sm text-coffee-600">{item.SoLuong}</td><td className="px-4 py-3 text-sm text-coffee-600">{item.DonGia?.toLocaleString('vi-VN')} đ</td><td className="px-4 py-3 text-sm font-semibold text-gold">{item.ThanhTien?.toLocaleString('vi-VN')} đ</td><td className="px-4 py-3"><span className="px-2.5 py-1 bg-gold/10 text-gold text-xs font-semibold rounded-full">{((item.ThanhTien / kq.DoanhThu) * 100).toFixed(1)}%</span></td></tr>
                )) : <tr><td colSpan="6" className="px-4 py-8 text-center text-coffee-300">Không có dữ liệu chi tiết</td></tr>}</tbody></table></div>
            </div>
          )}
        </div>
      )}
      {!kq && !loading && <div className="bg-white rounded-2xl border border-coffee-100/50 shadow-sm p-12 text-center"><div className="text-5xl mb-4">📊</div><p className="text-coffee-400">Vui lòng chọn ngày, tháng hoặc năm để xem thống kê</p></div>}
    </DashboardLayout>
  );
}