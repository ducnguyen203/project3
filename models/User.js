const db = require("../config/db");
const bcrypt = require("bcrypt");

class User {
  static async create(full_name, email, password, phone) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query =
      "INSERT INTO users (full_name, email, password, phone, created_at) VALUES (?, ?, ?, ?, NOW())";
    const [result] = await db.execute(query, [
      full_name,
      email,
      hashedPassword,
      phone,
    ]);
    return result;
  }

  static async findByEmail(email) {
    const query = "SELECT * FROM users WHERE email = ?";
    const [rows] = await db.execute(query, [email]);
    return rows.length ? rows[0] : null;
  }
}

module.exports = User;
