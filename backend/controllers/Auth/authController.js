import pool from '../../config/db.js';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
export const register = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { HoTen, Email, MatKhau , DiaChi, SDT} = req.body;
        if (!HoTen || !Email || !MatKhau) {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
        }
        if(MatKhau.length < 6){
            return res.status(400).json({message: "Mật khẩu có ít nhất 6 ký tự"});
        }
        const [users] = await connection.query("SELECT * FROM NguoiDung WHERE Email = ?", [Email]);

        if (users.length > 0) {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }

        await connection.beginTransaction();
        //mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedMatKhau = await bcrypt.hash(MatKhau, salt);

        //thêm người dùng mới
        const them = "INSERT INTO NguoiDung (HoTen, Email, MatKhau, VaiTro) VALUES (?, ?, ?, 'KhachHang')";
        const [kq] = await connection.query(them, [HoTen, Email, hashedMatKhau]);
        
        const MaND =kq.insertId;

        //them vao bang khach hang
        await connection.query(
            "INSERT INTO KhachHang (MaND, DiaChi, SDT) VALUES (?, ?, ?)",
            [MaND, DiaChi || null, SDT || null]
        );
        await connection.commit();
        const token =jwt.sign(
            {
                maND: MaND,
                email: Email,
                vaitro: 'KhachHang',
                hoTen: HoTen
            },
            process.env.JWT_SECRET || 'p_coffee',
            { expiresIn: '7d'}
        );
        res.status(201).json({ 
            message: "Đăng ký thành công", 
            token: token,
            user :{
                MaND : MaND,
                HoTen: HoTen,
                Email: Email,
                VaiTro: 'KhachHang'
            } 
        });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }finally {
        connection.release();
    }
};

export const login = async (req, res) => {
     try {
        const { Email, MatKhau } = req.body;
        if (!Email || !MatKhau) {
            return res.status(400).json({ message: "Vui lòng điền email và mật khẩu" });
        }
        const [users] = await pool.query("SELECT * FROM NguoiDung WHERE Email = ?", [Email]);

        if (users.length === 0) {
          console.log("Email nhận được:", Email);
          console.log("Mật khẩu nhận được:", MatKhau);
          console.log("Người dùng tìm thấy:", users);
          return res.status(401).json({ message: "Sai email hoặc mật khẩu" });

        }

        const user = users[0];
        //so sánh mật khẩu
        const isMatch = await bcrypt.compare(MatKhau, user.MatKhau);

        if (!isMatch) {
            return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
        }

        const token =jwt.sign(
            {
                MaND: user.MaND,
                Email: user.Email,
                VaiTro: user.VaiTro,
                HoTen: user.HoTen
            },
            process.env.JWT_SECRET || 'p_coffee',
            { expiresIn: '7d'}
        );
        
        res.json({
            message: "✅Đăng nhập thành công",
            token: token,
            user: { MaND: user.MaND, HoTen: user.HoTen, Email: user.Email, VaiTro: user.VaiTro },
        });
    } catch (err) {
        console.error(err);
        console.error('Lỗi đăng nhập:', err);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};