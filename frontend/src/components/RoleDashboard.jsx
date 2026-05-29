
import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

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
    <div className="flex h-screen bg-coffee-50 font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-coffee-900 via-coffee-800 to-coffee-900 flex flex-col transition-all duration-300 ease-out relative shadow-2xl shadow-coffee-900/50 flex-shrink-0`}
      >
        {/* Toggle Button */}
        <button
          className="absolute -right-3 top-7 w-6 h-6 bg-gold text-coffee-900 rounded-full flex items-center justify-center text-xs font-bold shadow-lg hover:bg-gold-light transition-all z-10 hover:scale-110"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title={isSidebarOpen ? "Thu gọn" : "Mở rộng"}
        >
          {isSidebarOpen ? "◀" : "▶"}
        </button>

        {/* Logo */}
        <div className={`px-5 py-6 border-b border-coffee-700/30 ${isSidebarOpen ? '' : 'px-3'}`}>
          {isSidebarOpen ? (
            <div className="animate-fade-in">
              <h2 className="font-heading text-2xl font-bold text-white tracking-tight">P-Coffee ☕</h2>
              <p className="text-coffee-400 text-xs mt-1 font-medium tracking-wider uppercase">
                {role === 'admin' ? 'Administrator' : 'Staff Mode'}
              </p>
            </div>
          ) : (
            <h2 className="font-heading text-xl font-bold text-gold text-center">P</h2>
          )}
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {currentMenu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                  isActive
                    ? "bg-gold/15 text-gold shadow-sm"
                    : "text-coffee-300 hover:bg-white/5 hover:text-white"
                } ${!isSidebarOpen ? 'justify-center px-2' : ''}`}
                title={!isSidebarOpen ? item.title : ''}
              >
                <span className={`text-lg flex-shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                  {item.icon}
                </span>
                {isSidebarOpen && (
                  <span className={`text-sm font-medium whitespace-nowrap ${isActive ? 'text-gold' : ''}`}>
                    {item.title}
                  </span>
                )}
                {isActive && isSidebarOpen && (
                  <div className="ml-auto w-1.5 h-1.5 bg-gold rounded-full"></div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-coffee-700/30">
          <button
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-coffee-400 hover:bg-danger/10 hover:text-danger transition-all duration-200 ${!isSidebarOpen ? 'justify-center px-2' : ''}`}
            onClick={handleLogout}
          >
            <span className="text-lg flex-shrink-0">🚪</span>
            {isSidebarOpen && <span className="text-sm font-medium">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white/80 backdrop-blur-lg border-b border-coffee-100 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
          <h3 className="text-coffee-700 font-semibold text-lg">
            Hệ thống quản lý <span className="text-gold font-heading">P-Coffee</span>
          </h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-coffee-500">
              Xin chào, <b className="text-coffee-700">{role === 'admin' ? 'Admin' : 'Nhân viên'}</b>
            </span>
            <div className="w-9 h-9 bg-gradient-to-br from-gold to-gold-dark rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md shadow-gold/20">
              {role === 'admin' ? 'A' : 'S'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-coffee-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}