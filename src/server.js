const app = require("./app");
const connectDB = require("./config/database");

const PORT = process.env.PORT || 3000;

// Kết nối MongoDB
connectDB();

// Chạy server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
