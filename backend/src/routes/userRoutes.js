const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// 사용자 등록 (회원가입)
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const [result] = await pool.query(
      "INSERT INTO Users (username, email, password) VALUES (?, ?, ?)",
      [username, email, password]
    );
    res
      .status(201)
      .json({
        message: "User registered successfully",
        userId: result.insertId,
      });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error registering user", error: err.message });
  }
});

// 사용자 로그인
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query(
      "SELECT * FROM Users WHERE email = ? AND password = ?",
      [email, password]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful", user: users[0] });
  } catch (err) {
    res.status(500).json({ message: "Error during login", error: err.message });
  }
});

// 사용자 정보 조회
router.get("/:userId", async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT user_id, username, email, created_at FROM Users WHERE user_id = ?",
      [req.params.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(users[0]);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: err.message });
  }
});

module.exports = router;
