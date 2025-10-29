# 🚀 Vercel Deployment Guide for Mihu AI

## Quick Fix for "Technical Difficulties" Error

The "I apologize, but I'm experiencing technical difficulties" error means your environment variables aren't set up on Vercel.

### Step 1: Set Environment Variables on Vercel

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Select your project**
3. **Go to Settings → Environment Variables**
4. **Add these variables:**

```
GROQ_API_KEY = your-groq-api-key-here
JWT_SECRET = your-jwt-secret-here
NODE_ENV = production
```

### Step 2: Redeploy

- Vercel will automatically redeploy when you save the environment variables
- Or manually trigger a redeploy in the dashboard

### Step 3: Test

1. **Test Endpoint:** `https://your-app.vercel.app/test`
   - Should show `hasGroqKey: true`
2. **Main App:** `https://your-app.vercel.app`
   - Should work on mobile now

## Troubleshooting

### If still getting errors:

1. **Check the test endpoint first** - this will tell you what's missing
2. **Make sure environment variables are set for "Production" environment**
3. **Wait a few minutes after setting variables for deployment to complete**
4. **Check Vercel function logs** in the dashboard

### Common Issues:

- ❌ **Environment variables not set** → Set them in Vercel dashboard
- ❌ **Wrong environment** → Make sure variables are set for "Production"
- ❌ **Deployment not complete** → Wait a few minutes after setting variables
- ❌ **API key invalid** → Check if the Groq API key is correct

## Your Vercel App URLs:

- **Main App:** `https://your-app.vercel.app`
- **Auth Page:** `https://your-app.vercel.app/auth`
- **Test Endpoint:** `https://your-app.vercel.app/test`

## Need Help?

If you're still having issues, check:
1. The test endpoint response
2. Vercel function logs
3. Make sure all environment variables are set correctly
