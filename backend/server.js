import express from 'express';
import cors from 'cors';
import authRouters from './routes/authRoutes.js';
import loaiMonRoutes from './routes/categoriesRoutes.js'
import monRoutes from './routes/productsRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 4000;

// middleware
app.use(cors());//Nhận yêu cầu từ frontend
app.use(express.json()); // Giúp server đọc được { Email, MatKhau } từ req.body

//route
app.use('/api/auth',authRouters)
app.use('/api/loaimon', loaiMonRoutes);
app.use('/api/mon', monRoutes);

// Lấy đường dẫn thư mục hiện tại (cần thiết cho ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//Bất kỳ tệp nào trong 'uploads/' giờ đây có thể được truy cập qua '/uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api', (req, res) => {
    res.json({ message: 'Chào mừng đến với P-Coffee API!' });
});

//Khởi động server
app.listen(port, () => {
    console.log(`Backend server đang chạy tại http://localhost:${port}`);
});