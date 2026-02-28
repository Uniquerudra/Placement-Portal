const nodemailer = require("nodemailer");

/**
 * Atomic Hybrid Email Sender for Render/Cloud Platforms
 * Bypasses IPv6 issues and connectivity timeouts by trying multiple ports
 */
const sendEmail = async (options) => {
    const LOG_ID = "[v10_HYBRID_TLS]";

    // Use ENV vars or fallback to secure defaults
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = parseInt(process.env.SMTP_PORT) || 465;

    console.log(`${LOG_ID} Attempting email to ${options.email} via ${host}:${port}...`);

    try {
        const transporterConfigs = {
            host: host,
            port: port,
            secure: port === 465, // True for 465, false for 587
            auth: { user, pass },
            tls: {
                rejectUnauthorized: false, // Helps on cloud proxies
                servername: "smtp.gmail.com"
            },
            pool: true,
            maxConnections: 1,
            connectionTimeout: 20000, // 20s
            socketTimeout: 30000     // 30s
        };

        const transporter = nodemailer.createTransport(transporterConfigs);

        const emailDetails = {
            from: `"${process.env.FROM_NAME || 'TPO Portal'}" <${process.env.FROM_EMAIL || user}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        const info = await transporter.sendMail(emailDetails);
        console.log(`${LOG_ID} SUCCESS! MessageId:`, info.messageId);
        return info;
    } catch (error) {
        console.error(`${LOG_ID} PRIMARY ATTEMPT FAILED:`, error.message);

        // ATOMIC FALLBACK: If 465 failed, try 587 automatically
        if (port === 465) {
            console.log(`${LOG_ID} FALLBACK: Trying Port 587 (TLS)...`);
            try {
                const fallbackTransporter = nodemailer.createTransport({
                    host: host,
                    port: 587,
                    secure: false,
                    auth: { user, pass },
                    tls: { rejectUnauthorized: false }
                });
                const info = await fallbackTransporter.sendMail({
                    from: `"${process.env.FROM_NAME || 'TPO Portal'}" <${process.env.FROM_EMAIL || user}>`,
                    to: options.email,
                    subject: options.subject,
                    html: options.html
                });
                console.log(`${LOG_ID} FALLBACK SUCCESS!`);
                return info;
            } catch (fallbackErr) {
                console.error(`${LOG_ID} FALLBACK FAILED:`, fallbackErr.message);
                throw new Error(`Email SMTP Error: Both ports 465/587 failed. Details: ${fallbackErr.message}`);
            }
        }

        throw new Error(`Email Error: ${error.message}`);
    }
};

module.exports = sendEmail;
