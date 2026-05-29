import { useState, useEffect } from "react";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";

export default function StaffCustomers() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [search, setSearch] = useState("");
  
  // State cho Sửa
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    HoTen: "",
    SDT: "",
    DiaChi: ""
  });

  // State cho Thêm mới
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
    const result = customers.filter(c => 
        c.HoTen.toLowerCase().includes(search.toLowerCase()) || 
        (c.SDT && c.SDT.includes(search))
    );
    setFilteredCustomers(result);
  }, [search, customers]);

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/khachhang"); 
      setCustomers(res.data);
      setFilteredCustomers(res.data);
    } catch (error) {
      console.error("Lỗi tải khách hàng:", error);
    }
  };

  // --- XỬ LÝ SỬA ---
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
        alert("Cập nhật thành công!");
        setShowEditModal(false);
        fetchCustomers(); 
    } catch (error) {
        alert("Lỗi cập nhật: " + (error.response?.data?.message || error.message));
    }
  };

  // --- XỬ LÝ THÊM MỚI ---
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
    // Validate cơ bản
    if (!newCustomer.HoTen || !newCustomer.Email || !newCustomer.MatKhau) {
        alert("Vui lòng nhập đủ Họ tên, Email và Mật khẩu!");
        return;
    }

    try {
        await api.post("/khachhang", newCustomer);
        alert("Thêm khách hàng thành công!");
        setShowAddModal(false);
        fetchCustomers();
    } catch (error) {
        alert("Lỗi thêm mới: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <DashboardLayout title="Quản lý Khách Hàng">
      <div className="bg-white rounded-2xl border border-coffee-100/50 shadow-sm overflow-hidden animate-fade-in">
        {/* Header Controls */}
        <div className="p-5 border-b border-coffee-50 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-300">🔍</span>
              <input 
                type="text" 
                placeholder="Tìm kiếm theo tên hoặc SĐT..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm transition-all"
              />
            </div>
            <button 
              className="px-5 py-2.5 bg-gradient-to-r from-coffee-700 to-coffee-600 text-white font-medium text-sm rounded-xl hover:from-coffee-600 hover:to-coffee-500 transition-all shadow-md shadow-coffee-700/10 flex items-center justify-center gap-1.5 self-end sm:self-auto"
              onClick={handleAddClick}
            >
              <span>+ Thêm khách hàng</span>
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-coffee-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Mã KH</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Họ tên</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-coffee-500 uppercase tracking-wider">SĐT</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Địa chỉ</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-coffee-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-coffee-50">
              {filteredCustomers.map(cust => (
                <tr key={cust.MaND} className="hover:bg-coffee-50/30 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-coffee-400">#{cust.MaND}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-coffee-800">{cust.HoTen}</td>
                  <td className="px-5 py-3.5 text-sm text-coffee-600">{cust.Email}</td>
                  <td className="px-5 py-3.5 text-sm text-coffee-500 font-mono">{cust.SDT || "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-coffee-400 max-w-[200px] truncate" title={cust.DiaChi}>{cust.DiaChi || "—"}</td>
                  <td className="px-5 py-3.5 text-center">
                    <button 
                      className="px-3.5 py-1.5 text-xs font-semibold text-info bg-info-light rounded-lg hover:bg-info/10 transition-colors"
                      onClick={() => handleEditClick(cust)}
                    >
                      Sửa
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-coffee-300">
                    Không tìm thấy khách hàng nào hợp lệ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL SỬA THÔNG TIN --- */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-coffee-50">
              <h3 className="font-heading text-lg font-bold text-coffee-800">Cập nhật thông tin</h3>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-coffee-50 text-coffee-400 hover:text-coffee-700 transition-colors" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-coffee-400 uppercase tracking-wider mb-1.5">Email (Không thể sửa)</label>
                <input type="text" value={editingCustomer.Email} disabled className="w-full px-4 py-2.5 rounded-xl bg-coffee-50/50 border border-coffee-100/50 text-coffee-400 text-sm cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-coffee-500 uppercase tracking-wider mb-1.5">Họ tên</label>
                <input 
                  type="text" 
                  value={formData.HoTen}
                  onChange={e => setFormData({...formData, HoTen: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-coffee-500 uppercase tracking-wider mb-1.5">Số điện thoại</label>
                <input 
                  type="text" 
                  value={formData.SDT}
                  onChange={e => setFormData({...formData, SDT: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-coffee-500 uppercase tracking-wider mb-1.5">Địa chỉ</label>
                <input 
                  type="text" 
                  value={formData.DiaChi}
                  onChange={e => setFormData({...formData, DiaChi: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm transition-all"
                />
              </div>
              <p className="text-[11px] text-danger bg-danger-light/50 px-3 py-2 rounded-lg font-medium italic">
                * Nhân viên không có quyền thay đổi mật khẩu khách hàng.
              </p>
            </div>

            <div className="flex gap-3 p-6 bg-coffee-50/50 border-t border-coffee-50">
              <button className="flex-1 py-2.5 bg-gradient-to-r from-coffee-700 to-coffee-600 text-white font-medium rounded-xl text-sm hover:from-coffee-600 hover:to-coffee-500 transition-all shadow-md shadow-coffee-700/10" onClick={handleSave}>Lưu thay đổi</button>
              <button className="px-4 py-2.5 bg-white border border-coffee-200 text-coffee-600 font-medium rounded-xl text-sm hover:bg-coffee-50 transition-colors" onClick={() => setShowEditModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL THÊM MỚI --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-coffee-50">
              <h3 className="font-heading text-lg font-bold text-coffee-800">Thêm khách hàng mới</h3>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-coffee-50 text-coffee-400 hover:text-coffee-700 transition-colors" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-coffee-500 uppercase tracking-wider mb-1.5">Họ tên <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  placeholder="Nhập họ tên..."
                  value={newCustomer.HoTen}
                  onChange={e => setNewCustomer({...newCustomer, HoTen: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-coffee-500 uppercase tracking-wider mb-1.5">Email <span className="text-danger">*</span></label>
                <input 
                  type="email" 
                  placeholder="Nhập email..."
                  value={newCustomer.Email}
                  onChange={e => setNewCustomer({...newCustomer, Email: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-coffee-500 uppercase tracking-wider mb-1.5">Mật khẩu <span className="text-danger">*</span></label>
                <input 
                  type="password" 
                  placeholder="Nhập mật khẩu..."
                  value={newCustomer.MatKhau}
                  onChange={e => setNewCustomer({...newCustomer, MatKhau: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-coffee-500 uppercase tracking-wider mb-1.5">Số điện thoại</label>
                <input 
                  type="text" 
                  placeholder="Nhập SĐT..."
                  value={newCustomer.SDT}
                  onChange={e => setNewCustomer({...newCustomer, SDT: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-coffee-500 uppercase tracking-wider mb-1.5">Địa chỉ</label>
                <input 
                  type="text" 
                  placeholder="Nhập địa chỉ..."
                  value={newCustomer.DiaChi}
                  onChange={e => setNewCustomer({...newCustomer, DiaChi: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 bg-coffee-50/50 border-t border-coffee-50">
              <button className="flex-1 py-2.5 bg-gradient-to-r from-coffee-700 to-coffee-600 text-white font-medium rounded-xl text-sm hover:from-coffee-600 hover:to-coffee-500 transition-all shadow-md shadow-coffee-700/10" onClick={handleCreate}>Tạo tài khoản</button>
              <button className="px-4 py-2.5 bg-white border border-coffee-200 text-coffee-600 font-medium rounded-xl text-sm hover:bg-coffee-50 transition-colors" onClick={() => setShowAddModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}