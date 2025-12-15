const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

module.exports = {
    sendEmail: async (to, subject, html) => {
        try {
            await transporter.sendMail({
                from: `Nestlé Ghana IT Support <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html
            });

            return true;
        } catch (err) {
            console.error("Email Error:", err);
            throw new Error("Failed to send email");
        }
    }
};
