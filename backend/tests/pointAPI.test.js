const axios = require("axios");
const baseURL = "http://localhost:3000/api/points";

describe("Points API Tests", () => {
  const testUserId = 1; // 테스트용 사용자 ID

  // 테스트 전에 포인트 적립
  beforeAll(async () => {
    // 계단 사용으로 포인트 적립 (이미 구현된 API 사용)
    await axios.post("http://localhost:3000/api/stair-usage", {
      user_id: testUserId,
      building_id: 1,
      floors_climbed: 10, // 100포인트 적립
    });
  });

  // 총 포인트 조회 테스트
  test("Should get total points", async () => {
    const response = await axios.get(`${baseURL}/total/${testUserId}`);

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("total_points");
    expect(response.data.total_points).toBeGreaterThanOrEqual(100);
  });

  // 포인트 사용 테스트
  test("Should use points", async () => {
    const pointsToUse = 50;
    const response = await axios.post(`${baseURL}/use`, {
      user_id: testUserId,
      points: pointsToUse,
      reason: "Test point usage",
    });

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("remaining_points");
    expect(response.data.remaining_points).toBeGreaterThanOrEqual(50);
  });

  // 포인트 내역 조회 테스트
  test("Should get points history", async () => {
    const response = await axios.get(`${baseURL}/history/${testUserId}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);

    // 최근 기록 확인
    const lastRecord = response.data[0];
    expect(lastRecord).toHaveProperty("points");
    expect(lastRecord).toHaveProperty("reason");
  });

  // 잘못된 포인트 사용 테스트 (잔액 부족)
  test("Should fail when using more points than available", async () => {
    try {
      await axios.post(`${baseURL}/use`, {
        user_id: testUserId,
        points: 10000,
        reason: "Test excessive point usage",
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toBe("Insufficient points");
    }
  });
});
