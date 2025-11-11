import pool from '../config/db.js';

//LẤY TẤT CẢ món (kèm tên loại món)
export const getAllMon = async (req, res) => {
    try {
        const query = `
            SELECT m.*, l.TenLM 
            FROM Mon m
            LEFT JOIN LoaiMon l ON m.MaLM = l.MaLM
            ORDER BY m.MaMon DESC
        `;
        const [mons] = await pool.query(query);
        res.json(mons);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi lấy danh sách món" });
    }
};

//LẤY 1 món theo mã (kèm tên loại món)

export const getMonById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT m.*, l.TenLM 
            FROM Mon m
            LEFT JOIN LoaiMon l ON m.MaLM = l.MaLM
            WHERE m.MaMon = ?
        `;
        const [mons] = await pool.query(query, [id]);
        
        if (mons.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy món" });
        }
        
        res.json(mons[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi lấy thông tin món" });
    }
};

/**
 * THÊM món mới
 * (Code này giả định bạn gửi HinhAnh là một URL text,
 * nếu bạn dùng upload file, controller này sẽ phức tạp hơn)
 */
export const createMon = async (req, res) => {
    try {
        const { TenMon, Gia, MoTa, MaLM } = req.body;
        
        if (!TenMon || !Gia || !MaLM) {
            return res.status(400).json({ message: "Tên món, Giá và Loại món không được để trống" });
        }
        //lấy từ req.file chứ không phải req.body
        const HinhAnh = req.file ? `/uploads/${req.file.filename}` : null;
        const insert = "INSERT INTO Mon (TenMon, Gia, MoTa, HinhAnh, MaLM) VALUES (?, ?, ?, ?, ?)";
        const [result] = await pool.query(insert, [TenMon, Gia, MoTa || null, HinhAnh || null, MaLM]);
        
        res.status(201).json({ 
            message: "✅ Thêm món thành công",
            MaMon: result.insertId 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi thêm món" });
    }
};

// Cập nhật món
export const updateMon = async (req, res) => {
    try {
        const { id } = req.params;
        const { TenMon, Gia, MoTa, MaLM } = req.body;
        
        if (!TenMon || !Gia || !MaLM) {
            return res.status(400).json({ message: "Tên món, Giá và Loại món không được để trống" });
        }

        let HinhAnh;
        if(req.file){
            HinhAnh= `/uploads/${req.file.HinhAnh}`;
        }
        else if(req.body.HinhAnh){
            HinhAnh=req.body.HinhAnh;
        }
        else{
            //khong co anh thi se null
            HinhAnh=null;
        }
        const update = "UPDATE Mon SET TenMon = ?, Gia = ?, MoTa = ?, HinhAnh = ?, MaLM = ? WHERE MaMon = ?";
        const [result] = await pool.query(update, [TenMon, Gia, MoTa || null, HinhAnh || null, MaLM, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy món" });
        }
        
        res.json({ message: "✅ Cập nhật món thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi cập nhật món" });
    }
};

//XÓA món
//(Kiểm tra an toàn: Không cho xóa nếu món đã có trong đơn hàng)
export const deleteMon = async (req, res) => {
    try {
        const { id } = req.params;
        const [orders] = await pool.query("SELECT COUNT(*) as count FROM ChiTietDonHang WHERE MaMon = ?", [id]);
        
        if (orders[0].count > 0) {
            return res.status(400).json({ 
                message: "Không thể xóa món này vì đã có trong các đơn hàng đã đặt" 
            });
        }
        const deleteQuery = "DELETE FROM Mon WHERE MaMon = ?";
        const [result] = await pool.query(deleteQuery, [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy món" });
        }
        
        res.json({ message: "✅ Xóa món thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi xóa món" });
    }
};