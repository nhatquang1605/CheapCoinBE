const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/database");
const initRoute = require("./src/routes/index");
const cron = require("node-cron");
const updateIsNew = require("./src/jobs/backgroundJob"); // Import job

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kết nối MongoDB & routes
connectDB();
initRoute(app);

// Chạy job mỗi 5 phút để test (thay vì mỗi ngày)
cron.schedule("*/5 * * * *", async () => {
  console.log("🚀 Running job: Update 'isNew' field for Series...");
  try {
    await updateIsNew();
    console.log("✅ Job completed successfully");
  } catch (error) {
    console.error("❌ Job failed:", error);
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
