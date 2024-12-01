const axios = require("axios");
const baseURL = "http://localhost:3000/api/groups";

// 테스트에 필요한 기본 데이터를 beforeAll에서 설정
let testData;

beforeAll(() => {
  testData = {
    groupId: null,
    userId: 1,
    secondUserId: 2,
    groupName: `Test Group ${Date.now()}`,
  };
});

// 각 테스트를 독립적인 describe 블록으로 분리
describe("Group API", () => {
  let testData = {
    firstUser: null,
    secondUser: null,
    groupId: null,
  };

  // 테스트 데이터 설정
  beforeAll(async () => {
    // 첫 번째 테스트 사용자 생성
    const firstUserResponse = await axios.post(
      "http://localhost:3000/api/users/register",
      {
        username: `testuser1_${Date.now()}`,
        email: `testuser1_${Date.now()}@example.com`,
        password: "password123",
      }
    );
    testData.firstUser = firstUserResponse.data.userId;

    // 두 번째 테스트 사용자 생성
    const secondUserResponse = await axios.post(
      "http://localhost:3000/api/users/register",
      {
        username: `testuser2_${Date.now()}`,
        email: `testuser2_${Date.now()}@example.com`,
        password: "password123",
      }
    );
    testData.secondUser = secondUserResponse.data.userId;
  });

  // 그룹 생성 테스트
  test("should create a new group", async () => {
    const response = await axios.post(baseURL, {
      group_name: `Test Group ${Date.now()}`,
      created_by: testData.firstUser,
    });

    testData.groupId = response.data.group_id;
    expect(response.status).toBe(201);
    expect(response.data.message).toBe("Group created successfully");
  });

  // 이미 있던 테스트들은 그대로 유지하되, user_id 참조를 testData.firstUser와 testData.secondUser로 수정

  test("should allow new user to join group", async () => {
    const response = await axios.post(`${baseURL}/join`, {
      user_id: testData.secondUser,
      group_id: testData.groupId,
    });

    expect(response.status).toBe(201);
    expect(response.data.message).toBe("Joined group successfully");

    const groupResponse = await axios.get(`${baseURL}/${testData.groupId}`);
    expect(groupResponse.data.members.length).toBeGreaterThan(1);
  });

  // 선택적: 테스트 후 정리
  afterAll(async () => {
    // 필요한 경우 생성된 테스트 데이터 정리
    // 이 예제에서는 생략 (데이터베이스 관리 정책에 따라 구현)
  });
});
