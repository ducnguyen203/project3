const express = require("express");
const router = express.Router();
const BookingController = require("../controllers/bookingController");

// POST /api/bookings - Tạo đặt vé mới
router.post("/", BookingController.taoDatVe);

module.exports = router;
