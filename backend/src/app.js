const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const stairUsageRoutes = require("./routes/stairUsageRoutes");
const pointRoutes = require("./routes/pointRoutes");
const rewardRoutes = require("./routes/rewardRoutes");
const groupRoutes = require("./routes/groupRoutes");
const buildingRoutes = require("./routes/buildingRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/stair-usage", stairUsageRoutes);
app.use("/api/points", pointRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/buildings", buildingRoutes);

// Test database connection
app.get("/test-db", async (req, res) => {
  try {
    const [result] = await pool.query("SELECT 1");
    res.json({ message: "Database connection successful!", result });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Database connection failed!", error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
