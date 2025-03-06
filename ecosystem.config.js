module.exports = {
  apps: [
    {
      name: "CheapCoin", // (1) Tên ứng dụng API
      script: "app.js", // (2) File chính của API
      instances: "1", // (3) Dùng tất cả CPU để tối ưu API
      exec_mode: "cluster", // (4) Chạy API ở chế độ cluster
      watch: true, // Theo dõi thay đổi và restart tự động (dùng trong dev)
      autorestart: true, // Tự động restart nếu API bị crash
      max_memory_restart: "500M", // Restart nếu RAM vượt quá 500MB
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
    {
      name: "Background-CheapCoin", // (5) Tên ứng dụng chạy ngầm
      script: "./src/jobs/backgroundJob.js", // (6) File chính xử lý job ngầm
      instances: 1, // (7) Chạy duy nhất 1 instance để tránh trùng lặp
      exec_mode: "fork", // (8) Chạy ở chế độ fork (1 process duy nhất)
      watch: false, // Không cần theo dõi file thay đổi với job ngầm
      autorestart: true, // Tự động restart nếu job bị crash
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
