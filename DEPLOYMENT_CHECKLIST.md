# ✅ Pre-Deployment Checklist

## Before Deploying to Vercel

### 1. ✅ Code Files
- [x] `api/ai.js` - Main AI endpoint exists
- [x] `api/test.js` - Health check endpoint exists
- [x] `api/index.js` - Fallback handler exists
- [x] `index.html` - Main app page exists
- [x] `vercel.json` - Configuration file exists

### 2. ✅ Environment Variables (Set in Vercel Dashboard)
- [ ] `GROQ_API_KEY` - Your Groq API key
- [ ] `JWT_SECRET` - A strong secret key (any random string)
- [ ] `TAVILY_API_KEY` - Optional, for search features

### 3. ✅ Dependencies
- [x] All dependencies in `package.json`
- [x] No missing imports or errors

### 4. ✅ Git
- [ ] All changes committed
- [ ] Pushed to GitHub
- [ ] Repository connected to Vercel

### 5. ✅ Testing
- [ ] Test locally: `npm start`
- [ ] Test `/api/test` endpoint
- [ ] Test AI chat functionality

## After Deployment

### 1. ✅ Verify Deployment
- [ ] Check Vercel dashboard for successful build
- [ ] Visit your app URL
- [ ] Test `/api/test` endpoint

### 2. ✅ Check Logs
- [ ] Go to Vercel Dashboard → Functions → Logs
- [ ] Look for any errors
- [ ] Verify API key is loaded

### 3. ✅ Test Endpoints
- [ ] `GET /api/test` - Should return status
- [ ] `POST /api/ai` - Should return AI response

## Troubleshooting

### Issue: "Cannot GET /api/test"
**Solution**: Check that `api/test.js` exists and is committed to git

### Issue: "Technical difficulties" message
**Solution**: 
1. Verify `GROQ_API_KEY` is set in Vercel environment variables
2. Check Vercel function logs for errors
3. Test `/api/test` to see if API key is loaded

### Issue: Deployment fails
**Solution**:
1. Check Vercel build logs
2. Verify all dependencies are in `package.json`
3. Ensure Node.js version is compatible

---

**Ready to deploy?** Follow [DEPLOYMENT_VERCEL.md](./DEPLOYMENT_VERCEL.md)
