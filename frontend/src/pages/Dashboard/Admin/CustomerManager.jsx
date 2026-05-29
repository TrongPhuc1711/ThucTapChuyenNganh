import { useState, useEffect } from "react";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";

export default function CustomerManager() {
  const [customers, setCustomers] = useState([]); const [filteredCustomers, setFilteredCustomers] = useState([]); const [searchText, setSearchText] = useState("");
  const [form, setForm] = useState({ HoTen: "", Email: "", MatKhau: "", DiaChi: "", SDT: "" });
  const [editingMa, setEditingMa] = useState(null); const [message, setMessage] = useState(""); const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { loadCustomers(); }, []);
  const loadCustomers = async () => { try { const res = await api.get("/khachhang"); setCustomers(res.data); setFilteredCustomers(res.data); } catch (err) { console.error(err); setMessage("Không thể tải danh sách khách hàng"); } };
  useEffect(() => { const text = searchText.trim().toLowerCase(); if (text === "") setFilteredCustomers(customers); else setFilteredCustomers(customers.filter(kh => kh.HoTen?.toLowerCase().includes(text) || kh.Email?.toLowerCase().includes(text) || kh.DiaChi?.toLowerCase().includes(text) || kh.SDT?.includes(text))); }, [searchText, customers]);
  const handleSubmit = async (e) => { e.preventDefault(); if (isLoading) return; if (!form.HoTen || !form.Email) { setMessage("Họ tên và Email không được để trống"); return; } if (!editingMa && !form.MatKhau) { setMessage("Mật khẩu không được để trống"); return; } setIsLoading(true); try { if (editingMa) { await api.put(`/khachhang/${editingMa}`, { HoTen: form.HoTen, Email: form.Email, DiaChi: form.DiaChi, SDT: form.SDT }); setMessage("Cập nhật khách hàng thành công"); } else { await api.post("/khachhang", { HoTen: form.HoTen, Email: form.Email, MatKhau: form.MatKhau, DiaChi: form.DiaChi, SDT: form.SDT }); setMessage("Thêm khách hàng thành công"); } resetForm(); loadCustomers(); } catch (err) { setMessage(err.response?.data?.message || "Lỗi thao tác"); } finally { setIsLoading(false); setTimeout(() => setMessage(""), 3000); } };
  const handleEdit = (kh) => { setForm({ HoTen: kh.HoTen, Email: kh.Email, MatKhau: "", DiaChi: kh.DiaChi || "", SDT: kh.SDT || "" }); setEditingMa(kh.MaND); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleDelete = async (id) => { if (!window.confirm("Bạn có chắc muốn xóa khách hàng này?")) return; try { await api.delete(`/khachhang/${id}`); setMessage("Đã xóa khách hàng"); loadCustomers(); } catch (err) { setMessage(err.response?.data?.message || "Không thể xóa khách hàng này"); } finally { setTimeout(() => setMessage(""), 3000); } };
  const resetForm = () => { setForm({ HoTen: "", Email: "", MatKhau: "", DiaChi: "", SDT: "" }); setEditingMa(null); };

  return (
    <DashboardLayout title="Quản Lý Khách Hàng">
      {message && <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium animate-slide-down ${message.includes('thành công') || message.includes('Đã xóa') ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>{message}</div>}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1"><div className="bg-white rounded-2xl border border-coffee-100/50 shadow-sm p-6 sticky top-6">
          <h2 className="font-heading text-xl font-bold text-coffee-800 mb-5">{editingMa ? "Sửa Thông Tin" : "Thêm Khách Hàng Mới"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-coffee-600 mb-1.5">Họ Tên *</label><input type="text" value={form.HoTen} onChange={(e) => setForm({ ...form, HoTen: e.target.value })} placeholder="Nhập họ tên" required className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all text-sm" /></div>
            <div><label className="block text-sm font-medium text-coffee-600 mb-1.5">Email *</label><input type="email" value={form.Email} onChange={(e) => setForm({ ...form, Email: e.target.value })} placeholder="Nhập email" required className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all text-sm" /></div>
            <div><label className="block text-sm font-medium text-coffee-600 mb-1.5">Mật khẩu {editingMa ? "(để trống nếu không đổi)" : "*"}</label><input type="password" value={form.MatKhau} onChange={(e) => setForm({ ...form, MatKhau: e.target.value })} placeholder="••••••••" required={!editingMa} className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all text-sm" /></div>
            <div><label className="block text-sm font-medium text-coffee-600 mb-1.5">SĐT</label><input type="tel" value={form.SDT} onChange={(e) => setForm({ ...form, SDT: e.target.value })} placeholder="0123456789" className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all text-sm" /></div>
            <div><label className="block text-sm font-medium text-coffee-600 mb-1.5">Địa chỉ</label><input type="text" value={form.DiaChi} onChange={(e) => setForm({ ...form, DiaChi: e.target.value })} placeholder="Nhập địa chỉ" className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all text-sm" /></div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-coffee-700 to-coffee-600 text-white font-medium rounded-xl hover:from-coffee-600 hover:to-coffee-500 transition-all text-sm shadow-md shadow-coffee-700/20 disabled:opacity-50" disabled={isLoading}>{isLoading ? "Đang xử lý..." : editingMa ? "Cập nhật" : "Thêm mới"}</button>
              {editingMa && <button type="button" onClick={resetForm} className="px-4 py-2.5 bg-coffee-100 text-coffee-600 font-medium rounded-xl hover:bg-coffee-200 transition-all text-sm">Hủy</button>}
            </div>
          </form>
        </div></div>
        <div className="xl:col-span-2"><div className="bg-white rounded-2xl border border-coffee-100/50 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-coffee-50 flex-wrap gap-3"><h2 className="font-semibold text-coffee-800">Danh Sách Khách Hàng ({filteredCustomers.length})</h2><input type="text" placeholder="Tìm theo tên, email, sdt..." className="px-4 py-2 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm w-64" value={searchText} onChange={(e) => setSearchText(e.target.value)} /></div>
          {filteredCustomers.length === 0 ? <div className="p-12 text-center"><p className="text-coffee-300">Không tìm thấy khách hàng nào</p></div> : (
            <div className="overflow-x-auto"><table className="w-full"><thead><tr className="bg-coffee-50/50"><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Mã</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Họ Tên</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Email</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">SĐT</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Địa Chỉ</th><th className="text-center px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Hành Động</th></tr></thead>
              <tbody className="divide-y divide-coffee-50">{filteredCustomers.map((kh) => (<tr key={kh.MaND} className="hover:bg-coffee-50/30 transition-colors"><td className="px-4 py-3 text-sm text-coffee-500">#{kh.MaND}</td><td className="px-4 py-3 text-sm font-medium text-coffee-800">{kh.HoTen}</td><td className="px-4 py-3 text-sm text-coffee-500">{kh.Email}</td><td className="px-4 py-3 text-sm text-coffee-500">{kh.SDT || "—"}</td><td className="px-4 py-3 text-sm text-coffee-400 max-w-[150px] truncate">{kh.DiaChi || "—"}</td><td className="px-4 py-3"><div className="flex items-center justify-center gap-2"><button className="px-3 py-1.5 text-xs font-medium text-info bg-info-light rounded-lg hover:bg-info/10 transition-colors" onClick={() => handleEdit(kh)}>Sửa</button><button className="px-3 py-1.5 text-xs font-medium text-danger bg-danger-light rounded-lg hover:bg-danger/10 transition-colors" onClick={() => handleDelete(kh.MaND)}>Xóa</button></div></td></tr>))}</tbody></table></div>
          )}
        </div></div>
      </div>
    </DashboardLayout>
  );
}