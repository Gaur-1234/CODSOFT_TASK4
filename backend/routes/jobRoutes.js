const express = require("express");

const {
  createJob,
  getJobs,
  getJobById,
  getMyJobs,
} = require("../controllers/jobController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getJobs);
router.post("/", protect, createJob);
router.get("/my-jobs", protect, getMyJobs);
router.get("/:id", getJobById);


module.exports = router;