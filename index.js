require('dotenv').config();
const readline = require('readline');
const { OpenAI } = require('openai');

// Initialize OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Setup CLI
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

runChatAgent(rl);

function runChatAgent(rl) {
    rl.setPrompt('You: ');
    rl.prompt();

    rl.on('line', async (input) => {
        const response = await askOpenAI(input);

        try {
            const data = JSON.parse(response);
            console.log(`Extracted ➤ num1 = ${data.num1}, num2 = ${data.num2}, result = ${data.result}`);
        } catch (e) {
            console.log('Could not parse response as JSON:', response);
        }

        rl.prompt();
    });
}

async function askOpenAI(message) {
    try {
        const chatCompletion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: `
You are a JSON-only assistant.

When the user asks a multiplication question (like "what is 5 x 7" or "multiply 3 by 4"),
respond ONLY with valid JSON in this format:

{
  "num1": 5,
  "num2": 7,
  "operation": "multiply",
  "result": 35
}

❗Do not include any text before or after the JSON.
❗Do not explain. Just return the JSON.
          `.trim()
                },
                { role: 'user', content: message }
            ],
            temperature: 0  // ensures consistent formatting
        });

        return chatCompletion.choices[0].message.content.trim();
    } catch (err) {
        return 'Error communicating with OpenAI: ' + err.message;
    }
}
