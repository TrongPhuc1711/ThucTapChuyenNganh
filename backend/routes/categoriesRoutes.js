import express from "express";
import { 
    getAllLoaiMon, 
    getLoaiMonById, 
    createLoaiMon, 
    updateLoaiMon, 
    deleteLoaiMon 
} from "../controllers/categoriesController.js";

const router = express.Router();

router.get("/", getAllLoaiMon);
router.get("/:id", getLoaiMonById);
router.post("/", createLoaiMon);
router.put("/:id", updateLoaiMon);
router.delete("/:id", deleteLoaiMon);

export default router;