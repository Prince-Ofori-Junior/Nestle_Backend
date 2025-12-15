// GLOBAL ERROR HANDLER MIDDLEWARE
module.exports = (err, req, res, next) => {
    console.error("🔥 ERROR:", err.stack);

    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        status: "error",
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
};
