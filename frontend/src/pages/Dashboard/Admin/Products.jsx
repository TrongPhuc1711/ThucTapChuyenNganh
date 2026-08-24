import { useState, useEffect } from "react";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Image as ImageIcon, 
  Search, 
  Filter, 
  Coffee, 
  Check, 
  X,
  Sparkles
} from "lucide-react";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { 
    loadLoaiMons(); 
    loadMons(); 
  }, []);

  const loadLoaiMons = async () => { 
    try { 
      const res = await api.get("/loaimon"); 
      setLoaiMons(res.data || []); 
    } catch (err) { 
      console.error(err); 
      setMessage("❌ Lỗi khi tải danh sách loại món"); 
    } 
  };

  const loadMons = async () => { 
    try { 
      const res = await api.get("/mon"); 
      const monsWithDetails = await Promise.all((res.data || []).map(async (mon) => { 
        try { 
          const detailRes = await api.get(`/chitietmon/mon/${mon.MaMon}`); 
          return { ...mon, chiTiet: detailRes.data }; 
        } catch { 
          return { ...mon, chiTiet: [] }; 
        } 
      })); 
      setMons(monsWithDetails); 
    } catch (err) { 
      console.error(err); 
      setMessage("❌ Lỗi khi tải danh sách món"); 
    } 
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (isLoading) return; 
    setIsLoading(true);

    const formData = new FormData();
    formData.append('TenMon', monForm.TenMon); 
    formData.append('MoTa', monForm.MoTa); 
    formData.append('MaLM', monForm.MaLM);
    
    if (hinhAnhFile) formData.append('HinhAnh', hinhAnhFile);
    const validChiTiet = chiTietMonForm.filter(ct => ct.Gia && ct.Gia > 0);
    formData.append('ChiTietMon', JSON.stringify(validChiTiet));

    try {
      if (editingMon) { 
        await api.put(`/mon/${editingMon}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); 
        setMessage("✅ Cập nhật món thành công!"); 
      } else { 
        await api.post("/mon", formData, { headers: { 'Content-Type': 'multipart/form-data' } }); 
        setMessage("✅ Thêm món mới thành công!"); 
      }
      cancelEdit(); 
      loadMons(); 
    } catch (err) { 
      setMessage("❌ " + (err.response?.data?.message || "Có lỗi xảy ra")); 
    } finally { 
      setIsLoading(false); 
      setTimeout(() => setMessage(""), 3500); 
    }
  };

  const handleFileChange = (e) => { 
    const file = e.target.files?.[0]; 
    if (file) { 
      setHinhAnhFile(file); 
      setHinhAnhPreview(URL.createObjectURL(file)); 
    } 
  };

  const handleChiTietChange = (index, field, value) => { 
    const newChiTiet = [...chiTietMonForm]; 
    newChiTiet[index][field] = value; 
    setChiTietMonForm(newChiTiet); 
  };

  const handleEdit = (mon) => {
    setMonForm({ TenMon: mon.TenMon, MoTa: mon.MoTa || "", MaLM: mon.MaLM }); 
    setEditingMon(mon.MaMon); 
    setHinhAnhFile(null); 
    setHinhAnhPreview(mon.HinhAnh ? (mon.HinhAnh.startsWith('http') ? mon.HinhAnh : `${API_URL}${mon.HinhAnh}`) : "");
    
    const detailsMap = { 
      "Nhỏ": mon.chiTiet?.find(ct => ct.KichCo === "Nhỏ"), 
      "Vừa": mon.chiTiet?.find(ct => ct.KichCo === "Vừa"), 
      "Lớn": mon.chiTiet?.find(ct => ct.KichCo === "Lớn") 
    };

    setChiTietMonForm([
      { KichCo: "Nhỏ", Gia: detailsMap["Nhỏ"]?.Gia || "", TrangThai: detailsMap["Nhỏ"]?.TrangThai || "Còn bán" },
      { KichCo: "Vừa", Gia: detailsMap["Vừa"]?.Gia || "", TrangThai: detailsMap["Vừa"]?.TrangThai || "Còn bán" },
      { KichCo: "Lớn", Gia: detailsMap["Lớn"]?.Gia || "", TrangThai: detailsMap["Lớn"]?.TrangThai || "Còn bán" }
    ]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => { 
    if (!window.confirm("Bạn có chắc chắn muốn xóa món này?")) return; 
    try { 
      await api.delete(`/mon/${id}`); 
      setMessage("✅ Đã xóa món thành công!"); 
      loadMons(); 
    } catch (err) { 
      setMessage("❌ " + (err.response?.data?.message || "Không thể xóa món này")); 
    } finally {
      setTimeout(() => setMessage(""), 3500); 
    }
  };

  const cancelEdit = () => { 
    setMonForm({ TenMon: "", MoTa: "", MaLM: "" }); 
    setChiTietMonForm([
      { KichCo: "Nhỏ", Gia: "", TrangThai: "Còn bán" }, 
      { KichCo: "Vừa", Gia: "", TrangThai: "Còn bán" }, 
      { KichCo: "Lớn", Gia: "", TrangThai: "Còn bán" }
    ]); 
    setEditingMon(null); 
    setHinhAnhFile(null); 
    setHinhAnhPreview(""); 
  };

  const filteredMons = mons.filter(m => {
    const matchLoai = !filterLoai || m.MaLM === parseInt(filterLoai);
    const matchSearch = !searchTerm || m.TenMon.toLowerCase().includes(searchTerm.toLowerCase());
    return matchLoai && matchSearch;
  });

  return (
    <DashboardLayout title="Quản Lý Món & Menu">
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
                {editingMon ? <Edit3 className="w-5 h-5 text-[#C5963A]" /> : <Plus className="w-5 h-5 text-[#C5963A]" />}
                <span>{editingMon ? "Chỉnh Sửa Món" : "Thêm Món Mới"}</span>
              </h2>
              {editingMon && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5963A] bg-[#C5963A]/10 px-2.5 py-1 rounded-full">
                  Mã #{editingMon}
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Tên món"
                placeholder="Ví dụ: Cà phê Muối Hoàng Gia"
                value={monForm.TenMon}
                onChange={(e) => setMonForm({ ...monForm, TenMon: e.target.value })}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-[#4E342E] uppercase tracking-wider mb-1.5">
                  Danh mục loại món *
                </label>
                <select
                  value={monForm.MaLM}
                  onChange={(e) => setMonForm({ ...monForm, MaLM: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFEBE9] text-[#2C1810] text-sm focus:outline-none focus:ring-2 focus:ring-[#C5963A]/30 focus:border-[#C5963A] transition-all cursor-pointer font-medium"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {loaiMons.map((lm) => (
                    <option key={lm.MaLM} value={lm.MaLM}>{lm.TenLM}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4E342E] uppercase tracking-wider mb-1.5">
                  Mô tả hương vị
                </label>
                <textarea
                  placeholder="Mô tả các thành phần đặc biệt..."
                  value={monForm.MoTa}
                  onChange={(e) => setMonForm({ ...monForm, MoTa: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFEBE9] text-[#2C1810] placeholder-[#A1887F] text-sm focus:outline-none focus:ring-2 focus:ring-[#C5963A]/30 focus:border-[#C5963A] transition-all resize-none"
                />
              </div>

              {/* Price & Size Configuration */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-[#2C1810] uppercase tracking-wider mb-2">
                  Bảng giá theo kích cỡ (VNĐ)
                </label>
                <div className="space-y-2.5">
                  {chiTietMonForm.map((ct, index) => (
                    <div key={index} className="flex items-center gap-2 bg-[#FAF7F2] p-2.5 rounded-2xl border border-[#EFEBE9]">
                      <span className="text-xs font-bold text-[#4E342E] w-12 text-center bg-white py-1.5 rounded-lg border border-[#EFEBE9]">
                        {ct.KichCo}
                      </span>
                      <input
                        type="number"
                        placeholder="Giá bán"
                        value={ct.Gia}
                        onChange={(e) => handleChiTietChange(index, 'Gia', e.target.value)}
                        min="0"
                        step="1000"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-[#EFEBE9] text-[#2C1810] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#C5963A]/30"
                      />
                      <select
                        value={ct.TrangThai}
                        onChange={(e) => handleChiTietChange(index, 'TrangThai', e.target.value)}
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer border ${
                          ct.TrangThai === 'Còn bán' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        <option value="Còn bán">Còn bán</option>
                        <option value="Hết hàng">Hết hàng</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Uploader */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#4E342E] uppercase tracking-wider mb-1.5">
                  Hình ảnh minh họa
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-[#6D4C41] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#2C1810] file:text-white hover:file:bg-[#3E2723] file:cursor-pointer file:transition-colors"
                />
                {hinhAnhPreview && (
                  <div className="mt-3 relative rounded-2xl overflow-hidden aspect-[16/9] border border-[#EFEBE9] shadow-sm">
                    <img src={hinhAnhPreview} alt="Xem trước" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isLoading}
                  className="flex-1 font-bold"
                >
                  {editingMon ? "Lưu Thay Đổi" : "Thêm Vào Menu"}
                </Button>
                {editingMon && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-5 py-2.5 bg-[#EFEBE9] hover:bg-[#D7CCC8] text-[#4E342E] text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List Column */}
        <div className="xl:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-[#EFEBE9] shadow-sm overflow-hidden">
            
            {/* Table Header Controls */}
            <div className="p-6 border-b border-[#FAF7F2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#2C1810]">
                  Danh Sách Thực Đơn
                </h3>
                <p className="text-xs text-[#8D6E63] mt-0.5">
                  Hiển thị {filteredMons.length} món trong hệ thống
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1887F]" />
                  <input
                    type="text"
                    placeholder="Tìm tên món..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#EFEBE9] text-xs font-medium text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#C5963A]/30"
                  />
                </div>

                <select
                  value={filterLoai}
                  onChange={(e) => setFilterLoai(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#EFEBE9] text-xs font-semibold text-[#4E342E] focus:outline-none focus:ring-2 focus:ring-[#C5963A]/30 cursor-pointer"
                >
                  <option value="">Tất cả loại</option>
                  {loaiMons.map((lm) => (
                    <option key={lm.MaLM} value={lm.MaLM}>{lm.TenLM}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table Data */}
            {filteredMons.length === 0 ? (
              <div className="p-16 text-center">
                <Coffee className="w-12 h-12 text-[#A1887F] mx-auto mb-3 opacity-40" />
                <p className="font-serif font-bold text-base text-[#2C1810]">Chưa có món nào</p>
                <p className="text-xs text-[#8D6E63] mt-1">Hãy thêm món mới bằng form bên cạnh.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#FAF7F2] border-b border-[#EFEBE9]">
                      <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">Mã</th>
                      <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">Hình</th>
                      <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">Tên Món</th>
                      <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">Danh Mục</th>
                      <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider">Bảng Giá</th>
                      <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider text-center">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FAF7F2] text-sm">
                    {filteredMons.map((m) => {
                      const displayImg = m.HinhAnh 
                        ? (m.HinhAnh.startsWith('http') ? m.HinhAnh : `${API_URL}${m.HinhAnh}`)
                        : "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop";

                      return (
                        <tr key={m.MaMon} className="hover:bg-[#FAF7F2]/60 transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-xs text-[#A1887F]">
                            #{m.MaMon}
                          </td>
                          <td className="px-5 py-4">
                            <img
                              src={displayImg}
                              alt={m.TenMon}
                              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop"; }}
                              className="w-12 h-12 rounded-xl object-cover border border-[#EFEBE9]"
                            />
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-serif font-bold text-[#2C1810]">{m.TenMon}</p>
                            {m.MoTa && <p className="text-xs text-[#8D6E63] line-clamp-1 mt-0.5">{m.MoTa}</p>}
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-3 py-1 bg-[#FAF7F2] text-[#4E342E] text-xs font-bold rounded-full border border-[#EFEBE9]">
                              {m.TenLM || "Chưa phân loại"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {m.chiTiet && m.chiTiet.length > 0 ? (
                              <div className="space-y-1">
                                {m.chiTiet.map((ct, idx) => (
                                  <div key={idx} className="text-xs flex items-center gap-1.5">
                                    <span className="font-bold text-[#6D4C41] w-8">{ct.KichCo}:</span>
                                    <span className="font-bold text-[#C5963A]">{Number(ct.Gia).toLocaleString()}đ</span>
                                    {ct.TrangThai !== "Còn bán" && (
                                      <span className="text-[10px] text-rose-600 font-semibold bg-rose-50 px-1.5 py-0.2 rounded">
                                        Hết
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-[#A1887F] italic">Chưa tạo giá</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEdit(m)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                                title="Chỉnh sửa"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(m.MaMon)}
                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                title="Xóa món"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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