import { useState, useEffect } from "react";
import { 
  Users, 
  Plus, 
  Edit3, 
  Search, 
  X, 
  Phone, 
  Mail, 
  MapPin,
  Lock,
  User
} from "lucide-react";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Pagination from "../../../components/ui/Pagination";

export default function StaffCustomers() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Phân trang limit 10
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // State Edit
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    HoTen: "",
    SDT: "",
    DiaChi: ""
  });

  // State Add
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    HoTen: "",
    Email: "",
    MatKhau: "",
    SDT: "",
    DiaChi: ""
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    const result = customers.filter(c => 
      c.HoTen.toLowerCase().includes(term) || 
      (c.SDT && c.SDT.includes(term)) ||
      (c.Email && c.Email.toLowerCase().includes(term))
    );
    setFilteredCustomers(result);
  }, [search, customers]);

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/khachhang"); 
      setCustomers(res.data || []);
      setFilteredCustomers(res.data || []);
    } catch (error) {
      console.error("Lỗi tải khách hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalItems = filteredCustomers.length;
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);

  const handleEditClick = (cust) => {
    setEditingCustomer(cust);
    setFormData({
      HoTen: cust.HoTen,
      SDT: cust.SDT || "",
      DiaChi: cust.DiaChi || ""
    });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    try {
      await api.put(`/khachhang/${editingCustomer.MaND}`, formData);
      setShowEditModal(false);
      fetchCustomers(); 
    } catch (error) {
      alert("Lỗi cập nhật: " + (error.response?.data?.message || error.message));
    }
  };

  const handleAddClick = () => {
    setNewCustomer({
      HoTen: "",
      Email: "",
      MatKhau: "",
      SDT: "",
      DiaChi: ""
    });
    setShowAddModal(true);
  };

  const handleCreate = async () => {
    if (!newCustomer.HoTen || !newCustomer.Email || !newCustomer.MatKhau) {
      alert("Vui lòng nhập đủ Họ tên, Email và Mật khẩu!");
      return;
    }

    try {
      await api.post("/khachhang", newCustomer);
      setShowAddModal(false);
      fetchCustomers();
    } catch (error) {
      alert("Lỗi thêm mới: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <DashboardLayout title="Hồ Sơ Khách Hàng">
      <div className="bg-white rounded-3xl border border-[#EFEBE9] shadow-sm overflow-hidden space-y-4 font-sans animate-fade-in">
        
        {/* Controls Toolbar */}
        <div className="p-6 border-b border-[#FAF7F2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#2C1810]">
              Danh Sách Khách Hàng ({filteredCustomers.length})
            </h3>
            <p className="text-xs text-[#8D6E63] mt-0.5">
              Hỗ trợ tạo tài khoản tích điểm cho khách tại quầy
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1887F]" />
              <input 
                type="text" 
                placeholder="Tìm tên, SĐT, email..." 
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFEBE9] text-xs font-medium text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#C5963A]/30"
              />
            </div>

            <button 
              onClick={handleAddClick}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[#2C1810] to-[#4E342E] hover:from-[#1A0F0A] hover:to-[#2C1810] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ Đăng ký khách mới</span>
            </button>
          </div>
        </div>

        {/* Table View */}
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-4 border-[#EFEBE9] border-t-[#C5963A] rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-semibold text-[#8D6E63]">Đang tải khách hàng...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-12 h-12 text-[#A1887F] mx-auto mb-3 opacity-40" />
            <p className="font-serif font-bold text-base text-[#2C1810]">Không tìm thấy khách hàng nào</p>
            <p className="text-xs text-[#8D6E63] mt-1">Đăng ký khách mới bằng nút bên trên.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#EFEBE9]">
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Mã KH</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Khách Hàng</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Email</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">SĐT</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Địa Chỉ</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF7F2] text-sm font-sans">
                {currentCustomers.map(cust => (
                  <tr key={cust.MaND} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="px-5 py-4 font-bold text-xs text-[#A1887F]">
                      #{cust.MaND}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C5963A] to-[#D4A84B] text-[#1A0F0A] flex items-center justify-center font-bold text-xs">
                          {cust.HoTen?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-xs text-[#2C1810]">{cust.HoTen}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#6D4C41]">
                      {cust.Email}
                    </td>
                    <td className="px-5 py-4 text-xs text-[#6D4C41]">
                      {cust.SDT || <span className="text-[#A1887F] italic">—</span>}
                    </td>
                    <td className="px-5 py-4 text-xs text-[#8D6E63] max-w-[200px] truncate" title={cust.DiaChi}>
                      {cust.DiaChi || <span className="text-[#A1887F] italic">Tại quầy</span>}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button 
                        onClick={() => handleEditClick(cust)}
                        className="px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
                      >
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Phân trang */}
        {!loading && totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>

      {/* Modal Sửa */}
      {showEditModal && editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in p-6 sm:p-8 space-y-5 font-sans" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-4">
              <h3 className="font-serif text-xl font-bold text-[#2C1810]">
                Cập Nhật Thông Tin Khách
              </h3>
              <button onClick={() => setShowEditModal(false)} className="w-8 h-8 rounded-xl bg-[#FAF7F2] hover:bg-[#EFEBE9] text-[#6D4C41] flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4 font-sans">
              <Input
                label="Email (Không thể sửa)"
                value={editingCustomer.Email}
                disabled
              />

              <Input
                label="Họ và tên"
                value={formData.HoTen}
                onChange={e => setFormData({...formData, HoTen: e.target.value})}
                required
              />

              <Input
                label="Số điện thoại"
                value={formData.SDT}
                onChange={e => setFormData({...formData, SDT: e.target.value})}
              />

              <Input
                label="Địa chỉ nhận hàng"
                value={formData.DiaChi}
                onChange={e => setFormData({...formData, DiaChi: e.target.value})}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                className="flex-1 font-bold"
                onClick={handleSave}
              >
                Lưu Thay Đổi
              </Button>
              <button 
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2.5 bg-[#FAF7F2] text-[#6D4C41] font-bold text-xs rounded-xl hover:bg-[#EFEBE9] transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm Mới */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in p-6 sm:p-8 space-y-5 font-sans" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-4">
              <h3 className="font-serif text-xl font-bold text-[#2C1810]">
                Đăng Ký Khách Hàng Mới
              </h3>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-xl bg-[#FAF7F2] hover:bg-[#EFEBE9] text-[#6D4C41] flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 font-sans">
              <Input
                label="Họ và tên"
                placeholder="Nhập họ tên khách..."
                value={newCustomer.HoTen}
                onChange={e => setNewCustomer({...newCustomer, HoTen: e.target.value})}
                required
              />

              <Input
                label="Email"
                type="email"
                placeholder="customer@email.com"
                value={newCustomer.Email}
                onChange={e => setNewCustomer({...newCustomer, Email: e.target.value})}
                required
              />

              <Input
                label="Mật khẩu khởi tạo"
                type="password"
                placeholder="••••••••"
                value={newCustomer.MatKhau}
                onChange={e => setNewCustomer({...newCustomer, MatKhau: e.target.value})}
                required
              />

              <Input
                label="Số điện thoại"
                placeholder="0912 345 678"
                value={newCustomer.SDT}
                onChange={e => setNewCustomer({...newCustomer, SDT: e.target.value})}
              />

              <Input
                label="Địa chỉ"
                placeholder="Địa chỉ giao hàng..."
                value={newCustomer.DiaChi}
                onChange={e => setNewCustomer({...newCustomer, DiaChi: e.target.value})}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                className="flex-1 font-bold"
                onClick={handleCreate}
              >
                Tạo Hội Viên
              </Button>
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 bg-[#FAF7F2] text-[#6D4C41] font-bold text-xs rounded-xl hover:bg-[#EFEBE9] transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}