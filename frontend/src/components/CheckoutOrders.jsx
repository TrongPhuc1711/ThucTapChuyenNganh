import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react"; 
import api from "../services/api";
import DashboardLayout from "./DashboardLayout";

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

    const handleCreateOrder = async (isVNPay = false) => {
        if (cart.length === 0) return alert("Giỏ hàng trống!");
        if (!customerInfo.SDT.trim()) return alert("Vui lòng nhập số điện thoại!");

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
                // Nếu là VNPay -> Để Treo chờ quét mã
                await generateVNPayQR(newOrderId, total);
            } else {
                try {
                    await api.put(`/donhang/${newOrderId}`, {
                        TrangThai: 'Đã thanh toán',
                        PhuongThucThanhToan: 'Tiền mặt'
                    }, { headers: { Authorization: `Bearer ${token}` } });
                } catch (updateErr) {
                    console.error("Lỗi cập nhật trạng thái:", updateErr);
                }
                setShowInvoiceModal(true);
            }

        } catch (err) {
            console.error(err);
            alert("Lỗi: " + (err.response?.data?.message || "Không thể tạo đơn"));
        }
    };

    // API lấy link VNPay
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

    // Nút In ngay -> In xong tự chuyển trang
    const confirmPrintInvoice = () => {
        window.print();
        navigate(getRedirectPath());
    };

    // Nút Bỏ qua -> Chuyển trang luôn
    const handleSkipPrint = () => {
        setShowInvoiceModal(false);
        navigate(getRedirectPath());
    };
    
    // Nút xác nhận khi khách quét QR xong
    const handlePaymentSuccess = () => {
        setShowQRModal(false);
        setShowInvoiceModal(true);
    };

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <DashboardLayout title="Thanh Toán Đơn Hàng">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start animate-fade-in">
                {/* CỘT TRÁI: CHI TIẾT ĐƠN HÀNG */}
                <div className="bg-white rounded-2xl border border-coffee-100/50 p-6 shadow-sm space-y-4">
                    <h3 className="font-heading text-lg font-bold text-coffee-800 border-b border-coffee-50 pb-3 flex items-center gap-2">
                        📋 Chi tiết đơn hàng
                    </h3>
                    <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                        {cart.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm py-1.5 border-b border-coffee-50/30">
                                <div className="space-y-0.5">
                                    <span className="font-semibold text-coffee-800 block">{item.TenMon}</span>
                                    <span className="inline-flex items-center px-2 py-0.5 bg-coffee-100 text-coffee-600 text-[10px] font-bold rounded-full">
                                        Size {item.KichCo} x {item.SoLuong}
                                    </span>
                                </div>
                                <span className="font-bold text-coffee-700 font-mono">{formatVND(item.Gia * item.SoLuong)}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-coffee-100/50">
                        <span className="text-sm text-coffee-500 font-medium">Tổng số tiền cần thanh toán</span>
                        <span className="font-heading text-xl font-extrabold text-gold font-mono">{formatVND(total)}</span>
                    </div>
                </div>

                {/* CỘT PHẢI: THÔNG TIN KHÁCH HÀNG */}
                <div className="bg-white rounded-2xl border border-coffee-100/50 p-6 shadow-sm space-y-5">
                    <h3 className="font-heading text-lg font-bold text-coffee-800 border-b border-coffee-50 pb-3">
                        👤 Thông tin giao dịch
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-coffee-500 uppercase tracking-wider mb-1.5">Tên khách hàng</label>
                            <input
                                type="text"
                                placeholder="Tên khách hàng..."
                                value={customerInfo.HoTen}
                                onChange={e => setCustomerInfo({ ...customerInfo, HoTen: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm transition-all font-semibold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-coffee-500 uppercase tracking-wider mb-1.5">Số điện thoại *</label>
                            <input
                                type="text"
                                placeholder="Nhập SĐT khách hàng..."
                                value={customerInfo.SDT}
                                onChange={e => setCustomerInfo({ ...customerInfo, SDT: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm transition-all font-mono font-semibold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-coffee-500 uppercase tracking-wider mb-1.5">💳 Hình thức thanh toán</label>
                            <select
                                value={customerInfo.PhuongThucThanhToan}
                                onChange={e => setCustomerInfo({ ...customerInfo, PhuongThucThanhToan: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-700 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all font-semibold"
                            >
                                <option value="Tiền mặt">💵 Tiền mặt (Thanh toán sau)</option>
                                <option value="Chuyển khoản">💳 Chuyển khoản ngân hàng</option>
                                <option value="Ví điện tử">📱 Ví điện tử (VNPay)</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        className="w-full py-3.5 bg-gradient-to-r from-coffee-700 to-coffee-600 hover:from-coffee-600 hover:to-coffee-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-coffee-700/10 active:scale-98 mt-2"
                        onClick={handleFinalConfirm}
                    >
                        {customerInfo.PhuongThucThanhToan === "Ví điện tử" 
                            ? "✨ TẠO MÃ QR THANH TOÁN (VNPAY)" 
                            : "🚀 HOÀN TẤT & XUẤT HÓA ĐƠN"}
                    </button>
                </div>
            </div>

            {/* MODAL QR */}
            {showQRModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowQRModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-coffee-50">
                            <h3 className="font-heading text-lg font-bold text-coffee-800">Quét mã thanh toán VNPay</h3>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-coffee-50 text-coffee-400 hover:text-coffee-700 transition-colors" onClick={() => setShowQRModal(false)}>✕</button>
                        </div>
                        
                        <div className="p-6 text-center space-y-4">
                            {paymentUrl ? (
                                <>
                                    <p className="text-xs text-coffee-400 font-medium">Mở ứng dụng ngân hàng hoặc ví VNPAY để quét mã bên dưới</p>
                                    <div className="inline-block p-4 bg-white border border-coffee-100 rounded-2xl shadow-sm">
                                        <QRCodeCanvas value={paymentUrl} size={200} level={"H"} includeMargin={false} />
                                    </div>
                                    <p className="font-heading text-lg font-extrabold text-gold font-mono">{formatVND(total)}</p>
                                    <div className="pt-2">
                                        <a href={paymentUrl} className="inline-block text-xs font-semibold text-info bg-info-light hover:bg-info/10 px-4 py-2 rounded-lg transition-colors" target="_blank" rel="noreferrer">
                                            💳 Thử nghiệm thanh toán (VNPAY Sandbox)
                                        </a>
                                    </div>
                                </>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center">
                                    <div className="w-10 h-10 border-4 border-coffee-200 border-t-gold rounded-full animate-spin"></div>
                                    <p className="text-xs text-coffee-400 mt-3 font-semibold">Đang sinh mã giao dịch...</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 p-6 bg-coffee-50 border-t border-coffee-50">
                            <button onClick={handlePaymentSuccess} className="flex-1 py-2.5 bg-gradient-to-r from-coffee-700 to-coffee-600 text-white font-medium rounded-xl text-sm hover:from-coffee-600 hover:to-coffee-500 transition-all shadow-md shadow-coffee-700/10">Khách đã trả xong</button>
                            <button onClick={() => setShowQRModal(false)} className="px-4 py-2.5 bg-white border border-coffee-200 text-coffee-600 font-medium rounded-xl text-sm hover:bg-coffee-50 transition-colors">Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL HÓA ĐƠN */}
            {showInvoiceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-900/50 backdrop-blur-sm animate-fade-in" onClick={handleSkipPrint}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-coffee-50 bg-coffee-50/50">
                            <h3 className="font-heading text-lg font-bold text-coffee-800">Xác nhận bán hàng thành công</h3>
                            <button onClick={handleSkipPrint} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-coffee-100 text-coffee-400 hover:text-coffee-700 transition-colors">✕</button>
                        </div>

                        {/* Invoice Preview */}
                        <div className="p-6 bg-cream border-b border-dashed border-coffee-200" id="invoice-print-area">
                            <div className="text-center space-y-1.5 pb-4 border-b border-coffee-200/50">
                                <h2 className="font-heading text-2xl font-bold text-coffee-800 tracking-wider">P-COFFEE SHOP</h2>
                                <p className="text-xs text-coffee-500 font-medium">Địa chỉ: 180 Cao Lỗ, Quận 8, TP.HCM</p>
                                <p className="text-xs text-coffee-400 font-medium">Hotline: 0123 456 789</p>
                            </div>
                            
                            <div className="py-4 text-center space-y-1 text-xs text-coffee-600 border-b border-coffee-200/50">
                                <h3 className="font-heading text-base font-bold text-coffee-800 mb-2">HÓA ĐƠN BÁN HÀNG</h3>
                                <div className="flex justify-between"><span className="text-coffee-400">Số đơn:</span><span className="font-semibold text-coffee-800">#{createdOrderId}</span></div>
                                <div className="flex justify-between"><span className="text-coffee-400">Thời gian:</span><span className="font-semibold text-coffee-800">{new Date().toLocaleString('vi-VN')}</span></div>
                                <div className="flex justify-between"><span className="text-coffee-400">Trạng thái:</span><span className="font-bold text-success">ĐÃ THANH TOÁN</span></div>
                            </div>
                            
                            <div className="bg-white/50 border border-coffee-100/50 rounded-xl p-3 space-y-1.5 text-xs text-coffee-700 my-4">
                                <div className="flex justify-between">
                                    <span className="text-coffee-400">Khách hàng:</span>
                                    <span className="font-semibold text-coffee-800">{customerInfo.HoTen}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-coffee-400">SĐT khách:</span>
                                    <span className="font-semibold text-coffee-800 font-mono">{customerInfo.SDT}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-coffee-400">Hình thức:</span>
                                    <span className="font-semibold text-coffee-800">{customerInfo.PhuongThucThanhToan}</span>
                                </div>
                            </div>

                            <table className="w-full text-xs text-coffee-700">
                                <thead>
                                    <tr className="border-b border-coffee-200/50 pb-2 text-coffee-400">
                                        <th className="text-left font-semibold pb-1.5">Món</th>
                                        <th className="text-center font-semibold pb-1.5 w-12">SL</th>
                                        <th className="text-right font-semibold pb-1.5">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-coffee-100/50">
                                    {cart.map((item, index) => (
                                        <tr key={index}>
                                            <td className="py-2 text-coffee-800 font-medium">{item.TenMon} <span className="text-[10px] text-coffee-400">({item.KichCo})</span></td>
                                            <td className="py-2 text-center text-coffee-600 font-semibold">{item.SoLuong}</td>
                                            <td className="py-2 text-right font-bold text-coffee-800 font-mono">{formatVND(item.Gia * item.SoLuong)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t border-dashed border-coffee-200/50 pt-2 text-sm">
                                        <td colSpan="2" className="py-3 text-left font-bold text-coffee-700 uppercase tracking-wider">TỔNG CỘNG:</td>
                                        <td className="py-3 text-right font-heading text-base font-extrabold text-gold">{formatVND(total)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                            
                            <div className="text-center pt-6 text-[10px] text-coffee-400 tracking-wider">
                                <p>Cảm ơn quý khách! Hẹn gặp lại bạn!</p>
                            </div>
                        </div>

                        <div className="flex gap-3 p-6 bg-coffee-50 border-t border-coffee-50">
                            <button onClick={confirmPrintInvoice} className="flex-1 py-2.5 bg-gradient-to-r from-coffee-700 to-coffee-600 text-white font-medium rounded-xl text-sm hover:from-coffee-600 hover:to-coffee-500 transition-all shadow-md shadow-coffee-700/10">In ngay</button>
                            <button onClick={handleSkipPrint} className="px-4 py-2.5 bg-white border border-coffee-200 text-coffee-600 font-medium rounded-xl text-sm hover:bg-coffee-50 transition-colors">Bỏ qua (Về danh sách)</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}