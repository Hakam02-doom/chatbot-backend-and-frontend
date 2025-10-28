# 🚀 Mihu AI Deployment Guide

This guide covers multiple deployment options for your Mihu AI chatbot application.

## 📋 Prerequisites

Before deploying, make sure you have:
- [ ] Groq API key from [console.groq.com](https://console.groq.com/)
- [ ] Tavily API key from [tavily.com](https://tavily.com/)
- [ ] Git repository (GitHub recommended)

## 🔧 Environment Setup

1. **Copy environment template:**
   ```bash
   cp env.example .env
   ```

2. **Fill in your API keys in `.env`:**
   ```env
   JWT_SECRET=your-super-secret-jwt-key-here
   GROQ_API_KEY=your-groq-api-key-here
   TAVILY_API_KEY=your-tavily-api-key-here
   PORT=3001
   NODE_ENV=production
   ```

## 🌐 Deployment Options

### Option 1: Railway (Recommended - Easiest)

Railway is perfect for Node.js apps with databases.

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables in Railway dashboard:
   - `JWT_SECRET`
   - `GROQ_API_KEY`
   - `TAVILY_API_KEY`
   - `NODE_ENV=production`
6. Deploy! Railway will automatically detect the `railway.json` config

**Cost:** Free tier available, $5/month for paid plans

---

### Option 2: Vercel (Serverless)

Great for serverless deployment.

**Steps:**
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts
4. Add environment variables in Vercel dashboard
5. Deploy with `vercel --prod`

**Note:** Vercel has limitations with SQLite, consider using a cloud database.

**Cost:** Free tier available

---

### Option 3: Heroku

Classic platform for web apps.

**Steps:**
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Add environment variables:
   ```bash
   heroku config:set JWT_SECRET=your-secret
   heroku config:set GROQ_API_KEY=your-key
   heroku config:set TAVILY_API_KEY=your-key
   heroku config:set NODE_ENV=production
   ```
5. Deploy: `git push heroku main`

**Cost:** $7/month for basic dyno

---

### Option 4: DigitalOcean App Platform

**Steps:**
1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Create new app from GitHub
3. Select your repository
4. Configure build settings:
   - Build command: `npm install`
   - Run command: `npm start`
5. Add environment variables
6. Deploy

**Cost:** $5/month for basic plan

---

### Option 5: VPS (Virtual Private Server)

For full control over your deployment.

**Recommended VPS providers:**
- DigitalOcean Droplets ($5/month)
- Linode ($5/month)
- Vultr ($2.50/month)

**Steps:**
1. Create a VPS (Ubuntu 20.04+)
2. SSH into your server
3. Install Node.js and PM2:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   npm install -g pm2
   ```
4. Clone your repository
5. Install dependencies: `npm install`
6. Set up environment variables
7. Start with PM2: `pm2 start final-server.js --name mihu-ai`
8. Set up reverse proxy with Nginx
9. Configure SSL with Let's Encrypt

---

## 🗄️ Database Considerations

### Current Setup (SQLite)
- ✅ Simple and works out of the box
- ❌ Not suitable for high-traffic production
- ❌ Data loss if server restarts

### Recommended for Production
1. **PostgreSQL** (Railway, Heroku Postgres)
2. **MongoDB Atlas** (Free tier available)
3. **PlanetScale** (MySQL-compatible)

### Database Migration
If you want to upgrade from SQLite:

1. **Install PostgreSQL driver:**
   ```bash
   npm install pg
   ```

2. **Update database.js** to use PostgreSQL instead of SQLite

3. **Update environment variables:**
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Use strong JWT secret (32+ characters)
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS properly
- [ ] Use HTTPS (most platforms provide this)
- [ ] Set up rate limiting
- [ ] Monitor logs and errors
- [ ] Regular backups of database

---

## 📊 Monitoring & Maintenance

### Health Checks
Add a health check endpoint to your server:

```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
```

### Logging
Consider adding Winston or similar for better logging:

```bash
npm install winston
```

### Updates
- Keep dependencies updated
- Monitor for security vulnerabilities
- Regular backups

---

## 🚀 Quick Start Commands

```bash
# Local development
npm run server

# Production build
npm run prod

# Deploy to Railway
# (Just push to GitHub, Railway auto-deploys)

# Deploy to Vercel
vercel --prod

# Deploy to Heroku
git push heroku main
```

---

## 🆘 Troubleshooting

### Common Issues:

1. **Port binding errors:** Make sure to use `process.env.PORT || 3001`
2. **Database connection:** Check your DATABASE_URL
3. **API key errors:** Verify all environment variables are set
4. **CORS issues:** Check your CORS configuration

### Getting Help:
- Check the logs in your deployment platform
- Test locally first with production environment variables
- Use the health check endpoint to verify deployment

---

## 🎉 You're Ready!

Choose your preferred deployment option and follow the steps. Railway is recommended for beginners, while VPS gives you the most control.

Good luck with your deployment! 🚀
