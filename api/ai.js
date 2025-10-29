// Vercel serverless function for /api/ai
import Groq from 'groq-sdk';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method === 'POST') {
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
    
    return res.status(405).json({ error: 'Method not allowed' });
}
