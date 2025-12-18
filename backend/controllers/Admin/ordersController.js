import pool from "../../config/db.js";

//Lấy danh sách đơn hàng
 export const getAllOrdrers= async (req,res)=>{
    try {
        const [row]= await pool.execute(`
                SELECT dh.*, nd.HoTen AS TenNguoiDat
                FROM DonHang dh
                JOIN NguoiDung nd ON dh.MaND = nd.MaND
                ORDER BY dh.NgayDat DESC
            `);
            res.json(row);
    } catch (err) {
        console.error("Lỗi lấy đơn hàng: ",err);
        res.status(500).json({message: "Lỗi server"});
    }
 }

 //Lấy đơn hàng theo mã
export const getOrderByMa = async (req,res) =>{
    try {
        const { ma } =req.params;
        const [ row ]= await pool.execute(
                `SELECT dh.*, nd.HoTen AS TenNguoiDat
                FROM DonHang dh JOIN NguoiDung nd ON dh.MaND = nd.MaND
                WHERE dh.MaDH= ?`, [ma]
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

export const getOrdersByUser = async (req , res) => {
    try {
        const {mand} = req.params;
        const [row] = await pool.execute(
            "SELECT * FROM DonHang WHERE MaND = ? ORDER BY NgayDat DESC",
            [mand]
        );
        res.json(row);
    } catch (err) {
        console.error("Lỗi lấy đơn hàng theo người dùng: ",err);
        res.status(500).json({message: "Lỗi server"});
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
export const createOrders =async (req,res) =>{
    const connection =await pool.getConnection();
    try {
        const{
            MaND,
            TenNguoiNhan,
            SDTNguoiNhan,
            DiaChiGiaoHang,
            PhuongThucThanhToan,
            DanhSachMon
            } =req.body;
            if(!MaND || !TenNguoiNhan || !SDTNguoiNhan || !DiaChiGiaoHang || !PhuongThucThanhToan){
                return res.status(400).json({message: "Thiếu thông tin bắt buộc"});
            }

            if (!DanhSachMon || DanhSachMon.length === 0) {
                return res.status(400).json({ message: "Đơn hàng phải có ít nhất 1 món" });
            }

            await connection.beginTransaction();

            let tongTien=0;
            for(const mon of DanhSachMon){
                tongTien += mon.DonGia * mon.SoLuong;
            }
            //tạo đơn hàng
            const [kq] = await connection.execute(
                `INSERT INTO DonHang (MaND, TenNguoiNhan, SDTNguoiNhan, DiaChiGiaoHang, PhuongThucThanhToan, TongTien, TrangThai) 
                VALUES (?, ?, ?, ?, ?, ?, 'Treo')`,
            [
                MaND,
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

            res.status(201).json({message: "Tạo đơn hàng thành công", MaDH: MaDH});
    } catch (err) {
        await connection.rollback();
        console.error("Lỗi tạo đơn hàng: ",err);
        res.status(500).json({message: "Lỗi server" + err.message });
    }
    finally{
        connection.release();
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
        //Kiểm tra đơn hàng có tồn tại
        const [tontai] = await pool.query("SELECT * FROM DonHang WHERE MaDH = ?", [ma]);
        if (tontai.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }
        const userRole = req.user.VaiTro || req.user.VaiTro;
        if(userRole === 'NhanVien'){
            if (!TrangThai) {
                return res.status(400).json({ 
                    message: "Nhân viên chỉ được cập nhật trạng thái đơn hàng" 
                });
            }
            // Kiểm tra nếu có trường khác được gửi lên
            if (TenNguoiNhan || SDTNguoiNhan || DiaChiGiaoHang || PhuongThucThanhToan) {
                return res.status(403).json({ 
                    message: "Nhân viên không có quyền cập nhật thông tin người nhận" 
                });
            }
            // Chỉ cập nhật trạng thái
            await pool.execute("UPDATE DonHang SET TrangThai = ? WHERE MaDH = ?",
                [TrangThai,ma]
            );
            return res.json({ message: "Cập nhật trạng thái đơn hàng thành công", TrangThai: TrangThai });
        }

        // Nếu là ADMIN - cập nhật tất cả
        const updateFields = [];
        const updateValues = [];

        if (TrangThai !== undefined) {
            updateFields.push("TrangThai = ?");
            updateValues.push(TrangThai);
        }
        if (TenNguoiNhan !== undefined) {
            updateFields.push("TenNguoiNhan = ?");
            updateValues.push(TenNguoiNhan);
        }
        if (SDTNguoiNhan !== undefined) {
            updateFields.push("SDTNguoiNhan = ?");
            updateValues.push(SDTNguoiNhan);
        }
        if (DiaChiGiaoHang !== undefined) {
            updateFields.push("DiaChiGiaoHang = ?");
            updateValues.push(DiaChiGiaoHang);
        }
        if (PhuongThucThanhToan !== undefined) {
            updateFields.push("PhuongThucThanhToan = ?");
            updateValues.push(PhuongThucThanhToan);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: "Không có thông tin để cập nhật" });
        }

        updateValues.push(ma);

        await pool.execute(
            `UPDATE DonHang SET ${updateFields.join(', ')} WHERE MaDH = ?`,
            updateValues
        );
        res.json({ message: "Cập nhật đơn hàng thành công" });
    } catch (err) {
        console.error("Lỗi cập nhật đơn hàng: ",err);
        res.status(500).json({message: "Lỗi server"});
    }
}
//Xóa đơn hàng
export const deleteOrders = async (req, res) =>{
    const connection= await pool.getConnection();
    try {
        const {ma} = req.params;
    
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
        
        if(kq.affectedRows === 0){
            await connection.rollback();
            return res.status(404).json({message: "Không tìm thấy đơn hàng"});
        }
        await connection.commit();
        res.json({ message: "Xóa đơn hàng thành công" });
      } catch (err) {
        console.error("Lỗi xoá đơn hàng:", err);
        res.status(500).json({ message: "Lỗi server" });
      }finally{
        connection.release();
      }
}