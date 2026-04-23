
const { enhancedChatbotResponse } = require('./src/ai/flows/use-tools-to-enhance-responses');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function test() {
    console.log("Testing enhancedChatbotResponse...");
    try {
        const result = await enhancedChatbotResponse({
            query: "Hello",
            accessToken: "dummy",
            provider: "google"
        });
        console.log("Result:", result);
    } catch (err) {
        console.error("Error:", err);
    }
}

test();
