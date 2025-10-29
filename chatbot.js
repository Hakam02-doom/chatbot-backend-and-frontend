import readline from 'node:readline/promises'
import Groq from 'groq-sdk';
import { tavily } from '@tavily/core';
import { cacheService } from './cacheService.js';
import { conversationMemory } from './conversationMemory.js';

// Load dotenv only in local development (Vercel provides env vars automatically)
// Using dynamic import to avoid top-level await issues
(async () => {
    if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
        try {
            await import('dotenv/config');
        } catch (e) {
            // dotenv not available, that's fine
        }
    }
})();

// Initialize with fallback handling
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY || 'fallback' });
let groq;

try {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
} catch (error) {
    console.error('Failed to initialize Groq client:', error);
    groq = null;
}
export async function generate(userMessage, sessionId = 'default_session') {
    // Check if API key is available and groq client is initialized
    if (!process.env.GROQ_API_KEY || !groq) {
        console.error('❌ GROQ_API_KEY not found or Groq client not initialized');
        console.error('Environment check:', {
            NODE_ENV: process.env.NODE_ENV,
            VERCEL: process.env.VERCEL,
            hasGroqKey: !!process.env.GROQ_API_KEY,
            groqKeyLength: process.env.GROQ_API_KEY?.length || 0,
            groqClientInitialized: !!groq
        });
        return "I'm currently experiencing technical difficulties. Please check that the API key is properly configured in the environment variables.";
    }
    
    console.log('✅ GROQ_API_KEY found, length:', process.env.GROQ_API_KEY.length);
    
    // Get conversation history
    const conversationHistory = conversationMemory.getConversationContext(sessionId);
    
    // Add user message to conversation history
    conversationMemory.addMessage(sessionId, 'user', userMessage);
    
    // Limit conversation history to prevent token overflow (keep last 10 messages max)
    const limitedHistory = conversationHistory.slice(-10);
    
    // Create a conversation key for caching (includes recent context)
    const recentContext = limitedHistory.slice(-3).map(msg => `${msg.role}: ${msg.content}`).join(' | ');
    const conversationKey = `${sessionId}_${recentContext}_${userMessage}`;
    
    // Check cache with conversation context
    const cachedResponse = cacheService.get(conversationKey);
    if (cachedResponse) {
        console.log('Returning cached response with conversation context');
        conversationMemory.addMessage(sessionId, 'assistant', cachedResponse);
        return cachedResponse;
    }

    console.log('Generating new response with conversation context');
    
    // Build messages array with limited conversation history
    const messages = [
        {
            role: 'system',
            content: `You are a helpful AI assistant. Provide clear, concise answers in simple English without markdown formatting. Be friendly and professional. Current time: ${new Date().toUTCString()}`,
        }
    ];

    // Add limited conversation history to messages
    limitedHistory.forEach(msg => {
        messages.push({
            role: msg.role,
            content: msg.content
        });
    });

    // Add current user message
    messages.push({
        role: 'user',
        content: userMessage,
    });

    // Retry logic for rate limits
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
        try {
            const completions = await groq.chat.completions.create({
                messages: messages,
                tools: [
                    {
                        "type": "function",
                        "function": {
                            "name": "webSearch",
                            "description": "Search for information on the internet",
                            "parameters": {
                                "type": "object",
                                "properties": {
                                    "query": {
                                        "type": "string",
                                        "description": "The search query"
                                    }
                                },
                                "required": ["query"]
                            }
                        }
                    }
                ],
                tool_choice: 'auto',
                model: "openai/gpt-oss-120b", // OpenAI OSS model
                temperature: 0.1,
                max_tokens: 1000, // Limit response length
            });

            messages.push(completions.choices[0].message);

            const toolCalls = completions.choices[0].message.tool_calls;
            if (!toolCalls) {
                let response = completions.choices[0].message.content;
                
                // Remove markdown formatting
                response = response
                    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold **text**
                    .replace(/\*(.*?)\*/g, '$1') // Remove italic *text*
                    .replace(/`(.*?)`/g, '$1') // Remove code `text`
                    .replace(/#{1,6}\s*/g, '') // Remove headers
                    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
                    .replace(/\n\s*\n/g, '\n\n') // Clean up multiple line breaks
                    .trim();
                
                // Add assistant response to conversation history
                conversationMemory.addMessage(sessionId, 'assistant', response);
                // Cache the response with conversation context
                cacheService.set(conversationKey, response);
                return response;
            }

            for (const tool of toolCalls) {
                const functionName = tool.function.name;
                const parameters = tool.function.arguments;

                if (functionName === "webSearch") {
                    const toolResult = await webSearch(JSON.parse(parameters));

                    messages.push({
                        tool_call_id: tool.id,
                        role: 'tool',
                        name: functionName,
                        content: toolResult,
                    });
                }
            }
            
            // If we get here, we successfully processed the request
            break;
            
        } catch (error) {
            console.error('Error calling AI:', error);
            console.error('Error details:', {
                status: error.status,
                message: error.message,
                code: error.code
            });
            
            // Handle rate limiting specifically
            if (error.status === 429 || error.status === 413) {
                retryCount++;
                if (retryCount < maxRetries) {
                    const waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
                    console.log(`Rate limited. Retrying in ${waitTime}ms (attempt ${retryCount}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue;
                } else {
                    // Return a user-friendly error message
                    const errorMessage = "I'm experiencing high demand right now. Please try again in a moment.";
                    conversationMemory.addMessage(sessionId, 'assistant', errorMessage);
                    return errorMessage;
                }
            } else {
                // For other errors, return a generic message
                const errorMessage = "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.";
                conversationMemory.addMessage(sessionId, 'assistant', errorMessage);
                return errorMessage;
            }
        }
    }
}


async function webSearch({ query }) {
    console.log("tool is running...");

    const response = await tvly.search(query);

    // console.log(response);
    const finalResult = response.results.map((result) => result.content).join("/n/n");
    // console.log("finalresult:", finalResult)
    
    return finalResult;
}



console.log("script executed successfully! :)");