const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const { verifyToken } = require("../middleware/authMiddleware");

router.delete("/delete/:ticketId", verifyToken, ticketController.deleteTicket);

module.exports = router;
