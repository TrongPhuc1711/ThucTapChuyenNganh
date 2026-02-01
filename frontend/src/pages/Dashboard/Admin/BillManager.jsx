import { useEffect, useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import '../../../styles/Dashboard/BillManager.css';
import api from "../../../services/api";
import { Trash2, Edit, Printer } from 'lucide-react';
import InvoicePrint from "../../../components/InvoicePrint";
export default function BillManager() {
  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);
  const [loading, setLoading] = useState(false);

  // State riêng cho chức năng IN
  const [printBillData, setPrintBillData] = useState(null);
  const [printBillItems, setPrintBillItems] = useState([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const res = await api.get("/hoadon");
      setBills(res.data);
    } catch (err) {
      alert("Không thể tải hóa đơn");
    }
  };

  // Lọc hóa đơn theo tìm kiếm
  const filteredBills = bills.filter(
    (b) =>
      b.MaHD.toString().includes(search) ||
      b.TenKhach?.toLowerCase().includes(search.toLowerCase()) ||
      b.TrangThai?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hóa đơn này? Hành động này không thể hoàn tác!")) {
        try {
            await api.delete(`/hoadon/${id}`);
            alert("Đã xóa thành công!");
            loadBills();
        } catch (err) {
            alert("Lỗi khi xóa hóa đơn");
        }
    }
  };
  const handleUpdateStatus = async (id, currentStatus) => {
    const newStatus = prompt("Nhập trạng thái mới (Đã thanh toán / Đã hoàn tiền / Đã hủy):", currentStatus);
    if (newStatus && newStatus !== currentStatus) {
        try {
            await api.put(`/hoadon/${id}`, { TrangThai: newStatus });
            alert("Cập nhật trạng thái thành công!");
            loadBills();
        } catch (err) {
            alert("Lỗi cập nhật");
        }
    }
};
  const closeDetail = () => setSelectedBill(null);
  const handlePrintClick = async (bill) => {
    try {
        // 1. Lấy chi tiết món ăn từ API (dựa vào MaDH)
        const res = await api.get(`/donhang/chitiet/${bill.MaDH}`);
        
        // 2. Set dữ liệu vào state
        setPrintBillData(bill);
        setPrintBillItems(res.data);
        
        // 3. Mở Modal
        setShowInvoiceModal(true);
    } catch (err) {
        alert("Lỗi: Không thể lấy chi tiết hóa đơn để in!");
    }
  };
  return (
    <DashboardLayout title="Quản Lý Hóa Đơn">
      <div className="bill-container">

        {/* Thanh tìm kiếm */}
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm theo mã hóa đơn, tên khách hoặc trạng thái..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/*  Danh sách hóa đơn */}
        <table className="bill-table">
          <thead>
            <tr>
              <th>Mã HD</th>
              <th>Mã ĐH</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>HT Thanh toán</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.map((b) => (
              <tr key={b.MaHD}>
                <td>{b.MaHD}</td>
                <td>{b.MaDH}</td>
                <td>{b.TenKhach}</td>
                <td>{b.NgayLap?.split("T")[0]}</td>
                <td>{Number(b.TongTien).toLocaleString()} đ</td>
                <td>{b.HinhThucThanhToan}</td>
                <td>
                  <span
                    className={`badge-status ${
                      b.TrangThai === "Đã thanh toán" ? "paid" : "refund"
                    }`}
                  >
                    {b.TrangThai}
                  </span>
                </td>
                <td>
                  <button className="btn-view" style={{backgroundColor: '#6c757d', marginLeft: '5px'}} onClick={() => handlePrintClick(b)}>
                    <Printer size={16} />
                  </button>
                  <button 
                        className="btn-view" 
                        style={{ backgroundColor: '#f39c12' }}
                        onClick={() => handleUpdateStatus(b.MaHD, b.TrangThai)}
                        title="Cập nhật trạng thái"
                      >
                        <Edit size={16} />
                      </button>

                      <button 
                        className="btn-view" 
                        style={{ backgroundColor: '#e74c3c' }}
                        onClick={() => handleDelete(b.MaHD)}
                        title="Xóa hóa đơn"
                      >
                        <Trash2 size={16} />
                      </button>
                </td>
              </tr>
            ))}

            {filteredBills.length === 0 && (
              <tr>
                <td colSpan="8" className="empty">Không có hóa đơn nào</td>
              </tr>
            )}
          </tbody>
        </table>

        {showInvoiceModal && printBillData && (
            <InvoicePrint
                order={printBillData}
                items={printBillItems}
                onClose={() => setShowInvoiceModal(false)}
            />
        )}

      </div>
    </DashboardLayout>
  );
}
