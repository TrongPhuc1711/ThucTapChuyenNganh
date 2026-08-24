import { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Coffee,
  FolderTree,
  Users,
  UserCheck,
  BarChart3,
  Receipt,
  ShoppingBag,
  LogOut,
  Menu,
  X,
  ChevronRight,
  PlusCircle,
} from "lucide-react";

const ADMIN_MENU = [
  { label: "Tổng quan Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Quản lý món", path: "/admin/products", icon: Coffee },
  { label: "Quản lý loại món", path: "/admin/categories", icon: FolderTree },
  { label: "Quản lý nhân viên", path: "/admin/staffs", icon: UserCheck },
  { label: "Quản lý khách hàng", path: "/admin/customers", icon: Users },
  { label: "Thống kê doanh thu", path: "/admin/thongke", icon: BarChart3 },
  { label: "Quản lý hóa đơn", path: "/admin/bills", icon: Receipt },
  { label: "Quản lý đơn hàng", path: "/admin/orders", icon: ShoppingBag },
];

const STAFF_MENU = [
  { label: "Tổng quan Quầy", path: "/staff", icon: LayoutDashboard },
  { label: "Xử lý đơn hàng", path: "/staff/orders", icon: ShoppingBag },
  { label: "Danh sách món", path: "/staff/products", icon: Coffee },
  { label: "Tra cứu hóa đơn", path: "/staff/bills", icon: Receipt },
  { label: "Khách hàng thân thiết", path: "/staff/customers", icon: Users },
];

export default function RoleDashboard({ role, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  // Chuẩn hóa role không phân biệt hoa thường
  const normalizedRole = (role || user.VaiTro || "").toLowerCase() === "admin" ? "Admin" : "NhanVien";
  const isAdmin = normalizedRole === "Admin";
  const menuItems = isAdmin ? ADMIN_MENU : STAFF_MENU;

  // Đóng sidebar khi chuyển trang (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/admin" || path === "/staff") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex font-sans">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50
          bg-[#1A0F0A] text-white
          transition-all duration-300 ease-in-out
          flex flex-col border-r border-white/5
          ${collapsed ? "w-20" : "w-64"}
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#C5963A] to-[#D4A84B] rounded-2xl flex items-center justify-center shadow-lg text-[#1A0F0A] font-bold">
                <Coffee className="w-5 h-5 text-[#1A0F0A]" />
              </div>
              <div>
                <h1 className="font-serif text-lg font-black tracking-wide text-white">P-Coffee</h1>
                <p className="text-[10px] text-[#C5963A] font-bold uppercase tracking-widest">
                  {isAdmin ? "QUẢN TRỊ VIÊN (ADMIN)" : "NHÂN VIÊN QUẦY"}
                </p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 bg-gradient-to-br from-[#C5963A] to-[#D4A84B] rounded-2xl flex items-center justify-center shadow-lg mx-auto text-[#1A0F0A]">
              <Coffee className="w-5 h-5 text-[#1A0F0A]" />
            </div>
          )}
          {/* Nút đóng mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 text-white/70 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto scrollbar-none">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl
                  text-xs font-semibold transition-all duration-200 cursor-pointer
                  ${active
                    ? "bg-[#C5963A] text-[#1A0F0A] font-bold shadow-md shadow-[#C5963A]/20"
                    : "text-[#D7CCC8] hover:bg-white/10 hover:text-white"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
                title={collapsed ? item.label : ""}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-[#1A0F0A]" : "text-[#C5963A]"}`} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {active && <ChevronRight className="w-3.5 h-3.5 text-[#1A0F0A]" />}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info + Logout */}
        <div className="border-t border-white/10 p-3 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-2xl">
              <div className="w-9 h-9 bg-gradient-to-br from-[#C5963A] to-[#D4A84B] rounded-xl flex items-center justify-center text-xs font-bold text-[#1A0F0A] shadow-md">
                {user.HoTen?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {user.HoTen || "Admin"}
                </p>
                <p className="text-[11px] text-[#A1887F] truncate font-mono">
                  {user.Email || "admin@pcoffee.com"}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl
              text-xs font-semibold text-rose-400 cursor-pointer
              hover:bg-rose-500/15 hover:text-rose-300
              transition-all duration-200
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#EFEBE9]">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            {/* Left: Hamburger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-[#FAF7F2] text-[#2C1810] hover:bg-[#EFEBE9] transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex w-9 h-9 items-center justify-center rounded-xl bg-[#FAF7F2] text-[#6D4C41] hover:bg-[#EFEBE9] transition-colors cursor-pointer"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>

            {/* Right: POS Button + Avatar */}
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  navigate(
                    isAdmin
                      ? "/admin/create-order"
                      : "/staff/create-order"
                  )
                }
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C5963A] to-[#D4A84B] hover:from-[#B8872D] hover:to-[#C5963A] text-[#1A0F0A] text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Bán Tại Quầy (POS)</span>
              </button>
              
              <div className="w-9 h-9 bg-gradient-to-br from-[#2C1810] to-[#4E342E] rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user.HoTen?.[0]?.toUpperCase() || "A"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 animate-fade-in">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}