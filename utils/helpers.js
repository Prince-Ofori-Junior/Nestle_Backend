const crypto = require("crypto");

module.exports = {
    /**
     * Generate a random ID (Ticket ID, Asset Code, etc.)
     * @param {number} length 
     * @returns string
     */
    generateId(length = 10) {
        return crypto.randomBytes(length).toString("hex");
    },

    /**
     * Format date into human-readable form
     * @param {Date} date 
     */
    formatDate(date) {
        return new Date(date).toISOString().replace("T", " ").substring(0, 19);
    },

    /**
     * Capitalize first letter of a string
     */
    capitalize(text) {
        if (!text) return "";
        return text.charAt(0).toUpperCase() + text.slice(1);
    },

    /**
     * Remove extra spaces (used in cleaning ticket messages)
     */
    cleanText(text) {
        return text.replace(/\s+/g, " ").trim();
    },

    /**
     * Generate a random OTP code (4 or 6 digits)
     */
    generateOTP(length = 6) {
        let otp = "";
        for (let i = 0; i < length; i++) {
            otp += Math.floor(Math.random() * 10);
        }
        return otp;
    },

    /**
     * Calculate difference in hours between two timestamps
     */
    hoursBetween(start, end) {
        const s = new Date(start).getTime();
        const e = new Date(end).getTime();
        return Math.round((e - s) / 36e5);
    },

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    /**
     * Generate pagination query values
     */
    paginate(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        return { limit, offset };
    },

    /**
     * Random string generator (useful for reset tokens)
     */
    randomString(length = 32) {
        return crypto.randomBytes(length).toString("base64url");
    }
};
