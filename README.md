# 🎵 MelodiAPI - Backend AI Music Generator

Backend middleware for Suno AI Music Generation - A Vercel serverless function that bridges your main server and the Suno API (PaxSenix).

---

## 🚀 Features

✅ **Custom Mode Support**
- Full control: style + prompt + title
- Instrumental option (style + title only)

✅ **Non-Custom Mode**
- Simple mode: prompt only (max 400 chars)

✅ **Real-time Processing**
- Polling every 5 seconds
- Max 5-minute timeout
- Status tracking: pending → processing → done

✅ **Production Ready**
- Input validation for all modes
- Comprehensive error handling
- Environment-based configuration
- TypeScript strict mode
- 300-second Vercel function timeout

---

## 📁 Project Structure

```
melodiapi/
├── api/
│   ├── generate.ts          # Main POST /api/generate handler
│   └── utils.ts             # Validation & polling utilities
├── package.json             # Dependencies (production)
├── tsconfig.json            # TypeScript configuration
├── vercel.json              # Vercel deployment config
├── .env.example             # Environment template
└── README.md                # This file
```

---

## 🔧 Environment Configuration

### Required Variables

Create a `.env.local` file for local development (git-ignored):

```env
SUNO_BASE_URL="https://api.paxsenix.org"
SUNO_API_KEY="your-bearer-token-here"
SUNO_ENDPOINT_GENERATE="/ai-music/suno-music"
CREATOR_NAME="@Dafidxcode"
```

For Vercel deployment, set these in **Settings → Environment Variables**.

---

## 📝 API Documentation

### Endpoint

```
POST https://your-project.vercel.app/api/generate
```

### Request Body

#### Custom Mode - Vocal

```json
{
  "customMode": true,
  "instrumental": false,
  "style": "City Pop, Funk, 80s, Synthpop",
  "prompt": "A beautiful song with female vocals...",
  "title": "Song Title",
  "model": "V5",
  "negativeTags": ""
}
```

#### Custom Mode - Instrumental

```json
{
  "customMode": true,
  "instrumental": true,
  "style": "Ambient Electronic, Lo-fi Hip Hop",
  "title": "Instrumental Track",
  "model": "V5",
  "negativeTags": "vocals"
}
```

#### Non-Custom Mode

```json
{
  "customMode": false,
  "instrumental": false,
  "prompt": "A beautiful song with female vocals...",
  "model": "V5",
  "negativeTags": ""
}
```

### Parameter Limits

| Parameter | Custom Vocal | Custom Instrumental | Non-Custom |
|-----------|--------------|-------------------|-----------|
| `style` | ✅ Max 1000 | ✅ Max 1000 | ❌ Must be empty |
| `prompt` | ✅ Max 5000 | ❌ Ignored | ✅ Max 400 |
| `title` | ✅ Max 80 | ✅ Max 80 | ❌ Optional |
| `instrumental` | `false` | `true` | `false` |

### Response (200 OK)

```json
{
  "creator": "@Dafidxcode",
  "ok": true,
  "status": "done",
  "records": [
    {
      "id": "861582501871616",
      "image_url": "https://cdn-0.paxsenix.org/file/...",
      "audio_url": "https://cdn-0.paxsenix.org/file/...",
      "duration": 38.28,
      "create_time": "1768556363",
      "model": "chirp-crow",
      "prompt": "A beautiful song...",
      "title": "Song Title",
      "tags": "City Pop, Funk, 80s"
    }
  ],
  "completedAt": "2026-01-16T09:40:16.230Z"
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| `200` | Success | Music generated successfully |
| `400` | Bad Request | Validation error (missing field, length exceeded) |
| `405` | Method Not Allowed | Used GET instead of POST |
| `500` | Server Error | Missing environment variables |
| `502` | Bad Gateway | Generation failed at PaxSenix API |
| `504` | Timeout | Generation took > 5 minutes |

### Error Response (400)

```json
{
  "error": "Validation Failed",
  "details": [
    "In customMode, 'style' is required"
  ]
}
```

---

## 🔄 Polling Flow

1. **POST Request** → Send generation request
2. **Task URL** → Receive task_url from response
3. **Poll Every 5 Seconds** → Check status via GET
4. **States:**
   - `pending` → Continue polling
   - `processing` → Continue polling
   - `done` → Success! Return response
   - `failed` → Error occurred

**Max Duration:** 5 minutes (60 attempts × 5 seconds)

---

## 🛠️ Installation & Deployment

### Local Setup

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build
```

### Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy MelodiAPI to Vercel"
   git push origin main
   ```

2. **Import in Vercel Dashboard:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select "MelodiAPI" project

3. **Set Environment Variables** (Settings → Environment Variables):
   ```
   SUNO_BASE_URL = https://api.paxsenix.org
   SUNO_API_KEY = your-bearer-token
   SUNO_ENDPOINT_GENERATE = /ai-music/suno-music
   CREATOR_NAME = @Dafidxcode
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your API is live! 🎉

---

## 🧪 Testing (Local Only)

Before deployment, test locally with curl:

```bash
curl -X POST "http://localhost:3000/api/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "customMode": true,
    "instrumental": false,
    "style": "Pop",
    "prompt": "A catchy pop song",
    "title": "Test Song",
    "model": "V5"
  }'
```

---

## 📊 Integration with Main Server

### Basic Flow

```
Main Server
    ↓ POST /api/generate
MelodiAPI (Vercel)
    ↓ POST to PaxSenix
PaxSenix API
    ↓ Poll status
    ↓ Generation complete
MelodiAPI (Transform & return)
    ↓ Response with records
Main Server
```

### Response Processing

1. Check `status` field
2. If `done`: Process `records` array
3. If error: Handle error code (400, 502, 504)
4. Note: `creator` is now `@Dafidxcode` (transformed)

---

## 🔐 Security Notes

- ✅ No hardcoded credentials
- ✅ All secrets in environment variables
- ✅ HTTPS only (Vercel default)
- ✅ Bearer token authentication
- ✅ Input validation on all requests

---

## 📋 Validation Rules

### customMode=true, instrumental=false (Vocal)
- ✅ `style` required (max 1000)
- ✅ `prompt` required (max 5000)
- ✅ `title` required (max 80)

### customMode=true, instrumental=true (Instrumental)
- ✅ `style` required (max 1000)
- ✅ `title` required (max 80)
- ❌ `prompt` ignored/cleared

### customMode=false (Non-Custom)
- ✅ `prompt` required (max 400)
- ❌ `style` must be empty
- ❌ `title` optional but valid if provided (max 80)

---

## ⚙️ Technical Details

**Runtime:** Node.js 18+  
**Framework:** Vercel Functions  
**Language:** TypeScript (strict mode)  
**Timeout:** 300 seconds max  
**Polling Interval:** 5 seconds  
**Max Polls:** 60 attempts

---

## 📞 Support

For issues or questions:
1. Check validation error messages (400 responses)
2. Verify environment variables are set
3. Check PaxSenix API status
4. Ensure Bearer token is valid

---

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** January 16, 2026
