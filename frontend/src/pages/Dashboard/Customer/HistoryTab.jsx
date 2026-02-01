import React from 'react';

export default function HistoryTab({ orders, isLoadingOrders, formatDate, getStatusColor }) {
  return (
    <div className="page-wrapper">
      <h2 className="section-title">Đơn hàng của tôi</h2>
      {isLoadingOrders ? (
        <div className="loading-state"><p>Đang tải đơn hàng...</p></div>
      ) : orders.length === 0 ? (
        <div className="empty-state"><h3>Chưa có đơn hàng nào</h3></div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.MaDH} className="order-card">
              <div className="order-header">
                <div>
                  <h3 className="order-id">Đơn hàng #{order.MaDH}</h3>
                  <p className="order-date">{formatDate(order.NgayDat)}</p>
                </div>
                <div className="order-status" style={{ backgroundColor: getStatusColor(order.TrangThai) }}>{order.TrangThai}</div>
              </div>
              <div className="order-details">
                {order.ChiTietDonHang?.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <span>{item.TenMon} ({item.KichCo})</span><span>x{item.SoLuong}</span><span>{Number(item.DonGia).toLocaleString()}đ</span>
                  </div>
                ))}
              </div>
              <div className="order-footer"><div className="order-total">Tổng: <strong>{Number(order.TongTien).toLocaleString()}đ</strong></div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}