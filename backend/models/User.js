const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

  password: {
  type: String,
  required: true,
  minlength: 6,
},

resetPasswordToken: {
  type: String,
  default: "",
},

resetPasswordExpires: {
  type: Date,
  default: null,
},

otp: {
  type: String,
  default: "",
},

otpExpires: {
  type: Date,
  default: null,
},

refreshToken: {
  type: String,
  default: "",
},

emailVerificationToken: {
  type: String,
  default: "",
},

emailVerificationExpires: {
  type: Date,
  default: null,
},

isEmailVerified: {
  type: Boolean,
  default: false,
},

    role: {
      type: String,
      enum: ["Candidate", "Employer"],
      default: "Candidate",
    },

    // Candidate Profile
    phone: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    education: {
      type: String,
      default: "",
      trim: true,
    },

    experience: {
      type: String,
      default: "",
      trim: true,
    },

    linkedin: {
      type: String,
      default: "",
      trim: true,
    },

    github: {
      type: String,
      default: "",
      trim: true,
    },

    portfolio: {
      type: String,
      default: "",
      trim: true,
    },
    savedJobs: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
  },
],

    profilePhoto: {
      type: String,
      default: "",
    },

    companyName: {
  type: String,
  default: "",
  trim: true,
},

companyLogo: {
  type: String,
  default: "",
},

companyWebsite: {
  type: String,
  default: "",
  trim: true,
},

industry: {
  type: String,
  default: "",
  trim: true,
},

companyLocation: {
  type: String,
  default: "",
  trim: true,
},

companyDescription: {
  type: String,
  default: "",
  trim: true,
},

companyLinkedin: {
  type: String,
  default: "",
  trim: true,
},
  },
  {
    timestamps: true,
  }
);



module.exports = mongoose.model("User", userSchema);