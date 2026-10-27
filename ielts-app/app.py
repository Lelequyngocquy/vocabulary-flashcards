import os
import sqlite3
import json
import datetime
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
import jwt

# Configuration
DB_PATH = os.environ.get("DB_PATH", "/data/vocab.db" if os.path.exists("/data") else "vocab.db")
JWT_SECRET = os.environ.get("JWT_SECRET", "ielts-vocab-mastery-secret-2026-key")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 60

app = Flask(__name__, static_folder=".")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    db_dir = os.path.dirname(DB_PATH)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
        
    with get_db() as conn:
        cursor = conn.cursor()
        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        # Progress table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS progress (
                user_id INTEGER PRIMARY KEY,
                current_unit TEXT DEFAULT 'Unit 1: Growing Up',
                current_index INTEGER DEFAULT 0,
                learned_words TEXT DEFAULT '[]',
                quiz_stats TEXT DEFAULT '{}',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        conn.commit()

# Run DB init on startup
init_db()

# JWT Token Helpers
def create_token(user_id, username):
    payload = {
        "user_id": user_id,
        "username": username,
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=JWT_EXPIRATION_DAYS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"success": False, "error": "Chưa đăng nhập hoặc token không hợp lệ"}), 401
        
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = payload.get("user_id")
            username = payload.get("username")
            return f(user_id, username, *args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "error": "Phiên đăng nhập đã hết hạn"}), 401
        except Exception:
            return jsonify({"success": False, "error": "Token không hợp lệ"}), 401
            
    return decorated

# ----------------- AUTH APIS -----------------

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()

    if len(username) < 3 or len(username) > 30:
        return jsonify({"success": False, "error": "Tên đăng nhập phải từ 3 đến 30 ký tự."}), 400
    if len(password) < 6:
        return jsonify({"success": False, "error": "Mật khẩu phải có ít nhất 6 ký tự."}), 400

    hashed_pw = generate_password_hash(password)

    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", (username, hashed_pw))
            user_id = cursor.lastrowid
            # Init progress
            cursor.execute("INSERT INTO progress (user_id, current_unit, current_index, learned_words) VALUES (?, 'Unit 1: Growing Up', 0, '[]')", (user_id,))
            conn.commit()

        token = create_token(user_id, username)
        return jsonify({
            "success": True,
            "token": token,
            "username": username,
            "progress": {
                "current_unit": "Unit 1: Growing Up",
                "current_index": 0,
                "learned_words": []
            }
        })
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "error": "Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác."}), 400
    except Exception as e:
        return jsonify({"success": False, "error": f"Lỗi hệ thống: {str(e)}"}), 500

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()

    if not username or not password:
        return jsonify({"success": False, "error": "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu."}), 400

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, password_hash FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()

        if not user or not check_password_hash(user["password_hash"], password):
            return jsonify({"success": False, "error": "Sai tên đăng nhập hoặc mật khẩu."}), 401

        user_id = user["id"]
        # Fetch progress
        cursor.execute("SELECT current_unit, current_index, learned_words, quiz_stats FROM progress WHERE user_id = ?", (user_id,))
        p = cursor.fetchone()

        progress_data = {
            "current_unit": p["current_unit"] if p else "Unit 1: Growing Up",
            "current_index": p["current_index"] if p else 0,
            "learned_words": json.loads(p["learned_words"]) if (p and p["learned_words"]) else [],
            "quiz_stats": json.loads(p["quiz_stats"]) if (p and p["quiz_stats"]) else {}
        }

    token = create_token(user_id, user["username"])
    return jsonify({
        "success": True,
        "token": token,
        "username": user["username"],
        "progress": progress_data
    })

@app.route("/api/auth/me", methods=["GET"])
@token_required
def me(user_id, username):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT current_unit, current_index, learned_words, quiz_stats, updated_at FROM progress WHERE user_id = ?", (user_id,))
        p = cursor.fetchone()

        progress_data = {
            "current_unit": p["current_unit"] if p else "Unit 1: Growing Up",
            "current_index": p["current_index"] if p else 0,
            "learned_words": json.loads(p["learned_words"]) if (p and p["learned_words"]) else [],
            "quiz_stats": json.loads(p["quiz_stats"]) if (p and p["quiz_stats"]) else {},
            "updated_at": p["updated_at"] if p else None
        }

    return jsonify({
        "success": True,
        "username": username,
        "progress": progress_data
    })

# ----------------- PROGRESS APIS -----------------

@app.route("/api/progress", methods=["GET"])
@token_required
def get_progress(user_id, username):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT current_unit, current_index, learned_words, quiz_stats, updated_at FROM progress WHERE user_id = ?", (user_id,))
        p = cursor.fetchone()

        progress_data = {
            "current_unit": p["current_unit"] if p else "Unit 1: Growing Up",
            "current_index": p["current_index"] if p else 0,
            "learned_words": json.loads(p["learned_words"]) if (p and p["learned_words"]) else [],
            "quiz_stats": json.loads(p["quiz_stats"]) if (p and p["quiz_stats"]) else {},
            "updated_at": p["updated_at"] if p else None
        }

    return jsonify({"success": True, "progress": progress_data})

@app.route("/api/progress", methods=["POST"])
@token_required
def update_progress(user_id, username):
    data = request.get_json() or {}
    current_unit = data.get("current_unit", "Unit 1: Growing Up")
    current_index = int(data.get("current_index", 0))
    learned_words = data.get("learned_words", [])
    quiz_stats = data.get("quiz_stats", {})

    learned_words_json = json.dumps(learned_words, ensure_ascii=False)
    quiz_stats_json = json.dumps(quiz_stats, ensure_ascii=False)

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO progress (user_id, current_unit, current_index, learned_words, quiz_stats, updated_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) DO UPDATE SET
                current_unit = excluded.current_unit,
                current_index = excluded.current_index,
                learned_words = excluded.learned_words,
                quiz_stats = excluded.quiz_stats,
                updated_at = CURRENT_TIMESTAMP
        """, (user_id, current_unit, current_index, learned_words_json, quiz_stats_json))
        conn.commit()

    return jsonify({"success": True, "message": "Đã lưu tiến độ thành công"})

# ----------------- STATIC FRONTEND -----------------

@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route("/<path:filename>")
def serve_static(filename):
    return send_from_directory(".", filename)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80, debug=False)
