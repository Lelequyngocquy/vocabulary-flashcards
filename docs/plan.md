# PLAN: TRIỂN KHAI IELTS VOCABULARY APP LÊN AWS EC2 & CẤU HÌNH DUCKDNS

## 1. Mục tiêu
Thiết lập và đưa ứng dụng Web học từ vựng IELTS (tệp `index.html` đơn lẻ) lên máy ảo AWS EC2 thông qua Docker container (Nginx Alpine), mở cổng firewall và tự động hóa cập nhật tên miền miễn phí DuckDNS để có thể truy cập mượt mà trên điện thoại.

---

## 2. Thông tin đầu vào cần thu thập
Agent cần kiểm tra hoặc yêu cầu người dùng cung cấp các thông tin sau:
- **SSH Key & IP của EC2:** File `.pem` / `.key` và `EC2_PUBLIC_IP` (hoặc cấu hình sẵn trong SSH config).
- **DuckDNS Subdomain:** Tên miền phụ (ví dụ: `ielts-vocab.duckdns.org`).
- **DuckDNS Token:** Mã token bí mật từ bảng điều khiển `duckdns.org`.

---

## 3. Các giai đoạn thực thi (Execution Phases)

### Giai đoạn 1: Chuẩn bị Source Code và Dockerfile
- [ ] **Tạo cấu trúc thư mục dự án:**
  ```bash
  mkdir -p ielts-app
  cd ielts-app
  ```
- [ ] **Lưu mã nguồn ứng dụng:** Đảm bảo tệp `index.html` chứa toàn bộ giao diện Tailwind, logic Flashcard, Quiz, Text-to-Speech và dữ liệu `database.json` nhúng sẵn.
- [ ] **Tạo Dockerfile tối ưu (Nginx Alpine):**
  ```dockerfile
  FROM nginx:alpine
  COPY index.html /usr/share/nginx/html/index.html
  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]
  ```

---

### Giai đoạn 2: Đóng gói và Khởi chạy trên VPS EC2
*(Agent có thể build trực tiếp trên EC2 hoặc build local rồi transfer sang EC2)*

- [ ] **Kết nối SSH vào EC2 và cài đặt Docker (nếu chưa có):**
  ```bash
  sudo apt-get update
  sudo apt-get install -y docker.io
  sudo systemctl enable --now docker
  sudo usermod -aG docker $USER
  ```
- [ ] **Đồng bộ mã nguồn lên EC2:**
  ```bash
  rsync -avz -e "ssh -i /path/to/key.pem" ./ielts-app/ ubuntu@<EC2_IP>:~/ielts-app/
  ```
- [ ] **Build Image & Run Container:**
  ```bash
  cd ~/ielts-app
  sudo docker build -t ielts-vocab-app .
  # Dọn dẹp container cũ nếu có
  sudo docker stop ielts-vocab || true && sudo docker rm ielts-vocab || true
  # Khởi chạy container nền
  sudo docker run -d --name ielts-vocab -p 80:80 --restart always ielts-vocab-app
  ```

---

### Giai đoạn 3: Cấu hình Inbound Rules (AWS Security Group)
- [ ] **Hướng dẫn hoặc dùng AWS CLI mở cổng HTTP (80):**
  - Nếu Agent có quyền AWS CLI:
    ```bash
    aws ec2 authorize-security-group-ingress \
      --group-id <SECURITY_GROUP_ID> \
      --protocol tcp \
      --port 80 \
      --cidr 0.0.0.0/0
    ```
  - Nếu thao tác thủ công: Nhắc người dùng vào AWS Console -> EC2 -> Security Groups -> Edit Inbound Rules -> Thêm `HTTP` cổng `80` cho nguồn `0.0.0.0/0`.

---

### Giai đoạn 4: Thiết lập Dynamic DNS với DuckDNS
- [ ] **Tạo script cập nhật IP tự động trên EC2:**
  ```bash
  mkdir -p ~/duckdns
  cat << 'EOF' > ~/duckdns/duck.sh
  echo url="https://www.duckdns.org/update?domains=${DUCKDNS_DOMAIN}&token=${DUCKDNS_TOKEN}&ip=" | curl -k -o ~/duckdns/duck.log -K -
  EOF
  chmod 700 ~/duckdns/duck.sh
  ```
- [ ] **Kích hoạt Cron Job cập nhật định kỳ (mỗi 10 phút):**
  ```bash
  (crontab -l 2>/dev/null; echo "*/10 * * * * ~/duckdns/duck.sh >/dev/null 2>&1") | crontab -
  ```
- [ ] **Kiểm tra chạy thử lần đầu:**
  ```bash
  ~/duckdns/duck.sh
  cat ~/duckdns/duck.log # Kết quả phải trả về "OK"
  ```

---

### Giai đoạn 5: Kiểm tra và Nghiệm thu
- [ ] **Curl kiểm tra phản hồi HTTP:**
  ```bash
  curl -I http://<DUCKDNS_DOMAIN>.duckdns.org
  ```
- [ ] **Kiểm tra trên Mobile:** Mở trình duyệt điện thoại truy cập domain, kiểm tra tính năng lật thẻ, âm thanh đọc từ, trắc nghiệm và bộ lọc Units.