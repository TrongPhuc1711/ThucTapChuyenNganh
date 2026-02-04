import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../../../components/DashboardLayout";
import "../../../styles/Dashboard/Staff/Staff_Products.css"

export default function StaffProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const API_URL = "https://thuctapchuyennganh.onrender.com";
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, filterCategory]);

  const fetchData = async () => {
    try {
      // Lấy danh sách món
      const productsRes = await axios.get(`${API_URL}/api/mon`);
      setProducts(productsRes.data);

      // Lấy danh sách loại món
      const categoriesRes = await axios.get(`${API_URL}/api/loaimon`);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      alert("Không thể tải danh sách món");
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Lọc theo loại
    if (filterCategory !== "all") {
      filtered = filtered.filter(p => p.MaLM === parseInt(filterCategory));
    }

    // Tìm kiếm
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.TenMon.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.MoTa?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const viewProductDetails = async (product) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/chitietmon/mon/${product.MaMon}`
      );
      setProductDetails(response.data);
      setSelectedProduct(product);
    } catch (error) {
      console.error("Lỗi tải chi tiết:", error);
      alert("Không thể tải chi tiết món");
    }
  };
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.png";
    // Nếu đã có đầy đủ URL thì return luôn
    if (imagePath.startsWith('http')) return imagePath;
    // Nếu bắt đầu bằng /uploads thì ghép với API_URL
    if (imagePath.startsWith('/uploads')) return `${API_URL}${imagePath}`;
    // Các trường hợp khác
    return `${API_URL}/${imagePath}`;
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(amount);
  };

  if (loading) {
    return (
      <DashboardLayout title="Danh sách món">
        <div className="loading">Đang tải...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Danh sách món">
      <div className="staff-products-container">
        {/* Bộ lọc và tìm kiếm */}
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm món..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="category-filter">
            <label>Loại món:</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="all">Tất cả</option>
              {categories.map(cat => (
                <option key={cat.MaLM} value={cat.MaLM}>
                  {cat.TenLM}
                </option>
              ))}
            </select>
          </div>

          <div className="stats-summary">
            <span>Tìm thấy: <strong>{filteredProducts.length}</strong> món</span>
          </div>
        </div>

        {/* Danh sách món */}
        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <p>🔍 Không tìm thấy món nào</p>
            </div>
          ) : (
            filteredProducts.map(product => (
              <div key={product.MaMon} className="product-card">
                <div className="product-image">
                  <img
                    src={product.HinhAnh ? `${API_URL}${product.HinhAnh}` : "/placeholder.png"}
                    alt={product.TenMon}
                    onError={(e) => e.target.src = "/placeholder.png"}
                  />
                  <span className="category-badge">{product.TenLM}</span>
                </div>

                <div className="product-info">
                  <h3>{product.TenMon}</h3>
                  <p className="product-description">
                    {product.MoTa || "Chưa có mô tả"}
                  </p>

                  <div className="product-footer">
                    <span className="product-id">Mã: {product.MaMon}</span>
                    <button
                      className="btn-details"
                      onClick={() => viewProductDetails(product)}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal chi tiết món */}
        {selectedProduct && (
          <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedProduct.TenMon}</h2>
                <button className="btn-close" onClick={() => setSelectedProduct(null)}>✕</button>
              </div>

              <div className="modal-body">
                <div className="product-detail-layout">
                  {/* Hình ảnh */}
                  <div className="product-image-large">
                    <img
                      src={getImageUrl(selectedProduct.HinhAnh)}
                      alt={selectedProduct.TenMon}
                      onError={(e) => e.target.src = "/placeholder.png"}
                    />
                  </div>

                  {/* Thông tin */}
                  <div className="product-info-detail">
                    <div className="info-item">
                      <label>Mã món:</label>
                      <span>#{selectedProduct.MaMon}</span>
                    </div>

                    <div className="info-item">
                      <label>Loại món:</label>
                      <span>{selectedProduct.TenLM}</span>
                    </div>

                    <div className="info-item full-width">
                      <label>Mô tả:</label>
                      <p>{selectedProduct.MoTa || "Chưa có mô tả"}</p>
                    </div>

                    {/* Bảng giá theo size */}
                    <div className="sizes-section">
                      <h3>💰 Giá theo kích cỡ</h3>
                      {productDetails.length === 0 ? (
                        <p className="no-sizes">Chưa có thông tin giá</p>
                      ) : (
                        <table className="sizes-table">
                          <thead>
                            <tr>
                              <th>Kích cỡ</th>
                              <th>Giá</th>
                              <th>Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productDetails.map((detail) => (
                              <tr key={detail.MaCTM}>
                                <td>
                                  <span className="size-badge-staff">{detail.KichCo}</span>
                                </td>
                                <td className="price-cell">
                                  {formatMoney(detail.Gia)}
                                </td>
                                <td>
                                  <span className={`status-badge ${detail.TrangThai === 'Còn bán' ? 'available' : 'unavailable'
                                    }`}>
                                    {detail.TrangThai}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* Ghi chú */}
                    <div className="note-section">
                      <p>ℹ️ Thông tin này chỉ để tham khảo. Không thể chỉnh sửa.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}