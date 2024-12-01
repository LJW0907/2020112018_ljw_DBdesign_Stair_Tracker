const axios = require("axios");
const baseURL = "http://localhost:3000/api/stair-usage";

describe("Stair Usage API Tests", () => {
  const testUserId = 1;
  const testBuildingId = 1;

  test("Should record stair usage", async () => {
    const stairUsage = {
      user_id: testUserId,
      building_id: testBuildingId,
      floors_climbed: 5,
    };

    const response = await axios.post(baseURL, stairUsage);
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("points_earned", 50);
  });

  test("Should get user stair usage records", async () => {
    const response = await axios.get(`${baseURL}/user/${testUserId}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.records)).toBe(true); // .records 추가
  });

  test("Should get building statistics", async () => {
    const response = await axios.get(
      `${baseURL}/building/${testBuildingId}/stats`
    );
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("total_uses");
  });
});
