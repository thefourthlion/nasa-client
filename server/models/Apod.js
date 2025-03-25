const mongoose = require("mongoose");
const ApodSchema = new mongoose.Schema(
  {
    copyright: { type: String, required: [true, "Please provide copyright"] },
    date: { unique: true, type: String, required: [true, "Please provide date"] },
    explanation: {
      type: String,
      required: [true, "Please provide explanation"],
    },
    hdurl: { type: String, required: [true, "Please provide hdurl"] },
    media_type: { type: String, required: [true, "Please provide media_type"] },
    service_version: {
      type: String,
      required: [true, "Please provide service_version"],
    },
    title: { type: String, required: [true, "Please provide title"] },
    url: { type: String, required: [true, "Please provide url"] },
  },
  { timestamps: true }
);
const Apod = mongoose.model("Apod", ApodSchema);
module.exports = Apod;
