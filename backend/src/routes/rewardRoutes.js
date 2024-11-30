const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// 사용 가능한 보상 목록 조회
router.get("/available", async (req, res) => {
  try {
    const [rewards] = await pool.query(
      "SELECT * FROM Rewards ORDER BY points_required ASC"
    );
    res.json(rewards);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching rewards", error: err.message });
  }
});

// 보상 교환 신청
router.post("/claim", async (req, res) => {
  const { user_id, reward_id } = req.body;

  try {
    // 트랜잭션 시작
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 보상 정보 조회
      const [reward] = await connection.query(
        "SELECT * FROM Rewards WHERE reward_id = ?",
        [reward_id]
      );

      if (reward.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: "Reward not found" });
      }

      // 사용자 포인트 확인
      const [points] = await connection.query(
        "SELECT SUM(points) as total_points FROM Points WHERE user_id = ?",
        [user_id]
      );

      const totalPoints = points[0].total_points || 0;
      const requiredPoints = reward[0].points_required;

      if (totalPoints < requiredPoints) {
        await connection.rollback();
        return res.status(400).json({
          message: "Insufficient points",
          required: requiredPoints,
          current: totalPoints,
        });
      }

      // 포인트 차감
      await connection.query(
        "INSERT INTO Points (user_id, points, reason) VALUES (?, ?, ?)",
        [user_id, -requiredPoints, `Reward claim: ${reward[0].reward_name}`]
      );

      // 보상 지급 기록
      await connection.query(
        "INSERT INTO UserRewards (user_id, reward_id) VALUES (?, ?)",
        [user_id, reward_id]
      );

      // 트랜잭션 완료
      await connection.commit();

      res.status(201).json({
        message: "Reward claimed successfully",
        reward: reward[0],
        remaining_points: totalPoints - requiredPoints,
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error claiming reward", error: err.message });
  }
});

// 사용자의 보상 획득 내역 조회
router.get("/history/:userId", async (req, res) => {
  try {
    const [history] = await pool.query(
      `SELECT UserRewards.*, Rewards.reward_name, Rewards.description, Rewards.points_required 
             FROM UserRewards 
             JOIN Rewards ON UserRewards.reward_id = Rewards.reward_id 
             WHERE UserRewards.user_id = ? 
             ORDER BY UserRewards.claimed_at DESC`,
      [req.params.userId]
    );
    res.json(history);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching reward history", error: err.message });
  }
});

module.exports = router;
