import express from 'express';
import {
    createPaymentUrl,
    vnpayReturn
} from "../controllers/paymentController.js";

const router = express.Router();


router.post('/create-payment-url', createPaymentUrl); // API tạo link thanh toán
router.get('/vnpay-return', vnpayReturn);             // API nhận kết quả trả về từ VNPay

export default router; // 3. Export router để server.js dùng được