import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import DashboardLayout from "./DashboardLayout";

export default function PaymentResult() {
  const location = useLocation();
  const navigate = useNavigate();

  // Các trạng thái: 'loading' | 'success' | 'fail'
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Đang xác thực giao dịch với ngân hàng...");
  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => {
    const query = location.search;

    if (!query) {
      setStatus("fail");
      setMessage("Không tìm thấy thông tin giao dịch trả về!");
      return;
    }

    api.get(`/paymentVnPay/vnpay-return${query}`)
      .then((res) => {
        if (res.data.status === "success") {
          setStatus("success");
          setMessage("Giao dịch thành công!");
          
          const params = new URLSearchParams(query);
          setOrderInfo({
            orderId: params.get("vnp_TxnRef"),
            amount: params.get("vnp_Amount") / 100, // VNPay nhân 100 nên phải chia lại
            bankCode: params.get("vnp_BankCode"),
            date: params.get("vnp_PayDate"),
          });
        } else {
          setStatus("fail");
          setMessage("Giao dịch thất bại hoặc bị hủy bỏ.");
        }
      })
      .catch((err) => {
        console.error("Lỗi verify:", err);
        setStatus("fail");
        setMessage("Lỗi kết nối đến hệ thống xác thực.");
      });
  }, [location]);

  // Hàm điều hướng khi bấm nút
  const handleBack = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    // 2. Kiểm tra VaiTro (dựa trên Database của bạn là 'Admin' hoặc 'NhanVien')
    if (user && user.VaiTro === 'Admin') {
      navigate("/admin/orders");
    } else {
      navigate("/staff/orders");
    }
  };

  // Format tiền tệ
  const formatMoney = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format ngày giờ
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const yyyy = dateString.substring(0, 4);
    const mm = dateString.substring(4, 6);
    const dd = dateString.substring(6, 8);
    const hh = dateString.substring(8, 10);
    const min = dateString.substring(10, 12);
    return `${hh}:${min} - ${dd}/${mm}/${yyyy}`;
  };

  return (
    <DashboardLayout title="Kết Quả Thanh Toán">
      <div className="flex items-center justify-center p-4 md:p-8 animate-fade-in">
        <div className="bg-white rounded-3xl border border-coffee-100/50 shadow-xl shadow-coffee-900/5 max-w-md w-full overflow-hidden">
          {/* TRƯỜNG HỢP ĐANG TẢI */}
          {status === "loading" && (
            <div className="p-8 text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-12 h-12 border-4 border-coffee-200 border-t-gold rounded-full animate-spin"></div>
              </div>
              <h2 className="font-heading text-xl font-bold text-coffee-800">Đang xử lý giao dịch...</h2>
              <p className="text-sm text-coffee-400">Vui lòng đợi trong giây lát, không tắt hoặc reload lại trình duyệt.</p>
            </div>
          )}

          {/* TRƯỜNG HỢP THÀNH CÔNG */}
          {status === "success" && (
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-success-light text-success rounded-full flex items-center justify-center text-3xl font-bold mx-auto border border-success/10 animate-scale-in">
                ✔
              </div>
              <div className="space-y-1.5">
                <h2 className="font-heading text-2xl font-extrabold text-success">Thanh toán thành công!</h2>
                <p className="text-xs text-coffee-400 font-medium">Đơn hàng của bạn đã hoàn tất quy trình giao dịch.</p>
              </div>

              {orderInfo && (
                <div className="bg-coffee-50/50 border border-coffee-100/50 rounded-2xl p-4 text-sm text-left space-y-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-coffee-400 font-semibold uppercase tracking-wider">Mã đơn hàng</span>
                    <strong className="text-coffee-800 font-bold">#{orderInfo.orderId}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-coffee-400 font-semibold uppercase tracking-wider">Số tiền</span>
                    <strong className="text-gold font-extrabold text-base">{formatMoney(orderInfo.amount)}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-coffee-400 font-semibold uppercase tracking-wider">Ngân hàng</span>
                    <span className="text-coffee-700 font-bold uppercase">{orderInfo.bankCode}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-coffee-400 font-semibold uppercase tracking-wider">Thời gian</span>
                    <span className="text-coffee-600 font-medium font-mono">{formatDate(orderInfo.date)}</span>
                  </div>
                </div>
              )}

              <button 
                className="w-full py-3.5 bg-gradient-to-r from-coffee-700 to-coffee-600 text-white font-semibold rounded-xl text-sm hover:from-coffee-600 hover:to-coffee-500 shadow-md shadow-coffee-700/10 transition-all" 
                onClick={handleBack}
              >
                Quay lại danh sách đơn hàng
              </button>
            </div>
          )}

          {/* TRƯỜNG HỢP THẤT BẠI */}
          {status === "fail" && (
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-danger-light text-danger rounded-full flex items-center justify-center text-3xl font-bold mx-auto border border-danger/10 animate-scale-in">
                ✖
              </div>
              <div className="space-y-1.5">
                <h2 className="font-heading text-2xl font-extrabold text-danger">Thanh toán thất bại!</h2>
                <p className="text-sm text-coffee-400 px-2">{message}</p>
              </div>
              
              <button 
                className="w-full py-3.5 bg-coffee-100 hover:bg-coffee-200 text-coffee-700 font-semibold rounded-xl text-sm transition-all" 
                onClick={handleBack}
              >
                Quay lại quản lý đơn hàng
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}