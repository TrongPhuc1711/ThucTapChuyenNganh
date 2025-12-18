import { useState, useEffect } from "react";
import { ShoppingCart, LogOut, User, History, Coffee, X, Plus, Minus, Search, ChevronDown, MapPin } from 'lucide-react';
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedMon, setSelectedMon] = useState(null);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showEditSizeModal, setShowEditSizeModal] = useState(false);
  const [editingCartIndex, setEditingCartIndex] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('menu');
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    loadData();
    loadUser();
    loadCartFromStorage();
  }, []);

  useEffect(() => {
    if (user && activeTab === 'history') {
      loadOrders();
    }
  }, [user, activeTab]);

  const loadUser = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  const loadOrders = async () => {
    if (!user) return;
    
    setIsLoadingOrders(true);
    try {
      const response = await api.get(`/donhang/nguoidung/${user.MaND}`);
      setOrders(response.data);
    } catch (err) {
      console.error(err);
      showNotification("❌ Lỗi khi tải đơn hàng", "error");
    } finally {
      setIsLoadingOrders(false);
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
      showNotification("❌ Lỗi khi tải dữ liệu", "error");
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

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddToCart = (mon) => {
    if (mon.chiTiet && mon.chiTiet.length > 1) {
      setSelectedMon(mon);
      setShowSizeModal(true);
    } else if (mon.chiTiet && mon.chiTiet.length === 1) {
      addToCartWithSize(mon, mon.chiTiet[0]);
    } else {
      showNotification("❌ Món này chưa có giá!", "error");
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
      TenLM: mon.TenLM,
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
    showNotification(`✅ Đã thêm ${mon.TenMon} vào giỏ hàng!`);
  };

  const updateQuantity = (index, delta) => {
    const newCart = [...cart];
    const newQuantity = newCart[index].SoLuong + delta;

    if (newQuantity <= 0) {
      // Hiển thị confirm dialog khi số lượng = 0
      setItemToDelete(index);
      setShowDeleteConfirm(true);
    } else {
      newCart[index].SoLuong = newQuantity;
      setCart(newCart);
      saveCartToStorage(newCart);
    }
  };

  const confirmDelete = () => {
    if (itemToDelete !== null) {
      const newCart = cart.filter((_, i) => i !== itemToDelete);
      setCart(newCart);
      saveCartToStorage(newCart);
      
      // Xóa item khỏi selectedItems nếu có
      setSelectedItems(prev => prev.filter(i => i !== itemToDelete));
      
      showNotification("🗑️ Đã xóa món khỏi giỏ hàng");
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  const removeFromCart = (index) => {
    setItemToDelete(index);
    setShowDeleteConfirm(true);
  };

  const clearCart = () => {
    setCart([]);
    setSelectedItems([]);
    saveCartToStorage([]);
    showNotification("🧹 Đã xóa toàn bộ giỏ hàng");
  };

  // Chọn/bỏ chọn item để thanh toán
  const toggleSelectItem = (index) => {
    setSelectedItems(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  // Chọn tất cả
  const selectAllItems = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map((_, index) => index));
    }
  };

  // Mở modal đổi kích cỡ
  const handleEditSize = (index) => {
    setEditingCartIndex(index);
    const cartItem = cart[index];
    
    // Tìm món trong danh sách mons
    const mon = mons.find(m => m.MaMon === cartItem.MaMon);
    if (mon && mon.chiTiet && mon.chiTiet.length > 1) {
      setSelectedMon(mon);
      setShowEditSizeModal(true);
    } else {
      showNotification("❌ Món này không có nhiều kích cỡ", "error");
    }
  };

  // Cập nhật kích cỡ
  const updateSize = (chiTiet) => {
    if (editingCartIndex !== null) {
      const newCart = [...cart];
      const mon = selectedMon;
      
      newCart[editingCartIndex] = {
        ...newCart[editingCartIndex],
        MaCTM: chiTiet.MaCTM,
        KichCo: chiTiet.KichCo,
        Gia: chiTiet.Gia
      };
      
      setCart(newCart);
      saveCartToStorage(newCart);
      setShowEditSizeModal(false);
      setEditingCartIndex(null);
      setSelectedMon(null);
      showNotification(`✅ Đã đổi sang size ${chiTiet.KichCo}`);
    }
  };

  const getTotalPrice = () => {
    if (selectedItems.length === 0) {
      return cart.reduce((sum, item) => sum + (item.Gia * item.SoLuong), 0);
    }
    return cart
      .filter((_, index) => selectedItems.includes(index))
      .reduce((sum, item) => sum + (item.Gia * item.SoLuong), 0);
  };

  const getTotalItems = () => {
    if (selectedItems.length === 0) {
      return cart.reduce((sum, item) => sum + item.SoLuong, 0);
    }
    return cart
      .filter((_, index) => selectedItems.includes(index))
      .reduce((sum, item) => sum + item.SoLuong, 0);
  };

  const handleCheckout = async () => {
    const itemsToCheckout = selectedItems.length > 0 
      ? cart.filter((_, index) => selectedItems.includes(index))
      : cart;

    if (itemsToCheckout.length === 0) {
      showNotification("❌ Vui lòng chọn món để thanh toán!", "error");
      return;
    }

    if (!user) {
      showNotification("❌ Vui lòng đăng nhập để thanh toán!", "error");
      return;
    }

    try {
      const orderData = {
        MaND: user.MaND,
        TongTien: getTotalPrice(),
        ChiTietDonHang: itemsToCheckout.map(item => ({
          MaCTM: item.MaCTM,
          SoLuong: item.SoLuong,
          DonGia: item.Gia
        }))
      };

      await api.post("/donhang", orderData);
      showNotification("✅ Đặt hàng thành công!");
      
      // Xóa các món đã thanh toán khỏi giỏ hàng
      if (selectedItems.length > 0) {
        const newCart = cart.filter((_, index) => !selectedItems.includes(index));
        setCart(newCart);
        saveCartToStorage(newCart);
        setSelectedItems([]);
      } else {
        setCart([]);
        saveCartToStorage([]);
      }
      
      setShowCart(false);
      setShowCheckoutModal(false);
    } catch (err) {
      showNotification("❌ Lỗi khi đặt hàng: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  // Hàm format ngày
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Hàm lấy màu trạng thái
  const getStatusColor = (status) => {
    switch(status) {
      case 'Đã thanh toán': return '#10b981';
      case 'Treo': return '#f59e0b';
      case 'Đã hủy': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Hàm lấy icon trạng thái
  const getStatusIcon = (status) => {
    switch(status) {
      case 'Đã thanh toán': return '✅';
      case 'Treo': return '⏳';
      case 'Đã hủy': return '❌';
      default: return '📦';
    }
  };

  // Hàm xử lý click vào menu item
  const handleMenuItemClick = (tab) => {
    setActiveTab(tab);
    setShowUserMenu(false);
  };

  const filteredMons = mons.filter(mon => {
    const matchSearch = mon.TenMon.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !selectedCategory || mon.MaLM === parseInt(selectedCategory);
    return matchSearch && matchCategory;
  });

  return (
    <div className="customer-layout">
      {/* Notification Toast */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Main Content */}
      <div className="main-container">
        {/* Navbar */}
        <nav className="navbar">
          <div className="navbar-left" onClick={() => handleMenuItemClick('menu')} style={{cursor: 'pointer'}}>
            <Coffee className="brand-icon" />
            <h1 className="brand-title">P_Coffee</h1>
          </div>

          <div className="nav-search">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Bạn muốn uống gì hôm nay..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="navbar-right">
            <button onClick={() => setShowCart(true)} className="cart-button">
              <ShoppingCart className="cart-icon" />
              {cart.length > 0 && (
                <span className="cart-badge">{getTotalItems()}</span>
              )}
            </button>

            {user ? (
              <div className="user-menu-wrapper">
                <div 
                  className="user-profile-trigger"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <span className="user-greeting">Xin chào, {user.HoTen}</span>
                  <ChevronDown size={16} />
                </div>
                
                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="dropdown-menu">
                    <button 
                      onClick={() => handleMenuItemClick('menu')} 
                      className="dropdown-item"
                    >
                      <Coffee size={16} /> Thực đơn
                    </button>
                    <button 
                      onClick={() => handleMenuItemClick('history')} 
                      className="dropdown-item"
                    >
                      <History size={16} /> Đơn hàng
                    </button>
                    <button 
                      onClick={() => handleMenuItemClick('profile')} 
                      className="dropdown-item"
                    >
                      <User size={16} /> Quản lý tài khoản
                    </button>
                    <div className="dropdown-divider"></div>
                    <button 
                      onClick={handleLogout} 
                      className="dropdown-item logout-item"
                    >
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="login-btn-nav" onClick={() => window.location.href='/login'}>
                Đăng nhập
              </button>
            )}
          </div>
        </nav>

        {/* Content Area */}
        <div className="content-scroll">
          {/* Menu Tab */}
          {activeTab === 'menu' && (
            <>
              {/* Banner Section */}
              <div className="banner-section">
                <div className="banner-content">
                  <h2>Hương vị đánh thức mọi giác quan</h2>
                  <p>Thưởng thức những ly cà phê nguyên chất và các loại đồ uống được pha chế công phu.</p>
                  <button className="banner-btn" onClick={() => {
                    document.querySelector('.filter-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}>Đặt Ngay</button>
                </div>
              </div>

              <div className="page-wrapper">
                {/* Filters */}
                <div className="filter-section">
                  <div className="category-filters">
                    <button
                      onClick={() => setSelectedCategory("")}
                      className={`category-btn ${!selectedCategory ? 'category-btn-active' : ''}`}
                    >
                      Tất cả
                    </button>
                    {loaiMons.map(lm => (
                      <button
                        key={lm.MaLM}
                        onClick={() => setSelectedCategory(lm.MaLM.toString())}
                        className={`category-btn ${selectedCategory === lm.MaLM.toString() ? 'category-btn-active' : ''}`}
                      >
                        {lm.TenLM}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Products Grid */}
                {isLoading ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải menu...</p>
                  </div>
                ) : filteredMons.length === 0 ? (
                  <div className="empty-state">
                    <Search className="empty-icon" />
                    <h3>Không tìm thấy món nào</h3>
                    <p>Thử tìm kiếm với từ khóa khác nhé!</p>
                  </div>
                ) : (
                  <div className="products-grid">
                    {filteredMons.map(mon => {
                      const minPrice = mon.chiTiet?.length > 0
                        ? Math.min(...mon.chiTiet.map(ct => ct.Gia))
                        : 0;
                      const maxPrice = mon.chiTiet?.length > 0
                        ? Math.max(...mon.chiTiet.map(ct => ct.Gia))
                        : 0;

                      return (
                        <div key={mon.MaMon} className="product-card">
                          <div className="product-image">
                            <img
                              src={mon.HinhAnh ? `${API_URL}${mon.HinhAnh}` : '/placeholder.jpg'}
                              alt={mon.TenMon}
                              onError={(e) => e.target.src = '/placeholder.jpg'}
                            />
                            {mon.chiTiet?.length > 1 && (
                              <div className="size-badge">{mon.chiTiet.length} sizes</div>
                            )}
                          </div>
                          <div className="product-info">
                            <h3 className="product-name">{mon.TenMon}</h3>
                            {mon.MoTa && <p className="product-description">{mon.MoTa}</p>}
                            <div className="product-footer">
                              <div className="product-price">
                                {minPrice === maxPrice ? (
                                  <span>{Number(minPrice).toLocaleString('vi-VN')}đ</span>
                                ) : (
                                  <span>{Number(minPrice).toLocaleString('vi-VN')}đ - {Number(maxPrice).toLocaleString('vi-VN')}đ</span>
                                )}
                              </div>
                              <button onClick={() => handleAddToCart(mon)} className="add-to-cart-btn">
                                <Plus className="btn-icon" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* History Tab - Đơn hàng */}
          {activeTab === 'history' && (
            <div className="page-wrapper">
              <h2 className="section-title">Đơn hàng của tôi</h2>
              
              {isLoadingOrders ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Đang tải đơn hàng...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="empty-state">
                  <History className="empty-icon" />
                  <h3>Chưa có đơn hàng nào</h3>
                  <p>Hãy đặt món yêu thích của bạn!</p>
                  <button onClick={() => handleMenuItemClick('menu')} className="back-to-menu-btn">
                    Quay lại thực đơn
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map(order => (
                    <div key={order.MaDH} className="order-card">
                      <div className="order-header">
                        <div className="order-info">
                          <h3 className="order-id">Đơn hàng #{order.MaDH}</h3>
                          <p className="order-date">{formatDate(order.NgayDat)}</p>
                        </div>
                        <div 
                          className="order-status"
                          style={{ backgroundColor: getStatusColor(order.TrangThai) }}
                        >
                          {getStatusIcon(order.TrangThai)} {order.TrangThai}
                        </div>
                      </div>
                      
                      <div className="order-details">
                        {order.ChiTietDonHang && order.ChiTietDonHang.map((item, idx) => (
                          <div key={idx} className="order-item">
                            <div className="order-item-info">
                              <span className="order-item-name">{item.TenMon || 'Món ăn'}</span>
                              <span className="order-item-size">Size: {item.KichCo || 'Vừa'}</span>
                            </div>
                            <div className="order-item-quantity">x{item.SoLuong}</div>
                            <div className="order-item-price">
                              {Number(item.DonGia).toLocaleString('vi-VN')}đ
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="order-footer">
                        {order.DiaChiGiaoHang && (
                          <div className="order-address">
                            <MapPin size={16} />
                            <span>{order.DiaChiGiaoHang}</span>
                          </div>
                        )}
                        {order.PhuongThucThanhToan && (
                          <div className="order-payment">
                            💳 {order.PhuongThucThanhToan}
                          </div>
                        )}
                        <div className="order-total">
                          Tổng: <strong>{Number(order.TongTien).toLocaleString('vi-VN')}đ</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab - Quản lý tài khoản */}
          {activeTab === 'profile' && user && (
            <div className="page-wrapper container-narrow">
              <h2 className="section-title">Quản lý tài khoản</h2>
              <div className="profile-card">
                <div className="profile-header">
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.HoTen}&background=8B4513&color=fff`}
                    alt="Avatar"
                    className="profile-avatar"
                  />
                  <div>
                    <h3 className="profile-name">{user.HoTen}</h3>
                    <p className="profile-role">Khách hàng thân thiết</p>
                  </div>
                </div>

                <div className="profile-details">
                  <div className="detail-row">
                    <label>Email</label>
                    <p>{user.Email}</p>
                  </div>
                  <div className="detail-row">
                    <label>Số điện thoại</label>
                    <p>{user.SDT || 'Chưa cập nhật'}</p>
                  </div>
                  <div className="detail-row">
                    <label>Địa chỉ</label>
                    <p className="address-display">
                      <MapPin size={16}/> {user.DiaChi || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>

                <button className="edit-profile-btn">
                  Chỉnh sửa thông tin
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="cart-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h3>Giỏ hàng</h3>
              <button onClick={() => setShowCart(false)} className="close-cart-btn">
                <X />
              </button>
            </div>

            <div className="cart-body">
              {cart.length === 0 ? (
                <div className="cart-empty">
                  <ShoppingCart className="empty-cart-icon" />
                  <p>Giỏ hàng trống</p>
                </div>
              ) : (
                <>
                  {/* Select All */}
                  <div className="cart-select-all">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === cart.length}
                        onChange={selectAllItems}
                      />
                      <span className="checkmark"></span>
                      <span className="checkbox-label">Chọn tất cả ({cart.length})</span>
                    </label>
                  </div>

                  <div className="cart-items">
                    {cart.map((item, index) => (
                      <div key={index} className={`cart-item ${selectedItems.includes(index) ? 'selected' : ''}`}>
                        <label className="checkbox-container">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(index)}
                            onChange={() => toggleSelectItem(index)}
                          />
                          <span className="checkmark"></span>
                        </label>
                        
                        <img
                          src={item.HinhAnh ? `${API_URL}${item.HinhAnh}` : '/placeholder.jpg'}
                          alt={item.TenMon}
                          className="cart-item-image"
                        />
                        <div className="cart-item-info">
                          <h4>{item.TenMon}</h4>
                          <div className="item-size-wrapper">
                            <span className="item-size">{item.KichCo}</span>
                            <button 
                              className="change-size-btn"
                              onClick={() => handleEditSize(index)}
                              title="Đổi kích cỡ"
                            >
                              Đổi size
                            </button>
                          </div>
                          <p className="item-price">{Number(item.Gia).toLocaleString('vi-VN')}đ</p>
                          <div className="quantity-controls">
                            <button onClick={() => updateQuantity(index, -1)} className="qty-btn">
                              <Minus size={16} />
                            </button>
                            <span className="qty-value">{item.SoLuong}</span>
                            <button onClick={() => updateQuantity(index, 1)} className="qty-btn">
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(index)} className="remove-item-btn">
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <button onClick={clearCart} className="clear-cart-btn">
                  Xóa tất cả
                </button>
                <div className="cart-summary">
                  <div className="summary-row">
                    <span>Tổng số món:</span>
                    <strong>{getTotalItems()}</strong>
                  </div>
                  <div className="summary-row total-row">
                    <span>Tổng tiền:</span>
                    <strong className="total-amount">
                      {getTotalPrice().toLocaleString('vi-VN')}đ
                    </strong>
                  </div>
                </div>
                <button onClick={() => setShowCheckoutModal(true)} className="checkout-btn">
                  Thanh toán
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Size Selection Modal */}
      {showSizeModal && selectedMon && (
        <div className="modal-backdrop" onClick={() => setShowSizeModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Chọn kích cỡ</h3>
            <p className="modal-subtitle">{selectedMon.TenMon}</p>
            <div className="size-options">
              {selectedMon.chiTiet.map(ct => (
                <button
                  key={ct.MaCTM}
                  className="size-option"
                  onClick={() => addToCartWithSize(selectedMon, ct)}
                >
                  <span className="size-label">{ct.KichCo}</span>
                  <span className="size-price">{Number(ct.Gia).toLocaleString('vi-VN')}đ</span>
                </button>
              ))}
            </div>
            <button className="modal-cancel" onClick={() => setShowSizeModal(false)}>
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Checkout Confirmation Modal */}
      {showCheckoutModal && (
        <div className="modal-backdrop" onClick={() => setShowCheckoutModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Xác nhận đơn hàng</h3>
            <div className="order-summary">
              <p>Bạn có <strong>{getTotalItems()} món</strong> {selectedItems.length > 0 ? 'được chọn' : 'trong giỏ hàng'}</p>
              <p className="total-highlight">
                Tổng thanh toán: <strong>{getTotalPrice().toLocaleString('vi-VN')}đ</strong>
              </p>
            </div>
            <div className="modal-actions">
              <button className="confirm-btn" onClick={handleCheckout}>
                Xác nhận đặt hàng
              </button>
              <button className="cancel-btn" onClick={() => setShowCheckoutModal(false)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-backdrop" onClick={cancelDelete}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Xác nhận xóa</h3>
            <p className="modal-subtitle">Bạn có chắc muốn xóa món này khỏi giỏ hàng?</p>
            <div className="modal-actions">
              <button className="confirm-btn delete-confirm" onClick={confirmDelete}>
                Xóa
              </button>
              <button className="cancel-btn" onClick={cancelDelete}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Size Modal */}
      {showEditSizeModal && selectedMon && (
        <div className="modal-backdrop" onClick={() => setShowEditSizeModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Đổi kích cỡ</h3>
            <p className="modal-subtitle">{selectedMon.TenMon}</p>
            <div className="size-options">
              {selectedMon.chiTiet.map(ct => (
                <button
                  key={ct.MaCTM}
                  className="size-option"
                  onClick={() => updateSize(ct)}
                >
                  <span className="size-label">{ct.KichCo}</span>
                  <span className="size-price">{Number(ct.Gia).toLocaleString('vi-VN')}đ</span>
                </button>
              ))}
            </div>
            <button className="modal-cancel" onClick={() => setShowEditSizeModal(false)}>
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}