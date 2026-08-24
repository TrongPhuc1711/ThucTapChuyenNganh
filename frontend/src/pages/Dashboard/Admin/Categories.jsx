import { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, FolderTree, Search } from "lucide-react";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Pagination from "../../../components/ui/Pagination";

export default function Categories() {
  const [loaiMons, setLoaiMons] = useState([]);
  const [loaiMonForm, setLoaiMonForm] = useState({ TenLM: "", MoTa: "" });
  const [editingLoaiMon, setEditingLoaiMon] = useState(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Phân trang limit 10
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => { 
    loadLoaiMons(); 
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

  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    setIsLoading(true);
    try { 
      if (editingLoaiMon) { 
        await api.put(`/loaimon/${editingLoaiMon}`, loaiMonForm); 
        setMessage("✅ Cập nhật loại món thành công!"); 
      } else { 
        await api.post("/loaimon", loaiMonForm); 
        setMessage("✅ Thêm loại món mới thành công!"); 
      } 
      setLoaiMonForm({ TenLM: "", MoTa: "" }); 
      setEditingLoaiMon(null); 
      loadLoaiMons(); 
    } catch (err) { 
      setMessage("❌ " + (err.response?.data?.message || "Có lỗi xảy ra")); 
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 3500); 
    }
  };

  const handleEdit = (loaiMon) => { 
    setLoaiMonForm({ TenLM: loaiMon.TenLM, MoTa: loaiMon.MoTa || "" }); 
    setEditingLoaiMon(loaiMon.MaLM); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleDelete = async (id) => { 
    if (!window.confirm("Bạn có chắc chắn muốn xóa loại món này?")) return; 
    try { 
      await api.delete(`/loaimon/${id}`); 
      setMessage("✅ Đã xóa loại món thành công!"); 
      loadLoaiMons(); 
    } catch (err) { 
      setMessage("❌ " + (err.response?.data?.message || "Không thể xóa loại món này")); 
    } finally {
      setTimeout(() => setMessage(""), 3500); 
    }
  };

  const cancelEdit = () => { 
    setLoaiMonForm({ TenLM: "", MoTa: "" }); 
    setEditingLoaiMon(null); 
  };

  const filteredCategories = loaiMons.filter(lm => 
    lm.TenLM.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (lm.MoTa && lm.MoTa.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalItems = filteredCategories.length;
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <DashboardLayout title="Quản Lý Danh Mục">
      {message && (
        <div className={`mb-6 px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-md animate-slide-down flex items-center gap-2 ${
          message.includes('✅') 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
            : 'bg-rose-50 text-rose-700 border border-rose-100'
        }`}>
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start font-sans">
        
        {/* Form Column */}
        <div className="xl:col-span-4">
          <div className="bg-white rounded-3xl border border-[#EFEBE9] shadow-sm p-6 sm:p-8 sticky top-24 space-y-6">
            <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-4">
              <h2 className="font-serif text-xl font-bold text-[#2C1810] flex items-center gap-2">
                {editingLoaiMon ? <Edit3 className="w-5 h-5 text-[#C5963A]" /> : <Plus className="w-5 h-5 text-[#C5963A]" />}
                <span>{editingLoaiMon ? "Sửa Danh Mục" : "Thêm Danh Mục"}</span>
              </h2>
              {editingLoaiMon && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5963A] bg-[#C5963A]/10 px-2.5 py-1 rounded-full">
                  Mã #{editingLoaiMon}
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Tên danh mục"
                placeholder="Ví dụ: Cà phê, Trà sữa, Sinh tố..."
                value={loaiMonForm.TenLM}
                onChange={(e) => setLoaiMonForm({ ...loaiMonForm, TenLM: e.target.value })}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-[#4E342E] uppercase tracking-wider mb-1.5">
                  Mô tả danh mục
                </label>
                <textarea
                  placeholder="Ghi chú về nhóm sản phẩm này..."
                  value={loaiMonForm.MoTa}
                  onChange={(e) => setLoaiMonForm({ ...loaiMonForm, MoTa: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFEBE9] text-[#2C1810] placeholder-[#A1887F] text-sm focus:outline-none focus:ring-2 focus:ring-[#C5963A]/30 focus:border-[#C5963A] transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isLoading}
                  className="flex-1 font-bold"
                >
                  {editingLoaiMon ? "Lưu Thay Đổi" : "Thêm Danh Mục"}
                </Button>
                {editingLoaiMon && (
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

        {/* Table Column */}
        <div className="xl:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-[#EFEBE9] shadow-sm overflow-hidden">
            
            <div className="p-6 border-b border-[#FAF7F2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#2C1810]">
                  Danh Sách Loại Món
                </h3>
                <p className="text-xs text-[#8D6E63] mt-0.5">
                  Tổng số: {filteredCategories.length} danh mục
                </p>
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1887F]" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#EFEBE9] text-xs font-medium text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#C5963A]/30"
                />
              </div>
            </div>

            {filteredCategories.length === 0 ? (
              <div className="p-16 text-center">
                <FolderTree className="w-12 h-12 text-[#A1887F] mx-auto mb-3 opacity-40" />
                <p className="font-serif font-bold text-base text-[#2C1810]">Chưa có loại món nào</p>
                <p className="text-xs text-[#8D6E63] mt-1">Tạo nhóm đầu tiên của quán bạn nhé.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#FAF7F2] border-b border-[#EFEBE9]">
                      <th className="px-6 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Mã</th>
                      <th className="px-6 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Tên Loại Món</th>
                      <th className="px-6 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Mô Tả</th>
                      <th className="px-6 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans text-center">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FAF7F2] text-sm font-sans">
                    {currentCategories.map((lm) => (
                      <tr key={lm.MaLM} className="hover:bg-[#FAF7F2]/60 transition-colors">
                        <td className="px-6 py-4 font-bold text-xs text-[#A1887F]">
                          #{lm.MaLM}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-xs text-[#2C1810]">{lm.TenLM}</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-[#6D4C41]">
                          {lm.MoTa || <span className="italic text-[#A1887F]">Không có mô tả</span>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(lm)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(lm.MaLM)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                              title="Xóa danh mục"
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

            {/* Phân trang */}
            {totalItems > 0 && (
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={(page) => setCurrentPage(page)}
              />
            )}

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}