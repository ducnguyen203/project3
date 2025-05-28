const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config(); // Load biến môi trường từ .env

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Lỗi kết nối MySQL:", err);
  } else {
    console.log("Kết nối MySQL thành công!");
    connection.release();
  }
});

module.exports = pool.promise(); // Sử dụng promise để dễ dàng xử lý async/await
