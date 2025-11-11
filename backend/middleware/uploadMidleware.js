import multer from 'multer';
import path from 'path';

// Thiết lập nơi lưu trữ tệp (storage)
const storage = multer.diskStorage({
  // Đặt thư mục đích
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Lưu vào thư mục 'backend/uploads/'
  },
  // Đặt tên tệp
  filename: (req, file, cb) => {
    // Tạo tên tệp duy nhất: tenGoc-timestamp.duoiTep
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Kiểm tra loại tệp (chỉ chấp nhận ảnh)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận tệp hình ảnh!'), false);
  }
};

// Khởi tạo multer
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // Giới hạn 5MB
});

export default upload;