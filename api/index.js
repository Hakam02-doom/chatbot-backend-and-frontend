// Vercel serverless function
import Groq from 'groq-sdk';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Handle AI requests
    if (req.method === 'POST' && req.url === '/api/ai') {
        try {
            const { message, sessionId = 'default' } = req.body;
            
            if (!message) {
                return res.status(400).json({ reply: 'Message is required' });
            }
            
            // Check for API key
            if (!process.env.GROQ_API_KEY) {
                console.error('❌ GROQ_API_KEY not found');
                return res.status(500).json({ 
                    reply: "I'm currently experiencing technical difficulties. Please check that the API key is properly configured." 
                });
            }
            
            // Initialize Groq client
            const groq = new Groq({
                apiKey: process.env.GROQ_API_KEY,
            });
            
            // Make API call
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: message,
                    },
                ],
                model: 'openai/gpt-oss-120b',
                temperature: 0.1,
                max_tokens: 1000,
            });
            
            const response = completion.choices[0]?.message?.content || 'No response generated';
            
            res.json({ reply: response });
            
        } catch (error) {
            console.error('Error calling AI:', error);
            res.status(500).json({ 
                reply: "I'm experiencing technical difficulties. Please try again in a moment." 
            });
        }
        return;
    }
    
    // Handle test requests
    if (req.method === 'GET' && req.url === '/api/test') {
        res.json({
            status: 'ok',
            environment: process.env.NODE_ENV || 'development',
            hasGroqKey: !!process.env.GROQ_API_KEY,
            groqKeyLength: process.env.GROQ_API_KEY?.length || 0,
            isVercel: !!process.env.VERCEL,
            timestamp: new Date().toISOString()
        });
        return;
    }
    
    // Handle debug AI requests
    if (req.method === 'GET' && req.url === '/api/debug-ai') {
        try {
            if (!process.env.GROQ_API_KEY) {
                return res.json({
                    success: false,
                    error: 'GROQ_API_KEY not found',
                    timestamp: new Date().toISOString()
                });
            }
            
            const groq = new Groq({
                apiKey: process.env.GROQ_API_KEY,
            });
            
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: 'test message',
                    },
                ],
                model: 'openai/gpt-oss-120b',
                temperature: 0.1,
                max_tokens: 100,
            });
            
            const response = completion.choices[0]?.message?.content || 'No response generated';
            
            res.json({
                success: true,
                result: response,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            res.json({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
        return;
    }
    
    // Default response
    res.status(404).json({ error: 'Not found' });
}
