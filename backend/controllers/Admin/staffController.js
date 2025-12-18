import pool from "../../config/db.js";
import bcrypt from "bcryptjs";

export const getAllNhanVien = async (req, res) => {
    try {
        const [nhanvien] = await pool.query(
            `SELECT nv.MaND, nd.HoTen, nd.Email, nd.VaiTro, nd.NgayTao, nv.NgayVaoLam
             FROM NhanVien nv
             JOIN NguoiDung nd ON nv.MaND = nd.MaND`
        );
        res.json(nhanvien);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi lấy danh sách nhân viên" })
    }
};
//Lấy nhân viên theo ID
export const getNhanVienById = async (req, res) => {
    try {
        const { id } = req.params;
        const [nhanviens] = await pool.query(
            `SELECT nv.MaNV, nv.MaND, nd.HoTen, nd.Email, nd.VaiTro, nv.NgayVaoLam
             FROM NhanVien nv
             JOIN NguoiDung nd ON nv.MaND = nd.MaND
             WHERE nv.MaND = ?`,
            [id]
        );
        if (nhanviens.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy nhân viên" });
        }
        res.json(nhanviens[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi lấy thông tin nhân viên" });
    }
}
//Thêm nhân viên mới
export const createNV = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { HoTen, Email, MatKhau, VaiTro, NgayVaoLam } = req.body;
        if (!HoTen || !Email || !MatKhau || !VaiTro) {
            return res.status(400).json({ message: "Thiếu dữ liệu yêu cầu" });
        }

        // Kiểm tra VaiTro hợp lệ
        const validRoles = ['NhanVien', 'Admin'];
        if (!validRoles.includes(VaiTro)) {
            return res.status(400).json({ message: "Vai trò không hợp lệ" });
        }
        await connection.beginTransaction();

        const mahoa = await bcrypt.genSalt(10);
        const maHoaMK = await bcrypt.hash(MatKhau, mahoa);// mã hóa
        const [kqNguoiDung] = await pool.query(
            "INSERT INTO NguoiDung (HoTen, Email, MatKhau, VaiTro) VALUES (?, ?, ?, ?)",
            [HoTen, Email, maHoaMK, VaiTro] //lưu mật khẩu đã mã hóa
        );
        const MaND = kqNguoiDung.insertId;

        await connection.query(
            "INSERT INTO NhanVien (MaND, NgayVaoLam) VALUES (?, ?)",
            [MaND, NgayVaoLam || new Date()]
        );
        await connection.commit();
        res.status(201).json({
            message: "Thêm nhân viên thành công",
            MaND: MaND
        });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }
        res.status(500).json({ message: "Lỗi khi thêm nhân viên" });
    } finally {
        connection.release();
    }
};

//Cập nhật nhân viên
export const updateNV = async (req, res) => {
    const { ma } = req.params;
    const { HoTen, Email, MatKhau, VaiTro, NgayVaoLam } = req.body;

    // Kiểm tra VaiTro hợp lệ
    const validRoles = ['NhanVien', 'Admin'];
    if (VaiTro && !validRoles.includes(VaiTro)) {
        return res.status(400).json({ message: "Vai trò không hợp lệ" });
    }

    try {
        if (HoTen || Email || MatKhau || VaiTro) {
            const updates = [];
            const values = [];

            if (HoTen) {
                updates.push("HoTen = ?");
                values.push(HoTen);
            }
            if (Email) {
                updates.push("Email = ?");
                values.push(Email);
            }
            if (MatKhau) {
                const mahoa = await bcrypt.genSalt(10);
                const maHoaMK = await bcrypt.hash(MatKhau, mahoa);// mã hóa
                updates.push("MatKhau = ?");
                values.push(maHoaMK);
            }
            if (VaiTro) {
                updates.push("VaiTro = ?");
                values.push(VaiTro);
            }
            values.push(ma);
            if (updates.length > 0) {
                await pool.query(
                    `UPDATE NguoiDung SET ${updates.join(', ')} WHERE MaND=? `,
                    values
                );
            }
        }

        // Cập nhật nhanvien
        if (NgayVaoLam) {
            await pool.query(
                "UPDATE NhanVien SET NgayVaoLam = ? WHERE MaND = ?",
                [NgayVaoLam, ma]
            );
        }

        res.json({ message: "Cập nhật nhân viên thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi cập nhật nhân viên" });
    }
};

//Xóa nhân viên
export const deleteNV = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { ma } = req.params;
        await connection.beginTransaction();
        //xoa bang nhan vien truoc
        const[kq] =await connection.execute(
            "DELETE FROM NhanVien WHERE MaND = ?",
            [ma]
        );
        if (kq.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Không tìm thấy nhân viên (MaNV)" });
        }
        //xoa bang nguoi dung
        await connection.query(
            "DELETE FROM NguoiDung WHERE MaND = ?", [ma]
        );

        await connection.commit();
        res.json({ message: "Đã xóa nhân viên thành công" });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: "Lỗi server" });
    } finally {
        connection.release();
    }
};