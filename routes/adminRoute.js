const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authMiddleware } = require("../middlewares/auth");
const { roleMiddleware } = require("../middlewares/role");

// ===== USERS =====
router.get("/users", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  const users = await pool.query("SELECT id, name, email, role, department FROM users");
  res.json(users.rows);
});

router.post("/users", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  const { name, email, role, department, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const result = await pool.query(
    "INSERT INTO users (name,email,password,role,department) VALUES ($1,$2,$3,$4,$5) RETURNING id,name,email,role,department",
    [name, email, hashed, role, department]
  );
  res.json(result.rows[0]);
});

router.put("/users/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  const { name, role, department } = req.body;  
  const result = await pool.query(
    "UPDATE users SET name=$1, role=$2, department=$3 WHERE id=$4 RETURNING id,name,email,role,department",
    [name, role, department, req.params.id]
  );
  res.json(result.rows[0]);
});

router.delete("/users/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  await pool.query("DELETE FROM users WHERE id=$1", [req.params.id]);
  res.json({ message: "User deleted" });
});

// ===== TICKETS =====
router.get("/tickets", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  const tickets = await pool.query(`
    SELECT t.id, t.title, t.description, t.status, u.name as assigned_to
    FROM tickets t
    LEFT JOIN users u ON t.assigned_to = u.id
  `);
  res.json(tickets.rows);
});

router.post("/tickets", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  const { title, description, assigned_to } = req.body;
  const result = await pool.query(
    "INSERT INTO tickets (title, description, status, assigned_to) VALUES ($1,$2,'open',$3) RETURNING *",
    [title, description, assigned_to || null]
  );
  res.json(result.rows[0]);
});

router.put("/tickets/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  const { title, description, status, assigned_to } = req.body;
  const result = await pool.query(
    "UPDATE tickets SET title=$1, description=$2, status=$3, assigned_to=$4 WHERE id=$5 RETURNING *",
    [title, description, status, assigned_to || null, req.params.id]
  );
  res.json(result.rows[0]);
});

router.delete("/tickets/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  await pool.query("DELETE FROM tickets WHERE id=$1", [req.params.id]);
  res.json({ message: "Ticket deleted" });
});

// ===== ASSETS =====
router.get("/assets", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  const assets = await pool.query("SELECT * FROM assets");
  res.json(assets.rows);
});

router.post("/assets", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  const { name, description, status } = req.body;
  const result = await pool.query(
    "INSERT INTO assets (name, description, status) VALUES ($1,$2,$3) RETURNING *",
    [name, description, status || "available"]
  );
  res.json(result.rows[0]);
});

router.put("/assets/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  const { name, description, status } = req.body;
  const result = await pool.query(
    "UPDATE assets SET name=$1, description=$2, status=$3 WHERE id=$4 RETURNING *",
    [name, description, status, req.params.id]
  );
  res.json(result.rows[0]);
});

router.delete("/assets/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  await pool.query("DELETE FROM assets WHERE id=$1", [req.params.id]);
  res.json({ message: "Asset deleted" });
});

module.exports = router;
