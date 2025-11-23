import express from "express";
import {
    getAllOders,
    getOrderByMa,
    createOrders,
    updateOrders,
    deleteOrders
} from "../../controllers/Admin/ordersController.js";

const router = express.Router();

router.get("/", getAllOders);
router.get("/:ma",getOrderByMa);
router.post("/",createOrders);
router.put("/:ma",updateOrders);
router.delete("/:ma",deleteOrders);

export default router;