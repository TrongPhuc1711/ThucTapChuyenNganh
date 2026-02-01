import React from 'react';
import { Plus } from 'lucide-react';

export default function MenuTab({ 
  mons, 
  loaiMons, 
  selectedCategory, 
  setSelectedCategory, 
  isLoading, 
  handleAddToCart, 
  API_URL 
}) {
  // Logic lọc món ăn (Filter)
  const filteredMons = mons.filter(mon => {
    // Lưu ý: search term xử lý ở file cha rồi truyền mons đã filter, 
    // hoặc filter tại đây nếu muốn. Ở đây mình filter theo category.
    return !selectedCategory || mon.MaLM === parseInt(selectedCategory);
  });

  return (
    <>
      {/* Banner */}
      <div className="banner-section">
        <div className="banner-content">
          <h2>Hương vị đánh thức mọi giác quan</h2>
          <p>Thưởng thức những ly cà phê nguyên chất và các loại đồ uống được pha chế công phu.</p>
          <button className="banner-btn">Đặt Ngay</button>
        </div>
      </div>

      <div className="page-wrapper">
        {/* Bộ lọc danh mục */}
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

        {/* Danh sách sản phẩm */}
        {isLoading ? (
          <div className="loading-state"><div className="spinner"></div><p>Đang tải menu...</p></div>
        ) : filteredMons.length === 0 ? (
          <div className="empty-state"><h3>Không tìm thấy món nào</h3></div>
        ) : (
          <div className="products-grid">
            {filteredMons.map(mon => {
              const prices = mon.chiTiet.map(ct => ct.Gia);
              const minPrice = prices.length ? Math.min(...prices) : 0;
              const maxPrice = prices.length ? Math.max(...prices) : 0;

              return (
                <div key={mon.MaMon} className="product-card">
                  <div className="product-image">
                    <img 
                      src={mon.HinhAnh ? `${API_URL}${mon.HinhAnh}` : '/placeholder.jpg'} 
                      alt={mon.TenMon} 
                      onError={(e) => e.target.src = '/placeholder.jpg'} 
                    />
                    {mon.chiTiet?.length > 1 && <div className="size-badge">{mon.chiTiet.length} sizes</div>}
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{mon.TenMon}</h3>
                    <div className="product-footer">
                      <div className="product-price">
                        {minPrice === maxPrice 
                          ? `${Number(minPrice).toLocaleString()}đ` 
                          : `${Number(minPrice).toLocaleString()}đ - ${Number(maxPrice).toLocaleString()}đ`}
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
  );
}