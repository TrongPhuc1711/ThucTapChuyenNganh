import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import "../../../styles/Dashboard/Categories.css";

export default function Categories() {
  const navigate = useNavigate();
  const [loaiMons, setLoaiMons] = useState([]);
  const [loaiMonForm, setLoaiMonForm] = useState({ TenLM: "", MoTa: "" });
  const [editingLoaiMon, setEditingLoaiMon] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadLoaiMons();
  }, []);

  const loadLoaiMons = async () => {
    try {
      const res = await api.get("/loaimon");
      setLoaiMons(res.data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi khi tải danh sách loại món");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLoaiMon) {
        await api.put(`/loaimon/${editingLoaiMon}`, loaiMonForm);
        setMessage("✅ Cập nhật loại món thành công");
      } else {
        await api.post("/loaimon", loaiMonForm);
        setMessage("✅ Thêm loại món thành công");
      }
      setLoaiMonForm({ TenLM: "", MoTa: "" });
      setEditingLoaiMon(null);
      loadLoaiMons();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Có lỗi xảy ra"));
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleEdit = (loaiMon) => {
    setLoaiMonForm({ TenLM: loaiMon.TenLM, MoTa: loaiMon.MoTa || "" });
    setEditingLoaiMon(loaiMon.MaLM);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa loại món này?")) 
      return;
    try {
      await api.delete(`/loaimon/${id}`);
      setMessage("✅ Xóa loại món thành công");
      loadLoaiMons();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Không thể xóa"));
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const cancelEdit = () => {
    setLoaiMonForm({ TenLM: "", MoTa: "" });
    setEditingLoaiMon(null);
  };

  return (
    <div className="categories-container">
      <div className="categories-header">
        <button onClick={() => navigate("/admin")} className="btn-back">
          ← Quay lại
        </button>
        <h1>🗂️ Quản Lý Loại Món</h1>
      </div>

      {message && <div className="message-alert">{message}</div>}

      <div className="categories-content">
        {/* Form Section */}
        <div className="form-section">
          <h2>{editingLoaiMon ? "✏️ Sửa Loại Món" : "➕ Thêm Loại Món Mới"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tên loại món *</label>
              <input
                type="text"
                placeholder="Ví dụ: Cà phê, Trà, Sinh tố..."
                value={loaiMonForm.TenLM}
                onChange={(e) => setLoaiMonForm({ ...loaiMonForm, TenLM: e.target.value })}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                placeholder="Mô tả về loại món này..."
                value={loaiMonForm.MoTa}
                onChange={(e) => setLoaiMonForm({ ...loaiMonForm, MoTa: e.target.value })}
                rows="4"
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-submit">
                {editingLoaiMon ? "💾 Cập nhật" : "➕ Thêm mới"}
              </button>
              {editingLoaiMon && (
                <button type="button" onClick={cancelEdit} className="btn-cancel">
                  ✖️ Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Section */}
        <div className="list-section">
          <h2>📋 Danh Sách Loại Món ({loaiMons.length})</h2>
          
          {loaiMons.length === 0 ? (
            <div className="empty-state">
              <p>Chưa có loại món nào. Hãy thêm loại món mới!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Tên Loại Món</th>
                    <th>Mô Tả</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {loaiMons.map((lm) => (
                    <tr key={lm.MaLM}>
                      <td>{lm.MaLM}</td>
                      <td className="category-name">{lm.TenLM}</td>
                      <td className="category-desc">{lm.MoTa || "—"}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => handleEdit(lm)} 
                            className="btn-edit"
                            title="Sửa"
                          >
                            ✏️ Sửa
                          </button>
                          <button onClick={() => handleDelete(lm.MaLM)} 
                            className="btn-delete"
                            title="Xóa"
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}