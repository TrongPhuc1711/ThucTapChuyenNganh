
import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

import "../styles/Dashboard/RoleLayout.css"; 

export default function RoleLayout({ role = "staff" }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Định nghĩa menu
  const MENUS = {
    admin: [
      { path: "/admin", icon: "🏠", title: "Dashboard" },
      { path: "/admin/products", icon: "☕", title: "Quản lý món" },
      { path: "/admin/categories", icon: "📋", title: "Quản lý loại" },
      { path: "/admin/staffs", icon: "👨‍💼", title: "Nhân viên" },
      { path: "/admin/customers", icon: "👥", title: "Khách hàng" },
      { path: "/admin/thongke", icon: "📊", title: "Thống kê" },
      { path: "/admin/bills", icon: "🧾", title: "Hóa đơn" },
      { path: "/admin/orders", icon: "📦", title: "Đơn hàng" }
    ],
    staff: [
      { path: "/staff", icon: "🏠", title: "Dashboard" },
      { path: "/staff/products", icon: "☕", title: "Danh sách món" },
      { path: "/staff/orders", icon: "📦", title: "Đơn hàng" },
      { path: "/staff/bills", icon: "🧾", title: "Hóa đơn" },
      { path: "/staff/customers", icon: "👥", title: "Khách hàng" }
    ]
  };

  const currentMenu = MENUS[role] || MENUS.staff;

  const handleLogout = () => {
    const confirm = window.confirm("Bạn muốn đăng xuất?");
    if (confirm) navigate("/");
  };

  return (
    <div className="layout-container">
      {/* SIDEBAR */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : "collapsed"}`}>
        {/* Nút Toggle */}
        <button 
          className="toggle-btn" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title={isSidebarOpen ? "Thu gọn" : "Mở rộng"}
        >
          {isSidebarOpen ? "◀" : "▶"}
        </button>

        {/* Logo */}
        <div className="logo-area">
            {isSidebarOpen ? (
                <>
                    <h2>P-Coffee ☕</h2>
                    <small>{role === 'admin' ? 'Administrator' : 'Staff Mode'}</small>
                </>
            ) : (
                <h2>P_C</h2>
            )}
        </div>

        {/* Menu Navigation */}
        <nav className="nav-menu">
          {currentMenu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div 
                key={item.path} 
                onClick={() => navigate(item.path)}
                className={`menu-item ${isActive ? "active" : ""}`}
              >
                <span className="menu-icon">{item.icon}</span>
                {isSidebarOpen && <span>{item.title}</span>}
              </div>
            );
          })}
        </nav>

        {/* Nút Logout */}
        <div className="logout-wrapper">
            <button className="logout-btn" onClick={handleLogout}>
                <span></span> 
                {isSidebarOpen && "Đăng xuất"}
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="main-wrapper">
        <header className="top-header">
            <h3>Hệ thống quản lý P-Coffee</h3>
            <div className="user-info">
                <span>Xin chào, <b>{role === 'admin' ? 'Admin' : 'Nhân viên'}</b></span>
                <div className="avatar-circle"></div>
            </div>
        </header>

        <main className="page-content">
           <Outlet /> 
        </main>
      </div>
    </div>
  );
}