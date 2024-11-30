const axios = require("axios");
const baseURL = "http://localhost:3000/api/users";

let userId;
const testUser = {
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: "testpass123",
};

beforeAll(async () => {
  // 테스트 시작 전 필요한 설정
});

afterAll(async () => {
  // 테스트 후 정리
});

describe("User API Tests", () => {
  test("Should register a new user", async () => {
    const response = await axios.post(`${baseURL}/register`, testUser);
    userId = response.data.userId;
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("userId");
  });

  test("Should login with correct credentials", async () => {
    const response = await axios.post(`${baseURL}/login`, {
      email: testUser.email,
      password: testUser.password,
    });
    expect(response.status).toBe(200);
    expect(response.data.message).toBe("Login successful");
  });

  test("Should get user information", async () => {
    const response = await axios.get(`${baseURL}/${userId}`);
    expect(response.status).toBe(200);
    expect(response.data.username).toBe(testUser.username);
  });
});
