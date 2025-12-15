const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ------------------
// REGISTER USER
// ------------------
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (role && role.toLowerCase() === "admin") {
      return res.status(403).json({ message: "Cannot register as admin" });
    }

    const check = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (check.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, department)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, name, email, role, department`,
      [name, email, hashed, role || "employee", department || null]
    );

    res.status(201).json({ message: "User registered", user: result.rows[0] });
  } catch (err) {
    console.error("User registration error:", err);
    res.status(500).json({ message: "Registration error", error: err.message });
  }
};

// ------------------
// LOGIN USER (non-admin)
// ------------------
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const userQuery = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (!userQuery.rows.length) return res.status(404).json({ message: "User not found" });

    const user = userQuery.rows[0];
    if (user.role.toLowerCase() === "admin")
      return res.status(403).json({ message: "Admins must use the admin login page" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

// ------------------
// GET PROFILE
// ------------------
exports.getProfile = async (req, res) => {
  try {
    const userQuery = await pool.query(
      "SELECT id, name, email, role, department FROM users WHERE id=$1",
      [req.user.id]
    );
    res.json(userQuery.rows[0]);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Profile fetch error" });
  }
};

// ------------------
// ADMIN LOGIN (Production-ready)
// ------------------
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Case-insensitive email lookup
    const userQuery = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );

    if (!userQuery.rows.length) {
      console.warn(`Admin login failed: email not found -> ${email}`);
      return res.status(404).json({ message: "Admin not found" });
    }

    const user = userQuery.rows[0];

    // Check if user is admin
    if (user.role.toLowerCase() !== "admin") {
      console.warn(`Admin login failed: non-admin tried to login -> ${email}`);
      return res.status(403).json({ message: "Only admins can use this login" });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.warn(`Admin login failed: invalid password -> ${email}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log(`Admin login successful: ${email}`);

    // Return response
    res.json({
      message: "Admin login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || null,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Admin login error", error: err.message });
  }
};

// ------------------
// REGISTER ADMIN
// ------------------
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email, and password are required" });

    const check = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (check.rows.length > 0) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'admin')
       RETURNING id, name, email, role`,
      [name, email, hashed]
    );

    res.status(201).json({ message: "Admin registered successfully", user: result.rows[0] });
  } catch (err) {
    console.error("Admin registration error:", err);
    res.status(500).json({ message: "Admin registration error", error: err.message });
  }
};
