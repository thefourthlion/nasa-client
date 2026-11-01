const { tokensMatch } = require("../lib/security");

function requireIngest(req, res, next) {
  const expected = process.env.INGEST_TOKEN || "";
  if (expected.length < 24) {
    return res.status(503).json({ error: "Ingest is not configured" });
  }
  const provided = req.get("x-ingest-token") || "";
  if (!provided || !tokensMatch(provided, expected)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return next();
}

module.exports = { requireIngest };
