import React from 'react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-coffee-50 bg-coffee-50/50">
          <h3 className="font-heading text-lg font-bold text-coffee-800">Xác nhận in lại hóa đơn</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-coffee-100 text-coffee-400 hover:text-coffee-700 transition-colors">✕</button>
        </div>

        {/* Print Preview Area */}
        <div className="p-6 bg-cream border-b border-dashed border-coffee-200" id="invoice-print-area">
          <div className="text-center space-y-1 pb-4 border-b border-coffee-200/50">
            <h2 className="font-heading text-2xl font-bold text-coffee-800 tracking-wider">P-COFFEE</h2>
            <p className="text-xs text-coffee-500 font-medium">Địa chỉ: 180 Cao Lỗ, Quận 8, TP.HCM</p>
            <p className="text-xs text-coffee-400 font-medium">SĐT: 0123 456 789</p>
          </div>

          <div className="py-4 text-center space-y-1">
            <h3 className="font-heading text-lg font-bold text-coffee-800">HÓA ĐƠN BÁN HÀNG</h3>
            <p className="text-xs text-coffee-500 font-semibold font-mono">Số: #{order.MaDH || order.MaHD}</p>
            <p className="text-xs text-coffee-400 font-medium">Ngày: {formatDate(order.NgayDat || order.NgayLap)}</p>
          </div>

          <div className="bg-white/50 border border-coffee-100/50 rounded-xl p-3.5 space-y-2 text-xs text-coffee-700 mb-4">
            <div className="flex justify-between">
              <span className="text-coffee-400">Khách hàng:</span>
              <span className="font-semibold text-coffee-800">{order.TenNguoiNhan || order.HoTen || order.TenKhach || "Khách hàng"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-coffee-400">SĐT khách:</span>
              <span className="font-semibold text-coffee-800 font-mono">{order.SDTNguoiNhan || order.SDT || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-coffee-400">Phương thức:</span>
              <span className="font-semibold text-coffee-800">{order.PhuongThucThanhToan || order.HinhThucThanhToan || "Tiền mặt"}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-coffee-700">
              <thead>
                <tr className="border-b border-coffee-200 pb-2 text-coffee-400">
                  <th className="text-left font-semibold pb-2 w-8">STT</th>
                  <th className="text-left font-semibold pb-2">Tên món</th>
                  <th className="text-center font-semibold pb-2 w-12">Size</th>
                  <th className="text-center font-semibold pb-2 w-10">SL</th>
                  <th className="text-right font-semibold pb-2">Đơn giá</th>
                  <th className="text-right font-semibold pb-2">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-100/50">
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-2 text-coffee-400 font-medium">{index + 1}</td>
                    <td className="py-2 text-coffee-800 font-medium">{item.TenMon}</td>
                    <td className="py-2 text-center text-coffee-600 font-bold">{item.KichCo}</td>
                    <td className="py-2 text-center text-coffee-600 font-semibold">{item.SoLuong}</td>
                    <td className="py-2 text-right font-mono text-coffee-700">{formatCurrency(item.DonGia)}</td>
                    <td className="py-2 text-right font-bold text-coffee-800">{formatCurrency(item.DonGia * item.SoLuong)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-dashed border-coffee-200 pt-2 font-sm">
                  <td colSpan="5" className="py-3 text-right font-bold text-coffee-700 uppercase tracking-wider">TỔNG CỘNG:</td>
                  <td className="py-3 text-right font-heading text-base font-extrabold text-gold">{formatCurrency(order.TongTien)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="text-center pt-6 text-[10px] text-coffee-400 tracking-wider">
            <p>Cảm ơn quý khách! Hẹn gặp lại bạn!</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 p-6 bg-coffee-50 border-t border-coffee-50">
          <button onClick={handlePrint} className="flex-1 py-2.5 bg-gradient-to-r from-coffee-700 to-coffee-600 text-white font-medium rounded-xl text-sm hover:from-coffee-600 hover:to-coffee-500 transition-all shadow-md shadow-coffee-700/10">In ngay</button>
          <button onClick={onClose} className="px-4 py-2.5 bg-white border border-coffee-200 text-coffee-600 font-medium rounded-xl text-sm hover:bg-coffee-50 transition-colors">Đóng</button>
        </div>
      </div>
    </div>
  );
}