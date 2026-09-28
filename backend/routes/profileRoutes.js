const express = require("express");

const {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
} = require("../controllers/profileController");

const protect = require("../middleware/authMiddleware");

const uploadProfilePhotoMiddleware =
  require("../middleware/profilePhotoMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  getProfile
);

router.put(
  "/",
  protect,
  updateProfile
);

router.post(
  "/photo",
  protect,
  uploadProfilePhotoMiddleware.single("photo"),
  uploadProfilePhoto
);

router.delete(
  "/photo",
  protect,
  deleteProfilePhoto
);

module.exports = router;