# 🌌 Parallel Universe Self

> Describe your life → AI imagines 5 alternate versions of you across parallel universes

A Flask web application powered by **Groq AI** that generates 5 deeply personal, creative parallel universe versions of your life — in **English 🇬🇧** or **বাংলা 🇧🇩**.

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat-square)
![Flask](https://img.shields.io/badge/Flask-3.1.0-green?style=flat-square)
![Groq AI](https://img.shields.io/badge/Groq-AI-purple?style=flat-square)

---

## ✨ Features

- 🌌 **5 Parallel Universe Cards** — beautifully animated reveal
- 🎭 **Deeply Personal** — AI uses your actual life details
- ⚡ **Plot Twists** — each universe has a shocking twist
- 💬 **Famous Quotes** — your alternate self's life motto
- 😊 **Happiness Score** — how happy are you in each dimension
- 🇬🇧🇧🇩 **English + Bangla** — full bilingual support
- 🔗 **Share Feature** — copy your results to share
- 🌠 **Cosmic UI** — animated stars, nebula, portal rings

---

## 🌌 The 5 Universes

| Universe | Vibe | Description |
|---|---|---|
| 🌟 The Glorious Timeline | Gold | Everything went perfectly |
| 🌑 The Dark Dimension | Purple | Things went terribly wrong |
| 🚀 The Sci-Fi Realm | Cyan | Futuristic advanced civilization |
| 💘 The Romantic Universe | Pink | Life ruled by love and passion |
| 🔀 The Bizarre Dimension | Green | Completely surreal existence |

---

## ⚙️ Local Setup

```bash
git clone https://github.com/gou-rab/parallel-universe-self.git
cd parallel-universe-self
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add your GROQ_API_KEY to .env
python app.py
```

Visit 👉 `http://localhost:5000`

---

## 🔑 Free Groq API Key

1. Go to 👉 [console.groq.com](https://console.groq.com)
2. Sign up free → **API Keys** → **Create Key**
3. Paste into `.env`

---

## 🚀 Deploy on Render

1. Push to GitHub
2. [render.com](https://render.com) → New Web Service → connect repo
3. Add env var: `GROQ_API_KEY`
4. Build: `pip install -r requirements.txt`
5. Start: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`

---

## 👨‍💻 Author

**Gourab Bhadra** · [github.com/gou-rab](https://github.com/gou-rab)
