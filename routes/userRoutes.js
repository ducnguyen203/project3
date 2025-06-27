const express = require("express");
const router = express.Router();
const { getAllUsers, deleteUser } = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware"); 

router.get("/", verifyToken, getAllUsers);
router.delete("/:id", verifyToken, deleteUser);
module.exports = router;
