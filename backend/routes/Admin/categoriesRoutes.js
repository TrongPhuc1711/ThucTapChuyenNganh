import express from "express";
import { authenticateToken, authorizeRoles } from "../../middleware/auth.js";
import { 
    getAllLoaiMon, 
    getLoaiMonById, 
    createLoaiMon, 
    updateLoaiMon, 
    deleteLoaiMon 
} from "../../controllers/Admin/categoriesController.js";

const router = express.Router();
const adminOnly = [authenticateToken, authorizeRoles('Admin')];

router.get("/", getAllLoaiMon);
router.get("/:id", getLoaiMonById);
//chi admin
router.post("/",adminOnly, createLoaiMon);
router.put("/:id",adminOnly, updateLoaiMon);
router.delete("/:id",adminOnly, deleteLoaiMon);

export default router;