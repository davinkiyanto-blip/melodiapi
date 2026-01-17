# MelodiAPI - Async Music Generation

This is a stateless Vercel Serverless API that acts as a secure bridge to the PaxSenix Suno API. It handles authentication and validation, then initiates a generation task and returns the `task_url` for the client to poll.

## 🚀 API Endpoint
```
POST https://melodi-api.vercel.app/api/generate
```

## 📥 Request Body (JSON)

### 1. Custom Mode (Vocal)
```json
{
  "customMode": true,
  "instrumental": false,
  "style": "Pop, Electronic, Upbeat",
  "title": "My Song Title",
  "prompt": "A song about coding",
  "model": "V5"
}
```

### 2. Custom Mode (Instrumental)
```json
{
  "customMode": true,
  "instrumental": true,
  "style": "Ambient, Chill, Lo-fi",
  "title": "Relaxing Beats",
  "model": "V5"
}
```

### 3. Non-Custom Mode (Prompt Only)
```json
{
  "customMode": false,
  "instrumental": false,
  "prompt": "A catchy pop song about summer",
  "model": "V5"
}
```

## 📤 Response

### Success (200 OK)
The response body is a **Plain Text String** containing the `task_url`.

```text
https://api.paxsenix.org/ai-music/suno-music/12345-abcde-67890
```

### Error (4xx/5xx)
The response body is **JSON** for easy debugging.

```json
{
  "error": "Validation Failed",
  "details": ["In customMode, 'style' is required"]
}
```

---

## 🔄 Main Server Integration Guide

The Main Server is responsible for polling the returned `task_url`.

### Workflow
1. **Main Server** sends POST request to `melodi-api.vercel.app`.
2. **MelodiAPI** returns `task_url` (Text).
3. **Main Server** enters a polling loop:
   - Call `GET task_url` every 5 seconds.
   - Headers: `Authorization: Bearer <YOUR_PAXSENIX_KEY>`
   - Check `status` field in response.

### Polling Logic (Pseudo-Code)

```javascript
// Step 1: Get Task URL
const taskUrl = await fetch("https://melodi-api.vercel.app/api/generate", {
    method: "POST",
    body: JSON.stringify(payload)
}).then(r => r.text()); // <-- Read as TEXT

// Step 2: Poll Loop
while (true) {
    const statusData = await fetch(taskUrl, {
        headers: { "Authorization": "Bearer YOUR_KEY" }
    }).then(r => r.json());

    if (statusData.status === "done") {
        return statusData; // Success!
    } 
    
    if (statusData.status === "failed") {
        throw new Error("Generation failed");
    }

    await sleep(5000); // Wait 5 seconds
}
```

## 🛠 Project Structure
- `api/generate.ts`: Main entry point. Handling validation and request initiation.
- `api/utils.ts`: Validation logic.
