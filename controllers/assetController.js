const pool = require("../config/db");

// ADD ASSET
exports.addAsset = async (req, res) => {
  try {
    const { name, type, model, serialNumber, assignedTo, warrantyExpiry, status } = req.body;
    const asset = await pool.query(
      `INSERT INTO assets (name, type, model, serial_number, assigned_to, warranty_expiry, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        name,
        type,
        model || null,
        serialNumber || null,
        assignedTo || null,
        warrantyExpiry || null,
        status || "available"
      ]
    );
    res.json(asset.rows[0]);
  } catch (err) {
    console.error("Add Asset Error:", err);
    res.status(500).json({ message: "Asset creation error" });
  }
};

// GET ALL ASSETS
exports.getAssets = async (req, res) => {
  try {
    let assets;
    if (req.user.role === "admin") {
      const result = await pool.query("SELECT * FROM assets ORDER BY id DESC");
      assets = result.rows;
    } else {
      const result = await pool.query(
        "SELECT * FROM assets WHERE assigned_to = $1 ORDER BY id DESC",
        [req.user.id]
      );
      assets = result.rows;
    }
    res.json(assets);
  } catch (err) {
    console.error("Get Assets Error:", err);
    res.status(500).json({ message: "Asset fetch error" });
  }
};

// GET ASSET BY ID
exports.getAssetById = async (req, res) => {
  try {
    const asset = await pool.query("SELECT * FROM assets WHERE id = $1", [req.params.id]);
    res.json(asset.rows[0]);
  } catch (err) {
    console.error("Get Asset By ID Error:", err);
    res.status(500).json({ message: "Error retrieving asset" });
  }
};

// UPDATE ASSET
exports.updateAsset = async (req, res) => {
  try {
    const { name, type, model, serialNumber, assignedTo, warrantyExpiry, status } = req.body;
    const updated = await pool.query(
      `UPDATE assets SET 
         name=$1, type=$2, model=$3, serial_number=$4, 
         assigned_to=$5, warranty_expiry=$6, status=$7
       WHERE id=$8 RETURNING *`,
      [
        name,
        type,
        model || null,
        serialNumber || null,
        assignedTo || null,
        warrantyExpiry || null,
        status || "available",
        req.params.id
      ]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    console.error("Update Asset Error:", err);
    res.status(500).json({ message: "Asset update error" });
  }
};

// DELETE ASSET
exports.deleteAsset = async (req, res) => {
  try {
    await pool.query("DELETE FROM assets WHERE id = $1", [req.params.id]);
    res.json({ message: "Asset deleted" });
  } catch (err) {
    console.error("Delete Asset Error:", err);
    res.status(500).json({ message: "Asset deletion error" });
  }
};
