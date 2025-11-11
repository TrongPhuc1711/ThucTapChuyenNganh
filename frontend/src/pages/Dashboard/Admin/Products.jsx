import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import "../../../styles/Dashboard/Products.css";

export default function Products() {
  const navigate = useNavigate();
  const [mons, setMons] = useState([]);
  const [loaiMons, setLoaiMons] = useState([]);
  const [monForm, setMonForm] = useState({ 
    TenMon: "", 
    Gia: "", 
    MoTa: "", 
    MaLM: "" 
  });
  const [hinhAnhFile, setHinhAnhFile] = useState(null);     // State mới để giữ TỆP
  const [hinhAnhPreview, setHinhAnhPreview] = useState(""); // State mới để XEM TRƯỚC
  const [editingMon, setEditingMon] = useState(null);
  const [message, setMessage] = useState("");
  const [filterLoai, setFilterLoai] = useState("");

  useEffect(() => {
    loadLoaiMons();
    loadMons();
  }, []);

  const loadLoaiMons = async () => {
    try {
      const res = await api.get("/loaimon");
      setLoaiMons(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMons = async () => {
    try {
      const res = await api.get("/mon");
      setMons(res.data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi khi tải danh sách món");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('TenMon', monForm.TenMon);
    formData.append('Gia', monForm.Gia);
    formData.append('MoTa', monForm.MoTa);
    formData.append('MaLM', monForm.MaLM);
    if (hinhAnhFile) {
        formData.append('HinhAnh', hinhAnhFile);
    } else if (editingMon) {
        // Nếu sửa mà không đổi ảnh, gửi lại URL ảnh cũ
        const oldMon = mons.find(m => m.MaMon === editingMon);
        if(oldMon && oldMon.HinhAnh) {
            formData.append('HinhAnh', oldMon.HinhAnh);
        }
    }
    try {
      if (editingMon) {
        await api.put(`/mon/${editingMon}`, formData, {headers: { 'Content-Type': 'multipart/form-data' }});
        setMessage("✅ Cập nhật món thành công");
        
      } else {
        await api.post("/mon", formData);
        setMessage("✅ Thêm món thành công")
      }
        cancelEdit(); // Gọi hàm reset (chúng ta cũng sẽ sửa hàm này)
        loadMons();
        setTimeout(() => setMessage(""), 3000);

    } catch (err) {
        setMessage("❌ " + (err.response?.data?.message || "Có lỗi xảy ra"));
        setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (e.target && e.target.files && e.target.files.length > 0) {
        setHinhAnhFile(file); // Lưu TỆP TIN vào state hinhAnhFile
        setHinhAnhPreview(URL.createObjectURL(file)); // Tạo URL xem trước
        }
    };
  const handleEdit = (mon) => {
    setMonForm({
      TenMon: mon.TenMon,
      Gia: mon.Gia,
      MoTa: mon.MoTa || "",
      MaLM: mon.MaLM
    });
    setEditingMon(mon.MaMon);
    setHinhAnhFile(null); // Xóa file đang chọn
    // Hiển thị ảnh cũ (lấy từ server)
    setHinhAnhPreview(mon.HinhAnh ? `http://localhost:4000${mon.HinhAnh}` : "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa món này?")) return;
    try {
      await api.delete(`/mon/${id}`);
      setMessage("✅ Xóa món thành công");
      loadMons();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Không thể xóa"));
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const cancelEdit = () => {
    setMonForm({ TenMon: "", Gia: "", MoTa: "", MaLM: "" });
    setEditingMon(null);
    setHinhAnhFile(null); // Reset file
    setHinhAnhPreview(""); // Reset ảnh xem trước
  };

  const filteredMons = filterLoai 
    ? mons.filter(m => m.MaLM === parseInt(filterLoai))
    : mons;

  return (
    <div className="products-container">
      <div className="products-header">
        <button onClick={() => navigate("/admin")} className="btn-back">
          ← Quay lại
        </button>
        <h1>☕ Quản Lý Món</h1>
      </div>

      {message && <div className="message-alert">{message}</div>}

      <div className="products-content">
        {/* Form Section */}
        <div className="form-section">
          <h2>{editingMon ? "✏️ Sửa Món" : "➕ Thêm Món Mới"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Tên món *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Cà phê sữa đá"
                  value={monForm.TenMon}
                  onChange={(e) => setMonForm({ ...monForm, TenMon: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Giá (VNĐ) *</label>
                <input
                  type="number"
                  placeholder="25000"
                  value={monForm.Gia}
                  onChange={(e) => setMonForm({ ...monForm, Gia: e.target.value })}
                  required
                  min="0"
                  step="1000"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Loại món *</label>
              <select
                value={monForm.MaLM}
                onChange={(e) => setMonForm({ ...monForm, MaLM: e.target.value })}
                required
              >
                <option value="">-- Chọn loại món --</option>
                {loaiMons.map((lm) => (
                  <option key={lm.MaLM} value={lm.MaLM}>
                    {lm.TenLM}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                placeholder="Mô tả về món ăn..."
                value={monForm.MoTa}
                onChange={(e) => setMonForm({ ...monForm, MoTa: e.target.value })}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Hình ảnh</label>
              <input type="file" accept="image/*" onChange={handleFileChange} // Gọi hàm xử lý file 
                /> 
                {hinhAnhPreview && ( // Dùng state xem trước
                    <div className="image-preview">
                        <img src={hinhAnhPreview} alt="Xem trước" />
                    </div>)
                }
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-submit">
                {editingMon ? "💾 Cập nhật" : "➕ Thêm mới"}
              </button>
              {editingMon && (
                <button type="button" onClick={cancelEdit} className="btn-cancel">
                  ✖️ Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Section */}
        <div className="list-section">
          <div className="list-header">
            <h2>📋 Danh Sách Món ({filteredMons.length})</h2>
            <div className="filter-group">
              <label>Lọc theo loại:</label>
              <select value={filterLoai} onChange={(e) => setFilterLoai(e.target.value)}>
                <option value="">Tất cả</option>
                {loaiMons.map((lm) => (
                  <option key={lm.MaLM} value={lm.MaLM}>
                    {lm.TenLM}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {filteredMons.length === 0 ? (
            <div className="empty-state">
              <p>Chưa có món nào. Hãy thêm món mới!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Hình ảnh</th>
                    <th>Tên Món</th>
                    <th>Giá</th>
                    <th>Loại Món</th>
                    <th>Mô tả</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMons.map((m) => (
                    <tr key={m.MaMon}>
                      <td>{m.MaMon}</td>
                      <td>
                        {m.HinhAnh ? (
                          <img 
                            src={`http://localhost:4000${m.HinhAnh}`} 
                            alt={m.TenMon} 
                            className="product-image"
                            onError={(e) => e.target.src = '/caphesua.jpg'}
                          />
                        ) : (
                          <div className="no-image">📷</div>
                        )}
                      </td>
                      <td className="product-name">{m.TenMon}</td>
                      <td className="product-price">{Number(m.Gia).toLocaleString()} đ</td>
                      <td>
                        <span className="badge-category">{m.TenLM}</span>
                      </td>
                      <td className="product-desc">{m.MoTa || "—"}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => handleEdit(m)} 
                            className="btn-edit"
                            title="Sửa"
                          >
                            ✏️ Sửa
                          </button>
                          <button 
                            onClick={() => handleDelete(m.MaMon)} 
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