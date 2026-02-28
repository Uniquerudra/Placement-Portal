const nodemailer = require("nodemailer");

/**
 * Email Service - Supports Gmail & SendGrid
 * Render deployment ke liye optimized
 */
const sendEmail = async (options) => {
    const LOG_ID = "[EMAIL_SERVICE]";
    
    // Check if using SendGrid (recommended for Render)
    const isSendGrid = process.env.SMTP_HOST && process.env.SMTP_HOST.includes('sendgrid');
    
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT) || (isSendGrid ? 587 : 465);
    const secure = isSendGrid ? false : (port === 465);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    console.log(`${LOG_ID} Starting email to ${options.email} via ${host}:${port}`);

    try {
        const transporter = nodemailer.createTransport({
            host: host,
            port: port,
            secure: secure,
            auth: { 
                user: user, 
                pass: pass 
            },
            tls: {
                rejectUnauthorized: false
            },
            connectionTimeout: 30000,
            greetingTimeout: 30000,
            socketTimeout: 30000
        });

        const mailOptions = {
            from: `"${process.env.FROM_NAME || 'TPO Portal'}" <${user}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`${LOG_ID} Email sent successfully! MessageId: ${result.messageId}`);
        return result;

    } catch (error) {
        console.error(`${LOG_ID} Email failed:`, error.message);
        throw new Error(`Email sending failed: ${error.message}`);
    }
};

module.exports = sendEmail;
