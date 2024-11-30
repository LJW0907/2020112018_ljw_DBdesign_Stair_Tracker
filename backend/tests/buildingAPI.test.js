const axios = require("axios");
const baseURL = "http://localhost:3000/api/buildings";

describe("Buildings API Tests", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  let testBuildingId;

  // 모든 건물 목록 조회 테스트
  test("Should initially have 4 buildings", async () => {
    const response = await axios.get(baseURL);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBe(4);

    const building = response.data[0];
    expect(building).toHaveProperty("building_id");
    expect(building).toHaveProperty("building_name");
    expect(building).toHaveProperty("location");
  });

  // 건물 추가 테스트
  test("Should add a new building", async () => {
    const newBuilding = {
      building_name: "테스트건물",
      location: "테스트 위치",
    };

    try {
      const response = await axios.post(baseURL, newBuilding);
      testBuildingId = response.data.building_id;

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("building_id");
      expect(response.data.message).toBe("Building added successfully");

      // 건물이 실제로 추가되었는지 확인
      const getAllResponse = await axios.get(baseURL);
      expect(getAllResponse.data.length).toBe(5);
    } catch (error) {
      throw error;
    }
  });

  // 특정 건물 정보 조회 테스트
  test("Should get a specific building", async () => {
    try {
      const response = await axios.get(`${baseURL}/${testBuildingId}`);

      expect(response.status).toBe(200);
      expect(response.data.building_name).toBe("테스트건물");
      expect(response.data.location).toBe("테스트 위치");
    } catch (error) {
      throw error;
    }
  });

  // 존재하지 않는 건물 조회 시 에러 테스트
  test("Should return 404 for non-existent building", async () => {
    try {
      await axios.get(`${baseURL}/9999`);
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.message).toBe("Building not found");
    }
  });
});
