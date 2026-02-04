import express from 'express';
import cors from 'cors';
import authRouters from './routes/authRoutes.js';
import loaiMonRoutes from './routes/Admin/categoriesRoutes.js';
import monRoutes from './routes/Admin/productsRoutes.js';
import chiTietProductsRoutes from './routes/Admin/chiTietProductsRoutes.js';
import staffRoutes from './routes/Admin/staffRoutes.js';
import customerRoutes from './routes/Admin/customersRoutes.js';
import orderRoutes from './routes/Admin/ordersRoutes.js';
import hoadonRoutes from './routes/Admin/hoadonRoutes.js';
import thongKeRoutes from './routes/Admin/thongKeRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';


const app = express();
const port = process.env.PORT||4000;

// middleware
app.use(cors());//Nhận yêu cầu từ frontend
app.use(express.json()); // Giúp server đọc được { Email, MatKhau } từ req.body

//route
app.use('/api/auth',authRouters)
app.use('/api/loaimon', loaiMonRoutes);
app.use('/api/mon', monRoutes);
app.use('/api/chitietmon', chiTietProductsRoutes);
app.use('/api/nhanvien',staffRoutes);
app.use('/api/khachhang',customerRoutes);
app.use('/api/donhang', orderRoutes);
app.use('/api/hoadon',hoadonRoutes);
app.use('/api/thongke',thongKeRoutes);
app.use('/api/paymentVnPay',paymentRoutes)
// Lấy đường dẫn thư mục hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Bất kỳ tệp nào trong 'uploads/' giờ đây có thể được truy cập qua '/uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api', (req, res) => {
    res.json({ message: 'Chào mừng đến với P-Coffee API!' });
});


//Khởi động server  
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});