const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const sendEmail = require("./utils/sendEmail");

const testMail = async () => {
    try {
        console.log("Testing Nodemailer...");
        console.log("SMTP_HOST:", process.env.SMTP_HOST);
        console.log("SMTP_PORT:", process.env.SMTP_PORT);
        console.log("SMTP_USER:", process.env.SMTP_USER);

        await sendEmail({
            email: process.env.SMTP_USER, // Send to self
            subject: "TPO Portal Email Test",
            message: "This is a test email from the TPO Portal backend.",
            html: "<h1>Test Successful!</h1><p>Your SMTP configuration is working correctly.</p>"
        });

        console.log("Email sent successfully! Check your inbox.");
    } catch (err) {
        console.error("Test failed!");
        console.error(err);
    }
};

testMail();
