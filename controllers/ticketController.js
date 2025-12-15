const pool = require("../config/db");

// ----------------------------
// GET ALL TICKETS (PRIORITIZED BY URGENCY)
// ----------------------------
exports.getTickets = async (req, res) => {
  try {
    let query;
    const params = [];

    if (req.user.role === "employee") {
      // Employees see only their tickets
      query = `SELECT * FROM tickets WHERE created_by=$1 ORDER BY
        CASE urgency
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'normal' THEN 3
          WHEN 'low' THEN 4
          ELSE 5
        END, created_at DESC`;
      params.push(req.user.id);
    } else {
      // Technicians see all tickets
      query = `SELECT * FROM tickets ORDER BY
        CASE urgency
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'normal' THEN 3
          WHEN 'low' THEN 4
          ELSE 5
        END, created_at DESC`;
    }

    const { rows } = await pool.query(query, params);
    res.status(200).json({ success: true, tickets: rows });
  } catch (err) {
    console.error("getTickets error:", err);
    res.status(500).json({ success: false, message: "Error fetching tickets" });
  }
};

// ----------------------------
// CREATE TICKET
// ----------------------------
exports.createTicket = async (req, res) => {
  try {
    const { title, description, assignedTo, urgency } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const allowedUrgency = ["low", "normal", "high", "critical"];
    const ticketUrgency = allowedUrgency.includes(urgency) ? urgency : "normal";

    const createdBy = req.user.id;

    const { rows } = await pool.query(
      `INSERT INTO tickets (title, description, created_by, assigned_to, status, urgency)
       VALUES ($1, $2, $3, $4, 'open', $5) RETURNING *`,
      [title, description || "", createdBy, assignedTo || null, ticketUrgency]
    );

    res.status(201).json({ success: true, ticket: rows[0] });
  } catch (err) {
    console.error("createTicket error:", err);
    res.status(500).json({ success: false, message: "Error creating ticket" });
  }
};

// ----------------------------
// UPDATE TICKET STATUS & URGENCY
// ----------------------------
exports.updateTicketStatus = async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    const { status, urgency } = req.body;

    if (!status || !["open", "in_progress", "closed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const allowedUrgency = ["low", "normal", "high", "critical"];
    const ticketUrgency = urgency && allowedUrgency.includes(urgency) ? urgency : null;

    const { rows } = await pool.query("SELECT * FROM tickets WHERE id=$1", [ticketId]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Ticket not found" });

    const ticket = rows[0];

    // Employee restriction: can only update own tickets
    if (req.user.role === "employee" && ticket.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden: Cannot update ticket" });
    }

    const { rows: updatedRows } = await pool.query(
      `UPDATE tickets SET status=$1${ticketUrgency ? ", urgency=$2" : ""}, updated_at=NOW() WHERE id=$3 RETURNING *`,
      ticketUrgency ? [status, ticketUrgency, ticketId] : [status, ticketId]
    );

    res.status(200).json({ success: true, ticket: updatedRows[0] });
  } catch (err) {
    console.error("updateTicketStatus error:", err);
    res.status(500).json({ success: false, message: "Error updating ticket status" });
  }
};

// ----------------------------
// DELETE TICKET
// ----------------------------
exports.deleteTicket = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: Only admin can delete" });
    }

    const ticketId = parseInt(req.params.id, 10);
    const { rowCount } = await pool.query("DELETE FROM tickets WHERE id=$1", [ticketId]);

    if (!rowCount) return res.status(404).json({ success: false, message: "Ticket not found" });

    res.status(200).json({ success: true, message: "Ticket deleted successfully" });
  } catch (err) {
    console.error("deleteTicket error:", err);
    res.status(500).json({ success: false, message: "Error deleting ticket" });
  }
};
