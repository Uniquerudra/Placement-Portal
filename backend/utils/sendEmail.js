const nodemailer = require("nodemailer");
const dns = require("dns");

/**
 * Send an email using Nodemailer
 * @param {Object} options - Email options (email, subject, message, html)
 */
const sendEmail = async (options) => {
    try {
        // Unique ID for this build (to verify Render logs)
        const DEPLOY_ID = "v3_FINAL_FIX_DNS_4_PORT_465";
        console.log(`[${DEPLOY_ID}] ATTEMPTING EMAIL TO:`, options.email);

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465, // SSL: This is often more stable than 587 on Render
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            // FORCE IPv4: This is the only way to stop Render from using their broken IPv6 routes
            lookup: (hostname, dnsOptions, callback) => {
                dns.lookup(hostname, { family: 4 }, (err, address, family) => {
                    if (err) return callback(err);
                    console.log(`[${DEPLOY_ID}] DNS RESOLVED ${hostname} to ${address}`);
                    callback(null, address, family);
                });
            },
            connectionTimeout: 20000,
            greetingTimeout: 20000,
            socketTimeout: 20000,
        });

        const message = {
            from: `${process.env.FROM_NAME || 'TPO Portal'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        const info = await transporter.sendMail(message);
        console.log(`[${DEPLOY_ID}] SUCCESS! Message ID:`, info.messageId);
        return info;
    } catch (error) {
        console.error("DEBUG ERROR STACK:", error.stack);
        throw new Error(`Email Error: ${error.message} (${error.code || 'UNKNOWN_CODE'})`);
    }
};

module.exports = sendEmail;
