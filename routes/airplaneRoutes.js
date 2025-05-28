const express = require("express");
const router = express.Router();
const airplaneController = require("../controllers/airplaneController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// Ai cũng có thể xem danh sách máy bay
router.get("/", airplaneController.getAllAirplanes);
router.get("/:id", airplaneController.getAirplaneById);

// Chỉ Admin mới có quyền thêm, sửa, xóa máy bay
router.post("/", verifyToken, isAdmin, airplaneController.createAirplane);
router.put("/:id", verifyToken, isAdmin, airplaneController.updateAirplane);
router.delete("/:id", verifyToken, isAdmin, airplaneController.deleteAirplane);

module.exports = router;
