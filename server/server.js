const express = require("express");
const app = express();
const multer = require("multer");
const { sliceModel } = require("./slice");
const path = require("path");
require("dotenv").config();
const { dirname } = require("path");
const appDir = dirname(require.main.filename);

app.use(express.urlencoded({ extended: false, limit: "50mb" }));

console.log(process.env.NODE_PATH);

const PORT = process.env.PORT || 3000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${appDir}/uploads`);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.send("hi");
});

app.post("/slice", upload.single("uploaded_file"), (req, res) => {
  try {
    console.log(req.file);

    const result = sliceModel(req.file.filename);

    const gcodeFileName = `${req.file.filename.split(".")[0]}.gcode`;

    res.json({
      message: "Slicing completed",
      file: req.file.filename,
      printTimeSeconds: result.printTimeSeconds,
      filamentVolumeMM3: result.filamentVolumeMM3,
      filamentWeightGrams: result.filamentWeightGrams,
      gcodeDownloadUrl: `/download/${gcodeFileName}`
    });

  } catch (err) {
    console.error("❌ Slicing failed:", err);
    res.status(500).json({ error: "Slicing failed" });
  }
});

app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
