const mongoose = require("mongoose");
const Job = require("../models/Job");
const User = require("../models/User");
const Application = require("../models/Application");

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
    console.error("Create job error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getJobs = async (req, res) => {
  try {
    const { search, location, jobType } = req.query;

    let filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { requirements: { $regex: search, $options: "i" } },
      ];
    }

    if (location) {
      filter.location = {
        $regex: location,
        $options: "i",
      };
    }

    if (jobType) {
      filter.jobType = {
        $regex: jobType,
        $options: "i",
      };
    }

    const jobs = await Job.find(filter)
      .populate(
        "employer",
        "name email companyName companyLogo companyWebsite"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Get jobs error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    const job = await Job.findById(id).populate(
      "employer",
      "name email companyName companyLogo companyWebsite"
    );

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    res.status(200).json({
      job,
    });
  } catch (error) {
    console.error("Get job by ID error:", error);

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
    })
      .populate(
        "employer",
        "name email companyName companyLogo companyWebsite"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Get my jobs error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const updateJob = async (req, res) => {
  try {
    if (req.user.role !== "Employer") {
      return res.status(403).json({
        message: "Only employers can update jobs",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    const job = await Job.findOne({
      _id: id,
      employer: req.user.userId,
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found or unauthorized",
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

    if (title !== undefined) job.title = title;
    if (company !== undefined) job.company = company;
    if (location !== undefined) job.location = location;

    if (description !== undefined) {
      job.description = description;
    }

    if (requirements !== undefined) {
      job.requirements = requirements;
    }

    if (salary !== undefined) {
      job.salary = salary;
    }

    if (jobType !== undefined) {
      job.jobType = jobType;
    }

    await job.save();

    res.status(200).json({
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    console.error("Update job error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const deleteJob = async (req, res) => {
  try {
    if (req.user.role !== "Employer") {
      return res.status(403).json({
        message: "Only employers can delete jobs",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    const job = await Job.findOne({
      _id: id,
      employer: req.user.userId,
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found or unauthorized",
      });
    }

    await Job.findByIdAndDelete(id);

    res.status(200).json({
      message: "Job deleted successfully",
      jobId: id,
    });
  } catch (error) {
    console.error("Delete job error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const updateJobStatus = async (req, res) => {
  try {
    if (req.user.role !== "Employer") {
      return res.status(403).json({
        message: "Only employers can update job status",
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    if (!["Open", "Closed"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Open or Closed",
      });
    }

    const job = await Job.findOne({
      _id: id,
      employer: req.user.userId,
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found or unauthorized",
      });
    }

    job.status = status;

    await job.save();

    res.status(200).json({
      message: `Job status updated to ${status}`,
      job,
    });
  } catch (error) {
    console.error("Update job status error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getJobStats = async (req, res) => {
  try {
    if (req.user.role !== "Employer") {
      return res.status(403).json({
        message: "Only employers can view job statistics",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    const job = await Job.findOne({
      _id: id,
      employer: req.user.userId,
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found or unauthorized",
      });
    }

    const totalApplicants =
      await Application.countDocuments({
        job: id,
      });

    const applied =
      await Application.countDocuments({
        job: id,
        status: "Applied",
      });

    const underReview =
      await Application.countDocuments({
        job: id,
        status: "Under Review",
      });

    const shortlisted =
      await Application.countDocuments({
        job: id,
        status: "Shortlisted",
      });

    const rejected =
      await Application.countDocuments({
        job: id,
        status: "Rejected",
      });

    const withdrawn =
      await Application.countDocuments({
        job: id,
        status: "Withdrawn",
      });

    res.status(200).json({
      message: "Job statistics fetched successfully",

      stats: {
        totalApplicants,
        totalApplications: totalApplicants,
        applied,
        underReview,
        shortlisted,
        rejected,
        withdrawn,
      },
    });
  } catch (error) {
    console.error("Job stats error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getSavedJobs = async (req, res) => {
  try {
    if (req.user.role !== "Candidate") {
      return res.status(403).json({
        message: "Only candidates can view saved jobs",
      });
    }

    const user = await User.findById(req.user.userId)
      .populate({
        path: "savedJobs",
        populate: {
          path: "employer",
          select:
            "name email companyName companyLogo companyWebsite",
        },
      })
      .select("savedJobs");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Saved jobs fetched successfully",
      count: user.savedJobs.length,
      jobs: user.savedJobs,
    });
  } catch (error) {
    console.error("Get saved jobs error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const saveJob = async (req, res) => {
  try {
    if (req.user.role !== "Candidate") {
      return res.status(403).json({
        message: "Only candidates can save jobs",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (
      user.savedJobs.some(
        (jobId) => jobId.toString() === id
      )
    ) {
      return res.status(400).json({
        message: "Job is already saved",
      });
    }

    user.savedJobs.push(job._id);

    await user.save();

    res.status(200).json({
      message: "Job saved successfully",
      savedJob: job._id,
    });
  } catch (error) {
    console.error("Save job error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const removeSavedJob = async (req, res) => {
  try {
    if (req.user.role !== "Candidate") {
      return res.status(403).json({
        message: "Only candidates can remove saved jobs",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const jobIndex = user.savedJobs.findIndex(
      (jobId) => jobId.toString() === id
    );

    if (jobIndex === -1) {
      return res.status(404).json({
        message: "Job is not saved",
      });
    }

    user.savedJobs.splice(jobIndex, 1);

    await user.save();

    res.status(200).json({
      message:
        "Job removed from saved jobs successfully",
      removedJob: id,
    });
  } catch (error) {
    console.error(
      "Remove saved job error:",
      error
    );

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
  updateJob,
  deleteJob,
  updateJobStatus,
  getJobStats,
  getSavedJobs,
  saveJob,
  removeSavedJob,
};