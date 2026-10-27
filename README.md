# IELTS Vocab Mastery (VoltVocab v2.4)

Ứng dụng học từ vựng IELTS phong cách kỹ thuật cao Voltagent Dark Theme, được xây dựng dưới dạng **Fullstack Next.js** (cả Frontend và Backend trong 1 dự án) tích hợp cơ sở dữ liệu **SQLite** và triển khai tối ưu bằng **Docker**.

---

## 🚀 Tính năng nổi bật

1. **Kiến trúc Fullstack Next.js**:
   - Backend Route Handlers (`/api/words`, `/api/auth/*`, `/api/progress`).
   - Server-Side Rendering (SSR) tải trực tiếp từ vựng từ SQLite với độ trễ 0ms.
2. **Cơ sở dữ liệu SQLite**:
   - Quản lý toàn bộ 1,265 từ vựng IELTS (`words`).
   - Quản lý tài khoản người dùng (`users`) với mã hóa mật khẩu Scrypt an toàn.
   - Đồng bộ tiến độ học tập (`progress`) theo thời gian thực giữa các thiết bị.
3. **Frontend & Trải nghiệm học tập**:
   - **Flashcards**: Lật thẻ 3D, cử chỉ vuốt Touch Swipe, phím tắt (Space, Mũi tên, S, M), phát âm câu ví dụ và copy.
   - **Quiz Engine**: Kiểm tra 4 lựa chọn (EN ➔ VI, VI ➔ EN, Mix), tính điểm streak và hiệu ứng Confetti.
   - **Dictionary**: Tìm kiếm từ vựng tức thời, lọc từ loại (noun, verb, adj, adv), lọc trạng thái Mastered/Learning.
   - **Metrics**: Thống kê tiến độ theo 20 Units, tùy chỉnh tốc độ giọng đọc Speech Velocity.
   - **Web Audio API**: Hiệu ứng âm thanh tổng hợp trực tiếp từ trình duyệt (tap, flip, chime, error) không cần tệp âm thanh ngoài.

---

## 🛠️ Lệnh làm việc cục bộ (Local Development)

```bash
# Cài đặt thư viện
npm install

# Nạp dữ liệu 1,265 từ vựng vào SQLite
npm run seed

# Chạy môi trường phát triển (Dev Server)
npm run dev
# Truy cập: http://localhost:3000

# Kiểm tra biên dịch (Build)
npm run build
```

---

## 🚢 Quy trình Deploy an toàn lên VPS (Tránh Crash Ubuntu)

> [!IMPORTANT]
> **Quy tắc quan trọng**: VPS EC2 có tài nguyên RAM hạn chế (~900 MB). Việc chạy `npm run build` hoặc biên dịch trên VPS có thể gây tràn RAM dẫn đến **Kernel OOM Crash** hoặc treo máy ảo.
> 
> Vì vậy, quy trình triển khai được thiết kế: **Build 100% tại máy Local -> Nén image -> Đẩy sang VPS -> VPS chỉ Load & Run runtime**.

### Lệnh Deploy một chạm:

```powershell
npm run deploy
# hoặc
.\update_vps.ps1
```

### Chi tiết các bước tự động trong script:
1. **Local Build**: Docker tại máy local đóng gói image chuẩn `linux/amd64` với Next.js Standalone.
2. **Nén siêu nhẹ**: Image được nén thành file `.tar.gz` chỉ còn ~87 MB.
3. **Chuyển giao**: SCP file nén sang VPS EC2 (thời gian ~7 giây).
4. **Nạp & Chạy**: VPS chỉ thực hiện `docker load` và `docker run` (không biên dịch, runtime chỉ tốn ~120 MB RAM).
5. **Kiểm tra**: Kiểm tra phản hồi HTTP 200 trực tiếp từ domain `https://vocalnq.duckdns.org`.
