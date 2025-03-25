const express = require("express");
const router = express.Router();
const {
  createApod,
  readApod,
  readApodFromID,
  readApodByDate,
  updateApod,
  deleteApod,
} = require("../controllers/Apod");
router.route("/create").post(createApod);
router.route("/read").get(readApod);
router.route("/read/:id").get(readApodFromID);
router.route("/date/:date").get(readApodByDate);
router.route("/update/:id").post(updateApod);
router.route("/delete/:id").delete(deleteApod);
module.exports = router;
