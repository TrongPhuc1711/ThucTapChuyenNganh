import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css"; 
import api from "../services/api"; 

const API_URL = import.meta.env.VITE_API_URL;

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
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <h2 className="logo" onClick={() => navigate("/")}>P-Coffee</h2>
        <div className="header-buttons">
              <button onClick={() => navigate("/login")} className="btn-login">
                Đăng nhập
              </button>
              <button onClick={() => navigate("/register")} className="btn-register">
                Đăng ký
              </button>
        </div>
      </header>

      {/* Banner */}
      <section className="home-banner">
        <div className="banner-content">
          <h1 className="home-title">Chào mừng đến với P-Coffee</h1>
          <p className="home-subtitle">
            ☕Thưởng thức cà phê tuyệt vời, mọi lúc mọi nơi
          </p>
          <button onClick={() => navigate("/login")} className="btn-order-now">
            Đặt hàng ngay
          </button>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="filter-section">
        <div className="filter-container">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm món..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="">📋 Tất cả danh mục</option>
            {loaiMons.map(lm => (
              <option key={lm.MaLM} value={lm.MaLM}>{lm.TenLM}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Category Pills */}
      <section className="category-pills">
        <button 
          className={`pill ${!selectedCategory ? 'active' : ''}`}
          onClick={() => setSelectedCategory("")}
        >
          Tất cả
        </button>
        {loaiMons.map(lm => (
          <button 
            key={lm.MaLM}
            className={`pill ${selectedCategory === lm.MaLM.toString() ? 'active' : ''}`}
            onClick={() => setSelectedCategory(lm.MaLM.toString())}
          >
            {lm.TenLM}
          </button>
        ))}
      </section>

      {/* Products */}
      <section className="product-section">
        <h2 className="section-title">🌟 Sản phẩm của chúng tôi</h2>

        {isLoading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải món...</p>
          </div>
        )}
        
        {error && <p className="error-message">{error}</p>}

        {!isLoading && !error && (
          <div className="product-list">
            {filteredMons.length === 0 ? (
              <p className="empty-message">Không tìm thấy món nào phù hợp</p>
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
                  <div className="product-card" key={mon.MaMon}>
                    <div className="product-image-wrapper">
                      <img 
                        src={displayImage} 
                        alt={mon.TenMon} 
                        onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                      />
                      {mon.chiTiet && mon.chiTiet.length > 1 && (
                        <span className="badge-sizes">{mon.chiTiet.length} sizes</span>
                      )}
                    </div>
                    <div className="product-content">
                      <h3 className="product-name">{mon.TenMon}</h3>
                      <p className="product-category">{mon.TenLM || 'Khác'}</p>
                      {mon.MoTa && (
                        <p className="product-description">{mon.MoTa}</p>
                      )}
                      <div className="product-footer">
                        <div className="price-wrapper">
                          {minPrice === maxPrice ? (
                            <span className="price">
                              {Number(minPrice).toLocaleString('vi-VN')}đ
                            </span>
                          ) : (
                            <span className="price">
                              {Number(minPrice).toLocaleString('vi-VN')}đ - {Number(maxPrice).toLocaleString('vi-VN')}đ
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={() => handleAddToCart(mon)} 
                          className="btn-add"
                        >
                          🛒 Thêm
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </section>

      {/* Info Section */}
      <section className="info-section">
        <h2 className="section-title">📍 Thông tin quán</h2>
        <div className="info-content">
          <div className="info-card">
            <div className="info-icon">📍</div>
            <h3>Địa chỉ</h3>
            <p>123 Cafe, Quận 8, TP.HCM</p>
          </div>
          <div className="info-card">
            <div className="info-icon">⏰</div>
            <h3>Giờ mở cửa</h3>
            <p>08:00 AM - 10:00 PM</p>
          </div>
          <div className="info-card">
            <div className="info-icon">📞</div>
            <h3>Liên hệ</h3>
            <p>0123 456 789</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>© 2024 P-Coffee. All rights reserved.</p>
      </footer>
    </div>
  );
}