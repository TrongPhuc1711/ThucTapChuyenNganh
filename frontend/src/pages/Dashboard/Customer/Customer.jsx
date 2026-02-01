import { useState, useEffect } from "react";
import { ShoppingCart, LogOut, User, History, Coffee, X, Plus, Minus, Search, ChevronDown } from 'lucide-react';
import api from "../../../services/api";

import "../../../styles/Dashboard/Customer.css";
import MenuTab from "./MenuTab";
import ProfileTab from "./ProfileTab";
import HistoryTab from "./HistoryTab";

const API_URL = import.meta.env.VITE_API_URL;

export default function Customer() {
  // --- STATE DỮ LIỆU CHUNG ---
  const [mons, setMons] = useState([]);
  const [loaiMons, setLoaiMons] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);

  // --- STATE UI ---
  const [activeTab, setActiveTab] = useState('menu');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [notification, setNotification] = useState(null);

  // --- STATE MODALS (GIỎ HÀNG & MÓN ĂN) ---
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

  // --- EFFECT ---
  useEffect(() => {
    loadData();
    loadUser();
    loadCartFromStorage();
  }, []);

  useEffect(() => {
    if (user && activeTab === 'history') loadOrders();
  }, [user, activeTab]);

  // --- API HELPER ---
  const loadUser = () => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [monsRes, loaiMonsRes] = await Promise.all([api.get("/mon"), api.get("/loaimon")]);
      const monsWithDetails = await Promise.all(
        monsRes.data.map(async (mon) => {
          try {
            const detailRes = await api.get(`/chitietmon/mon/${mon.MaMon}`);
            return { ...mon, chiTiet: detailRes.data };
          } catch { return { ...mon, chiTiet: [] }; }
        })
      );
      setMons(monsWithDetails);
      setLoaiMons(loaiMonsRes.data);
    } catch (err) { showNotification("❌ Lỗi khi tải dữ liệu", "error"); } finally { setIsLoading(false); }
  };

  const loadOrders = async () => {
    if (!user) return;
    setIsLoadingOrders(true);
    try {
      const response = await api.get(`/donhang/nguoidung/${user.MaND}`);
      setOrders(response.data);
    } catch (err) { showNotification("❌ Lỗi tải đơn hàng", "error"); } finally { setIsLoadingOrders(false); }
  };

  // --- GIỎ HÀNG LOGIC (GIỮ NGUYÊN) ---
  const loadCartFromStorage = () => { const s = localStorage.getItem('cart'); if (s) setCart(JSON.parse(s)); };
  const saveCartToStorage = (c) => localStorage.setItem('cart', JSON.stringify(c));

  const handleAddToCart = (mon) => {
    if (mon.chiTiet && mon.chiTiet.length > 1) { setSelectedMon(mon); setShowSizeModal(true); }
    else if (mon.chiTiet && mon.chiTiet.length === 1) { addToCartWithSize(mon, mon.chiTiet[0]); }
    else { showNotification("❌ Món này chưa có giá!", "error"); }
  };

  const addToCartWithSize = (mon, chiTiet) => {
    const newItem = { MaMon: mon.MaMon, MaCTM: chiTiet.MaCTM, TenMon: mon.TenMon, KichCo: chiTiet.KichCo, Gia: chiTiet.Gia, HinhAnh: mon.HinhAnh, TenLM: mon.TenLM, SoLuong: 1 };
    const idx = cart.findIndex(i => i.MaCTM === chiTiet.MaCTM);
    let newCart = [...cart];
    if (idx >= 0) newCart[idx].SoLuong += 1; else newCart.push(newItem);
    setCart(newCart); saveCartToStorage(newCart); setShowSizeModal(false); setSelectedMon(null);
    showNotification(`✅ Đã thêm ${mon.TenMon} vào giỏ hàng!`);
  };

  const updateQuantity = (idx, delta) => {
    const newCart = [...cart]; newCart[idx].SoLuong += delta;
    if (newCart[idx].SoLuong <= 0) { setItemToDelete(idx); setShowDeleteConfirm(true); }
    else { setCart(newCart); saveCartToStorage(newCart); }
  };

  const removeFromCart = (idx) => { setItemToDelete(idx); setShowDeleteConfirm(true); };
  const confirmDelete = () => {
    const newCart = cart.filter((_, i) => i !== itemToDelete);
    setCart(newCart); saveCartToStorage(newCart); setSelectedItems(prev => prev.filter(i => i !== itemToDelete));
    setShowDeleteConfirm(false); setItemToDelete(null); showNotification("Đã xóa món");
  };

  const toggleSelectItem = (idx) => setSelectedItems(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  const selectAllItems = () => setSelectedItems(selectedItems.length === cart.length ? [] : cart.map((_, i) => i));

  const handleEditSize = (idx) => {
    setEditingCartIndex(idx); const cartItem = cart[idx]; const mon = mons.find(m => m.MaMon === cartItem.MaMon);
    if (mon && mon.chiTiet.length > 1) { setSelectedMon(mon); setShowEditSizeModal(true); }
    else { showNotification("Không thể đổi size", "error"); }
  };

  const updateSize = (chiTiet) => {
    const newCart = [...cart];
    newCart[editingCartIndex] = { ...newCart[editingCartIndex], MaCTM: chiTiet.MaCTM, KichCo: chiTiet.KichCo, Gia: chiTiet.Gia };
    setCart(newCart); saveCartToStorage(newCart); setShowEditSizeModal(false); setEditingCartIndex(null); setSelectedMon(null);
    showNotification(`Đã đổi sang size ${chiTiet.KichCo}`);
  };

  const getTotalPrice = () => { const items = selectedItems.length === 0 ? cart : cart.filter((_, i) => selectedItems.includes(i)); return items.reduce((s, i) => s + (i.Gia * i.SoLuong), 0); };
  const getTotalItems = () => { const items = selectedItems.length === 0 ? cart : cart.filter((_, i) => selectedItems.includes(i)); return items.reduce((s, i) => s + i.SoLuong, 0); };

  const handleCheckout = async () => {
    const items = selectedItems.length > 0 ? cart.filter((_, i) => selectedItems.includes(i)) : cart;
    if (items.length === 0) return showNotification("Vui lòng chọn món!", "error");
    if (!user) return showNotification("Vui lòng đăng nhập!", "error");
    try {
      await api.post("/donhang", { MaND: user.MaND, TongTien: getTotalPrice(), ChiTietDonHang: items.map(i => ({ MaCTM: i.MaCTM, SoLuong: i.SoLuong, DonGia: i.Gia })) });
      showNotification("Đặt hàng thành công!");
      const newCart = selectedItems.length > 0 ? cart.filter((_, i) => !selectedItems.includes(i)) : [];
      setCart(newCart); saveCartToStorage(newCart); setSelectedItems([]); setShowCart(false); setShowCheckoutModal(false);
    } catch (err) { showNotification("Lỗi đặt hàng: " + (err.response?.data?.message || err.message), "error"); }
  };

  // --- UTILS ---
  const showNotification = (msg, type = "success") => { setNotification({ message: msg, type }); setTimeout(() => setNotification(null), 3000); };
  const handleLogout = () => { localStorage.clear(); window.location.href = '/login'; };
  const formatDate = (d) => new Date(d).toLocaleString('vi-VN');
  const getStatusColor = (s) => { switch (s) { case 'Đã thanh toán': return '#10b981'; case 'Treo': return '#f59e0b'; case 'Đã hủy': return '#ef4444'; default: return '#6b7280'; } };

  // Filter cho MenuTab
  const filteredMons = mons.filter(m => m.TenMon.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="customer-layout">
      {notification && <div className={`notification ${notification.type}`}>{notification.message}</div>}

      <div className="main-container">
        {/* NAVBAR */}
        <nav className="navbar">
          <div className="navbar-left" onClick={() => setActiveTab('menu')} style={{ cursor: 'pointer' }}>
            <Coffee className="brand-icon" /> <h1 className="brand-title">P_Coffee</h1>
          </div>
          <div className="nav-search">
            <Search className="search-icon" />
            <input type="text" placeholder="Bạn muốn uống gì hôm nay..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
          </div>
          <div className="navbar-right">
            <button onClick={() => setShowCart(true)} className="cart-button">
              <ShoppingCart className="cart-icon" /> {cart.length > 0 && <span className="cart-badge">{getTotalItems()}</span>}
            </button>
            {user ? (
              <div className="user-menu-wrapper">
                <div className="user-profile-trigger" onClick={() => setShowUserMenu(!showUserMenu)}>
                  <span className="user-greeting">Xin chào, {user.HoTen}</span><ChevronDown size={16} />
                </div>
                {showUserMenu && (
                  <div className="dropdown-menu">
                    <button onClick={() => { setActiveTab('menu'); setShowUserMenu(false); }} className="dropdown-item"><Coffee size={16} /> Thực đơn</button>
                    <button onClick={() => { setActiveTab('history'); setShowUserMenu(false); }} className="dropdown-item"><History size={16} /> Đơn hàng</button>
                    <button onClick={() => { setActiveTab('profile'); setShowUserMenu(false); }} className="dropdown-item"><User size={16} /> Quản lý tài khoản</button>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item logout-item"><LogOut size={16} /> Đăng xuất</button>
                  </div>
                )}
              </div>
            ) : <button className="login-btn-nav" onClick={() => window.location.href = '/login'}>Đăng nhập</button>}
          </div>
        </nav>

        <div className="content-scroll">
          {activeTab === 'menu' && (
            <MenuTab mons={filteredMons} loaiMons={loaiMons} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} isLoading={isLoading} handleAddToCart={handleAddToCart} API_URL={API_URL} />
          )}
          {activeTab === 'history' && (
            <HistoryTab orders={orders} isLoadingOrders={isLoadingOrders} formatDate={formatDate} getStatusColor={getStatusColor} />
          )}
          {activeTab === 'profile' && user && (
            <ProfileTab user={user} api={api} showNotification={showNotification} loadUser={loadUser} />
          )}
        </div>
      </div>

      {/* --- CART SIDEBAR & MODALS --- */}
      {showCart && (
        <div className="cart-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header"><h3>Giỏ hàng</h3><button onClick={() => setShowCart(false)} className="close-cart-btn"><X /></button></div>
            <div className="cart-body">
              {cart.length === 0 ? <div className="cart-empty"><p>Giỏ hàng trống</p></div> : (
                <div className="cart-items">
                  <div className="cart-select-all"><label className="checkbox-container"><input type="checkbox" checked={selectedItems.length === cart.length} onChange={selectAllItems} /><span className="checkmark"></span> Chọn tất cả</label></div>
                  {cart.map((item, index) => (
                    <div key={index} className={`cart-item ${selectedItems.includes(index) ? 'selected' : ''}`}>
                      <label className="checkbox-container"><input type="checkbox" checked={selectedItems.includes(index)} onChange={() => toggleSelectItem(index)} /><span className="checkmark"></span></label>
                      <img src={item.HinhAnh ? `${API_URL}${item.HinhAnh}` : '/placeholder.jpg'} alt="" className="cart-item-image" />
                      <div className="cart-item-info">
                        <h4>{item.TenMon}</h4>
                        <div className="item-size-wrapper"><span className="item-size">{item.KichCo}</span><button className="change-size-btn" onClick={() => handleEditSize(index)}>Đổi size</button></div>
                        <p>{Number(item.Gia).toLocaleString()}đ</p>
                        <div className="quantity-controls"><button onClick={() => updateQuantity(index, -1)}><Minus size={14} /></button><span>{item.SoLuong}</span><button onClick={() => updateQuantity(index, 1)}><Plus size={14} /></button></div>
                      </div>
                      <button onClick={() => removeFromCart(index)} className="remove-item-btn"><X size={18} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cart.length > 0 && <div className="cart-footer"><div className="cart-summary"><span>Tổng tiền:</span><strong>{getTotalPrice().toLocaleString()}đ</strong></div><button onClick={() => setShowCheckoutModal(true)} className="checkout-btn">Thanh toán</button></div>}
          </div>
        </div>
      )}

      {showSizeModal && selectedMon && <div className="modal-backdrop" onClick={() => setShowSizeModal(false)}><div className="modal-box" onClick={(e) => e.stopPropagation()}><h3>Chọn kích cỡ - {selectedMon.TenMon}</h3><div className="size-options">{selectedMon.chiTiet.map(ct => (<button key={ct.MaCTM} className="size-option" onClick={() => addToCartWithSize(selectedMon, ct)}><span>{ct.KichCo}</span><span>{Number(ct.Gia).toLocaleString()}đ</span></button>))}</div><button className="modal-cancel" onClick={() => setShowSizeModal(false)}>Hủy</button></div></div>}
      {showCheckoutModal && <div className="modal-backdrop"><div className="modal-box"><h3>Xác nhận đặt hàng</h3><p>Tổng tiền: <strong>{getTotalPrice().toLocaleString()}đ</strong></p><div className="modal-actions"><button className="confirm-btn" onClick={handleCheckout}>Xác nhận</button><button className="cancel-btn" onClick={() => setShowCheckoutModal(false)}>Hủy</button></div></div></div>}
      {showDeleteConfirm && <div className="modal-backdrop"><div className="modal-box"><h3>Xóa món?</h3><div className="modal-actions"><button className="confirm-btn delete-confirm" onClick={confirmDelete}>Xóa</button><button className="cancel-btn" onClick={() => setShowDeleteConfirm(false)}>Hủy</button></div></div></div>}
      {showEditSizeModal && selectedMon && <div className="modal-backdrop" onClick={() => setShowEditSizeModal(false)}><div className="modal-box" onClick={(e) => e.stopPropagation()}><h3>Đổi kích cỡ - {selectedMon.TenMon}</h3><div className="size-options">{selectedMon.chiTiet.map(ct => (<button key={ct.MaCTM} className="size-option" onClick={() => updateSize(ct)}><span>{ct.KichCo}</span><span>{Number(ct.Gia).toLocaleString()}đ</span></button>))}</div><button className="modal-cancel" onClick={() => setShowEditSizeModal(false)}>Hủy</button></div></div>}
    </div>
  );
}