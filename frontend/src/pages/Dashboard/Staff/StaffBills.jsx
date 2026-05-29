import { useState, useEffect } from "react";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";

export default function StaffBills() {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]); 
  
  const [search, setSearch] = useState(""); 
  const [filterMethod, setFilterMethod] = useState("all"); // State lưu hình thức thanh toán được chọn
  
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
        // 1. Kiểm tra từ khóa tìm kiếm
        const matchesSearch = 
            bill.MaHD.toString().includes(lowerSearch) || 
            bill.MaDH.toString().includes(lowerSearch) || 
            (bill.TenNguoiNhan && bill.TenNguoiNhan.toLowerCase().includes(lowerSearch));

        // 2. Kiểm tra hình thức thanh toán
        const matchesMethod = 
            filterMethod === "all" || // Nếu chọn "Tất cả" thì luôn đúng
            bill.HinhThucThanhToan === filterMethod;

        // 3. Phải thỏa mãn CẢ HAI điều kiện
        return matchesSearch && matchesMethod;
    });

    setFilteredBills(results);
  }, [search, filterMethod, bills]); // Chạy lại khi search hoặc filterMethod thay đổi

  const fetchBills = async () => {
    try {
      const res = await api.get("/hoadon"); 
      setBills(res.data);
      setFilteredBills(res.data);
    } catch (error) {
      console.error("Lỗi tải hóa đơn:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintClick = async (bill) => {
    try {
        const resDetail = await api.get(`/donhang/chitiet/${bill.MaDH}`);
        setOrderDetails(resDetail.data);
        const resOrder = await api.get(`/donhang/${bill.MaDH}`); 
        setSelectedOrder(resOrder.data);
        setShowInvoiceModal(true);
    } catch (error) {
        alert("Không thể tải thông tin chi tiết!");
    }
  };

  const confirmPrint = () => {
    window.print();
    setShowInvoiceModal(false);
  };

  const formatMoney = (amount) => Number(amount).toLocaleString('vi-VN') + ' đ';
  const formatDate = (date) => new Date(date).toLocaleString('vi-VN');

  return (
    <DashboardLayout title="Quản lý Hóa Đơn">
      <div className="bg-white rounded-2xl border border-coffee-100/50 shadow-sm overflow-hidden animate-fade-in">
        {/* Header and Controls */}
        <div className="p-5 border-b border-coffee-50 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-coffee-300">🔍</span>
                <input 
                  type="text" 
                  placeholder="Tìm mã HĐ, Đơn hàng hoặc khách hàng..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm transition-all"
                />
              </div>
              <select 
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-700 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all"
              >
                <option value="all">Tất cả hình thức</option>
                <option value="Tiền mặt">💵 Tiền mặt</option>
                <option value="Chuyển khoản">💳 Chuyển khoản</option>
                <option value="Ví điện tử">📱 Ví điện tử</option>
              </select>
              <span className="text-sm text-coffee-400">
                Tìm thấy: <strong className="text-coffee-700 font-semibold">{filteredBills.length}</strong> hóa đơn
              </span>
            </div>
          </div>
        </div>

        {/* Table representation */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-coffee-200 border-t-gold rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-coffee-50/50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Mã HĐ</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Mã ĐH</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Ngày lập</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Tổng tiền</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Hình thức</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-50">
                {filteredBills.length > 0 ? (
                  filteredBills.map((bill) => (
                    <tr key={bill.MaHD} className="hover:bg-coffee-50/30 transition-colors">
                      <td className="px-5 py-4 text-sm font-semibold text-coffee-400">#{bill.MaHD}</td>
                      <td className="px-5 py-4 text-sm font-medium text-gold">#{bill.MaDH}</td>
                      <td className="px-5 py-4 text-sm text-coffee-500">{formatDate(bill.NgayLap)}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-coffee-800">{bill.TenNguoiNhan || "Khách qua đường"}</td>
                      <td className="px-5 py-4 text-sm font-bold text-coffee-800">{formatMoney(bill.TongTien)}</td>
                      <td className="px-5 py-4 text-sm">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          bill.HinhThucThanhToan === 'Ví điện tử' ? 'bg-purple-100 text-purple-700' :
                          bill.HinhThucThanhToan === 'Chuyển khoản' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {bill.HinhThucThanhToan}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          bill.TrangThai === 'Đã thanh toán' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'
                        }`}>
                          {bill.TrangThai}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button 
                          className="px-3.5 py-1.5 text-xs font-semibold text-coffee-700 bg-coffee-100 rounded-lg hover:bg-coffee-200 transition-colors"
                          onClick={() => handlePrintClick(bill)}
                        >
                          🖨️ In lại
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-5 py-12 text-center text-coffee-300">
                      Không tìm thấy hóa đơn nào phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL IN HÓA ĐƠN */}
      {showInvoiceModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowInvoiceModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
            {/* Real Bill Design for print preview */}
            <div className="p-6 bg-cream border-b border-dashed border-coffee-200" id="invoice-print-area">
              <div className="text-center space-y-1.5 pb-4 border-b border-coffee-200/50">
                <h3 className="font-heading text-2xl font-bold text-coffee-800 tracking-wider">P-COFFEE SHOP</h3>
                <p className="text-xs text-coffee-500 font-medium">Địa Chỉ: 180 Cao Lỗ, Quận 8, TP.HCM</p>
                <div className="w-12 h-0.5 bg-gold/50 mx-auto rounded-full"></div>
              </div>
              
              <div className="py-4 space-y-1 text-xs text-coffee-600 border-b border-coffee-200/50">
                <h4 className="font-heading text-center text-base font-bold text-coffee-800 mb-2">HÓA ĐƠN TÀI KHÓA</h4>
                <div className="flex justify-between"><span className="text-coffee-400">Số đơn:</span><span className="font-semibold text-coffee-800">#{selectedOrder.MaDH}</span></div>
                <div className="flex justify-between"><span className="text-coffee-400">Ngày đặt:</span><span className="font-semibold text-coffee-800">{formatDate(selectedOrder.NgayDat)}</span></div>
                <div className="flex justify-between"><span className="text-coffee-400">Khách hàng:</span><span className="font-semibold text-coffee-800">{selectedOrder.TenNguoiNhan || selectedOrder.HoTen}</span></div>
                <div className="flex justify-between"><span className="text-coffee-400">SĐT khách:</span><span className="font-semibold text-coffee-800">{selectedOrder.SDTNguoiNhan || "—"}</span></div>
              </div>
              
              <div className="py-4">
                <table className="w-full text-xs text-coffee-700">
                  <thead>
                    <tr className="border-b border-coffee-200/50 pb-2 text-coffee-400"><th className="text-left font-semibold">Món</th><th className="text-center font-semibold pb-1.5">SL</th><th className="text-right font-semibold">Thành tiền</th></tr>
                  </thead>
                  <tbody className="divide-y divide-coffee-100/50">
                    {orderDetails.map((item, idx) => (
                      <tr key={idx} className="py-2">
                        <td className="py-2 text-coffee-800 font-medium">{item.TenMon} <span className="text-[10px] text-coffee-400">({item.KichCo})</span></td>
                        <td className="py-2 text-center font-semibold text-coffee-600">{item.SoLuong}</td>
                        <td className="py-2 text-right font-semibold text-coffee-800">{formatMoney(item.DonGia * item.SoLuong)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-4 border-t border-dashed border-coffee-200 flex justify-between items-center text-sm">
                <span className="font-bold text-coffee-700">TỔNG CỘNG:</span>
                <span className="font-heading text-lg font-extrabold text-gold">{formatMoney(selectedOrder.TongTien)}</span>
              </div>
              
              <div className="text-center pt-6 text-[10px] text-coffee-400 tracking-wider">
                <p>Cảm ơn quý khách đã ghé P-Coffee!</p>
                <p className="italic">Chúc bạn có một ngày làm việc tuyệt vời!</p>
              </div>
            </div>
            
            {/* Modal Controls */}
            <div className="flex gap-3 p-6 bg-coffee-50 border-t border-coffee-50">
              <button onClick={confirmPrint} className="flex-1 py-2.5 bg-gradient-to-r from-coffee-700 to-coffee-600 text-white font-medium rounded-xl text-sm hover:from-coffee-600 hover:to-coffee-500 transition-all shadow-md shadow-coffee-700/10">In ngay</button>
              <button onClick={() => setShowInvoiceModal(false)} className="px-4 py-2.5 bg-white border border-coffee-200 text-coffee-600 font-medium rounded-xl text-sm hover:bg-coffee-50 transition-colors">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}