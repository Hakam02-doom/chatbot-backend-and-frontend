import readline from 'node:readline/promises'
import 'dotenv/config';
import Groq from 'groq-sdk';
import { tavily } from '@tavily/core';
import { cacheService } from './cacheService.js';
import { conversationMemory } from './conversationMemory.js';

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({apikey: process.env.GROQ_API_KEY});
export async function generate(userMessage, sessionId = 'default_session') {
    // Get conversation history
    const conversationHistory = conversationMemory.getConversationContext(sessionId);
    
    // Add user message to conversation history
    conversationMemory.addMessage(sessionId, 'user', userMessage);
    
    // Create a conversation key for caching (includes recent context)
    const recentContext = conversationHistory.slice(-3).map(msg => `${msg.role}: ${msg.content}`).join(' | ');
    const conversationKey = `${sessionId}_${recentContext}_${userMessage}`;
    
    // Check cache with conversation context
    const cachedResponse = cacheService.get(conversationKey);
    if (cachedResponse) {
        console.log('Returning cached response with conversation context');
        conversationMemory.addMessage(sessionId, 'assistant', cachedResponse);
        return cachedResponse;
    }

    console.log('Generating new response with conversation context');
    
    // Build messages array with conversation history
    const messages = [
        {
            role: 'system',
            content: `You are an advanced AI assistant designed to provide helpful, accurate, and engaging responses. Your capabilities include:

CORE BEHAVIOR:
- Provide clear, concise, and well-structured answers
- Use a friendly and professional tone
- Be helpful, informative, and engaging
- Admit when you don't know something rather than guessing
- Ask clarifying questions when needed for better assistance
- REMEMBER previous conversation context and refer to it when relevant

RESPONSE GUIDELINES:
- Keep responses focused and relevant to the user's question
- Use simple, clear language without any markdown formatting
- NO bold text, italics, or special formatting - just plain text
- Use simple line breaks for paragraphs instead of markdown
- Include examples or analogies when they help explain complex concepts
- Be conversational but informative
- Avoid unnecessary repetition or verbose explanations
- NEVER use prefixes like "This is a reply to your message:" or similar phrases
- Respond directly and naturally as if in a normal conversation
- REMEMBER and reference previous parts of the conversation when relevant
- Write in simple English without any special formatting symbols

CURRENT CONTEXT:
- Current date and time: ${new Date().toUTCString()}
- You have access to real-time web search capabilities when needed
- You can provide up-to-date information on current events, news, and recent developments

Remember: Your goal is to be genuinely helpful while maintaining a natural, human-like conversation style with proper memory of the ongoing conversation.`,
        }
    ];

    // Add conversation history to messages
    conversationHistory.forEach(msg => {
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

    while (true) {
        const completions = await groq.chat.completions.create({
            messages: messages,
            tools: [
                {
                    "type": "function",
                    "function": {
                        "name": "webSearch",
                        "description": "you can search for information on the internet",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "query": {
                                    "type": "string",
                                    "description": "the search query to search on"
                                },
                                "unit": {
                                    "type": "string",
                                    "enum": ["celsius", "fahrenheit"]
                                }
                            },
                            "required": ["query"]
                        }
                    }
                }
            ],
            tool_choice: 'auto',
            model: "openai/gpt-oss-120b",
            temperature: 0,
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