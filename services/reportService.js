const db = require("../config/db");

module.exports = {
    getSLAMetrics: async () => {
        const sql = `
            SELECT
                COUNT(*) AS total_tickets,
                AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) AS avg_resolution_hours,
                SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) AS overdue_count
            FROM tickets;
        `;

        const result = await db.query(sql);
        return result.rows[0];
    },

    getTechnicianProductivity: async () => {
        const sql = `
            SELECT
                u.id AS technician_id,
                u.name,
                COUNT(t.id) AS tickets_resolved
            FROM users u
            LEFT JOIN tickets t ON u.id = t.assigned_to AND t.status = 'resolved'
            WHERE u.role = 'technician'
            GROUP BY u.id;
        `;

        const result = await db.query(sql);
        return result.rows;
    },

    getTicketVolumePerMonth: async () => {
        const sql = `
            SELECT 
                TO_CHAR(created_at, 'YYYY-MM') AS month,
                COUNT(*) AS ticket_count
            FROM tickets
            GROUP BY month
            ORDER BY month;
        `;

        const result = await db.query(sql);
        return result.rows;
    }
};
