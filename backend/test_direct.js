const sendEmail = require("./utils/sendEmail");
require("dotenv").config();

async function runTest() {
    console.log("Direct test starting...");
    try {
        const info = await sendEmail({
            email: process.env.SMTP_USER,
            subject: "Direct Logic Test",
            message: "This tests the actual utils/sendEmail.js logic directly.",
            html: "<b>Direct logic test!</b>"
        });
        console.log("SUCCESS:", info);
    } catch (err) {
        console.error("FAIL:", err.message);
        if (err.stack) console.error(err.stack);
    }
}

runTest();
