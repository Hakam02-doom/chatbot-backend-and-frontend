import readline from 'node:readline/promises'
import 'dotenv/config';
import Groq from 'groq-sdk';
import { tavily } from '@tavily/core';

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({apikey: process.env.GROQ_API_KEY});

export async function generate(userMessage) {


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

RESPONSE GUIDELINES:
- Keep responses focused and relevant to the user's question
- Use proper formatting with paragraphs, bullet points, or numbered lists when appropriate
- Include examples or analogies when they help explain complex concepts
- Be conversational but informative
- Avoid unnecessary repetition or verbose explanations
- NEVER use prefixes like "This is a reply to your message:" or similar phrases
- Respond directly and naturally as if in a normal conversation

          CURRENT CONTEXT:
          - Current date and time: ${new Date().toUTCString()}
          - You have access to real-time web search capabilities when needed
          - You can provide up-to-date information on current events, news, and recent developments

Remember: Your goal is to be genuinely helpful while maintaining a natural, human-like conversation style.`,

    },
        // {
        //     role: 'user',
        //     content: 'what is the current whether in mumbai?',
        // },
    ];
     messages.push({
            role: 'user',
            content: userMessage,
        });
while (true){
            const complitions = await groq.chat.completions.
    create({
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
    })

    messages.push(complitions.choices[0].message)

    const toolCalls = complitions.choices[0].message.tool_calls;
    if(!toolCalls) {
        return complitions.choices[0].message.content;
    }

    for (const tool of toolCalls) {
        // console.log(`tool: ${tool}`)
        const functionName = tool.function.name;
        const parameters = tool.function.arguments;

        if(functionName === "webSearch") {
            const toolResult = await webSearch(JSON.parse(parameters))
            // console.log("toolresult:", toolResult)

            messages.push({
                tool_call_id: tool.id,
                role: 'tool',
                name: functionName,
                content: toolResult,
            })
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