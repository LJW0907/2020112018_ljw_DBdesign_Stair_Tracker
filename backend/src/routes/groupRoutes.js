const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// 새로운 그룹 생성
router.post("/", async (req, res) => {
  // 트랜잭션을 사용하여 그룹 생성과 생성자의 그룹 가입을 동시에 처리합니다
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { group_name, created_by, description } = req.body;

    // 먼저 그룹을 생성합니다
    const [groupResult] = await connection.query(
      "INSERT INTO GroupTable (group_name, description) VALUES (?, ?)",
      [group_name, description]
    );

    const groupId = groupResult.insertId;

    // 그룹 생성자를 자동으로 그룹의 첫 번째 멤버로 추가합니다
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

// 그룹 검색 (이름으로 검색 가능)
router.get("/search", async (req, res) => {
  try {
    const searchTerm = `%${req.query.term || ""}%`;

    const [groups] = await pool.query(
      `SELECT GroupTable.*, 
                    COUNT(UserGroups.user_id) as member_count
             FROM GroupTable 
             LEFT JOIN UserGroups ON GroupTable.group_id = UserGroups.group_id
             WHERE GroupTable.group_name LIKE ?
             GROUP BY GroupTable.group_id`,
      [searchTerm]
    );

    res.json(groups);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error searching groups", error: err.message });
  }
});

// 특정 그룹의 상세 정보 조회
router.get("/:groupId", async (req, res) => {
  try {
    // 그룹의 기본 정보와 멤버 수를 함께 조회합니다
    const [groups] = await pool.query(
      `SELECT GroupTable.*, 
                    COUNT(UserGroups.user_id) as member_count
             FROM GroupTable 
             LEFT JOIN UserGroups ON GroupTable.group_id = UserGroups.group_id
             WHERE GroupTable.group_id = ?
             GROUP BY GroupTable.group_id`,
      [req.params.groupId]
    );

    if (groups.length === 0) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(groups[0]);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching group", error: err.message });
  }
});

// 그룹의 멤버 목록과 각 멤버의 실적 조회
router.get("/:groupId/members", async (req, res) => {
  try {
    const [members] = await pool.query(
      `SELECT Users.user_id, Users.username,
                    SUM(CASE 
                        WHEN DATE(StairUsage.timestamp) = CURDATE() 
                        THEN StairUsage.floors_climbed 
                        ELSE 0 
                    END) as today_floors,
                    SUM(StairUsage.floors_climbed) as total_floors,
                    (SELECT SUM(points) FROM Points WHERE Points.user_id = Users.user_id) as total_points
             FROM UserGroups
             JOIN Users ON UserGroups.user_id = Users.user_id
             LEFT JOIN StairUsage ON Users.user_id = StairUsage.user_id
             WHERE UserGroups.group_id = ?
             GROUP BY Users.user_id, Users.username
             ORDER BY total_points DESC`,
      [req.params.groupId]
    );

    res.json(members);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching group members", error: err.message });
  }
});

// 그룹 가입
router.post("/join", async (req, res) => {
  try {
    const { user_id, group_id } = req.body;

    // 이미 가입했는지 확인
    const [existing] = await pool.query(
      "SELECT * FROM UserGroups WHERE user_id = ? AND group_id = ?",
      [user_id, group_id]
    );

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ message: "Already a member of this group" });
    }

    await pool.query(
      "INSERT INTO UserGroups (user_id, group_id) VALUES (?, ?)",
      [user_id, group_id]
    );

    res.status(201).json({ message: "Successfully joined the group" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error joining group", error: err.message });
  }
});

// 그룹 탈퇴
router.delete("/:groupId/leave", async (req, res) => {
  try {
    const { user_id } = req.body;

    await pool.query(
      "DELETE FROM UserGroups WHERE user_id = ? AND group_id = ?",
      [user_id, req.params.groupId]
    );

    res.json({ message: "Successfully left the group" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error leaving group", error: err.message });
  }
});

module.exports = router;
