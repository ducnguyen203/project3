// routes/flightRoutes.js
const express = require("express");
const router = express.Router();
const FlightsController = require("../controllers/FlightsController");

// Route tìm kiếm chuyến bay
router.get("/search", FlightsController.searchFlights);

module.exports = router;
