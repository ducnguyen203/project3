const jwt = require("jsonwebtoken");

// Middleware kiểm tra token (xác thực user đã đăng nhập)
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Lấy token từ header
  if (!token) {
    return res.status(403).json({ message: "Bạn cần đăng nhập!" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: "Token không hợp lệ!" });

    req.user = user; // Lưu user vào request
    next();
  });
};

// Middleware kiểm tra quyền Admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Bạn không có quyền truy cập!" });
  }
  next();
};

module.exports = { verifyToken, isAdmin };
