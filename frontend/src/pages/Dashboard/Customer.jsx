import { useState } from "react";
import "../../styles/Dashboard/Customer.css";
import cafeden from '../../assets/image/capheden.jpg';
import cafesua from '../../assets/image/caphesua.jpg';
import bacxiu from '../../assets/image/bacxiu.jpg';
export default function Customer() {
  return (
    <div className="customer-container">
      <h1>Chào mừng bạn đến với P-Coffee ☕</h1>

      <div className="customer-menu">
        <div className="menu-card">
          <img src={cafesua} alt="Cà phê sữa" />
          <h3>Cà phê sữa đá</h3>
          <p>25.000 đ</p>
          <button>Thêm vào giỏ</button>
        </div>

        <div className="menu-card">
          <img src={cafeden} alt="Cà phê đen" />
          <h3>Cà phê đen đá</h3>
          <p>20.000 đ</p>
          <button>Thêm vào giỏ</button>
        </div>

        <div className="menu-card">
          <img src={bacxiu} alt="Bạc xỉu" />
          <h3>Bạc xỉu</h3>
          <p>30.000 đ</p>
          <button>Thêm vào giỏ</button>
        </div>
      </div>
    </div>
  );
}
