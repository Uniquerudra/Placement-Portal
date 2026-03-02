const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmailDiagnostic = async () => {
    console.log("Starting diagnostic...");
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT) || 587;
    const secure = port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    console.log(`Config: host=${host}, port=${port}, secure=${secure}, user=${user}`);

    if (!user || !pass) {
        console.error("Missing SMTP_USER or SMTP_PASS in .env");
        process.exit(1);
    }

    try {
        const transporter = nodemailer.createTransport({
            host: host,
            port: port,
            secure: secure,
            auth: { user, pass },
            tls: { rejectUnauthorized: false }
        });

        console.log("Verifying transporter...");
        await transporter.verify();
        console.log("Transporter verified successfully!");

        const mailOptions = {
            from: `"Diagnostic Test" <${user}>`,
            to: user, // Send to self
            subject: "Diagnostic Test Email",
            text: "This is a test email from the diagnostic script.",
        };

        console.log(`Sending test email to ${user}...`);
        const result = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!");
        console.log("MessageId:", result.messageId);
        console.log("Response:", result.response);
    } catch (error) {
        console.error("DIAGNOSTIC FAILED:");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        console.error("Error Code:", error.code);
        console.error("Stack:", error.stack);
    }
};

sendEmailDiagnostic();
