const express = require("express");
const router = express.Router();
const airportController = require("../controllers/airportController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// Ai cũng có thể xem danh sách sân bay
router.get("/", airportController.getAllAirports);
router.get("/:id", airportController.getAirportById);

// Chỉ Admin mới có quyền thêm, sửa, xóa sân bay
router.post("/", verifyToken, isAdmin, airportController.createAirport);
router.put(
  "/airports/:id",
  verifyToken,
  isAdmin,
  airportController.updateAirport
);
router.delete("/:id", verifyToken, isAdmin, airportController.deleteAirport);

module.exports = router;
