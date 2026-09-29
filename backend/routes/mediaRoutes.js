const express = require("express");

const {
  getMedia,
} = require("../controllers/mediaController");

const router = express.Router();

// Public image route
router.get(
  "/:fileId",
  getMedia
);

module.exports = router;