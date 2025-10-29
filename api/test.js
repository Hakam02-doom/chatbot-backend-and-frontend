// Vercel serverless function for /api/test
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method === 'GET') {
        return res.json({
            status: 'ok',
            environment: process.env.NODE_ENV || 'development',
            hasGroqKey: !!process.env.GROQ_API_KEY,
            groqKeyLength: process.env.GROQ_API_KEY?.length || 0,
            isVercel: !!process.env.VERCEL,
            timestamp: new Date().toISOString()
        });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}
