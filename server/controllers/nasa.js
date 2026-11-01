const { isRealDate, asPlainString, toNasaHttps, isSafeHttpsUrl } = require("../lib/security");

const NASA_ORIGIN = "https://api.nasa.gov";

function apiKey() {
  return process.env.NASA_API_KEY || "DEMO_KEY";
}

async function nasaFetch(pathname, searchParams) {
  const url = new URL(pathname, NASA_ORIGIN);
  for (const [key, value] of Object.entries(searchParams || {})) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("api_key", apiKey());
  const response = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(12000),
    redirect: "error",
  });
  if (response.status === 404) return { ok: false, status: 404 };
  if (!response.ok) return { ok: false, status: 502 };
  return { ok: true, data: await response.json() };
}

function presentLiveApod(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const date = asPlainString(data.date, 10);
  const title = asPlainString(data.title, 300);
  const explanation = asPlainString(data.explanation, 8000);
  const mediaType = asPlainString(data.media_type, 20);
  if (!isRealDate(date) || !title || !explanation || !mediaType) return null;
  const body = {
    date,
    title,
    explanation,
    media_type: mediaType,
    copyright: asPlainString(data.copyright, 500) || "NASA",
    service_version: asPlainString(data.service_version, 20) || "",
  };
  const url = toNasaHttps(data.url) || (isSafeHttpsUrl(data.url) ? data.url.trim() : "");
  const hdurl = toNasaHttps(data.hdurl) || (isSafeHttpsUrl(data.hdurl) ? data.hdurl.trim() : "");
  if (url) body.url = url;
  if (hdurl) body.hdurl = hdurl;
  return body;
}

exports.apodByDate = async (req, res) => {
  if (!isRealDate(req.query.date)) {
    return res.status(400).json({ error: "Invalid date. Use YYYY-MM-DD" });
  }
  try {
    const result = await nasaFetch("/planetary/apod", { date: req.query.date });
    if (!result.ok) return res.status(result.status).json({ error: "NASA APOD request failed" });
    const body = presentLiveApod(result.data);
    if (!body) return res.status(502).json({ error: "Unexpected NASA response" });
    return res.json(body);
  } catch (err) {
    console.error("APOD proxy failed");
    return res.status(502).json({ error: "NASA APOD request failed" });
  }
};

exports.epicByDate = async (req, res) => {
  const date = req.query.date;
  if (!isRealDate(date)) {
    return res.status(400).json({ error: "Invalid date. Use YYYY-MM-DD" });
  }
  try {
    const result = await nasaFetch(`/EPIC/api/natural/date/${date}`);
    if (!result.ok) return res.status(result.status).json({ error: "NASA EPIC request failed" });
    if (!Array.isArray(result.data)) {
      return res.status(502).json({ error: "Unexpected NASA response" });
    }
    const [year, month, day] = date.split("-");
    const images = [];
    for (const item of result.data.slice(0, 20)) {
      if (!item || typeof item.image !== "string" || !/^[A-Za-z0-9_]+$/.test(item.image)) continue;
      images.push({
        date,
        caption: asPlainString(item.caption, 2000) || "",
        image: item.image,
        url: `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/jpg/${item.image}.jpg`,
      });
    }
    return res.json(images);
  } catch (err) {
    console.error("EPIC proxy failed");
    return res.status(502).json({ error: "NASA EPIC request failed" });
  }
};

exports.marsByDate = async (req, res) => {
  if (!isRealDate(req.query.date)) {
    return res.status(400).json({ error: "Invalid date. Use YYYY-MM-DD" });
  }
  try {
    const result = await nasaFetch("/mars-photos/api/v1/rovers/curiosity/photos", {
      earth_date: req.query.date,
    });
    if (!result.ok) return res.status(result.status).json({ error: "NASA Mars request failed" });
    const photos = Array.isArray(result.data && result.data.photos) ? result.data.photos : null;
    if (!photos) return res.status(502).json({ error: "Unexpected NASA response" });
    const safe = [];
    for (const photo of photos) {
      if (safe.length >= 40) break;
      const imgSrc = toNasaHttps(photo && photo.img_src);
      if (!imgSrc) continue;
      const camera =
        (photo.camera && asPlainString(photo.camera.full_name, 200)) || "Curiosity";
      const id = Number.isInteger(photo.id) ? photo.id : safe.length;
      safe.push({ id, camera, img_src: imgSrc });
    }
    return res.json(safe);
  } catch (err) {
    console.error("Mars proxy failed");
    return res.status(502).json({ error: "NASA Mars request failed" });
  }
};
