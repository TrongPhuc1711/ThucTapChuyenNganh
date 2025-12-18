import pool from '../../config/db.js';
import bcrypt from 'bcryptjs';
// Lấy tất cả khách hàng
export const getAllKhachHang = async (req, res) => {
    try {
        const [khachhangs] = await pool.query(
            `SELECT kh.MaND, nd.HoTen, nd.Email, kh.DiaChi, kh.SDT, nd.NgayTao
             FROM KhachHang kh
             JOIN NguoiDung nd ON kh.MaND = nd.MaND`
        );
        res.json(khachhangs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi lấy danh sách khách hàng" });
    }
};

// Lấy khách hàng theo ID
export const getKhachHangById = async (req, res) => {
    try {
        const { id } = req.params;
        const [khachhangs] = await pool.query(
            `SELECT kh.MaND, nd.HoTen, nd.Email, kh.DiaChi, kh.SDT
             FROM KhachHang kh
             JOIN NguoiDung nd ON kh.MaND = nd.MaND
             WHERE kh.MaND = ?`,
            [id]
        );
        if (khachhangs.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy khách hàng" });
        }
        res.json(khachhangs[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi lấy thông tin khách hàng" });
    }
};

// Tạo khách hàng (thêm user trước, sau đó thêm khách hàng)
export const createKhachHang = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { HoTen, Email, MatKhau, DiaChi, SDT } = req.body;
        
        if (!HoTen || !Email || !MatKhau) {
            return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
        }

        await connection.beginTransaction();

        //Tạo user trước
        const hashPassword = await bcrypt.hash(MatKhau, 10);
        const [userResult] = await connection.query(
            "INSERT INTO nguoidung (HoTen, Email, MatKhau, VaiTro) VALUES (?, ?, ?, ?)",
            [HoTen, Email, hashPassword, 'KhachHang']
        );
        const MaND = userResult.insertId;

        //Thêm vào bảng khachhang
        const[kqKhachHang] = await connection.query(
            "INSERT INTO KhachHang (MaND, DiaChi, SDT) VALUES (?, ?, ?)",
            [MaND, DiaChi || null, SDT || null]
        );

        await connection.commit();
        res.status(201).json({ 
            message: "Thêm khách hàng thành công",
            MaKH: kqKhachHang.insertId,
            MaND: MaND 
        });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: "Lỗi khi thêm khách hàng" });
    } finally {
        connection.release();
    }
};

// Cập nhật khách hàng
export const updateKhachHang = async (req, res) => {
    try {
        const { id } = req.params;
        const { HoTen, Email, DiaChi, SDT } = req.body;
        // Cập nhật nguoidung
        if (HoTen || Email) {
            const updates = [];
            const values = [];
            if (HoTen) {
                updates.push("HoTen = ?");
                values.push(HoTen);
            }
            if (Email) {
                updates.push("Email = ?");
                values.push(Email);
            }
            values.push(id);
            
            await pool.query(
                `UPDATE NguoiDung SET ${updates.join(', ')} WHERE MaND = ?`,
                values
            );
        }

        // Cập nhật khachhang
        if(DiaChi !== undefined || SDT !== undefined){
            const updateKH =[];
            const valueKH = [];
            if (DiaChi !== undefined) {
                 updateKH.push("DiaChi = ?"); 
                 valueKH.push(DiaChi); 
            }
            if (SDT !== undefined) { 
                updateKH.push("SDT = ?"); valueKH.push(SDT); 
            }
            if (updateKH.length > 0) {
                valueKH.push(id);
                await pool.query(
                   `UPDATE KhachHang SET ${updateKH.join(', ')} WHERE MaND = ?`,
                   valueKH
               );
           }
        }
       
        res.json({ message: "Cập nhật khách hàng thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi cập nhật khách hàng" });
    }
};

// Xóa khách hàng
export const deleteKhachHang = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        await connection.beginTransaction();
        
        // Kiểm tra có đơn hàng chưa
        const [orders] = await connection.query(
            "SELECT COUNT(*) as count FROM donhang WHERE MaND = ?",
            [id]
        );

        if (orders[0].count > 0) {
            await connection.rollback();
            return res.status(400).json({ 
                message: "Không thể xóa khách hàng này vì còn đơn hàng" 
            });
        }

        // Xóa trong bang khachhang 
        await connection.query("DELETE FROM KhachHang WHERE MaND = ?", [id]);
        //xoa trong bang nguoidung
        const [deleteND] =await connection.query(
            "DELETE FROM NguoiDung WHERE MaND = ?", [id]
        );
        if (deleteResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Không tìm thấy khách hàng cần xóa." });
        }
        await connection.commit();
        res.json({ message: "Xóa khách hàng thành công" });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: "Lỗi khi xóa khách hàng" });
    } finally {
        connection.release();
    }
};