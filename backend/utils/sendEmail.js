const nodemailer = require("nodemailer");

/**
 * Email Service - Works with Gmail & SendGrid
 * Render deployment ke liye optimized with fallback
 */
const sendEmail = async (options) => {
    const LOG_ID = "[EMAIL_SERVICE]";
    
    // Check if we should use SendGrid Web API (bypasses SMTP blocks on Render)
    const useSendGridAPI = process.env.SENDGRID_API_KEY;
    
    if (useSendGridAPI) {
        return sendViaSendGridAPI(options, LOG_ID);
    }
    
    // Fallback to SMTP
    return sendViaSMTP(options, LOG_ID);
};

// SendGrid Web API - Works on Render Free Tier!
const sendViaSendGridAPI = async (options, LOG_ID) => {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
    
    console.log(`${LOG_ID} Sending via SendGrid Web API to ${options.email}`);
    
    try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                personalizations: [{
                    to: [{ email: options.email }]
                }],
                from: { 
                    email: fromEmail,
                    name: process.env.FROM_NAME || 'TPO Portal'
                },
                subject: options.subject,
                content: [
                    { type: 'text/plain', value: options.message },
                    { type: 'text/html', value: options.html }
                ]
            })
        });
        
        if (response.ok) {
            console.log(`${LOG_ID} Email sent successfully via SendGrid API!`);
            return { messageId: 'sendgrid-api-' + Date.now() };
        } else {
            const error = await response.text();
            throw new Error(`SendGrid API Error: ${error}`);
        }
    } catch (error) {
        console.error(`${LOG_ID} SendGrid API failed:`, error.message);
        // Fallback to SMTP
        return sendViaSMTP(options, LOG_ID);
    }
};

// SMTP Fallback
const sendViaSMTP = async (options, LOG_ID) => {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT) || 587;
    const secure = port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    console.log(`${LOG_ID} Sending via SMTP to ${options.email} via ${host}:${port}`);

    try {
        const transporter = nodemailer.createTransport({
            host: host,
            port: port,
            secure: secure,
            auth: { user, pass },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 10000,
            greetingTimeout: 10000
        });

        const mailOptions = {
            from: `"${process.env.FROM_NAME || 'TPO Portal'}" <${user}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`${LOG_ID} Email sent via SMTP! MessageId: ${result.messageId}`);
        return result;

    } catch (error) {
        console.error(`${LOG_ID} SMTP failed:`, error.message);
        throw new Error(`Email sending failed: ${error.message}`);
    }
};

module.exports = sendEmail;
