const twilio = require('twilio');
const nodemailer = require('nodemailer');

// Twilio
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const sendSMS = async (to, body) => {
    try {
        const message = await client.messages.create({
            body,
            from: process.env.TWILIO_PHONE,
            to
        });
        return message;
    } catch (err) {
        console.error('Twilio SMS error:', err);
        throw err;
    }
};

// Email (Gmail / SMTP)
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        });
        return info;
    } catch (err) {
        console.error('Email sending error:', err);
        throw err;
    }
};

module.exports = { sendSMS, sendEmail };
