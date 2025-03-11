const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/database");
const initRoute = require("./src/routes/index");
const cron = require("node-cron");
const axios = require("axios");
const updateIsNew = require("./src/jobs/backgroundJob"); // Import job

const app = express();
const PORT = process.env.PORT || 5000;
const PING_URL = "https://cheapcoinbe.onrender.com/api/v1/seri/?page=1&limit=5";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kết nối MongoDB & routes
connectDB();
initRoute(app);

cron.schedule("0 0 * * *", async () => {
  console.log("🚀 Running job: Update 'isNew' field for Series...");
  try {
    await updateIsNew();
    console.log("✅ Job completed successfully");
  } catch (error) {
    console.error("❌ Job failed:", error);
  }
});

// Gửi request mỗi 5 phút
cron.schedule("*/5 * * * *", async () => {
  try {
    const res = await axios.get(PING_URL);
    console.log("Ping thành công:", res.data);
  } catch (error) {
    console.error("Lỗi khi ping server:", error.message);
  }
});

// Giữ process luôn chạy (tránh bị Render kill)
setInterval(() => {
  console.log("Keeping process alive...");
}, 1000 * 60 * 10); // Log mỗi 10 phút

// Chạy server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
