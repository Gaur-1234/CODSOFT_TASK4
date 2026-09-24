const mongoose = require("mongoose");
const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");

const getGridFSBucket = require("../config/gridfs");
const {
  sendApplicationEmail,
  sendStatusUpdateEmail,
} = require("../services/emailService");

const applyForJob = async (req, res) => {
  try {
    // Only candidates can apply
    if (req.user.role !== "Candidate") {
      return res.status(403).json({
        message: "Only candidates can apply for jobs",
      });
    }

    const { jobId, coverLetter } = req.body;

    // Check job ID
    if (!jobId) {
      return res.status(400).json({
        message: "Job ID is required",
      });
    }

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    // Check whether job exists
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // Check resume
    if (!req.file) {
      return res.status(400).json({
        message: "Resume is required",
      });
    }

    // Prevent duplicate application
    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: req.user.userId,
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied for this job",
      });
    }

    // Create application
    const bucket = getGridFSBucket();

const uploadStream = bucket.openUploadStream(
  req.file.originalname,
  {
    metadata: {
      candidateId: req.user.userId,
      jobId: jobId,
      contentType: req.file.mimetype,
    },
  }
);

await new Promise((resolve, reject) => {
  uploadStream.on("finish", resolve);
  uploadStream.on("error", reject);

  uploadStream.end(req.file.buffer);
});

const application = await Application.create({
  job: jobId,
  candidate: req.user.userId,
  resume: uploadStream.id.toString(),
  resumeFileName: req.file.originalname,
  coverLetter: coverLetter || "",
});

    const candidate = await User.findById(req.user.userId);

if (candidate) {
  await sendApplicationEmail({
    to: candidate.email,
    candidateName: candidate.name,
    jobTitle: job.title,
    company: job.company,
  });
}

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getMyApplications = async (req, res) => {
  try {
    // Only candidates can access their applications
    if (req.user.role !== "Candidate") {
      return res.status(403).json({
        message: "Only candidates can view their applications",
      });
    }

    const applications = await Application.find({
      candidate: req.user.userId,
    })
      .populate("job")
      .populate("candidate", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getJobApplicants = async (req, res) => {
  try {
    // Only employers can view applicants
    if (req.user.role !== "Employer") {
      return res.status(403).json({
        message: "Only employers can view applicants",
      });
    }

    const { jobId } = req.params;

    // Validate Job ID
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    // Check whether job exists
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // Make sure this employer owns the job
    if (job.employer.toString() !== req.user.userId) {
      return res.status(403).json({
        message:
          "You are not authorized to view applicants for this job",
      });
    }

    // Find applications for this job
    const applications = await Application.find({
      job: jobId,
    })
      .populate("candidate", "name email")
      .populate("job", "title company location")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    // Only employers can update application status
    if (req.user.role !== "Employer") {
      return res.status(403).json({
        message: "Only employers can update application status",
      });
    }

    const { applicationId } = req.params;
    const { status } = req.body;

    // Validate application ID
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        message: "Invalid application ID",
      });
    }

    // Allowed statuses
    const allowedStatuses = [
      "Applied",
      "Under Review",
      "Shortlisted",
      "Rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid application status",
      });
    }

    // Find application and populate its job
    const application = await Application.findById(
      applicationId
    ).populate("job");

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    // Check that this employer owns the job
    if (
      application.job.employer.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to update this application",
      });
    }

    // Update status
    application.status = status;

    await application.save();

    const candidate = await User.findById(
  application.candidate
);

if (candidate) {
  await sendStatusUpdateEmail({
    to: candidate.email,
    candidateName: candidate.name,
    jobTitle: application.job.title,
    status: application.status,
  });
}

    res.status(200).json({
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const downloadResume = async (req, res) => {
  try {
    if (req.user.role !== "Employer") {
      return res.status(403).json({
        message: "Only employers can download resumes",
      });
    }

    const { applicationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        message: "Invalid application ID",
      });
    }

    const application = await Application.findById(
      applicationId
    ).populate("job");

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    // Check that this employer owns the job
    if (
      application.job.employer.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to download this resume",
      });
    }

    if (!application.resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    // Check GridFS file ID
    if (
      !mongoose.Types.ObjectId.isValid(
        application.resume
      )
    ) {
      return res.status(404).json({
        message:
          "This resume was uploaded using the old storage system.",
      });
    }

    const bucket = getGridFSBucket();

    const fileId = new mongoose.Types.ObjectId(
      application.resume
    );

    const files = await bucket
      .find({ _id: fileId })
      .toArray();

    if (!files.length) {
      return res.status(404).json({
        message: "Resume file not found in GridFS",
      });
    }

    const file = files[0];

    res.setHeader(
      "Content-Type",
      file.contentType ||
        "application/octet-stream"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${application.resumeFileName || file.filename}"`
    );

    const downloadStream =
      bucket.openDownloadStream(fileId);

    downloadStream.on("error", (error) => {
      console.error(
        "GridFS download error:",
        error
      );

      if (!res.headersSent) {
        res.status(500).json({
          message: "Unable to download resume",
        });
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error(
      "Download resume error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  downloadResume,
};