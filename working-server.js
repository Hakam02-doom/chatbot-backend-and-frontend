import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

app.use(express.json());

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

// Serve the HTML file
app.get('/', (req, res) => {
    console.log('Serving mihu-ai.html');
    res.sendFile(path.join(__dirname, 'mihu-ai.html'));
});

// Mock AI endpoint for testing
app.post('/ai', (req, res) => {
    const { message, sessionId = 'default_session' } = req.body;
    console.log('AI request:', message, 'sessionId:', sessionId);
    
    // Mock response
    const mockResponse = `Hello! I received your message: "${message}". This is a test response.`;
    res.json({ reply: mockResponse });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(`Open http://localhost:${port} in your browser`);
});
