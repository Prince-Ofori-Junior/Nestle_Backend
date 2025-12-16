require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth");
const ticketRoutes = require("./routes/tickets");
const assetRoutes = require("./routes/assets");
const userRoutes = require("./routes/users");
const notificationRoutes = require("./routes/notifications");

const errorHandler = require("./middlewares/errorHandler");
const db = require("./config/db");

const app = express();
const PORT = process.env.PORT || 9000;

/* -------------------------
   SECURITY & MIDDLEWARE
-------------------------- */
app.use(helmet());
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://crimson-coders.vercel.app"
  ],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

/* -------------------------
   RATE LIMIT (AUTH ONLY)
-------------------------- */
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: "Too many login attempts. Try again later."
});
app.use("/api/auth", authLimiter);

/* -------------------------
   ROUTES
-------------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/notifications", notificationRoutes);

/* -------------------------
   HEALTH CHECK
-------------------------- */
app.get("/", (req, res) => {
  res.json({
    status: "running",
    message: "Nestlé Ghana IT Support API is live!",
    timestamp: new Date(),
  });
});

/* -------------------------
   404 HANDLER
-------------------------- */
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl
  });
});

/* -------------------------
   ERROR HANDLER
-------------------------- */
app.use(errorHandler);

/* -------------------------
   START SERVER
-------------------------- */
async function startServer() {
  try {
    // Test DB connection
    await db.query("SELECT NOW()");
    console.log("📦 PostgreSQL connected successfully");

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app; // Export for testing or serverless wrap if needed
