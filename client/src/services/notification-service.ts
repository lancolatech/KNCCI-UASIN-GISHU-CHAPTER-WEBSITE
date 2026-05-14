import axios from 'axios';

const UNIFLOW_BASE_URL = 'https://smsapi.solby.io:8443';
const UNIFLOW_API_KEY = 'nk_620355bdeed18eb27ad9160e268e1bc5c87b4d64bd1f309917cd88a434748f27';

export interface NotificationPayload {
    to: string;
    type: 'sms' | 'email';
    message: string;
    subject?: string;
}

export const notificationService = {
    async sendNotification(payload: NotificationPayload) {
        const url = `${UNIFLOW_BASE_URL}/notifications/send?apikey=${UNIFLOW_API_KEY}`;
        
        const data: any = {
            type: payload.type,
            to: payload.to,
            message: payload.message,
            attachments: []
        };

        if (payload.type === 'email' && payload.subject) {
            data.subject = payload.subject;
        }

        try {
            const response = await axios.post(url, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Failed to send ${payload.type} to ${payload.to}:`, error);
            throw error;
        }
    },

    async sendWelcomeSms(name: string, company: string, phone: string) {
        const message = `Hello ${name}, your membership application for ${company} has been received. Our team is reviewing it and will update you shortly. Thank you for choosing KNCCI UG Chapter.`;
        return this.sendNotification({
            to: phone,
            type: 'sms',
            message
        });
    },

    async sendWelcomeEmail(name: string, company: string, email: string) {
        const subject = 'Application Received — KNCCI Membership';
        const htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #ffffff; }
        .header { text-align: center; border-bottom: 2px solid #eb2835; padding-bottom: 15px; }
        .logo { max-width: 160px; height: auto; margin-bottom: 10px; }
        .content { padding: 20px 0; }
        .footer { font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 10px; text-align: center; }
        .btn { display: inline-block; padding: 10px 20px; background-color: #eb2835; color: #ffffff !important; text-decoration: none; border-radius: 5px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://solby.sfo3.digitaloceanspaces.com/1772607254140-UG_chapter_logo-removebg-preview.png" alt="KNCCI Logo" class="logo">
            <h2 style="color: #eb2835; margin: 10px 0 0 0;">Application Received</h2>
        </div>
        <div class="content">
            <p>Dear <strong>${name}</strong>,</p>
            <p>Thank you for applying for membership with the <strong>Kenya National Chamber of Commerce & Industry (KNCCI)</strong> for your business, <strong>${company}</strong>.</p>
            <p>Our team is currently reviewing your details. This process typically takes 1–2 business days. We will notify you once your application has been processed.</p>
            <p>In the meantime, feel free to explore our portal to learn more about upcoming events and member benefits.</p>
            <p style="text-align: center;"><a href="https://kncci.the-cube.co.ke/" class="btn">Visit Portal</a></p>
        </div>
        <div class="footer"><p>&copy; 2026 KNCCI. All rights reserved.<br>Championing Business Prosperity.</p></div>
    </div>
</body>
</html>`;

        return this.sendNotification({
            to: email,
            type: 'email',
            subject,
            message: htmlBody
        });
    },

    async sendApprovalSms(name: string, company: string, regNo: string, phone: string) {
        const message = `Big News! ${name}, your application for ${company} is APPROVED. Your Member ID is ${regNo}. Log in to your KNCCI portal to access your certificate. Welcome aboard!`;
        return this.sendNotification({
            to: phone,
            type: 'sms',
            message
        });
    },

    async sendApprovalEmail(name: string, company: string, regNo: string, plan: string, email: string, password?: string) {
        const subject = 'Welcome to the Chamber! — Application Approved';
        const loginLink = 'https://kncci.the-cube.co.ke/login';
        const passwordInfo = password ? `
            <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #28a745; margin: 15px 0;">
                <p><strong>Login Email:</strong> ${email}<br>
                <strong>Temporary Password:</strong> ${password}</p>
            </div>` : '';

        const htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
        .header { text-align: center; border-bottom: 2px solid #28a745; padding-bottom: 10px; }
        .content { padding: 20px 0; }
        .highlight { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #28a745; margin: 15px 0; }
        .footer { font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 10px; text-align: center; }
        .btn { display: inline-block; padding: 10px 20px; background-color: #28a745; color: #ffffff !important; text-decoration: none; border-radius: 5px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h2 style="color: #28a745;">Congratulations!</h2></div>
        <div class="content">
            <p>Dear <strong>${name}</strong>,</p>
            <p>We are delighted to inform you that your membership application for <strong>${company}</strong> has been <strong>APPROVED</strong>.</p>
            <div class="highlight">
                <p><strong>Member ID:</strong> ${regNo}<br>
                <strong>Tier:</strong> ${plan} Membership</p>
            </div>
            ${passwordInfo}
            <p>You now have full access to our business networking events, policy advocacy sessions, and trade missions. Please log in to your dashboard to download your Membership Certificate and start enjoying your benefits.</p>
            <p style="text-align: center;"><a href="${loginLink}" class="btn">Login to Dashboard</a></p>
        </div>
        <div class="footer"><p>&copy; 2026 KNCCI. All rights reserved.<br>Empowering the Voice of Business.</p></div>
    </div>
</body>
</html>`;

        return this.sendNotification({
            to: email,
            type: 'email',
            subject,
            message: htmlBody
        });
    }
};
