import os, requests, json, sqlite3
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from dotenv import load_dotenv
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()
app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = os.environ.get("SECRET_KEY", "parallel-universe-secret-2026")

DB_PATH = "users.db"

# ── Database Setup ──
def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            name      TEXT NOT NULL,
            email     TEXT UNIQUE NOT NULL,
            password  TEXT NOT NULL,
            joined_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ── Auth Routes ──
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        if "user_id" in session:
            return redirect(url_for("index"))
        return render_template("login.html", mode="login")

    data  = request.get_json()
    email = data.get("email", "").strip().lower()
    pwd   = data.get("password", "")

    if not email or not pwd:
        return jsonify({"error": "Email and password are required."}), 400

    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()

    if not user or not check_password_hash(user["password"], pwd):
        return jsonify({"error": "Invalid email or password."}), 401

    session["user_id"]   = user["id"]
    session["user_name"] = user["name"]
    session["user_email"]= user["email"]
    return jsonify({"success": True, "name": user["name"]})


@app.route("/signup", methods=["POST"])
def signup():
    data  = request.get_json()
    name  = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    pwd   = data.get("password", "")

    if not name or not email or not pwd:
        return jsonify({"error": "All fields are required."}), 400
    if len(pwd) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400
    if "@" not in email:
        return jsonify({"error": "Please enter a valid email."}), 400

    hashed = generate_password_hash(pwd)
    joined = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    try:
        conn = get_db()
        conn.execute(
            "INSERT INTO users (name, email, password, joined_at) VALUES (?, ?, ?, ?)",
            (name, email, hashed, joined)
        )
        conn.commit()
        user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        conn.close()

        session["user_id"]    = user["id"]
        session["user_name"]  = name
        session["user_email"] = email
        return jsonify({"success": True, "name": name})

    except sqlite3.IntegrityError:
        return jsonify({"error": "This email is already registered. Please log in."}), 409


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


# ── Admin: Dashboard Page ──
@app.route("/admin")
def admin_dashboard():
    admin_key = request.args.get("key", "")
    if admin_key != os.environ.get("ADMIN_KEY", "admin123"):
        return render_template("login.html", mode="login"), 403
    return render_template("admin.html", admin_key_hint=f"Key: {admin_key[:3]}***")


# ── Admin: API — All Users (JSON) ──
@app.route("/admin/users")
def admin_users():
    admin_key = request.args.get("key", "")
    if admin_key != os.environ.get("ADMIN_KEY", "admin123"):
        return jsonify({"error": "Unauthorized"}), 401

    conn  = get_db()
    users = conn.execute(
        "SELECT id, name, email, joined_at FROM users ORDER BY joined_at DESC"
    ).fetchall()
    conn.close()

    return jsonify({
        "total": len(users),
        "users": [dict(u) for u in users]
    })


# ── Main App ──
@app.route("/")
def index():
    if "user_id" not in session:
        return redirect(url_for("login"))
    return render_template("index.html", user_name=session.get("user_name"))


SYSTEM_PROMPT = """You are a Parallel Universe Oracle — a mystical AI that reveals alternate versions of a person's life across 5 parallel universes.

Given a person's life description, generate exactly 5 parallel universe versions of their life.

Respond ONLY in this exact JSON format:
{
  "universes": [
    {
      "id": 1,
      "universe_name": "The Glorious Timeline",
      "dimension_code": "UNIVERSE-7G",
      "vibe": "glorious",
      "emoji": "🌟",
      "color": "gold",
      "who_you_are": "2-3 sentences describing who this person is in this universe",
      "profession": "Their job/role in this universe",
      "life_situation": "2-3 sentences about their daily life, relationships, home",
      "plot_twist": "One shocking/surprising twist about their life in this universe",
      "famous_quote": "A quote this version of them lives by",
      "happiness_score": 95
    }
  ]
}

Generate exactly these 5 universes in this order:
1. "The Glorious Timeline" - vibe: "glorious" - emoji: "🌟" - color: "gold"
2. "The Dark Dimension"    - vibe: "dark"      - emoji: "🌑" - color: "dark"
3. "The Sci-Fi Realm"      - vibe: "scifi"     - emoji: "🚀" - color: "scifi"
4. "The Romantic Universe" - vibe: "romantic"  - emoji: "💘" - color: "romantic"
5. "The Bizarre Dimension" - vibe: "bizarre"   - emoji: "🔀" - color: "bizarre"

Make each universe creative, specific, emotionally engaging, and surprising.
The plot_twist must be genuinely shocking."""


@app.route("/generate", methods=["POST"])
def generate():
    if "user_id" not in session:
        return jsonify({"error": "Please log in first."}), 401

    try:
        data = request.get_json()
        if not data or "description" not in data:
            return jsonify({"error": "No description provided"}), 400

        description = data["description"].strip()
        if len(description) < 20:
            return jsonify({"error": "Please describe your life in more detail."}), 400

        lang = data.get("lang", "en")
        user_message = (
            f"এই ব্যক্তির জীবন বর্ণনা থেকে ৫টি সমান্তরাল মহাবিশ্ব তৈরি করুন। বাংলায় লিখুন।\n\nজীবন বর্ণনা: {description}"
            if lang == "bn"
            else f"Create 5 parallel universe versions of this person's life.\n\nTheir life: {description}"
        )

        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}",
                "Content-Type": "application/json"
            },
            json={
                "model": "meta-llama/llama-4-scout-17b-16e-instruct",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user",   "content": user_message}
                ],
                "max_tokens": 2000,
                "response_format": {"type": "json_object"},
                "temperature": 0.9
            },
            timeout=30
        )

        result  = response.json()
        if "error" in result:
            return jsonify({"error": result["error"].get("message", "API error")}), 400

        content = result["choices"][0]["message"]["content"]
        parsed  = json.loads(content)

        if "universes" not in parsed:
            return jsonify({"error": "Could not generate. Please try again."}), 500

        return jsonify(parsed)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
