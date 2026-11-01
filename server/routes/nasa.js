const express = require("express");
const { apodByDate, epicByDate, marsByDate } = require("../controllers/nasa");

const router = express.Router();
router.get("/apod", apodByDate);
router.get("/epic", epicByDate);
router.get("/mars", marsByDate);

module.exports = router;
