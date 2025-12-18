import { HoaDon } from "../../models/hoadonModel.js";
export const hoaDonController = {
    // Lấy danh sách hóa đơn
    async getAll(req, res) {
        try {
            const [rows] = await HoaDon.getAll();
            res.json(rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Lỗi khi lấy danh sách hóa đơn" });
        }
    },

    // Lấy chi tiết hóa đơn
    async getById(req, res) {
        try {
            const id = req.params.id;
            const [rows] = await HoaDon.getById(id);

            if (rows.length === 0) {
                return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
            }

            res.json(rows[0]);
        } catch (err) {
            res.status(500).json({ message: "Lỗi khi lấy hóa đơn" });
        }
    },

    // Tạo hóa đơn (Admin hoặc hệ thống tự tạo)
    async create(req, res) {
        try {
            const data = req.body;
            if (!data.MaDH || !data.TongTien) {
                return res.status(400).json({ message: "Thiếu thông tin MaDH hoặc TongTien" });
            }
            const [result] = await HoaDon.create(data);
            res.status(201).json({ 
                message: "Tạo hóa đơn thành công",
                MaHD: result.insertId
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Lỗi khi tạo hóa đơn" });
        }
    },

    // Cập nhật hóa đơn (trạng thái, hình thức thanh toán)
    async update(req, res) {
        try {
            const id = req.params.id;
            const data = req.body;
            const [result] = await HoaDon.update(id, data);
            // Kiểm tra xem có dòng nào bị ảnh hưởng không
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Không tìm thấy hóa đơn để cập nhật" });
            }
            res.json({ message: "Cập nhật hóa đơn thành công" });
        } catch (err) {
            res.status(500).json({ message: "Lỗi khi cập nhật hóa đơn" });
        }
    },

    // Xóa hóa đơn
    async delete(req, res) {
        try {
            const id = req.params.id;
            const [result] = await HoaDon.delete(id);

            // Kiểm tra xem có xóa được dòng nào không
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Không tìm thấy hóa đơn để xóa" });
            }
            res.json({ message: "Xóa hóa đơn thành công" });
        } catch (err) {
            res.status(500).json({ message: "Lỗi khi xóa hóa đơn" });
        }
    }
};