const mongoose = require("mongoose");

const ApodSchema = new mongoose.Schema(
  {
    copyright: { type: String, required: true, maxlength: 500 },
    date: { type: String, required: true, unique: true, maxlength: 10 },
    explanation: { type: String, required: true, maxlength: 8000 },
    hdurl: { type: String, required: true, maxlength: 2000 },
    media_type: { type: String, required: true, enum: ["image", "video"], maxlength: 20 },
    service_version: { type: String, required: true, maxlength: 20 },
    title: { type: String, required: true, maxlength: 300 },
    url: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Apod", ApodSchema);
