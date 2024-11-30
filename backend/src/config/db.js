const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "admin", // MySQL 비밀번호
  database: "stair_tracking", // 아직 생성하지 않은 DB 이름
});

module.exports = pool;
