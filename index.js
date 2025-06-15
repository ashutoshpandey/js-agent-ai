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
        console.log('Agent:', response);

        const extracted = extractMultiplicationParts(response);
        if (extracted) {
            console.log(`Extracted ➤ num1 = ${extracted.num1}, num2 = ${extracted.num2}, result = ${extracted.result}`);
        } else {
            console.log('Could not extract numbers.');
        }

        rl.prompt();
    });
}

// OpenAI Query
async function askOpenAI(message) {
    try {
        const chatCompletion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: 'You are a helpful assistant. If the user asks a multiplication question, extract the numbers and multiply them.' },
                { role: 'user', content: message }
            ],
            temperature: 0,
        });

        return chatCompletion.choices[0].message.content.trim();
    } catch (err) {
        return 'Error communicating with OpenAI: ' + err.message;
    }
}

function extractMultiplicationParts(response) {
    // Match patterns like "2 x 3 = 6" or "2 * 3 = 6"
    const match = response.match(/(\d+)\s*[\*xX]\s*(\d+)\s*=\s*(\d+)/);
    if (match) {
        const num1 = parseInt(match[1], 10);
        const num2 = parseInt(match[2], 10);
        const result = parseInt(match[3], 10);
        return { num1, num2, result };
    }
    return null;
}