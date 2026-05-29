import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; 

const API_URL = import.meta.env.DEV 
  ? "http://localhost:4000" 
  : (import.meta.env.VITE_API_URL || "https://thuctapchuyennganh.onrender.com");

export default function Home() {
  const navigate = useNavigate();

  const [mons, setMons] = useState([]);
  const [loaiMons, setLoaiMons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
    checkUser();
  }, []);

  const checkUser = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
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
        monsRes.data.map(async (mon) => {
          try {
            const detailRes = await api.get(`/chitietmon/mon/${mon.MaMon}`);
            return { ...mon, chiTiet: detailRes.data };
          } catch {
            return { ...mon, chiTiet: [] };
          }
        })
      );

      setMons(monsWithDetails);
      setLoaiMons(loaiMonsRes.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Lỗi khi tải danh sách món");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (mon) => {
    if (!user) {
      alert("Vui lòng đăng nhập để thêm món vào giỏ hàng!");
      navigate('/login');
      return; 
    }

    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const sizeToAdd = mon.chiTiet[0]?.KichCo || 'Nhỏ';
    const priceToAdd = mon.chiTiet[0]?.Gia || 0;

    const existingItemIndex = cartItems.findIndex(
      (item) => item.MaMon === mon.MaMon && item.KichCo === sizeToAdd
    );

    if (existingItemIndex > -1) {
      cartItems[existingItemIndex].SoLuong += 1;
    } else {
      const itemToAdd = {
        MaMon: mon.MaMon,
        MaCTM: mon.chiTiet[0]?.MaCTM,
        TenMon: mon.TenMon,
        HinhAnh: mon.HinhAnh,
        Gia: priceToAdd,
        KichCo: sizeToAdd,
        SoLuong: 1 
      };
      cartItems.push(itemToAdd);
    }

    localStorage.setItem('cart', JSON.stringify(cartItems));
    alert(`✅ Đã thêm "${mon.TenMon} (${sizeToAdd})" vào giỏ hàng!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    setUser(null);
    alert("Đã đăng xuất thành công!");
  };

  const filteredMons = mons.filter(mon => {
    const matchSearch = mon.TenMon.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !selectedCategory || mon.MaLM === parseInt(selectedCategory);
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-cream font-sans">
      {/* Floating Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 py-3 mt-3">
          <div className="flex items-center justify-between rounded-2xl bg-white/80 backdrop-blur-lg shadow-lg shadow-coffee-900/5 px-6 py-3 border border-coffee-100">
            <h2
              className="font-heading text-2xl font-bold text-coffee-800 cursor-pointer tracking-tight hover:text-gold transition-colors"
              onClick={() => navigate("/")}
            >
              P-Coffee
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2 text-sm font-medium text-coffee-700 hover:text-coffee-900 transition-colors rounded-xl hover:bg-coffee-50"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-coffee-700 to-coffee-600 rounded-xl hover:from-coffee-600 hover:to-coffee-500 transition-all duration-300 shadow-md shadow-coffee-700/20 hover:shadow-lg hover:shadow-coffee-700/30 hover:-translate-y-0.5"
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-coffee-900 via-coffee-800 to-coffee-700 pt-28 pb-16">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-coffee-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-8 border border-white/10">
            <span className="text-gold text-sm">☕</span>
            <span className="text-cream-dark/90 text-sm font-medium tracking-wide">Premium Coffee Experience</span>
          </div>
          <h1 className="font-heading text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Chào mừng đến với
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold to-gold-light mt-2">
              P-Coffee
            </span>
          </h1>
          <p className="text-lg md:text-xl text-coffee-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            Thưởng thức cà phê tuyệt vời, được pha chế từ những hạt cà phê chọn lọc kỹ lưỡng nhất
          </p>
          <button
            onClick={() => navigate("/login")}
            className="group inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-coffee-900 bg-gradient-to-r from-gold to-gold-light rounded-2xl hover:from-gold-light hover:to-gold transition-all duration-300 shadow-xl shadow-gold/20 hover:shadow-2xl hover:shadow-gold/30 hover:-translate-y-1"
          >
            Đặt hàng ngay
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto fill-cream">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 bg-cream">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-coffee-100">
            <div className="relative flex-1 w-full">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-coffee-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm món..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-56 px-4 py-3 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-700 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all cursor-pointer"
            >
              <option value="">Tất cả danh mục</option>
              {loaiMons.map(lm => (
                <option key={lm.MaLM} value={lm.MaLM}>{lm.TenLM}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="pb-6 bg-cream">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-2">
            <button 
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${!selectedCategory ? 'bg-coffee-700 text-white shadow-md shadow-coffee-700/20' : 'bg-white text-coffee-600 hover:bg-coffee-50 border border-coffee-100'}`}
              onClick={() => setSelectedCategory("")}
            >
              Tất cả
            </button>
            {loaiMons.map(lm => (
              <button 
                key={lm.MaLM}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === lm.MaLM.toString() ? 'bg-coffee-700 text-white shadow-md shadow-coffee-700/20' : 'bg-white text-coffee-600 hover:bg-coffee-50 border border-coffee-100'}`}
                onClick={() => setSelectedCategory(lm.MaLM.toString())}
              >
                {lm.TenLM}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-12 bg-cream">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-coffee-800 mb-3">
              Sản phẩm của chúng tôi
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-gold to-gold-light rounded-full mx-auto"></div>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-coffee-200 border-t-gold rounded-full animate-spin mb-4"></div>
              <p className="text-coffee-400 font-medium">Đang tải menu...</p>
            </div>
          )}
          
          {error && (
            <div className="text-center py-10">
              <p className="text-danger bg-danger-light px-6 py-3 rounded-xl inline-block">{error}</p>
            </div>
          )}

          {!isLoading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMons.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <div className="text-6xl mb-4">☕</div>
                  <p className="text-coffee-400 text-lg">Không tìm thấy món nào phù hợp</p>
                </div>
              ) : (
                filteredMons.map((mon) => {
                  const minPrice = mon.chiTiet && mon.chiTiet.length > 0 
                    ? Math.min(...mon.chiTiet.map(ct => ct.Gia))
                    : 0;
                  const maxPrice = mon.chiTiet && mon.chiTiet.length > 0 
                    ? Math.max(...mon.chiTiet.map(ct => ct.Gia))
                    : 0;
                  
                  const displayImage = mon.HinhAnh 
                    ? `${API_URL}${mon.HinhAnh}` 
                    : '/placeholder.jpg';

                  return (
                    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-coffee-900/10 transition-all duration-500 hover:-translate-y-1 border border-coffee-100/50" key={mon.MaMon}>
                      <div className="relative overflow-hidden aspect-[4/3]">
                        <img 
                          src={displayImage} 
                          alt={mon.TenMon} 
                          onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-coffee-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        {mon.chiTiet && mon.chiTiet.length > 1 && (
                          <span className="absolute top-3 right-3 bg-gold/90 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                            {mon.chiTiet.length} sizes
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-heading text-lg font-semibold text-coffee-800 mb-1 group-hover:text-gold transition-colors">{mon.TenMon}</h3>
                        <p className="text-sm text-coffee-400 mb-1">{mon.TenLM || 'Khác'}</p>
                        {mon.MoTa && (
                          <p className="text-sm text-coffee-300 line-clamp-2 mb-3">{mon.MoTa}</p>
                        )}
                        <div className="flex items-center justify-between pt-3 border-t border-coffee-50">
                          <div>
                            {minPrice === maxPrice ? (
                              <span className="text-lg font-bold text-gold">
                                {Number(minPrice).toLocaleString('vi-VN')}đ
                              </span>
                            ) : (
                              <span className="text-sm font-bold text-gold">
                                {Number(minPrice).toLocaleString('vi-VN')}đ - {Number(maxPrice).toLocaleString('vi-VN')}đ
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={() => handleAddToCart(mon)} 
                            className="flex items-center gap-1.5 px-4 py-2 bg-coffee-700 text-white text-sm font-medium rounded-xl hover:bg-coffee-600 transition-all duration-300 hover:shadow-md hover:shadow-coffee-700/20 hover:-translate-y-0.5 active:translate-y-0"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                            </svg>
                            Thêm
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 bg-gradient-to-b from-cream to-coffee-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-coffee-800 mb-3">Thông tin quán</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-gold to-gold-light rounded-full mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-sm border border-coffee-100/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-gold/10 to-gold/5 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">📍</div>
              <h3 className="font-heading text-xl font-semibold text-coffee-800 mb-2">Địa chỉ</h3>
              <p className="text-coffee-400">123 Cafe, Quận 8, TP.HCM</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-sm border border-coffee-100/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-gold/10 to-gold/5 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">⏰</div>
              <h3 className="font-heading text-xl font-semibold text-coffee-800 mb-2">Giờ mở cửa</h3>
              <p className="text-coffee-400">08:00 AM - 10:00 PM</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-sm border border-coffee-100/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-gold/10 to-gold/5 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">📞</div>
              <h3 className="font-heading text-xl font-semibold text-coffee-800 mb-2">Liên hệ</h3>
              <p className="text-coffee-400">0123 456 789</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-coffee-900 text-coffee-200 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-heading text-2xl font-bold text-white mb-1">P-Coffee</h3>
              <p className="text-coffee-400 text-sm">Premium Coffee Experience</p>
            </div>
            <p className="text-coffee-400 text-sm">© 2024 P-Coffee. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}