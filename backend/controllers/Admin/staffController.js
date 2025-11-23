import pool from "../../config/db.js";
import bcrypt from "bcryptjs";

export const getAllNhanVien = async (req,res) => {
    try {
        const [row] = await pool.query(
            "SELECT * FROM NguoiDung WHERE VaiTro IN ('NhanVien', 'Admin')"
        );
        res.json(row);
    } catch (err) {
        console.error(err);
        res.status(500).json({message : "Lỗi server"})
    }
};

//Thêm nhân viên mới
export const createNV = async(req,res) => {
    const {HoTen, Email, MatKhau, VaiTro}= req.body;
    if(!HoTen || !Email || !MatKhau ||!VaiTro){
        return res.status(400).json({message: "Thiếu dữ liệu yêu cầu"});
    }
    try {
        const mahoa= await bcrypt.genSalt(10);
        const maHoaMK= await bcrypt.hash(MatKhau,mahoa);// mã hóa
        await pool.query(
            "INSERT INTO NguoiDung (HoTen, Email, MatKhau, VaiTro) VALUES (?, ?, ?, ?)",
            [HoTen, Email, maHoaMK, VaiTro] //lưu mật khẩu đã mã hóa
        );
        res.json({message: "Thêm nhân viên thành công"});
    } catch (err) {
        console.error(err);
        if(err.code === "ER_DUP_ENTRY"){
            return res.status(400).json({message: "Email đã tồn tại"});
        }
        res.status(500).json({message: "Lỗi server"});
    }
};

//Cập nhật nhân viên
export const updateNV = async (req,res) => {
    const {ma} =req.params;
    const {HoTen, Email, MatKhau, VaiTro} =req.body;

    // Thêm validation (giống hàm create)
    if (!HoTen || !Email || !VaiTro) {
        return res.status(400).json({ message: "Thiếu Họ Tên, Email hoặc Vai Trò" });
    }
    try {
        if(MatKhau){
            const mahoa= await bcrypt.genSalt(10);
            const maHoaMK= await bcrypt.hash(MatKhau,mahoa);// mã hóa
            
            await pool.query(
                "UPDATE NguoiDung SET HoTen=?, Email=?, MatKhau=?, VaiTro=? WHERE MaND=? ",
                [HoTen, Email, maHoaMK, VaiTro, ma]
            );
        }
        else{
            await pool.query(
                "UPDATE NguoiDung SET HoTen=?, Email=?, VaiTro=? WHERE MaND=? ",
                [HoTen, Email, VaiTro, ma]
            );
        }
        res.json({ message: "Cập nhật nhân viên thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Lỗi server"});
    }
};

//Xóa nhân viên
export const deleteNV =async (req,res) => {
    const {ma} = req.params;
    try {
        await pool.query(
            "DELETE FROM NguoiDung WHERE MaND=?", [ma]
        );
        res.json({message: "Đã xóa nhân viên thành công"});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Lỗi server"});
    }
};