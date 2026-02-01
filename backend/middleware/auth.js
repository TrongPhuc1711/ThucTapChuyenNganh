import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Không tìm thấy token." });
        }
        jwt.verify(token, process.env.JWT_SECRET || 'p_coffee', (err, decoded) => {
            if (err) return res.status(403).json({ success: false, message: "Token lỗi." });
            req.user = decoded;
            next();
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server auth" });
    }
};

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: 'Chưa login' });

        // Xử lý chuỗi
        const rawRole = req.user.VaiTro || req.user.vaiTro || '';
        const userRole = String(rawRole).trim();

        // LOG CHI TIẾT ĐỂ DEBUG (Xem kỹ terminal sau khi chạy cái này)
        console.log("---------------- DEBUG AUTH ----------------");
        console.log(`1. User Role (Raw):   '${rawRole}'`);
        console.log(`2. User Role (Clean): '${userRole}' (Độ dài: ${userRole.length})`);
        
        // Flatten mảng roles phòng trường hợp truyền nhầm [['Admin', 'NhanVien']]
        const allowedRoles = roles.flat(); 
        console.log(`3. Danh sách cho phép: ${JSON.stringify(allowedRoles)}`);

        const isAllowed = allowedRoles.includes(userRole);
        console.log(`4. Kết quả kiểm tra:   ${isAllowed ? "✅ CHO PHÉP" : "❌ TỪ CHỐI"}`);
        console.log("--------------------------------------------");

        if (!isAllowed) {
            return res.status(403).json({ 
                success: false,
                message: `Bạn không có quyền. Bạn là: '${userRole}'. Yêu cầu: ${allowedRoles.join(', ')}` 
            });
        }
        next();
    };
};

export const authorizeOwnerOrRoles = (...roles) => {
    return (req, res, next) => {
        // 1. Kiểm tra đăng nhập
        if (!req.user) return res.status(401).json({ message: 'Chưa login' });

        const userRole = String(req.user.VaiTro || '').trim();
        const userId = req.user.MaND;             // ID lấy từ Token (người đang đăng nhập)
        const targetId = parseInt(req.params.id); // ID lấy từ Link API (người cần sửa)

        // 2. LOG DEBUG (Để kiểm tra nếu lỗi)
        console.log("--- CHECK CHÍNH CHỦ ---");
        console.log(`User đang login: ID=${userId}, Role=${userRole}`);
        console.log(`Đang muốn sửa ID: ${targetId}`);

        // 3. Kiểm tra: Nếu là Admin hoặc Nhân viên (trong danh sách roles) -> CHO PHÉP
        const allowedRoles = roles.flat();
        if (allowedRoles.includes(userRole)) {
            console.log("✅ Cho phép (Do là QTV/NV)");
            return next();
        }

        // 4. Kiểm tra: Nếu ID trùng nhau (Chính chủ) -> CHO PHÉP
        if (userId === targetId) {
            console.log("✅ Cho phép (Do là chính chủ)");
            return next();
        }
        // 5. Nếu không thỏa mãn cả 2 -> CHẶN
        console.log("Từ chối");
        return res.status(403).json({ 
            message: "Bạn không có quyền sửa thông tin người khác!" 
        });
    };
};