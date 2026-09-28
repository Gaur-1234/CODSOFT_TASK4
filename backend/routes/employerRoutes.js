const express = require("express");


const {
  getEmployerProfile,
  updateEmployerProfile,
  uploadCompanyLogo,
  getEmployerStats,
} = require("../controllers/employerController");

const protect = require("../middleware/authMiddleware");
const uploadCompanyLogoMiddleware = require("../middleware/companyLogoMiddleware");
const router = express.Router();

router.get(
  "/profile",
  protect,
  getEmployerProfile
);

router.put(
  "/profile",
  protect,
  updateEmployerProfile
);

router.post(
  "/logo",
  protect,
  uploadCompanyLogoMiddleware.single("logo"),
  uploadCompanyLogo
);
router.get(
  "/stats",
  protect,
  getEmployerStats
);
module.exports = router;