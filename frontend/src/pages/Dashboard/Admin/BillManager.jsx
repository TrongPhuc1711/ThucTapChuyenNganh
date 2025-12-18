import { useEffect, useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import '../../../styles/Dashboard/BillManager.css';
import api from "../../../services/api";

export default function BillManager() {
  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);
  const [loading, setLoading] = useState(false);

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

  // Lấy chi tiết hóa đơn
  const openDetail = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/hoadon/${id}`);
      setSelectedBill(res.data);
    } catch (err) {
      alert("Lỗi tải chi tiết hóa đơn");
    }
    setLoading(false);
  };

  const closeDetail = () => setSelectedBill(null);

  return (
    <DashboardLayout title="📄 Quản Lý Hóa Đơn">
      <div className="bill-container">

        {/* 🔎 Thanh tìm kiếm */}
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm theo mã hóa đơn, tên khách hoặc trạng thái..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* 📋 Danh sách hóa đơn */}
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
              <th>Xem</th>
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
                  <button className="btn-view" onClick={() => openDetail(b.MaHD)}>
                    👁️
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

        {/* 📌 Popup chi tiết hóa đơn */}
        {selectedBill && (
          <div className="modal-backdrop" onClick={closeDetail}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>🧾 Chi tiết hóa đơn #{selectedBill.MaHD}</h2>

              <p><b>Khách hàng: </b>{selectedBill.TenKhach}</p>
              <p><b>Ngày đặt: </b>{selectedBill.NgayDat?.split("T")[0]}</p>
              <p><b>Địa chỉ giao hàng: </b>{selectedBill.DiaChiGiaoHang}</p>
              <p><b>Người nhận: </b>{selectedBill.TenNguoiNhan}</p>
              <p><b>SĐT: </b>{selectedBill.SDTNguoiNhan}</p>

              <p><b>Tổng tiền: </b>{Number(selectedBill.TongTien).toLocaleString()} đ</p>
              <p><b>Trạng thái: </b>{selectedBill.TrangThai}</p>
              <p><b>Thanh toán: </b>{selectedBill.HinhThucThanhToan}</p>

              <button className="btn-close" onClick={closeDetail}>Đóng</button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
