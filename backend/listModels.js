require("dotenv").config();
const https = require("https");

async function checkModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
        console.log("No valid API key in .env");
        return;
    }

    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models?key=${apiKey}`,
        method: 'GET'
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            if (res.statusCode === 200) {
                console.log("Available Models:");
                const json = JSON.parse(data);
                console.log(json.models.map(m => m.name).join("\n"));
            } else {
                console.error("List Models Failed:", res.statusCode, data);
            }
        });
    });

    req.on('error', (e) => {
        console.error(e.message);
    });
    req.end();
}

checkModels();
