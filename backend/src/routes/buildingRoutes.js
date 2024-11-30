const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// 모든 건물 목록 조회
router.get("/", async (req, res) => {
  try {
    const [buildings] = await pool.query("SELECT * FROM Buildings");
    res.json(buildings);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching buildings", error: err.message });
  }
});

// 특정 건물 정보 조회
router.get("/:id", async (req, res) => {
  try {
    const [building] = await pool.query(
      "SELECT * FROM Buildings WHERE building_id = ?",
      [req.params.id]
    );
    if (building.length === 0) {
      return res.status(404).json({ message: "Building not found" });
    }
    res.json(building[0]);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching building", error: err.message });
  }
});

// 건물 추가 (관리자용)
router.post("/", async (req, res) => {
  try {
    const { building_name, location } = req.body;
    const [result] = await pool.query(
      "INSERT INTO Buildings (building_name, location) VALUES (?, ?)",
      [building_name, location]
    );
    res.status(201).json({
      message: "Building added successfully",
      building_id: result.insertId,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding building", error: err.message });
  }
});

module.exports = router;
