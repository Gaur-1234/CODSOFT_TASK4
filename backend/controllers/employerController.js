const User = require("../models/User");
const mongoose = require("mongoose");
const getGridFSBucket = require("../config/gridfs");
const Job = require("../models/Job");
const Application = require("../models/Application");

const getEmployerProfile = async (req, res) => {
  try {
    if (req.user.role !== "Employer") {
      return res.status(403).json({
        message:
          "Only employers can view employer profile",
      });
    }

    const user = await User.findById(
      req.user.userId
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "Employer not found",
      });
    }

    res.status(200).json({
      message:
        "Employer profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error(
      "Get employer profile error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

const updateEmployerProfile = async (req, res) => {
  try {
    if (req.user.role !== "Employer") {
      return res.status(403).json({
        message:
          "Only employers can update employer profile",
      });
    }

    const {
      name,
      phone,
      location,
      companyName,
      companyWebsite,
      industry,
      companyLocation,
      companyDescription,
      companyLinkedin,
    } = req.body;

    const user = await User.findById(
      req.user.userId
    );

    if (!user) {
      return res.status(404).json({
        message: "Employer not found",
      });
    }

    if (name !== undefined) {
      user.name = name;
    }

    if (phone !== undefined) {
      user.phone = phone;
    }

    if (location !== undefined) {
      user.location = location;
    }

    if (companyName !== undefined) {
      user.companyName = companyName;
    }

    if (companyWebsite !== undefined) {
      user.companyWebsite = companyWebsite;
    }

    if (industry !== undefined) {
      user.industry = industry;
    }

    if (companyLocation !== undefined) {
      user.companyLocation =
        companyLocation;
    }

    if (companyDescription !== undefined) {
      user.companyDescription =
        companyDescription;
    }

    if (companyLinkedin !== undefined) {
      user.companyLinkedin =
        companyLinkedin;
    }

    await user.save();

    const updatedUser = await User.findById(
      req.user.userId
    ).select("-password");

    res.status(200).json({
      message:
        "Employer profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "Update employer profile error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

const uploadCompanyLogo = async (req, res) => {
  try {
    if (req.user.role !== "Employer") {
      return res.status(403).json({
        message:
          "Only employers can upload company logo",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Company logo is required",
      });
    }

    const user = await User.findById(
      req.user.userId
    );

    if (!user) {
      return res.status(404).json({
        message: "Employer not found",
      });
    }

    const bucket = getGridFSBucket();

    // Delete old logo if it exists
    if (
      user.companyLogo &&
      mongoose.Types.ObjectId.isValid(
        user.companyLogo
      )
    ) {
      try {
        await bucket.delete(
          new mongoose.Types.ObjectId(
            user.companyLogo
          )
        );
      } catch (error) {
        console.log(
          "Old company logo not found in GridFS"
        );
      }
    }

    // Upload new logo
    const uploadStream =
      bucket.openUploadStream(
        req.file.originalname,
        {
          contentType: req.file.mimetype,

          metadata: {
            userId: req.user.userId,
            type: "company-logo",
          },
        }
      );

    await new Promise(
      (resolve, reject) => {
        uploadStream.on(
          "finish",
          resolve
        );

        uploadStream.on(
          "error",
          reject
        );

        uploadStream.end(
          req.file.buffer
        );
      }
    );

    user.companyLogo =
      uploadStream.id.toString();

    await user.save();

    const updatedUser =
      await User.findById(
        req.user.userId
      ).select("-password");

    res.status(200).json({
      message:
        "Company logo uploaded successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "Company logo upload error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

const deleteCompanyLogo = async (
  req,
  res
) => {
  try {
    if (req.user.role !== "Employer") {
      return res.status(403).json({
        message:
          "Only employers can remove company logo",
      });
    }

    const user = await User.findById(
      req.user.userId
    );

    if (!user) {
      return res.status(404).json({
        message: "Employer not found",
      });
    }

    const oldLogoId =
      user.companyLogo;

    // Delete GridFS file
    if (
      oldLogoId &&
      mongoose.Types.ObjectId.isValid(
        oldLogoId
      )
    ) {
      try {
        const bucket =
          getGridFSBucket();

        await bucket.delete(
          new mongoose.Types.ObjectId(
            oldLogoId
          )
        );
      } catch (error) {
        console.log(
          "Company logo file was already missing from GridFS"
        );
      }
    }

    // Remove reference from User
    user.companyLogo = "";

    await user.save();

    const updatedUser =
      await User.findById(
        req.user.userId
      ).select("-password");

    return res.status(200).json({
      message:
        "Company logo removed successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "Delete company logo error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getEmployerStats = async (
  req,
  res
) => {
  try {
    if (req.user.role !== "Employer") {
      return res.status(403).json({
        message:
          "Only employers can view employer statistics",
      });
    }

    const jobs = await Job.find({
      employer: req.user.userId,
    }).select("_id status");

    const jobIds = jobs.map(
      (job) => job._id
    );

    const totalJobs = jobs.length;

    const openJobs = jobs.filter(
      (job) => job.status === "Open"
    ).length;

    const closedJobs = jobs.filter(
      (job) => job.status === "Closed"
    ).length;

    const totalApplicants =
      await Application.countDocuments({
        job: { $in: jobIds },
      });

    const shortlistedApplicants =
      await Application.countDocuments({
        job: { $in: jobIds },
        status: "Shortlisted",
      });

    res.status(200).json({
      message:
        "Employer statistics fetched successfully",

      stats: {
        totalJobs,
        openJobs,
        closedJobs,

        totalApplicants,
        totalApplications:
          totalApplicants,

        shortlistedApplicants,
      },
    });
  } catch (error) {
    console.error(
      "Employer stats error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getEmployerProfile,
  updateEmployerProfile,
  uploadCompanyLogo,
  deleteCompanyLogo,
  getEmployerStats,
};