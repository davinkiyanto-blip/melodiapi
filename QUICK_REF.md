# 🎯 MelodiAPI - Quick Reference

## 📁 What's Inside

```
📦 melodiapi/
├── 📝 README.md              ← Start here! Full API docs
├── 🚀 DEPLOYMENT.md          ← Deploy to Vercel guide
├── ✅ PRODUCTION_READY.md    ← What was cleaned up
├── 🔧 vercel.json            ← Vercel config (300s timeout)
├── 📋 package.json           ← Dependencies (production only)
├── 📄 tsconfig.json          ← TypeScript config
├── 🔐 .env.example           ← Environment template
├── 🚫 .gitignore             ← Git ignore rules
│
└── 📂 api/
    ├── generate.ts           ← Main handler (POST /api/generate)
    └── utils.ts              ← Validation & polling logic
```

---

## 🚀 Deploy to Vercel in 5 Steps

### 1️⃣ GitHub
```bash
git add .
git commit -m "Deploy MelodiAPI"
git push origin main
```

### 2️⃣ Vercel Dashboard
- Go to https://vercel.com/new
- Import this repository

### 3️⃣ Set Environment Variables
```
SUNO_BASE_URL = https://api.paxsenix.org
SUNO_API_KEY = your-bearer-token
SUNO_ENDPOINT_GENERATE = /ai-music/suno-music
CREATOR_NAME = @Dafidxcode
```

### 4️⃣ Deploy
- Click "Deploy"
- Wait ~1 minute

### 5️⃣ Test
```bash
curl -X POST "https://your-project.vercel.app/api/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "customMode": true,
    "instrumental": false,
    "style": "Pop",
    "prompt": "A beautiful pop song",
    "title": "Test",
    "model": "V5"
  }'
```

---

## 📊 API Endpoint

```
POST https://your-project.vercel.app/api/generate
```

### Mode 1: Custom + Vocal
```json
{
  "customMode": true,
  "instrumental": false,
  "style": "Genre1, Genre2",
  "prompt": "Song description",
  "title": "Song Title",
  "model": "V5"
}
```

### Mode 2: Custom + Instrumental
```json
{
  "customMode": true,
  "instrumental": true,
  "style": "Genre1, Genre2",
  "title": "Song Title",
  "model": "V5"
}
```

### Mode 3: Non-Custom
```json
{
  "customMode": false,
  "instrumental": false,
  "prompt": "Song description (max 400)",
  "model": "V5"
}
```

---

## ✅ Response (200 OK)

```json
{
  "creator": "@Dafidxcode",
  "ok": true,
  "status": "done",
  "records": [
    {
      "id": "...",
      "audio_url": "...",
      "image_url": "...",
      "duration": 38.28,
      "title": "Song Title",
      "tags": "Genre1, Genre2"
    }
  ],
  "completedAt": "2026-01-16T09:40:16.230Z"
}
```

---

## 🛑 Errors

| Code | Error | Fix |
|------|-------|-----|
| 400 | Validation failed | Check parameters |
| 405 | Method not allowed | Use POST, not GET |
| 502 | Generation failed | PaxSenix API issue |
| 504 | Timeout | Generation took >5min |

---

## ⚙️ Parameter Limits

| Mode | Style | Prompt | Title |
|------|-------|--------|-------|
| Custom Vocal | ✅ 1000 | ✅ 5000 | ✅ 80 |
| Custom Instrumental | ✅ 1000 | ❌ Ignore | ✅ 80 |
| Non-Custom | ❌ Empty | ✅ 400 | ❌ Optional |

---

## 📞 Files to Read

- 📖 **README.md** - Complete documentation
- 🚀 **DEPLOYMENT.md** - Step-by-step deployment
- ✅ **PRODUCTION_READY.md** - What was cleaned up
- 🔐 **.env.example** - Environment template

---

## 💾 Production Checklist

- ✅ All code optimized
- ✅ Test files removed
- ✅ Dependencies cleaned up
- ✅ No hardcoded secrets
- ✅ TypeScript strict mode
- ✅ Documentation complete
- ✅ Ready for Vercel

---

**Next Step:** Read DEPLOYMENT.md and deploy! 🚀

Last Updated: January 16, 2026
