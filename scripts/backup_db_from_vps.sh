#!/usr/bin/env bash
# =====================================================================
# SCRIPT BACKUP DATABASE SQLITE TU VPS VE MAY LOCAL (BASH / SH)
# =====================================================================
set -e

# Xác định thư mục gốc dự án
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

EC2_IP="13.212.39.124"
SSH_USER="ubuntu"
PEM_KEY="${ROOT_DIR}/ubuntu02.pem"
REMOTE_DATA_DIR="/home/ubuntu/ielts-data"
BACKUP_DIR="${ROOT_DIR}/backups"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/vocab_${TIMESTAMP}.db"
LATEST_FILE="${BACKUP_DIR}/vocab_latest.db"

echo "=========================================================="
echo ">>> KHỞI ĐỘNG SAO LƯU DATABASE TỪ VPS (${EC2_IP})"
echo "=========================================================="

if [ ! -f "${PEM_KEY}" ]; then
  echo "[-] Lỗi: Không tìm thấy SSH key tại ${PEM_KEY}"
  exit 1
fi

mkdir -p "${BACKUP_DIR}"

echo ">>> [1/3] Tạo bản snapshot an toàn (checkpoint WAL) trên VPS..."
ssh -i "${PEM_KEY}" -o StrictHostKeyChecking=no "${SSH_USER}@${EC2_IP}" '
  if docker ps | grep -q ielts-vocab; then
    docker exec ielts-vocab node -e "require(\"better-sqlite3\")(\"/data/vocab.db\").backup(\"/data/sync_ready.db\")"
  else
    cp /home/ubuntu/ielts-data/vocab.db /home/ubuntu/ielts-data/sync_ready.db
  fi
'

echo ">>> [2/3] Đang tải snapshot database về máy local..."
scp -i "${PEM_KEY}" -o StrictHostKeyChecking=no "${SSH_USER}@${EC2_IP}:${REMOTE_DATA_DIR}/sync_ready.db" "${BACKUP_FILE}"

echo ">>> [3/3] Dọn dẹp file snapshot tạm thời trên VPS..."
ssh -i "${PEM_KEY}" -o StrictHostKeyChecking=no "${SSH_USER}@${EC2_IP}" "rm -f ${REMOTE_DATA_DIR}/sync_ready.db"

# Cập nhật file latest
cp "${BACKUP_FILE}" "${LATEST_FILE}"

FILE_SIZE=$(ls -lh "${BACKUP_FILE}" | awk '{print $5}')
echo "=========================================================="
echo ">>> SAO LƯU THÀNH CÔNG!"
echo ">>> File lưu trữ: ${BACKUP_FILE} (${FILE_SIZE})"
echo ">>> File mới nhất: ${LATEST_FILE}"
echo "=========================================================="
