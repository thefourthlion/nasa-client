const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri || !uri.startsWith("mongodb")) {
    throw new Error("MONGO_URI is required");
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10,
  });
  console.log("Database connected");
}

module.exports = connectDB;
