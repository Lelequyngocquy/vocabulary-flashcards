# =====================================================================
# SCRIPT BUILD VÀ DEPLOY NEXT.JS FULLSTACK LÊN VPS EC2
# =====================================================================
$ErrorActionPreference = "Stop"

$EC2_IP = "13.212.39.124"
$PEM_KEY = "ubuntu02.pem"
$IMAGE_NAME = "ielts-vocab-app:latest"
$ARCHIVE_NAME = "ielts-vocab-app.tar.gz"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ">>> 1. Building Next.js Docker Image (Linux/amd64)..." -ForegroundColor Cyan
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
  echo '>>> Unpacking and loading image...'
  tar -xzf /home/ubuntu/$ARCHIVE_NAME -O | docker load
  rm -f /home/ubuntu/$ARCHIVE_NAME

  echo '>>> Stopping old container...'
  docker stop ielts-vocab 2>/dev/null || true
  docker rm ielts-vocab 2>/dev/null || true

  echo '>>> Launching Next.js container...'
  docker run -d --name ielts-vocab -p 127.0.0.1:5000:80 -v /home/ubuntu/ielts-data:/data --restart always $IMAGE_NAME

  echo '>>> Cleaning up dangling images...'
  docker image prune -f

  echo '>>> Container status:'
  sleep 2
  docker ps
"@

ssh -i $PEM_KEY -o StrictHostKeyChecking=no ubuntu@${EC2_IP} $remoteCommands

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ">>> 5. Verifying live web service..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
ssh -i $PEM_KEY -o StrictHostKeyChecking=no ubuntu@${EC2_IP} "curl -k -I https://127.0.0.1 -H 'Host: vocalnq.duckdns.org'"

Write-Host "`n>>> DEPLOYMENT SUCCESSFUL! Next.js is live at: https://vocalnq.duckdns.org" -ForegroundColor Green
