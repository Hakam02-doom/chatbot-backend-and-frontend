# 🚀 Vercel Deployment Guide

## Quick Deploy Checklist

### 1. **Environment Variables** (REQUIRED)
Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

Add these variables for **Production**:

```
GROQ_API_KEY=your-groq-api-key-here
JWT_SECRET=your-jwt-secret-here
TAVILY_API_KEY=your-tavily-api-key-here (optional)
```

### 2. **Project Structure**
```
/
├── api/
│   ├── ai.js          → POST /api/ai (Main AI endpoint)
│   ├── test.js        → GET /api/test (Health check)
│   └── index.js       → Fallback handler
├── index.html         → Main app page
├── vercel.json        → Vercel configuration
└── package.json       → Dependencies
```

### 3. **Deployment Steps**

1. **Connect GitHub Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Set Environment Variables**
   - In project settings, add all required environment variables
   - Make sure they're set for **Production** environment

3. **Deploy**
   - Vercel will automatically detect and deploy
   - Wait for build to complete

4. **Test Deployment**
   - Test endpoint: `https://your-app.vercel.app/api/test`
   - Should return: `{"status":"ok","hasGroqKey":true,...}`
   - Main app: `https://your-app.vercel.app`

### 4. **API Endpoints**

- **GET** `/api/test` - Health check and environment status
- **POST** `/api/ai` - Main AI chat endpoint
  ```json
  {
    "message": "Hello",
    "sessionId": "optional-session-id",
    "userId": "optional-user-id"
  }
  ```

### 5. **Troubleshooting**

#### ❌ "Cannot GET /api/test"
- Check that `api/test.js` exists
- Verify `vercel.json` configuration
- Check Vercel function logs

#### ❌ "Technical difficulties" message
- Verify `GROQ_API_KEY` is set in Vercel environment variables
- Check Vercel function logs for errors
- Test `/api/test` endpoint to verify API key loading

#### ❌ Deployment fails
- Check build logs in Vercel dashboard
- Verify all dependencies in `package.json`
- Ensure Node.js version is compatible

### 6. **Monitoring**

- **Vercel Dashboard** → **Functions** → View logs and metrics
- **Check logs** for errors or warnings
- **Monitor** API response times

### 7. **Important Notes**

- ✅ Serverless functions have a 30-second timeout
- ✅ Environment variables must be set in Vercel dashboard
- ✅ All API routes are in `/api/` directory
- ✅ Main app is served from `index.html`

---

## 🎯 Quick Deploy Command

Once connected to Vercel:

```bash
git push origin main
```

Vercel will automatically deploy on push to main branch.

---

**Need Help?** Check Vercel logs in the dashboard for detailed error messages.
