import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Coffee, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  ArrowRight,
  Search,
  Sparkles
} from "lucide-react";
import api from "../services/api";
import DashboardLayout from "./DashboardLayout";

export default function CreateOrder() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const [monRes, catRes] = await Promise.all([
        api.get("/mon"),
        api.get("/loaimon").catch(() => ({ data: [] }))
      ]);

      const productsWithPrice = await Promise.all((monRes.data || []).map(async (p) => {
        try {
          const detail = await api.get(`/chitietmon/mon/${p.MaMon}`);
          return { ...p, prices: detail.data || [] };
        } catch {
          return { ...p, prices: [] };
        }
      }));

      setProducts(productsWithPrice);
      setCategories(catRes.data || []);
    } catch (err) { 
      console.error("Lỗi tải món:", err); 
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (product, sizeDetail) => {
    const itemInCart = cart.find(item => item.MaCTM === sizeDetail.MaCTM);
    if (itemInCart) {
      setCart(cart.map(item => item.MaCTM === sizeDetail.MaCTM ? { ...item, SoLuong: item.SoLuong + 1 } : item));
    } else {
      setCart([...cart, { ...product, ...sizeDetail, SoLuong: 1 }]);
    }
  };

  const removeFromCart = (maCTM) => {
    setCart(cart.filter(item => item.MaCTM !== maCTM));
  };

  const updateQuantity = (maCTM, amount) => {
    const newCart = cart.map(item => {
      if (item.MaCTM === maCTM) {
        const newQty = item.SoLuong + amount;
        return { ...item, SoLuong: newQty > 0 ? newQty : 1 };
      }
      return item;
    });
    setCart(newCart);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.Gia * item.SoLuong), 0);
  };

  const formatVND = (amount) => {
    return Number(amount || 0).toLocaleString('vi-VN') + ' đ';
  };

  const handleCreateOrder = async () => {
    if (cart.length === 0) return alert("Giỏ hàng đang trống! Vui lòng chọn món.");
    const path = window.location.pathname.includes("/admin") 
      ? "/admin/checkout" 
      : "/staff/checkout";
    navigate(path, {
      state: {
        cart: cart,
        total: calculateTotal()
      }
    });
  };

  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory === "all" || p.MaLM === parseInt(selectedCategory);
    const matchSearch = !searchTerm || p.TenMon.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <DashboardLayout title="Bán Hàng Tại Quầy (POS)">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start animate-fade-in">
        
        {/* LEFT COLUMN: PRODUCT SELECTION */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Controls Filter Bar */}
          <div className="bg-white rounded-3xl border border-[#EFEBE9] p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1887F]" />
                <input
                  type="text"
                  placeholder="Tìm kiếm nhanh tên món nước..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFEBE9] text-xs font-medium text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#C5963A]/30"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-56 px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFEBE9] text-xs font-semibold text-[#4E342E] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C5963A]/30"
              >
                <option value="all">Tất cả danh mục ({products.length})</option>
                {categories.map(c => (
                  <option key={c.MaLM} value={c.MaLM}>{c.TenLM}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="p-16 text-center">
              <div className="w-10 h-10 border-4 border-[#EFEBE9] border-t-[#C5963A] rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-semibold text-[#8D6E63]">Đang tải thực đơn tại quầy...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-[#EFEBE9]">
              <Coffee className="w-12 h-12 text-[#A1887F] mx-auto mb-3 opacity-40" />
              <p className="font-serif font-bold text-base text-[#2C1810]">Không tìm thấy món nào</p>
              <p className="text-xs text-[#8D6E63] mt-1">Hãy thử với từ khóa khác.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-h-[70vh] overflow-y-auto pr-1">
              {filteredProducts.map(p => (
                <div 
                  key={p.MaMon} 
                  className="bg-white border border-[#EFEBE9] rounded-3xl p-5 shadow-sm hover:shadow-lg hover:border-[#C5963A]/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-[#C5963A] tracking-wider uppercase">
                      {p.TenLM || "Cà phê"}
                    </span>
                    <h4 className="font-serif font-bold text-[#2C1810] text-base line-clamp-1">
                      {p.TenMon}
                    </h4>
                  </div>

                  {/* Size buttons */}
                  <div className="mt-4 space-y-2">
                    {p.prices && p.prices.length > 0 ? (
                      p.prices.map(s => (
                        <button 
                          key={s.MaCTM} 
                          onClick={() => addToCart(p, s)}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#FAF7F2] hover:bg-[#2C1810] hover:text-white border border-[#EFEBE9] rounded-2xl text-xs font-semibold text-[#4E342E] transition-all cursor-pointer group/size active:scale-98"
                        >
                          <span>Size {s.KichCo}</span>
                          <span className="font-serif font-bold text-[#C5963A] group-hover/size:text-[#E6C687]">
                            {formatVND(s.Gia)}
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-[#A1887F] italic text-center py-2">Chưa cập nhật giá</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: POS CART */}
        <div className="xl:col-span-4 bg-white rounded-3xl border border-[#EFEBE9] shadow-lg flex flex-col max-h-[85vh] sticky top-24 overflow-hidden">
          
          {/* Cart Header */}
          <div className="p-5 border-b border-[#FAF7F2] bg-[#FAF7F2]/50 flex items-center justify-between">
            <h3 className="font-serif font-bold text-[#2C1810] text-base flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C5963A]" />
              <span>Đơn Hàng Tại Quầy</span>
            </h3>
            <span className="px-3 py-1 bg-[#2C1810] text-[#C5963A] text-xs font-bold rounded-full">
              {cart.reduce((sum, item) => sum + item.SoLuong, 0)} món
            </span>
          </div>

          {/* Cart List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[280px]">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-2 py-12">
                <Coffee className="w-12 h-12 text-[#A1887F] opacity-30" />
                <p className="text-xs text-[#A1887F] font-bold uppercase tracking-wider">Đơn hàng trống</p>
                <p className="text-[11px] text-[#8D6E63]">Bấm chọn kích cỡ món bên trái để thêm vào đơn</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.MaCTM} className="p-3.5 bg-[#FAF7F2] border border-[#EFEBE9] rounded-2xl space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-serif font-bold text-xs text-[#2C1810] leading-snug">{item.TenMon}</h5>
                      <span className="inline-block px-2 py-0.5 bg-white text-[#6D4C41] text-[9px] font-bold rounded-md border border-[#EFEBE9] mt-0.5">
                        Size {item.KichCo}
                      </span>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.MaCTM)}
                      className="text-rose-500 hover:text-rose-700 p-1 transition-colors cursor-pointer"
                      title="Xóa món"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#EFEBE9]">
                    <div className="flex items-center bg-white border border-[#EFEBE9] rounded-xl px-1.5 py-0.5">
                      <button onClick={() => updateQuantity(item.MaCTM, -1)} className="text-[#6D4C41] p-1 text-xs font-bold cursor-pointer">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-[#2C1810] px-2 font-mono">{item.SoLuong}</span>
                      <button onClick={() => updateQuantity(item.MaCTM, 1)} className="text-[#6D4C41] p-1 text-xs font-bold cursor-pointer">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-serif font-bold text-sm text-[#C5963A]">
                      {formatVND(item.Gia * item.SoLuong)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          <div className="p-5 border-t border-[#EFEBE9] bg-[#FAF7F2]/50 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-[#6D4C41] uppercase tracking-wider text-xs">Tổng Tiền Đơn:</span>
              <span className="font-serif text-2xl font-black text-[#C5963A]">{formatVND(calculateTotal())}</span>
            </div>

            <button 
              onClick={handleCreateOrder} 
              disabled={cart.length === 0}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#C5963A] to-[#D4A84B] hover:from-[#B8872D] hover:to-[#C5963A] text-[#1A0F0A] font-bold rounded-2xl text-sm shadow-lg shadow-[#C5963A]/20 transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Xác Nhận & Thu Tiền</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}