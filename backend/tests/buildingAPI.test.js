const axios = require("axios");
const baseURL = "http://localhost:3000/api/buildings";

describe("Buildings API Tests", () => {
  // 테스트에 사용할 새로운 건물 데이터
  const newBuilding = {
    building_name: "테스트건물",
    location: "테스트 위치",
  };

  // 생성된 건물의 ID를 저장할 변수
  let createdBuildingId;

  // 시작 시 기존 건물 수를 저장
  let initialBuildingCount;

  // 모든 테스트 전에 실행
  beforeAll(async () => {
    try {
      const response = await axios.get(baseURL);
      initialBuildingCount = response.data.length;
    } catch (error) {
      console.error("Error in test setup:", error);
    }
  });

  // 건물 목록 조회 테스트
  test("Should get all buildings", async () => {
    try {
      const response = await axios.get(baseURL);

      // 기본적인 응답 검증
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBe(initialBuildingCount);

      // 건물 객체의 구조 검증
      const building = response.data[0];
      expect(building).toHaveProperty("building_id");
      expect(building).toHaveProperty("building_name");
      expect(building).toHaveProperty("location");
    } catch (error) {
      throw error;
    }
  });

  // 새로운 건물 추가 테스트
  test("Should add a new building", async () => {
    try {
      // 새 건물 추가
      const createResponse = await axios.post(baseURL, newBuilding);
      createdBuildingId = createResponse.data.building_id;

      expect(createResponse.status).toBe(201);
      expect(createResponse.data).toHaveProperty("building_id");
      expect(createResponse.data.message).toBe("Building added successfully");

      // 건물이 실제로 추가되었는지 확인
      const getAllResponse = await axios.get(baseURL);
      expect(getAllResponse.data.length).toBe(initialBuildingCount + 1);

      // 추가된 건물의 데이터 확인
      const addedBuilding = getAllResponse.data.find(
        (b) => b.building_id === createdBuildingId
      );
      expect(addedBuilding.building_name).toBe(newBuilding.building_name);
      expect(addedBuilding.location).toBe(newBuilding.location);
    } catch (error) {
      throw error;
    }
  });

  // 특정 건물 조회 테스트
  test("Should get a specific building", async () => {
    try {
      const response = await axios.get(`${baseURL}/${createdBuildingId}`);

      expect(response.status).toBe(200);
      expect(response.data.building_name).toBe(newBuilding.building_name);
      expect(response.data.location).toBe(newBuilding.location);
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
