module.exports = {
  testEnvironment: "node",
  testTimeout: 10000,
  verbose: true,
  // 순환 참조 문제를 해결하기 위한 설정
  maxWorkers: 1,
  // 직렬화 문제를 피하기 위한 설정
  testRunner: "jest-circus/runner",
};
