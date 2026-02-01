import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import DashboardLayout from "./DashboardLayout";
import "../styles/PaymentResult.css"; 

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
      <div className="payment-result-wrapper">
        <div className={`result-card ${status}`}>
          
          {/* TRƯỜNG HỢP ĐANG TẢI */}
          {status === "loading" && (
            <div className="result-content">
              <div className="spinner-loader"></div>
              <h2>Đang xử lý...</h2>
              <p>Vui lòng đợi trong giây lát, không tắt trình duyệt.</p>
            </div>
          )}

          {/* TRƯỜNG HỢP THÀNH CÔNG */}
          {status === "success" && (
            <div className="result-content">
              <div className="icon-circle success-icon">✔</div>
              <h2 className="text-success">Thanh toán thành công!</h2>
              <p className="sub-text">Đơn hàng của bạn đã được thanh toán.</p>

              {orderInfo && (
                <div className="bill-info">
                  <div className="bill-row">
                    <span>Mã đơn hàng:</span>
                    <strong>#{orderInfo.orderId}</strong>
                  </div>
                  <div className="bill-row">
                    <span>Số tiền:</span>
                    <strong className="highlight-money">{formatMoney(orderInfo.amount)}</strong>
                  </div>
                  <div className="bill-row">
                    <span>Ngân hàng:</span>
                    <span>{orderInfo.bankCode}</span>
                  </div>
                  <div className="bill-row">
                    <span>Thời gian:</span>
                    <span>{formatDate(orderInfo.date)}</span>
                  </div>
                </div>
              )}

              <button className="btn-action btn-success" onClick={handleBack}>
                Quay lại danh sách đơn hàng
              </button>
            </div>
          )}

          {/* TRƯỜNG HỢP THẤT BẠI */}
          {status === "fail" && (
            <div className="result-content">
              <div className="icon-circle fail-icon">✖</div>
              <h2 className="text-fail">Thanh toán thất bại!</h2>
              <p className="error-msg">{message}</p>
              
              <div className="fail-actions">
                <button className="btn-action btn-secondary" onClick={handleBack}>
                  Quay lại trang chủ
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}