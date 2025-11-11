import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import cafeden from "../assets/image/capheden.jpg";
import cafesua from "../assets/image/caphesua.jpg";
import bacxiu from "../assets/image/bacxiu.jpg";

export default function Home() {
  const navigate = useNavigate();

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

      {/* Featured Products */}
      <section className="product-section">
        <h2 className="section-title">Sản phẩm nổi bật</h2>
        <div className="product-list">
          <div className="product-card">
            <img src={cafesua} alt="Cà phê sữa đá" />
            <h3>Cà phê sữa đá</h3>
            <p>25,000 đ</p>
            <button className="btn-add">Thêm vào giỏ</button>
          </div>
          <div className="product-card">
            <img src={cafeden} alt="Cà phê đen" />
            <h3>Cà phê đen đá</h3>
            <p>20,000 đ</p>
            <button className="btn-add">Thêm vào giỏ</button>
          </div>
          <div className="product-card">
            <img src={bacxiu} alt="Bạc xỉu" />
            <h3>Bạc xỉu</h3>
            <p>30,000 đ</p>
            <button className="btn-add">Thêm vào giỏ</button>
          </div>
        </div>
      </section>

      {/* Information Section */}
      <section className="info-section">
        <h2 className="section-title">Thông tin quán</h2>
        <div className="info-content">
          <p>
            📍 Địa chỉ: 123 Cafe, Quận 9, TP.HCM <br />
            ⏰ Giờ mở cửa: 08:00 AM - 10:00 PM
          </p>
        </div>
      </section>
    </div>
  );
}
