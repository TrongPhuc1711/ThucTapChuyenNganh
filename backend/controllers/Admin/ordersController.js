import pool from "../../config/db.js";

//Lấy danh sách đơn hàng
 export const getAllOders= async (req,res)=>{
    try {
        const [row]= await pool.execute(`
                SELECT dh.*, nd.HoTen AS TenNguoiDat
                FROM DonHang dh
                JOIN NguoiDung nd ON dh.MaND = nd.MaND
                ORDER BY dh.MaDH DESC
            `)
            res.json(row);
    } catch (err) {
        console.error("Lỗi lấy đơn hàng: ",err);
        res.status(500).json({message: "Lỗi server"});
    }
 }

 //Lấy đơn hàng theo mã
export const getOrderByMa = async (req,res) =>{
    try {
        const {ma} =req.params;
        const {row}= await pool.executeƠ(
                "SELECT * FROM DonHang WHERE MaDH= ?", [ma]
            );
        if (row.length === 0){
            return res.status(404).json({message: "Không tìm thấy đơn hàng"});
        }
        res.json(row[0]);
    } catch (err) {
        console.error("Lỗi lấy đơn hàng: ",err);
        res.status(500).json({message: "Lỗi server"});
    }
}

export const createOrders =async (req,res) =>{
    try {
        const{
            MaND,
            TenNguoiNhan,
            SDTNguoiNhan,
            DiaChiGiaoHang,
            PhuongThucThanhToan,
            TongTien = 0} =req.body;
            if(!MaND || !TenNguoiNhan || !SDTNguoiNhan){
                return res.status(400).json({message: "Thiếu thông tin người nhận hoặc mã người dùng"});
            }
            const [kq] = await pool.execute(
                `INSERT INTO DonHang (MaND, TenNguoiNhan, SDTNguoiNhan, DiaChiGiaoHang, PhuongThucThanhToan, TongTien) 
                VALUES (?, ?, ?, ?, ?, ?)`,
            [
                MaND,
                TenNguoiNhan,
                SDTNguoiNhan,
                DiaChiGiaoHang || null,
                PhuongThucThanhToan || null,
                TongTien,
            ]);
            res.json({message: "Tạo đơn hàng thành công", MaDH: kq.insertId});
    } catch (err) {
        console.error("Lỗi tạo đơn hàng: ",err);
        res.status(500).json({message: "Lỗi server"});
    }
}
//Cập nhật đơn hàng
export const updateOrders =async (req,res)=>{
    try {
        const{ ma}= req.params;
        const{
            TrangThai,
            TenNguoiNhan,
            SDTNguoiNhan,
            DiaChiGiaoHang,
            PhuongThucThanhToan
        } = req.body;
        const{kq}=await pool.execute(
            `UPDATE DonHang SET TrangThai = ?,
                                TenNguoiNhan = ?
                                SDTNguoiNhan = ?
                                DiaChiGiaoHang = ?
                                PhuongThucThanhToan = ?
            WHERE MaDH = ? `,
            [TrangThai,TenNguoiNhan,SDTNguoiNhan,DiaChiGiaoHang,PhuongThucThanhToan,ma]
        );
        res.json({ message: "Cập nhật đơn hàng thành công" });
    } catch (err) {
        console.error("Lỗi cập nhật đơn hàng: ",err);
        res.status(500).json({message: "Lỗi server"});
    }
}
//Xóa đơn hàng
export const deleteOrders = async (req, res) =>{
    try {
        const {ma} = req.params;
    
        await pool.execute("DELETE FROM DonHang WHERE MaDH = ?", [ma]);
    
        res.json({ message: "Xóa đơn hàng thành công" });
      } catch (err) {
        console.error("Lỗi xoá đơn hàng:", err);
        res.status(500).json({ message: "Lỗi server" });
      }
}