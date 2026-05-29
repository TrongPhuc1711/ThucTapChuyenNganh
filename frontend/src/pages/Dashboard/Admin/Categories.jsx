import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";

export default function Categories() {
  const navigate = useNavigate();
  const [loaiMons, setLoaiMons] = useState([]);
  const [loaiMonForm, setLoaiMonForm] = useState({ TenLM: "", MoTa: "" });
  const [editingLoaiMon, setEditingLoaiMon] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => { loadLoaiMons(); }, []);
  const loadLoaiMons = async () => { try { const res = await api.get("/loaimon"); setLoaiMons(res.data); } catch (err) { console.error(err); setMessage("Lỗi khi tải danh sách loại món"); } };
  const handleSubmit = async (e) => { e.preventDefault(); try { if (editingLoaiMon) { await api.put(`/loaimon/${editingLoaiMon}`, loaiMonForm); setMessage("✅Cập nhật loại món thành công"); } else { await api.post("/loaimon", loaiMonForm); setMessage("✅Thêm loại món thành công"); } setLoaiMonForm({ TenLM: "", MoTa: "" }); setEditingLoaiMon(null); loadLoaiMons(); setTimeout(() => setMessage(""), 3000); } catch (err) { setMessage("❌ " + (err.response?.data?.message || "Có lỗi xảy ra")); setTimeout(() => setMessage(""), 3000); } };
  const handleEdit = (loaiMon) => { setLoaiMonForm({ TenLM: loaiMon.TenLM, MoTa: loaiMon.MoTa || "" }); setEditingLoaiMon(loaiMon.MaLM); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleDelete = async (id) => { if (!window.confirm("Bạn có chắc muốn xóa loại món này?")) return; try { await api.delete(`/loaimon/${id}`); setMessage("✅ Xóa loại món thành công"); loadLoaiMons(); setTimeout(() => setMessage(""), 3000); } catch (err) { setMessage("❌ " + (err.response?.data?.message || "Không thể xóa")); setTimeout(() => setMessage(""), 3000); } };
  const cancelEdit = () => { setLoaiMonForm({ TenLM: "", MoTa: "" }); setEditingLoaiMon(null); };

  return (
    <DashboardLayout title="Quản lý loại món">
      {message && <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium animate-slide-down ${message.includes('✅') ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>{message}</div>}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl border border-coffee-100/50 shadow-sm p-6 sticky top-6">
            <h2 className="font-heading text-xl font-bold text-coffee-800 mb-5">{editingLoaiMon ? "✏️ Sửa Loại Món" : "➕ Thêm Loại Món Mới"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-coffee-600 mb-1.5">Tên loại món *</label><input type="text" placeholder="Ví dụ: Cà phê, Trà, Sinh tố..." value={loaiMonForm.TenLM} onChange={(e) => setLoaiMonForm({ ...loaiMonForm, TenLM: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all text-sm" /></div>
              <div><label className="block text-sm font-medium text-coffee-600 mb-1.5">Mô tả</label><textarea placeholder="Mô tả về loại món này..." value={loaiMonForm.MoTa} onChange={(e) => setLoaiMonForm({ ...loaiMonForm, MoTa: e.target.value })} rows="3" className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all text-sm resize-none" /></div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-coffee-700 to-coffee-600 text-white font-medium rounded-xl hover:from-coffee-600 hover:to-coffee-500 transition-all text-sm shadow-md shadow-coffee-700/20">{editingLoaiMon ? "💾 Cập nhật" : "➕ Thêm mới"}</button>
                {editingLoaiMon && <button type="button" onClick={cancelEdit} className="px-4 py-2.5 bg-coffee-100 text-coffee-600 font-medium rounded-xl hover:bg-coffee-200 transition-all text-sm">Hủy</button>}
              </div>
            </form>
          </div>
        </div>
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-coffee-100/50 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-coffee-50"><h2 className="font-semibold text-coffee-800">📋 Danh Sách Loại Món ({loaiMons.length})</h2></div>
            {loaiMons.length === 0 ? <div className="p-12 text-center"><p className="text-coffee-300">Chưa có loại món nào.</p></div> : (
              <div className="overflow-x-auto"><table className="w-full"><thead><tr className="bg-coffee-50/50"><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Mã</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Tên Loại Món</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Mô Tả</th><th className="text-center px-4 py-3 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Hành Động</th></tr></thead>
                <tbody className="divide-y divide-coffee-50">{loaiMons.map((lm) => (<tr key={lm.MaLM} className="hover:bg-coffee-50/30 transition-colors"><td className="px-4 py-3 text-sm text-coffee-500">#{lm.MaLM}</td><td className="px-4 py-3 text-sm font-medium text-coffee-800">{lm.TenLM}</td><td className="px-4 py-3 text-sm text-coffee-400">{lm.MoTa || "—"}</td><td className="px-4 py-3"><div className="flex items-center justify-center gap-2"><button onClick={() => handleEdit(lm)} className="px-3 py-1.5 text-xs font-medium text-info bg-info-light rounded-lg hover:bg-info/10 transition-colors">Sửa</button><button onClick={() => handleDelete(lm.MaLM)} className="px-3 py-1.5 text-xs font-medium text-danger bg-danger-light rounded-lg hover:bg-danger/10 transition-colors">Xóa</button></div></td></tr>))}</tbody></table></div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}