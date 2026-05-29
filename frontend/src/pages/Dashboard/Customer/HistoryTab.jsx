import React from 'react';
import { Package, Clock, DollarSign } from 'lucide-react';

export default function HistoryTab({ orders, isLoadingOrders, formatDate, getStatusColor }) {
  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case 'Đã thanh toán':
      case 'Đã giao':
        return 'bg-success-light text-success border-success/10';
      case 'Treo':
      case 'Đang xử lý':
        return 'bg-warning-light text-warning border-warning/10';
      case 'Đã hủy':
        return 'bg-danger-light text-danger border-danger/10';
      default:
        return 'bg-coffee-100 text-coffee-600 border-coffee-200';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between border-b border-coffee-100 pb-4">
        <h2 className="font-heading text-2xl font-bold text-coffee-800 flex items-center gap-2">
          <Package className="text-gold" /> Lịch sử mua hàng
        </h2>
        <span className="text-xs text-coffee-400 font-medium bg-coffee-50 px-3 py-1 rounded-full border border-coffee-100">
          Tổng cộng: <strong>{orders.length}</strong> đơn hàng
        </span>
      </div>

      {isLoadingOrders ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-coffee-100/50">
          <div className="w-10 h-10 border-4 border-coffee-200 border-t-gold rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-coffee-400 font-medium">Đang tải lịch sử đơn hàng...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-coffee-100/50 shadow-sm">
          <span className="text-5xl block mb-4">📦</span>
          <h3 className="font-heading text-lg font-bold text-coffee-800">Chưa có đơn hàng nào</h3>
          <p className="text-sm text-coffee-400 mt-1">Các đơn hàng bạn đặt sẽ xuất hiện ở đây</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.MaDH} className="bg-white rounded-2xl border border-coffee-100/50 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-coffee-50 pb-4 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-coffee-800 text-lg">Đơn hàng #{order.MaDH}</span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusBadgeStyles(order.TrangThai)}`}>
                      {order.TrangThai}
                    </span>
                  </div>
                  <p className="text-xs text-coffee-400 flex items-center gap-1">
                    <Clock size={12} /> {formatDate(order.NgayDat)}
                  </p>
                </div>
                
                {/* Method */}
                {order.PhuongThucThanhToan && (
                  <span className="text-[10px] font-semibold text-coffee-500 bg-coffee-50 px-2.5 py-1 rounded-lg border border-coffee-100/50 font-mono">
                    {order.PhuongThucThanhToan}
                  </span>
                )}
              </div>

              {/* Order items detail */}
              <div className="space-y-3">
                {order.ChiTietDonHang?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm py-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 flex items-center justify-center bg-coffee-50 text-coffee-600 border border-coffee-100 text-xs font-semibold rounded-lg">
                        {item.SoLuong}
                      </span>
                      <span className="font-medium text-coffee-800">{item.TenMon}</span>
                      <span className="text-xs text-coffee-400 font-medium">({item.KichCo})</span>
                    </div>
                    <span className="font-semibold text-coffee-600 font-mono">{Number(item.DonGia * item.SoLuong).toLocaleString()}đ</span>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="flex items-center justify-between border-t border-coffee-50 pt-4 mt-4 text-sm">
                <span className="text-xs text-coffee-400 font-medium">Tổng giá trị đơn hàng</span>
                <span className="font-heading font-extrabold text-gold text-base flex items-center gap-0.5">
                  {Number(order.TongTien).toLocaleString()}đ
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}