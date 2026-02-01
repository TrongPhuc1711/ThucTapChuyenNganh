import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react"; 
import api from "../services/api";
import DashboardLayout from "./DashboardLayout";

import "../styles/CheckoutOrder.css";

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
            <div className="checkout-container">
                {/* CỘT TRÁI */}
                <div className="order-summary-box">
                    <h3>Chi tiết đơn hàng</h3>
                    {cart.map((item, idx) => (
                        <div key={idx} className="item-line">
                            <span>{item.TenMon} ({item.KichCo}) x{item.SoLuong}</span>
                            <span>{(item.Gia * item.SoLuong).toLocaleString()}đ</span>
                        </div>
                    ))}
                    <hr />
                    <h2 className="total-txt">Tổng tiền: {formatVND(total)/2}</h2>
                </div>

                {/* CỘT PHẢI */}
                <div className="customer-form">
                    <h3>Thông tin khách hàng</h3>
                    <input
                        type="text"
                        placeholder="Tên khách hàng"
                        value={customerInfo.HoTen}
                        onChange={e => setCustomerInfo({ ...customerInfo, HoTen: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Số điện thoại (Bắt buộc)"
                        value={customerInfo.SDT}
                        onChange={e => setCustomerInfo({ ...customerInfo, SDT: e.target.value })}
                    />

                    <h3>💳Hình thức thanh toán</h3>
                    <select
                        value={customerInfo.PhuongThucThanhToan}
                        onChange={e => setCustomerInfo({ ...customerInfo, PhuongThucThanhToan: e.target.value })}
                    >
                        <option value="Tiền mặt">Tiền mặt</option>
                        <option value="Chuyển khoản">Chuyển khoản</option>
                        <option value="Ví điện tử">Ví điện tử (VNPay)</option>
                    </select>

                    <button className="btn-confirm-final" onClick={handleFinalConfirm}>
                        {customerInfo.PhuongThucThanhToan === "Ví điện tử" 
                            ? "TẠO QR THANH TOÁN" 
                            : "XÁC NHẬN & HOÀN TẤT"}
                    </button>
                </div>
            </div>

            {/* MODAL QR */}
            {showQRModal && (
                <div className="invoice-modal-overlay">
                    <div className="invoice-modal-content qr-modal">
                        <div className="invoice-header-title"><h2>Quét mã thanh toán</h2></div>
                        <div className="qr-content">
                            {paymentUrl ? (
                                <>
                                    <p className="qr-instruction">Quét mã bằng ứng dụng ngân hàng hoặc ví VNPAY</p>
                                    <div className="qr-wrapper">
                                        <QRCodeCanvas value={paymentUrl} size={220} level={"H"} includeMargin={true} />
                                    </div>
                                    <p className="qr-amount">Số tiền: {formatVND(total)}</p>
                                    <div className="admin-test-section">
                                        <a href={paymentUrl} className="btn-test-payment" target="_blank" rel="noreferrer">
                                            Click để nhập thẻ Test
                                        </a>
                                    </div>
                                </>
                            ) : <p>Đang tạo mã...</p>}
                        </div>
                        <div className="invoice-actions-buttons">
                            <button onClick={handlePaymentSuccess} className="btn-confirm-print-invoice">Khách đã thanh toán</button>
                            <button onClick={() => setShowQRModal(false)} className="btn-cancel-print-invoice">Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL HÓA ĐƠN */}
            {showInvoiceModal && (
                <div className="invoice-modal-overlay">
                    <div className="invoice-modal-content">
                        <div className="invoice-header-title"><h2>Xem trước hóa đơn</h2></div>
                        <div className="invoice-preview" id="invoice-print-area">
                            <div className="invoice-company-info">
                                <h2>P-COFFEE SHOP</h2>
                                <p>Địa chỉ: 180 Cao Lỗ, Quận 8, TP.HCM</p>
                                <p>Hotline: 0123 456 789</p>
                                <hr className="divider" />
                            </div>
                            <div className="invoice-title-section">
                                <h2>HÓA ĐƠN BÁN HÀNG</h2>
                                <p>Số: #{createdOrderId}</p>
                                <p>Ngày: {new Date().toLocaleString('vi-VN')}</p>
                                <p>Trạng thái: <strong>ĐÃ THANH TOÁN</strong></p>
                            </div>
                            <div className="invoice-customer-info">
                                <p><strong>Khách hàng:</strong> {customerInfo.HoTen}</p>
                                <p><strong>SĐT:</strong> {customerInfo.SDT}</p>
                                <p><strong>Thanh toán:</strong> {customerInfo.PhuongThucThanhToan}</p>
                            </div>
                            <table className="invoice-items-table">
                                <thead><tr><th>Món</th><th>SL</th><th>Thành tiền</th></tr></thead>
                                <tbody>
                                    {cart.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.TenMon} ({item.KichCo})</td>
                                            <td>{item.SoLuong}</td>
                                            <td>{formatVND(item.Gia * item.SoLuong)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot><tr><td colSpan="2"><strong>TỔNG CỘNG:</strong></td><td><strong>{formatVND(total)}</strong></td></tr></tfoot>
                            </table>
                            <div className="invoice-footer-note"><p>Cảm ơn quý khách! Hẹn gặp lại!</p></div>
                        </div>
                        <div className="invoice-actions-buttons">
                            <button onClick={confirmPrintInvoice} className="btn-confirm-print-invoice">In ngay</button>
                            <button onClick={handleSkipPrint} className="btn-cancel-print-invoice">Bỏ qua (Về danh sách)</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}