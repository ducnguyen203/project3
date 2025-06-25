const express = require("express");
const router = express.Router();
const FlightsController = require("../controllers/FlightsController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

router.get("/", FlightsController.getAllFlights); // ✅ API lấy danh sách chuyến bay
router.get("/search", FlightsController.searchFlights);
router.post("/", verifyToken, isAdmin, FlightsController.createFlight);
router.delete(
  "/:flightId",
  verifyToken,
  isAdmin,
  FlightsController.deleteFlight
);
router.put("/:flightId", verifyToken, isAdmin, FlightsController.updateFlight);

module.exports = router;
