# =====================================================================
# SCRIPT BUILD VÀ DEPLOY NEXT.JS FULLSTACK LÊN VPS EC2
# NGUYÊN TẮC: BUILD 100% TẠI LOCAL, VPS CHỈ LOAD VÀ CHẠY IMAGE (KHÔNG BUILD TRÊN VPS)
# =====================================================================
$ErrorActionPreference = "Stop"

$ROOT_DIR = Split-Path -Parent $PSScriptRoot
Set-Location $ROOT_DIR

$EC2_IP = "13.212.39.124"
$PEM_KEY = Join-Path $ROOT_DIR "ubuntu02.pem"
$IMAGE_NAME = "ielts-vocab-app:latest"
$ARCHIVE_NAME = "ielts-vocab-app.tar.gz"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ">>> 1. Building Next.js Docker Image LOCALLY (Linux/amd64)..." -ForegroundColor Cyan
Write-Host ">>> (Khong build tren VPS de tranh tran RAM/OOM crash Ubuntu)" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
docker build --platform linux/amd64 -t $IMAGE_NAME .

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ">>> 2. Compressing Docker image to $ARCHIVE_NAME..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
docker save $IMAGE_NAME -o ielts-vocab-app.tar
tar -czf $ARCHIVE_NAME ielts-vocab-app.tar
Remove-Item -Force ielts-vocab-app.tar

$fileSizeMb = [math]::Round((Get-Item $ARCHIVE_NAME).Length / 1MB, 2)
Write-Host ">>> Compressed image size: ${fileSizeMb} MB" -ForegroundColor Green

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ">>> 3. Transferring image to VPS ($EC2_IP)..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
scp -i $PEM_KEY -o StrictHostKeyChecking=no $ARCHIVE_NAME ubuntu@${EC2_IP}:/home/ubuntu/
Remove-Item -Force $ARCHIVE_NAME

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ">>> 4. Deploying Next.js container on VPS..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
$remoteCommands = @"
  echo '>>> 1. Backing up SQLite database on VPS...'
  cp /home/ubuntu/ielts-data/vocab.db /home/ubuntu/ielts-data/vocab_backup_`$(date +%Y%m%d_%H%M%S).db 2>/dev/null || true

  echo '>>> 2. Unpacking and loading Docker image...'
  tar -xzf /home/ubuntu/$ARCHIVE_NAME -O | docker load
  rm -f /home/ubuntu/$ARCHIVE_NAME

  echo '>>> 3. Stopping previous container...'
  docker stop ielts-vocab 2>/dev/null || true
  docker rm ielts-vocab 2>/dev/null || true

  echo '>>> 4. Launching Next.js container (1:N Hierarchical Architecture)...'
  docker run -d --name ielts-vocab -p 127.0.0.1:5000:80 -v /home/ubuntu/ielts-data:/data --restart always $IMAGE_NAME

  echo '>>> 5. Cleaning up dangling images...'
  docker image prune -f

  echo '>>> Container status:'
  sleep 3
  docker ps
"@

ssh -i $PEM_KEY -o StrictHostKeyChecking=no ubuntu@${EC2_IP} $remoteCommands

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ">>> 5. Verifying live web service and API on VPS..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
ssh -i $PEM_KEY -o StrictHostKeyChecking=no ubuntu@${EC2_IP} "curl -k -I https://127.0.0.1 -H 'Host: vocalnq.duckdns.org'"
ssh -i $PEM_KEY -o StrictHostKeyChecking=no ubuntu@${EC2_IP} "curl -s http://127.0.0.1:5000/api/words | head -c 200"

Write-Host "`n>>> DEPLOYMENT SUCCESSFUL! Next.js is live at: https://vocalnq.duckdns.org" -ForegroundColor Green
