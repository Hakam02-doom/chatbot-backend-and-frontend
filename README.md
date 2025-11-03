# 🤖 Mihu AI - Intelligent Conversation Partner

A modern AI chatbot powered by Groq's GPT models, featuring real-time conversations, chat history, authentication, and dark mode.

## ✨ Features

- 🤖 **AI-Powered Conversations** - Powered by Groq's GPT models
- 💬 **Chat History** - Persistent chat sessions with database storage
- 🔐 **User Authentication** - Sign up, login, and secure sessions
- 🌙 **Dark Mode** - Beautiful dark/light theme toggle
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- ⚡ **Fast & Reliable** - Built with modern web technologies

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd llm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env and add your API keys
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open in browser**
   ```
   http://localhost:3002
   ```

## 🌐 Vercel Deployment

See [DEPLOYMENT_VERCEL.md](./DEPLOYMENT_VERCEL.md) for detailed deployment instructions.

### Quick Steps:

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository

3. **Set Environment Variables**
   - `GROQ_API_KEY` (Required)
   - `JWT_SECRET` (Required)
   - `TAVILY_API_KEY` (Optional)

4. **Deploy!**
   - Vercel will automatically deploy on push

## 📁 Project Structure

```
/
├── api/                    # Vercel serverless functions
│   ├── ai.js              # POST /api/ai - Main AI endpoint
│   ├── test.js            # GET /api/test - Health check
│   └── index.js           # Fallback handler
├── index.html             # Main application
├── final-server.js        # Express server (for local dev)
├── chatbot.js             # AI logic
├── database.js            # Database operations
├── vercel.json            # Vercel configuration
└── package.json           # Dependencies
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ Yes | Your Groq API key |
| `JWT_SECRET` | ✅ Yes | Secret for JWT tokens |
| `TAVILY_API_KEY` | ❌ No | Tavily search API key |
| `PORT` | ❌ No | Server port (default: 3002) |

### API Endpoints

- **POST** `/api/ai` - Send a message to the AI
  ```json
  {
    "message": "Hello!",
    "sessionId": "optional-session-id"
  }
  ```

- **GET** `/api/test` - Health check and environment status

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express
- **AI**: Groq SDK
- **Database**: SQLite
- **Deployment**: Vercel Serverless Functions

## 📝 License

MIT License

---

**Made with ❤️ using Groq AI**