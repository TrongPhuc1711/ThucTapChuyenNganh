import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";
import "../../../styles/Dashboard/Orders.css";
import InvoicePrint from "../../../components/InvoicePrint";
const API_URL = import.meta.env.VITE_URL_URL;

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

  useEffect(() => {
    loadDonHangs();
  }, []);

  const loadDonHangs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/donhang");
      setDonHangs(res.data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi khi tải danh sách đơn hàng");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChiTietDonHang = async (maDH) => {
    try {
      const res = await api.get(`/donhang/chitiet/${maDH}`);
      setChiTietDonHang(res.data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi khi tải chi tiết đơn hàng");
      setTimeout(() => setMessage(""), 3000);
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
      if (phuongThucThanhToan) {
        data.PhuongThucThanhToan = phuongThucThanhToan;
      }

      await api.put(`/donhang/${maDH}`, data);
      setMessage(`✅Cập nhật trạng thái thành công`);
      loadDonHangs();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Có lỗi xảy ra"));
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleCancelOrder = async (donHang) => {
    const isPaid = donHang.TrangThai === "Đã thanh toán";
    const confirmMessage = isPaid
      ? "CẢNH BÁO: Đơn này ĐÃ THANH TOÁN. Hủy đơn đồng nghĩa với việc phải HOÀN TIỀN. Bạn có chắc chắn muốn hủy?"
      : "Bạn có chắc muốn hủy đơn hàng này?";
    if (!window.confirm(confirmMessage)) return;

    try {
      await api.put(`/donhang/${donHang.MaDH}`, { TrangThai: "Đã hủy" });
      setMessage("Hủy đơn hàng thành công" + (isPaid ? " (Đã cập nhật hóa đơn sang Hoàn tiền)" : ""));
      loadDonHangs();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Không thể hủy"));
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDeleteOrder = async (maDH) => {
    if (!window.confirm("Bạn có chắc muốn xóa đơn hàng này? Hành động này không thể hoàn tác!")) return;

    try {
      await api.delete(`/donhang/${maDH}`);
      setMessage("✅ Xóa đơn hàng thành công");
      loadDonHangs();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.log(err);
      setMessage("❌ " + (err.response?.data?.message || "Không thể xóa"));
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handlePayment = (donHang) => {
    const phuongThuc = window.prompt(
      "Chọn phương thức thanh toán:\n1. Ví điện tử\n2. Chuyển khoản\n3. Tiền mặt",
      "1"
    );

    if (!phuongThuc) return;

    let method = "";
    switch (phuongThuc) {
      case "1": method = "Ví điện tử"; break;
      case "2": method = "Chuyển khoản"; break;
      case "3": method = "Tiền mặt"; break;
      default: alert("Lựa chọn không hợp lệ!"); return;
    }

    handleUpdateStatus(donHang.MaDH, "Đã thanh toán", method);
  };

  const filteredDonHangs = donHangs.filter(dh => {
    const matchStatus = !filterStatus || dh.TrangThai === filterStatus;
    const matchSearch = !searchTerm ||
      dh.MaDH.toString().includes(searchTerm) ||
      dh.HoTen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dh.Email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getStatusBadge = (status) => {
    const badgeClass = status === 'Treo' ? 'status-pending' :
      status === 'Đã thanh toán' ? 'status-paid' : 'status-cancelled';
    return <span className={`status-badge ${badgeClass}`}>{status}</span>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const formatCurrency = (amount) => {
    return Number(amount).toLocaleString('vi-VN') + ' đ';
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.png";
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return `${API_URL}${imagePath}`;
    return `${API_URL}/${imagePath}`;
  };

  return (
    <DashboardLayout title="Quản lý đơn hàng">
      {message && <div className="message-alert">{message}</div>}

      <div className="dashboard-content">
        <div className="list-section">
          <div className="list-header">
            <h2>Danh Sách Đơn Hàng ({filteredDonHangs.length})</h2>
            <div className="order-search-bar">
              <input
                type="text"
                placeholder="Tìm theo mã ĐH, tên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="order-search-input"
              />
              <div className="filter-group">
                <label>Trạng thái:</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">Tất cả</option>
                  <option value="Treo">Treo</option>
                  <option value="Đã thanh toán">Đã thanh toán</option>
                  <option value="Đã hủy">Đã hủy</option>
                </select>
              </div>
              <button onClick={() => navigate('/admin/create-order')} className="btn-create-new">Tạo đơn hàng</button>
            </div>
          </div>

          {isLoading ? (
            <div className="empty-state"><p>Đang tải dữ liệu...</p></div>
          ) : filteredDonHangs.length === 0 ? (
            <div className="empty-state"><p>Không có đơn hàng nào</p></div>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Mã ĐH</th>
                    <th>Khách hàng</th>
                    <th>Ngày đặt</th>
                    <th>Tổng tiền</th>
                    <th>PT Thanh toán</th>
                    <th>Địa chỉ</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonHangs.map((dh) => (
                    <tr key={dh.MaDH}>
                      <td className="order-id">#{dh.MaDH}</td>
                      <td>
                        <div className="customer-info">
                          <strong>{dh.TenNguoiNhan || dh.HoTen || "Khách hàng"}</strong>
                          <span className="customer-email">{dh.Email || dh.SDTNguoiNhan}</span>
                        </div>
                      </td>
                      <td>{formatDate(dh.NgayDat)}</td>
                      <td className="order-total">{formatCurrency(dh.TongTien)}</td>
                      <td>{dh.PhuongThucThanhToan || "—"}</td>
                      <td className="order-address">{dh.DiaChiGiaoHang || "Tại quầy"}</td>
                      <td>{getStatusBadge(dh.TrangThai)}</td>
                      <td>
                        <div className="action-buttons">
                          <button onClick={() => handleViewDetail(dh)} className="btn-view">Xem</button>
                          {dh.TrangThai === 'Treo' && (
                            <button onClick={() => handlePayment(dh)} className="btn-payment">Thanh toán</button>
                          )}
                          {dh.TrangThai !== 'Đã hủy' && dh.TrangThai !== 'Đã giao' && (
                            <button
                              onClick={() => handleCancelOrder(dh)}
                              className="btn-cancel-order"
                              style={{ marginLeft: '5px', backgroundColor: '#dc3545', color: '#fff' }}
                            >
                              Hủy
                            </button>
                          )}
                          <button onClick={() => handleDeleteOrder(dh.MaDH)} className="btn-delete">Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Chi tiết đơn hàng */}
      {showDetailModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết đơn hàng #{selectedOrder.MaDH}</h3>
              <button onClick={() => setShowDetailModal(false)} className="modal-close">✕</button>
            </div>

            <div className="modal-body">
              <div className="order-info-grid">
                <div className="info-item"><span className="info-label">Khách hàng:</span><span className="info-value">{selectedOrder.TenNguoiNhan || selectedOrder.HoTen}</span></div>
                <div className="info-item"><span className="info-label">Email/SĐT:</span><span className="info-value">{selectedOrder.Email || selectedOrder.SDTNguoiNhan}</span></div>
                <div className="info-item"><span className="info-label">Ngày đặt:</span><span className="info-value">{formatDate(selectedOrder.NgayDat)}</span></div>
                <div className="info-item"><span className="info-label">Trạng thái:</span><span className="info-value">{getStatusBadge(selectedOrder.TrangThai)}</span></div>
                <div className="info-item"><span className="info-label">PT Thanh toán:</span><span className="info-value">{selectedOrder.PhuongThucThanhToan || "Chưa chọn"}</span></div>
                <div className="info-item"><span className="info-label">Địa chỉ:</span><span className="info-value">{selectedOrder.DiaChiGiaoHang || "Tại quầy"}</span></div>
              </div>

              <h4 className="detail-title">Danh sách món:</h4>
              <div className="detail-items">
                {chiTietDonHang.map((item, index) => (
                  <div key={index} className="detail-item">
                    <img src={getImageUrl(item.HinhAnh)} alt={item.TenMon} className="detail-item-image" />
                    <div className="detail-item-info">
                      <h5>{item.TenMon}</h5>
                      <p>Size: {item.KichCo}</p>
                      <p>Số lượng: {item.SoLuong}</p>
                      <p className="item-price">{formatCurrency(item.DonGia)} × {item.SoLuong} = {formatCurrency(item.DonGia * item.SoLuong)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="detail-total"><strong>Tổng cộng:</strong><strong className="total-amount">{formatCurrency(selectedOrder.TongTien)}</strong></div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="btn-confirm-print-invoice"
                style={{ marginRight: '10px' }}
              >
                In lại hóa đơn
              </button>
              <button onClick={() => setShowDetailModal(false)} className="btn-close-modal-order">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IN LẠI HÓA ĐƠN */}
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