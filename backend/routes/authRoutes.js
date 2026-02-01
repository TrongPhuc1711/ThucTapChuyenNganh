import express from "express";
import { register, login, changePassword } from "../controllers/Auth/authController.js";
import { authenticateToken } from "../middleware/auth.js";
import { forgotPasswordOTP, resetPasswordOTP } from "../controllers/Auth/authController.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put('/change-password',authenticateToken,changePassword);
// Route gửi OTP (Không cần login vẫn gọi được)
router.post('/forgot-password-otp', forgotPasswordOTP);

// Route xác nhận OTP và đổi pass
router.post('/reset-password-otp', resetPasswordOTP);
export default router;
