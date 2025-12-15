const express = require("express");
const router = express.Router();
const {
    getNotifications,
    markNotificationRead,
    deleteNotification
} = require("../controllers/notificationController");
const { authMiddleware, roleMiddleware } = require("../middlewares/auth");

// Everyone can fetch their own notifications
router.get("/", authMiddleware, getNotifications);

// Everyone can mark their notifications as read
router.put("/:id/read", authMiddleware, markNotificationRead);

// Everyone can delete their notifications
router.delete("/:id", authMiddleware, deleteNotification);

module.exports = router;
