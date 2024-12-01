const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// 계단 사용 기록 등록
router.post("/", async (req, res) => {
  try {
    const { user_id, building_id, floors_climbed } = req.body;

    // 계단 사용 기록 저장
    const [result] = await pool.query(
      "INSERT INTO StairUsage (user_id, building_id, floors_climbed) VALUES (?, ?, ?)",
      [user_id, building_id, floors_climbed]
    );

    // 포인트 적립 (1층당 10포인트)
    const points = floors_climbed * 10;
    await pool.query(
      "INSERT INTO Points (user_id, points, reason) VALUES (?, ?, ?)",
      [user_id, points, `Climbed ${floors_climbed} floors`]
    );

    res.status(201).json({
      message: "Stair usage recorded successfully",
      usage_id: result.insertId,
      points_earned: points,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error recording stair usage", error: err.message });
  }
});

// 사용자별 계단 사용 기록 조회
router.get("/user/:userId", async (req, res) => {
  try {
    // 오늘의 기록 조회
    const [todayRecords] = await pool.query(
      `SELECT COALESCE(SUM(floors_climbed), 0) as total_floors
           FROM StairUsage 
           WHERE user_id = ? 
           AND DATE(timestamp) = CURDATE()`,
      [req.params.userId]
    );

    // 전체 기록 조회
    const [records] = await pool.query(
      `SELECT StairUsage.*, Buildings.building_name, 
                  (StairUsage.floors_climbed * 10) as points_earned
           FROM StairUsage 
           JOIN Buildings ON StairUsage.building_id = Buildings.building_id
           WHERE user_id = ?
           ORDER BY timestamp DESC`,
      [req.params.userId]
    );

    res.json({
      today: todayRecords[0].total_floors, // 이렇게 today로 반환
      records: records,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching records", error: err.message });
  }
});

// 건물별 통계 조회
router.get("/building/:buildingId/stats", async (req, res) => {
  try {
    const [stats] = await pool.query(
      `SELECT 
                COUNT(*) as total_uses,
                SUM(floors_climbed) as total_floors,
                AVG(floors_climbed) as avg_floors
             FROM StairUsage 
             WHERE building_id = ?`,
      [req.params.buildingId]
    );
    res.json(stats[0]);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching building stats", error: err.message });
  }
});

module.exports = router;
