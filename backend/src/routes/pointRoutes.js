const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// 사용자의 총 포인트 조회
// 사용자의 총 포인트 조회
router.get("/total/:userId", async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT CAST(COALESCE(SUM(points), 0) AS SIGNED) as total_points FROM Points WHERE user_id = ?",
      [req.params.userId]
    );
    res.json({ total_points: Number(result[0].total_points) });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching total points", error: err.message });
  }
});

// 포인트 내역 조회 (적립/사용 이력)
router.get("/history/:userId", async (req, res) => {
  try {
    const [records] = await pool.query(
      `SELECT * FROM Points 
             WHERE user_id = ? 
             ORDER BY timestamp DESC`,
      [req.params.userId]
    );
    res.json(records);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching point history", error: err.message });
  }
});

// 포인트 사용
router.post("/use", async (req, res) => {
  try {
    const { user_id, points, reason } = req.body;

    // 현재 포인트 잔액 확인
    const [currentPoints] = await pool.query(
      "SELECT SUM(points) as total_points FROM Points WHERE user_id = ?",
      [user_id]
    );

    const totalPoints = currentPoints[0].total_points || 0;

    if (totalPoints < points) {
      return res.status(400).json({ message: "Insufficient points" });
    }

    // 포인트 차감 기록
    const [result] = await pool.query(
      "INSERT INTO Points (user_id, points, reason) VALUES (?, ?, ?)",
      [user_id, -points, reason]
    );

    res.status(201).json({
      message: "Points used successfully",
      remaining_points: totalPoints - points,
    });
  } catch (err) {
    res.status(500).json({ message: "Error using points", error: err.message });
  }
});

module.exports = router;
