const express = require("express");
const { askChat } = require("../controllers/chatController");

const router = express.Router();

router.post("/ask", askChat);

module.exports = router;
