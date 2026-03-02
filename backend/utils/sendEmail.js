const nodemailer = require("nodemailer");

/**
 * Email Service - Optimized for Render
 */
const sendEmail = async (options) => {
    const LOG_ID = "[EMAIL_SERVICE]";

    // Normalize options
    const toEmail = options.email?.toLowerCase().trim();
    const subject = options.subject;
    const message = options.message;
    const html = options.html;

    if (!toEmail) {
        console.error(`${LOG_ID} ERR: No recipient email provided!`);
        throw new Error("Recipient email is required");
    }

    // Check if we should use SendGrid Web API (SG API is preferred on Render)
    const sgKey = process.env.SENDGRID_API_KEY;
    const useSendGridAPI = sgKey && sgKey.trim().length > 10;

    if (useSendGridAPI) {
        try {
            console.log(`${LOG_ID} Attempting SendGrid API to ${toEmail}`);
            return await sendViaSendGridAPI({ email: toEmail, subject, message, html }, LOG_ID);
        } catch (error) {
            console.error(`${LOG_ID} SendGrid API failed, falling back to SMTP:`, error.message);
            // Fallback continues...
        }
    }

    // SMTP Path
    console.log(`${LOG_ID} Attempting SMTP to ${toEmail}`);
    return await sendViaSMTP({ email: toEmail, subject, message, html }, LOG_ID);
};

// SendGrid Web API 
const sendViaSendGridAPI = async (options, LOG_ID) => {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER || 'rudrapal9b38@gmail.com';
    const fromName = process.env.FROM_NAME || 'TPO Portal';

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
                email: fromEmail.trim(),
                name: fromName.trim()
            },
            subject: options.subject,
            content: [
                { type: 'text/plain', value: options.message },
                { type: 'text/html', value: options.html }
            ]
        })
    });

    // SendGrid returns 202 on acceptance
    if (response.status >= 200 && response.status < 300) {
        console.log(`${LOG_ID} Email successfully accepted by SendGrid (HTTP ${response.status})`);
        return { messageId: 'sendgrid-' + Date.now(), service: 'SendGrid' };
    } else {
        const errorText = await response.text();
        throw new Error(`SendGrid API Error (HTTP ${response.status}): ${errorText}`);
    }
};

// SMTP Implementation
const sendViaSMTP = async (options, LOG_ID) => {
    const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
    const port = parseInt(process.env.SMTP_PORT) || 587;
    const secure = (port === 465);
    const user = (process.env.SMTP_USER || "").trim();
    const pass = (process.env.SMTP_PASS || "").trim();

    if (!user || !pass) {
        throw new Error("SMTP credentials missing (SMTP_USER/SMTP_PASS)");
    }

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: {
            rejectUnauthorized: false,
            // STARTTLS (587) sometimes likes this
            minVersion: 'TLSv1.2'
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000
    });

    const mailOptions = {
        from: `"${(process.env.FROM_NAME || 'TPO Portal').trim()}" <${user}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log(`${LOG_ID} Email sent via SMTP! MessageId: ${result.messageId}`);
        return { ...result, service: 'SMTP' };
    } catch (error) {
        console.error(`${LOG_ID} SMTP SEND ERROR:`, error.message);
        throw new Error(`SMTP Transport failed: ${error.message}`);
    }
};

module.exports = sendEmail;

