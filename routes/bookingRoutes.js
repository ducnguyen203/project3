const express = require("express");
const BookingController = require("../controllers/bookingController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// 🔒 Route chỉ Admin mới được xem tất cả các booking
router.get("/all", verifyToken, isAdmin, BookingController.layTatCaDatVe);

// ✅ Route người dùng đã đăng nhập có thể đặt vé
router.post("/create", BookingController.taoDatVe);
router.post("/", BookingController.taoDatVe);
// 🔎 Tìm kiếm đặt vé theo mã (không cần đăng nhập nếu bạn muốn mở public)
router.get("/search/:bookingCode", BookingController.timKiemDatVeTheoMa);
router.get("/:bookingCode", BookingController.timKiemDatVeTheoMa);
router.delete(
  "/delete/:bookingId",
  verifyToken,
  isAdmin,
  BookingController.deleteBooking
);
module.exports = router;
