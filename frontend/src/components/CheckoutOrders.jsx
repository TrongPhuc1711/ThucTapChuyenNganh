import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react"; 
import { 
  ShoppingBag, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  X,
  Sparkles
} from "lucide-react";
import api from "../services/api";
import DashboardLayout from "./DashboardLayout";
import Input from "./ui/Input";
import Button from "./ui/Button";

export default function CheckoutOrder() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { cart, total } = location.state || { cart: [], total: 0 };

  const [customerInfo, setCustomerInfo] = useState({
    HoTen: "Khách lẻ",
    SDT: "0123456789",
    DiaChiGiaoHang: "Tại quầy",
    PhuongThucThanhToan: "Tiền mặt"
  });

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(""); 
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateOrder = async (isVNPay = false) => {
    if (cart.length === 0) return alert("Giỏ hàng đang trống!");
    if (!customerInfo.SDT.trim()) return alert("Vui lòng nhập số điện thoại khách hàng!");

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      const orderData = {
        MaND: JSON.parse(localStorage.getItem("user"))?.MaND || 1,
        TenNguoiNhan: customerInfo.HoTen,
        SDTNguoiNhan: customerInfo.SDT,
        DiaChiGiaoHang: customerInfo.DiaChiGiaoHang,
        PhuongThucThanhToan: customerInfo.PhuongThucThanhToan,
        DanhSachMon: cart.map(item => ({
          MaCTM: item.MaCTM,
          SoLuong: item.SoLuong,
          DonGia: item.Gia
        }))
      };

      const response = await api.post("/donhang", orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newOrderId = response.data.MaDH;
      setCreatedOrderId(newOrderId);

      if (isVNPay) {
        await generateVNPayQR(newOrderId, total);
      } else {
        try {
          await api.put(`/donhang/${newOrderId}`, {
            TrangThai: 'Đã thanh toán',
            PhuongThucThanhToan: customerInfo.PhuongThucThanhToan
          }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (updateErr) {
          console.error("Lỗi cập nhật trạng thái:", updateErr);
        }
        setShowInvoiceModal(true);
      }

    } catch (err) {
      console.error(err);
      alert("Lỗi: " + (err.response?.data?.message || "Không thể tạo đơn hàng"));
    } finally {
      setIsLoading(false);
    }
  };

  const generateVNPayQR = async (orderId, amount) => {
    try {
      const res = await api.post('/paymentVnPay/create-payment-url', {
        orderId: orderId,
        amount: amount,
        bankCode: "NCB"
      });
      
      if (res.data.url) {
        setPaymentUrl(res.data.url);
        setShowQRModal(true);
      }
    } catch (error) {
      console.error("Lỗi tạo QR:", error);
      alert("Không thể tạo mã QR thanh toán");
    }
  };

  const handleFinalConfirm = () => {
    if (customerInfo.PhuongThucThanhToan === "Ví điện tử") {
      handleCreateOrder(true);
    } else {
      handleCreateOrder(false);
    }
  };

  const getRedirectPath = () => {
    return location.pathname.includes("/admin") ? "/admin/orders" : "/staff/orders";
  };

  const confirmPrintInvoice = () => {
    window.print();
    navigate(getRedirectPath());
  };

  const handleSkipPrint = () => {
    setShowInvoiceModal(false);
    navigate(getRedirectPath());
  };
  
  const handlePaymentSuccess = () => {
    setShowQRModal(false);
    setShowInvoiceModal(true);
  };

  const formatVND = (amount) => {
    return Number(amount || 0).toLocaleString('vi-VN') + ' đ';
  };

  return (
    <DashboardLayout title="Thanh Toán & Xuất Hóa Đơn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in max-w-6xl mx-auto">
        
        {/* LEFT COLUMN: ORDER REVIEW */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#EFEBE9] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-4">
            <h3 className="font-serif text-xl font-bold text-[#2C1810] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C5963A]" />
              <span>Chi Tiết Đơn Hàng</span>
            </h3>
            <span className="text-xs font-semibold text-[#8D6E63]">
              {cart.length} món trong giỏ
            </span>
          </div>

          <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
            {cart.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EFEBE9]">
                <div>
                  <h4 className="font-serif font-bold text-xs text-[#2C1810]">{item.TenMon}</h4>
                  <p className="text-[11px] text-[#8D6E63] mt-0.5">
                    Size: <strong className="text-[#4E342E]">{item.KichCo}</strong> • SL: <strong className="text-[#4E342E]">{item.SoLuong}</strong>
                  </p>
                </div>
                <span className="font-serif font-bold text-sm text-[#C5963A]">
                  {formatVND(item.Gia * item.SoLuong)}
                </span>
              </div>
            ))}
          </div>
          
          <div className="p-5 rounded-2xl bg-[#2C1810] text-white flex items-center justify-between">
            <span className="text-xs font-semibold text-[#D7CCC8]">Tổng tiền cần thanh toán:</span>
            <span className="font-serif text-2xl font-black text-[#C5963A]">{formatVND(total)}</span>
          </div>
        </div>

        {/* RIGHT COLUMN: CUSTOMER & PAYMENT METHOD */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#EFEBE9] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-[#FAF7F2] pb-4">
            <h3 className="font-serif text-xl font-bold text-[#2C1810]">
              Thông Tin Thanh Toán
            </h3>
            <p className="text-xs text-[#8D6E63] mt-0.5">
              Nhập tên khách và hình thức trả tiền
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Tên khách hàng"
              value={customerInfo.HoTen}
              onChange={e => setCustomerInfo({ ...customerInfo, HoTen: e.target.value })}
              required
            />

            <Input
              label="Số điện thoại"
              value={customerInfo.SDT}
              onChange={e => setCustomerInfo({ ...customerInfo, SDT: e.target.value })}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-[#4E342E] uppercase tracking-wider mb-2">
                Hình thức thanh toán *
              </label>
              <div className="space-y-2">
                {[
                  { value: "Tiền mặt", label: "Tiền mặt tại quầy", icon: Banknote },
                  { value: "Chuyển khoản", label: "Chuyển khoản ngân hàng", icon: CreditCard },
                  { value: "Ví điện tử", label: "Ví điện tử (VNPay QR)", icon: Smartphone }
                ].map(method => {
                  const Icon = method.icon;
                  const isSelected = customerInfo.PhuongThucThanhToan === method.value;
                  return (
                    <div
                      key={method.value}
                      onClick={() => setCustomerInfo({ ...customerInfo, PhuongThucThanhToan: method.value })}
                      className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-[#C5963A] bg-[#C5963A]/10 text-[#2C1810] font-bold shadow-sm' 
                          : 'border-[#EFEBE9] hover:bg-[#FAF7F2] text-[#6D4C41]'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-[#C5963A]" />
                      <span className="text-xs flex-1">{method.label}</span>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        checked={isSelected} 
                        onChange={() => {}} 
                        className="w-4 h-4 text-[#C5963A]"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <Button
            variant="gold"
            size="lg"
            loading={isLoading}
            onClick={handleFinalConfirm}
            className="w-full font-bold text-sm py-4 rounded-2xl shadow-xl shadow-[#C5963A]/20"
          >
            {customerInfo.PhuongThucThanhToan === "Ví điện tử" 
              ? "✨ Tạo Mã QR VNPay" 
              : "🚀 Hoàn Tất & Xuất Hóa Đơn"}
          </Button>
        </div>

      </div>

      {/* MODAL QR VNPAY */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowQRModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-scale-in p-6 text-center space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#2C1810]">Quét Mã VNPay</h3>
              <button className="w-8 h-8 rounded-xl bg-[#FAF7F2] flex items-center justify-center text-[#6D4C41]" onClick={() => setShowQRModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs text-[#8D6E63]">Mở ứng dụng ngân hàng hoặc ví VNPAY để quét mã</p>
              <div className="inline-block p-4 bg-white border border-[#EFEBE9] rounded-2xl shadow-md">
                <QRCodeCanvas value={paymentUrl} size={180} level={"H"} includeMargin={false} />
              </div>
              <p className="font-serif text-2xl font-black text-[#C5963A]">{formatVND(total)}</p>
              <a 
                href={paymentUrl} 
                target="_blank" 
                rel="noreferrer"
                className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors"
              >
                💳 Mở cổng thanh toán Sandbox
              </a>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handlePaymentSuccess} variant="primary" size="md" className="flex-1 font-bold">
                Khách Đã Trả Xong
              </Button>
              <button onClick={() => setShowQRModal(false)} className="px-4 py-2.5 bg-[#FAF7F2] text-[#6D4C41] font-bold text-xs rounded-xl hover:bg-[#EFEBE9]">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IN HÓA ĐƠN THÀNH CÔNG */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={handleSkipPrint}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in flex flex-col" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="p-6 border-b border-[#FAF7F2] flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-serif text-lg text-[#2C1810]">Bán Hàng Thành Công</span>
              </div>
              <button onClick={handleSkipPrint} className="w-8 h-8 rounded-xl bg-[#FAF7F2] flex items-center justify-center text-[#6D4C41]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bill Paper Preview */}
            <div className="p-8 bg-[#FAF7F2] border-b border-dashed border-[#D7CCC8]" id="invoice-print-area">
              <div className="text-center space-y-1.5 pb-4 border-b border-[#D7CCC8]">
                <h3 className="font-serif text-2xl font-black text-[#2C1810]">P-COFFEE SHOP</h3>
                <p className="text-xs text-[#6D4C41]">180 Cao Lỗ, Phường 4, Quận 8, TP.HCM</p>
                <p className="text-xs text-[#6D4C41]">Hotline: 0123 456 789</p>
              </div>
              
              <div className="py-4 space-y-1 text-xs text-[#6D4C41] border-b border-[#D7CCC8]">
                <h4 className="font-serif text-center text-sm font-bold text-[#2C1810] mb-2 uppercase">HÓA ĐƠN BÁN HÀNG</h4>
                <div className="flex justify-between"><span className="text-[#A1887F]">Số đơn:</span><span className="font-bold text-[#2C1810]">#{createdOrderId}</span></div>
                <div className="flex justify-between"><span className="text-[#A1887F]">Thời gian:</span><span className="font-mono text-[#2C1810]">{new Date().toLocaleString('vi-VN')}</span></div>
                <div className="flex justify-between"><span className="text-[#A1887F]">Khách hàng:</span><span className="font-bold text-[#2C1810]">{customerInfo.HoTen}</span></div>
                <div className="flex justify-between"><span className="text-[#A1887F]">Phương thức:</span><span className="font-semibold text-[#2C1810]">{customerInfo.PhuongThucThanhToan}</span></div>
              </div>
              
              <div className="py-4">
                <table className="w-full text-xs text-[#2C1810]">
                  <thead>
                    <tr className="border-b border-[#D7CCC8] text-[10px] uppercase font-bold text-[#A1887F]">
                      <th className="text-left pb-2">Món</th>
                      <th className="text-center pb-2">SL</th>
                      <th className="text-right pb-2">Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFEBE9]">
                    {cart.map((item, index) => (
                      <tr key={index}>
                        <td className="py-2 font-serif font-bold">{item.TenMon} <span className="text-[10px] font-sans font-normal text-[#8D6E63]">({item.KichCo})</span></td>
                        <td className="py-2 text-center font-bold text-[#4E342E]">{item.SoLuong}</td>
                        <td className="py-2 text-right font-mono font-bold text-[#C5963A]">{formatVND(item.Gia * item.SoLuong)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-4 border-t border-dashed border-[#D7CCC8] flex justify-between items-center text-sm">
                <span className="font-serif font-bold text-xs uppercase text-[#4E342E]">Tổng cộng:</span>
                <span className="font-serif font-black text-xl text-[#C5963A]">{formatVND(total)}</span>
              </div>
              
              <div className="text-center pt-6 text-[10px] text-[#A1887F]">
                <p>Cảm ơn quý khách! Hẹn gặp lại bạn!</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 bg-white border-t border-[#FAF7F2]">
              <button 
                onClick={confirmPrintInvoice}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#C5963A] to-[#D4A84B] hover:from-[#B8872D] hover:to-[#C5963A] text-[#1A0F0A] font-bold rounded-2xl text-xs shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>In Hóa Đơn Ngay</span>
              </button>
              <button 
                onClick={handleSkipPrint} 
                className="px-6 py-3 bg-[#FAF7F2] text-[#6D4C41] font-bold rounded-2xl text-xs hover:bg-[#EFEBE9] transition-colors cursor-pointer"
              >
                Hoàn Tất
              </button>
            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}