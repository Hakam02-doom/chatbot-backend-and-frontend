import express from 'express';
import { generate } from './chatbot.js';
import { cacheService } from './cacheService.js';
import { conversationMemory } from './conversationMemory.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const port = 3001

// Middleware
app.use(express.json())

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Serve static files from React frontend
app.use(express.static(path.join(__dirname)));
app.get('/', (req, res) => {
  console.log('Serving mihu-ai.html');
  res.sendFile(path.join(__dirname, 'mihu-ai.html'));
})

app.post('/ai', async(req, res) => {
    const {message, sessionId = 'default_session'} = req.body;
    const result = await generate(message, sessionId);
    console.log("message:", message, "sessionId:", sessionId);

    res.json({reply: `${result}`});
    
})

// Cache management endpoints
app.get('/cache/stats', (req, res) => {
    const stats = cacheService.getStats();
    res.json({
        success: true,
        data: stats
    });
});

app.get('/cache/info', (req, res) => {
    const info = cacheService.getInfo();
    res.json({
        success: true,
        data: info
    });
});

app.delete('/cache', (req, res) => {
    cacheService.clear();
    res.json({
        success: true,
        message: 'Cache cleared successfully'
    });
});

app.delete('/cache/:message', (req, res) => {
    const { message } = req.params;
    const decodedMessage = decodeURIComponent(message);
    const deleted = cacheService.delete(decodedMessage);
    
    res.json({
        success: true,
        deleted: deleted,
        message: deleted ? 'Message removed from cache' : 'Message not found in cache'
    });
});

// Conversation memory management endpoints
app.get('/conversation/stats', (req, res) => {
    const stats = conversationMemory.getStats();
    res.json({
        success: true,
        data: stats
    });
});

app.delete('/conversation/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    conversationMemory.clearConversation(sessionId);
    res.json({
        success: true,
        message: `Conversation cleared for session ${sessionId}`
    });
});

app.delete('/conversation', (req, res) => {
    conversationMemory.clearAllConversations();
    res.json({
        success: true,
        message: 'All conversations cleared'
    });
});

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})