import { useState, useEffect } from "react";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";

const API_URL = import.meta.env.DEV 
  ? "http://localhost:4000" 
  : (import.meta.env.VITE_API_URL || "https://thuctapchuyennganh.onrender.com");

export default function Products() {
  const [mons, setMons] = useState([]);
  const [loaiMons, setLoaiMons] = useState([]);
  const [monForm, setMonForm] = useState({ TenMon: "", MoTa: "", MaLM: "" });
  const [chiTietMonForm, setChiTietMonForm] = useState([
    { KichCo: "Nhỏ", Gia: "", TrangThai: "Còn bán" },
    { KichCo: "Vừa", Gia: "", TrangThai: "Còn bán" },
    { KichCo: "Lớn", Gia: "", TrangThai: "Còn bán" }
  ]);
  const [hinhAnhFile, setHinhAnhFile] = useState(null);
  const [hinhAnhPreview, setHinhAnhPreview] = useState("");
  const [editingMon, setEditingMon] = useState(null);
  const [message, setMessage] = useState("");
  const [filterLoai, setFilterLoai] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMon, setExpandedMon] = useState(null);

  useEffect(() => { loadLoaiMons(); loadMons(); }, []);

  const loadLoaiMons = async () => { try { const res = await api.get("/loaimon"); setLoaiMons(res.data); } catch (err) { console.error(err); setMessage("❌ Lỗi khi tải loại món"); } };
  const loadMons = async () => { try { const res = await api.get("/mon"); const monsWithDetails = await Promise.all(res.data.map(async (mon) => { try { const detailRes = await api.get(`/chitietmon/mon/${mon.MaMon}`); return { ...mon, chiTiet: detailRes.data }; } catch { return { ...mon, chiTiet: [] }; } })); setMons(monsWithDetails); } catch (err) { console.error(err); setMessage("❌ Lỗi khi tải danh sách món"); } };

  const handleSubmit = async (e) => {
    e.preventDefault(); if (isLoading) return; setIsLoading(true);
    const formData = new FormData();
    formData.append('TenMon', monForm.TenMon); formData.append('MoTa', monForm.MoTa); formData.append('MaLM', monForm.MaLM);
    if (hinhAnhFile) formData.append('HinhAnh', hinhAnhFile);
    const validChiTiet = chiTietMonForm.filter(ct => ct.Gia && ct.Gia > 0);
    formData.append('ChiTietMon', JSON.stringify(validChiTiet));
    try {
      if (editingMon) { await api.put(`/mon/${editingMon}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); setMessage("✅ Cập nhật món thành công"); }
      else { await api.post("/mon", formData, { headers: { 'Content-Type': 'multipart/form-data' } }); setMessage("✅ Thêm món thành công"); }
      cancelEdit(); loadMons(); setTimeout(() => setMessage(""), 3000);
    } catch (err) { setMessage("❌ " + (err.response?.data?.message || "Có lỗi xảy ra")); } finally { setIsLoading(false); setTimeout(() => setMessage(""), 3000); }
  };

  const handleFileChange = (e) => { const file = e.target.files?.[0]; if (file) { setHinhAnhFile(file); setHinhAnhPreview(URL.createObjectURL(file)); } };
  const handleChiTietChange = (index, field, value) => { const newChiTiet = [...chiTietMonForm]; newChiTiet[index][field] = value; setChiTietMonForm(newChiTiet); };

  const handleEdit = (mon) => {
    setMonForm({ TenMon: mon.TenMon, MoTa: mon.MoTa || "", MaLM: mon.MaLM }); setEditingMon(mon.MaMon); setHinhAnhFile(null); setHinhAnhPreview(mon.HinhAnh ? `${API_URL}${mon.HinhAnh}` : "");
    const detailsMap = { "Nhỏ": mon.chiTiet?.find(ct => ct.KichCo === "Nhỏ"), "Vừa": mon.chiTiet?.find(ct => ct.KichCo === "Vừa"), "Lớn": mon.chiTiet?.find(ct => ct.KichCo === "Lớn") };
    setChiTietMonForm([
      { KichCo: "Nhỏ", Gia: detailsMap["Nhỏ"]?.Gia || "", TrangThai: detailsMap["Nhỏ"]?.TrangThai || "Còn bán" },
      { KichCo: "Vừa", Gia: detailsMap["Vừa"]?.Gia || "", TrangThai: detailsMap["Vừa"]?.TrangThai || "Còn bán" },
      { KichCo: "Lớn", Gia: detailsMap["Lớn"]?.Gia || "", TrangThai: detailsMap["Lớn"]?.TrangThai || "Còn bán" }
    ]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => { if (!window.confirm("Bạn có chắc muốn xóa món này?")) return; try { await api.delete(`/mon/${id}`); setMessage("✅ Xóa món thành công"); loadMons(); setTimeout(() => setMessage(""), 3000); } catch (err) { setMessage("❌ " + (err.response?.data?.message || "Không thể xóa")); setTimeout(() => setMessage(""), 3000); } };
  const cancelEdit = () => { setMonForm({ TenMon: "", MoTa: "", MaLM: "" }); setChiTietMonForm([{ KichCo: "Nhỏ", Gia: "", TrangThai: "Còn bán" }, { KichCo: "Vừa", Gia: "", TrangThai: "Còn bán" }, { KichCo: "Lớn", Gia: "", TrangThai: "Còn bán" }]); setEditingMon(null); setHinhAnhFile(null); setHinhAnhPreview(""); };
  const filteredMons = filterLoai ? mons.filter(m => m.MaLM === parseInt(filterLoai)) : mons;

  return (
    <DashboardLayout title="Quản lý món">
      {message && <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium animate-slide-down ${message.includes('✅') ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>{message}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl border border-coffee-100/50 shadow-sm p-6 sticky top-6">
            <h2 className="font-heading text-xl font-bold text-coffee-800 mb-5">{editingMon ? "✏️ Sửa Món" : "➕ Thêm Món Mới"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-coffee-600 mb-1.5">Tên món *</label>
                <input type="text" placeholder="Ví dụ: Cà phê sữa đá" value={monForm.TenMon} onChange={(e) => setMonForm({ ...monForm, TenMon: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-coffee-600 mb-1.5">Loại món *</label>
                <select value={monForm.MaLM} onChange={(e) => setMonForm({ ...monForm, MaLM: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all text-sm cursor-pointer">
                  <option value="">-- Chọn loại món --</option>
                  {loaiMons.map((lm) => (<option key={lm.MaLM} value={lm.MaLM}>{lm.TenLM}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-coffee-600 mb-1.5">Mô tả</label>
                <textarea placeholder="Mô tả về món ăn..." value={monForm.MoTa} onChange={(e) => setMonForm({ ...monForm, MoTa: e.target.value })} rows="2" className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all text-sm resize-none" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-coffee-700 mb-3">Giá theo kích cỡ</h3>
                <div className="space-y-3">
                  {chiTietMonForm.map((ct, index) => (
                    <div key={index} className="flex items-center gap-2 bg-coffee-50/50 rounded-xl p-3 border border-coffee-100/50">
                      <span className="text-sm font-medium text-coffee-600 w-12">{ct.KichCo}</span>
                      <input type="number" placeholder="Giá" value={ct.Gia} onChange={(e) => handleChiTietChange(index, 'Gia', e.target.value)} min="0" step="1000" className="flex-1 px-3 py-2 rounded-lg bg-white border border-coffee-100 text-coffee-800 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all" />
                      <select value={ct.TrangThai} onChange={(e) => handleChiTietChange(index, 'TrangThai', e.target.value)} className="px-2 py-2 rounded-lg bg-white border border-coffee-100 text-coffee-800 text-xs focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all cursor-pointer">
                        <option value="Còn bán">Còn</option>
                        <option value="Hết hàng">Hết</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-600 mb-1.5">Hình ảnh</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-coffee-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-coffee-100 file:text-coffee-700 hover:file:bg-coffee-200 file:cursor-pointer file:transition-colors" />
                {hinhAnhPreview && <div className="mt-3"><img src={hinhAnhPreview} alt="Xem trước" className="w-full h-32 object-cover rounded-xl border border-coffee-100" /></div>}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-coffee-700 to-coffee-600 text-white font-medium rounded-xl hover:from-coffee-600 hover:to-coffee-500 transition-all text-sm shadow-md shadow-coffee-700/20 disabled:opacity-50" disabled={isLoading}>
                  {isLoading ? "Đang xử lý..." : (editingMon ? "Cập nhật" : "Thêm mới")}
                </button>
                {editingMon && <button type="button" onClick={cancelEdit} className="px-4 py-2.5 bg-coffee-100 text-coffee-600 font-medium rounded-xl hover:bg-coffee-200 transition-all text-sm" disabled={isLoading}>Hủy</button>}
              </div>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-coffee-100/50 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-coffee-50">
              <h2 className="font-semibold text-coffee-800">Danh Sách Món ({filteredMons.length})</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-coffee-400">Lọc:</span>
                <select value={filterLoai} onChange={(e) => setFilterLoai(e.target.value)} className="px-3 py-1.5 rounded-lg bg-coffee-50 border border-coffee-100 text-coffee-700 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 cursor-pointer">
                  <option value="">Tất cả</option>
                  {loaiMons.map((lm) => (<option key={lm.MaLM} value={lm.MaLM}>{lm.TenLM}</option>))}
                </select>
              </div>
            </div>

            {filteredMons.length === 0 ? (
              <div className="p-12 text-center"><p className="text-coffee-300">Chưa có món nào. Hãy thêm món mới!</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="bg-coffee-50/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Mã</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Hình</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Tên Món</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Loại</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Giá</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Mô tả</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Hành động</th>
                  </tr></thead>
                  <tbody className="divide-y divide-coffee-50">
                    {filteredMons.map((m) => (
                      <tr key={m.MaMon} className="hover:bg-coffee-50/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-coffee-500">#{m.MaMon}</td>
                        <td className="px-4 py-3">{m.HinhAnh ? <img src={`${API_URL}${m.HinhAnh}`} alt={m.TenMon} className="w-12 h-12 rounded-lg object-cover border border-coffee-100" onError={(e) => e.target.src = '/caphesua.jpg'} /> : <div className="w-12 h-12 rounded-lg bg-coffee-100 flex items-center justify-center text-lg">📷</div>}</td>
                        <td className="px-4 py-3 text-sm font-medium text-coffee-800">{m.TenMon}</td>
                        <td className="px-4 py-3"><span className="px-2.5 py-1 bg-coffee-100 text-coffee-600 text-xs font-medium rounded-full">{m.TenLM}</span></td>
                        <td className="px-4 py-3">{m.chiTiet && m.chiTiet.length > 0 ? <div className="space-y-0.5">{m.chiTiet.map((ct, idx) => (<div key={idx} className="text-xs"><span className="font-medium text-coffee-600">{ct.KichCo}:</span> <span className="text-gold font-semibold">{Number(ct.Gia).toLocaleString()}đ</span>{ct.TrangThai !== "Còn bán" && <span className="text-danger ml-1">({ct.TrangThai})</span>}</div>))}</div> : <span className="text-xs text-coffee-300">Chưa có giá</span>}</td>
                        <td className="px-4 py-3 text-sm text-coffee-400 max-w-[150px] truncate">{m.MoTa || "—"}</td>
                        <td className="px-4 py-3"><div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(m)} className="px-3 py-1.5 text-xs font-medium text-info bg-info-light rounded-lg hover:bg-info/10 transition-colors" title="Sửa">Sửa</button>
                          <button onClick={() => handleDelete(m.MaMon)} className="px-3 py-1.5 text-xs font-medium text-danger bg-danger-light rounded-lg hover:bg-danger/10 transition-colors" title="Xóa">Xóa</button>
                        </div></td>
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