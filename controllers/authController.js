const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db"); // Kết nối database

// Tạo Access Token
const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// Tạo Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

// Đăng ký tài khoản
const register = async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const [existingUser] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email đã tồn tại!" });
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Thêm vào database với role mặc định là 'user'
    const sql = `INSERT INTO users (full_name, email, password, phone, role) VALUES (?, ?, ?, ?, 'user')`;
    await pool.execute(sql, [full_name, email, hashedPassword, phone]);

    res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (error) {
    console.error("🔥 Lỗi Server:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Đăng nhập tài khoản
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra user có tồn tại không
    const [user] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (user.length === 0) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng!" });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng!" });
    }

    // Tạo token
    const accessToken = generateAccessToken(user[0]);
    const refreshToken = generateRefreshToken(user[0]);

    // Lưu Refresh Token vào cookie HTTP-only
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    res.json({ accessToken, role: user[0].role, userId: user[0].id });
  } catch (error) {
    console.error("🔥 Lỗi Server:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// API làm mới Access Token
const refreshToken = (req, res) => {
  const token = req.cookies.refreshToken; // 🛠 Fix lỗi lấy cookies
  if (!token)
    return res.status(403).json({ message: "Không có Refresh Token!" });

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ message: "Refresh Token không hợp lệ!" });

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  });
};

// Đăng xuất (Xóa cookie Refresh Token)
const logout = (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
    });
    res.status(200).json({ message: "Đăng xuất thành công!" });
  } catch (error) {
    console.error("Lỗi logout:", error);
    res.status(500).json({ message: "Lỗi server khi đăng xuất" });
  }
};

module.exports = { register, login, logout, refreshToken };
