import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Coffee,
  ShoppingBag,
  User,
  LogIn,
  UserPlus,
  Search,
  MapPin,
  Clock,
  Phone,
  ArrowRight,
  Plus,
  Minus,
  Flame,
  Award,
  X,
  Check,
  Sparkles
} from "lucide-react";
import api from "../services/api";
import { ToastProvider, useToast } from "../components/ui/Toast";

const API_URL = import.meta.env.DEV 
  ? "http://localhost:4000" 
  : (import.meta.env.VITE_API_URL || "https://thuctapchuyennganh.onrender.com");

function HomeContent() {
  const navigate = useNavigate();
  const toast = useToast();

  const [mons, setMons] = useState([]);
  const [loaiMons, setLoaiMons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  // Quick View / Size Selection Modal State
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);
  const [modalSelectedSize, setModalSelectedSize] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);

  useEffect(() => {
    loadData();
    checkUser();
    updateCartBadge();
  }, []);

  const checkUser = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser(null);
      }
    }
  };

  const updateCartBadge = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const totalItems = cart.reduce((acc, item) => acc + (item.SoLuong || 1), 0);
      setCartCount(totalItems);
    } catch {
      setCartCount(0);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [monsRes, loaiMonsRes] = await Promise.all([
        api.get("/mon"),
        api.get("/loaimon")
      ]);

      const monsWithDetails = await Promise.all(
        (monsRes.data || []).map(async (mon) => {
          try {
            const detailRes = await api.get(`/chitietmon/mon/${mon.MaMon}`);
            return { ...mon, chiTiet: detailRes.data || [] };
          } catch {
            return { ...mon, chiTiet: [] };
          }
        })
      );

      setMons(monsWithDetails);
      setLoaiMons(loaiMonsRes.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối đến máy chủ backend. Vui lòng kiểm tra lại server!");
    } finally {
      setIsLoading(false);
    }
  };

  const openProductModal = (mon) => {
    setSelectedProductForModal(mon);
    setModalQuantity(1);
    if (mon.chiTiet && mon.chiTiet.length > 0) {
      setModalSelectedSize(mon.chiTiet[0]);
    } else {
      setModalSelectedSize(null);
    }
  };

  const handleModalAddToCart = () => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để thêm món vào giỏ hàng!");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    if (!selectedProductForModal || !modalSelectedSize) {
      toast.error("Vui lòng chọn kích cỡ món!");
      return;
    }

    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    const sizeToAdd = modalSelectedSize.KichCo;
    const priceToAdd = modalSelectedSize.Gia;

    const existingItemIndex = cartItems.findIndex(
      (item) => item.MaMon === selectedProductForModal.MaMon && item.KichCo === sizeToAdd
    );

    if (existingItemIndex > -1) {
      cartItems[existingItemIndex].SoLuong += modalQuantity;
    } else {
      const itemToAdd = {
        MaMon: selectedProductForModal.MaMon,
        MaCTM: modalSelectedSize.MaCTM,
        TenMon: selectedProductForModal.TenMon,
        HinhAnh: selectedProductForModal.HinhAnh,
        Gia: priceToAdd,
        KichCo: sizeToAdd,
        SoLuong: modalQuantity
      };
      cartItems.push(itemToAdd);
    }

    localStorage.setItem("cart", JSON.stringify(cartItems));
    updateCartBadge();
    toast.success(`Đã thêm ${modalQuantity}x "${selectedProductForModal.TenMon} (${sizeToAdd})" vào giỏ hàng!`);
    setSelectedProductForModal(null);
  };

  const getProductImage = (hinhAnh) => {
    if (!hinhAnh) {
      return "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop";
    }
    if (hinhAnh.startsWith("http")) return hinhAnh;
    return `${API_URL}${hinhAnh.startsWith("/") ? "" : "/"}${hinhAnh}`;
  };

  const formatPrice = (amount) => {
    return Number(amount || 0).toLocaleString("vi-VN") + " đ";
  };

  const filteredMons = mons.filter((mon) => {
    const matchSearch = mon.TenMon.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !selectedCategory || mon.MaLM === parseInt(selectedCategory);
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F5] text-[#2C1810] flex flex-col font-sans selection:bg-[#C5963A] selection:text-white">
      
      {/* 🌟 HEADER FULL-WIDTH CỐ ĐỊNH SANG TRỌNG */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1A0F0A]/95 backdrop-blur-md border-b border-white/10 text-white transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div 
            onClick={() => {
              setSelectedCategory("");
              setSearchTerm("");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }} 
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#C5963A] to-[#D4A84B] flex items-center justify-center text-[#1A0F0A] shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Coffee className="w-6 h-6 text-[#1A0F0A]" />
            </div>
            <div>
              <span className="font-serif text-2xl font-black tracking-tight text-white block leading-none">
                P-COFFEE
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#D7CCC8]">
            <a href="#menu" className="hover:text-[#C5963A] transition-colors">Menu Đặc Sắc</a>
            <a href="#about" className="hover:text-[#C5963A] transition-colors">Về P-Coffee</a>
            <a href="#contact" className="hover:text-[#C5963A] transition-colors">Liên Hệ</a>
          </nav>

          {/* User Controls */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/customer")}
                  className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors border border-white/15 cursor-pointer"
                  title="Giỏ hàng"
                >
                  <ShoppingBag className="w-5 h-5 text-[#C5963A]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-[#C5963A] text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md animate-scale-in">
                      {cartCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => navigate(user.VaiTro === "Admin" ? "/admin" : user.VaiTro === "NhanVien" ? "/staff" : "/customer")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-medium transition-all shadow-md cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#C5963A]" />
                  <span className="hidden sm:inline font-semibold">{user.HoTen || "Tài khoản"}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-[#D7CCC8] hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập</span>
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#C5963A] to-[#D4A84B] hover:from-[#B8872D] hover:to-[#C5963A] text-[#1A0F0A] text-sm font-bold rounded-xl shadow-md shadow-[#C5963A]/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Đăng ký</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ☕ HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-b from-[#1E110A] via-[#2C1810] to-[#1E110A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-serif font-bold text-white tracking-normal leading-[1.15]">
                Đậm Đà Vị Nguyên Bản, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A84B] via-[#F3E5AB] to-[#C5963A]">
                  Đánh Thức Mọi Giác Quan
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#D7CCC8] max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Trải nghiệm những ly cà phê thủ công chuẩn gu từ nông trường Tây Nguyên, hòa quyện với phong cách pha chế hiện đại.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  href="#menu"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#C5963A] to-[#D4A84B] hover:from-[#B8872D] hover:to-[#C5963A] text-[#1A0F0A] font-bold text-sm rounded-2xl shadow-xl shadow-[#C5963A]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>Khám Phá Menu Ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <button
                  onClick={() => navigate(user ? "/customer" : "/login")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-white font-semibold text-sm rounded-2xl transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#C5963A]" />
                  <span>Đặt Trực Tuyến</span>
                </button>
              </div>
            </div>

            {/* Right Card / Visual */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md aspect-[4/3] sm:aspect-square rounded-3xl overflow-hidden p-2 bg-gradient-to-b from-white/15 to-transparent border border-white/10 backdrop-blur-xl shadow-2xl">
                <div className="w-full h-full rounded-[22px] overflow-hidden relative group">
                  <img
                    src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000&auto=format&fit=crop"
                    alt="P-Coffee Signature"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A0F0A] via-transparent to-transparent"></div>
                  
                  {/* Floating badge inside image */}
                  <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-white/95 backdrop-blur-md text-[#2C1810] shadow-lg border border-white/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#C5963A] block">Best Seller</span>
                        <h4 className="font-bold text-base text-[#2C1810]">Cà Phê Muối Hoàng Gia</h4>
                      </div>
                      <span className="font-bold text-lg text-[#C5963A]">35.000đ</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 🔍 SEARCH & FILTER BAR */}
      <section id="menu" className="relative -mt-6 z-20 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="p-4 sm:p-5 bg-white rounded-3xl shadow-[0_12px_40px_rgb(44,24,16,0.06)] border border-[#EFEBE9] flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1887F]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm cà phê, trà, sinh tố..."
              className="w-full pl-11 pr-4 py-3 bg-[#FAF7F2] border border-[#EFEBE9] rounded-2xl text-sm font-medium text-[#2C1810] placeholder-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#C5963A]/40 focus:border-[#C5963A] transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-auto flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-64 px-4 py-3 bg-[#FAF7F2] border border-[#EFEBE9] rounded-2xl text-sm font-semibold text-[#4E342E] focus:outline-none focus:ring-2 focus:ring-[#C5963A]/40 focus:border-[#C5963A] transition-all cursor-pointer"
            >
              <option value="">Tất cả danh mục ({mons.length} món)</option>
              {loaiMons.map((cat) => (
                <option key={cat.MaLM} value={cat.MaLM}>{cat.TenLM}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2.5 overflow-x-auto py-5 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
              !selectedCategory 
                ? "bg-[#2C1810] text-[#C5963A] shadow-md shadow-[#2C1810]/20" 
                : "bg-white text-[#6D4C41] border border-[#EFEBE9] hover:bg-[#FAF7F2]"
            }`}
          >
            TẤT CẢ MÓN ({mons.length})
          </button>
          {loaiMons.map((cat) => {
            const isActive = selectedCategory === cat.MaLM.toString();
            const count = mons.filter(m => m.MaLM === cat.MaLM).length;
            return (
              <button
                key={cat.MaLM}
                onClick={() => setSelectedCategory(cat.MaLM.toString())}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? "bg-[#2C1810] text-[#C5963A] shadow-md shadow-[#2C1810]/20"
                    : "bg-white text-[#6D4C41] border border-[#EFEBE9] hover:bg-[#FAF7F2]"
                }`}
              >
                <span>{cat.TenLM.toUpperCase()}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-[#C5963A]/20 text-[#C5963A]' : 'bg-[#FAF7F2] text-[#8D6E63]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 📦 PRODUCTS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-5 border border-[#EFEBE9] animate-pulse space-y-4">
                <div className="w-full aspect-[4/3] bg-[#EFEBE9] rounded-2xl"></div>
                <div className="h-5 bg-[#EFEBE9] rounded w-3/4"></div>
                <div className="h-3.5 bg-[#FAF7F2] rounded w-1/2"></div>
                <div className="flex justify-between items-center pt-2">
                  <div className="h-6 bg-[#EFEBE9] rounded w-1/3"></div>
                  <div className="w-10 h-10 bg-[#EFEBE9] rounded-2xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-10 text-center bg-white rounded-3xl border border-red-100 max-w-lg mx-auto shadow-sm my-8">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">!</div>
            <h3 className="font-serif font-bold text-lg text-[#2C1810] mb-1.5">{error}</h3>
            <p className="text-xs text-[#8D6E63] mb-5">Đang kết nối đến {API_URL}/api</p>
            <button 
              onClick={loadData}
              className="px-6 py-2.5 bg-[#2C1810] text-white text-xs font-bold rounded-2xl hover:bg-[#4E342E] transition-all cursor-pointer"
            >
              Thử tải lại
            </button>
          </div>
        ) : filteredMons.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-[#EFEBE9] p-8 my-4 shadow-sm">
            <Coffee className="w-14 h-14 text-[#A1887F] mx-auto mb-3 opacity-40" />
            <h3 className="font-serif font-bold text-xl text-[#2C1810]">Không tìm thấy món nước phù hợp</h3>
            <p className="text-xs text-[#8D6E63] mt-1">Hãy thử tìm với từ khóa khác hoặc chuyển sang danh mục khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMons.map((mon) => {
              const minPrice = mon.chiTiet && mon.chiTiet.length > 0 
                ? Math.min(...mon.chiTiet.map(ct => ct.Gia))
                : 0;
              
              const displayImage = getProductImage(mon.HinhAnh);

              return (
                <div 
                  key={mon.MaMon} 
                  onClick={() => openProductModal(mon)}
                  className="group bg-white rounded-3xl overflow-hidden border border-[#EFEBE9] shadow-sm hover:shadow-xl hover:shadow-[#2C1810]/8 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Image Area */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#FAF7F2]">
                      <img 
                        src={displayImage} 
                        alt={mon.TenMon}
                        onError={(e) => { 
                          e.target.src = "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop"; 
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-bold text-[#4E342E] shadow-sm">
                        {mon.TenLM || "Cà phê"}
                      </span>
                      {mon.chiTiet?.length > 1 && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 bg-[#1A0F0A]/85 backdrop-blur-md text-white text-[9px] font-bold rounded-full">
                          {mon.chiTiet.length} size
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-serif text-base font-bold text-[#2C1810] group-hover:text-[#C5963A] transition-colors line-clamp-1">
                        {mon.TenMon}
                      </h3>
                      <p className="text-xs text-[#8D6E63] line-clamp-2 mt-1 leading-relaxed font-light min-h-[32px]">
                        {mon.MoTa || "Hương vị đậm đà thơm ngon đặc trưng của P-Coffee"}
                      </p>

                      {/* Sizes Preview Pills */}
                      {mon.chiTiet && mon.chiTiet.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#FAF7F2]">
                          {mon.chiTiet.map(ct => (
                            <span 
                              key={ct.MaCTM}
                              className="px-2.5 py-0.5 bg-[#FAF7F2] text-[#6D4C41] border border-[#EFEBE9] rounded-lg text-[10px] font-semibold"
                            >
                              Size {ct.KichCo}: {Number(ct.Gia).toLocaleString("vi-VN")}đ
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="px-5 pb-5 pt-1 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-[#A1887F] font-bold uppercase tracking-wider block">Giá từ</span>
                      <span className="font-serif text-lg font-black text-[#C5963A]">
                        {formatPrice(minPrice)}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openProductModal(mon);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-[#2C1810] to-[#4E342E] group-hover:from-[#C5963A] group-hover:to-[#D4A84B] text-white group-hover:text-[#1A0F0A] font-bold text-xs rounded-xl transition-all duration-300 shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Chọn Size</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 🌟 ABOUT & BRAND VALUE */}
      <section id="about" className="py-16 bg-white border-t border-[#EFEBE9] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-[#C5963A] uppercase tracking-[0.2em] block">Sứ Mệnh Của Chúng Tôi</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C1810]">
              Tại Sao Nên Chọn P-Coffee?
            </h2>
            <div className="w-12 h-0.5 bg-[#C5963A] rounded-full mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#FAF7F2] border border-[#EFEBE9]">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2C1810] to-[#4E342E] flex items-center justify-center text-white mb-4 shadow-md">
                <Flame className="w-6 h-6 text-[#C5963A]" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#2C1810] mb-2">Rang Xay Mộc 100%</h3>
              <p className="text-xs text-[#6D4C41] leading-relaxed">
                Không tẩm ướp phụ gia hay hóa chất. Giữ trọn tinh hoa và hương thơm nguyên bản của hạt cà phê Tây Nguyên.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAF7F2] border border-[#EFEBE9]">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2C1810] to-[#4E342E] flex items-center justify-center text-white mb-4 shadow-md">
                <Award className="w-6 h-6 text-[#C5963A]" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#2C1810] mb-2">Công Thức Độc Quyền</h3>
              <p className="text-xs text-[#6D4C41] leading-relaxed">
                Đội ngũ Barista tâm huyết sáng tạo nên các món best-seller như Cà Phê Muối, Cà Phê Trứng, Trà Trái Cây tươi mới.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAF7F2] border border-[#EFEBE9]">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2C1810] to-[#4E342E] flex items-center justify-center text-white mb-4 shadow-md">
                <Clock className="w-6 h-6 text-[#C5963A]" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#2C1810] mb-2">Phục Vụ Siêu Tốc</h3>
              <p className="text-xs text-[#6D4C41] leading-relaxed">
                Đơn hàng tại quầy và online đều được xử lý chỉ trong 5-10 phút để món nước luôn giữ được hương vị tươi ngon nhất.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 📍 CONTACT & FOOTER */}
      <footer id="contact" className="bg-[#1A0F0A] text-white pt-12 pb-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/10">
            
            {/* Brand column */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C5963A] to-[#D4A84B] flex items-center justify-center text-[#1A0F0A] shadow-md font-bold">
                  <Coffee className="w-5 h-5 text-[#1A0F0A]" />
                </div>
                <span className="font-serif text-xl font-bold tracking-tight text-white">
                  P-COFFEE
                </span>
              </div>
              <p className="text-xs text-[#A1887F] max-w-sm leading-relaxed">
                Điểm đến lý tưởng cho những tín đồ say mê hương vị cà phê mộc và không gian làm việc truyền cảm hứng.
              </p>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <h4 className="font-serif font-bold text-sm text-white">Địa Chỉ Quán</h4>
              <div className="flex items-start gap-2 text-xs text-[#D7CCC8]">
                <MapPin className="w-4 h-4 text-[#C5963A] flex-shrink-0 mt-0.5" />
                <span>180 Cao Lỗ, Phường 4, Quận 8, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#D7CCC8]">
                <Clock className="w-4 h-4 text-[#C5963A] flex-shrink-0" />
                <span>07:00 AM – 22:30 PM (Mỗi ngày)</span>
              </div>
            </div>

            {/* Contact info */}
            <div className="space-y-2">
              <h4 className="font-serif font-bold text-sm text-white">Liên Hệ & Hỗ Trợ</h4>
              <div className="flex items-center gap-2 text-xs text-[#D7CCC8]">
                <Phone className="w-4 h-4 text-[#C5963A] flex-shrink-0" />
                <span>0123 456 789</span>
              </div>
              <p className="text-[11px] text-[#A1887F] pt-1">
                Hỗ trợ đặt tiệc, sự kiện hoặc mua cà phê hạt số lượng lớn.
              </p>
            </div>

          </div>

          <div className="pt-6 text-center text-[11px] text-[#8D6E63]">
            <p>© {new Date().getFullYear()} P-Coffee. Bản quyền thuộc về P-Coffee Roastery.</p>
          </div>
        </div>
      </footer>

      {/* ☕ MODAL CHỌN SIZE & SỐ LƯỢNG MÓN (QUICK BUY MODAL) */}
      {selectedProductForModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedProductForModal(null)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#FAF7F2] flex items-center justify-between bg-[#FAF7F2]/60">
              <div>
                <span className="text-[10px] font-bold text-[#C5963A] uppercase tracking-wider block">
                  {selectedProductForModal.TenLM || "Cà Phê"}
                </span>
                <h3 className="font-serif text-xl font-bold text-[#2C1810]">
                  {selectedProductForModal.TenMon}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedProductForModal(null)} 
                className="w-9 h-9 rounded-2xl bg-white hover:bg-[#EFEBE9] text-[#6D4C41] flex items-center justify-center transition-colors cursor-pointer border border-[#EFEBE9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Product Preview */}
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#EFEBE9]">
                <img 
                  src={getProductImage(selectedProductForModal.HinhAnh)} 
                  alt={selectedProductForModal.TenMon} 
                  className="w-full h-full object-cover" 
                />
              </div>

              {selectedProductForModal.MoTa && (
                <p className="text-xs text-[#6D4C41] leading-relaxed bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#EFEBE9]">
                  {selectedProductForModal.MoTa}
                </p>
              )}

              {/* Sizes Selection */}
              <div>
                <label className="block text-xs font-bold text-[#2C1810] uppercase tracking-wider mb-2.5">
                  Chọn kích cỡ (Size) *
                </label>
                {selectedProductForModal.chiTiet && selectedProductForModal.chiTiet.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {selectedProductForModal.chiTiet.map((detail) => {
                      const isSelected = modalSelectedSize?.MaCTM === detail.MaCTM;
                      return (
                        <button
                          key={detail.MaCTM}
                          type="button"
                          onClick={() => setModalSelectedSize(detail)}
                          className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                            isSelected
                              ? 'border-[#C5963A] bg-[#C5963A]/10 text-[#2C1810] shadow-sm ring-2 ring-[#C5963A]/30'
                              : 'border-[#EFEBE9] hover:bg-[#FAF7F2] text-[#6D4C41]'
                          }`}
                        >
                          <span className="text-xs font-bold">Size {detail.KichCo}</span>
                          <span className="font-serif font-black text-sm text-[#C5963A]">
                            {formatPrice(detail.Gia)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[#A1887F] italic">Món này chưa có cấu hình kích cỡ.</p>
                )}
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between pt-2 border-t border-[#FAF7F2]">
                <span className="text-xs font-bold text-[#2C1810] uppercase tracking-wider">
                  Số lượng:
                </span>
                <div className="flex items-center bg-[#FAF7F2] border border-[#EFEBE9] rounded-2xl p-1">
                  <button 
                    onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                    className="w-8 h-8 rounded-xl bg-white hover:bg-[#EFEBE9] flex items-center justify-center text-[#2C1810] transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-serif font-bold text-sm text-[#2C1810]">
                    {modalQuantity}
                  </span>
                  <button 
                    onClick={() => setModalQuantity(modalQuantity + 1)}
                    className="w-8 h-8 rounded-xl bg-white hover:bg-[#EFEBE9] flex items-center justify-center text-[#2C1810] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-[#FAF7F2] bg-[#FAF7F2]/60 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-[#8D6E63] block">Tổng tạm tính</span>
                <span className="font-serif text-xl font-black text-[#C5963A]">
                  {formatPrice((modalSelectedSize?.Gia || 0) * modalQuantity)}
                </span>
              </div>

              <button
                onClick={handleModalAddToCart}
                disabled={!modalSelectedSize}
                className="flex-1 py-3.5 px-6 bg-gradient-to-r from-[#C5963A] to-[#D4A84B] hover:from-[#B8872D] hover:to-[#C5963A] text-[#1A0F0A] font-bold text-sm rounded-2xl shadow-lg shadow-[#C5963A]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Thêm Vào Giỏ Hàng</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <HomeContent />
    </ToastProvider>
  );
}