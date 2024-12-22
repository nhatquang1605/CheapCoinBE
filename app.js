const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");

const app = express(); // Khởi tạo ứng dụng Express
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON request body

// Định tuyến (có thể import từ routes nếu có)
app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.use("/", require("./src/routes"));

// Kết nối MongoDB
connectDB();

// Chạy server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
