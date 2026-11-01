const Apod = require("../models/Apod");
const {
  isRealDate,
  parseBoundedInt,
  asPlainString,
  isObjectId,
  normalizeUrl,
  toNasaHttps,
  isSafeHttpsUrl,
} = require("../lib/security");

function present(doc) {
  if (!doc) return null;
  const hdurl = toNasaHttps(doc.hdurl) || (isSafeHttpsUrl(doc.hdurl) ? doc.hdurl : "");
  const url = toNasaHttps(doc.url) || (isSafeHttpsUrl(doc.url) ? doc.url : "");
  return {
    id: String(doc._id),
    copyright: doc.copyright,
    date: doc.date,
    explanation: doc.explanation,
    hdurl,
    media_type: doc.media_type,
    service_version: doc.service_version,
    title: doc.title,
    url,
  };
}

function readApodBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Invalid body" };
  }
  const date = asPlainString(body.date, 10);
  const title = asPlainString(body.title, 300);
  const explanation = asPlainString(body.explanation, 8000);
  const mediaType = asPlainString(body.media_type, 20);
  const copyright = asPlainString(body.copyright, 500) || "NASA";
  const serviceVersion = asPlainString(body.service_version, 20);
  const hdurl = normalizeUrl(body.hdurl);
  const url = normalizeUrl(body.url);
  if (!isRealDate(date)) return { error: "Invalid date" };
  if (!title || !explanation || !mediaType || !serviceVersion || !hdurl || !url) {
    return { error: "Missing or invalid fields" };
  }
  if (mediaType !== "image" && mediaType !== "video") return { error: "Invalid media type" };
  return {
    value: {
      copyright,
      date,
      explanation,
      hdurl,
      media_type: mediaType,
      service_version: serviceVersion,
      title,
      url,
    },
  };
}

function sendWriteError(res, err) {
  if (err && err.code === 11000) {
    return res.status(409).json({ error: "An entry for that date already exists" });
  }
  if (err && err.name === "ValidationError") {
    return res.status(400).json({ error: "Invalid entry" });
  }
  console.error("APOD write failed");
  return res.status(500).json({ error: "Internal server error" });
}

exports.createApod = async (req, res) => {
  const parsed = readApodBody(req.body);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  try {
    const created = await Apod.create(parsed.value);
    return res.status(201).json(present(created));
  } catch (err) {
    return sendWriteError(res, err);
  }
};

exports.readApod = async (req, res) => {
  const page = parseBoundedInt(req.query.page, { fallback: 0, min: 0, max: 500 });
  const limit = parseBoundedInt(req.query.limit, { fallback: 25, min: 1, max: 50 });
  if (!page.ok || !limit.ok) {
    return res.status(400).json({ error: "Invalid page or limit" });
  }
  try {
    const result = await Apod.find({})
      .sort({ date: -1 })
      .skip(page.value * limit.value)
      .limit(limit.value)
      .lean();
    return res.json(result.map(present));
  } catch (err) {
    console.error("APOD read failed");
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.readApodFromID = async (req, res) => {
  if (!isObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  try {
    const result = await Apod.findById(req.params.id).lean();
    if (!result) return res.status(404).json({ error: "Not found" });
    return res.json(present(result));
  } catch (err) {
    console.error("APOD read by id failed");
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.readApodByDate = async (req, res) => {
  if (!isRealDate(req.params.date)) {
    return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
  }
  try {
    const result = await Apod.findOne({ date: req.params.date }).lean();
    if (!result) {
      return res.status(404).json({ error: "No APOD found for that date" });
    }
    return res.json(present(result));
  } catch (err) {
    console.error("APOD read by date failed");
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateApod = async (req, res) => {
  if (!isObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  const parsed = readApodBody(req.body);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  try {
    const result = await Apod.findByIdAndUpdate(req.params.id, parsed.value, {
      new: true,
      runValidators: true,
    }).lean();
    if (!result) return res.status(404).json({ error: "Not found" });
    return res.json(present(result));
  } catch (err) {
    return sendWriteError(res, err);
  }
};

exports.deleteApod = async (req, res) => {
  if (!isObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  try {
    const result = await Apod.findByIdAndDelete(req.params.id).lean();
    if (!result) return res.status(404).json({ error: "Not found" });
    return res.json({ ok: true });
  } catch (err) {
    console.error("APOD delete failed");
    return res.status(500).json({ error: "Internal server error" });
  }
};
