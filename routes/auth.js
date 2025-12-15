const express = require("express");
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getProfile, 
  loginAdmin, 
  registerAdmin 
} = require("../controllers/authController");
const { authMiddleware } = require("../middlewares/auth");

// --------------------
// PUBLIC ROUTES
// --------------------
router.post("/register", registerUser);          // user registration
router.post("/login", loginUser);               // normal user login
router.post("/admin/login", loginAdmin);        // admin login
router.post("/admin/register", registerAdmin);  // admin registration

// --------------------
// PROTECTED ROUTES
// --------------------
router.get("/profile", authMiddleware, getProfile);

module.exports = router;
