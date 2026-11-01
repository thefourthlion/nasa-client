const express = require("express");
const rateLimit = require("express-rate-limit");
const { requireIngest } = require("../middleware/ingest");
const {
  createApod,
  readApod,
  readApodFromID,
  readApodByDate,
  updateApod,
  deleteApod,
} = require("../controllers/Apod");

const router = express.Router();
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/read", readApod);
router.get("/read/:id", readApodFromID);
router.get("/date/:date", readApodByDate);
router.post("/create", writeLimiter, requireIngest, createApod);
router.post("/update/:id", writeLimiter, requireIngest, updateApod);
router.delete("/delete/:id", writeLimiter, requireIngest, deleteApod);

module.exports = router;
