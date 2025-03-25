const Apod = require("../models/Apod");
exports.createApod = async (req, res) => {
  try {
    let newApod = new Apod({
      copyright: req.body.copyright,
      date: req.body.date,
      explanation: req.body.explanation,
      hdurl: req.body.hdurl,
      media_type: req.body.media_type,
      service_version: req.body.service_version,
      title: req.body.title,
      url: req.body.url,
    });
    await newApod.save();
    res.send(newApod);
  } catch (err) {
    console.log(err);
  }
};
exports.readApod = async (req, res) => {
  const page = req.query.page || 0;
  const limit = req.query.limit || 25;
  try {
    const result = await Apod.find({})
      .sort({ date: -1 })
      .skip(page * limit)
      .limit(limit);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.json({ app: err });
  }
};
exports.readApodFromID = async (req, res) => {
  try {
    const result = await Apod.findById(req.params.id);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.json({ app: err });
  }
};
exports.updateApod = async (req, res) => {
  try {
    const result = await Apod.findByIdAndUpdate(
      req.params.id,
      {
        copyright: req.body.copyright,
        date: req.body.date,
        explanation: req.body.explanation,
        hdurl: req.body.hdurl,
        media_type: req.body.media_type,
        service_version: req.body.service_version,
        title: req.body.title,
        url: req.body.url,
      },
      { new: true }
    );
    res.send(result);
  } catch (err) {
    console.log(err);
    res.json({ app: err });
  }
};
exports.deleteApod = async (req, res) => {
  try {
    const result = await Apod.findByIdAndRemove(req.params.id);
    if (!result) {
      res.json({ app: "post not found" });
    } else {
      res.json({ app: "post deleted" });
    }
  } catch (err) {
    console.log(err);
    res.json({ app: err });
  }
};
exports.readApodByDate = async (req, res) => {
  try {
    const date = req.params.date;
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res
        .status(400)
        .json({ error: "Invalid date format. Please use YYYY-MM-DD" });
    }

    const result = await Apod.findOne({ date: date });

    if (!result) {
      return res.status(404).json({ error: `No APOD found for date: ${date}` });
    }

    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
