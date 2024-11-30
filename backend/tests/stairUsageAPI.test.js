const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// 계단 사용 기록 등록
router.post("/", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { user_id, building_id, floors_climbed } = req.body;

    // 계단 사용 기록 저장
    const [stairResult] = await connection.query(
      "INSERT INTO StairUsage (user_id, building_id, floors_climbed) VALUES (?, ?, ?)",
      [user_id, building_id, floors_climbed]
    );

    // 포인트 계산 (1층당 10포인트)
    const points = floors_climbed * 10;

    // 포인트 적립 기록 저장
    await connection.query(
      "INSERT INTO Points (user_id, points, reason) VALUES (?, ?, ?)",
      [user_id, points, `${floors_climbed}층 계단 이용`]
    );

    await connection.commit();

    res.status(201).json({
      message: "Stair usage recorded successfully",
      usage_id: stairResult.insertId,
      points_earned: points,
    });
  } catch (err) {
    await connection.rollback();
    res
      .status(500)
      .json({ message: "Error recording stair usage", error: err.message });
  } finally {
    connection.release();
  }
});

// 사용자별 계단 사용 기록 조회
router.get("/user/:userId", async (req, res) => {
  try {
    // 오늘의 기록 조회
    const [todayRecords] = await pool.query(
      `SELECT SUM(floors_climbed) as today_floors
             FROM StairUsage 
             WHERE user_id = ? 
             AND DATE(timestamp) = CURDATE()`,
      [req.params.userId]
    );

    // 전체 기록 조회 (건물 이름 포함)
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
      today: todayRecords[0].today_floors || 0,
      records: records,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching records", error: err.message });
  }
});

module.exports = router;
