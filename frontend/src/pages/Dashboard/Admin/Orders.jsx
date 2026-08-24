import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Eye, 
  Trash2, 
  Printer, 
  Search, 
  Plus, 
  X, 
  CheckCircle, 
  AlertCircle,
  CreditCard,
  Banknote,
  Smartphone,
  ShoppingBag
} from "lucide-react";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";
import InvoicePrint from "../../../components/InvoicePrint";
import StatusBadge from "../../../components/ui/StatusBadge";
import Pagination from "../../../components/ui/Pagination";

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderToPay, setOrderToPay] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Phân trang 10 mục / trang
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => { 
    loadDonHangs(); 
  }, []);

  const loadDonHangs = async () => { 
    setIsLoading(true); 
    try { 
      const res = await api.get("/donhang"); 
      setDonHangs(res.data || []); 
    } catch (err) { 
      console.error(err); 
      setMessage("❌ Lỗi khi tải danh sách đơn hàng"); 
    } finally { 
      setIsLoading(false); 
    } 
  };

  const loadChiTietDonHang = async (maDH) => { 
    try { 
      const res = await api.get(`/donhang/chitiet/${maDH}`); 
      setChiTietDonHang(res.data || []); 
    } catch (err) { 
      console.error(err); 
      setMessage("❌ Lỗi khi tải chi tiết đơn hàng"); 
    } 
  };

  const handleViewDetail = async (donHang) => { 
    setSelectedOrder(donHang); 
    await loadChiTietDonHang(donHang.MaDH); 
    setShowDetailModal(true); 
  };

  const handleUpdateStatus = async (maDH, newStatus, phuongThucThanhToan = null) => { 
    try { 
      const data = { TrangThai: newStatus }; 
      if (phuongThucThanhToan) data.PhuongThucThanhToan = phuongThucThanhToan; 
      await api.put(`/donhang/${maDH}`, data); 
      setMessage(`✅ Cập nhật đơn #${maDH} sang [${newStatus}] thành công!`); 
      loadDonHangs(); 
      setShowPaymentModal(false);
    } catch (err) { 
      setMessage("❌ " + (err.response?.data?.message || "Có lỗi xảy ra")); 
    } finally {
      setTimeout(() => setMessage(""), 3500);
    }
  };

  const handleCancelOrder = async (donHang) => { 
    const isPaid = donHang.TrangThai === "Đã thanh toán"; 
    const confirmMessage = isPaid 
      ? "⚠️ CẢNH BÁO: Đơn này ĐÃ THANH TOÁN. Hủy đơn đồng nghĩa với việc phải HOÀN TIỀN. Bạn có chắc chắn muốn hủy?" 
      : "Bạn có chắc muốn hủy đơn hàng này?"; 
    if (!window.confirm(confirmMessage)) return; 

    try { 
      await api.put(`/donhang/${donHang.MaDH}`, { TrangThai: "Đã hủy" }); 
      setMessage("✅ Đã hủy đơn hàng thành công" + (isPaid ? " (Đã chuyển sang Hoàn tiền)" : "")); 
      loadDonHangs(); 
    } catch (err) { 
      setMessage("❌ " + (err.response?.data?.message || "Không thể hủy đơn")); 
    } finally {
      setTimeout(() => setMessage(""), 3500);
    }
  };

  const handleDeleteOrder = async (maDH) => { 
    if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn đơn hàng này?")) return; 
    try { 
      await api.delete(`/donhang/${maDH}`); 
      setMessage("✅ Đã xóa đơn hàng thành công!"); 
      loadDonHangs(); 
    } catch (err) { 
      setMessage("❌ " + (err.response?.data?.message || "Không thể xóa")); 
    } finally {
      setTimeout(() => setMessage(""), 3500);
    }
  };

  const openPaymentModal = (donHang) => {
    setOrderToPay(donHang);
    setShowPaymentModal(true);
  };

  const filteredDonHangs = donHangs.filter(dh => { 
    const matchStatus = !filterStatus || dh.TrangThai === filterStatus; 
    const matchSearch = !searchTerm || 
      dh.MaDH.toString().includes(searchTerm) || 
      dh.HoTen?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      dh.Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dh.TenNguoiNhan?.toLowerCase().includes(searchTerm.toLowerCase()); 
    return matchStatus && matchSearch; 
  });

  // Tính toán phân trang
  const totalItems = filteredDonHangs.length;
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentOrders = filteredDonHangs.slice(indexOfFirstItem, indexOfLastItem);

  const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN');
  const formatCurrency = (amount) => Number(amount || 0).toLocaleString('vi-VN') + ' đ';
  const getImageUrl = (imagePath) => { 
    if (!imagePath) return "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=200&auto=format&fit=crop"; 
    if (imagePath.startsWith('http')) return imagePath; 
    if (imagePath.startsWith('/uploads')) return `${API_URL}${imagePath}`; 
    return `${API_URL}/${imagePath}`; 
  };

  return (
    <DashboardLayout title="Quản Lý Đơn Hàng">
      {message && (
        <div className={`mb-6 px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-md animate-slide-down flex items-center gap-2 ${
          message.includes('✅') 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
            : 'bg-rose-50 text-rose-700 border border-rose-100'
        }`}>
          <span>{message}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-[#EFEBE9] shadow-sm overflow-hidden space-y-4 font-sans">
        
        {/* Controls Toolbar */}
        <div className="p-6 border-b border-[#FAF7F2] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#2C1810]">
              Tất Cả Đơn Hàng ({filteredDonHangs.length})
            </h3>
            <p className="text-xs text-[#8D6E63] mt-0.5">
              Theo dõi giao dịch trực tiếp từ web và POS quầy
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1887F]" />
              <input 
                type="text" 
                placeholder="Tìm mã ĐH, khách, SĐT..." 
                value={searchTerm} 
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }} 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFEBE9] text-xs font-medium text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#C5963A]/30"
              />
            </div>

            <select 
              value={filterStatus} 
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }} 
              className="px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFEBE9] text-xs font-semibold text-[#4E342E] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C5963A]/30"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Treo">Treo (Chờ thanh toán)</option>
              <option value="Đã thanh toán">Đã thanh toán</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>

            <button 
              onClick={() => navigate('/admin/create-order')} 
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[#2C1810] to-[#4E342E] hover:from-[#1A0F0A] hover:to-[#2C1810] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo đơn tại quầy</span>
            </button>
          </div>
        </div>

        {/* Table View */}
        {isLoading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-4 border-[#EFEBE9] border-t-[#C5963A] rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-semibold text-[#8D6E63]">Đang tải dữ liệu đơn hàng...</p>
          </div>
        ) : filteredDonHangs.length === 0 ? (
          <div className="p-16 text-center">
            <ShoppingBag className="w-12 h-12 text-[#A1887F] mx-auto mb-3 opacity-40" />
            <p className="font-serif font-bold text-base text-[#2C1810]">Không có đơn hàng nào phù hợp</p>
            <p className="text-xs text-[#8D6E63] mt-1">Hãy thử tìm kiếm với từ khóa khác.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#EFEBE9]">
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Mã ĐH</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Khách Hàng</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Thời Gian</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Tổng Tiền</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Hình Thức</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Trạng Thái</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans text-center">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF7F2] text-sm font-sans">
                {currentOrders.map((dh) => (
                  <tr key={dh.MaDH} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="px-5 py-4 font-bold text-xs text-[#C5963A]">
                      #{dh.MaDH}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-xs text-[#2C1810]">
                        {dh.TenNguoiNhan || dh.HoTen || "Khách qua đường"}
                      </p>
                      <p className="text-[11px] text-[#8D6E63] mt-0.5">
                        {dh.SDTNguoiNhan || dh.Email || "Tại quán"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#6D4C41]">
                      {formatDate(dh.NgayDat)}
                    </td>
                    <td className="px-5 py-4 font-bold text-sm text-[#2C1810]">
                      {formatCurrency(dh.TongTien)}
                    </td>
                    <td className="px-5 py-4 text-xs text-[#6D4C41]">
                      <span className="px-2.5 py-1 bg-[#FAF7F2] rounded-lg border border-[#EFEBE9] font-medium">
                        {dh.PhuongThucThanhToan || "Chưa chọn"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={dh.TrangThai} />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <button 
                          onClick={() => handleViewDetail(dh)} 
                          className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
                        >
                          Xem
                        </button>
                        
                        {dh.TrangThai === 'Treo' && (
                          <button 
                            onClick={() => openPaymentModal(dh)} 
                            className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                          >
                            Thu tiền
                          </button>
                        )}
                        
                        {dh.TrangThai !== 'Đã hủy' && (
                          <button 
                            onClick={() => handleCancelOrder(dh)} 
                            className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors cursor-pointer"
                          >
                            Hủy
                          </button>
                        )}

                        <button 
                          onClick={() => handleDeleteOrder(dh.MaDH)} 
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Xóa đơn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Component Phân Trang (Limit 10) */}
        {!isLoading && totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>

      {/* Modal Chọn Phương Thức Thanh Toán (Thay thế window.prompt) */}
      {showPaymentModal && orderToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center animate-scale-in space-y-5 font-sans" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold text-[#2C1810]">
                Thanh Toán Đơn #{orderToPay.MaDH}
              </h3>
              <p className="text-xs text-[#8D6E63] mt-1 font-sans">
                Tổng số tiền: <strong className="text-[#C5963A] text-sm">{formatCurrency(orderToPay.TongTien)}</strong>
              </p>
            </div>

            <div className="space-y-2.5 text-left font-sans">
              <button
                onClick={() => handleUpdateStatus(orderToPay.MaDH, "Đã thanh toán", "Tiền mặt")}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-[#EFEBE9] hover:border-[#C5963A] hover:bg-[#FAF7F2] transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#2C1810]">Tiền Mặt Tại Quầy</h4>
                  <p className="text-[11px] text-[#8D6E63]">Khách đưa tiền trực tiếp</p>
                </div>
              </button>

              <button
                onClick={() => handleUpdateStatus(orderToPay.MaDH, "Đã thanh toán", "Chuyển khoản")}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-[#EFEBE9] hover:border-[#C5963A] hover:bg-[#FAF7F2] transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#2C1810]">Chuyển Khoản Ngân Hàng</h4>
                  <p className="text-[11px] text-[#8D6E63]">Chuyển 247 qua số tài khoản</p>
                </div>
              </button>

              <button
                onClick={() => handleUpdateStatus(orderToPay.MaDH, "Đã thanh toán", "Ví điện tử")}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-[#EFEBE9] hover:border-[#C5963A] hover:bg-[#FAF7F2] transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#2C1810]">Ví Điện Tử (VNPay / MoMo)</h4>
                  <p className="text-[11px] text-[#8D6E63]">Quét mã QR thanh toán</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full py-2.5 bg-[#FAF7F2] text-[#6D4C41] text-xs font-bold rounded-xl hover:bg-[#EFEBE9] transition-colors cursor-pointer font-sans"
            >
              Hủy Bỏ
            </button>
          </div>
        </div>
      )}

      {/* Modal Chi Tiết Đơn Hàng */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in flex flex-col font-sans" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#FAF7F2] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#2C1810]">
                  Chi Tiết Đơn Hàng #{selectedOrder.MaDH}
                </h3>
                <p className="text-xs text-[#8D6E63] font-sans mt-0.5">
                  Ngày đặt: {formatDate(selectedOrder.NgayDat)}
                </p>
              </div>
              <button 
                onClick={() => setShowDetailModal(false)} 
                className="w-9 h-9 rounded-xl bg-[#FAF7F2] hover:bg-[#EFEBE9] text-[#6D4C41] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 font-sans">
              {/* Order Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EFEBE9]">
                  <p className="text-[10px] uppercase font-bold text-[#A1887F]">Khách hàng</p>
                  <p className="text-xs font-bold text-[#2C1810] mt-0.5">
                    {selectedOrder.TenNguoiNhan || selectedOrder.HoTen || "Khách qua đường"}
                  </p>
                </div>

                <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EFEBE9]">
                  <p className="text-[10px] uppercase font-bold text-[#A1887F]">Số điện thoại</p>
                  <p className="text-xs font-bold text-[#2C1810] mt-0.5">
                    {selectedOrder.SDTNguoiNhan || selectedOrder.SDT || "—"}
                  </p>
                </div>

                <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EFEBE9]">
                  <p className="text-[10px] uppercase font-bold text-[#A1887F]">Trạng thái</p>
                  <div className="mt-1">
                    <StatusBadge status={selectedOrder.TrangThai} />
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-serif font-bold text-sm text-[#2C1810] mb-3">
                  Danh Sách Món Đã Đặt:
                </h4>
                <div className="space-y-2.5">
                  {chiTietDonHang.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3.5 p-3 rounded-2xl border border-[#EFEBE9] bg-white">
                      <img 
                        src={getImageUrl(item.HinhAnh)} 
                        alt={item.TenMon} 
                        className="w-12 h-12 rounded-xl object-cover border border-[#EFEBE9]" 
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-xs text-[#2C1810] truncate">{item.TenMon}</h5>
                        <p className="text-[11px] text-[#8D6E63] mt-0.5">
                          Kích cỡ: <strong className="text-[#4E342E]">{item.KichCo}</strong> • SL: <strong className="text-[#4E342E]">{item.SoLuong}</strong>
                        </p>
                      </div>
                      <span className="font-bold text-sm text-[#C5963A]">
                        {formatCurrency(item.DonGia * item.SoLuong)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Banner */}
              <div className="p-4 rounded-2xl bg-[#2C1810] text-white flex items-center justify-between">
                <span className="text-xs font-semibold text-[#D7CCC8]">Tổng tiền thanh toán:</span>
                <span className="font-bold text-xl text-[#C5963A]">
                  {formatCurrency(selectedOrder.TongTien)}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#FAF7F2] flex gap-3">
              <button 
                onClick={() => setShowInvoiceModal(true)} 
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#C5963A] to-[#D4A84B] hover:from-[#B8872D] hover:to-[#C5963A] text-[#1A0F0A] font-bold rounded-2xl text-xs shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>In Hóa Đơn Bán Hàng</span>
              </button>
              <button 
                onClick={() => setShowDetailModal(false)} 
                className="px-6 py-3 bg-[#FAF7F2] text-[#6D4C41] font-bold rounded-2xl text-xs hover:bg-[#EFEBE9] transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal In Hóa Đơn Print */}
      {showInvoiceModal && selectedOrder && (
        <InvoicePrint 
          order={selectedOrder} 
          items={chiTietDonHang} 
          onClose={() => setShowInvoiceModal(false)} 
        />
      )}
    </DashboardLayout>
  );
}