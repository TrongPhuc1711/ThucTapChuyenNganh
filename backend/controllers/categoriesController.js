import pool from '../config/db.js';

// Lấy tất cả loại món
export const getAllLoaiMon = async (req, res) => {
    try {
        const [loaiMons] = await pool.query("SELECT * FROM LoaiMon ORDER BY MaLM DESC");
        res.json(loaiMons);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi lấy danh sách loại món" });
    }
};

// Lấy một loại món theo ID
export const getLoaiMonById = async (req, res) => {
    try {
        const { id } = req.params;
        const [loaiMons] = await pool.query("SELECT * FROM LoaiMon WHERE MaLM = ?", [id]);
        
        if (loaiMons.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy loại món" });
        }
        
        res.json(loaiMons[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi lấy thông tin loại món" });
    }
};

// Thêm loại món mới
export const createLoaiMon = async (req, res) => {
    try {
        const { TenLM, MoTa } = req.body;
        
        if (!TenLM) {
            return res.status(400).json({ message: "Tên loại món không được để trống" });
        }

        const insert = "INSERT INTO LoaiMon (TenLM, MoTa) VALUES (?, ?)";
        const [result] = await pool.query(insert, [TenLM, MoTa || null]);
        
        res.status(201).json({ 
            message: "✅ Thêm loại món thành công",
            MaLM: result.insertId 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi thêm loại món" });
    }
};

// Cập nhật loại món
export const updateLoaiMon = async (req, res) => {
    try {
        const { id } = req.params;
        const { TenLM, MoTa } = req.body;
        
        if (!TenLM) {
            return res.status(400).json({ message: "Tên loại món không được để trống" });
        }

        const update = "UPDATE LoaiMon SET TenLM = ?, MoTa = ? WHERE MaLM = ?";
        const [result] = await pool.query(update, [TenLM, MoTa || null, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy loại món" });
        }
        
        res.json({ message: "✅ Cập nhật loại món thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi cập nhật loại món" });
    }
};

// Xóa loại món
export const deleteLoaiMon = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Kiểm tra xem có món nào thuộc loại này không
        const [mons] = await pool.query("SELECT COUNT(*) as count FROM Mon WHERE MaLM = ?", [id]);
        
        if (mons[0].count > 0) {
            return res.status(400).json({ 
                message: "Không thể xóa loại món này vì còn món thuộc loại này" 
            });
        }

        const deleteQuery = "DELETE FROM LoaiMon WHERE MaLM = ?";
        const [result] = await pool.query(deleteQuery, [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy loại món" });
        }
        
        res.json({ message: "✅ Xóa loại món thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi xóa loại món" });
    }
};