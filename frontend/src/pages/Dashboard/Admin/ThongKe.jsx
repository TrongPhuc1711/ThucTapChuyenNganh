import { useState } from "react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";
import "../../../styles/Dashboard/ThongKe.css";
import { Aperture } from "lucide-react";

export default function ThongKe() {
  const [ngay, setNgay] = useState("");
  const [thang, setThang] = useState("");
  const [nam, setNam] = useState("");
  const [kq, setKq] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaiThongKe, setLoaiThongKe] = useState("");

  const fetchNgay = async () => {
    if (!ngay) {
      alert("Vui lòng chọn ngày!");
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/thongke/ngay?date=${ngay}`);
      setKq(res.data);
      setLoaiThongKe("ngày " + new Date(ngay).toLocaleDateString("vi-VN"));
    } catch (error) {
      console.error("Lỗi khi lấy thống kê ngày:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const fetchThang = async () => {
    if (!thang) {
      alert("Vui lòng chọn tháng!");
      return;
    }
    try {
      setLoading(true);
      const [y, m] = thang.split("-");
      const res = await api.get(`/thongke/thang?year=${y}&month=${m}`);
      setKq(res.data);
      setLoaiThongKe(`tháng ${m}/${y}`);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê tháng:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const fetchNam = async () => {
    if (!nam) {
      alert("Vui lòng nhập năm!");
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/thongke/nam?year=${nam}`);
      setKq(res.data);
      setLoaiThongKe("năm " + nam);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê năm:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Chuẩn bị dữ liệu cho biểu đồ tròn
  const preparePieData = () => {
    if (!kq?.ChiTiet) return [];
    return kq.ChiTiet.map(item => ({
      name: item.TenMon,
      value: item.ThanhTien
    }));
  };

  // Chuẩn bị dữ liệu cho biểu đồ đường
  const prepareLineData = () => {
    if (!kq?.ChiTiet) return [];
    return kq.ChiTiet.map((item, index) => ({
      name: item.TenMon,
      soLuong: item.SoLuong,
      doanhThu: item.ThanhTien
    }));
  };

  // Màu sắc cho biểu đồ tròn
  const COLORS = ['#667eea', '#764ba2', '#11998e', '#38ef7d', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

  return (
    <DashboardLayout title="Thống Kê Doanh Thu">
      {/* FORM */}
      <div className="form-section">
        <h2>Thống Kê Doanh Thu</h2>
        
        <div className="form-row">
          {/* Theo ngày */}
          <div className="form-group">
            <label>Theo Ngày</label>
            <input
              type="date"
              value={ngay}
              onChange={(e) => setNgay(e.target.value)}
            />
            <button 
              className="btn-submit" 
              onClick={fetchNgay} 
              disabled={loading}
              style={{ marginTop: '10px' }}
            >
              {loading ? "Đang tải..." : "Xem Thống Kê"}
            </button>
          </div>

          {/* Theo tháng */}
          <div className="form-group">
            <label>Theo Tháng</label>
            <input
              type="month"
              value={thang}
              onChange={(e) => setThang(e.target.value)}
            />
            <button 
              className="btn-submit" 
              onClick={fetchThang} 
              disabled={loading}
              style={{ marginTop: '10px' }}
            >
              {loading ? "Đang tải..." : "Xem Thống Kê"}
            </button>
          </div>
        </div>

        <div className="form-row">
          {/* Theo năm */}
          <div className="form-group">
            <label>Theo Năm</label>
            <input
              type="number"
              placeholder="VD: 2025"
              value={nam}
              onChange={(e) => setNam(e.target.value)}
              min="2000"
              max="2100"
            />
            <button 
              className="btn-submit" 
              onClick={fetchNam} 
              disabled={loading}
              style={{ marginTop: '10px' }}
            >
              {loading ? "Đang tải..." : "Xem Thống Kê"}
            </button>
          </div>

          {/* Loading indicator */}
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {loading && (
              <p className="tk-loading-text">⏳ Đang tải dữ liệu...</p>
            )}
          </div>
        </div>
      </div>

      {/* KẾT QUẢ */}
      {kq && !loading && (
        <div className="list-section">
          <div className="list-header">
            <h2>Kết quả thống kê</h2>
            <span className="badge-category">Theo {loaiThongKe}</span>
          </div>

          {/* Stats Cards */}
          <div className="chitiet-grid tk-stats-grid">
            {/* Doanh thu */}
            <div className="chitiet-section tk-stat-card-doanhthu">
              <h3>💵Doanh thu</h3>
              <div className="tk-stat-value">
                {kq.DoanhThu?.toLocaleString('vi-VN')} 
                <span className="tk-stat-unit">đ</span>
              </div>
            </div>

            {/* Số đơn hàng */}
            {kq.SoDonHang !== undefined && (
              <div className="chitiet-section tk-stat-card-donhang">
                <h3>📦Số đơn hàng</h3>
                <div className="tk-stat-value">
                  {kq.SoDonHang?.toLocaleString('vi-VN')} 
                  <span className="tk-stat-unit">đơn</span>
                </div>
              </div>
            )}

            {/* Sản phẩm bán */}
            {kq.SanPhamBan !== undefined && (
              <div className="chitiet-section tk-stat-card-sanpham">
                <h3>Sản phẩm đã bán</h3>
                <div className="tk-stat-value">
                  {kq.SanPhamBan?.toLocaleString('vi-VN')} 
                  <span className="tk-stat-unit">sp</span>
                </div>
              </div>
            )}
          </div>

          {/* Biểu đồ */}
          {(kq.ChiTiet && kq.ChiTiet.length > 0) && (
            <div className="tk-chart-container">
              {/* Biểu đồ tròn - Doanh thu theo món */}
              <div className="tk-chart-box">
                <h3 className="tk-chart-title">Biểu đồ doanh thu theo món</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={preparePieData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${(entry.value / kq.DoanhThu * 100).toFixed(1)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {preparePieData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => value.toLocaleString('vi-VN') + ' đ'}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Biểu đồ đường - Số lượng và doanh thu */}
              <div className="tk-chart-box">
                <h3 className="tk-chart-title">📈Biểu đồ số lượng & doanh thu</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={prepareLineData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'doanhThu') return value.toLocaleString('vi-VN') + ' đ';
                        return value + ' sp';
                      }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="soLuong" 
                      stroke="#4facfe" 
                      strokeWidth={2}
                      name="Số lượng"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="doanhThu" 
                      stroke="#11998e" 
                      strokeWidth={2}
                      name="Doanh thu"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Bảng chi tiết */}
          {(kq.ChiTiet || kq.ChiTietTheoMon) && (
            <div style={{ marginTop: '30px' }}>
              <h3 className="tk-detail-title">Chi tiết thống kê</h3>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Tên món</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                      <th>% Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kq.ChiTiet && kq.ChiTiet.length > 0 ? (
                      kq.ChiTiet.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className="product-name">{item.TenMon}</td>
                          <td>{item.SoLuong}</td>
                          <td className="product-price">
                            {item.DonGia?.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="product-price">
                            {item.ThanhTien?.toLocaleString('vi-VN')} đ
                          </td>
                          <td>
                            <span className="tk-percent-badge">
                              {((item.ThanhTien / kq.DoanhThu) * 100).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="empty-state">
                          <p>Không có dữ liệu chi tiết</p>
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

      {/* EMPTY STATE */}
      {!kq && !loading && (
        <div className="list-section">
          <div className="empty-state">
            <p>Vui lòng chọn ngày, tháng hoặc năm để xem thống kê</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}