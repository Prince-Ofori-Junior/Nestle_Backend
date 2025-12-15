const twilio = require("twilio");

const client = twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_AUTH_TOKEN
);

module.exports = {
    sendSMS: async (to, message) => {
        try {
            await client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE,
                to,
            });

            return true;
        } catch (err) {
            console.error("Twilio Error:", err);
            throw new Error("Failed to send SMS");
        }
    }
};
