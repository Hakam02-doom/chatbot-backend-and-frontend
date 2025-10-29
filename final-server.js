import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { databaseWrapper as database } from './database-wrapper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3002;

// Check for required environment variables in production
if (process.env.NODE_ENV === 'production') {
    const requiredEnvVars = ['GROQ_API_KEY', 'JWT_SECRET'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:', missingVars);
        console.error('Please set these variables in your Vercel dashboard');
        console.error('App will continue with limited functionality');
    } else {
        console.log('✅ All environment variables loaded successfully');
    }
}

app.use(express.json());

// Enhanced CORS middleware for mobile support
app.use((req, res, next) => {
    // Allow all origins for development and production
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    next();
});

// Auth page route
app.get('/auth', (req, res) => {
    console.log('Serving auth-page.html');
    res.sendFile(path.join(__dirname, 'auth-page.html'));
});

// Test endpoint for debugging
app.get('/test', (req, res) => {
    res.json({
        status: 'ok',
        environment: process.env.NODE_ENV || 'development',
        hasGroqKey: !!process.env.GROQ_API_KEY,
        hasJwtSecret: !!process.env.JWT_SECRET,
        groqKeyLength: process.env.GROQ_API_KEY?.length || 0,
        groqKeyStart: process.env.GROQ_API_KEY?.substring(0, 10) || 'not found',
        isVercel: !!process.env.VERCEL,
        timestamp: new Date().toISOString()
    });
});

// Debug endpoint to test AI directly
app.get('/debug-ai', async (req, res) => {
    try {
        const { generate } = await import('./simple-chatbot.js');
        const result = await generate('test message', 'debug');
        res.json({
            success: true,
            result: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }
});

// Main app route
app.get('/', (req, res) => {
    console.log('Serving mihu-ai.html');
    res.sendFile(path.join(__dirname, 'mihu-ai.html'));
});

// Serve static files (after specific routes)
app.use(express.static(path.join(__dirname)));

// Authentication endpoints
app.post('/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log('Signup request:', { name, email });
        
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        const user = await database.createUser(name, email, password);
        const session = await database.createSession(user.id);
        await database.updateLastLogin(user.id);
        
        console.log('User created:', user.email);
        
        res.json({
            success: true,
            message: 'Account created successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            },
            token: session.token
        });
    } catch (error) {
        console.error('Signup error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login request:', { email });
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const { valid, user } = await database.validatePassword(email, password);
        
        if (!valid || !user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const session = await database.createSession(user.id);
        await database.updateLastLogin(user.id);
        
        console.log('User logged in:', user.email);
        
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.created_at,
                lastLogin: new Date().toISOString()
            },
            token: session.token
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
});

app.post('/auth/logout', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token is required'
            });
        }

        await database.deleteSession(token);
        console.log('User logged out');
        
        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
});

app.get('/auth/validate', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        
        const user = await database.validateSession(token);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Token validation error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Token validation failed'
        });
    }
});

app.get('/auth/stats', async (req, res) => {
    try {
        const stats = await database.getUserStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Stats error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to get stats'
        });
    }
});

// Chat history endpoints
app.get('/chat/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { sessionId = 'default_session' } = req.query;
        
        const history = await database.getChatHistory(userId, sessionId);
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Error getting chat history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get chat history'
        });
    }
});

app.post('/chat/save', async (req, res) => {
    try {
        const { userId, sessionId, message, isUser } = req.body;
        
        await database.saveChatMessage(userId, sessionId, message, isUser);
        res.json({
            success: true,
            message: 'Message saved successfully'
        });
    } catch (error) {
        console.error('Error saving chat message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save message'
        });
    }
});

// AI endpoint that calls the real AI backend
app.post('/ai', async (req, res) => {
    const { message, sessionId = 'default_session', userId } = req.body;
    console.log('AI request:', message, 'sessionId:', sessionId, 'userId:', userId);
    
    try {
        // Save user message to database if userId is provided
        if (userId) {
            await database.saveChatMessage(userId, sessionId, message, true);
        }
        
        // Import and call the simple AI function
        const { generate } = await import('./simple-chatbot.js');
        const result = await generate(message, sessionId);
        
        // Save AI response to database if userId is provided
        if (userId) {
            await database.saveChatMessage(userId, sessionId, result, false);
        }
        
        console.log('AI response generated');
        res.json({ reply: result });
    } catch (error) {
        console.error('Error calling AI:', error);
        
        // Fallback response
        const fallbackResponse = `I apologize, but I'm experiencing technical difficulties. Your message was: "${message}". Please try again in a moment.`;
        res.json({ reply: fallbackResponse });
    }
});

// Initialize database and start server
async function startServer() {
    try {
        await database.init();
        console.log('Database initialized successfully');
        
app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
    console.log(`Open http://localhost:${port} in your browser`);
    console.log(`For mobile testing: http://192.168.31.23:${port}`);
    console.log('AI backend is connected and ready!');
    console.log('Database is ready for user management!');
});
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
