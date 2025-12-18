import express from "express";

import {
    getAllNhanVien,
    createNV,
    updateNV,
    deleteNV
} from "../../controllers/Admin/staffController.js";
import { authenticateToken, authorizeRoles } from "../../middleware/auth.js";
const routes = express.Router();
const adminOnly = [authenticateToken, authorizeRoles('Admin')];

routes.get("/",adminOnly,getAllNhanVien); //Lấy danh sách nhân viên
routes.post("/",adminOnly,createNV); //Thêm nhân viên
routes.put("/:ma",adminOnly,updateNV);//Cập nhật nhân viên
routes.delete("/:ma",adminOnly,deleteNV);//Xóa nhân viên

export default routes;