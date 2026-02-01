import pool from "../../config/db.js";

//Lấy danh sách đơn hàng
export const getAllOrders = async (req, res) => {
    try {
        const [row] = await pool.execute(`
                SELECT dh.*, COALESCE(dh.TenNguoiNhan, nd.HoTen) AS HoTen, nd.Email
                FROM DonHang dh
                LEFT JOIN NguoiDung nd ON dh.MaND = nd.MaND 
                ORDER BY dh.NgayDat DESC
            `);
        res.json(row);
    } catch (err) {
        console.error("Lỗi lấy đơn hàng: ", err);
        res.status(500).json({ message: "Lỗi server" });
    }
}

//Lấy đơn hàng theo mã
export const getOrderByMa = async (req, res) => {
    try {
        const { ma } = req.params;
        const [row] = await pool.execute(
            `SELECT dh.*, nd.HoTen AS TenNguoiDat
                FROM DonHang dh LEFT JOIN NguoiDung nd ON dh.MaND = nd.MaND
                WHERE dh.MaDH= ?`, [ma]
        );
        if (row.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }
        res.json(row[0]);
    } catch (err) {
        console.error("Lỗi lấy đơn hàng: ", err);
        res.status(500).json({ message: "Lỗi server" });
    }
}

export const getOrdersByUser = async (req, res) => {
    try {
        const { mand } = req.params;
        const [row] = await pool.execute(
            "SELECT * FROM DonHang WHERE MaND = ? ORDER BY NgayDat DESC",
            [mand]
        );
        res.json(row);
    } catch (err) {
        console.error("Lỗi lấy đơn hàng theo người dùng: ", err);
        res.status(500).json({ message: "Lỗi server" });
    }
}
// Lấy chi tiết đơn hàng
export const getChiTietDonHang = async (req, res) => {
    try {
        const { madh } = req.params;
        const query = `
            SELECT ctdh.*, ctm.KichCo, m.TenMon, m.HinhAnh
            FROM ChiTietDonHang ctdh
            JOIN ChiTietMon ctm ON ctdh.MaCTM = ctm.MaCTM
            JOIN Mon m ON ctm.MaMon = m.MaMon
            WHERE ctdh.MaDH = ?
        `;
        const [chitiet] = await pool.query(query, [madh]);
        res.json(chitiet);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi lấy chi tiết đơn hàng" });
    }
}
//Tạo đơn hàng mới
export const createOrders = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const {
            MaND,
            TenNguoiNhan,
            SDTNguoiNhan,
            DiaChiGiaoHang,
            PhuongThucThanhToan,
            DanhSachMon
        } = req.body;
        const finalMaND = MaND || req.user?.MaND || 1;
        if (!MaND || !TenNguoiNhan || !SDTNguoiNhan || !DiaChiGiaoHang || !PhuongThucThanhToan) {
            return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
        }

        if (!DanhSachMon || DanhSachMon.length === 0) {
            return res.status(400).json({ message: "Đơn hàng phải có ít nhất 1 món" });
        }

        await connection.beginTransaction();

        let tongTien = 0;
        for (const mon of DanhSachMon) {
            tongTien += mon.DonGia * mon.SoLuong;
        }
        //tạo đơn hàng
        const [kq] = await connection.execute(
            `INSERT INTO DonHang (MaND, TenNguoiNhan, SDTNguoiNhan, DiaChiGiaoHang, PhuongThucThanhToan, TongTien, TrangThai) 
                VALUES (?, ?, ?, ?, ?, ?, 'Treo')`,
            [
                finalMaND,
                TenNguoiNhan,
                SDTNguoiNhan,
                DiaChiGiaoHang,
                PhuongThucThanhToan,
                tongTien,
            ]);
        const MaDH = kq.insertId;
        //thêm chi tiết đơn hàng
        const themChiTiet = "INSERT INTO ChiTietDonHang (MaDH, MaCTM, SoLuong, DonGia) VALUES (?, ?, ?, ?)";
        for (const mon of DanhSachMon) {
            await connection.execute(themChiTiet, [MaDH, mon.MaCTM, mon.SoLuong, mon.DonGia]);
        }

        await connection.commit();

        res.status(201).json({ message: "Tạo đơn hàng thành công", MaDH: MaDH });
    } catch (err) {
        await connection.rollback();
        console.error("Lỗi tạo đơn hàng: ", err);
        res.status(500).json({ message: "Lỗi server" + err.message });
    }
    finally {
        connection.release();
    }
}
//Cập nhật đơn hàng và tự động tạo hóa đơn khi thanh toán
export const updateOrders = async (req, res) => {
    const connection = await pool.getConnection(); // Sử dụng connection để dùng Transaction
    try {
        const { ma } = req.params;
        const {
            TrangThai,
            TenNguoiNhan,
            SDTNguoiNhan,
            DiaChiGiaoHang,
            PhuongThucThanhToan
        } = req.body;

        // 1. Kiểm tra đơn hàng có tồn tại
        const [tontai] = await connection.query("SELECT * FROM DonHang WHERE MaDH = ?", [ma]);
        if (tontai.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        const userRole = req.user.VaiTro;
        await connection.beginTransaction(); // Bắt đầu Transaction

        // 2. Logic cập nhật đơn hàng
        if (userRole === 'NhanVien') {
            if (!TrangThai) {
                await connection.rollback();
                return res.status(400).json({ message: "Nhân viên chỉ được cập nhật trạng thái" });
            }
            await connection.execute("UPDATE DonHang SET TrangThai = ? WHERE MaDH = ?", [TrangThai, ma]);
        } else {
            // Logic cho ADMIN
            const updateFields = [];
            const updateValues = [];
            if (TrangThai) { updateFields.push("TrangThai = ?"); updateValues.push(TrangThai); }
            if (TenNguoiNhan) { updateFields.push("TenNguoiNhan = ?"); updateValues.push(TenNguoiNhan); }
            if (SDTNguoiNhan) { updateFields.push("SDTNguoiNhan = ?"); updateValues.push(SDTNguoiNhan); }
            if (DiaChiGiaoHang) { updateFields.push("DiaChiGiaoHang = ?"); updateValues.push(DiaChiGiaoHang); }
            if (PhuongThucThanhToan) { updateFields.push("PhuongThucThanhToan = ?"); updateValues.push(PhuongThucThanhToan); }

            if (updateFields.length > 0) {
                updateValues.push(ma);
                await connection.execute(`UPDATE DonHang SET ${updateFields.join(', ')} WHERE MaDH = ?`, updateValues);
            }
        }
        if (TrangThai === 'Đã hủy') {
            // Kiểm tra xem đã có hóa đơn chưa
            const [checkHD] = await connection.query("SELECT * FROM HoaDon WHERE MaDH = ?", [ma]);
            
            if (checkHD.length > 0) {
                // Nếu đã có hóa đơn , chuyển sang Hoàn tiền
                await connection.execute(
                    "UPDATE HoaDon SET TrangThai = 'Hoàn tiền' WHERE MaDH = ?", 
                    [ma]
                );
            }
        }
        // Nếu trạng thái mới là 'Đã thanh toán', tiến hành chèn vào bảng HoaDon
        if (TrangThai === 'Đã thanh toán') {
            // Kiểm tra xem hóa đơn cho đơn hàng này đã tồn tại chưa (tránh trùng lặp)
            const [checkHD] = await connection.query("SELECT * FROM HoaDon WHERE MaDH = ?", [ma]);

            if (checkHD.length === 0) {
                // Lấy thông tin mới nhất của đơn hàng sau khi update để làm hóa đơn
                const [currentOrder] = await connection.query("SELECT TongTien, PhuongThucThanhToan FROM DonHang WHERE MaDH = ?", [ma]);

                const insertHD = `
                    INSERT INTO HoaDon (MaDH, TongTien, NgayLap, HinhThucThanhToan, TrangThai) 
                    VALUES (?, ?, NOW(), ?,'Đã thanh toán')
                `;
                await connection.execute(insertHD, [
                    ma,
                    currentOrder[0].TongTien,
                    PhuongThucThanhToan || currentOrder[0].PhuongThucThanhToan || 'Tiền mặt'
                ]);
            }
            // Nếu đã có hóa đơn mà trước đó bị 'Hoàn tiền' (trường hợp hủy nhầm rồi thanh toán lại), cập nhật lại
            else if (checkHD[0].TrangThai === 'Hoàn tiền') {
                await connection.execute(
                   "UPDATE HoaDon SET TrangThai = 'Đã thanh toán' WHERE MaDH = ?", 
                   [ma]
               );
           }
        }

        await connection.commit(); // Hoàn tất mọi thay đổi
        res.json({ message: "Cập nhật đơn hàng và tạo hóa đơn thành công" });

    } catch (err) {
        await connection.rollback(); // Hủy bỏ thay đổi nếu có lỗi
        console.error("Lỗi cập nhật đơn hàng: ", err);
        res.status(500).json({ message: "Lỗi server" });
    } finally {
        connection.release(); // Giải phóng connection
    }
};
//Xóa đơn hàng
export const deleteOrders = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { ma } = req.params;

        const [hoadon] = await connection.query(
            "SELECT COUNT(*) as count FROM HoaDon WHERE MaDH = ?",
            [ma]
        );
        if (hoadon[0].count > 0) {
            return res.status(400).json({
                message: "Không thể xóa đơn hàng đã có hóa đơn"
            });
        }

        await connection.beginTransaction();
        //xóa chi tiết đơn hàng trc
        await connection.execute("DELETE FROM ChiTietDonHang WHERE MaDH = ?", [ma]);
        //xóa đơn hàng
        const [kq] = await connection.execute("DELETE FROM DonHang WHERE MaDH = ?", [ma]);

        if (kq.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }
        await connection.commit();
        res.json({ message: "Xóa đơn hàng thành công" });
    } catch (err) {
        console.error("Lỗi xoá đơn hàng:", err);
        res.status(500).json({ message: "Lỗi server" });
    } finally {
        connection.release();
    }
}