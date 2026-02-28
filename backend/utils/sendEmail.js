const nodemailer = require("nodemailer");
const dns = require("dns");

// ☢️ NUCLEAR FIX: Force Node to prefer IPv4 for EVERYTHING in this process.
// This is required because Render's networking stack often breaks on IPv6 attempts.
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

/**
 * Send an email using Nodemailer
 * @param {Object} options - Email options (email, subject, message, html)
 */
const sendEmail = async (options) => {
    // Unique ID for the current build/fix to verify logs on Render
    const LOG_PREFIX = "[v5_NUCLEAR_IPV4_GMAIL_587]";

    try {
        console.log(`${LOG_PREFIX} ATTEMPTING EMAIL TO:`, options.email);

        // We use port 587 with secure: false (it will use STARTTLS)
        // This is generally more reliable on shared cloud networks like Render.
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for 587
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            // Double force IPv4 at the socket level too
            family: 4,
            tls: {
                // Do not fail on invalid certs (common on cloud relays)
                rejectUnauthorized: false,
                minVersion: "TLSv1.2"
            }
        });

        const message = {
            from: `"${process.env.FROM_NAME || 'TPO Portal'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        const info = await transporter.sendMail(message);
        console.log(`${LOG_PREFIX} SUCCESS! MessageId:`, info.messageId);
        return info;
    } catch (error) {
        console.error(`${LOG_PREFIX} CRITICAL_FAILURE:`, error.stack);
        // Throw a helpful error that the frontend can display
        throw new Error(`Email could not be sent: ${error.message} (${error.code || 'NO_CODE'})`);
    }
};

module.exports = sendEmail;
