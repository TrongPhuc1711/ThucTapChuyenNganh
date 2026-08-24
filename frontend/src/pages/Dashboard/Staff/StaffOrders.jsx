import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Eye, 
  Printer, 
  Search, 
  Plus, 
  X, 
  ShoppingBag,
  Clock,
  Phone,
  MapPin,
  CreditCard,
  Check
} from "lucide-react";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";
import InvoicePrint from "../../../components/InvoicePrint";
import StatusBadge from "../../../components/ui/StatusBadge";
import Pagination from "../../../components/ui/Pagination";

export default function StaffOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filterOrders, setFilterOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Phân trang 10 mục / trang
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const statusOptions = [
    { value: "all", label: "Tất cả đơn" },
    { value: "Treo", label: "Chờ xử lý (Treo)" },
    { value: "Đang xử lý", label: "Đang pha chế" },
    { value: "Đang giao", label: "Đang giao hàng" },
    { value: "Đã giao", label: "Đã hoàn thành" },
    { value: "Đã hủy", label: "Đã hủy" }
  ];

  useEffect(() => { 
    fetchOrders(); 
  }, []);

  useEffect(() => { 
    let list = orders;
    if (filterStatus !== "all") {
      list = list.filter(o => o.TrangThai === filterStatus);
    }
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(o => 
        o.MaDH.toString().includes(term) || 
        (o.TenNguoiNhan && o.TenNguoiNhan.toLowerCase().includes(term)) || 
        (o.SDTNguoiNhan && o.SDTNguoiNhan.includes(term))
      );
    }
    setFilterOrders(list);
  }, [orders, filterStatus, search]);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/donhang");
      setOrders(response.data || []);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalItems = filterOrders.length;
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentOrders = filterOrders.slice(indexOfFirstItem, indexOfLastItem);

  const viewOrderDetails = async (order) => {
    try {
      const response = await api.get(`/donhang/chitiet/${order.MaDH}`);
      setOrderDetails(response.data || []);
      setSelectedOrder(order);
    } catch (error) {
      alert("Không thể tải chi tiết đơn hàng");
    }
  };

  const updateOrdersStatus = async (orderID, newStatus) => {
    if (selectedOrder.TrangThai === "Đã thanh toán" || selectedOrder.TrangThai === "Đã giao") {
      if (newStatus !== "Đã hủy") {
        alert("Đơn hàng đã hoàn tất. Không thể đổi sang trạng thái khác!");
        return;
      } else {
        if (!window.confirm("⚠️ CẢNH BÁO: Đơn hàng ĐÃ THANH TOÁN. Hủy đơn đồng nghĩa với việc phải HOÀN TIỀN cho khách. Bạn có chắc chắn?")) return;
      }
    }
    if (selectedOrder.TrangThai === "Đã hủy") {
      alert("Đơn hàng đã hủy không thể khôi phục!");
      return;
    }

    try {
      await api.put(`/donhang/${orderID}`, { TrangThai: newStatus });
      fetchOrders();
      if (selectedOrder && selectedOrder.MaDH === orderID) {
        setSelectedOrder({ ...selectedOrder, TrangThai: newStatus });
      }
    } catch (error) {
      alert(error.response?.data?.message || "Không thể cập nhật trạng thái");
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleString("vi-VN");
  const formatMoney = (amount) => Number(amount || 0).toLocaleString("vi-VN") + " đ";

  return (
    <DashboardLayout title="Xử Lý Đơn Hàng">
      <div className="bg-white rounded-3xl border border-[#EFEBE9] shadow-sm overflow-hidden space-y-4 font-sans animate-fade-in">
        
        {/* Controls Toolbar */}
        <div className="p-6 border-b border-[#FAF7F2] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#2C1810]">
              Danh Sách Đơn Phục Vụ ({filterOrders.length})
            </h3>
            <p className="text-xs text-[#8D6E63] mt-0.5">
              Cập nhật quy trình từ lúc tiếp nhận đến khi trao tay khách
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1887F]" />
              <input 
                type="text" 
                placeholder="Tìm mã ĐH, tên khách, SĐT..." 
                value={search} 
                onChange={(e) => {
                  setSearch(e.target.value);
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
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <button 
              onClick={() => navigate('/staff/create-order')} 
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[#2C1810] to-[#4E342E] hover:from-[#1A0F0A] hover:to-[#2C1810] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo đơn tại quầy</span>
            </button>
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-4 border-[#EFEBE9] border-t-[#C5963A] rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-semibold text-[#8D6E63]">Đang tải danh sách đơn hàng...</p>
          </div>
        ) : filterOrders.length === 0 ? (
          <div className="p-16 text-center">
            <ShoppingBag className="w-12 h-12 text-[#A1887F] mx-auto mb-3 opacity-40" />
            <p className="font-serif font-bold text-base text-[#2C1810]">Không có đơn hàng nào</p>
            <p className="text-xs text-[#8D6E63] mt-1">Các đơn hàng mới sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#EFEBE9]">
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Mã ĐH</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Khách Hàng</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">SĐT</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Địa Chỉ</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Tổng Tiền</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Trạng Thái</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Thời Gian</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans text-center">Chi Tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF7F2] text-sm font-sans">
                {currentOrders.map(order => (
                  <tr key={order.MaDH} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="px-5 py-4 font-bold text-xs text-[#C5963A]">
                      #{order.MaDH}
                    </td>
                    <td className="px-5 py-4 font-bold text-xs text-[#2C1810]">
                      {order.TenNguoiNhan || "Khách tại quầy"}
                    </td>
                    <td className="px-5 py-4 text-xs text-[#6D4C41]">
                      {order.SDTNguoiNhan || "—"}
                    </td>
                    <td className="px-5 py-4 text-xs text-[#8D6E63] max-w-[140px] truncate" title={order.DiaChiGiaoHang}>
                      {order.DiaChiGiaoHang || "Tại quán"}
                    </td>
                    <td className="px-5 py-4 font-bold text-sm text-[#2C1810]">
                      {formatMoney(order.TongTien)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={order.TrangThai} />
                    </td>
                    <td className="px-5 py-4 text-xs text-[#6D4C41]">
                      {formatDate(order.NgayDat)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button 
                        onClick={() => viewOrderDetails(order)}
                        className="px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
                      >
                        Xem & Xử Lý
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Phân trang */}
        {!loading && totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>

      {/* Modal Chi Tiết & Chuyển Trạng Thái */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-scale-in flex flex-col font-sans" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="p-6 border-b border-[#FAF7F2] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#2C1810]">
                  Xử Lý Đơn Hàng #{selectedOrder.MaDH}
                </h3>
                <p className="text-xs text-[#8D6E63] font-sans mt-0.5">
                  Đặt lúc: {formatDate(selectedOrder.NgayDat)}
                </p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="w-9 h-9 rounded-xl bg-[#FAF7F2] hover:bg-[#EFEBE9] text-[#6D4C41] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 font-sans">
              
              {/* Customer Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EFEBE9]">
                  <p className="text-[10px] uppercase font-bold text-[#A1887F]">Khách nhận</p>
                  <p className="text-xs font-bold text-[#2C1810] mt-0.5 truncate">{selectedOrder.TenNguoiNhan || "Tại quầy"}</p>
                </div>
                <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EFEBE9]">
                  <p className="text-[10px] uppercase font-bold text-[#A1887F]">SĐT</p>
                  <p className="text-xs font-bold text-[#2C1810] mt-0.5">{selectedOrder.SDTNguoiNhan || "—"}</p>
                </div>
                <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EFEBE9]">
                  <p className="text-[10px] uppercase font-bold text-[#A1887F]">Thanh toán</p>
                  <p className="text-xs font-bold text-[#2C1810] mt-0.5">{selectedOrder.PhuongThucThanhToan || "Chưa chọn"}</p>
                </div>
                <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EFEBE9]">
                  <p className="text-[10px] uppercase font-bold text-[#A1887F]">Trạng thái</p>
                  <div className="mt-0.5"><StatusBadge status={selectedOrder.TrangThai} /></div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-serif font-bold text-sm text-[#2C1810] mb-3">
                  Danh Sách Món Cần Pha Chế:
                </h4>
                <div className="overflow-x-auto border border-[#EFEBE9] rounded-2xl">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#FAF7F2] border-b border-[#EFEBE9] text-[10px] uppercase font-bold text-[#6D4C41]">
                        <th className="px-4 py-2.5">Tên Món</th>
                        <th className="px-4 py-2.5 text-center">Kích Cỡ</th>
                        <th className="px-4 py-2.5 text-center">Số Lượng</th>
                        <th className="px-4 py-2.5 text-right">Đơn Giá</th>
                        <th className="px-4 py-2.5 text-right">Thành Tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FAF7F2] text-xs font-sans">
                      {orderDetails.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 font-bold text-[#2C1810]">
                            {item.TenMon}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-0.5 bg-[#FAF7F2] rounded font-bold text-[#6D4C41]">
                              {item.KichCo}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-[#4E342E]">
                            {item.SoLuong}
                          </td>
                          <td className="px-4 py-3 text-right text-[#6D4C41]">
                            {formatMoney(item.DonGia)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-[#C5963A]">
                            {formatMoney(item.DonGia * item.SoLuong)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[#2C1810] text-white">
                        <td colSpan="4" className="px-4 py-3 font-bold text-xs">Tổng tiền đơn:</td>
                        <td className="px-4 py-3 text-right font-bold text-sm text-[#C5963A]">
                          {formatMoney(selectedOrder.TongTien)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EFEBE9] space-y-2.5">
                <h4 className="font-serif font-bold text-xs text-[#2C1810] uppercase tracking-wider">
                  Chuyển Trạng Thái Xử Lý:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.filter(s => s.value !== "all" && s.value !== selectedOrder.TrangThai).map(status => (
                    <button 
                      key={status.value} 
                      onClick={() => updateOrdersStatus(selectedOrder.MaDH, status.value)}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-white border border-[#EFEBE9] hover:border-[#C5963A] hover:bg-[#C5963A]/10 text-[#4E342E] transition-all cursor-pointer shadow-sm"
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#FAF7F2] flex gap-3">
              <button 
                onClick={() => setShowInvoiceModal(true)} 
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#C5963A] to-[#D4A84B] hover:from-[#B8872D] hover:to-[#C5963A] text-[#1A0F0A] font-bold rounded-2xl text-xs shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>In Hóa Đơn Phục Vụ</span>
              </button>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="px-6 py-3 bg-[#FAF7F2] text-[#6D4C41] font-bold rounded-2xl text-xs hover:bg-[#EFEBE9] transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && selectedOrder && (
        <InvoicePrint 
          order={selectedOrder} 
          items={orderDetails} 
          onClose={() => setShowInvoiceModal(false)} 
        />
      )}
    </DashboardLayout>
  );
}