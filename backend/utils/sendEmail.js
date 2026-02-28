const nodemailer = require("nodemailer");
const dns = require("dns");

/**
 * Send an email using Nodemailer
 * @param {Object} options - Email options (email, subject, message, html)
 */
const sendEmail = async (options) => {
    try {
        const hostname = process.env.SMTP_HOST || "smtp.gmail.com";
        const port = parseInt(process.env.SMTP_PORT) || 587;

        // --- ULTIMATE FIX FOR RENDER ENETUNREACH (IPv6) ---
        // Manually resolve to IPv4 address to bypass Render's broken IPv6 routing
        let finalHost = hostname;
        try {
            const addresses = await dns.promises.resolve4(hostname);
            if (addresses && addresses.length > 0) {
                finalHost = addresses[0];
                console.log(`RENDER FIX: Resolved ${hostname} to IPv4: ${finalHost}`);
            }
        } catch (dnsErr) {
            console.warn("DNS Resolve4 failed, falling back to hostname:", dnsErr.message);
        }

        const transporter = nodemailer.createTransport({
            host: finalHost,
            port: port,
            secure: port === 465, // true for 465, false for 587
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false,
                servername: hostname, // Required when using IP address as host
                minVersion: "TLSv1.2"
            },
            connectionTimeout: 20000,
            greetingTimeout: 20000,
            socketTimeout: 20000,
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
        console.error("CRITICAL EMAIL ERROR:", error.stack);
        throw new Error(`SMTP Error: ${error.message}${error.code ? ' (Code: ' + error.code + ')' : ''}`);
    }
};

module.exports = sendEmail;
