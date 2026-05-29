import { useState, useEffect } from "react";
import { ShoppingCart, LogOut, User, History, Coffee, X, Plus, Minus, Search, ChevronDown } from 'lucide-react';
import api from "../../../services/api";

import MenuTab from "./MenuTab";
import ProfileTab from "./ProfileTab";
import HistoryTab from "./HistoryTab";

const API_URL = import.meta.env.DEV 
  ? "http://localhost:4000" 
  : (import.meta.env.VITE_API_URL || "https://thuctapchuyennganh.onrender.com");

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
    <div className="min-h-screen bg-[#faf7f5] text-coffee-800 font-sans flex flex-col relative">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-24 right-6 z-50 px-4 py-3 rounded-2xl text-sm font-semibold shadow-xl border animate-slide-down flex items-center gap-2 ${
          notification.type === 'error' 
            ? 'bg-danger-light text-danger border-danger/10' 
            : 'bg-success-light text-success border-success/10'
        }`}>
          <span>{notification.message}</span>
        </div>
      )}

      {/* FIXED NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-coffee-100/50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => { setActiveTab('menu'); setSearchTerm(''); }}>
            <div className="w-9 h-9 bg-gradient-to-tr from-coffee-700 to-coffee-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <Coffee size={18} strokeWidth={2.5} />
            </div>
            <h1 className="font-heading text-xl font-bold tracking-tight text-coffee-800 hidden sm:block">P-Coffee</h1>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-md mx-2">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-coffee-400">
              <Search size={16} />
            </span>
            <input 
              type="text" 
              placeholder="Hôm nay bạn muốn uống gì..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:bg-white transition-all duration-300" 
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            {/* Cart Button */}
            <button 
              onClick={() => setShowCart(true)} 
              className="relative w-10 h-10 rounded-xl bg-coffee-50 border border-coffee-100 hover:bg-coffee-100/50 text-coffee-700 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <ShoppingCart size={18} />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gold text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse-soft">
                  {getTotalItems()}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)} 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-coffee-100 hover:bg-coffee-50 transition-colors"
                >
                  <div className="w-7 h-7 bg-coffee-700 text-white font-semibold rounded-full flex items-center justify-center text-xs">
                    {user.HoTen.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-coffee-700 hidden md:block">{user.HoTen}</span>
                  <ChevronDown size={14} className="text-coffee-400" />
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-coffee-100 p-2 z-50 animate-scale-in">
                      <button 
                        onClick={() => { setActiveTab('menu'); setShowUserMenu(false); }} 
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-coffee-600 hover:bg-coffee-50 hover:text-coffee-955 rounded-xl transition-colors text-left"
                      >
                        <Coffee size={15} /> Thực đơn
                      </button>
                      <button 
                        onClick={() => { setActiveTab('history'); setShowUserMenu(false); }} 
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-coffee-600 hover:bg-coffee-50 hover:text-coffee-955 rounded-xl transition-colors text-left"
                      >
                        <History size={15} /> Đơn hàng đã mua
                      </button>
                      <button 
                        onClick={() => { setActiveTab('profile'); setShowUserMenu(false); }} 
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-coffee-600 hover:bg-coffee-50 hover:text-coffee-955 rounded-xl transition-colors text-left"
                      >
                        <User size={15} /> Quản lý tài khoản
                      </button>
                      <div className="h-px bg-coffee-50 my-1"></div>
                      <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger-light/30 rounded-xl transition-colors text-left font-semibold"
                      >
                        <LogOut size={15} /> Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button 
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-coffee-700 to-coffee-600 rounded-xl hover:from-coffee-600 hover:to-coffee-500 shadow-md transition-all"
                onClick={() => window.location.href = '/login'}
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* PAGE CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 pt-24 pb-12">
        {activeTab === 'menu' && (
          <MenuTab 
            mons={filteredMons} 
            loaiMons={loaiMons} 
            selectedCategory={selectedCategory} 
            setSelectedCategory={setSelectedCategory} 
            isLoading={isLoading} 
            handleAddToCart={handleAddToCart} 
            API_URL={API_URL} 
          />
        )}
        {activeTab === 'history' && (
          <HistoryTab 
            orders={orders} 
            isLoadingOrders={isLoadingOrders} 
            formatDate={formatDate} 
            getStatusColor={getStatusColor} 
          />
        )}
        {activeTab === 'profile' && user && (
          <ProfileTab 
            user={user} 
            api={api} 
            showNotification={showNotification} 
            loadUser={loadUser} 
          />
        )}
      </main>

      {/* --- CART DRAWER (SLIDE IN) --- */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end bg-coffee-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowCart(false)}>
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl relative animate-slide-right" onClick={(e) => e.stopPropagation()}>
            {/* Cart Header */}
            <div className="p-5 border-b border-coffee-100 flex items-center justify-between bg-coffee-50/50">
              <h3 className="font-heading text-lg font-bold text-coffee-800">Giỏ hàng của bạn</h3>
              <button onClick={() => setShowCart(false)} className="w-8 h-8 rounded-lg hover:bg-coffee-100/50 text-coffee-500 hover:text-coffee-700 flex items-center justify-center transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Cart Items list */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  <span className="text-5xl block">🛒</span>
                  <h4 className="font-heading font-semibold text-coffee-700">Giỏ hàng trống</h4>
                  <p className="text-xs text-coffee-400 max-w-[200px]">Hãy khám phá menu của P-Coffee để thêm món nhé!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Select All */}
                  <div className="flex items-center gap-2 border-b border-coffee-50 pb-3">
                    <input 
                      type="checkbox" 
                      id="select-all"
                      checked={selectedItems.length === cart.length} 
                      onChange={selectAllItems}
                      className="w-4 h-4 rounded text-gold focus:ring-gold border-coffee-300"
                    />
                    <label htmlFor="select-all" className="text-xs font-semibold text-coffee-600 cursor-pointer select-none">
                      Chọn tất cả ({cart.length})
                    </label>
                  </div>

                  {/* Item List */}
                  {cart.map((item, index) => {
                    const isSelected = selectedItems.includes(index);
                    return (
                      <div key={index} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 ${
                        isSelected 
                          ? 'bg-gold/5 border-gold/30 shadow-sm' 
                          : 'bg-white border-coffee-100/50 hover:bg-coffee-50/30'
                      }`}>
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={() => toggleSelectItem(index)}
                          className="w-4 h-4 rounded text-gold focus:ring-gold border-coffee-300 flex-shrink-0"
                        />
                        
                        <img 
                          src={item.HinhAnh ? (item.HinhAnh.startsWith('http') ? item.HinhAnh : `${API_URL}${item.HinhAnh}`) : '/placeholder.jpg'} 
                          alt="" 
                          className="w-14 h-14 rounded-xl object-cover border border-coffee-100 flex-shrink-0" 
                        />
                        
                        <div className="flex-1 space-y-1.5">
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="font-heading text-sm font-bold text-coffee-800 line-clamp-1 leading-snug">{item.TenMon}</h4>
                            <button onClick={() => removeFromCart(index)} className="text-coffee-300 hover:text-danger p-0.5 rounded transition-colors flex-shrink-0">
                              <X size={15} />
                            </button>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 bg-coffee-100 text-coffee-600 text-[10px] font-bold rounded-full">
                              Size {item.KichCo}
                            </span>
                            <button className="text-[10px] text-gold font-semibold hover:underline" onClick={() => handleEditSize(index)}>
                              Đổi size
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="font-bold text-sm text-coffee-700 font-mono">{Number(item.Gia).toLocaleString()}đ</span>
                            
                            {/* Quantity buttons */}
                            <div className="flex items-center bg-coffee-50 border border-coffee-100 rounded-lg px-1.5 py-0.5">
                              <button onClick={() => updateQuantity(index, -1)} className="text-coffee-400 hover:text-coffee-700 p-1 transition-colors"><Minus size={10} /></button>
                              <span className="text-xs font-bold text-coffee-800 px-2 font-mono">{item.SoLuong}</span>
                              <button onClick={() => updateQuantity(index, 1)} className="text-coffee-400 hover:text-coffee-700 p-1 transition-colors"><Plus size={10} /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-coffee-100 bg-coffee-50/50 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-coffee-500">Tạm tính ({selectedItems.length || cart.length} món):</span>
                  <span className="font-heading font-extrabold text-gold text-lg font-mono">{getTotalPrice().toLocaleString()}đ</span>
                </div>
                <button 
                  onClick={() => setShowCheckoutModal(true)} 
                  className="w-full py-3.5 bg-gradient-to-r from-coffee-700 to-coffee-600 hover:from-coffee-600 hover:to-coffee-500 text-white font-semibold rounded-2xl shadow-lg shadow-coffee-700/10 transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                >
                  📝 Xác nhận thanh toán
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- CHỌN SIZE MODAL (LẦN ĐẦU) --- */}
      {showSizeModal && selectedMon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowSizeModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-coffee-50">
              <h3 className="font-heading text-lg font-bold text-coffee-800">Chọn kích cỡ</h3>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-coffee-50 text-coffee-400 hover:text-coffee-700 transition-colors" onClick={() => setShowSizeModal(false)}>✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-center pb-2">
                <h4 className="font-heading font-bold text-coffee-800 text-base">{selectedMon.TenMon}</h4>
                <p className="text-xs text-coffee-400 mt-0.5">{selectedMon.TenLM}</p>
              </div>
              
              <div className="space-y-2">
                {selectedMon.chiTiet.map(ct => (
                  <button 
                    key={ct.MaCTM} 
                    className="w-full flex items-center justify-between p-3.5 bg-coffee-50 hover:bg-gold/10 border border-coffee-100 hover:border-gold/30 rounded-xl transition-all text-sm font-semibold text-coffee-800 group"
                    onClick={() => addToCartWithSize(selectedMon, ct)}
                  >
                    <span className="group-hover:text-gold-dark transition-colors">Size {ct.KichCo}</span>
                    <span className="font-mono text-gold">{Number(ct.Gia).toLocaleString()}đ</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-6 pt-0">
              <button className="w-full py-2.5 bg-white border border-coffee-200 text-coffee-600 font-medium rounded-xl text-sm hover:bg-coffee-50 transition-colors" onClick={() => setShowSizeModal(false)}>Hủy bỏ</button>
            </div>
          </div>
        </div>
      )}

      {/* --- ĐỔI SIZE MODAL (GIỎ HÀNG) --- */}
      {showEditSizeModal && selectedMon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowEditSizeModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-coffee-50">
              <h3 className="font-heading text-lg font-bold text-coffee-800">Thay đổi kích cỡ</h3>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-coffee-50 text-coffee-400 hover:text-coffee-700 transition-colors" onClick={() => setShowEditSizeModal(false)}>✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-center pb-2">
                <h4 className="font-heading font-bold text-coffee-800 text-base">{selectedMon.TenMon}</h4>
                <p className="text-xs text-coffee-400 mt-0.5">{selectedMon.TenLM}</p>
              </div>
              
              <div className="space-y-2">
                {selectedMon.chiTiet.map(ct => (
                  <button 
                    key={ct.MaCTM} 
                    className="w-full flex items-center justify-between p-3.5 bg-coffee-50 hover:bg-gold/10 border border-coffee-100 hover:border-gold/30 rounded-xl transition-all text-sm font-semibold text-coffee-800 group"
                    onClick={() => updateSize(ct)}
                  >
                    <span className="group-hover:text-gold-dark transition-colors">Size {ct.KichCo}</span>
                    <span className="font-mono text-gold">{Number(ct.Gia).toLocaleString()}đ</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-6 pt-0">
              <button className="w-full py-2.5 bg-white border border-coffee-200 text-coffee-600 font-medium rounded-xl text-sm hover:bg-coffee-50 transition-colors" onClick={() => setShowEditSizeModal(false)}>Hủy bỏ</button>
            </div>
          </div>
        </div>
      )}

      {/* --- XÁC NHẬN THANH TOÁN --- */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowCheckoutModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden p-6 text-center animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-gold/15 text-gold rounded-full flex items-center justify-center mx-auto text-xl mb-4">📋</div>
            <h3 className="font-heading text-lg font-bold text-coffee-800 mb-2">Xác nhận đặt đơn hàng</h3>
            <p className="text-sm text-coffee-600">Bạn sẽ đặt đơn hàng này với tổng chi phí thanh toán là:</p>
            <p className="font-heading font-extrabold text-gold text-2xl font-mono mt-2 mb-6">{getTotalPrice().toLocaleString()}đ</p>
            
            <div className="flex gap-3">
              <button className="flex-1 py-2.5 bg-gradient-to-r from-coffee-700 to-coffee-600 text-white font-semibold rounded-xl text-sm hover:from-coffee-600 hover:to-coffee-500 shadow-md transition-all" onClick={handleCheckout}>Xác nhận đặt</button>
              <button className="px-4 py-2.5 bg-white border border-coffee-200 text-coffee-600 font-medium rounded-xl text-sm hover:bg-coffee-50 transition-colors" onClick={() => setShowCheckoutModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* --- XÁC NHẬN XÓA MÓN --- */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden p-6 text-center animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-danger-light text-danger rounded-full flex items-center justify-center mx-auto text-xl mb-4">🗑️</div>
            <h3 className="font-heading text-lg font-bold text-coffee-800 mb-2">Xóa món ăn?</h3>
            <p className="text-sm text-coffee-500 mb-6">Bạn có chắc chắn muốn loại bỏ sản phẩm này ra khỏi giỏ hàng?</p>
            
            <div className="flex gap-3">
              <button className="flex-1 py-2.5 bg-danger text-white font-semibold rounded-xl text-sm hover:bg-danger/90 shadow-md transition-all" onClick={confirmDelete}>Xóa bỏ</button>
              <button className="px-4 py-2.5 bg-white border border-coffee-200 text-coffee-600 font-medium rounded-xl text-sm hover:bg-coffee-50 transition-colors" onClick={() => setShowDeleteConfirm(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}