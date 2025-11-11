import { useState } from "react";
import "../styles/Register.css";
import api from "../services/api";
export default function Register() {
  const [HoTen, setHoTen] = useState("");
  const [Email, setEmail] = useState("");
  const [MatKhau, setMatKhau] = useState("");
  const [msg, setMsg] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", { HoTen, Email, MatKhau });
      setMsg("✅ Đăng ký thành công!");
    } catch (err) {
      setMsg("❌ Email đã tồn tại!");
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Đăng ký tài khoản</h2>
        <form onSubmit={handleRegister}>
          <input type="text"
            placeholder="Họ và tên"
            value={HoTen}
            onChange={(e) => setHoTen(e.target.value)}
            required
          />
          <input type="email"
            placeholder="Email"
            value={Email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input type="password"
            placeholder="Mật khẩu"
            value={MatKhau}
            onChange={(e) => setMatKhau(e.target.value)}
            required
          />
          <button type="submit">Đăng ký</button>
        </form>
        {msg && <p className="message">{msg}</p>}
        <p className="switch-text">
          Đã có tài khoản?<a href="/login">Đăng nhập</a>
        </p>
      </div>
    </div>
  );
}
