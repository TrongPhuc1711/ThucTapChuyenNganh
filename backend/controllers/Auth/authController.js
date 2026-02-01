import pool from '../../config/db.js';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import { sendEmailOTP } from '../../services/emailService.js';
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
                MaND: MaND,
                Email: Email,
                VaiTro: 'KhachHang',
                HoTen: HoTen
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
        const query = `
            SELECT nd.*, kh.DiaChi, kh.SDT 
            FROM NguoiDung nd 
            LEFT JOIN KhachHang kh ON nd.MaND = kh.MaND 
            WHERE nd.Email = ?
        `;
        const [users] = await pool.query(query,[Email]);

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
            user: { MaND: user.MaND, HoTen: user.HoTen, Email: user.Email, VaiTro: user.VaiTro, DiaChi: user.DiaChi, SDT: user.SDT },
        });
    } catch (err) {
        console.error(err);
        console.error('Lỗi đăng nhập:', err);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { MaND, MatKhauCu, MatKhauMoi } = req.body;

        // 1. Kiểm tra dữ liệu đầu vào
        if (!MaND || !MatKhauCu || !MatKhauMoi) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
        }

        if (MatKhauMoi.length < 6) {
            return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
        }

        // 2. Lấy thông tin người dùng từ DB
        const [users] = await pool.query("SELECT * FROM NguoiDung WHERE MaND = ?", [MaND]);
        if (users.length === 0) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }
        const user = users[0];

        // 3. Kiểm tra mật khẩu cũ có đúng không
        const isMatch = await bcrypt.compare(MatKhauCu, user.MatKhau);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
        }

        // 4. Mã hóa mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(MatKhauMoi, salt);

        // 5. Cập nhật mật khẩu mới vào Cơ sở dữ liệu
        await pool.query("UPDATE NguoiDung SET MatKhau = ? WHERE MaND = ?", [hashedNewPassword, MaND]);

        res.status(200).json({ message: "Đổi mật khẩu thành công" });

    } catch (error) {
        console.error("Lỗi đổi mật khẩu:", error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};

// --- HÀM 1: GỬI OTP (Quên mật khẩu) ---
export const forgotPasswordOTP = async (req, res) => {
    try {
        const { email } = req.body;
        
        // 1. Kiểm tra email có tồn tại không
        const [users] = await pool.query("SELECT * FROM NguoiDung WHERE Email = ?", [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: "Email không tồn tại trong hệ thống" });
        }
        
        // 2. Tạo mã OTP ngẫu nhiên (6 số)
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // 3. Tạo thời gian hết hạn (ví dụ: 5 phút sau)
        const expireTime = new Date(Date.now() + 5 * 60000); // Hiện tại + 5 phút

        // 4. Lưu OTP vào Database
        await pool.query(
            "UPDATE NguoiDung SET OtpCode = ?, OtpExpires = ? WHERE Email = ?", 
            [otpCode, expireTime, email]
        );

        // 5. Gửi Email thật
        //const emailSent = await sendEmailOTP(email, otpCode);
        //tự gửi mail của mình để test
        const emailSent = await sendEmailOTP(process.env.MAIL_USER, otpCode);
        if (emailSent) {
            res.status(200).json({ message: "Mã OTP đã được gửi qua Email" });
        } else {
            res.status(500).json({ message: "Lỗi khi gửi email, vui lòng thử lại sau" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// --- XÁC NHẬN OTP VÀ ĐỔI PASS (Reset Password) ---
export const resetPasswordOTP = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // 1. Lấy thông tin User kèm OTP
        const [users] = await pool.query("SELECT * FROM NguoiDung WHERE Email = ?", [email]);
        if (users.length === 0) return res.status(404).json({ message: "User không tồn tại" });
        
        const user = users[0];

        // 2. Kiểm tra OTP
        if (user.OtpCode !== otp) {
            return res.status(400).json({ message: "Mã OTP không chính xác" });
        }

        // 3. Kiểm tra Hết hạn
        if (new Date() > new Date(user.OtpExpires)) {
            return res.status(400).json({ message: "Mã OTP đã hết hạn" });
        }

        // 4. Đổi mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(newPassword, salt);

        // 5. Cập nhật mật khẩu và XÓA OTP cũ đi (để không dùng lại được)
        await pool.query(
            "UPDATE NguoiDung SET MatKhau = ?, OtpCode = NULL, OtpExpires = NULL WHERE Email = ?", 
            [hashedPass, email]
        );

        res.status(200).json({ message: "Đặt lại mật khẩu thành công!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};