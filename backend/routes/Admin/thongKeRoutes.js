import express from "express";

import {
    getDoanhThuTheoNgay,
    getDoanhThuTheoThang,
    getDoanhThuTheoNam
} from "../../controllers/Admin/thongKeController.js";
import { authenticateToken, authorizeRoles } from "../../middleware/auth.js";
const router= express.Router();
const adminOnly = [authenticateToken, authorizeRoles('Admin')];

router.get("/ngay",adminOnly,getDoanhThuTheoNgay);
router.get("/thang",adminOnly,getDoanhThuTheoThang);
router.get("/nam",adminOnly,getDoanhThuTheoNam);

export default router;