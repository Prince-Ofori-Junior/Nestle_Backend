const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth");
const { adminOnly } = require("../middlewares/adminOnly");
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require("../controllers/userController");

// All routes require authentication
router.use(authMiddleware);

// ADMIN ONLY
router.get("/", adminOnly, getAllUsers);
router.delete("/:id", adminOnly, deleteUser);

// ADMIN OR SELF
router.get("/:id", getUserById);
router.put("/:id", updateUser);

module.exports = router;
