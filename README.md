# P-Coffee - Hệ thống quản lý quán cà phê

## Cài đặt và Chạy Local

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deploy Production

### Bước 1: Build Frontend
```bash
cd frontend
npm install
npm run build
```
Lệnh này sẽ tạo thư mục `frontend/dist` chứa các file đã được build.

### Bước 2: Cấu hình Backend
Backend đã được cấu hình để tự động serve các file static từ `frontend/dist`.

### Bước 3: Chạy Production
```bash
cd backend
npm install
npm start
```

Server sẽ chạy trên port được chỉ định trong biến môi trường `PORT` (mặc định là 4000).

### Biến môi trường (Tùy chọn)
Nếu frontend và backend chạy trên các domain khác nhau, tạo file `.env` trong thư mục `frontend`:
```
VITE_API_URL=http://your-backend-domain.com
```

Nếu cùng domain, không cần set biến này (sẽ dùng relative path).

## Lưu ý khi Deploy

1. **Đảm bảo build frontend trước khi deploy**: Chạy `npm run build` trong thư mục `frontend` để tạo thư mục `dist`.

2. **Cấu hình database**: Đảm bảo file `backend/config/db.js` được cấu hình đúng với database production.

3. **Uploads folder**: Thư mục `backend/uploads` sẽ được serve tại `/uploads`.

4. **React Router**: Tất cả các routes (ngoại trừ `/api/*` và `/uploads/*`) sẽ được xử lý bởi React Router để hỗ trợ client-side routing.

5. **CORS**: Backend đã được cấu hình CORS để nhận requests từ frontend.

## Cấu trúc Project

- `backend/`: Node.js/Express backend API
- `frontend/`: React frontend application
- `frontend/dist/`: Build output của frontend (được tạo sau khi chạy `npm run build`)
