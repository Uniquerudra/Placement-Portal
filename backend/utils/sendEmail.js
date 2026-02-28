const nodemailer = require("nodemailer");
const dns = require("dns").promises;

/**
 * v11: ULTIMATUM SMTP FIX for Render
 * Aggressively tries to bypass DNS and Port blocks
 */
const sendEmail = async (options) => {
    const LOG_ID = "[v11_ULTIMATUM]";
    const host = "smtp.gmail.com";
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    try {
        console.log(`${LOG_ID} Starting email dispatch to ${options.email}...`);

        // Force IPv4 Resolution to avoid Render's flaky IPv6
        let targetIp = host;
        try {
            const addrs = await dns.resolve4(host);
            if (addrs.length > 0) targetIp = addrs[0];
            console.log(`${LOG_ID} DNS Resolved ${host} -> ${targetIp}`);
        } catch (e) {
            console.warn(`${LOG_ID} DNS Fallback to hostname`);
        }

        // Try Port 587 FIRST (Usually works better on Render Free Tier)
        console.log(`${LOG_ID} Attempting Port 587 (STARTTLS)...`);

        const transporter = nodemailer.createTransport({
            host: targetIp,
            port: 587,
            secure: false, // TLS
            auth: { user, pass },
            tls: {
                rejectUnauthorized: false,
                servername: host
            },
            connectionTimeout: 20000,
            greetingTimeout: 20000
        });

        const mailOptions = {
            from: `"${process.env.FROM_NAME || 'TPO Portal'}" <${user}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`${LOG_ID} SUCCESS on Port 587!`);
        return result;

    } catch (error) {
        console.error(`${LOG_ID} Port 587 Failed:`, error.message);

        // LAST RESORT: Try Port 465
        console.log(`${LOG_ID} FALLBACK: Attempting Port 465 (SSL)...`);
        try {
            const backupTransporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: { user, pass },
                tls: { rejectUnauthorized: false },
                connectionTimeout: 20000
            });
            const info = await backupTransporter.sendMail({
                from: user,
                to: options.email,
                subject: options.subject,
                html: options.html
            });
            console.log(`${LOG_ID} FALLBACK SUCCESS on Port 465!`);
            return info;
        } catch (backupErr) {
            console.error(`${LOG_ID} ALL CHANNELS BLOCKED:`, backupErr.message);
            throw new Error(`Email Critical Failure: ${backupErr.message}`);
        }
    }
};

module.exports = sendEmail;
