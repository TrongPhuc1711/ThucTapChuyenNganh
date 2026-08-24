import { useState, useEffect } from "react";
import { 
  Search, 
  Coffee, 
  X, 
  Info,
  Eye,
  Tag
} from "lucide-react";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";
import StatusBadge from "../../../components/ui/StatusBadge";

const API_URL = import.meta.env.DEV 
  ? "http://localhost:4000" 
  : (import.meta.env.VITE_API_URL || "https://thuctapchuyennganh.onrender.com");

export default function StaffProducts() {
  const [products, setProducts] = useState([]); 
  const [categories, setCategories] = useState([]); 
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [productDetails, setProductDetails] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => { 
    fetchData(); 
  }, []); 

  useEffect(() => { 
    let filtered = products; 
    if (filterCategory !== "all") {
      filtered = filtered.filter(p => p.MaLM === parseInt(filterCategory)); 
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.TenMon.toLowerCase().includes(term) || 
        (p.MoTa && p.MoTa.toLowerCase().includes(term))
      ); 
    }
    setFilteredProducts(filtered); 
  }, [products, searchTerm, filterCategory]);

  const fetchData = async () => { 
    try { 
      const [productsRes, categoriesRes] = await Promise.all([
        api.get("/mon"),
        api.get("/loaimon")
      ]);
      setProducts(productsRes.data || []); 
      setCategories(categoriesRes.data || []); 
    } catch (error) { 
      console.error("Lỗi tải dữ liệu:", error); 
    } finally { 
      setLoading(false); 
    } 
  };

  const viewProductDetails = async (product) => { 
    try { 
      const response = await api.get(`/chitietmon/mon/${product.MaMon}`); 
      setProductDetails(response.data || []); 
      setSelectedProduct(product); 
    } catch (error) { 
      console.error("Lỗi tải chi tiết:", error); 
    } 
  };

  const getImageUrl = (imagePath) => { 
    if (!imagePath) return "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=400&auto=format&fit=crop"; 
    if (imagePath.startsWith('http')) return imagePath; 
    if (imagePath.startsWith('/uploads')) return `${API_URL}${imagePath}`; 
    return `${API_URL}/${imagePath}`; 
  };

  const formatMoney = (amount) => Number(amount || 0).toLocaleString("vi-VN") + " đ";

  return (
    <DashboardLayout title="Tra Cứu Menu & Giá Bán">
      <div className="space-y-6 animate-fade-in">
        
        {/* Controls */}
        <div className="bg-white rounded-3xl border border-[#EFEBE9] shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1887F]" />
            <input 
              type="text" 
              placeholder="Tìm kiếm món nước, hương vị..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFEBE9] text-xs font-medium text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#C5963A]/30"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)} 
              className="w-full sm:w-56 px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFEBE9] text-xs font-semibold text-[#4E342E] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C5963A]/30"
            >
              <option value="all">Tất cả loại ({products.length})</option>
              {categories.map(cat => (
                <option key={cat.MaLM} value={cat.MaLM}>{cat.TenLM}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-4 border-[#EFEBE9] border-t-[#C5963A] rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-semibold text-[#8D6E63]">Đang tải danh sách món...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-[#EFEBE9]">
            <Coffee className="w-12 h-12 text-[#A1887F] mx-auto mb-3 opacity-40" />
            <p className="font-serif font-bold text-base text-[#2C1810]">Không tìm thấy món nào</p>
            <p className="text-xs text-[#8D6E63] mt-1">Hãy thử tìm với từ khóa khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => {
              const displayImg = getImageUrl(product.HinhAnh);

              return (
                <div 
                  key={product.MaMon} 
                  className="group bg-white rounded-3xl overflow-hidden border border-[#EFEBE9] shadow-sm hover:shadow-xl hover:shadow-[#2C1810]/6 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#FAF7F2]">
                      <img 
                        src={displayImg} 
                        alt={product.TenMon} 
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=400&auto=format&fit=crop"; }} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-[#4E342E] shadow-sm">
                        {product.TenLM || "Cà phê"}
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="font-serif text-base font-bold text-[#2C1810] group-hover:text-[#C5963A] transition-colors line-clamp-1">
                        {product.TenMon}
                      </h3>
                      <p className="text-xs text-[#8D6E63] line-clamp-2 mt-1 leading-relaxed font-light min-h-[32px]">
                        {product.MoTa || "Hương vị đặc trưng tuyển chọn của P-Coffee"}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#A1887F]">
                      #{product.MaMon}
                    </span>
                    <button 
                      onClick={() => viewProductDetails(product)}
                      className="px-3.5 py-1.5 text-xs font-bold text-[#1A0F0A] bg-[#FAF7F2] hover:bg-[#2C1810] hover:text-white border border-[#EFEBE9] rounded-xl transition-all cursor-pointer"
                    >
                      Bảng Giá & Size
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Modal Chi Tiết Món */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-scale-in flex flex-col" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="p-6 border-b border-[#FAF7F2] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#2C1810]">
                  {selectedProduct.TenMon}
                </h3>
                <p className="text-xs text-[#8D6E63] mt-0.5">
                  Danh mục: <strong className="text-[#4E342E]">{selectedProduct.TenLM}</strong> • Mã #{selectedProduct.MaMon}
                </p>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="w-9 h-9 rounded-xl bg-[#FAF7F2] hover:bg-[#EFEBE9] text-[#6D4C41] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-[#EFEBE9]">
                <img 
                  src={getImageUrl(selectedProduct.HinhAnh)} 
                  alt={selectedProduct.TenMon} 
                  className="w-full h-full object-cover" 
                />
              </div>

              {selectedProduct.MoTa && (
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFEBE9]">
                  <p className="text-xs text-[#6D4C41] leading-relaxed">
                    {selectedProduct.MoTa}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-serif font-bold text-sm text-[#2C1810] mb-3">
                  Chi Tiết Kích Cỡ & Giá Bán:
                </h4>
                {productDetails.length === 0 ? (
                  <p className="text-xs text-[#A1887F] italic">Chưa có bảng giá cho món này.</p>
                ) : (
                  <div className="space-y-2">
                    {productDetails.map((detail) => (
                      <div 
                        key={detail.MaCTM} 
                        className="flex items-center justify-between p-3.5 rounded-2xl border border-[#EFEBE9] bg-white"
                      >
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-[#FAF7F2] text-[#4E342E] text-xs font-bold rounded-lg border border-[#EFEBE9]">
                            Size {detail.KichCo}
                          </span>
                          <span className="font-serif font-black text-sm text-[#C5963A]">
                            {formatMoney(detail.Gia)}
                          </span>
                        </div>
                        <StatusBadge status={detail.TrangThai} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#FAF7F2] text-right">
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="px-6 py-2.5 bg-[#FAF7F2] hover:bg-[#EFEBE9] text-[#6D4C41] font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}