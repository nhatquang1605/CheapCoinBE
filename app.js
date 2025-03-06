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

// Biến kiểm tra job đã chạy chưa (trong ngày)
let lastRunDate = null;

// Kết nối MongoDB & routes
connectDB();
initRoute(app);

// Chạy job vào 12h đêm mỗi ngày (chỉ chạy nếu chưa chạy trong ngày)
cron.schedule("0 0 * * *", async () => {
  const today = new Date().toISOString().split("T")[0]; // Lấy ngày hiện tại (YYYY-MM-DD)

  if (lastRunDate === today) {
    console.log("Job already ran today. Skipping...");
    return;
  }

  console.log("Running job: Update 'isNew' field for Series...");
  try {
    await updateIsNew();
    console.log("Job completed successfully");
    lastRunDate = today; // Cập nhật ngày chạy cuối cùng
  } catch (error) {
    console.error("Job failed:", error);
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
