import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER, 
    pass: process.env.MAIL_PASS, 
  },
});

export const sendEmailOTP = async (toEmail, otpCode) => {
  try {
    const mailOptions = {
      from: `"P_Coffee Support" <${process.env.MAIL_USER}>`,
      to: toEmail,
      subject: "Mã xác thực đổi mật khẩu - P_Coffee",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #6d4c41;">Xin chào,</h2>
          <p>Bạn vừa yêu cầu đặt lại mật khẩu tại P_Coffee.</p>
          <p>Mã xác thực (OTP) của bạn là:</p>
          <h1 style="color: #d35400; letter-spacing: 5px;">${otpCode}</h1>
          <p>Mã này sẽ hết hạn sau 5 phút.</p>
          <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
          <hr>
          <small>P_Coffee</small>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅Đã gửi OTP đến ${toEmail}`);
    return true;
  } catch (error) {
    console.error("❌Lỗi gửi email:", error);
    return false;
  }
};