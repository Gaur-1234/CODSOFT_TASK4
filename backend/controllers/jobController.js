const mongoose = require("mongoose");
const Job = require("../models/Job");

const createJob = async (req, res) => {
  try {
    if (req.user.role !== "Employer") {
      return res.status(403).json({
        message: "Only employers can post jobs",
      });
    }

    const {
      title,
      company,
      location,
      description,
      requirements,
      salary,
      jobType,
    } = req.body;

    if (
      !title ||
      !company ||
      !location ||
      !description ||
      !jobType
    ) {
      return res.status(400).json({
        message: "Please provide all required job details",
      });
    }

    const job = await Job.create({
      title,
      company,
      location,
      description,
      requirements: requirements || [],
      salary,
      jobType,
      employer: req.user.userId,
    });

    res.status(201).json({
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getJobs = async (req, res) => {
  try {
    const { search, location, jobType } = req.query;

    let filter = {};

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { requirements: { $regex: search, $options: "i" } },
      ];
    }

    // Location filter
    if (location) {
      filter.location = {
        $regex: location,
        $options: "i",
      };
    }

    // Job Type filter
    if (jobType) {
      filter.jobType = {
        $regex: jobType,
        $options: "i",
      };
    }

    const jobs = await Job.find(filter)
      .populate("employer", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    const job = await Job.findById(id)
      .populate("employer", "name email");

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    res.status(200).json({
      job,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
const getMyJobs = async (req, res) => {
  try {
    if (req.user.role !== "Employer") {
      return res.status(403).json({
        message: "Only employers can view their jobs",
      });
    }

    const jobs = await Job.find({
      employer: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  getMyJobs,
};