# IELTS Vocab Mastery (VoltVocab v2.4)

Ứng dụng học từ vựng IELTS phong cách kỹ thuật cao Voltagent Dark Theme, được xây dựng dưới dạng **Fullstack Next.js** (cả Frontend và Backend trong 1 dự án) tích hợp cơ sở dữ liệu **SQLite** cục bộ.

---

## 🚀 Tính năng nổi bật

1. **Kiến trúc Fullstack Next.js**:
   - Backend Route Handlers (`/api/words`, `/api/auth/*`, `/api/progress`).
   - Server-Side Rendering (SSR) tải trực tiếp từ vựng từ SQLite với độ trễ 0ms.
2. **Cơ sở dữ liệu SQLite**:
   - Quản lý toàn bộ 1,265 từ vựng IELTS (`words`) với khóa chính tự tăng `id`.
   - Quản lý tài khoản người dùng (`users`) với mã hóa mật khẩu Scrypt an toàn.
   - Đồng bộ tiến độ học tập (`progress`) theo thời gian thực.
3. **Frontend & Trải nghiệm học tập**:
   - **Flashcards**: Lật thẻ 3D, cử chỉ vuốt Touch Swipe, phím tắt (Mũi tên xuống `↓` để lật, Trái/Phải để chuyển từ), phát âm và sao chép ví dụ.
   - **Quiz Engine**: Kiểm tra 4 lựa chọn (EN ➔ VI, VI ➔ EN, Mix), tính điểm streak và hiệu ứng Confetti.
   - **Dictionary**: Tìm kiếm từ vựng tức thời, lọc từ loại (noun, verb, adj, adv), lọc trạng thái Mastered/Learning.
   - **Metrics**: Thống kê tiến độ theo 20 Units, tùy chỉnh tốc độ giọng đọc Speech Velocity.
   - **Web Audio API**: Hiệu ứng âm thanh tổng hợp trực tiếp từ trình duyệt (tap, flip, chime, error) không cần tệp âm thanh ngoài.

---

## 🛠️ Hướng dẫn cài đặt & Chạy Local

### 1. Cài đặt thư viện:
```bash
npm install
```

### 2. Nạp dữ liệu từ vựng vào SQLite:
```bash
npm run seed
```

### 3. Khởi chạy ứng dụng:

#### Cách 1: Khởi chạy nhanh tại http://localhost:1234 (Khuyên dùng)
```bash
npm run local
```
Hoặc chạy trực tiếp script:
- **Windows (CMD / Click đúp chuột)**: `.\scripts\start_localhost_1234.bat`
- **PowerShell**: `.\scripts\start_localhost_1234.ps1`

#### Cách 2: Khởi chạy môi trường phát triển mặc định (Port 3000)
```bash
npm run dev
# Mở trình duyệt tại: http://localhost:3000
```

#### Cách 3: Biên dịch và chạy chế độ Production
```bash
# Biên dịch ứng dụng
npm run build

# Chạy bản production
npm run start
```

---

## 📁 Cấu trúc thư mục dự án

```text
├── docs/                 # Tài liệu thiết kế và kiến trúc dự án
│   ├── DESIGN-voltagent.md
│   └── plan.md
├── scripts/              # Các script hỗ trợ vận hành local
│   ├── seed.js                  # Script nạp dữ liệu vào SQLite
│   ├── words.sql                # Dữ liệu từ vựng thuần SQL (1,265 từ)
│   ├── start_localhost_1234.bat # Script chạy nhanh localhost:1234 (CMD)
│   └── start_localhost_1234.ps1 # Script chạy nhanh localhost:1234 (PowerShell)
├── src/                  # Mã nguồn ứng dụng Next.js Fullstack
│   ├── app/              # Next.js App Router & API Route Handlers
│   ├── components/       # Các React components giao diện
│   ├── lib/              # Tiện ích SQLite database, auth JWT, Web Audio
│   └── types/            # TypeScript type definitions
├── public/               # Tệp tĩnh công khai
├── vocab.db              # Database SQLite cục bộ (git ignored)
└── package.json          # Danh sách dependencies và npm scripts
```
