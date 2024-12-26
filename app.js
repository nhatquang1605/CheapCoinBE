const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/database");
const initRoute = require("./src/routes/index");

const app = express(); // Khởi tạo ứng dụng Express
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json()); // Middleware xử lý JSON
app.use(express.urlencoded({ extended: true })); // Middleware xử lý form-urlencoded

// Kết nối MongoDB
connectDB();
initRoute(app);

// Chạy server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
