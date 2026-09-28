const express = require("express");

const {
  createJob,
  getJobs,
  getJobById,
  getMyJobs,
  getSavedJobs,
  saveJob,
  removeSavedJob,
  updateJob,
  deleteJob,
  updateJobStatus,
  getJobStats,
} = require("../controllers/jobController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getJobs);
router.post("/", protect, createJob);
router.get("/my-jobs", protect, getMyJobs);
router.get("/saved", protect, getSavedJobs);
router.post("/:id/save", protect, saveJob);
router.delete("/:id/save", protect, removeSavedJob);
router.put("/:id", protect, updateJob);
router.delete("/:id", protect, deleteJob);
router.patch(
  "/:id/status",
  protect,
  updateJobStatus
);

router.get(
  "/:id/stats",
  protect,
  getJobStats
);
router.get("/:id", getJobById);


module.exports = router;