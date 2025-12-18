import { useState, useEffect } from "react";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";

export default function CustomerManager() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchText, setSearchText] = useState("");

  const [form, setForm] = useState({
    HoTen: "",
    Email: "",
    MatKhau: "",
    DiaChi: "",
    SDT: "",
  });

  const [editingMa, setEditingMa] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load danh sách khách hàng
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const res = await api.get("/khachhang");
      setCustomers(res.data);
      setFilteredCustomers(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Không thể tải danh sách khách hàng");
    }
  };

  // Tìm kiếm theo tên, email, sdt hoặc địa chỉ
  useEffect(() => {
    const text = searchText.trim().toLowerCase();
    if (text === "") {
      setFilteredCustomers(customers);
    } else {
      setFilteredCustomers(
        customers.filter(
          (kh) =>
            kh.HoTen?.toLowerCase().includes(text) ||
            kh.Email?.toLowerCase().includes(text) ||
            kh.DiaChi?.toLowerCase().includes(text) ||
            kh.SDT?.includes(text)
        )
      );
    }
  }, [searchText, customers]);

  // Submit form thêm/sửa
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    // Validate
    if (!form.HoTen || !form.Email) {
      setMessage("Họ tên và Email không được để trống");
      return;
    }

    if (!editingMa && !form.MatKhau) {
      setMessage("Mật khẩu không được để trống");
      return;
    }

    setIsLoading(true);

    try {
      if (editingMa) {
        // Cập nhật khách hàng + người dùng
        await api.put(`/khachhang/${editingMa}`, {
          HoTen: form.HoTen,
          Email: form.Email,
          DiaChi: form.DiaChi,
          SDT: form.SDT,
        });
        setMessage("Cập nhật khách hàng thành công");
      } else {
        // Tạo khách hàng mới + người dùng
        await api.post("/khachhang", {
          HoTen: form.HoTen,
          Email: form.Email,
          MatKhau: form.MatKhau,
          DiaChi: form.DiaChi,
          SDT: form.SDT,
        });
        setMessage("Thêm khách hàng thành công");
      }

      resetForm();
      loadCustomers();
    } catch (err) {
      setMessage(err.response?.data?.message || "Lỗi thao tác");
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Edit - Load dữ liệu vào form
  const handleEdit = (kh) => {
    setForm({
      HoTen: kh.HoTen,
      Email: kh.Email,
      MatKhau: "",
      DiaChi: kh.DiaChi || "",
      SDT: kh.SDT || "",
    });
    setEditingMa(kh.MaND);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa khách hàng này?")) return;

    try {
      await api.delete(`/khachhang/${id}`);
      setMessage("Đã xóa khách hàng");
      loadCustomers();
    } catch (err) {
      setMessage(err.response?.data?.message || "Không thể xóa khách hàng này");
    } finally {
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({
      HoTen: "",
      Email: "",
      MatKhau: "",
      DiaChi: "",
      SDT: "",
    });
    setEditingMa(null);
  };

  return (
    <DashboardLayout title="Quản Lý Khách Hàng">
      {message && <div className="message-alert">{message}</div>}

      {/* FORM */}
      <div className="form-section">
        <h2>{editingMa ? "Sửa Thông Tin Khách Hàng" : "Thêm Khách Hàng Mới"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Họ Tên *</label>
              <input
                type="text"
                value={form.HoTen}
                onChange={(e) => setForm({ ...form, HoTen: e.target.value })}
                placeholder="Nhập họ tên"
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={form.Email}
                onChange={(e) => setForm({ ...form, Email: e.target.value })}
                placeholder="Nhập email"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Mật khẩu {editingMa ? "(để trống nếu không đổi)" : "*"}
              </label>
              <input
                type="password"
                value={form.MatKhau}
                onChange={(e) => setForm({ ...form, MatKhau: e.target.value })}
                placeholder="••••••••"
                required={!editingMa}
              />
            </div>

            <div className="form-group">
              <label>Số Điện Thoại</label>
              <input
                type="tel"
                value={form.SDT}
                onChange={(e) => setForm({ ...form, SDT: e.target.value })}
                placeholder="0123456789"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Địa Chỉ</label>
              <input
                type="text"
                value={form.DiaChi}
                onChange={(e) => setForm({ ...form, DiaChi: e.target.value })}
                placeholder="Nhập địa chỉ"
              />
            </div>
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading
                ? "Đang xử lý..."
                : editingMa
                ? "Cập nhật"
                : "Thêm mới"}
            </button>
            {editingMa && (
              <button type="button" onClick={resetForm} className="btn-cancel">
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LIST + SEARCH */}
      <div className="list-section">
        <div className="list-header">
          <h2>Danh Sách Khách Hàng ({filteredCustomers.length})</h2>

          <input
            type="text"
            placeholder="Tìm theo tên, email, sdt hoặc địa chỉ..."
            className="search-input"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {filteredCustomers.length === 0 ? (
          <p className="empty-state">Không tìm thấy khách hàng nào</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Họ Tên</th>
                <th>Email</th>
                <th>Số Điện Thoại</th>
                <th>Địa Chỉ</th>
                <th>Hành Động</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((kh) => (
                <tr key={kh.MaND}>
                  <td>{kh.MaND}</td>
                  <td>{kh.HoTen}</td>
                  <td>{kh.Email}</td>
                  <td>{kh.SDT || "—"}</td>
                  <td>{kh.DiaChi || "—"}</td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(kh)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(kh.MaND)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}