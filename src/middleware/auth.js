const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_ACCESS_SECRET;

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Bạn chưa đăng nhập!" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token không hợp lệ!" });

    req.user = decoded;
    next();
  });
};

module.exports = { verifyToken };
