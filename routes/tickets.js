const express = require("express");
const router = express.Router();
const ticketsController = require("../controllers/ticketController");
const { authMiddleware, roleMiddleware } = require("../middlewares/auth");

// All ticket routes require authentication
router.use(authMiddleware);

// Employee can view their own tickets
router.get("/", ticketsController.getTickets);

// Employee can create tickets
router.post("/", ticketsController.createTicket);

// Only assigned technician or creator can update status
router.put("/:id/status", ticketsController.updateTicketStatus);

// Only admin can delete tickets
router.delete("/:id", roleMiddleware("admin"), ticketsController.deleteTicket);

module.exports = router; 
 