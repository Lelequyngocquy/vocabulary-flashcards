# Script tự động build và deploy lên VPS EC2
$ErrorActionPreference = "Stop"

Write-Host ">>> 1. Building index.html from database.json..." -ForegroundColor Cyan
python build_index.py

$EC2_IP = "13.212.39.124"
$PEM_KEY = "ubuntu02.pem"

Write-Host ">>> 2. Transferring files to VPS ($EC2_IP)..." -ForegroundColor Cyan
scp -i $PEM_KEY -o StrictHostKeyChecking=no ielts-app/index.html ubuntu@${EC2_IP}:/home/ubuntu/ielts-app/

Write-Host ">>> 3. Rebuilding Docker container on VPS..." -ForegroundColor Cyan
ssh -i $PEM_KEY -o StrictHostKeyChecking=no ubuntu@${EC2_IP} "cd /home/ubuntu/ielts-app && docker build -t ielts-vocab-app . && docker stop ielts-vocab && docker rm ielts-vocab && docker run -d --name ielts-vocab -p 127.0.0.1:5000:80 -v /home/ubuntu/ielts-data:/data --restart always ielts-vocab-app"

Write-Host ">>> 4. Verifying web service..." -ForegroundColor Cyan
ssh -i $PEM_KEY -o StrictHostKeyChecking=no ubuntu@${EC2_IP} "docker ps; curl -k -I https://127.0.0.1 -H 'Host: vocalnq.duckdns.org'"

Write-Host ">>> DEPLOYMENT SUCCESSFUL! https://vocalnq.duckdns.org is live." -ForegroundColor Green
