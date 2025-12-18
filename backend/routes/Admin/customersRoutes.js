import express from "express";
import {
    getAllKhachHang,
    getKhachHangById,
    createKhachHang,
    updateKhachHang,
    deleteKhachHang    
} from "../../controllers/Admin/customersController.js";
import { authenticateToken, authorizeRoles } from "../../middleware/auth.js";

const router = express.Router();
const adminOnly = [authenticateToken, authorizeRoles('Admin')];

router.get('/',adminOnly, getAllKhachHang);    //Lay tat ca cac khach hang
router.get('/:id',adminOnly, getKhachHangById);             // Lấy theo ma khach hang
router.post('/',adminOnly, createKhachHang);                // Thêm
router.put('/:id',adminOnly, updateKhachHang);              // Sửa
router.delete('/:id',adminOnly, deleteKhachHang);           // xóa

export default router;