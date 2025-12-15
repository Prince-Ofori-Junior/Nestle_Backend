const pool = require("../config/db");

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    let query = "SELECT id, name, email, role, department FROM users ORDER BY id DESC";
    const params = [];

    // Non-admins only see themselves
    if (req.user.role !== "admin") {
      query = "SELECT id, name, email, role, department FROM users WHERE id = $1";
      params.push(req.user.id);
    }

    const users = await pool.query(query, params);
    res.json(users.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// GET SINGLE USER
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Non-admins cannot fetch other users
    if (req.user.role !== "admin" && req.user.id != userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const user = await pool.query(
      "SELECT id, name, email, role, department FROM users WHERE id = $1",
      [userId]
    );
    res.json(user.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "User fetch error" });
  }
};

// UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const { name, role, department } = req.body;
    const userId = req.params.id;

    if (req.user.role !== "admin" && req.user.id != userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updated = await pool.query(
      `UPDATE users SET name=$1, role=$2, department=$3
       WHERE id=$4 RETURNING id, name, email, role, department`,
      [name, role, department, userId]
    );

    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "User update error" });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "User deletion error" });
  }
};
