import express from "express";
import {
    getAllKhachHang,
    getKhachHangById,
    createKhachHang,
    updateKhachHang,
    deleteKhachHang    
} from "../../controllers/Admin/customersController.js";
import { authenticateToken, authorizeOwnerOrRoles, authorizeRoles } from "../../middleware/auth.js";

const router = express.Router();
const adminOnly = [authenticateToken, authorizeRoles('Admin')];
const staffAndAdmin = [authenticateToken, authorizeRoles('Admin','NhanVien')];
router.get('/',staffAndAdmin, getAllKhachHang);    //Lay tat ca cac khach hang
router.get('/:id',staffAndAdmin, getKhachHangById);             // Lấy theo ma khach hang
router.post('/',staffAndAdmin, createKhachHang);                // Thêm
router.put('/:id',authenticateToken,authorizeOwnerOrRoles('Admin','NhanVien'), updateKhachHang);              // Sửa
router.delete('/:id',adminOnly, deleteKhachHang);           // xóa

export default router;