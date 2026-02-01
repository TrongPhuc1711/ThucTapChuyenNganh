import { useState, useEffect } from "react";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";
import "../../../styles/Dashboard/Staff/Staff_Bills.css";

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
      <div className="bills-container">
        <div className="bills-header">
            <h2>Danh Sách Hóa Đơn</h2>
            
            <div className="filter-group">
                {/* MENU CHỌN HÌNH THỨC THANH TOÁN */}
                <select 
                    className="payment-filter"
                    value={filterMethod}
                    onChange={(e) => setFilterMethod(e.target.value)}
                >
                    <option value="all">Tất cả hình thức</option>
                    <option value="Tiền mặt"> Tiền mặt</option>
                    <option value="Chuyển khoản">Chuyển khoản</option>
                    <option value="Ví điện tử">Ví điện tử</option>
                </select>

                {/* Ô TÌM KIẾM */}
                <div className="bill-search-box">
                    <input 
                        type="text" 
                        placeholder="Tìm mã HĐ, Đơn hàng..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>
        </div>

        {loading ? <p>Đang tải dữ liệu...</p> : (
            <table className="bills-table">
                <thead>
                <tr>
                    <th>Mã HĐ</th>
                    <th>Mã ĐH</th>
                    <th>Ngày lập</th>
                    <th>Khách hàng</th>
                    <th>Tổng tiền</th>
                    <th>Hình thức</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                </tr>
                </thead>
                <tbody>
                {filteredBills.length > 0 ? filteredBills.map((bill) => (
                    <tr key={bill.MaHD}>
                        <td>#{bill.MaHD}</td>
                        <td>#{bill.MaDH}</td>
                        <td>{formatDate(bill.NgayLap)}</td>
                        <td>{bill.TenNguoiNhan || "Khách hàng"}</td> 
                        <td className="text-money">{formatMoney(bill.TongTien)}</td>
                        <td>
                            <span className={`payment-badge ${bill.HinhThucThanhToan === 'Ví điện tử' ? 'e-wallet' : bill.HinhThucThanhToan === 'Chuyển khoản' ? 'transfer' : 'cash'}`}>
                                {bill.HinhThucThanhToan}
                            </span>
                        </td>
                        <td>
                            {/* HIỂN THỊ TRẠNG THÁI HÓA ĐƠN */}
                            <span 
                                className="status-badge"
                                style={{
                                    backgroundColor: bill.TrangThai === 'Đã thanh toán' ? '#d4edda' : '#f8d7da',
                                    color: bill.TrangThai === 'Đã thanh toán' ? '#155724' : '#721c24',
                                    padding: '5px 10px',
                                    borderRadius: '15px',
                                    fontSize: '0.85rem',
                                    fontWeight: '500'
                                }}
                            >
                                {bill.TrangThai}
                            </span>
                        </td>
                        <td>
                            <button className="btn-print-bill" onClick={() => handlePrintClick(bill)}>
                                In lại
                            </button>
                        </td>
                    </tr>
                )) : (
                    <tr>
                        <td colSpan="7" style={{textAlign: "center", padding: "20px", color: "#888"}}>
                            Không tìm thấy hóa đơn nào phù hợp.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        )}

        {/* MODAL IN HÓA ĐƠN  */}
        {showInvoiceModal && selectedOrder && (
            <div className="invoice-modal-overlay">
                <div className="invoice-modal-content">
                    <div className="invoice-preview" id="invoice-print-area">
                        <div className="invoice-company-info">
                            <h3>P-COFFEE SHOP</h3>
                            <p>Địa Chỉ: 180 Cao Lỗ, Quận 8, TP.HCM</p>
                        </div>
                        <div className="invoice-title-section">
                            <h4>HÓA ĐƠN</h4>
                            <p>Số: #{selectedOrder.MaDH} - Ngày: {formatDate(selectedOrder.NgayDat)}</p>
                        </div>
                        <div className="invoice-customer-info">
                            <p>Khách: {selectedOrder.TenNguoiNhan || selectedOrder.HoTen}</p>
                            <p>SĐT: {selectedOrder.SDTNguoiNhan || "---"}</p>
                        </div>
                        <table className="invoice-items-table">
                            <thead><tr><th>Món</th><th>SL</th><th>Tiền</th></tr></thead>
                            <tbody>
                                {orderDetails.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.TenMon} ({item.KichCo})</td>
                                        <td>{item.SoLuong}</td>
                                        <td>{formatMoney(item.DonGia * item.SoLuong)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{textAlign: 'right', marginTop: '10px', fontWeight: 'bold'}}>
                            TỔNG: {formatMoney(selectedOrder.TongTien)}
                        </div>
                        <div className="invoice-footer-note"><p>Cảm ơn quý khách!</p></div>
                    </div>
                    
                    <div className="invoice-actions">
                        <button onClick={confirmPrint} className="btn-confirm">In ngay</button>
                        <button onClick={() => setShowInvoiceModal(false)} className="btn-close-bill">Đóng</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </DashboardLayout>
  );
}