const pool = require("../config/db");

// GET ALL NOTIFICATIONS
exports.getNotifications = async (req, res) => {
    try {
        let notifications;

        // Admin sees all
        if (req.user.role === "admin") {
            notifications = await pool.query(
                "SELECT * FROM notifications ORDER BY id DESC"
            );
        } else {
            // Employees & Technicians see only theirs
            notifications = await pool.query(
                "SELECT * FROM notifications WHERE user_id = $1 ORDER BY id DESC",
                [req.user.id]
            );
        }

        res.json(notifications.rows);
    } catch (err) {
        res.status(500).json({ message: "Error fetching notifications" });
    }
};;

// MARK AS READ
exports.markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;

        // Ensure user owns the notification or is admin
        const notif = await pool.query("SELECT * FROM notifications WHERE id = $1", [id]);
        if (!notif.rows[0]) return res.status(404).json({ message: "Notification not found" });
        if (req.user.role !== "admin" && notif.rows[0].user_id !== req.user.id)
            return res.status(403).json({ message: "Forbidden" });

        const updated = await pool.query(
            "UPDATE notifications SET read = true WHERE id = $1 RETURNING *",
            [id]
        );

        res.json({ message: "Notification marked read", notification: updated.rows[0] });
    } catch (err) {
        res.status(500).json({ message: "Error updating notification" });
    }
};

// DELETE NOTIFICATION
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notif = await pool.query("SELECT * FROM notifications WHERE id = $1", [id]);
        if (!notif.rows[0]) return res.status(404).json({ message: "Notification not found" });
        if (req.user.role !== "admin" && notif.rows[0].user_id !== req.user.id)
            return res.status(403).json({ message: "Forbidden" });

        await pool.query("DELETE FROM notifications WHERE id = $1", [id]);
        res.json({ message: "Notification deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting notification" });
    }
};
