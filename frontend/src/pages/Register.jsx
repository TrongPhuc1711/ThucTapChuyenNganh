import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { Coffee, User, Mail, Lock, UserPlus, ArrowLeft } from "lucide-react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Register() {
  const [HoTen, setHoTen] = useState("");
  const [Email, setEmail] = useState("");
  const [MatKhau, setMatKhau] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/auth/register", { HoTen, Email, MatKhau });
      setMsg("✅ Đăng ký thành công! Đang chuyển hướng...");
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setMsg("❌ Email đã tồn tại hoặc không hợp lệ!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-[#FAF7F2]">
      
      {/* Left - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative">
        <button
          onClick={() => navigate("/")}
          className="absolute top-8 left-8 flex items-center gap-2 text-sm font-semibold text-[#6D4C41] hover:text-[#2C1810] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </button>

        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-[0_12px_40px_rgb(44,24,16,0.06)] p-8 sm:p-10 border border-[#EFEBE9]">
            
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] flex items-center justify-center mx-auto mb-3 text-[#C5963A]">
                <UserPlus className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-3xl font-bold text-[#2C1810]">Đăng Ký</h2>
              <p className="text-sm text-[#8D6E63] mt-1">Trở thành thành viên của gia đình P-Coffee</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label="Họ và tên"
                type="text"
                icon={User}
                placeholder="Nguyễn Văn A"
                value={HoTen}
                onChange={(e) => setHoTen(e.target.value)}
                required
              />

              <Input
                label="Email"
                type="email"
                icon={Mail}
                placeholder="example@email.com"
                value={Email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Mật khẩu"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                value={MatKhau}
                onChange={(e) => setMatKhau(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full mt-2 font-bold"
              >
                Tạo Tài Khoản
              </Button>
            </form>

            {msg && (
              <div className={`mt-4 text-center text-sm font-medium px-4 py-3 rounded-xl ${msg.includes("✅") ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                {msg}
              </div>
            )}

            <div className="text-center text-sm text-[#8D6E63] mt-8 pt-6 border-t border-[#FAF7F2]">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-[#C5963A] font-bold hover:underline">
                Đăng nhập ngay
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* Right - Branding Banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-bl from-[#1A0F0A] via-[#2C1810] to-[#1A0F0A] relative overflow-hidden items-center justify-center p-12 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-10 w-80 h-80 bg-[#C5963A]/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#4E342E]/40 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 text-center max-w-md space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#C5963A] to-[#D4A84B] flex items-center justify-center text-[#1A0F0A] shadow-2xl mx-auto">
            <Coffee className="w-10 h-10 text-[#1A0F0A]" />
          </div>
          
          <h1 className="font-serif text-5xl font-bold tracking-tight text-white">
            P-COFFEE
          </h1>
          <p className="text-[#D7CCC8] text-base leading-relaxed font-light">
            Nhận ngay các voucher ưu đãi độc quyền và tích điểm đổi quà khi đăng ký thành viên.
          </p>

          <div className="pt-4 flex items-center justify-center gap-2 text-xs text-[#A1887F]">
            <span>Tích điểm thưởng</span>
            <span>•</span>
            <span>Ưu đãi sinh nhật</span>
            <span>•</span>
            <span>Quà tặng bất ngờ</span>
          </div>
        </div>
      </div>

    </div>
  );
}
