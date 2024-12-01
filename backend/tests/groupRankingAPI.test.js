const axios = require("axios");
const baseURL = "http://localhost:3000/api/groups";

describe("Group Ranking API Tests", () => {
  // 테스트에 필요한 데이터를 저장할 객체입니다
  let testData = {
    users: [],
    groupId: null,
    initialRankings: null,
  };

  // 테스트 환경을 설정하는 부분입니다
  beforeAll(async () => {
    // 먼저 세 명의 테스트 사용자를 생성합니다. 이는 의미 있는 랭킹 비교를 위해 필요합니다
    for (let i = 1; i <= 3; i++) {
      const timestamp = Date.now();
      const userResponse = await axios.post(
        "http://localhost:3000/api/users/register",
        {
          username: `ranktest_user${i}_${timestamp}`,
          email: `ranktest${i}_${timestamp}@example.com`,
          password: "password123",
        }
      );
      testData.users.push(userResponse.data.userId);
    }

    // 테스트용 그룹을 생성합니다
    const groupResponse = await axios.post(baseURL, {
      group_name: `Ranking Test Group ${Date.now()}`,
      created_by: testData.users[0], // 첫 번째 사용자가 그룹을 생성합니다
    });
    testData.groupId = groupResponse.data.group_id;

    // 나머지 사용자들을 그룹에 참여시킵니다
    for (let i = 1; i < testData.users.length; i++) {
      await axios.post(`${baseURL}/join`, {
        user_id: testData.users[i],
        group_id: testData.groupId,
      });
    }
  });

  // 초기 랭킹 상태를 테스트합니다
  test("should show initial rankings with all members", async () => {
    const response = await axios.get(`${baseURL}/${testData.groupId}/rankings`);

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("rankings");
    expect(response.data).toHaveProperty("group_stats");
    expect(response.data.rankings.length).toBe(testData.users.length);

    // 초기 상태에서는 모든 사용자의 포인트가 0이어야 합니다
    response.data.rankings.forEach((ranking) => {
      expect(ranking.weekly_points).toBe(0);
      expect(ranking.weekly_stairs).toBe(0);
    });

    testData.initialRankings = response.data.rankings;
  });

  // 활동 후 랭킹 변화를 테스트합니다
  test("should update rankings after stair usage", async () => {
    // 두 번째 사용자가 가장 많은 계단을 이용합니다
    await axios.post("http://localhost:3000/api/stair-usage", {
      user_id: testData.users[1],
      building_id: 1,
      floors_climbed: 10,
    });

    // 세 번째 사용자는 그 다음으로 많이 이용합니다
    await axios.post("http://localhost:3000/api/stair-usage", {
      user_id: testData.users[2],
      building_id: 1,
      floors_climbed: 5,
    });

    // 랭킹을 다시 확인합니다
    const response = await axios.get(`${baseURL}/${testData.groupId}/rankings`);

    expect(response.status).toBe(200);

    // 순위가 올바르게 매겨졌는지 확인합니다
    const rankings = response.data.rankings;
    expect(rankings[0].user_id).toBe(testData.users[1]); // 가장 많이 이용한 사용자가 1위
    expect(rankings[1].user_id).toBe(testData.users[2]); // 두 번째로 많이 이용한 사용자가 2위

    // 포인트가 올바르게 계산되었는지 확인합니다
    expect(rankings[0].weekly_points).toBe(100); // 10층 * 10포인트
    expect(rankings[1].weekly_points).toBe(50); // 5층 * 10포인트
  });

  // 그룹 전체 통계를 테스트합니다
  test("should calculate correct group statistics", async () => {
    const response = await axios.get(`${baseURL}/${testData.groupId}/rankings`);

    const stats = response.data.group_stats;
    expect(stats.total_stairs_this_week).toBe(15); // 총 15층 (10 + 5)
    expect(stats.total_points_this_week).toBe(150); // 총 150포인트 (100 + 50)
    expect(stats.active_users_this_week).toBe(2); // 활동한 사용자 2명
  });

  // 시간 범위별 랭킹을 테스트합니다
  test("should only include activities within the past week", async () => {
    // 일주일 전의 활동은 이번 주 랭킹에 포함되지 않아야 합니다
    const response = await axios.get(`${baseURL}/${testData.groupId}/rankings`);

    expect(response.data.rankings[0].weekly_stairs).toBe(10); // 이번 주 활동만 포함
    expect(response.data.rankings[1].weekly_stairs).toBe(5); // 이번 주 활동만 포함
  });
});
