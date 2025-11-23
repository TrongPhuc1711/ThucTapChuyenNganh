import { useState, useEffect } from "react";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";

export default function StaffManager() {
  const [staffs, setStaffs] = useState([]);
  const [filteredStaffs, setFilteredStaffs] = useState([]);
  const [searchText, setSearchText] = useState("");

  const [form, setForm] = useState({
    HoTen: "",
    Email: "",
    MatKhau: "",
    VaiTro: "NhanVien",
  });

  const [editingMa, setEditingMa] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load danh sách nhân viên
  useEffect(() => {
    loadStaffs();
  }, []);

  const loadStaffs = async () => {
    try {
      const res = await api.get("/nhanvien");
      setStaffs(res.data);
      setFilteredStaffs(res.data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Không thể tải danh sách nhân viên");
    }
  };

  // Tìm kiếm theo tên hoặc email
  useEffect(() => {
    const text = searchText.trim().toLowerCase();
    if (text === "") {
      setFilteredStaffs(staffs);
    } else {
      setFilteredStaffs(
        staffs.filter(
          (nv) =>
            nv.HoTen.toLowerCase().includes(text) ||
            nv.Email.toLowerCase().includes(text)
        )
      );
    }
  }, [searchText, staffs]);

  // 🔹 Submit form thêm/sửa
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (editingMa) {
        await api.put(`/nhanvien/${editingMa}`, form);
        setMessage("Cập nhật nhân viên thành công");
      } else {
        await api.post("/nhanvien", form);
        setMessage("Thêm nhân viên thành công");
      }

      resetForm();
      loadStaffs();

    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Lỗi thao tác"));
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Edit
  const handleEdit = (nv) => {
    setForm({
      HoTen: nv.HoTen,
      Email: nv.Email,
      MatKhau: "",
      VaiTro: nv.VaiTro,
    });
    setEditingMa(nv.MaND);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa nhân viên này?")) return;

    try {
      await api.delete(`/nhanvien/${id}`);
      setMessage("✅ Đã xóa nhân viên");
      loadStaffs();
    } catch (err) {
      setMessage("❌ Không thể xóa nhân viên này");
    } finally {
      setTimeout(() => setMessage(""), 3000);
    }
  };

  //  Reset form
  const resetForm = () => {
    setForm({ HoTen: "", Email: "", MatKhau: "", VaiTro: "NhanVien" });
    setEditingMa(null);
  };

  return (
    <DashboardLayout title=" Quản Lý Nhân Viên">
      {message && <div className="message-alert">{message}</div>}

      {/* FORM */}
      <div className="form-section">
        <h2>{editingMa ? "✏️ Sửa Nhân Viên" : "➕ Thêm Nhân Viên Mới"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Họ tên *</label>
              <input
                type="text"
                value={form.HoTen}
                onChange={(e) => setForm({ ...form, HoTen: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={form.Email}
                onChange={(e) => setForm({ ...form, Email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Mật khẩu {editingMa ? "(để trống nếu không đổi)" : "*"}</label>
              <input
                type="password"
                value={form.MatKhau}
                onChange={(e) =>
                  setForm({ ...form, MatKhau: e.target.value })
                }
                placeholder="******"
                required={!editingMa}
              />
            </div>

            <div className="form-group">
              <label>Vai trò *</label>
              <select
                value={form.VaiTro}
                onChange={(e) => setForm({ ...form, VaiTro: e.target.value })}
              >
                <option value="NhanVien">Nhân viên</option>
                <option value="Admin">Quản trị viên</option>
              </select>
            </div>
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading
                ? "Đang xử lý..."
                : editingMa
                ? "💾 Cập nhật"
                : "➕ Thêm mới"}
            </button>
            {editingMa && (
              <button type="button" onClick={resetForm} className="btn-cancel">
                ✖️ Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LIST + SEARCH */}
      <div className="list-section">
        <div className="list-header">
          <h2>📋 Danh Sách Nhân Viên ({filteredStaffs.length})</h2>

          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            className="search-input"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {filteredStaffs.length === 0 ? (
          <p className="empty-state">Không tìm thấy nhân viên nào</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Họ Tên</th>
                <th>Email</th>
                <th>Vai Trò</th>
                <th>Ngày Tạo</th>
                <th>Hành Động</th>
              </tr>
            </thead>

            <tbody>
              {filteredStaffs.map((nv) => (
                <tr key={nv.MaND}>
                  <td>{nv.MaND}</td>
                  <td>{nv.HoTen}</td>
                  <td>{nv.Email}</td>
                  <td>
                    <span
                      className={`badge-role ${
                        nv.VaiTro === "Admin" ? "admin" : "staff"
                      }`}
                    >
                      {nv.VaiTro}
                    </span>
                  </td>
                  <td>{nv.NgayTao?.split("T")[0] || "—"}</td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(nv)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(nv.MaND)}
                      >
                        🗑️
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
