const mongoose = require("mongoose");
const User = require("../models/User");
const getGridFSBucket = require("../config/gridfs");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      location,
      skills,
      education,
      experience,
      linkedin,
      github,
      portfolio,
    } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update only provided fields
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (skills !== undefined) user.skills = skills;
    if (education !== undefined) user.education = education;
    if (experience !== undefined) user.experience = experience;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (github !== undefined) user.github = github;
    if (portfolio !== undefined) user.portfolio = portfolio;

    await user.save();

    const updatedUser = await User.findById(
      req.user.userId
    ).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Profile photo is required",
      });
    }

    const user = await User.findById(
      req.user.userId
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const bucket = getGridFSBucket();

    // Delete old profile photo if it exists
    if (
      user.profilePhoto &&
      mongoose.Types.ObjectId.isValid(
        user.profilePhoto
      )
    ) {
      try {
        await bucket.delete(
          new mongoose.Types.ObjectId(
            user.profilePhoto
          )
        );
      } catch (error) {
        console.log(
          "Old profile photo not found in GridFS"
        );
      }
    }

    // Upload new profile photo
    const uploadStream =
      bucket.openUploadStream(
        req.file.originalname,
        {
          contentType: req.file.mimetype,

          metadata: {
            userId: req.user.userId,
            type: "profile-photo",
          },
        }
      );

    await new Promise((resolve, reject) => {
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
    });

    // Save GridFS file ID
    user.profilePhoto =
      uploadStream.id.toString();

    await user.save();

    const updatedUser =
      await User.findById(
        req.user.userId
      ).select("-password");

    res.status(200).json({
      message:
        "Profile photo uploaded successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "Profile photo upload error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

const deleteProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.userId
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.profilePhoto) {
      return res.status(404).json({
        message: "Profile photo not found",
      });
    }

    const bucket = getGridFSBucket();

    // Delete file from GridFS
    if (
      mongoose.Types.ObjectId.isValid(
        user.profilePhoto
      )
    ) {
      try {
        await bucket.delete(
          new mongoose.Types.ObjectId(
            user.profilePhoto
          )
        );
      } catch (error) {
        console.log(
          "Profile photo was not found in GridFS"
        );
      }
    }

    // Remove GridFS ID from user profile
    user.profilePhoto = "";

    await user.save();

    const updatedUser =
      await User.findById(
        req.user.userId
      ).select("-password");

    res.status(200).json({
      message:
        "Profile photo deleted successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "Delete profile photo error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,};