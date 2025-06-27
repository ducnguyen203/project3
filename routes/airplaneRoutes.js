const express = require("express");
const router = express.Router();
const airplaneController = require("../controllers/airplaneController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

router.get("/", airplaneController.getAllAirplanes);
router.get("/:id", airplaneController.getAirplaneById);

router.post("/", verifyToken, isAdmin, airplaneController.createAirplane);
router.put("/:id", verifyToken, isAdmin, airplaneController.updateAirplane);
router.delete("/:id", verifyToken, isAdmin, airplaneController.deleteAirplane);

module.exports = router;
