const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// 새 그룹 생성 엔드포인트
router.post("/", async (req, res) => {
  // 트랜잭션을 사용하여 그룹 생성과 생성자를 그룹에 추가하는 작업을 원자적으로 처리합니다
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { group_name, created_by } = req.body;

    // 그룹 생성
    const [result] = await connection.query(
      "INSERT INTO GroupTable (group_name) VALUES (?)",
      [group_name]
    );

    const groupId = result.insertId;

    // 그룹 생성자를 멤버로 추가
    await connection.query(
      "INSERT INTO UserGroups (user_id, group_id) VALUES (?, ?)",
      [created_by, groupId]
    );

    await connection.commit();

    res.status(201).json({
      message: "Group created successfully",
      group_id: groupId,
    });
  } catch (err) {
    await connection.rollback();
    res
      .status(500)
      .json({ message: "Error creating group", error: err.message });
  } finally {
    connection.release();
  }
});

// 사용자의 그룹 목록 조회 엔드포인트
router.get("/user/:userId", async (req, res) => {
  try {
    // 사용자가 속한 그룹들의 정보와 각 그룹의 멤버 수를 함께 조회합니다
    const [groups] = await pool.query(
      `SELECT 
                g.group_id,
                g.group_name,
                g.created_at,
                COUNT(DISTINCT ug2.user_id) as member_count,
                (
                    SELECT COUNT(*) + 1
                    FROM (
                        SELECT u2.user_id,
                               SUM(p.points) as total_points
                        FROM UserGroups ug3
                        JOIN Users u2 ON ug3.user_id = u2.user_id
                        LEFT JOIN Points p ON u2.user_id = p.user_id
                        WHERE ug3.group_id = g.group_id
                        GROUP BY u2.user_id
                        HAVING SUM(p.points) > (
                            SELECT COALESCE(SUM(p2.points), 0)
                            FROM Points p2
                            WHERE p2.user_id = ?
                        )
                    ) better_users
                ) as my_rank
            FROM GroupTable g
            JOIN UserGroups ug ON g.group_id = ug.group_id
            LEFT JOIN UserGroups ug2 ON g.group_id = ug2.group_id
            WHERE ug.user_id = ?
            GROUP BY g.group_id, g.group_name, g.created_at`,
      [req.params.userId, req.params.userId]
    );

    res.json(groups);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching user groups", error: err.message });
  }
});

// 참여 가능한 그룹 목록 조회 엔드포인트
router.get("/available", async (req, res) => {
  try {
    // 모든 그룹의 정보와 각 그룹의 멤버 수를 조회합니다
    const [groups] = await pool.query(
      `SELECT 
                g.group_id,
                g.group_name,
                g.created_at,
                COUNT(DISTINCT ug.user_id) as member_count
            FROM GroupTable g
            LEFT JOIN UserGroups ug ON g.group_id = ug.group_id
            GROUP BY g.group_id, g.group_name, g.created_at`
    );

    res.json(groups);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching available groups", error: err.message });
  }
});

// 그룹 참여 엔드포인트
router.post("/join", async (req, res) => {
  try {
    const { user_id, group_id } = req.body;

    // 사용자 존재 여부 확인
    const [userExists] = await pool.query(
      "SELECT user_id FROM Users WHERE user_id = ?",
      [user_id]
    );

    if (userExists.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // 그룹 존재 여부 확인
    const [groupExists] = await pool.query(
      "SELECT group_id FROM GroupTable WHERE group_id = ?",
      [group_id]
    );

    if (groupExists.length === 0) {
      return res.status(404).json({ message: "Group not found" });
    }

    // 이미 참여한 그룹인지 확인
    const [existing] = await pool.query(
      "SELECT * FROM UserGroups WHERE user_id = ? AND group_id = ?",
      [user_id, group_id]
    );

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ message: "Already a member of this group" });
    }

    // 그룹에 참여
    await pool.query(
      "INSERT INTO UserGroups (user_id, group_id) VALUES (?, ?)",
      [user_id, group_id]
    );

    res.status(201).json({ message: "Joined group successfully" });
  } catch (err) {
    console.error("Group join error:", err);
    res.status(500).json({
      message: "Error joining group",
      error: err.message,
    });
  }
});

