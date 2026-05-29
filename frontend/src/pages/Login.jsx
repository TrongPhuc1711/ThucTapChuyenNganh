import { useState } from "react";
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
      localStorage.setItem("token", res.data.token);
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
    <div className="min-h-screen flex font-sans">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-coffee-900 via-coffee-800 to-coffee-700 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-coffee-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
        </div>
        <div className="relative z-10 text-center max-w-md animate-fade-in">
          <div className="text-7xl mb-6">☕</div>
          <h1 className="font-heading text-5xl font-bold text-white mb-4">P-Coffee</h1>
          <p className="text-coffee-200 text-lg leading-relaxed">Thưởng thức cà phê tuyệt vời, mọi lúc mọi nơi</p>
          <div className="mt-8 w-16 h-1 bg-gradient-to-r from-gold to-gold-light rounded-full mx-auto"></div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-cream">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden text-center mb-8">
            <h1 className="font-heading text-3xl font-bold text-coffee-800">P-Coffee ☕</h1>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-coffee-900/5 p-8 border border-coffee-100/50">
            <div className="text-center mb-8">
              <h2 className="font-heading text-3xl font-bold text-coffee-800 mb-2">Đăng nhập</h2>
              <p className="text-coffee-400">Chào mừng bạn quay lại</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-coffee-600 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={Email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-coffee-600 mb-2">Mật khẩu</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={MatKhau}
                  onChange={(e) => setMatKhau(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-coffee-700 to-coffee-600 text-white font-semibold rounded-xl hover:from-coffee-600 hover:to-coffee-500 transition-all duration-300 shadow-md shadow-coffee-700/20 hover:shadow-lg hover:shadow-coffee-700/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                Đăng nhập
              </button>
            </form>

            {msg && (
              <div className={`mt-4 text-center text-sm font-medium px-4 py-3 rounded-xl animate-slide-down ${msg.includes('✅') ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>
                {msg}
              </div>
            )}

            <p className="text-center text-coffee-400 mt-6 text-sm">
              Là khách hàng mới?{' '}
              <a href="/register" className="text-gold font-semibold hover:text-gold-dark transition-colors">
                Đăng ký ngay
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
