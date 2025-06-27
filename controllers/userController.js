const pool = require("../config/db");

const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.execute(
      "SELECT * FROM users ORDER BY created_at DESC"
    );
    res.json(users);
  } catch (error) {
    console.error("Lỗi lấy danh sách người dùng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
  
    const [result] = await pool.execute("DELETE FROM users WHERE user_id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json({ message: "Xóa người dùng thành công" });
  } catch (error) {
    console.error("Lỗi xoá người dùng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = { getAllUsers, deleteUser };
