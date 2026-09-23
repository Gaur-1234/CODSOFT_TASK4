const express = require("express");

const {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  downloadResume,
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
router.get("/my-applications", protect, getMyApplications);
router.get(
  "/job/:jobId",
  protect,
  getJobApplicants
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