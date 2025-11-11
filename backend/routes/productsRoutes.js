import express from "express";
import { getAllMon,getMonById,  createMon, updateMon,deleteMon  } 
from "../controllers/productsController.js";
import upload from "../middleware/uploadMidleware.js";

const router=express.Router();

router.get("/", getAllMon);
router.get("/", getMonById);
router.delete("/:id",deleteMon);

//khi mà post dùng middwảe 'upload.single('HinhAnh')'
// hình phải khớp với tên filed mà frontend gửi tới
router.post("/", upload.single('HinhAnh'), createMon);

router.put("/:id", upload.single('HinhAnh'), updateMon);

export default router;