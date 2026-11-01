const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/mongoose");
const { clientOrigins, secretOk } = require("./lib/security");

const PORT = Number(process.env.PORT) || 3002;

function assertConfig() {
  const uri = process.env.MONGO_URI || "";
  if (!uri.startsWith("mongodb") || !uri.includes("@")) {
    console.error("MONGO_URI must be a credentialed mongodb URI");
    process.exit(1);
  }
  if (uri.includes("replace-with-a-long-random-string")) {
    console.error("Refusing placeholder database credentials");
    process.exit(1);
  }
  if (process.env.MONGO_PASSWORD && !secretOk(process.env.MONGO_PASSWORD)) {
    console.error("MONGO_PASSWORD must be a unique value of at least 24 characters");
    process.exit(1);
  }
  if (!secretOk(process.env.INGEST_TOKEN)) {
    console.error("INGEST_TOKEN must be a unique value of at least 24 characters");
    process.exit(1);
  }
  if (!process.env.NASA_API_KEY) {
    console.error("NASA_API_KEY is not set; NASA DEMO_KEY rate limits apply");
  }
}

assertConfig();

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", false);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));

const origins = new Set(clientOrigins());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origins.has(origin)) return callback(null, true);
      return callback(null, false);
    },
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "X-Ingest-Token"],
    maxAge: 600,
  })
);

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 600,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

const nasaLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/nasa", nasaLimiter, require("./routes/nasa"));
app.use("/api/apod", require("./routes/Apod"));

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  if (err && (err.type === "entity.parse.failed" || err instanceof SyntaxError)) {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  if (err && err.type === "entity.too.large") {
    return res.status(413).json({ error: "Payload too large" });
  }
  if (res.headersSent) return next(err);
  return res.status(500).json({ error: "Internal server error" });
});

connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Listening on port ${PORT}`);
    });
  })
  .catch(() => {
    console.error("Database connection failed");
    process.exit(1);
  });
