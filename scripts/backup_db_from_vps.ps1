# =====================================================================
# SCRIPT BACKUP DATABASE SQLITE TU VPS VE MAY LOCAL (POWERSHELL)
# =====================================================================
$ErrorActionPreference = "Stop"

$ROOT_DIR = Split-Path -Parent $PSScriptRoot
Set-Location $ROOT_DIR

$EC2_IP = "13.212.39.124"
$SSH_USER = "ubuntu"
$PEM_KEY = Join-Path $ROOT_DIR "ubuntu02.pem"
$REMOTE_DATA_DIR = "/home/ubuntu/ielts-data"
$BACKUP_DIR = Join-Path $ROOT_DIR "backups"

$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = Join-Path $BACKUP_DIR "vocab_$TIMESTAMP.db"
$LATEST_FILE = Join-Path $BACKUP_DIR "vocab_latest.db"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ">>> STARTING SQLITE DATABASE BACKUP FROM VPS ($EC2_IP)" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

if (!(Test-Path $PEM_KEY)) {
  Write-Error "[-] Error: SSH key not found at $PEM_KEY"
  exit 1
}

if (!(Test-Path $BACKUP_DIR)) {
  New-Item -ItemType Directory -Force -Path $BACKUP_DIR | Out-Null
}

Write-Host ">>> [1/3] Creating safe snapshot on VPS (WAL Checkpoint)..." -ForegroundColor Cyan
$remoteCmd = 'if docker ps | grep -q ielts-vocab; then docker exec ielts-vocab node -e ''require("better-sqlite3")("/data/vocab.db").backup("/data/sync_ready.db")''; else cp /home/ubuntu/ielts-data/vocab.db /home/ubuntu/ielts-data/sync_ready.db; fi'
$bytes = [System.Text.Encoding]::UTF8.GetBytes($remoteCmd)
$b64 = [Convert]::ToBase64String($bytes)
ssh -i $PEM_KEY -o StrictHostKeyChecking=no "${SSH_USER}@${EC2_IP}" "echo $b64 | base64 -d | bash"

Write-Host ">>> [2/3] Downloading snapshot to local machine..." -ForegroundColor Cyan
scp -i $PEM_KEY -o StrictHostKeyChecking=no "${SSH_USER}@${EC2_IP}:${REMOTE_DATA_DIR}/sync_ready.db" $BACKUP_FILE

Write-Host ">>> [3/3] Cleaning up temporary snapshot on VPS..." -ForegroundColor Cyan
ssh -i $PEM_KEY -o StrictHostKeyChecking=no "${SSH_USER}@${EC2_IP}" "rm -f ${REMOTE_DATA_DIR}/sync_ready.db"

Copy-Item $BACKUP_FILE $LATEST_FILE -Force

$size = [math]::Round((Get-Item $BACKUP_FILE).Length / 1KB, 2)
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ">>> BACKUP COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host ">>> Archive file: $BACKUP_FILE ($size KB)" -ForegroundColor Cyan
Write-Host ">>> Latest copy:  $LATEST_FILE" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
