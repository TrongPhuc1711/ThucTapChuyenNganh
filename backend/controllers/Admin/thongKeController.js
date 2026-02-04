import pool from "../../config/db.js";

// Hàm hỗ trợ chuẩn hóa dữ liệu trước khi gửi về Frontend
const formatResponse = (tongQuan, chiTiet) => {
    return {
        DoanhThu: Number(tongQuan.DoanhThu || 0),
        SoDonHang: Number(tongQuan.SoDonHang || 0),
        SanPhamBan: Number(tongQuan.SanPhamBan || 0),
        ChiTiet: chiTiet.map(item => ({
            TenMon: item.TenMon,
            SoLuong: Number(item.SoLuong || 0),
            DonGia: Number(item.DonGiaDaiDien || 0), 
            ThanhTien: Number(item.ThanhTien || 0)
        }))
    };
};

// === 1. THỐNG KÊ THEO NGÀY ===
export const getDoanhThuTheoNgay = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ message: "Thiếu tham số date" });

        const [tongQuan] = await pool.execute(`
            SELECT 
                COALESCE(SUM(hd.TongTien), 0) AS DoanhThu,
                COUNT(DISTINCT hd.MaHD) AS SoDonHang,
                COALESCE((SELECT SUM(SoLuong) FROM ChiTietDonHang ct JOIN HoaDon h ON ct.MaDH = h.MaDH WHERE DATE(h.NgayLap) = ?), 0) AS SanPhamBan
            FROM HoaDon hd
            WHERE DATE(hd.NgayLap) = ?
        `, [date, date]);

        const [chiTiet] = await pool.execute(`
            SELECT 
                m.TenMon, 
                SUM(ctdh.SoLuong) AS SoLuong, 
                SUM(ctdh.SoLuong * ctdh.DonGia) AS ThanhTien,
                MAX(ctdh.DonGia) AS DonGiaDaiDien
            FROM HoaDon hd
            JOIN ChiTietDonHang ctdh ON hd.MaDH = ctdh.MaDH
            JOIN ChiTietMon ctm ON ctdh.MaCTM = ctm.MaCTM
            JOIN Mon m ON ctm.MaMon = m.MaMon
            WHERE DATE(hd.NgayLap) = ?
            GROUP BY m.TenMon
            ORDER BY ThanhTien DESC
        `, [date]);

        res.json(formatResponse(tongQuan[0], chiTiet));
    } catch (err) {
        res.status(500).json({ message: "Lỗi server thống kê ngày" });
    }
};

// === 2. THỐNG KÊ THEO THÁNG ===
export const getDoanhThuTheoThang = async (req, res) => {
    try {
        const { year, Month } = req.query;
        const [tongQuan] = await pool.execute(`
            SELECT 
                COALESCE(SUM(hd.TongTien), 0) AS DoanhThu,
                COUNT(DISTINCT hd.MaHD) AS SoDonHang,
                COALESCE((SELECT SUM(SoLuong) FROM ChiTietDonHang ct JOIN HoaDon h ON ct.MaDH = h.MaDH WHERE YEAR(h.NgayLap) = ? AND MonTH(h.NgayLap) = ?), 0) AS SanPhamBan
            FROM HoaDon hd
            WHERE YEAR(hd.NgayLap) = ? AND MonTH(hd.NgayLap) = ?
        `, [year, Month, year, Month]);

        
        const [chiTiet] = await pool.execute(`
            SELECT 
                m.TenMon, 
                SUM(ctdh.SoLuong) AS SoLuong, 
                SUM(ctdh.SoLuong * ctdh.DonGia) AS ThanhTien,
                MAX(ctdh.DonGia) AS DonGiaDaiDien
            FROM HoaDon hd
            JOIN ChiTietDonHang ctdh ON hd.MaDH = ctdh.MaDH
            JOIN ChiTietMon ctm ON ctdh.MaCTM = ctm.MaCTM
            JOIN Mon m ON ctm.MaMon = m.MaMon
            WHERE YEAR(hd.NgayLap) = ? AND MonTH(hd.NgayLap) = ?
            GROUP BY m.TenMon
            ORDER BY ThanhTien DESC
        `, [year, Month]);

        res.json(formatResponse(tongQuan[0], chiTiet));
    } catch (err) {
        res.status(500).json({ message: "Lỗi server thống kê tháng" });
    }
};

// === 3. THỐNG KÊ THEO NĂM ===
export const getDoanhThuTheoNam = async (req, res) => {
    try {
        const { year } = req.query;
        const [tongQuan] = await pool.execute(`
            SELECT 
                COALESCE(SUM(hd.TongTien), 0) AS DoanhThu,
                COUNT(DISTINCT hd.MaHD) AS SoDonHang,
                COALESCE((SELECT SUM(SoLuong) FROM ChiTietDonHang ct JOIN HoaDon h ON ct.MaDH = h.MaDH WHERE YEAR(h.NgayLap) = ?), 0) AS SanPhamBan
            FROM HoaDon hd
            WHERE YEAR(hd.NgayLap) = ?
        `, [year, year]);

        const [chiTiet] = await pool.execute(`
            SELECT 
                m.TenMon, 
                SUM(ctdh.SoLuong) AS SoLuong, 
                SUM(ctdh.SoLuong * ctdh.DonGia) AS ThanhTien,
                MAX(ctdh.DonGia) AS DonGiaDaiDien
            FROM HoaDon hd
            JOIN ChiTietDonHang ctdh ON hd.MaDH = ctdh.MaDH
            JOIN ChiTietMon ctm ON ctdh.MaCTM = ctm.MaCTM
            JOIN Mon m ON ctm.MaMon = m.MaMon
            WHERE YEAR(hd.NgayLap) = ?
            GROUP BY m.TenMon
            ORDER BY ThanhTien DESC
        `, [year]);

        res.json(formatResponse(tongQuan[0], chiTiet));
    } catch (err) {
        res.status(500).json({ message: "Lỗi server thống kê năm" });
    }
};