import React from 'react';
import "../styles/InvoicePrint.css";

export default function InvoicePrint({ order, items, onClose }) {
  if (!order) return null;

 
  const formatCurrency = (amount) => {
    return Number(amount).toLocaleString('vi-VN') + ' đ';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="invoice-modal-overlay">
      <div className="invoice-modal-content">
        <div className="invoice-header-title">
          <h2>Xác nhận in lại hóa đơn</h2>
        </div>

        {/* Khu vực sẽ được in */}
        <div className="invoice-preview" id="invoice-print-area">
          <div className="invoice-company-info">
            <h2>P-COFFEE</h2>
            <p>Địa chỉ: 180 Cao Lỗ, Quận 8, TP.HCM</p>
            <p>SĐT: 0123 456 789</p>
            <hr className="divider" />
          </div>

          <div className="invoice-title-section">
            <h2>HÓA ĐƠN BÁN HÀNG</h2>
            <p>Số: #{order.MaDH || order.MaHD}</p>
            <p>Ngày: {formatDate(order.NgayDat || order.NgayLap)}</p>
          </div>

          <div className="invoice-customer-info">
            <p><strong>Khách hàng:</strong> {order.TenNguoiNhan || order.HoTen || order.TenKhach || "Khách hàng"}</p>
            <p><strong>SĐT:</strong> {order.SDTNguoiNhan || order.SDT || "N/A"}</p>
            <p><strong>Thanh toán:</strong> {order.PhuongThucThanhToan || order.HinhThucThanhToan || "Tiền mặt"}</p>
          </div>

          <table className="invoice-items-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên món</th>
                <th>Size</th>
                <th>SL</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.TenMon}</td>
                  <td>{item.KichCo}</td>
                  <td>{item.SoLuong}</td>
                  <td>{formatCurrency(item.DonGia)}</td>
                  <td>{formatCurrency(item.DonGia * item.SoLuong)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="5" style={{ textAlign: 'right' }}><strong>TỔNG CỘNG:</strong></td>
                <td><strong>{formatCurrency(order.TongTien)}</strong></td>
              </tr>
            </tfoot>
          </table>

          <div className="invoice-footer-note">
            <p className="thank-you-text">Cảm ơn quý khách! Hẹn gặp lại!</p>
          </div>
        </div>

        <div className="invoice-actions-buttons">
          <button onClick={handlePrint} className="btn-confirm-print-invoice">Xác nhận In</button>
          <button onClick={onClose} className="btn-cancel-print-invoice">Đóng</button>
        </div>
      </div>
    </div>
  );
}