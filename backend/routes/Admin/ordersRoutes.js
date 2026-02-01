import express from "express";
import {
    getAllOrders,
    getOrderByMa,
    getOrdersByUser,
    getChiTietDonHang,
    createOrders,
    updateOrders,
    deleteOrders
} from "../../controllers/Admin/ordersController.js";
import { authenticateToken, authorizeRoles } from "../../middleware/auth.js";
const router = express.Router();
const adminOnly = [authenticateToken, authorizeRoles('Admin')];
const staffAndAdmin = [authenticateToken, authorizeRoles('Admin', 'NhanVien')];

// Xem danh sách đơn hàng
router.get("/", getAllOrders);

router.get("/chitiet/:madh",  getChiTietDonHang);
router.get("/user/:mand",  getOrdersByUser);

// Route động phải đặt CUỐI CÙNG
router.get("/:ma",  getOrderByMa);

// CHO PHÉP CẢ NHÂN VIÊN VÀ ADMIN TẠO ĐỠN HÀNG
router.post("/", createOrders);

// Nhân viên và Admin được cập nhật trạng thái đơn hàng
router.put("/:ma",staffAndAdmin,  updateOrders);

// Chỉ Admin mới được xóa
router.delete("/:ma", adminOnly, deleteOrders);

export default router;