import express from 'express';

const app = express();
const port = 3002;

app.use(express.json());

// Simple CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    next();
});

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Server is working!' });
});

// Test AI route
app.post('/ai', (req, res) => {
    console.log('AI request received:', req.body);
    res.json({ 
        response: 'Hello! This is a test response from the AI.',
        success: true 
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Test server running on port ${port}`);
    console.log(`Open http://localhost:${port} in your browser`);
});