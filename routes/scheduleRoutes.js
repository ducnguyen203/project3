const express = require("express");
const router = express.Router();
const ScheduleController = require("../controllers/ScheduleController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware"); // Thêm dòng này

// ✅ Lấy danh sách lịch trình: ai cũng xem được
router.get("/all", ScheduleController.getAllSchedules);

// ✅ Tạo, sửa, xoá: yêu cầu admin
router.post("/create", verifyToken, isAdmin, ScheduleController.createSchedule);
router.delete("/:id", verifyToken, isAdmin, ScheduleController.deleteSchedule);
router.put("/:id", verifyToken, isAdmin, ScheduleController.updateSchedule);

module.exports = router;
