import { useState, useEffect } from "react";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";

export default function StaffManager() {
  const [staffs, setStaffs] = useState([]); const [filteredStaffs, setFilteredStaffs] = useState([]); const [searchText, setSearchText] = useState("");
  const [form, setForm] = useState({ HoTen: "", Email: "", MatKhau: "", VaiTro: "NhanVien" });
  const [editingMa, setEditingMa] = useState(null); const [message, setMessage] = useState(""); const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { loadStaffs(); }, []);
  const loadStaffs = async () => { try { const res = await api.get("/nhanvien"); setStaffs(res.data); setFilteredStaffs(res.data); } catch (err) { console.error(err); setMessage("Không thể tải danh sách nhân viên"); } };
  useEffect(() => { const text = searchText.trim().toLowerCase(); if (text === "") setFilteredStaffs(staffs); else setFilteredStaffs(staffs.filter(nv => nv.HoTen.toLowerCase().includes(text) || nv.Email.toLowerCase().includes(text))); }, [searchText, staffs]);
  const handleSubmit = async (e) => { e.preventDefault(); if (isLoading) return; setIsLoading(true); try { if (editingMa) { await api.put(`/nhanvien/${editingMa}`, form); setMessage("Cập nhật nhân viên thành công"); } else { await api.post("/nhanvien", form); setMessage("Thêm nhân viên thành công"); } resetForm(); loadStaffs(); } catch (err) { setMessage((err.response?.data?.message || "Lỗi thao tác")); } finally { setIsLoading(false); setTimeout(() => setMessage(""), 3000); } };
  const handleEdit = (nv) => { setForm({ HoTen: nv.HoTen, Email: nv.Email, MatKhau: "", VaiTro: nv.VaiTro }); setEditingMa(nv.MaND); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleDelete = async (id) => { if (!window.confirm("Bạn có chắc muốn xóa nhân viên này?")) return; try { await api.delete(`/nhanvien/${id}`); setMessage("Đã xóa nhân viên"); loadStaffs(); } catch (err) { setMessage("Không thể xóa nhân viên này"); } finally { setTimeout(() => setMessage(""), 3000); } };
  const resetForm = () => { setForm({ HoTen: "", Email: "", MatKhau: "", VaiTro: "NhanVien" }); setEditingMa(null); };

  return (
    <DashboardLayout title="Quản Lý Nhân Viên">
      {message && <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium animate-slide-down ${message.includes('thành công') || message.includes('Đã xóa') ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>{message}</div>}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1"><div className="bg-white rounded-2xl border border-coffee-100/50 shadow-sm p-6 sticky top-6">
          <h2 className="font-heading text-xl font-bold text-coffee-800 mb-5">{editingMa ? "Sửa Nhân Viên" : "Thêm Nhân Viên Mới"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-coffee-600 mb-1.5">Họ tên *</label><input type="text" value={form.HoTen} onChange={(e) => setForm({ ...form, HoTen: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all text-sm" /></div>
            <div><label className="block text-sm font-medium text-coffee-600 mb-1.5">Email *</label><input type="email" value={form.Email} onChange={(e) => setForm({ ...form, Email: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all text-sm" /></div>
            <div><label className="block text-sm font-medium text-coffee-600 mb-1.5">Mật khẩu {editingMa ? "(để trống nếu không đổi)" : "*"}</label><input type="password" value={form.MatKhau} onChange={(e) => setForm({ ...form, MatKhau: e.target.value })} placeholder="••••••" required={!editingMa} className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all text-sm" /></div>
            <div><label className="block text-sm font-medium text-coffee-600 mb-1.5">Vai trò *</label><select value={form.VaiTro} onChange={(e) => setForm({ ...form, VaiTro: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all text-sm cursor-pointer"><option value="NhanVien">Nhân viên</option><option value="Admin">Quản trị viên</option></select></div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-coffee-700 to-coffee-600 text-white font-medium rounded-xl hover:from-coffee-600 hover:to-coffee-500 transition-all text-sm shadow-md shadow-coffee-700/20 disabled:opacity-50" disabled={isLoading}>{isLoading ? "Đang xử lý..." : editingMa ? "Cập nhật" : "Thêm mới"}</button>
              {editingMa && <button type="button" onClick={resetForm} className="px-4 py-2.5 bg-coffee-100 text-coffee-600 font-medium rounded-xl hover:bg-coffee-200 transition-all text-sm">Hủy</button>}
            </div>
          </form>
        </div></div>
        <div className="xl:col-span-2"><div className="bg-white rounded-2xl border border-coffee-100/50 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-coffee-50 flex-wrap gap-3"><h2 className="font-semibold text-coffee-800">📋 Danh Sách Nhân Viên ({filteredStaffs.length})</h2><input type="text" placeholder="Tìm theo tên hoặc email..." className="px-4 py-2 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm w-64" value={searchText} onChange={(e) => setSearchText(e.target.value)} /></div>
          {filteredStaffs.length === 0 ? <div className="p-12 text-center"><p className="text-coffee-300">Không tìm thấy nhân viên nào</p></div> : (
            <div className="overflow-x-auto"><table className="w-full"><thead><tr className="bg-coffee-50/50"><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Mã</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Họ Tên</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Email</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Vai Trò</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Ngày Tạo</th><th className="text-center px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Hành Động</th></tr></thead>
              <tbody className="divide-y divide-coffee-50">{filteredStaffs.map((nv) => (<tr key={nv.MaND} className="hover:bg-coffee-50/30 transition-colors"><td className="px-4 py-3 text-sm text-coffee-500">#{nv.MaND}</td><td className="px-4 py-3 text-sm font-medium text-coffee-800">{nv.HoTen}</td><td className="px-4 py-3 text-sm text-coffee-500">{nv.Email}</td><td className="px-4 py-3"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${nv.VaiTro === "Admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>{nv.VaiTro}</span></td><td className="px-4 py-3 text-sm text-coffee-400">{nv.NgayTao?.split("T")[0] || "—"}</td><td className="px-4 py-3"><div className="flex items-center justify-center gap-2"><button className="px-3 py-1.5 text-xs font-medium text-info bg-info-light rounded-lg hover:bg-info/10 transition-colors" onClick={() => handleEdit(nv)}>Sửa</button><button className="px-3 py-1.5 text-xs font-medium text-danger bg-danger-light rounded-lg hover:bg-danger/10 transition-colors" onClick={() => handleDelete(nv.MaND)}>Xóa</button></div></td></tr>))}</tbody></table></div>
          )}
        </div></div>
      </div>
    </DashboardLayout>
  );
}
