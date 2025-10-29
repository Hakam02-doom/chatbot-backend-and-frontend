// Simple chatbot for Vercel deployment
import Groq from 'groq-sdk';

export async function generate(userMessage, sessionId = 'default_session') {
    console.log('🤖 Simple chatbot called with:', { userMessage, sessionId });
    
    // Check environment variables
    const hasGroqKey = !!process.env.GROQ_API_KEY;
    console.log('Environment check:', {
        hasGroqKey,
        groqKeyLength: process.env.GROQ_API_KEY?.length || 0,
        nodeEnv: process.env.NODE_ENV,
        isVercel: !!process.env.VERCEL
    });
    
    if (!hasGroqKey) {
        console.error('❌ No GROQ_API_KEY found');
        return "I'm currently experiencing technical difficulties. Please check that the API key is properly configured in the environment variables.";
    }
    
    try {
        // Initialize Groq client
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
        
        console.log('✅ Groq client initialized successfully');
        
        // Make API call
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: userMessage,
                },
            ],
            model: 'openai/gpt-oss-120b',
            temperature: 0.1,
            max_tokens: 1000,
        });
        
        const response = completion.choices[0]?.message?.content || 'No response generated';
        console.log('✅ AI response generated:', response.substring(0, 100) + '...');
        
        return response;
        
    } catch (error) {
        console.error('❌ Error calling Groq API:', error);
        return `I'm experiencing technical difficulties. Error: ${error.message}`;
    }
}
