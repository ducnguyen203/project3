const express = require("express");
const router = express.Router();
const ScheduleController = require("../controllers/ScheduleController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware"); 


router.get("/all", ScheduleController.getAllSchedules);


router.post("/create", verifyToken, isAdmin, ScheduleController.createSchedule);
router.delete("/:id", verifyToken, isAdmin, ScheduleController.deleteSchedule);
router.put("/:id", verifyToken, isAdmin, ScheduleController.updateSchedule);

module.exports = router;
