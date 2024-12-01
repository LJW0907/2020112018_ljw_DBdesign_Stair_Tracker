const express = require("express");
const cors = require("cors");
const app = express();

// 라우터 임포트
const userRoutes = require("./routes/userRoutes");
const buildingRoutes = require("./routes/buildingRoutes");
const stairUsageRoutes = require("./routes/stairUsageRoutes");
const pointRoutes = require("./routes/pointRoutes");
const rewardRoutes = require("./routes/rewardRoutes");
const groupRoutes = require("./routes/groupRoutes");

// 미들웨어
app.use(cors());
app.use(express.json());

// 라우트 설정
app.use("/api/users", userRoutes);
app.use("/api/buildings", buildingRoutes);
app.use("/api/stair-usage", stairUsageRoutes);
app.use("/api/points", pointRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/groups", groupRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
