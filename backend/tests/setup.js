const pool = require("../config/db");

const setupTestDatabase = async () => {
  try {
    // 테스트 데이터 초기화
    await pool.query("DELETE FROM UserGroups");
    await pool.query("DELETE FROM GroupTable");
    await pool.query("ALTER TABLE GroupTable AUTO_INCREMENT = 1");

    // Buildings 테이블도 초기 상태로 되돌리기
    await pool.query("DELETE FROM Buildings");
    await pool.query("ALTER TABLE Buildings AUTO_INCREMENT = 1");

    // 기본 건물 데이터 다시 삽입
    await pool.query(`
            INSERT INTO Buildings (building_name, location) VALUES 
            ('과학관', '대학 북쪽'),
            ('도서관', '대학 중앙'),
            ('공학관', '대학 동쪽'),
            ('인문관', '대학 서쪽')
        `);
  } catch (error) {
    console.error("Error in test database setup:", error);
    throw error;
  }
};

module.exports = { setupTestDatabase };
