import readline from 'node:readline/promises'
import 'dotenv/config';
import Groq from 'groq-sdk';
import { tavily } from '@tavily/core';

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({apikey: process.env.GROQ_API_KEY});

async function main() {

    const rl = readline.createInterface({input: process.stdin, output: process.stdout});

    const messages = [
    {
        role: 'system',
        content: `you are an ai assisatent who give impressive answers to questions.
        only give answers in a line line without any other explanations.
        current date and time is: ${new Date().toUTCString()}`,

    },
        // {
        //     role: 'user',
        //     content: 'what is the current whether in mumbai?',
        // },
    ];

    while (true) {
        const questions = await rl.question('You: ');
        if(questions === 'exit'){
            break;
        }
        messages.push({
            role: 'user',
            content: questions,
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
        console.log(`assistant: ${complitions.choices[0].message.content}`)
        break;
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
rl.close();
}

main();

async function webSearch({ query }) {
    console.log("tool is running...");

    const response = await tvly.search(query);

    // console.log(response);
    const finalResult = response.results.map((result) => result.content).join("/n/n");
    // console.log("finalresult:", finalResult)
    
    return finalResult;
}



console.log("script executed successfully! :)");