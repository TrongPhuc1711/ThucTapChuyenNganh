import { useState, useEffect } from "react";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";

const API_URL = import.meta.env.VITE_API_URL;

export default function Products() {
  const [mons, setMons] = useState([]);
  const [loaiMons, setLoaiMons] = useState([]);
  const [monForm, setMonForm] = useState({ 
    TenMon: "", 
    MoTa: "", 
    MaLM: "" 
  });
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
      setMessage("❌ Lỗi khi tải loại món");
    }
  };

  const loadMons = async () => {
    try {
      const res = await api.get("/mon");
      // Load chi tiết món cho mỗi món
      const monsWithDetails = await Promise.all(
        res.data.map(async (mon) => {
          try {
            const detailRes = await api.get(`/chitietmon/mon/${mon.MaMon}`);
            return { ...mon, chiTiet: detailRes.data };
          } catch {
            return { ...mon, chiTiet: [] };
          }
        })
      );
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
    
    if (hinhAnhFile) {
      formData.append('HinhAnh', hinhAnhFile);
    }

    // Thêm chi tiết món (chỉ các kích cỡ có giá)
    const validChiTiet = chiTietMonForm.filter(ct => ct.Gia && ct.Gia > 0);
    formData.append('ChiTietMon', JSON.stringify(validChiTiet));

    try {
      if (editingMon) {
        await api.put(`/mon/${editingMon}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMessage("✅ Cập nhật món thành công");
      } else {
        await api.post("/mon", formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMessage("✅ Thêm món thành công");
      }
      cancelEdit();
      loadMons();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Có lỗi xảy ra"));
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 3000);
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
    setMonForm({
      TenMon: mon.TenMon,
      MoTa: mon.MoTa || "",
      MaLM: mon.MaLM
    });
    setEditingMon(mon.MaMon);
    setHinhAnhFile(null);
    setHinhAnhPreview(mon.HinhAnh ? `${API_URL}${mon.HinhAnh}` : "");
    
    // Load chi tiết món vào form
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

  const filteredMons = filterLoai 
    ? mons.filter(m => m.MaLM === parseInt(filterLoai))
    : mons;

  return (
    <DashboardLayout title="Quản lý món">
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

            <div className="chitiet-section">
              <h3>💰 Giá theo kích cỡ</h3>
              <div className="chitiet-grid">
                {chiTietMonForm.map((ct, index) => (
                  <div key={index} className="size-item">
                    <h4>{ct.KichCo}</h4>
                    <div className="form-group">
                      <label>Giá (VNĐ)</label>
                      <input
                        type="number"
                        placeholder="25.000"
                        value={ct.Gia}
                        onChange={(e) => handleChiTietChange(index, 'Gia', e.target.value)}
                        min="0"
                        step="1000"
                      />
                    </div>
                    <div className="form-group">
                      <label>Trạng thái</label>
                      <select
                        value={ct.TrangThai}
                        onChange={(e) => handleChiTietChange(index, 'TrangThai', e.target.value)}
                      >
                        <option value="Còn bán">Còn bán</option>
                        <option value="Hết hàng">Hết hàng</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Hình ảnh</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {hinhAnhPreview && (
                <div className="image-preview">
                  <img src={hinhAnhPreview} alt="Xem trước" />
                </div>
              )}
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-submit" disabled={isLoading}>
                {isLoading ? "⏳ Đang xử lý..." : (editingMon ? "💾 Cập nhật" : "➕ Thêm mới")}
              </button>
              {editingMon && (
                <button type="button" onClick={cancelEdit} className="btn-cancel" disabled={isLoading}>
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
                    <th>Loại Món</th>
                    <th>Giá</th>
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
                            src={`${API_URL}${m.HinhAnh}`} 
                            alt={m.TenMon} 
                            className="dashboard-product-image"
                            onError={(e) => e.target.src = '/caphesua.jpg'}
                          />
                        ) : (
                          <div className="no-image">📷</div>
                        )}
                      </td>
                      <td>{m.TenMon}</td>
                      <td>
                        <span className="badge-category">{m.TenLM}</span>
                      </td>
                      <td>
                        {m.chiTiet && m.chiTiet.length > 0 ? (
                          <div className="price-list">
                            {m.chiTiet.map((ct, idx) => (
                              <div key={idx} className="price-item">
                                <strong>{ct.KichCo}:</strong> {Number(ct.Gia).toLocaleString()}đ
                                {ct.TrangThai !== "Còn bán" && <span> ({ct.TrangThai})</span>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{color: '#999'}}>Chưa có giá</span>
                        )}
                      </td>
                      <td>{m.MoTa || "—"}</td>
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
    </DashboardLayout>
  );
}