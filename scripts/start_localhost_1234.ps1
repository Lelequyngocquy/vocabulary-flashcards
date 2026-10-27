# =====================================================================
# SCRIPT KHỞI CHẠY DỰ ÁN NEXT.JS TẠI http://localhost:1234
# =====================================================================
Param(
  [ValidateSet("dev", "prod")]
  [string]$Mode = "dev"
)

$ROOT_DIR = Split-Path -Parent $PSScriptRoot
Set-Location $ROOT_DIR

$PORT = 1234
$URL = "http://localhost:$PORT"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ">>> KHỞI ĐỘNG VOLTVOCAB TẠI $URL" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Kiểm tra cơ sở dữ liệu SQLite
if (!(Test-Path "vocab.db")) {
  Write-Host ">>> Chưa tìm thấy vocab.db. Đang tự động nạp từ vựng vào SQLite..." -ForegroundColor Yellow
  node scripts/seed.js
} else {
  Write-Host ">>> SQLite database đã sẵn sàng (vocab.db)." -ForegroundColor DarkGray
}

# 2. Tự động mở trình duyệt sau 2 giây
Start-Job -ScriptBlock {
  param($targetUrl)
  Start-Sleep -Seconds 2
  Start-Process $targetUrl
} -ArgumentList $URL | Out-Null

# 3. Khởi chạy Next.js theo chế độ
$env:PORT = $PORT

if ($Mode -eq "prod") {
  Write-Host ">>> Chạy chế độ PRODUCTION tại $URL..." -ForegroundColor Cyan
  if (!(Test-Path ".next/standalone/server.js")) {
    Write-Host ">>> Đang build ứng dụng..." -ForegroundColor Yellow
    npm run build
  }
  node .next/standalone/server.js
} else {
  Write-Host ">>> Chạy chế độ DEVELOPMENT (Hot Reload) tại $URL..." -ForegroundColor Cyan
  Write-Host ">>> Nhấn Ctrl + C để dừng server.`n" -ForegroundColor DarkGray
  npx next dev -p $PORT
}
