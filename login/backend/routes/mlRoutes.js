const express = require("express");
const { predictDiabetes } = require("../controllers/mlController");

const router = express.Router();

router.post("/predict", predictDiabetes);

module.exports = router;
