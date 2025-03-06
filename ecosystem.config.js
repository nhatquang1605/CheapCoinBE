module.exports = {
  apps: [
    {
      name: "CheapCoin", // (1) API chính
      script: "app.js", // (2) Chạy từ app.js (cron job sẽ chạy từ đây)
      instances: 1, // (3) Giữ 1 instance để tránh trùng lặp job
      exec_mode: "fork", // (4) Không cần cluster mode (vì job chạy cron)
      watch: false, // (5) Không cần watch file (tránh restart liên tục)
      autorestart: true, // (6) Chỉ restart nếu lỗi (không restart vô lý)
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
