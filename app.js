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

app.get("/ping", (req, res) => {
  res.status(200).json({ message: "Server is running!" });
});

// Giữ process luôn chạy (tránh bị Render kill)
setInterval(() => {
  fetch(PING_URL)
    .then((res) => console.log(`Ping status: ${res.status}`))
    .catch((err) => console.error("Ping failed:", err));
}, 5 * 60 * 1000); // Gửi request mỗi 5 phút

// Chạy server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
