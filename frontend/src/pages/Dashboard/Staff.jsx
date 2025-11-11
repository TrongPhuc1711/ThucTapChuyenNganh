import { useState } from "react";

import "../../styles/Dashboard/Staff.css";

export default function Staff() {
  return (
    <div className="staff-container">
      <h1>Trang Nhân Viên ☕</h1>
      <div className="staff-list">
        <div className="staff-card">
          <h3>Xem danh sách đơn hàng</h3>
          <p>Hiển thị tất cả đơn hàng đang xử lý.</p>
          <button>Xem ngay</button>
        </div>

        <div className="staff-card">
          <h3>Xác nhận đơn hàng</h3>
          <p>Duyệt đơn hoặc cập nhật trạng thái giao hàng.</p>
          <button>Xác nhận</button>
        </div>

        <div className="staff-card">
          <h3>In hóa đơn</h3>
          <p>Xuất hóa đơn cho khách hàng.</p>
          <button>In hóa đơn</button>
        </div>
      </div>
    </div>
  );
}
