import { useState,useEffect } from "react";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";

const API_URL = import.meta.env.VITE_URL_URL;

export default function Orders() {
    const [donHangs, setDonHangs] = useState([]);
    const [chiTietDonHang, setChiTietDonHang] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
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
        const res = await api.get(`/donhang/${maDH}/chitiet`);
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
        
        await api.put(`/donhang/${maDH}/status`, data);
        setMessage(`✅ Cập nhật trạng thái thành công`);
        loadDonHangs();
        setTimeout(() => setMessage(""), 3000);
      } catch (err) {
        setMessage("❌ " + (err.response?.data?.message || "Có lỗi xảy ra"));
        setTimeout(() => setMessage(""), 3000);
      }
    };
  
    const handleCancelOrder = async (maDH) => {
      if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
      
      try {
        await api.put(`/donhang/${maDH}/cancel`);
        setMessage("✅ Hủy đơn hàng thành công");
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
        setMessage("❌ " + (err.response?.data?.message || "Không thể xóa"));
        setTimeout(() => setMessage(""), 3000);
      }
    };
  
    const handlePayment = (donHang) => {
      const phuongThuc = window.prompt(
        "Chọn phương thức thanh toán:\n1. Ví điện tử\n2. Chuyển khoản",
        "1"
      );
      
      if (!phuongThuc) return;
      
      const method = phuongThuc === "1" ? "Ví điện tử" : "Chuyển khoản";
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
  
    return (
      <DashboardLayout title="Quản lý đơn hàng">
        {message && <div className="message-alert">{message}</div>}
  
        <div className="dashboard-content">
          <div className="list-section">
            <div className="list-header">
              <h2>📦 Danh Sách Đơn Hàng ({filteredDonHangs.length})</h2>
              
              <div className="order-search-bar">
                <input
                  type="text"
                  placeholder="🔍 Tìm theo mã ĐH, tên, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="order-search-input"
                />
                
                <div className="filter-group">
                  <label>Trạng thái:</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">Tất cả</option>
                    <option value="Treo">Treo</option>
                    <option value="Đã thanh toán">Đã thanh toán</option>
                    <option value="Đã hủy">Đã hủy</option>
                  </select>
                </div>
              </div>
            </div>
  
            {isLoading ? (
              <div className="empty-state">
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : filteredDonHangs.length === 0 ? (
              <div className="empty-state">
                <p>Không có đơn hàng nào</p>
              </div>
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
                            <strong>{dh.HoTen}</strong>
                            <span className="customer-email">{dh.Email}</span>
                          </div>
                        </td>
                        <td>{formatDate(dh.NgayDat)}</td>
                        <td className="order-total">{formatCurrency(dh.TongTien)}</td>
                        <td>{dh.PhuongThucThanhToan || "—"}</td>
                        <td className="order-address">{dh.DiaChiGiaoHang || "—"}</td>
                        <td>{getStatusBadge(dh.TrangThai)}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              onClick={() => handleViewDetail(dh)} 
                              className="btn-view"
                              title="Xem chi tiết"
                            >
                              👁️
                            </button>
                            
                            {dh.TrangThai === 'Treo' && (
                              <>
                                <button 
                                  onClick={() => handlePayment(dh)} 
                                  className="btn-payment"
                                  title="Thanh toán"
                                >
                                  💳
                                </button>
                                <button 
                                  onClick={() => handleCancelOrder(dh.MaDH)} 
                                  className="btn-cancel-order"
                                  title="Hủy"
                                >
                                  ✖️
                                </button>
                              </>
                            )}
                            
                            <button 
                              onClick={() => handleDeleteOrder(dh.MaDH)} 
                              className="btn-delete"
                              title="Xóa"
                            >
                              🗑️
                            </button>
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
                <button 
                  onClick={() => setShowDetailModal(false)} 
                  className="modal-close"
                >
                  ✕
                </button>
              </div>
  
              <div className="modal-body">
                <div className="order-info-grid">
                  <div className="info-item">
                    <span className="info-label">Khách hàng:</span>
                    <span className="info-value">{selectedOrder.HoTen}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{selectedOrder.Email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Ngày đặt:</span>
                    <span className="info-value">{formatDate(selectedOrder.NgayDat)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Trạng thái:</span>
                    <span className="info-value">{getStatusBadge(selectedOrder.TrangThai)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">PT Thanh toán:</span>
                    <span className="info-value">{selectedOrder.PhuongThucThanhToan || "Chưa chọn"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Địa chỉ:</span>
                    <span className="info-value">{selectedOrder.DiaChiGiaoHang || "Không có"}</span>
                  </div>
                </div>
  
                <h4 className="detail-title">Danh sách món:</h4>
                <div className="detail-items">
                  {chiTietDonHang.map((item, index) => (
                    <div key={index} className="detail-item">
                      <img 
                        src={item.HinhAnh ? `${API_URL}${item.HinhAnh}` : '/placeholder.jpg'} 
                        alt={item.TenMon}
                        className="detail-item-image"
                        onError={(e) => e.target.src = '/placeholder.jpg'}
                      />
                      <div className="detail-item-info">
                        <h5>{item.TenMon}</h5>
                        <p>Size: {item.KichCo}</p>
                        <p>Số lượng: {item.SoLuong}</p>
                        <p className="item-price">
                          {formatCurrency(item.DonGia)} × {item.SoLuong} = {formatCurrency(item.DonGia * item.SoLuong)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
  
                <div className="detail-total">
                  <strong>Tổng cộng:</strong>
                  <strong className="total-amount">{formatCurrency(selectedOrder.TongTien)}</strong>
                </div>
              </div>
  
              <div className="modal-footer">
                <button 
                  onClick={() => setShowDetailModal(false)} 
                  className="btn-close-modal"
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