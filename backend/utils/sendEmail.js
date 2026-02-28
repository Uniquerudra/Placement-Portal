const nodemailer = require("nodemailer");
const dns = require("dns").promises;

/**
 * Send an email using Nodemailer
 * ⚛️ ATOMIC FIX FOR RENDER: 
 * 1. Manually resolve 'smtp.gmail.com' to an IPv4 address to bypass Render's broken IPv6 stack.
 * 2. Use Port 465 (SSL) which is generally more stable than 587 on cloud proxies.
 */
const sendEmail = async (options) => {
    const LOG_ID = "[v6_ATOMIC_IP_SSL_465]";

    try {
        console.log(`${LOG_ID} Resolving smtp.gmail.com...`);

        let targetHost = "smtp.gmail.com";
        try {
            // Force resolve to IPv4
            const addresses = await dns.resolve4("smtp.gmail.com");
            if (addresses && addresses.length > 0) {
                targetHost = addresses[0];
                console.log(`${LOG_ID} Resolved to IPv4:`, targetHost);
            }
        } catch (dnsErr) {
            console.warn(`${LOG_ID} DNS Resolve failed, falling back to hostname:`, dnsErr.message);
        }

        const transporter = nodemailer.createTransport({
            host: targetHost,
            port: 465,
            secure: true, // Use SSL
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                servername: "smtp.gmail.com",
                rejectUnauthorized: false
            },
            connectionTimeout: 30000, // 30 seconds
            greetingTimeout: 30000,
            socketTimeout: 30000
        });

        const message = {
            from: `"${process.env.FROM_NAME || 'TPO Portal'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        console.log(`${LOG_ID} Sending email to ${options.email} via ${targetHost}:465...`);
        const info = await transporter.sendMail(message);
        console.log(`${LOG_ID} SUCCESS! MessageId:`, info.messageId);
        return info;
    } catch (error) {
        console.error(`${LOG_ID} ERROR:`, error);
        throw new Error(`Email Error: ${error.message} (Code: ${error.code || 'N/A'})`);
    }
};

module.exports = sendEmail;
