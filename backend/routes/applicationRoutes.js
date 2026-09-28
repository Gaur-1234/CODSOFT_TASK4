const express = require("express");

const {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  downloadResume,
  getApplicationStats,
  getApplicationDetails,
  withdrawApplication,
  searchApplicants,
  filterApplicants,
} = require("../controllers/applicationController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  upload.single("resume"),
  applyForJob
);

router.get(
  "/my-applications",
  protect,
  getMyApplications
);

router.get(
  "/stats",
  protect,
  getApplicationStats
);

router.get(
  "/search",
  protect,
  searchApplicants
);

router.get(
  "/filter",
  protect,
  filterApplicants
);


router.get(
  "/job/:jobId",
  protect,
  getJobApplicants
);

router.get(
  "/:applicationId",
  protect,
  getApplicationDetails
);

router.patch(
  "/:applicationId/withdraw",
  protect,
  withdrawApplication
);

router.patch(
  "/:applicationId/status",
  protect,
  updateApplicationStatus
);

router.get(
  "/:applicationId/resume",
  protect,
  downloadResume
);

module.exports = router;