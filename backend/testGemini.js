require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
        console.log("No valid API key found in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log("Listing models...");
        // The SDK doesn't have a direct listModels but we can test one
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("echo 'hello'");
        const response = await result.response;
        console.log("Success! Response:", response.text());
    } catch (err) {
        console.error("Test Failed:");
        console.error(err);
    }
}

test();