// 그룹 상세 정보와 멤버 목록 조회 엔드포인트
router.get("/:groupId", async (req, res) => {
  try {
    // 그룹 기본 정보 조회
    const [groupInfo] = await pool.query(
      `SELECT 
                g.*,
                COUNT(DISTINCT ug.user_id) as member_count
            FROM GroupTable g
            LEFT JOIN UserGroups ug ON g.group_id = ug.group_id
            WHERE g.group_id = ?
            GROUP BY g.group_id`,
      [req.params.groupId]
    );

    if (groupInfo.length === 0) {
      return res.status(404).json({ message: "Group not found" });
    }

    // 그룹 멤버 목록과 각 멤버의 포인트 조회
    const [members] = await pool.query(
      `SELECT 
                u.user_id,
                u.username,
                COALESCE(SUM(p.points), 0) as total_points,
                COUNT(DISTINCT s.usage_id) as total_stairs
            FROM UserGroups ug
            JOIN Users u ON ug.user_id = u.user_id
            LEFT JOIN Points p ON u.user_id = p.user_id
            LEFT JOIN StairUsage s ON u.user_id = s.user_id
            WHERE ug.group_id = ?
            GROUP BY u.user_id, u.username
            ORDER BY total_points DESC`,
      [req.params.groupId]
    );

    res.json({
      ...groupInfo[0],
      members,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching group details", error: err.message });
  }
});

// 그룹의 전체 랭킹을 조회하는 엔드포인트입니다
router.get("/:groupId/rankings", async (req, res) => {
  try {
    const [rankings] = await pool.query(
      `SELECT 
              u.user_id,
              u.username,
              CAST(COALESCE(SUM(CASE 
                  WHEN s.timestamp >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                  THEN s.floors_climbed 
                  ELSE 0 
              END), 0) AS SIGNED) as weekly_stairs,
              CAST(COALESCE(SUM(CASE 
                  WHEN p.timestamp >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                  THEN p.points 
                  ELSE 0 
              END), 0) AS SIGNED) as weekly_points,
              CAST(COALESCE(SUM(p.points), 0) AS SIGNED) as total_points
          FROM Users u
          JOIN UserGroups ug ON u.user_id = ug.user_id
          LEFT JOIN StairUsage s ON u.user_id = s.user_id
          LEFT JOIN Points p ON u.user_id = p.user_id
          WHERE ug.group_id = ?
          GROUP BY u.user_id, u.username
          ORDER BY weekly_points DESC, weekly_stairs DESC, total_points DESC`,
      [req.params.groupId]
    );

    // 그룹 전체 통계 쿼리도 수정
    const [groupStats] = await pool.query(
      `SELECT 
              CAST(COALESCE(SUM(s.floors_climbed), 0) AS SIGNED) as total_stairs_this_week,
              CAST(COALESCE(SUM(p.points), 0) AS SIGNED) as total_points_this_week,
              COUNT(DISTINCT CASE 
                  WHEN s.timestamp >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) 
                  THEN s.user_id 
              END) as active_users_this_week
          FROM UserGroups ug
          LEFT JOIN StairUsage s ON ug.user_id = s.user_id 
              AND s.timestamp >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
          LEFT JOIN Points p ON ug.user_id = p.user_id
              AND p.timestamp >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
          WHERE ug.group_id = ?`,
      [req.params.groupId]
    );

    res.json({
      rankings: rankings.map((rank) => ({
        ...rank,
        weekly_points: Number(rank.weekly_points),
        weekly_stairs: Number(rank.weekly_stairs),
        total_points: Number(rank.total_points),
      })),
      group_stats: {
        total_stairs_this_week: Number(groupStats[0].total_stairs_this_week),
        total_points_this_week: Number(groupStats[0].total_points_this_week),
        active_users_this_week: Number(groupStats[0].active_users_this_week),
      },
      updated_at: new Date(),
    });
  } catch (err) {
    console.error("Error fetching rankings:", err);
    res
      .status(500)
      .json({ message: "Error fetching rankings", error: err.message });
  }
});

module.exports = router;
