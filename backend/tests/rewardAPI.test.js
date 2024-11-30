const axios = require("axios");
const baseURL = "http://localhost:3000/api/rewards";

describe("Rewards API Tests", () => {
  const testUserId = 1;

  // 테스트 전에 포인트 적립
  beforeAll(async () => {
    // 계단 사용으로 포인트 적립
    await axios.post("http://localhost:3000/api/stair-usage", {
      user_id: testUserId,
      building_id: 1,
      floors_climbed: 20, // 200포인트 적립
    });
  });

  // 사용 가능한 보상 목록 조회 테스트
  test("Should get available rewards", async () => {
    const response = await axios.get(`${baseURL}/available`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.data[0]).toHaveProperty("reward_name");
    expect(response.data[0]).toHaveProperty("points_required");
  });

  // 보상 교환 테스트
  test("Should claim a reward", async () => {
    const response = await axios.post(`${baseURL}/claim`, {
      user_id: testUserId,
      reward_id: 1,
    });

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty(
      "message",
      "Reward claimed successfully"
    );
    expect(response.data).toHaveProperty("remaining_points");
  });

  // 포인트 부족 시 보상 교환 실패 테스트
  test("Should fail to claim reward with insufficient points", async () => {
    try {
      await axios.post(`${baseURL}/claim`, {
        user_id: testUserId,
        reward_id: 2, // 200포인트 필요한 보상
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toBe("Insufficient points");
    }
  });

  // 보상 획득 내역 조회 테스트
  test("Should get reward history", async () => {
    const response = await axios.get(`${baseURL}/history/${testUserId}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.data[0]).toHaveProperty("reward_name");
    expect(response.data[0]).toHaveProperty("claimed_at");
  });
});
