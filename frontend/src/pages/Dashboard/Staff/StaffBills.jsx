import { useState, useEffect } from "react";
import { 
  Printer, 
  Search, 
  Receipt, 
  CreditCard, 
  Banknote, 
  Smartphone,
  X
} from "lucide-react";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";
import StatusBadge from "../../../components/ui/StatusBadge";

export default function StaffBills() {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]); 
  const [search, setSearch] = useState(""); 
  const [filterMethod, setFilterMethod] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const results = bills.filter(bill => {
      const matchesSearch = 
        bill.MaHD.toString().includes(lowerSearch) || 
        bill.MaDH.toString().includes(lowerSearch) || 
        (bill.TenNguoiNhan && bill.TenNguoiNhan.toLowerCase().includes(lowerSearch));

      const matchesMethod = 
        filterMethod === "all" || 
        bill.HinhThucThanhToan === filterMethod;

      return matchesSearch && matchesMethod;
    });

    setFilteredBills(results);
  }, [search, filterMethod, bills]);

  const fetchBills = async () => {
    try {
      const res = await api.get("/hoadon"); 
      setBills(res.data || []);
      setFilteredBills(res.data || []);
    } catch (error) {
      console.error("Lỗi tải hóa đơn:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintClick = async (bill) => {
    try {
      const resDetail = await api.get(`/donhang/chitiet/${bill.MaDH}`);
      setOrderDetails(resDetail.data || []);
      const resOrder = await api.get(`/donhang/${bill.MaDH}`); 
      setSelectedOrder(resOrder.data);
      setShowInvoiceModal(true);
    } catch (error) {
      alert("Không thể tải thông tin chi tiết hóa đơn!");
    }
  };

  const confirmPrint = () => {
    window.print();
    setShowInvoiceModal(false);
  };

  const formatMoney = (amount) => Number(amount || 0).toLocaleString('vi-VN') + ' đ';
  const formatDate = (date) => new Date(date).toLocaleString('vi-VN');

  return (
    <DashboardLayout title="Quản Lý Hóa Đơn">
      <div className="bg-white rounded-3xl border border-[#EFEBE9] shadow-sm overflow-hidden space-y-4 animate-fade-in">
        
        {/* Controls Toolbar */}
        <div className="p-6 border-b border-[#FAF7F2] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#2C1810]">
              Lịch Sử Xuất Hóa Đơn ({filteredBills.length})
            </h3>
            <p className="text-xs text-[#8D6E63] mt-0.5">
              Tra cứu phiếu thu thanh toán và in lại chứng từ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1887F]" />
              <input 
                type="text" 
                placeholder="Tìm mã HĐ, Đơn hàng, Tên khách..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFEBE9] text-xs font-medium text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#C5963A]/30"
              />
            </div>

            <select 
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFEBE9] text-xs font-semibold text-[#4E342E] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C5963A]/30"
            >
              <option value="all">Tất cả hình thức</option>
              <option value="Tiền mặt">💵 Tiền mặt</option>
              <option value="Chuyển khoản">💳 Chuyển khoản</option>
              <option value="Ví điện tử">📱 Ví điện tử</option>
            </select>
          </div>
        </div>

        {/* Table representation */}
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-4 border-[#EFEBE9] border-t-[#C5963A] rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-semibold text-[#8D6E63]">Đang tải hóa đơn...</p>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="p-16 text-center">
            <Receipt className="w-12 h-12 text-[#A1887F] mx-auto mb-3 opacity-40" />
            <p className="font-serif font-bold text-base text-[#2C1810]">Không tìm thấy hóa đơn nào</p>
            <p className="text-xs text-[#8D6E63] mt-1">Các hóa đơn thanh toán sẽ lưu tại đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#EFEBE9]">
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">Mã HĐ</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">Mã ĐH</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">Thời Gian</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">Khách Hàng</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">Tổng Tiền</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">Phương Thức</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">Trạng Thái</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF7F2] text-sm">
                {filteredBills.map((bill) => (
                  <tr key={bill.MaHD} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-xs text-[#A1887F]">
                      #{bill.MaHD}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-xs text-[#C5963A]">
                      #{bill.MaDH}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-[#6D4C41]">
                      {formatDate(bill.NgayLap)}
                    </td>
                    <td className="px-5 py-4 font-serif font-bold text-[#2C1810]">
                      {bill.TenNguoiNhan || "Khách tại quầy"}
                    </td>
                    <td className="px-5 py-4 font-serif font-black text-[#2C1810]">
                      {formatMoney(bill.TongTien)}
                    </td>
                    <td className="px-5 py-4 text-xs text-[#6D4C41]">
                      <span className="px-2.5 py-1 bg-[#FAF7F2] rounded-lg border border-[#EFEBE9] font-medium">
                        {bill.HinhThucThanhToan}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={bill.TrangThai} />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button 
                        onClick={() => handlePrintClick(bill)}
                        className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#1A0F0A] bg-gradient-to-r from-[#C5963A] to-[#D4A84B] hover:from-[#B8872D] hover:to-[#C5963A] rounded-xl shadow-sm transition-all cursor-pointer mx-auto"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>In lại</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal In Hóa Đơn */}
      {showInvoiceModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowInvoiceModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in flex flex-col" onClick={(e) => e.stopPropagation()}>
            
            {/* Print Preview Area */}
            <div className="p-8 bg-[#FAF7F2] border-b border-dashed border-[#D7CCC8]" id="invoice-print-area">
              <div className="text-center space-y-1.5 pb-5 border-b border-[#D7CCC8]">
                <h3 className="font-serif text-2xl font-black text-[#2C1810] tracking-tight">P-COFFEE ROASTERY</h3>
                <p className="text-xs text-[#6D4C41]">Địa Chỉ: 180 Cao Lỗ, Phường 4, Quận 8, TP.HCM</p>
                <p className="text-xs text-[#6D4C41]">Hotline: 0123 456 789</p>
              </div>
              
              <div className="py-4 space-y-1 text-xs text-[#6D4C41] border-b border-[#D7CCC8]">
                <h4 className="font-serif text-center text-sm font-bold text-[#2C1810] mb-2 uppercase tracking-wider">HÓA ĐƠN TÀI KHÓA</h4>
                <div className="flex justify-between"><span className="text-[#A1887F]">Mã đơn:</span><span className="font-bold text-[#2C1810]">#{selectedOrder.MaDH}</span></div>
                <div className="flex justify-between"><span className="text-[#A1887F]">Thời gian:</span><span className="font-mono text-[#2C1810]">{formatDate(selectedOrder.NgayDat)}</span></div>
                <div className="flex justify-between"><span className="text-[#A1887F]">Khách hàng:</span><span className="font-bold text-[#2C1810]">{selectedOrder.TenNguoiNhan || selectedOrder.HoTen}</span></div>
                <div className="flex justify-between"><span className="text-[#A1887F]">Hình thức:</span><span className="font-semibold text-[#2C1810]">{selectedOrder.PhuongThucThanhToan || "Tiền mặt"}</span></div>
              </div>
              
              <div className="py-4">
                <table className="w-full text-xs text-[#2C1810]">
                  <thead>
                    <tr className="border-b border-[#D7CCC8] text-[10px] uppercase font-bold text-[#A1887F]">
                      <th className="text-left pb-2">Tên Món</th>
                      <th className="text-center pb-2">SL</th>
                      <th className="text-right pb-2">Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFEBE9]">
                    {orderDetails.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 font-serif font-bold">{item.TenMon} <span className="text-[10px] font-sans font-normal text-[#8D6E63]">({item.KichCo})</span></td>
                        <td className="py-2.5 text-center font-bold text-[#4E342E]">{item.SoLuong}</td>
                        <td className="py-2.5 text-right font-mono font-bold text-[#C5963A]">{formatMoney(item.DonGia * item.SoLuong)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-4 border-t border-dashed border-[#D7CCC8] flex justify-between items-center text-sm">
                <span className="font-serif font-bold text-xs uppercase text-[#4E342E]">Tổng cộng thanh toán:</span>
                <span className="font-serif font-black text-xl text-[#C5963A]">{formatMoney(selectedOrder.TongTien)}</span>
              </div>
              
              <div className="text-center pt-6 text-[10px] text-[#A1887F] space-y-1">
                <p>Cảm ơn quý khách đã tin chọn P-Coffee!</p>
                <p className="italic">Chúc bạn có một ngày ngập tràn năng lượng!</p>
              </div>
            </div>
            
            {/* Modal Controls */}
            <div className="flex gap-3 p-6 bg-white border-t border-[#FAF7F2]">
              <button 
                onClick={confirmPrint} 
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#C5963A] to-[#D4A84B] hover:from-[#B8872D] hover:to-[#C5963A] text-[#1A0F0A] font-bold rounded-2xl text-xs shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>In Ngay</span>
              </button>
              <button 
                onClick={() => setShowInvoiceModal(false)} 
                className="px-6 py-3 bg-[#FAF7F2] text-[#6D4C41] font-bold rounded-2xl text-xs hover:bg-[#EFEBE9] transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}