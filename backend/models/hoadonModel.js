import pool from "../config/db.js";

export const HoaDon = {
    getAll() {
        return pool.execute(
            `SELECT hd.*, dh.NgayDat, nd.HoTen AS TenKhach
             FROM HoaDon hd JOIN DonHang dh ON hd.MaDH = dh.MaDH
                            JOIN NguoiDung nd ON dh.MaND = nd.MaND
             ORDER BY hd.MaHD DESC`
        );
    },

    getById(id) {
        return pool.execute(
            `SELECT hd.*, dh.NgayDat, nd.HoTen AS TenKhach
             FROM HoaDon hd JOIN DonHang dh ON hd.MaDH = dh.MaDH
                            JOIN NguoiDung nd ON dh.MaND = nd.MaND
             WHERE hd.MaHD = ?`,
            [id]
        );
    },

    create(data) {
        return pool.execute(
            `INSERT INTO HoaDon (MaDH, TongTien, HinhThucThanhToan, TrangThai)
             VALUES (?, ?, ?, ?)`,
            [data.MaDH, data.TongTien, data.HinhThucThanhToan, data.TrangThai]
        );
    },

    update(id, data) {
        return pool.execute(
            `UPDATE HoaDon SET
                    HinhThucThanhToan = ?,
                    TrangThai = ?
                 WHERE MaHD = ?`,
            [data.HinhThucThanhToan, data.TrangThai, id]
        );
    },

    delete(id) {
        return pool.execute(`DELETE FROM HoaDon WHERE MaHD = ?`, [id]);
    }
};
