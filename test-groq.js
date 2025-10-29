import 'dotenv/config';
import Groq from 'groq-sdk';

console.log('Testing Groq API...');
console.log('API Key:', process.env.GROQ_API_KEY ? 'Set' : 'Not set');
console.log('Key starts with:', process.env.GROQ_API_KEY?.substring(0, 10));

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

async function testGroq() {
    try {
        console.log('Making test request to Groq...');
        const completions = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: 'Hello, say hi back!',
                },
            ],
            model: 'llama-3.1-8b-instant',
            max_tokens: 100,
        });

        console.log('Success! Response:', completions.choices[0].message.content);
    } catch (error) {
        console.error('Error:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
    }
}

testGroq();
