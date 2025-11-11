import { useState } from "react";
import "../styles/Login.css";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [Email, setEmail] = useState("");
  const [MatKhau, setMatKhau] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { Email, MatKhau });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setMsg("✅Đăng nhập thành công!");

      const role = res.data.user.VaiTro;
      if (role === "Admin") navigate("/admin");
      else if (role === "NhanVien") navigate("/staff");
      else navigate("/customer");
    } catch (err) {
      setMsg("❌Sai email hoặc mật khẩu!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Đăng nhập</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email"
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
          <button type="submit">Đăng nhập</button>
        </form>
        {msg && <p className="message">{msg}</p>}

        <p className="switch-text">
          Là khách hàng mới? <a href="/register">Đăng ký ngay</a>
        </p>
      </div>
    </div>
  );
}
