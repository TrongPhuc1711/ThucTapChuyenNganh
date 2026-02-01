import { useState, useEffect } from "react";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";
import "../../../styles/Dashboard/Staff/Staff_Customers.css";

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
      <div className="customers-container">
        <div className="customers-header">
            <div className="header-left">
                <h2>Danh Sách Khách Hàng</h2>
            </div>
            
            <div className="search-box">
                <input 
                    type="text" 
                    placeholder="🔍 Tìm tên hoặc SĐT..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <button className="btn-add-cust" onClick={handleAddClick}>
                    Thêm khách hàng
                </button>
        </div>

        <table className="cust-table">
            <thead>
                <tr>
                    <th>Mã KH</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>SĐT</th>
                    <th>Địa chỉ</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {filteredCustomers.map(cust => (
                    <tr key={cust.MaND}>
                        <td>#{cust.MaND}</td>
                        <td>{cust.HoTen}</td>
                        <td>{cust.Email}</td>
                        <td>{cust.SDT || "---"}</td>
                        <td>{cust.DiaChi || "---"}</td>
                        <td>
                            <button className="btn-edit-cust" onClick={() => handleEditClick(cust)}>
                                Sửa
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>

        {/* --- MODAL SỬA THÔNG TIN --- */}
        {showEditModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h3>Cập nhật thông tin</h3>
                        <button className="btn-close-modal" onClick={() => setShowEditModal(false)}>✕</button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Email (Không thể sửa)</label>
                            <input type="text" value={editingCustomer.Email} disabled className="input-disabled" />
                        </div>
                        <div className="form-group">
                            <label>Họ tên</label>
                            <input 
                                type="text" 
                                value={formData.HoTen}
                                onChange={e => setFormData({...formData, HoTen: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <input 
                                type="text" 
                                value={formData.SDT}
                                onChange={e => setFormData({...formData, SDT: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Địa chỉ</label>
                            <input 
                                type="text" 
                                value={formData.DiaChi}
                                onChange={e => setFormData({...formData, DiaChi: e.target.value})}
                            />
                        </div>
                        <p style={{color: '#e74c3c', fontSize: '13px', marginTop: '10px', fontStyle: 'italic'}}>
                            * Nhân viên không có quyền thay đổi mật khẩu khách hàng.
                        </p>
                    </div>
                    <div className="modal-footer">
                        <button className="btn-save" onClick={handleSave}>Lưu thay đổi</button>
                        <button className="btn-cancel" onClick={() => setShowEditModal(false)}>Hủy</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- MODAL THÊM MỚI --- */}
        {showAddModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h3>Thêm khách hàng mới</h3>
                        <button className="btn-close-modal" onClick={() => setShowAddModal(false)}>✕</button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Họ tên <span style={{color:'red'}}>*</span></label>
                            <input 
                                type="text" 
                                placeholder="Nhập họ tên..."
                                value={newCustomer.HoTen}
                                onChange={e => setNewCustomer({...newCustomer, HoTen: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email <span style={{color:'red'}}>*</span></label>
                            <input 
                                type="email" 
                                placeholder="Nhập email..."
                                value={newCustomer.Email}
                                onChange={e => setNewCustomer({...newCustomer, Email: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Mật khẩu <span style={{color:'red'}}>*</span></label>
                            <input 
                                type="password" 
                                placeholder="Nhập mật khẩu..."
                                value={newCustomer.MatKhau}
                                onChange={e => setNewCustomer({...newCustomer, MatKhau: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <input 
                                type="text" 
                                placeholder="Nhập SĐT..."
                                value={newCustomer.SDT}
                                onChange={e => setNewCustomer({...newCustomer, SDT: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Địa chỉ</label>
                            <input 
                                type="text" 
                                placeholder="Nhập địa chỉ..."
                                value={newCustomer.DiaChi}
                                onChange={e => setNewCustomer({...newCustomer, DiaChi: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn-save" onClick={handleCreate}>Tạo tài khoản</button>
                        <button className="btn-cancel" onClick={() => setShowAddModal(false)}>Hủy</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </DashboardLayout>
  );
}