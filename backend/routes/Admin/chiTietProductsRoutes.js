import express from "express";
import {
    getChiTietMonByMaMon,
    getChiTietMonByMa,
    createChiTietMon,
    updateChiTietMon,
    deleteChiTietMon
} from '../../controllers/Admin/chiTietProductsController.js';
import { authenticateToken, authorizeRoles } from "../../middleware/auth.js";

const router = express.Router();
const adminOnly = [authenticateToken, authorizeRoles('Admin')];

router.get('/mon/:mamon', getChiTietMonByMaMon);    //Lay theo mon
router.get('/:mactm', getChiTietMonByMa);             // Lấy theo ma

router.post('/',adminOnly, createChiTietMon);                // Thêm
router.put('/:mactm',adminOnly, updateChiTietMon);              // Sửa
router.delete('/:mactm',adminOnly, deleteChiTietMon);

export default router;