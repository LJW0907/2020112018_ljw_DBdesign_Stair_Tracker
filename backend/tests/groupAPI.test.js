const axios = require("axios");
const { setupTestDatabase } = require("./setup");
const baseURL = "http://localhost:3000/api/groups";

describe("Group API Tests", () => {
  // 테스트에 필요한 변수들을 선언합니다
  let testGroupId;
  const testUser = {
    user_id: 1,
    username: "testuser",
  };

  // 각 테스트 시작 전에 데이터베이스를 초기화합니다
  beforeAll(async () => {
    await setupTestDatabase();
  });

  // 그룹 생성 테스트
  test("Should create a new group", async () => {
    const groupData = {
      group_name: `Test Group ${Date.now()}`,
      created_by: testUser.user_id,
      description: "This is a test group",
    };

    try {
      const response = await axios.post(baseURL, groupData);
      testGroupId = response.data.group_id;

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("group_id");
      expect(response.data.message).toBe("Group created successfully");

      // 생성된 그룹 ID를 저장하여 후속 테스트에서 사용
      console.log("Created group ID:", testGroupId);
    } catch (error) {
      console.error("Complete error:", error.response?.data);
      throw error;
    }
  });

  // 그룹 검색 테스트는 그룹이 생성된 후에 실행
  test("Should search for groups", async () => {
    try {
      const response = await axios.get(`${baseURL}/search?term=Test`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);

      const group = response.data[0];
      expect(group).toHaveProperty("group_name");
      expect(group).toHaveProperty("member_count");
    } catch (error) {
      console.error("Complete error:", error.response?.data);
      throw error;
    }
  });

  // 그룹 상세 정보 조회 테스트
  test("Should get group details", async () => {
    // testGroupId가 정의되었는지 확인
    expect(testGroupId).toBeDefined();

    try {
      const response = await axios.get(`${baseURL}/${testGroupId}`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("group_name");
      expect(response.data).toHaveProperty("member_count");
      expect(response.data.member_count).toBeGreaterThanOrEqual(1);
    } catch (error) {
      console.error("Complete error:", error.response?.data);
      throw error;
    }
  });

  // 그룹 멤버 조회 테스트
  test("Should get group members with their stats", async () => {
    expect(testGroupId).toBeDefined();

    try {
      const response = await axios.get(`${baseURL}/${testGroupId}/members`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);

      const member = response.data[0];
      expect(member).toHaveProperty("username");
      expect(member).toHaveProperty("today_floors");
      expect(member).toHaveProperty("total_floors");
      expect(member).toHaveProperty("total_points");
    } catch (error) {
      console.error("Complete error:", error.response?.data);
      throw error;
    }
  });

  // 그룹 가입 테스트
  test("Should join a group", async () => {
    expect(testGroupId).toBeDefined();

    const joinData = {
      user_id: 2,
      group_id: testGroupId,
    };

    try {
      const response = await axios.post(`${baseURL}/join`, joinData);

      expect(response.status).toBe(201);
      expect(response.data.message).toBe("Successfully joined the group");
    } catch (error) {
      console.error("Complete error:", error.response?.data);
      throw error;
    }
  });

  // 중복 가입 방지 테스트
  test("Should prevent duplicate group joining", async () => {
    expect(testGroupId).toBeDefined();

    const joinData = {
      user_id: testUser.user_id,
      group_id: testGroupId,
    };

    try {
      await axios.post(`${baseURL}/join`, joinData);
      throw new Error("Should not allow duplicate joining");
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toBe(
        "Already a member of this group"
      );
    }
  });

  // 그룹 탈퇴 테스트
  test("Should leave a group", async () => {
    expect(testGroupId).toBeDefined();

    try {
      const response = await axios.delete(`${baseURL}/${testGroupId}/leave`, {
        data: { user_id: 2 },
      });

      expect(response.status).toBe(200);
      expect(response.data.message).toBe("Successfully left the group");
    } catch (error) {
      console.error("Complete error:", error.response?.data);
      throw error;
    }
  });
});
