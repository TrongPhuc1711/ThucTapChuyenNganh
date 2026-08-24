import { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Users, Search, Phone, Mail, MapPin } from "lucide-react";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

export default function CustomerManager() {
  const [customers, setCustomers] = useState([]); 
  const [filteredCustomers, setFilteredCustomers] = useState([]); 
  const [searchText, setSearchText] = useState("");
  const [form, setForm] = useState({ HoTen: "", Email: "", MatKhau: "", DiaChi: "", SDT: "" });
  const [editingMa, setEditingMa] = useState(null); 
  const [message, setMessage] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { 
    loadCustomers(); 
  }, []);

  const loadCustomers = async () => { 
    try { 
      const res = await api.get("/khachhang"); 
      setCustomers(res.data || []); 
      setFilteredCustomers(res.data || []); 
    } catch (err) { 
      console.error(err); 
      setMessage("❌ Không thể tải danh sách khách hàng"); 
    } 
  };

  useEffect(() => { 
    const text = searchText.trim().toLowerCase(); 
    if (text === "") {
      setFilteredCustomers(customers); 
    } else {
      setFilteredCustomers(customers.filter(kh => 
        (kh.HoTen && kh.HoTen.toLowerCase().includes(text)) || 
        (kh.Email && kh.Email.toLowerCase().includes(text)) || 
        (kh.DiaChi && kh.DiaChi.toLowerCase().includes(text)) || 
        (kh.SDT && kh.SDT.includes(text))
      )); 
    }
  }, [searchText, customers]);

  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    if (isLoading) return; 
    if (!form.HoTen || !form.Email) { 
      setMessage("❌ Họ tên và Email không được để trống"); 
      return; 
    } 
    if (!editingMa && !form.MatKhau) { 
      setMessage("❌ Mật khẩu không được để trống khi tạo mới"); 
      return; 
    } 

    setIsLoading(true); 
    try { 
      if (editingMa) { 
        await api.put(`/khachhang/${editingMa}`, { 
          HoTen: form.HoTen, 
          Email: form.Email, 
          DiaChi: form.DiaChi, 
          SDT: form.SDT 
        }); 
        setMessage("✅ Cập nhật thông tin khách hàng thành công!"); 
      } else { 
        await api.post("/khachhang", { 
          HoTen: form.HoTen, 
          Email: form.Email, 
          MatKhau: form.MatKhau, 
          DiaChi: form.DiaChi, 
          SDT: form.SDT 
        }); 
        setMessage("✅ Thêm khách hàng mới thành công!"); 
      } 
      resetForm(); 
      loadCustomers(); 
    } catch (err) { 
      setMessage("❌ " + (err.response?.data?.message || "Lỗi thao tác")); 
    } finally { 
      setIsLoading(false); 
      setTimeout(() => setMessage(""), 3500); 
    } 
  };

  const handleEdit = (kh) => { 
    setForm({ 
      HoTen: kh.HoTen, 
      Email: kh.Email, 
      MatKhau: "", 
      DiaChi: kh.DiaChi || "", 
      SDT: kh.SDT || "" 
    }); 
    setEditingMa(kh.MaND); 
    window.scrollTo({ top: 0, behavior: "smooth" }); 
  };

  const handleDelete = async (id) => { 
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản khách hàng này?")) return; 
    try { 
      await api.delete(`/khachhang/${id}`); 
      setMessage("✅ Đã xóa khách hàng thành công!"); 
      loadCustomers(); 
    } catch (err) { 
      setMessage("❌ Không thể xóa khách hàng này"); 
    } finally { 
      setTimeout(() => setMessage(""), 3500); 
    } 
  };

  const resetForm = () => { 
    setForm({ HoTen: "", Email: "", MatKhau: "", DiaChi: "", SDT: "" }); 
    setEditingMa(null); 
  };

  return (
    <DashboardLayout title="Quản Lý Khách Hàng">
      {message && (
        <div className={`mb-6 px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-md animate-slide-down flex items-center gap-2 ${
          message.includes('✅') 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
            : 'bg-rose-50 text-rose-700 border border-rose-100'
        }`}>
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Form Column */}
        <div className="xl:col-span-4">
          <div className="bg-white rounded-3xl border border-[#EFEBE9] shadow-sm p-6 sm:p-8 sticky top-24 space-y-6">
            <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-4">
              <h2 className="font-serif text-xl font-bold text-[#2C1810] flex items-center gap-2">
                {editingMa ? <Edit3 className="w-5 h-5 text-[#C5963A]" /> : <Plus className="w-5 h-5 text-[#C5963A]" />}
                <span>{editingMa ? "Sửa Khách Hàng" : "Thêm Khách Hàng"}</span>
              </h2>
              {editingMa && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5963A] bg-[#C5963A]/10 px-2.5 py-1 rounded-full">
                  Mã #{editingMa}
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Họ và tên"
                placeholder="Nhập tên khách hàng"
                value={form.HoTen}
                onChange={(e) => setForm({ ...form, HoTen: e.target.value })}
                required
              />

              <Input
                label="Email"
                type="email"
                placeholder="khachhang@email.com"
                value={form.Email}
                onChange={(e) => setForm({ ...form, Email: e.target.value })}
                required
              />

              <Input
                label={`Mật khẩu ${editingMa ? "(Để trống nếu không đổi)" : ""}`}
                type="password"
                placeholder="••••••••"
                value={form.MatKhau}
                onChange={(e) => setForm({ ...form, MatKhau: e.target.value })}
                required={!editingMa}
              />

              <Input
                label="Số điện thoại"
                type="tel"
                placeholder="0912 345 678"
                value={form.SDT}
                onChange={(e) => setForm({ ...form, SDT: e.target.value })}
              />

              <Input
                label="Địa chỉ giao hàng"
                placeholder="Địa chỉ số nhà, tên đường..."
                value={form.DiaChi}
                onChange={(e) => setForm({ ...form, DiaChi: e.target.value })}
              />

              <div className="flex gap-3 pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isLoading}
                  className="flex-1 font-bold"
                >
                  {editingMa ? "Lưu Thay Đổi" : "Tạo Khách Hàng"}
                </Button>
                {editingMa && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2.5 bg-[#EFEBE9] hover:bg-[#D7CCC8] text-[#4E342E] text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Table Column */}
        <div className="xl:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-[#EFEBE9] shadow-sm overflow-hidden">
            
            <div className="p-6 border-b border-[#FAF7F2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#2C1810]">
                  Hồ Sơ Khách Hàng ({filteredCustomers.length})
                </h3>
                <p className="text-xs text-[#8D6E63] mt-0.5">
                  Lịch sử hội viên thân thiết P-Coffee
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1887F]" />
                <input
                  type="text"
                  placeholder="Tìm tên, email, SĐT..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFEBE9] text-xs font-medium text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#C5963A]/30"
                />
              </div>
            </div>

            {filteredCustomers.length === 0 ? (
              <div className="p-16 text-center">
                <Users className="w-12 h-12 text-[#A1887F] mx-auto mb-3 opacity-40" />
                <p className="font-serif font-bold text-base text-[#2C1810]">Không tìm thấy khách hàng nào</p>
                <p className="text-xs text-[#8D6E63] mt-1">Các tài khoản đăng ký sẽ hiển thị tại đây.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#FAF7F2] border-b border-[#EFEBE9]">
                      <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">Mã</th>
                      <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">Khách Hàng</th>
                      <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">Email</th>
                      <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">SĐT</th>
                      <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">Địa Chỉ</th>
                      <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider text-center">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FAF7F2] text-sm">
                    {filteredCustomers.map((kh) => (
                      <tr key={kh.MaND} className="hover:bg-[#FAF7F2]/60 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-xs text-[#A1887F]">
                          #{kh.MaND}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C5963A] to-[#D4A84B] text-[#1A0F0A] flex items-center justify-center font-bold text-xs">
                              {kh.HoTen?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-serif font-bold text-[#2C1810]">{kh.HoTen}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-[#6D4C41]">
                          {kh.Email}
                        </td>
                        <td className="px-5 py-4 text-xs font-mono text-[#6D4C41]">
                          {kh.SDT || <span className="text-[#A1887F] italic">—</span>}
                        </td>
                        <td className="px-5 py-4 text-xs text-[#8D6E63] max-w-[160px] truncate" title={kh.DiaChi}>
                          {kh.DiaChi || <span className="text-[#A1887F] italic">Tại quầy</span>}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(kh)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(kh.MaND)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                              title="Xóa tài khoản"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}