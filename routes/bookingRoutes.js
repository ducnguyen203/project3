const express = require("express");
const BookingController = require("../controllers/bookingController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();


router.get("/all", verifyToken, isAdmin, BookingController.layTatCaDatVe);


router.post("/create", BookingController.taoDatVe);
router.post("/", BookingController.taoDatVe);

router.get("/search/:bookingCode", BookingController.timKiemDatVeTheoMa);
router.get("/:bookingCode", BookingController.timKiemDatVeTheoMa);
router.delete(
  "/delete/:bookingId",
  verifyToken,
  isAdmin,
  BookingController.deleteBooking
);
module.exports = router;
