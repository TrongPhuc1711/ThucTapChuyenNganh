import express from "express";

import {
    getAllNhanVien,
    createNV,
    updateNV,
    deleteNV
} from "../../controllers/Admin/staffController.js";

const routes = express.Router();

routes.get("/",getAllNhanVien); //Lấy danh sách nhân viên
routes.post("/",createNV); //Thêm nhân viên
routes.put("/:ma",updateNV);//Cập nhật nhân viên
routes.delete("/:ma",deleteNV);//Xóa nhân viên

export default routes;