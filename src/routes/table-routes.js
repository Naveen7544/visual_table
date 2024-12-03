const express = require("express");
const multer = require("multer");
const path = require("path");
const tableController = require("../controller/table-controller");
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Optional: limit file size to 10MB
});

// Handle the upload route
router.post("/upload", upload.single("file"), tableController.uploadXlsx);
router.get("/documentData", tableController.getDocumentData);

module.exports = router;
