import express from "express";
import {
    getChiTietMonByMaMon,
    getChiTietMonByMa,
    createChiTietMon,
    updateChiTietMon,
    deleteChiTietMon
} from '../../controllers/Admin/chiTietProductsController.js';

const router = express.Router();

router.get('/mon/:mamon', getChiTietMonByMaMon);    //Lay theo mon
router.get('/:mactm', getChiTietMonByMa);             // Lấy theo ma
router.post('/', createChiTietMon);                // Thêm
router.put('/:mactm', updateChiTietMon);              // Sửa
router.delete('/:mactm', deleteChiTietMon);

export default router;