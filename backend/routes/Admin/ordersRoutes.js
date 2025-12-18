import express from "express";
import {
    getAllOrdrers,
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
const staffAndAdmin =[authenticateToken, authorizeRoles('Admin', 'NhanVien')];

// Xem danh sách: Có thể để Admin hoặc NhanVien
router.get("/", getAllOrdrers);
router.get("/user/:mand", staffAndAdmin, getOrdersByUser);
router.get("/chitiet/:madh",staffAndAdmin,getChiTietDonHang);
// Xem chi tiết đơn
router.get("/:ma", staffAndAdmin, getOrderByMa);
//Nhan vien duoc cap nhat trang thai don hang
router.put("/:ma",staffAndAdmin,updateOrders);
//Admin xử lý
router.post("/",adminOnly,createOrders);
router.delete("/:ma",adminOnly,deleteOrders);

export default router;