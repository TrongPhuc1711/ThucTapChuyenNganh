import React from 'react';
import { Plus, Coffee } from 'lucide-react';

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
    return !selectedCategory || mon.MaLM === parseInt(selectedCategory);
  });

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-coffee-900 via-coffee-800 to-coffee-700 min-h-[260px] flex items-center p-8 md:p-12 shadow-xl shadow-coffee-900/10 border border-coffee-800">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-10 left-1/4 w-40 h-40 bg-gold rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-1/4 w-52 h-52 bg-coffee-500 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
        </div>
        <div className="relative z-10 max-w-xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-gold text-xs font-semibold uppercase tracking-wider backdrop-blur-sm border border-white/5">
            <Coffee size={12} /> Special Selected
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white leading-tight">
            Hương vị đánh thức mọi giác quan
          </h2>
          <p className="text-sm md:text-base text-coffee-200 leading-relaxed font-light">
            Thưởng thức những ly cà phê nguyên chất và các loại đồ uống được pha chế công phu từ những nghệ nhân tâm huyết.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Bộ lọc danh mục */}
        <div className="overflow-x-auto pb-2 scrollbar-none">
          <div className="flex gap-2 min-w-max">
            <button 
              onClick={() => setSelectedCategory("")} 
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                !selectedCategory 
                  ? 'bg-coffee-700 text-white shadow-md shadow-coffee-700/20' 
                  : 'bg-white text-coffee-600 hover:bg-coffee-50 border border-coffee-100'
              }`}
            >
              Tất cả
            </button>
            {loaiMons.map(lm => (
              <button 
                key={lm.MaLM} 
                onClick={() => setSelectedCategory(lm.MaLM.toString())} 
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === lm.MaLM.toString() 
                    ? 'bg-coffee-700 text-white shadow-md shadow-coffee-700/20' 
                    : 'bg-white text-coffee-600 hover:bg-coffee-50 border border-coffee-100'
                }`}
              >
                {lm.TenLM}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-coffee-200 border-t-gold rounded-full animate-spin mb-4"></div>
            <p className="text-coffee-400 font-medium text-sm">Đang tải thực đơn...</p>
          </div>
        ) : filteredMons.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-coffee-100/50 shadow-sm">
            <span className="text-5xl block mb-4">☕</span>
            <h3 className="font-heading text-lg font-bold text-coffee-800">Không tìm thấy món nào</h3>
            <p className="text-sm text-coffee-400 mt-1">Vui lòng thử chọn danh mục hoặc tìm kiếm khác</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMons.map(mon => {
              const prices = mon.chiTiet.map(ct => ct.Gia);
              const minPrice = prices.length ? Math.min(...prices) : 0;
              const maxPrice = prices.length ? Math.max(...prices) : 0;

              return (
                <div key={mon.MaMon} className="group bg-white rounded-2xl overflow-hidden border border-coffee-100/50 shadow-sm hover:shadow-xl hover:shadow-coffee-900/5 transition-all duration-300 hover:-translate-y-1 flex flex-col">
                  {/* Image container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-coffee-50">
                    <img 
                      src={mon.HinhAnh ? `${API_URL}${mon.HinhAnh}` : '/placeholder.jpg'} 
                      alt={mon.TenMon} 
                      onError={(e) => e.target.src = '/placeholder.jpg'} 
                      className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-700"
                    />
                    {mon.chiTiet?.length > 1 && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 bg-coffee-800/80 text-white text-[10px] font-semibold tracking-wider rounded-full backdrop-blur-sm">
                        {mon.chiTiet.length} SIZES
                      </span>
                    )}
                  </div>
                  
                  {/* Info container */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-gold tracking-widest uppercase">{mon.TenLM}</span>
                      <h3 className="font-heading font-bold text-coffee-800 text-base group-hover:text-gold transition-colors duration-300 line-clamp-1">{mon.TenMon}</h3>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-coffee-300 uppercase tracking-wider font-semibold">Giá từ</span>
                        <span className="font-bold text-coffee-800 text-sm">
                          {minPrice === maxPrice 
                            ? `${Number(minPrice).toLocaleString()}đ` 
                            : `${Number(minPrice).toLocaleString()}đ - ${Number(maxPrice).toLocaleString()}đ`}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleAddToCart(mon)} 
                        className="w-9 h-9 flex items-center justify-center bg-coffee-700 hover:bg-gold text-white hover:text-coffee-900 rounded-xl transition-all duration-300 shadow-md shadow-coffee-700/10 hover:shadow-gold/20 hover:scale-105 active:scale-95"
                        title="Thêm vào giỏ hàng"
                      >
                        <Plus size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}