import { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, UserCheck, Search, Shield, User } from "lucide-react";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

export default function StaffManager() {
  const [staffs, setStaffs] = useState([]); 
  const [filteredStaffs, setFilteredStaffs] = useState([]); 
  const [searchText, setSearchText] = useState("");
  const [form, setForm] = useState({ HoTen: "", Email: "", MatKhau: "", VaiTro: "NhanVien" });
  const [editingMa, setEditingMa] = useState(null); 
  const [message, setMessage] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { 
    loadStaffs(); 
  }, []);

  const loadStaffs = async () => { 
    try { 
      const res = await api.get("/nhanvien"); 
      setStaffs(res.data || []); 
      setFilteredStaffs(res.data || []); 
    } catch (err) { 
      console.error(err); 
      setMessage("❌ Không thể tải danh sách nhân viên"); 
    } 
  };

  useEffect(() => { 
    const text = searchText.trim().toLowerCase(); 
    if (text === "") {
      setFilteredStaffs(staffs); 
    } else {
      setFilteredStaffs(staffs.filter(nv => 
        (nv.HoTen && nv.HoTen.toLowerCase().includes(text)) || 
        (nv.Email && nv.Email.toLowerCase().includes(text))
      )); 
    }
  }, [searchText, staffs]);

  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    if (isLoading) return; 
    setIsLoading(true); 
    try { 
      if (editingMa) { 
        await api.put(`/nhanvien/${editingMa}`, form); 
        setMessage("✅ Cập nhật tài khoản nhân sự thành công!"); 
      } else { 
        await api.post("/nhanvien", form); 
        setMessage("✅ Thêm nhân sự mới thành công!"); 
      } 
      resetForm(); 
      loadStaffs(); 
    } catch (err) { 
      setMessage("❌ " + (err.response?.data?.message || "Lỗi thao tác")); 
    } finally { 
      setIsLoading(false); 
      setTimeout(() => setMessage(""), 3500); 
    } 
  };

  const handleEdit = (nv) => { 
    setForm({ HoTen: nv.HoTen, Email: nv.Email, MatKhau: "", VaiTro: nv.VaiTro }); 
    setEditingMa(nv.MaND); 
    window.scrollTo({ top: 0, behavior: "smooth" }); 
  };

  const handleDelete = async (id) => { 
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản nhân viên này?")) return; 
    try { 
      await api.delete(`/nhanvien/${id}`); 
      setMessage("✅ Đã xóa nhân viên thành công!"); 
      loadStaffs(); 
    } catch (err) { 
      setMessage("❌ Không thể xóa nhân viên này"); 
    } finally { 
      setTimeout(() => setMessage(""), 3500); 
    } 
  };

  const resetForm = () => { 
    setForm({ HoTen: "", Email: "", MatKhau: "", VaiTro: "NhanVien" }); 
    setEditingMa(null); 
  };

  return (
    <DashboardLayout title="Quản Lý Nhân Viên">
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
                <span>{editingMa ? "Sửa Tài Khoản" : "Thêm Nhân Sự"}</span>
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
                placeholder="Ví dụ: Nguyễn Văn A"
                value={form.HoTen}
                onChange={(e) => setForm({ ...form, HoTen: e.target.value })}
                required
              />

              <Input
                label="Email đăng nhập"
                type="email"
                placeholder="staff@pcoffee.com"
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

              <div>
                <label className="block text-xs font-semibold text-[#4E342E] uppercase tracking-wider mb-1.5">
                  Phân quyền vai trò *
                </label>
                <select
                  value={form.VaiTro}
                  onChange={(e) => setForm({ ...form, VaiTro: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFEBE9] text-[#2C1810] text-sm focus:outline-none focus:ring-2 focus:ring-[#C5963A]/30 font-medium cursor-pointer"
                >
                  <option value="NhanVien">Nhân viên quầy (NhanVien)</option>
                  <option value="Admin">Quản trị viên toàn quyền (Admin)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isLoading}
                  className="flex-1 font-bold"
                >
                  {editingMa ? "Cập Nhật Hồ Sơ" : "Tạo Tài Khoản"}
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
                  Danh Sách Nhân Sự ({filteredStaffs.length})
                </h3>
                <p className="text-xs text-[#8D6E63] mt-0.5">
                  Quản lý quyền hạn đăng nhập hệ thống
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1887F]" />
                <input
                  type="text"
                  placeholder="Tìm tên hoặc email..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFEBE9] text-xs font-medium text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#C5963A]/30"
                />
              </div>
            </div>

            {filteredStaffs.length === 0 ? (
              <div className="p-16 text-center">
                <UserCheck className="w-12 h-12 text-[#A1887F] mx-auto mb-3 opacity-40" />
                <p className="font-serif font-bold text-base text-[#2C1810]">Không tìm thấy nhân viên nào</p>
                <p className="text-xs text-[#8D6E63] mt-1">Hãy thêm nhân sự đầu tiên của cửa hàng.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#FAF7F2] border-b border-[#EFEBE9]">
                      <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">Mã</th>
                      <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">Họ & Tên</th>
                      <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">Email</th>
                      <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">Vai Trò</th>
                      <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">Ngày Tạo</th>
                      <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider text-center">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FAF7F2] text-sm">
                    {filteredStaffs.map((nv) => (
                      <tr key={nv.MaND} className="hover:bg-[#FAF7F2]/60 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-xs text-[#A1887F]">
                          #{nv.MaND}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2C1810] to-[#4E342E] text-white flex items-center justify-center font-bold text-xs">
                              {nv.HoTen?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-serif font-bold text-[#2C1810]">{nv.HoTen}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-[#6D4C41]">
                          {nv.Email}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1 text-[11px] font-bold rounded-full ${
                            nv.VaiTro === "Admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {nv.VaiTro === "Admin" ? "Quản Trị Viên" : "Nhân Viên"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs font-mono text-[#8D6E63]">
                          {nv.NgayTao ? new Date(nv.NgayTao).toLocaleDateString('vi-VN') : "—"}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(nv)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(nv.MaND)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                              title="Xóa nhân viên"
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
