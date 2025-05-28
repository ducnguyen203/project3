const express = require("express");
const router = express.Router();
const PassengerServiceController = require("../controllers/PassengerServiceController");

router.get("/seats", PassengerServiceController.getSeatMap);
router.post("/seats/assign", PassengerServiceController.assignSeat);

module.exports = router;
