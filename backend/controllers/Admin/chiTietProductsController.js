import pool from "../../config/db.js";

//lay chi tiet mon theo MaMon
export const getChiTietMonByMaMon =async (req,res) =>{
    try {
        const { mamon }= req.params;
        const query=`SELECT * FROM ChiTietMon
                    WHERE MaMon= ?
                    ORDER BY CASE KichCo
                                WHEN 'Nhỏ' THEN 1
                                WHEN 'Vừa' THEN 2
                                WHEN 'Lớn' THEN 3
                            END`;
        const [chitiet] = await pool.query(query, [mamon]);
        res.json(chitiet);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Lỗi khi lấy chi tiết món"})
    }
}

//lay chi tiet mon theo MaCTM
export const getChiTietMonByMa =async (req,res) =>{
    try {
        const { ma }= req.params;
        const [chitiet] =await pool.query("SELECT * FROM ChiTietMon WHERE MaCTM = ?", [ma]);
        if (chitiet.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy chi tiết món" });
        }
        res.json(chitiet[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Lỗi khi lấy chi tiết món"})
    }
}

//them chi tiet mon
export const createChiTietMon = async (req, res) => {
    try {
        const { MaMon, KichCo, Gia, TrangThai } =req.body;

        if(!MaMon || !KichCo || !Gia){
            return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
        }

        //Kiem tra mon co ton tai khong
        const [mon] =await pool.query("SELECT * FROM Mon WHERE MaMon = ?", [MaMon]);
        if(mon.length ===0){
            return res.status(404).json({ message: "Món không tồn tại" });
        }
        //kiem tra mon co ton tai chua
        const [existsMon] =await pool.query(
            "SELECT * FROM ChiTietMon WHERE MaMon = ? AND KichCo = ?", 
            [MaMon, KichCo]
        );

        if(existsMon.length > 0){
            return res.status(400).json({ message: "Kích cỡ này đã tồn tại cho món này" });
        }

        const insert = "INSERT INTO ChiTietMon (MaMon, KichCo, Gia, TrangThai) VALUES (?, ?, ?, ?)";
        const [result] = await pool.query(insert, [
            MaMon,
            KichCo,
            Gia,
            TrangThai || 'Còn bán'
        ]);

        res.status(201).json({
            message: "Thêm chi tiết món thành công",
            MaCTM: result.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi thêm chi tiết món" });
    }
}

export const updateChiTietMon = async (req, res) => {
    try {
        const { MaCTM } = req.params;
        const{ Gia, TrangThai } = req.body;
        if(!Gia){
            return res.status(400).json({ message: "Giá không được để trống"});
        }
        const update ="UPDATE ChiTietMon SET Gia = ?, TrangThai = ? WHERE MaCTM = ?";
        const [result] =await pool.query(update, [
            Gia,
            TrangThai || 'Còn bán',
            MaCTM
        ]);

        if(result.affectedRows === 0){
            return res.status(404).json({ message: "Không tìm thấy chi tiết món" });
        }

        res.json({ message: "Cập nhật chi tiết món thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi cập nhật chi tiết món" });
    }
}

export const deleteChiTietMon =async (req, res)=>{
    try {
        const {MaCTM} =req.params;

        //kiem tra chi tiet mon co trong don hang hay khong
        const [orders] =await pool.query(
            "SELECT COUNT(*) as count FROM ChiTietDonHang WHERE MaCTM = ?",
            [MaCTM]
        );

        if(orders[0].count > 0){
            return res.status(400).json({
                message: "Không thể xóa chi tiết món này vì đã có trong các đơn hàng" 
            });
        }
        const [hoadon] =await pool.query(
            "SELECT COUNT(*) as count FROM ChiTietHoaDon WHERE MaCTM = ?",
            [MaCTM]
        );

        if(hoadon[0].count >0){
            return res.status(400).json({
                message: "Không thể xóa chi tiết món này vì đã có trong các hóa đơn"
            });
        }
        const [result] = await pool.query("DELETE FROM ChiTietMon WHERE MaCTM = ?", [MaCTM]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy chi tiết món" });
        }
        
        res.json({ message: "Xóa chi tiết món thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi xóa chi tiết món" });
    }
}