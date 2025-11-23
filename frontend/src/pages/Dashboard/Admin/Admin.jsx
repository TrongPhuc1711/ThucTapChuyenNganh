import { useState } from "react";
import "../../../styles/Dashboard/Admin.css";
import { useNavigate } from "react-router-dom";
export default function Admin() {
    const navigate = useNavigate();
    return (
      <div className="admin-container">
        <header className="admin-header">
          <h1>Trang Quản Trị Hệ Thống P-Coffee</h1>
        </header>
  
        <div className="admin-content">
        <div className="admin-card">
            <h2>Quản lý món😀</h2>
            <p>Thêm, sửa, xóa sản phẩm☕</p>
            <button onClick={()=> navigate("/admin/products")}>Vào quản lý🧑‍💼</button>
          </div>
          <div className="admin-card">
            <h2>Quản lý loại món😀</h2>
            <p>Thêm, sửa, xóa sản phẩm☕</p>
            <button onClick={() => navigate("/admin/categories")} >Vào quản lý🧑‍💼</button>
          </div>
          <div className="admin-card">
            <h2>Quản lý nhân viên</h2>
            <p>Thêm hoặc chỉnh sửa thông tin nhân viên</p>
            <button onClick={() => navigate("/admin/staffs")}>Vào quản lý</button>
          </div>
  
          <div className="admin-card">
            <h2>Thống kê doanh thu</h2>
            <p>Xem báo cáo bán hàng theo ngày, tháng</p>
            <button>Xem thống kê</button>
          </div>
          
          <div className="admin-card">
            <h2>Quản lý hóa đơn</h2>
            <p>Xem hóa đơn bán hàng theo ngày, tháng.</p>
            <p>Xuất hóa đơn.</p>
            <button>Xem thống kê</button>
          </div>

          <div className="admin-card">
            <h2>Quản lý đơn hàng</h2>
            <p>Xem đơn bán hàng theo ngày, tháng.</p>
            <button onClick={()=>navigate("/admin/orders")}>Xem đơn hàng</button>
          </div>
        </div>
      </div>
    );
  }
  