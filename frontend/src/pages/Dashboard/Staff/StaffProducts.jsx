import { useState, useEffect } from "react";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";

export default function StaffProducts() {
  const [products, setProducts] = useState([]); const [categories, setCategories] = useState([]); const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true); const [selectedProduct, setSelectedProduct] = useState(null); const [productDetails, setProductDetails] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); const [filterCategory, setFilterCategory] = useState("all");
  const API_URL = import.meta.env.DEV 
    ? "http://localhost:4000" 
    : (import.meta.env.VITE_API_URL || "https://thuctapchuyennganh.onrender.com");

  useEffect(() => { fetchData(); }, []); useEffect(() => { filterProducts(); }, [products, searchTerm, filterCategory]);
  const fetchData = async () => { try { const productsRes = await api.get("/mon"); setProducts(productsRes.data); const categoriesRes = await api.get("/loaimon"); setCategories(categoriesRes.data); } catch (error) { console.error("Lỗi tải dữ liệu:", error); alert("Không thể tải danh sách món"); } finally { setLoading(false); } };
  const filterProducts = () => { let filtered = products; if (filterCategory !== "all") filtered = filtered.filter(p => p.MaLM === parseInt(filterCategory)); if (searchTerm) filtered = filtered.filter(p => p.TenMon.toLowerCase().includes(searchTerm.toLowerCase()) || p.MoTa?.toLowerCase().includes(searchTerm.toLowerCase())); setFilteredProducts(filtered); };
  const viewProductDetails = async (product) => { try { const response = await api.get(`/chitietmon/mon/${product.MaMon}`); setProductDetails(response.data); setSelectedProduct(product); } catch (error) { console.error("Lỗi tải chi tiết:", error); alert("Không thể tải chi tiết món"); } };
  const getImageUrl = (imagePath) => { if (!imagePath) return "/placeholder.png"; if (imagePath.startsWith('http')) return imagePath; if (imagePath.startsWith('/uploads')) return `${API_URL}${imagePath}`; return `${API_URL}/${imagePath}`; };
  const formatMoney = (amount) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  if (loading) return <DashboardLayout title="Danh sách món"><div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-coffee-200 border-t-gold rounded-full animate-spin"></div></div></DashboardLayout>;

  return (
    <DashboardLayout title="Danh sách món">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-coffee-100/50 shadow-sm p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]"><svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg><input type="text" placeholder="Tìm kiếm món..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm" /></div>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-700 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold/30"><option value="all">Tất cả loại</option>{categories.map(cat => <option key={cat.MaLM} value={cat.MaLM}>{cat.TenLM}</option>)}</select>
            <span className="text-sm text-coffee-400">Tìm thấy: <strong className="text-coffee-700">{filteredProducts.length}</strong> món</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.length === 0 ? <div className="col-span-full text-center py-16"><div className="text-5xl mb-4">🔍</div><p className="text-coffee-300">Không tìm thấy món nào</p></div> :
            filteredProducts.map(product => (
              <div key={product.MaMon} className="group bg-white rounded-2xl overflow-hidden border border-coffee-100/50 shadow-sm hover:shadow-xl hover:shadow-coffee-900/5 transition-all duration-300 hover:-translate-y-1">
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img src={product.HinhAnh ? `${API_URL}${product.HinhAnh}` : "/placeholder.png"} alt={product.TenMon} onError={(e) => e.target.src = "/placeholder.png"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-coffee-800/70 text-white text-xs font-medium rounded-full backdrop-blur-sm">{product.TenLM}</span>
                </div>
                <div className="p-4"><h3 className="font-semibold text-coffee-800 mb-1 group-hover:text-gold transition-colors">{product.TenMon}</h3><p className="text-sm text-coffee-400 line-clamp-2 mb-3">{product.MoTa || "Chưa có mô tả"}</p>
                  <div className="flex items-center justify-between"><span className="text-xs text-coffee-300">Mã: #{product.MaMon}</span><button className="px-3 py-1.5 text-xs font-medium text-coffee-700 bg-coffee-100 rounded-lg hover:bg-coffee-200 transition-colors" onClick={() => viewProductDetails(product)}>Xem chi tiết</button></div>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-coffee-50"><h3 className="font-heading text-xl font-bold text-coffee-800">{selectedProduct.TenMon}</h3><button onClick={() => setSelectedProduct(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-coffee-50 text-coffee-400 hover:text-coffee-700 transition-colors">✕</button></div>
            <div className="p-6 space-y-5">
              <img src={getImageUrl(selectedProduct.HinhAnh)} alt={selectedProduct.TenMon} onError={(e) => e.target.src = "/placeholder.png"} className="w-full h-48 object-cover rounded-xl" />
              <div className="grid grid-cols-2 gap-3"><div className="bg-coffee-50/50 rounded-xl p-3"><p className="text-xs text-coffee-400 mb-1">Mã món</p><p className="text-sm font-medium text-coffee-800">#{selectedProduct.MaMon}</p></div><div className="bg-coffee-50/50 rounded-xl p-3"><p className="text-xs text-coffee-400 mb-1">Loại món</p><p className="text-sm font-medium text-coffee-800">{selectedProduct.TenLM}</p></div></div>
              <div className="bg-coffee-50/50 rounded-xl p-3"><p className="text-xs text-coffee-400 mb-1">Mô tả</p><p className="text-sm text-coffee-700">{selectedProduct.MoTa || "Chưa có mô tả"}</p></div>
              <div><h4 className="text-sm font-semibold text-coffee-700 mb-3">💰 Giá theo kích cỡ</h4>
                {productDetails.length === 0 ? <p className="text-sm text-coffee-300">Chưa có thông tin giá</p> : (
                  <div className="space-y-2">{productDetails.map((detail) => (<div key={detail.MaCTM} className="flex items-center justify-between bg-white rounded-xl p-3 border border-coffee-100/50"><div className="flex items-center gap-3"><span className="px-3 py-1 bg-coffee-100 text-coffee-700 text-xs font-semibold rounded-full">{detail.KichCo}</span><span className="text-sm font-semibold text-gold">{formatMoney(detail.Gia)}</span></div><span className={`px-2.5 py-1 text-xs font-medium rounded-full ${detail.TrangThai === 'Còn bán' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>{detail.TrangThai}</span></div>))}</div>
                )}
              </div>
              <p className="text-xs text-coffee-300 italic">ℹ️ Thông tin này chỉ để tham khảo. Không thể chỉnh sửa.</p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}