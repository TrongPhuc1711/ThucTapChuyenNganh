import pool from "../../config/db.js";

// === 1. THỐNG KÊ THEO NGÀY ===
export const getDoanhThuTheoNgay = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ message: "Thiếu tham số date" });

        // Query 1: Tổng quan (Doanh thu lấy từ HoaDon, Sản phẩm bán lấy từ ChiTietDonHang)
        const [tongQuan] = await pool.execute(`
            SELECT 
                COALESCE(SUM(hd.TongTien), 0) AS DoanhThu,
                COUNT(hd.MaHD) AS SoDonHang,
                COALESCE(SUM(
                    (SELECT SUM(ctdh.SoLuong) 
                     FROM chitietdonhang ctdh 
                     WHERE ctdh.MaDH = hd.MaDH)
                ), 0) AS SanPhamBan
            FROM hoadon hd
            WHERE DATE(hd.NgayLap) = ?
        `, [date]);

        // Query 2: Chi tiết món ăn (JOIN qua 4 bảng để lấy tên món)
        const [chiTiet] = await pool.execute(`
            SELECT 
                m.TenMon, 
                SUM(ctdh.SoLuong) AS SoLuong, 
                SUM(ctdh.SoLuong * ctdh.DonGia) AS ThanhTien,
                ctdh.DonGia
            FROM chitietdonhang ctdh
            JOIN donhang dh ON ctdh.MaDH = dh.MaDH
            JOIN hoadon hd ON dh.MaDH = hd.MaDH
            JOIN chitietmon ctm ON ctdh.MaCTM = ctm.MaCTM
            JOIN mon m ON ctm.MaMon = m.MaMon
            WHERE DATE(hd.NgayLap) = ?
            GROUP BY m.MaMon, m.TenMon, ctdh.DonGia
        `, [date]);

        res.json({
            DoanhThu: Number(tongQuan[0].DoanhThu),
            SoDonHang: tongQuan[0].SoDonHang,
            SanPhamBan: Number(tongQuan[0].SanPhamBan),
            ChiTiet: chiTiet
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server khi lấy thống kê ngày" });
    }
};

// === 2. THỐNG KÊ THEO THÁNG ===
export const getDoanhThuTheoThang = async (req, res) => {
    try {
        const { year, month } = req.query;
        if (!year || !month) return res.status(400).json({ message: "Thiếu năm hoặc tháng" });

        // Query 1: Tổng quan
        const [tongQuan] = await pool.execute(`
            SELECT 
                COALESCE(SUM(hd.TongTien), 0) AS DoanhThu,
                COUNT(hd.MaHD) AS SoDonHang,
                COALESCE(SUM(
                    (SELECT SUM(ctdh.SoLuong) 
                     FROM chitietdonhang ctdh 
                     WHERE ctdh.MaDH = hd.MaDH)
                ), 0) AS SanPhamBan
            FROM hoadon hd
            WHERE YEAR(hd.NgayLap) = ? AND MONTH(hd.NgayLap) = ?
        `, [year, month]);

        // Query 2: Chi tiết món
        const [chiTiet] = await pool.execute(`
            SELECT 
                m.TenMon, 
                SUM(ctdh.SoLuong) AS SoLuong, 
                SUM(ctdh.SoLuong * ctdh.DonGia) AS ThanhTien,
                ctdh.DonGia
            FROM chitietdonhang ctdh
            JOIN donhang dh ON ctdh.MaDH = dh.MaDH
            JOIN hoadon hd ON dh.MaDH = hd.MaDH
            JOIN chitietmon ctm ON ctdh.MaCTM = ctm.MaCTM
            JOIN mon m ON ctm.MaMon = m.MaMon
            WHERE YEAR(hd.NgayLap) = ? AND MONTH(hd.NgayLap) = ?
            GROUP BY m.MaMon, m.TenMon, ctdh.DonGia
            ORDER BY ThanhTien DESC
        `, [year, month]);

        res.json({
            DoanhThu: Number(tongQuan[0].DoanhThu),
            SoDonHang: tongQuan[0].SoDonHang,
            SanPhamBan: Number(tongQuan[0].SanPhamBan),
            ChiTiet: chiTiet
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server khi lấy thống kê tháng" });
    }
};

// === 3. THỐNG KÊ THEO NĂM ===
export const getDoanhThuTheoNam = async (req, res) => {
    try {
        const { year } = req.query;
        if (!year) return res.status(400).json({ message: "Thiếu năm" });

        // Query 1: Tổng quan
        const [tongQuan] = await pool.execute(`
            SELECT 
                COALESCE(SUM(hd.TongTien), 0) AS DoanhThu,
                COUNT(hd.MaHD) AS SoDonHang,
                COALESCE(SUM(
                    (SELECT SUM(ctdh.SoLuong) 
                     FROM chitietdonhang ctdh 
                     WHERE ctdh.MaDH = hd.MaDH)
                ), 0) AS SanPhamBan
            FROM hoadon hd
            WHERE YEAR(hd.NgayLap) = ?
        `, [year]);

        // Query 2: Chi tiết món
        const [chiTiet] = await pool.execute(`
            SELECT 
                m.TenMon, 
                SUM(ctdh.SoLuong) AS SoLuong, 
                SUM(ctdh.SoLuong * ctdh.DonGia) AS ThanhTien,
                ctdh.DonGia
            FROM chitietdonhang ctdh
            JOIN donhang dh ON ctdh.MaDH = dh.MaDH
            JOIN hoadon hd ON dh.MaDH = hd.MaDH
            JOIN chitietmon ctm ON ctdh.MaCTM = ctm.MaCTM
            JOIN mon m ON ctm.MaMon = m.MaMon
            WHERE YEAR(hd.NgayLap) = ?
            GROUP BY m.MaMon, m.TenMon, ctdh.DonGia
            ORDER BY ThanhTien DESC
        `, [year]);

        res.json({
            DoanhThu: Number(tongQuan[0].DoanhThu),
            SoDonHang: tongQuan[0].SoDonHang,
            SanPhamBan: Number(tongQuan[0].SanPhamBan),
            ChiTiet: chiTiet
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server khi lấy thống kê năm" });
    }
};