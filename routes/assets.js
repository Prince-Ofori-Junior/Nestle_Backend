const express = require("express");
const router = express.Router();
const { addAsset, getAssets, getAssetById, updateAsset, deleteAsset } = require("../controllers/assetController");
const { authMiddleware, roleMiddleware } = require("../middlewares/auth");

// Admin creates asset
router.post("/", authMiddleware, roleMiddleware("admin"), addAsset);

// Admin + Technician view assets
router.get("/", authMiddleware, roleMiddleware(["admin", "technician"]), getAssets);
router.get("/:id", authMiddleware, roleMiddleware(["admin", "technician"]), getAssetById);

// Admin updates asset
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateAsset);

// Admin deletes asset
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteAsset);

module.exports = router;
