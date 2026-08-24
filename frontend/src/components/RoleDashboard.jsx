import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Quản lý món", path: "/admin/products", icon: Coffee },
  { label: "Quản lý loại món", path: "/admin/categories", icon: FolderTree },
  { label: "Quản lý nhân viên", path: "/admin/staffs", icon: UserCheck },
  { label: "Quản lý khách hàng", path: "/admin/customers", icon: Users },
  { label: "Thống kê doanh thu", path: "/admin/thongke", icon: BarChart3 },
  { label: "Quản lý hóa đơn", path: "/admin/bills", icon: Receipt },
  { label: "Quản lý đơn hàng", path: "/admin/orders", icon: ShoppingBag },
];

const STAFF_MENU = [
  { label: "Dashboard", path: "/staff", icon: LayoutDashboard },
  { label: "Đơn hàng", path: "/staff/orders", icon: ShoppingBag },
  { label: "Danh sách món", path: "/staff/products", icon: Coffee },
  { label: "Hóa đơn", path: "/staff/bills", icon: Receipt },
  { label: "Khách hàng", path: "/staff/customers", icon: Users },
];

export default function RoleDashboard({ role, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const menuItems = role === "Admin" ? ADMIN_MENU : STAFF_MENU;

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
    if (path === `/${role.toLowerCase()}`) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-coffee-50 flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-coffee-900/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50
          bg-coffee-900 text-white
          transition-all duration-300 ease-in-out
          flex flex-col
          ${collapsed ? "w-20" : "w-64"}
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-coffee-700/50">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gold to-gold-light rounded-xl flex items-center justify-center shadow-lg">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-heading text-lg font-bold tracking-wide">P-Coffee</h1>
                <p className="text-[10px] text-coffee-400 font-ui uppercase tracking-widest">
                  {role === "Admin" ? "Quản trị" : "Nhân viên"}
                </p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 bg-gradient-to-br from-gold to-gold-light rounded-xl flex items-center justify-center shadow-lg mx-auto">
              <Coffee className="w-5 h-5 text-white" />
            </div>
          )}
          {/* Nút đóng mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-coffee-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-none">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                  text-sm font-medium transition-all duration-200 cursor-pointer
                  ${active
                    ? "bg-gold/20 text-gold shadow-sm"
                    : "text-coffee-300 hover:bg-coffee-800 hover:text-white"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
                title={collapsed ? item.label : ""}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-gold" : ""}`} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {active && <ChevronRight className="w-4 h-4 text-gold/60" />}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info + Logout */}
        <div className="border-t border-coffee-700/50 p-3 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 bg-gradient-to-br from-gold to-gold-light rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                {user.HoTen?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user.HoTen || "Người dùng"}
                </p>
                <p className="text-xs text-coffee-400 truncate">
                  {user.Email || ""}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-sm font-medium text-coffee-400 cursor-pointer
              hover:bg-danger/10 hover:text-danger
              transition-all duration-200
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-coffee-100/50">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            {/* Left: Hamburger + Breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-coffee-50 text-coffee-600 transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex w-10 h-10 items-center justify-center rounded-xl hover:bg-coffee-50 text-coffee-400 transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Right: Quick Actions */}
            <div className="flex items-center gap-2">
              {(role === "Admin" || role === "NhanVien") && (
                <button
                  onClick={() =>
                    navigate(
                      role === "Admin"
                        ? "/admin/create-order"
                        : "/staff/create-order"
                    )
                  }
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold to-gold-light text-white text-sm font-medium rounded-xl hover:from-gold-dark hover:to-gold transition-all shadow-sm cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Tạo đơn</span>
                </button>
              )}
              <div className="w-9 h-9 bg-gradient-to-br from-coffee-700 to-coffee-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {user.HoTen?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 animate-page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}