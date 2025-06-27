const express = require("express");
const router = express.Router();
const airportController = require("../controllers/airportController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");


router.get("/", airportController.getAllAirports);
router.get("/:id", airportController.getAirportById);


router.post("/", verifyToken, isAdmin, airportController.createAirport);
router.put(
  "/airports/:id",
  verifyToken,
  isAdmin,
  airportController.updateAirport
);
router.delete("/:id", verifyToken, isAdmin, airportController.deleteAirport);

module.exports = router;
