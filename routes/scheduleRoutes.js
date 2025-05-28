const express = require("express");
const router = express.Router();
const ScheduleController = require("../controllers/ScheduleController");

// Lấy danh sách chuyến bay kèm giá vé
router.get("/all", ScheduleController.getAllSchedules);
// Tạo lịch trình chuyến bay mới
router.post("/create", ScheduleController.createSchedule);
module.exports = router;
