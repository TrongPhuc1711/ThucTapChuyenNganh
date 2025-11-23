import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css"; 
import api from "../services/api"; 

const API_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  const navigate = useNavigate();

  // Thêm các state để lưu dữ liệu từ API
  const [mons, setMons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Thêm useEffect để tải dữ liệu khi trang được mở
  useEffect(() => {
    const loadMons = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/mon");
        
        // Load chi tiết món (giá/size) cho mỗi món
        const monsWithDetails = await Promise.all(
          res.data.map(async (mon) => {
            try {
              const detailRes = await api.get(`/chitietmon/mon/${mon.MaMon}`);
              return { ...mon, chiTiet: detailRes.data };
            } catch {
              return { ...mon, chiTiet: [] };
            }
          })
        );
        setMons(monsWithDetails);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Lỗi khi tải danh sách món");
      } finally {
        setIsLoading(false);
      }
    };

    loadMons();
  }, []); // Mảng rỗng [] nghĩa là chỉ chạy 1 lần

  const handleAddToCart = (mon) => {
    const user = localStorage.getItem('user');
    
    if (!user) {
      alert("Vui lòng đăng nhập để thêm món vào giỏ hàng!");
      navigate('/login');
      return; 
    }

    // Lấy giỏ hàng hiện tại
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    // Tạm thời chỉ xử lý 1 size (size đầu tiên)
    const sizeToAdd = mon.chiTiet[0]?.KichCo || 'Nhỏ';
    const priceToAdd = mon.chiTiet[0]?.Gia || 0;

    // 1. Kiểm tra xem món + size này đã có trong giỏ hàng chưa
    const existingItemIndex = cartItems.findIndex(
      (item) => item.MaMon === mon.MaMon && item.KichCo === sizeToAdd
    );

    if (existingItemIndex > -1) {
      // 2. Nếu đã có, chỉ tăng số lượng
      cartItems[existingItemIndex].SoLuong += 1;
    } else {
      // 3. Nếu chưa có, thêm món mới vào
      const itemToAdd = {
        MaMon: mon.MaMon,
        TenMon: mon.TenMon,
        HinhAnh: mon.HinhAnh,
        Gia: priceToAdd,
        KichCo: sizeToAdd,
        SoLuong: 1 
      };
      cartItems.push(itemToAdd);
    }

    // Lưu giỏ hàng mới vào localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));

    // Thông báo cho người dùng
    alert(`Đã thêm "${mon.TenMon} (${sizeToAdd})" vào giỏ hàng!`);
  };
  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <h2 className="logo" onClick={() => navigate("/")}>P-Coffee</h2>
        <div className="header-buttons">
          <button onClick={() => navigate("/login")} className="btn-login">Đăng nhập</button>
          <button onClick={() => navigate("/register")} className="btn-register">Đăng ký</button>
        </div>
      </header>

      {/* Banner */}
      <section className="home-banner">
        <h1 className="home-title">Chào mừng đến với P-Coffee</h1>
        <p className="home-subtitle">
          Thưởng thức cà phê tuyệt vời, mọi lúc mọi nơi
        </p>
      </section>

      {/* Featured Products (Đã sửa lại để dùng dữ liệu động) */}
      <section className="product-section">
        <h2 className="section-title">Sản phẩm nổi bật</h2>

        {isLoading && <p style={{ textAlign: 'center' }}>Đang tải món...</p>}
        {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

        {!isLoading && !error && (
          <div className="product-list">
            {mons.length === 0 ? (
              <p style={{ textAlign: 'center' }}>Chưa có món nào được thêm.</p>
            ) : (
              // Dùng .map() để lặp qua danh sách món
              mons.map((mon) => {
                // Lấy giá của size đầu tiên (ví dụ: size Nhỏ) để hiển thị
                const displayPrice = mon.chiTiet && mon.chiTiet.length > 0 
                  ? mon.chiTiet[0].Gia 
                  : 0;
                
                // Lấy hình ảnh (nếu không có thì dùng ảnh dự phòng)
                const displayImage = mon.HinhAnh 
                  ? `${API_URL}${mon.HinhAnh}` 
                  : cafesua; // Dùng 'cafesua' làm ảnh dự phòng chung

                return (
                  <div className="product-card" key={mon.MaMon}>
                    <img 
                      src={displayImage} 
                      alt={mon.TenMon} 
                      // Thêm dự phòng nếu ảnh từ API bị lỗi
                      onError={(e) => { e.target.src = cafesua; }}
                    />
                    <h3>{mon.TenMon}</h3>
                    <p>{Number(displayPrice).toLocaleString('vi-VN')} đ</p>
                    <button onClick={() => handleAddToCart(mon)} className="btn-add">Thêm vào giỏ</button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </section>

      {/* Information Section */}
      <section className="info-section">
        <h2 className="section-title">Thông tin quán</h2>
        <div className="info-content">
          <p>
            📍 Địa chỉ: 123 Cafe, Quận 8, TP.HCM <br />
            ⏰ Giờ mở cửa: 08:00 AM - 10:00 PM
          </p>
        </div>
      </section>
    </div>
  );
};