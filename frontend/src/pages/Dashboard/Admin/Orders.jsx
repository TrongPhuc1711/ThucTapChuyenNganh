import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";
import InvoicePrint from "../../../components/InvoicePrint";
const API_URL = import.meta.env.DEV 
  ? "http://localhost:4000" 
  : (import.meta.env.VITE_API_URL || "https://thuctapchuyennganh.onrender.com");

export default function Orders() {
  const navigate = useNavigate();
  const [donHangs, setDonHangs] = useState([]);
  const [chiTietDonHang, setChiTietDonHang] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { loadDonHangs(); }, []);
  const loadDonHangs = async () => { setIsLoading(true); try { const res = await api.get("/donhang"); setDonHangs(res.data); } catch (err) { console.error(err); setMessage("❌ Lỗi khi tải danh sách đơn hàng"); setTimeout(() => setMessage(""), 3000); } finally { setIsLoading(false); } };
  const loadChiTietDonHang = async (maDH) => { try { const res = await api.get(`/donhang/chitiet/${maDH}`); setChiTietDonHang(res.data); } catch (err) { console.error(err); setMessage("❌ Lỗi khi tải chi tiết đơn hàng"); setTimeout(() => setMessage(""), 3000); } };
  const handleViewDetail = async (donHang) => { setSelectedOrder(donHang); await loadChiTietDonHang(donHang.MaDH); setShowDetailModal(true); };
  const handleUpdateStatus = async (maDH, newStatus, phuongThucThanhToan = null) => { try { const data = { TrangThai: newStatus }; if (phuongThucThanhToan) data.PhuongThucThanhToan = phuongThucThanhToan; await api.put(`/donhang/${maDH}`, data); setMessage(`✅Cập nhật trạng thái thành công`); loadDonHangs(); setTimeout(() => setMessage(""), 3000); } catch (err) { setMessage("❌ " + (err.response?.data?.message || "Có lỗi xảy ra")); setTimeout(() => setMessage(""), 3000); } };
  const handleCancelOrder = async (donHang) => { const isPaid = donHang.TrangThai === "Đã thanh toán"; const confirmMessage = isPaid ? "CẢNH BÁO: Đơn này ĐÃ THANH TOÁN. Hủy đơn đồng nghĩa với việc phải HOÀN TIỀN. Bạn có chắc chắn muốn hủy?" : "Bạn có chắc muốn hủy đơn hàng này?"; if (!window.confirm(confirmMessage)) return; try { await api.put(`/donhang/${donHang.MaDH}`, { TrangThai: "Đã hủy" }); setMessage("Hủy đơn hàng thành công" + (isPaid ? " (Đã cập nhật hóa đơn sang Hoàn tiền)" : "")); loadDonHangs(); setTimeout(() => setMessage(""), 3000); } catch (err) { setMessage("❌ " + (err.response?.data?.message || "Không thể hủy")); setTimeout(() => setMessage(""), 3000); } };
  const handleDeleteOrder = async (maDH) => { if (!window.confirm("Bạn có chắc muốn xóa đơn hàng này? Hành động này không thể hoàn tác!")) return; try { await api.delete(`/donhang/${maDH}`); setMessage("✅ Xóa đơn hàng thành công"); loadDonHangs(); setTimeout(() => setMessage(""), 3000); } catch (err) { console.log(err); setMessage("❌ " + (err.response?.data?.message || "Không thể xóa")); setTimeout(() => setMessage(""), 3000); } };
  const handlePayment = (donHang) => { const phuongThuc = window.prompt("Chọn phương thức thanh toán:\n1. Ví điện tử\n2. Chuyển khoản\n3. Tiền mặt", "1"); if (!phuongThuc) return; let method = ""; switch (phuongThuc) { case "1": method = "Ví điện tử"; break; case "2": method = "Chuyển khoản"; break; case "3": method = "Tiền mặt"; break; default: alert("Lựa chọn không hợp lệ!"); return; } handleUpdateStatus(donHang.MaDH, "Đã thanh toán", method); };
  const filteredDonHangs = donHangs.filter(dh => { const matchStatus = !filterStatus || dh.TrangThai === filterStatus; const matchSearch = !searchTerm || dh.MaDH.toString().includes(searchTerm) || dh.HoTen?.toLowerCase().includes(searchTerm.toLowerCase()) || dh.Email?.toLowerCase().includes(searchTerm.toLowerCase()); return matchStatus && matchSearch; });
  const getStatusBadge = (status) => { const styles = status === 'Treo' ? 'bg-warning-light text-warning' : status === 'Đã thanh toán' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'; return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles}`}>{status}</span>; };
  const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN');
  const formatCurrency = (amount) => Number(amount).toLocaleString('vi-VN') + ' đ';
  const getImageUrl = (imagePath) => { if (!imagePath) return "/placeholder.png"; if (imagePath.startsWith('http')) return imagePath; if (imagePath.startsWith('/uploads')) return `${API_URL}${imagePath}`; return `${API_URL}/${imagePath}`; };

  return (
    <DashboardLayout title="Quản lý đơn hàng">
      {message && <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium animate-slide-down ${message.includes('✅') ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>{message}</div>}
      <div className="bg-white rounded-2xl border border-coffee-100/50 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-coffee-50">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <h2 className="font-semibold text-coffee-800">Danh Sách Đơn Hàng ({filteredDonHangs.length})</h2>
            <div className="flex flex-wrap items-center gap-3">
              <input type="text" placeholder="Tìm theo mã ĐH, tên, email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-4 py-2 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm w-64" />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-700 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold/30">
                <option value="">Tất cả</option><option value="Treo">Treo</option><option value="Đã thanh toán">Đã thanh toán</option><option value="Đã hủy">Đã hủy</option>
              </select>
              <button onClick={() => navigate('/admin/create-order')} className="px-4 py-2 bg-gradient-to-r from-coffee-700 to-coffee-600 text-white text-sm font-medium rounded-xl hover:from-coffee-600 hover:to-coffee-500 transition-all shadow-md shadow-coffee-700/20">+ Tạo đơn hàng</button>
            </div>
          </div>
        </div>
        {isLoading ? <div className="p-12 text-center"><p className="text-coffee-300">Đang tải dữ liệu...</p></div> : filteredDonHangs.length === 0 ? <div className="p-12 text-center"><p className="text-coffee-300">Không có đơn hàng nào</p></div> : (
          <div className="overflow-x-auto"><table className="w-full"><thead><tr className="bg-coffee-50/50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Mã ĐH</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Khách hàng</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Ngày đặt</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Tổng tiền</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">PT TT</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Địa chỉ</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Trạng thái</th><th className="text-center px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Hành động</th>
          </tr></thead><tbody className="divide-y divide-coffee-50">{filteredDonHangs.map((dh) => (
            <tr key={dh.MaDH} className="hover:bg-coffee-50/30 transition-colors">
              <td className="px-4 py-3 text-sm font-semibold text-gold">#{dh.MaDH}</td>
              <td className="px-4 py-3"><div><p className="text-sm font-medium text-coffee-800">{dh.TenNguoiNhan || dh.HoTen || "Khách hàng"}</p><p className="text-xs text-coffee-400">{dh.Email || dh.SDTNguoiNhan}</p></div></td>
              <td className="px-4 py-3 text-sm text-coffee-500">{formatDate(dh.NgayDat)}</td>
              <td className="px-4 py-3 text-sm font-semibold text-coffee-800">{formatCurrency(dh.TongTien)}</td>
              <td className="px-4 py-3 text-sm text-coffee-500">{dh.PhuongThucThanhToan || "—"}</td>
              <td className="px-4 py-3 text-sm text-coffee-400 max-w-[120px] truncate">{dh.DiaChiGiaoHang || "Tại quầy"}</td>
              <td className="px-4 py-3">{getStatusBadge(dh.TrangThai)}</td>
              <td className="px-4 py-3"><div className="flex items-center justify-center gap-1.5 flex-wrap">
                <button onClick={() => handleViewDetail(dh)} className="px-2.5 py-1.5 text-xs font-medium text-info bg-info-light rounded-lg hover:bg-info/10 transition-colors">Xem</button>
                {dh.TrangThai === 'Treo' && <button onClick={() => handlePayment(dh)} className="px-2.5 py-1.5 text-xs font-medium text-success bg-success-light rounded-lg hover:bg-success/10 transition-colors">TT</button>}
                {dh.TrangThai !== 'Đã hủy' && dh.TrangThai !== 'Đã giao' && <button onClick={() => handleCancelOrder(dh)} className="px-2.5 py-1.5 text-xs font-medium text-warning bg-warning-light rounded-lg hover:bg-warning/10 transition-colors">Hủy</button>}
                <button onClick={() => handleDeleteOrder(dh.MaDH)} className="px-2.5 py-1.5 text-xs font-medium text-danger bg-danger-light rounded-lg hover:bg-danger/10 transition-colors">Xóa</button>
              </div></td>
            </tr>))}</tbody></table></div>
        )}
      </div>

      {/* Modal Chi tiết */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-coffee-50"><h3 className="font-heading text-xl font-bold text-coffee-800">Chi tiết đơn hàng #{selectedOrder.MaDH}</h3><button onClick={() => setShowDetailModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-coffee-50 text-coffee-400 hover:text-coffee-700 transition-colors">✕</button></div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-coffee-50/50 rounded-xl p-3"><p className="text-xs text-coffee-400 mb-1">Khách hàng</p><p className="text-sm font-medium text-coffee-800">{selectedOrder.TenNguoiNhan || selectedOrder.HoTen}</p></div>
                <div className="bg-coffee-50/50 rounded-xl p-3"><p className="text-xs text-coffee-400 mb-1">Email/SĐT</p><p className="text-sm font-medium text-coffee-800">{selectedOrder.Email || selectedOrder.SDTNguoiNhan}</p></div>
                <div className="bg-coffee-50/50 rounded-xl p-3"><p className="text-xs text-coffee-400 mb-1">Ngày đặt</p><p className="text-sm font-medium text-coffee-800">{formatDate(selectedOrder.NgayDat)}</p></div>
                <div className="bg-coffee-50/50 rounded-xl p-3"><p className="text-xs text-coffee-400 mb-1">Trạng thái</p>{getStatusBadge(selectedOrder.TrangThai)}</div>
                <div className="bg-coffee-50/50 rounded-xl p-3"><p className="text-xs text-coffee-400 mb-1">PT Thanh toán</p><p className="text-sm font-medium text-coffee-800">{selectedOrder.PhuongThucThanhToan || "Chưa chọn"}</p></div>
                <div className="bg-coffee-50/50 rounded-xl p-3"><p className="text-xs text-coffee-400 mb-1">Địa chỉ</p><p className="text-sm font-medium text-coffee-800">{selectedOrder.DiaChiGiaoHang || "Tại quầy"}</p></div>
              </div>
              <div><h4 className="text-sm font-semibold text-coffee-700 mb-3">Danh sách món:</h4><div className="space-y-2">{chiTietDonHang.map((item, index) => (
                <div key={index} className="flex items-center gap-3 bg-coffee-50/30 rounded-xl p-3 border border-coffee-100/50">
                  <img src={getImageUrl(item.HinhAnh)} alt={item.TenMon} className="w-12 h-12 rounded-lg object-cover border border-coffee-100" />
                  <div className="flex-1"><h5 className="text-sm font-medium text-coffee-800">{item.TenMon}</h5><p className="text-xs text-coffee-400">Size: {item.KichCo} · SL: {item.SoLuong}</p></div>
                  <p className="text-sm font-semibold text-gold">{formatCurrency(item.DonGia * item.SoLuong)}</p>
                </div>))}</div></div>
              <div className="flex justify-between items-center bg-coffee-700 text-white rounded-xl p-4"><span className="font-medium">Tổng cộng:</span><span className="text-xl font-bold">{formatCurrency(selectedOrder.TongTien)}</span></div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setShowInvoiceModal(true)} className="flex-1 py-2.5 bg-gradient-to-r from-coffee-700 to-coffee-600 text-white font-medium rounded-xl text-sm hover:from-coffee-600 hover:to-coffee-500 transition-all">In lại hóa đơn</button>
              <button onClick={() => setShowDetailModal(false)} className="px-6 py-2.5 bg-coffee-100 text-coffee-600 font-medium rounded-xl text-sm hover:bg-coffee-200 transition-all">Đóng</button>
            </div>
          </div>
        </div>
      )}
      {showInvoiceModal && selectedOrder && <InvoicePrint order={selectedOrder} items={chiTietDonHang} onClose={() => setShowInvoiceModal(false)} />}
    </DashboardLayout>
  );
}