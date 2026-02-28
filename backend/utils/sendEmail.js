const nodemailer = require("nodemailer");
const dns = require("dns");

/**
 * Send an email using Nodemailer
 * @param {Object} options - Email options (email, subject, message, html)
 */
const sendEmail = async (options) => {
    try {
        const isGmail = (process.env.SMTP_HOST || "smtp.gmail.com").includes("gmail.com");
        const port = parseInt(process.env.SMTP_PORT) || 587;

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: port,
            secure: port === 465, // true for 465, false for other ports (like 587)
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            // Force IPv4 by resolving the hostname explicitly
            lookup: (hostname, options, callback) => {
                dns.lookup(hostname, { family: 4 }, callback);
            },
            // For port 587 (STARTTLS)
            requireTLS: port === 587,
            connectionTimeout: 20000,
            greetingTimeout: 20000,
            socketTimeout: 20000,
            tls: {
                rejectUnauthorized: false,
                minVersion: "TLSv1.2"
            }
        });

        // Verify connection configuration
        await transporter.verify();

        const message = {
            from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        const info = await transporter.sendMail(message);

        console.log("Email sent successfully: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("EMAIL ERROR DETAILS:", error.stack);
        throw new Error(`SMTP Error: ${error.message}${error.code ? ' (Code: ' + error.code + ')' : ''}`);
    }
};

module.exports = sendEmail;
