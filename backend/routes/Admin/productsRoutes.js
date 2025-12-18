import express from "express";
import { getAllMon,getMonById,  createMon, updateMon,deleteMon  } 
from "../../controllers/Admin/productsController.js";
import upload from "../../middleware/uploadMidleware.js";
import { authenticateToken, authorizeRoles } from "../../middleware/auth.js";

const router=express.Router();
const adminOnly = [authenticateToken, authorizeRoles('Admin')];

router.get("/", getAllMon);
router.get("/:id", getMonById);
router.delete("/:id",adminOnly, deleteMon);

//khi mà post dùng middware 'upload.single('HinhAnh')'
// hình phải khớp với tên filed mà frontend gửi tới
router.post("/", adminOnly, upload.single('HinhAnh'), createMon);

router.put("/:id",adminOnly, upload.single('HinhAnh'), updateMon);

export default router;