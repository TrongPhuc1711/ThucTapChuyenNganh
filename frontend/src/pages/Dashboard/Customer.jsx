import { useState, useEffect } from "react";
import api from "../../services/api";
import "../../styles/Dashboard/Customer.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function Customer() {
  const [mons, setMons] = useState([]);
  const [loaiMons, setLoaiMons] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [selectedMon, setSelectedMon] = useState(null);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
    loadUser();
    loadCartFromStorage();
  }, []);

  const loadUser = () => {
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
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCartToStorage = (newCart) => {
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const handleAddToCart = (mon) => {
    if (mon.chiTiet && mon.chiTiet.length > 1) {
      setSelectedMon(mon);
      setShowSizeModal(true);
    } else if (mon.chiTiet && mon.chiTiet.length === 1) {
      addToCartWithSize(mon, mon.chiTiet[0]);
    } else {
      alert("Món này chưa có giá!");
    }
  };

  const addToCartWithSize = (mon, chiTiet) => {
    const cartItem = {
      MaMon: mon.MaMon,
      MaCTM: chiTiet.MaCTM,
      TenMon: mon.TenMon,
      KichCo: chiTiet.KichCo,
      Gia: chiTiet.Gia,
      HinhAnh: mon.HinhAnh,
      SoLuong: 1
    };

    const existingIndex = cart.findIndex(
      item => item.MaCTM === chiTiet.MaCTM
    );

    let newCart;
    if (existingIndex >= 0) {
      newCart = [...cart];
      newCart[existingIndex].SoLuong += 1;
    } else {
      newCart = [...cart, cartItem];
    }

    setCart(newCart);
    saveCartToStorage(newCart);
    setShowSizeModal(false);
    setSelectedMon(null);
  };

  const updateQuantity = (index, delta) => {
    const newCart = [...cart];
    newCart[index].SoLuong += delta;
    
    if (newCart[index].SoLuong <= 0) {
      newCart.splice(index, 1);
    }
    
    setCart(newCart);
    saveCartToStorage(newCart);
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    saveCartToStorage(newCart);
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.Gia * item.SoLuong), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Giỏ hàng trống!");
      return;
    }

    if (!user) {
      alert("Vui lòng đăng nhập để thanh toán!");
      return;
    }

    try {
      const orderData = {
        MaND: user.MaND,
        TongTien: getTotalPrice(),
        ChiTietDonHang: cart.map(item => ({
          MaCTM: item.MaCTM,
          SoLuong: item.SoLuong,
          DonGia: item.Gia
        }))
      };

      await api.post("/donhang", orderData);
      alert("✅ Đặt hàng thành công!");
      setCart([]);
      saveCartToStorage([]);
      setShowCart(false);
    } catch (err) {
      alert("❌ Lỗi khi đặt hàng: " + (err.response?.data?.message || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const filteredMons = mons.filter(mon => {
    const matchSearch = mon.TenMon.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !selectedCategory || mon.MaLM === parseInt(selectedCategory);
    return matchSearch && matchCategory;
  });

  return (
    <div className="container">
      {/* 2. Thẻ <style> đã được xóa */}

      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h2 className="logo">☕ P-Coffee</h2>
        </div>
        <div className="header-right">
          <span className="user-name">Xin chào, {user?.HoTen || 'Khách'}</span>
          <button onClick={() => setShowCart(!showCart)} className="cart-button">
            🛒 Giỏ hàng ({cart.length})
          </button>
          <button onClick={handleLogout} className="logout-button">
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Search & Filter Bar */}
      <div className="filter-bar">
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
          <option value="">Tất cả loại món</option>
          {loaiMons.map(lm => (
            <option key={lm.MaLM} value={lm.MaLM}>{lm.TenLM}</option>
          ))}
        </select>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Product List */}
        <div className="product-section">
          {isLoading ? (
            <p className="loading-text">Đang tải món...</p>
          ) : filteredMons.length === 0 ? (
            <p className="empty-text">Không tìm thấy món nào</p>
          ) : (
            <div className="product-grid">
              {filteredMons.map(mon => {
                const minPrice = mon.chiTiet && mon.chiTiet.length > 0
                  ? Math.min(...mon.chiTiet.map(ct => ct.Gia))
                  : 0;
                const maxPrice = mon.chiTiet && mon.chiTiet.length > 0
                  ? Math.max(...mon.chiTiet.map(ct => ct.Gia))
                  : 0;

                return (
                  <div key={mon.MaMon} className="product-card">
                    <img
                      src={mon.HinhAnh ? `${API_URL}${mon.HinhAnh}` : '/placeholder.jpg'}
                      alt={mon.TenMon}
                      className="product-image"
                      onError={(e) => e.target.src = '/placeholder.jpg'}
                    />
                    <div className="product-info">
                      <h3 className="product-name">{mon.TenMon}</h3>
                      <p className="product-category">{mon.TenLM}</p>
                      <p className="product-desc">{mon.MoTa}</p>
                      <div className="product-footer">
                        {minPrice === maxPrice ? (
                          <span className="product-price">
                            {Number(minPrice).toLocaleString('vi-VN')} đ
                          </span>
                        ) : (
                          <span className="product-price">
                            {Number(minPrice).toLocaleString('vi-VN')} - {Number(maxPrice).toLocaleString('vi-VN')} đ
                          </span>
                        )}
                        <button
                          onClick={() => handleAddToCart(mon)}
                          className="add-button"
                        >
                          Thêm vào giỏ
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        {showCart && (
          <div className="cart-sidebar">
            <div className="cart-header">
              <h3>🛒 Giỏ hàng</h3>
              <button onClick={() => setShowCart(false)} className="close-button">✕</button>
            </div>

            {cart.length === 0 ? (
              <p className="empty-cart">Giỏ hàng trống</p>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item, index) => (
                    <div key={index} className="cart-item">
                      <img
                        src={item.HinhAnh ? `${API_URL}${item.HinhAnh}` : '/placeholder.jpg'}
                        alt={item.TenMon}
                        className="cart-item-image"
                      />
                      <div className="cart-item-info">
                        <h4 className="cart-item-name">{item.TenMon}</h4>
                        <p className="cart-item-size">Size: {item.KichCo}</p>
                        <p className="cart-item-price">
                          {Number(item.Gia).toLocaleString('vi-VN')} đ
                        </p>
                        <div className="quantity-control">
                          <button onClick={() => updateQuantity(index, -1)} className="qty-button">-</button>
                          <span className="quantity">{item.SoLuong}</span>
                          <button onClick={() => updateQuantity(index, 1)} className="qty-button">+</button>
                          <button onClick={() => removeFromCart(index)} className="remove-button">🗑️</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-footer">
                  <div className="total-row">
                    <strong>Tổng cộng:</strong>
                    <strong className="total-price">
                      {getTotalPrice().toLocaleString('vi-VN')} đ
                    </strong>
                  </div>
                  <button onClick={handleCheckout} className="checkout-button">
                    Thanh toán
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Size Selection Modal */}
      {showSizeModal && selectedMon && (
        <div className="modal-overlay" onClick={() => setShowSizeModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Chọn kích cỡ - {selectedMon.TenMon}</h3>
            <div className="size-options">
              {selectedMon.chiTiet.map(ct => (
                <button
                  key={ct.MaCTM}
                  onClick={() => addToCartWithSize(selectedMon, ct)}
                  className="size-button"
                >
                  <span className="size-name">{ct.KichCo}</span>
                  <span className="size-price">
                    {Number(ct.Gia).toLocaleString('vi-VN')} đ
                  </span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowSizeModal(false)} className="modal-close-button">
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};