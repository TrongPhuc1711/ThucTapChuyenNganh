import express from "express";
import { hoaDonController } from "../../controllers/Admin/hoadonControlers.js";
import { authenticateToken, authorizeRoles } from "../../middleware/auth.js";
const router =express.Router();
const adminOnly = [authenticateToken, authorizeRoles('Admin')];
const staffAndAdmin = [authenticateToken,authorizeRoles('Admin','NhanVien')];
router.get("/", staffAndAdmin, hoaDonController.getAll);
router.get("/:id", staffAndAdmin, hoaDonController.getById);
router.post("/", adminOnly, hoaDonController.create);
router.put("/:id", adminOnly, hoaDonController.update);
router.post("/:id", adminOnly, hoaDonController.delete);

export default router;