import pool from '../config/db.js';
import bcrypt from 'bcryptjs'
export const register = async (req, res) => {
    try {
        const { HoTen, Email, MatKhau } = req.body;
        const [users] = await pool.query("SELECT * FROM NguoiDung WHERE Email = ?", [Email]);

        if (users.length > 0) {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }

        
        const salt = await bcrypt.genSalt(10);
        const hashedMatKhau = await bcrypt.hash(MatKhau, salt);

        const insert = "INSERT INTO NguoiDung (HoTen, Email, MatKhau, VaiTro) VALUES (?, ?, ?, 'KhachHang')";
        await pool.query(insert, [HoTen, Email, hashedMatKhau]);
        
        res.status(201).json({ message: "✅ Đăng ký thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};

export const login = async (req, res) => {
     try {
        const { Email, MatKhau } = req.body;
        const [users] = await pool.query("SELECT * FROM NguoiDung WHERE Email = ?", [Email]);

        if (users.length === 0) {
          console.log("Email nhận được:", Email);
          console.log("Mật khẩu nhận được:", MatKhau);
          console.log("Người dùng tìm thấy:", users);
          return res.status(401).json({ message: "Sai email hoặc mật khẩu" });

        }

        const user = users[0];
        const isMatch = await bcrypt.compare(MatKhau, user.MatKhau);

        if (!isMatch) {
            return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
        }
        
        res.json({
            message: "✅ Đăng nhập thành công",
            user: { MaND: user.MaND, HoTen: user.HoTen, Email: user.Email, VaiTro: user.VaiTro },
        });
    } catch (err) {
        console.error(err);
        console.error('Lỗi đăng nhập:', err);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};