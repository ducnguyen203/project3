const express = require("express");
const router = express.Router();
const { getAllUsers, deleteUser } = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware"); // middleware xác thực

router.get("/", verifyToken, getAllUsers); // ✅ Đảm bảo đã xác thực
router.delete("/:id", verifyToken, deleteUser);
module.exports = router;
