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
    
    // In Vercel, req.url might be just the path after /api/ or the full path
    // Let's handle both cases
    let path = req.url || '';
    
    // Remove query string if present
    const pathWithoutQuery = path.split('?')[0];
    
    // Normalize path - remove leading slash if present
    const normalizedPath = pathWithoutQuery.startsWith('/') ? pathWithoutQuery.slice(1) : pathWithoutQuery;
    
    // Handle different path formats
    const isTestPath = normalizedPath === 'test' || normalizedPath === 'api/test' || pathWithoutQuery === '/api/test' || pathWithoutQuery === '/test';
    const isAiPath = normalizedPath === 'ai' || normalizedPath === 'api/ai' || pathWithoutQuery === '/api/ai' || pathWithoutQuery === '/ai';
    const isDebugPath = normalizedPath === 'debug-ai' || normalizedPath === 'api/debug-ai' || pathWithoutQuery === '/api/debug-ai' || pathWithoutQuery === '/debug-ai';
    
    console.log('Vercel Request:', { 
        method: req.method, 
        url: req.url, 
        path: pathWithoutQuery,
        normalizedPath,
        isTestPath,
        isAiPath,
        isDebugPath
    });
    
    // Handle test requests
    if (req.method === 'GET' && isTestPath) {
        return res.json({
            status: 'ok',
            environment: process.env.NODE_ENV || 'development',
            hasGroqKey: !!process.env.GROQ_API_KEY,
            groqKeyLength: process.env.GROQ_API_KEY?.length || 0,
            isVercel: !!process.env.VERCEL,
            timestamp: new Date().toISOString(),
            debug: {
                url: req.url,
                path: pathWithoutQuery,
                normalizedPath
            }
        });
    }
    
    // Handle AI requests
    if (req.method === 'POST' && isAiPath) {
        try {
            const { message, sessionId = 'default' } = req.body || {};
            
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
            
            return res.json({ reply: response });
            
        } catch (error) {
            console.error('Error calling AI:', error);
            return res.status(500).json({ 
                reply: "I'm experiencing technical difficulties. Please try again in a moment." 
            });
        }
    }
    
    // Handle debug AI requests
    if (req.method === 'GET' && isDebugPath) {
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
            
            return res.json({
                success: true,
                result: response,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            return res.json({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    // Default response with debug info
    return res.status(404).json({ 
        error: 'Not found',
        debug: {
            method: req.method,
            url: req.url,
            path: pathWithoutQuery,
            normalizedPath,
            headers: req.headers
        }
    });
}