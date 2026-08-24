import React from 'react';
import { Printer, X } from 'lucide-react';

export default function InvoicePrint({ order, items, onClose }) {
  if (!order) return null;

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString('vi-VN') + ' đ';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden animate-scale-in flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#FAF7F2]">
          <h3 className="font-serif text-xl font-bold text-[#2C1810]">In Lại Hóa Đơn</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#FAF7F2] hover:bg-[#EFEBE9] text-[#6D4C41] flex items-center justify-center transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Print Preview Area */}
        <div className="p-8 bg-[#FAF7F2] border-b border-dashed border-[#D7CCC8]" id="invoice-print-area">
          <div className="text-center space-y-1 pb-4 border-b border-[#D7CCC8]">
            <h2 className="font-serif text-2xl font-black text-[#2C1810]">P-COFFEE ROASTERY</h2>
            <p className="text-xs text-[#6D4C41]">180 Cao Lỗ, Phường 4, Quận 8, TP.HCM</p>
            <p className="text-xs text-[#6D4C41]">Hotline: 0123 456 789</p>
          </div>

          <div className="py-4 text-center space-y-1">
            <h3 className="font-serif text-base font-bold text-[#2C1810] uppercase">HÓA ĐƠN TÀI KHÓA</h3>
            <p className="text-xs text-[#C5963A] font-bold font-mono">Số: #{order.MaDH || order.MaHD}</p>
            <p className="text-xs text-[#8D6E63]">Thời gian: {formatDate(order.NgayDat || order.NgayLap)}</p>
          </div>

          <div className="bg-white border border-[#EFEBE9] rounded-2xl p-4 space-y-2 text-xs text-[#4E342E] mb-4">
            <div className="flex justify-between">
              <span className="text-[#A1887F]">Khách hàng:</span>
              <span className="font-serif font-bold text-[#2C1810]">{order.TenNguoiNhan || order.HoTen || order.TenKhach || "Khách tại quầy"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A1887F]">Số điện thoại:</span>
              <span className="font-mono text-[#2C1810]">{order.SDTNguoiNhan || order.SDT || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A1887F]">Hình thức thanh toán:</span>
              <span className="font-semibold text-[#2C1810]">{order.PhuongThucThanhToan || order.HinhThucThanhToan || "Tiền mặt"}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-[#2C1810]">
              <thead>
                <tr className="border-b border-[#D7CCC8] text-[10px] uppercase font-bold text-[#A1887F]">
                  <th className="text-left pb-2">STT</th>
                  <th className="text-left pb-2">Tên Món</th>
                  <th className="text-center pb-2">Size</th>
                  <th className="text-center pb-2">SL</th>
                  <th className="text-right pb-2">Đơn Giá</th>
                  <th className="text-right pb-2">Thành Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEBE9]">
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-2.5 text-[#A1887F] font-mono">{index + 1}</td>
                    <td className="py-2.5 font-serif font-bold text-[#2C1810]">{item.TenMon}</td>
                    <td className="py-2.5 text-center font-bold text-[#6D4C41]">{item.KichCo}</td>
                    <td className="py-2.5 text-center font-bold text-[#4E342E]">{item.SoLuong}</td>
                    <td className="py-2.5 text-right font-mono text-[#6D4C41]">{formatCurrency(item.DonGia)}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-[#C5963A]">{formatCurrency(item.DonGia * item.SoLuong)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-dashed border-[#D7CCC8]">
                  <td colSpan="5" className="py-3 text-right font-serif font-bold text-xs uppercase text-[#4E342E]">Tổng cộng:</td>
                  <td className="py-3 text-right font-serif font-black text-base text-[#C5963A]">{formatCurrency(order.TongTien)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="text-center pt-6 text-[10px] text-[#A1887F] space-y-1">
            <p>Cảm ơn quý khách! Hẹn gặp lại bạn tại P-Coffee!</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 p-6 bg-white border-t border-[#FAF7F2]">
          <button 
            onClick={handlePrint} 
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#C5963A] to-[#D4A84B] hover:from-[#B8872D] hover:to-[#C5963A] text-[#1A0F0A] font-bold rounded-2xl text-xs shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In Ngay</span>
          </button>
          <button 
            onClick={onClose} 
            className="px-6 py-3 bg-[#FAF7F2] text-[#6D4C41] font-bold rounded-2xl text-xs hover:bg-[#EFEBE9] transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}