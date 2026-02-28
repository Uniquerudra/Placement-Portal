const nodemailer = require("nodemailer");
const dns = require("dns");

// GLOBAL FIX: Force IPv4 for the entire process (Node 17+)
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

/**
 * Send an email using Nodemailer
 * @param {Object} options - Email options (email, subject, message, html)
 */
const sendEmail = async (options) => {
    const DEPLOY_MARKER = "v4_ATOMIC_IPV4_FIX";
    try {
        console.log(`[${DEPLOY_MARKER}] STARTING:`, options.email);

        // 1. Manually resolve to IPv4 strings
        let targetHost = "smtp.gmail.com";
        try {
            const ipv4s = await dns.promises.resolve4("smtp.gmail.com");
            if (ipv4s && ipv4s.length > 0) {
                targetHost = ipv4s[0]; // Use the first IPv4 address (e.g., "74.125.143.108")
                console.log(`[${DEPLOY_MARKER}] DNS_RESOLVED: ${targetHost}`);
            }
        } catch (dnsErr) {
            console.error(`[${DEPLOY_MARKER}] DNS_ERROR (using default):`, dnsErr.message);
        }

        // 2. Create transport using the literal IP address
        const transporter = nodemailer.createTransport({
            host: targetHost,
            port: 465, // SSL
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false,
                servername: "smtp.gmail.com", // Essential when using IP as host
            },
            family: 4, // Strict IPv4 for the socket
            connectionTimeout: 10000,
            greetingTimeout: 10000,
        });

        // 3. Verify connection
        console.log(`[${DEPLOY_MARKER}] Verifying SMTP...`);
        await transporter.verify();
        console.log(`[${DEPLOY_MARKER}] SMTP_READY`);

        const message = {
            from: `"${process.env.FROM_NAME || 'TPO Portal'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        const info = await transporter.sendMail(message);
        console.log(`[${DEPLOY_MARKER}] SUCCESS! ID:`, info.messageId);
        return info;
    } catch (error) {
        console.error(`[${DEPLOY_MARKER}] CRITICAL_FAIL:`, error.stack);
        // Throwing a very distinct error message
        throw new Error(`SMTP_v4_FAILED: ${error.message}`);
    }
};

module.exports = sendEmail;
