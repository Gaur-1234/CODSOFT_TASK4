import { useState } from "react";
import API from "../services/api";

function createFormData(profile = {}, isEmployer = false) {
  if (isEmployer) {
    return {
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      location: profile?.location || "",
      skills: profile?.skills || "",
      education: profile?.education || "",
      experience: profile?.experience || "",
      linkedin: profile?.linkedin || "",
      github: profile?.github || "",
      portfolio: profile?.portfolio || "",

      companyName: profile?.companyName || "",
      companyWebsite:
        profile?.companyWebsite || "",
      industry: profile?.industry || "",
      companyLocation:
        profile?.companyLocation || "",
      companyDescription:
        profile?.companyDescription || "",
      companyLinkedin:
        profile?.companyLinkedin || "",
    };
  }

  return {
    name: profile?.name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    location: profile?.location || "",
    skills: Array.isArray(profile?.skills)
      ? profile.skills.join(", ")
      : profile?.skills || "",
    education: profile?.education || "",
    experience: profile?.experience || "",
    linkedin: profile?.linkedin || "",
    github: profile?.github || "",
    portfolio: profile?.portfolio || "",

    companyName: profile?.companyName || "",
    companyWebsite:
      profile?.companyWebsite || "",
    industry: profile?.industry || "",
    companyLocation:
      profile?.companyLocation || "",
    companyDescription:
      profile?.companyDescription || "",
    companyLinkedin:
      profile?.companyLinkedin || "",
  };
}

function ProfileForm({
  mode = "candidate",
  profile = {},
  onSaved,
}) {
  const isEmployer = mode === "employer";

  // Local form data starts as null.
  // Until the API profile is loaded, the form
  // automatically uses the profile prop.
  const [formData, setFormData] =
    useState(null);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ==========================================
  // CURRENT FORM DATA
  // ==========================================

  const currentFormData =
    formData ??
    createFormData(
      profile,
      isEmployer
    );

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setFormData((previous) => ({
      ...(previous ??
        createFormData(
          profile,
          isEmployer
        )),
      [name]: value,
    }));
  };

  // ==========================================
  // HANDLE FILE CHANGE
  // ==========================================

  const handleFileChange = (event) => {
    const file =
      event.target.files?.[0] || null;

    setSelectedFile(file);

    setMessage("");
    setError("");
  };

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const endpoint = isEmployer
        ? "/employer/profile"
        : "/profile";

      const payload = {
        ...currentFormData,
      };

      // Convert candidate skills
      // from comma-separated text to array.
      if (!isEmployer) {
        payload.skills = currentFormData.skills
          ? currentFormData.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean)
          : [];
      }

      const response = await API.put(
        endpoint,
        payload
      );

      const updatedProfile =
        response.data.user ||
        response.data.profile ||
        response.data;

      // Keep local form synchronized
      // with the updated profile.
      setFormData(
        createFormData(
          updatedProfile,
          isEmployer
        )
      );

      setMessage(
        response.data.message ||
          "Profile updated successfully."
      );

      if (onSaved) {
        onSaved(updatedProfile);
      }
    } catch (err) {
      console.error(
        "Profile update error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to update profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UPLOAD PHOTO / COMPANY LOGO
  // ==========================================

  const handleUpload = async () => {
    if (!selectedFile) {
      setError(
        isEmployer
          ? "Please select a company logo."
          : "Please select a profile photo."
      );

      return;
    }

    try {
      setUploading(true);
      setMessage("");
      setError("");

      const uploadData =
        new FormData();

      uploadData.append(
        isEmployer
          ? "logo"
          : "photo",
        selectedFile
      );

      const endpoint = isEmployer
        ? "/employer/logo"
        : "/profile/photo";

      const response = await API.post(
        endpoint,
        uploadData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      const updatedProfile =
        response.data.user ||
        response.data.profile ||
        response.data;

      setFormData(
        createFormData(
          updatedProfile,
          isEmployer
        )
      );

      setSelectedFile(null);

      setMessage(
        response.data.message ||
          (isEmployer
            ? "Company logo uploaded successfully."
            : "Profile photo uploaded successfully.")
      );

      if (onSaved) {
        onSaved(updatedProfile);
      }
    } catch (err) {
      console.error(
        "Profile image upload error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to upload image."
      );
    } finally {
      setUploading(false);
    }
  };

  // ==========================================
  // DELETE PHOTO / LOGO
  // ==========================================

  const handleDeleteImage = async () => {
    try {
      setDeleting(true);
      setMessage("");
      setError("");

      const endpoint = isEmployer
        ? "/employer/logo"
        : "/profile/photo";

      const response = await API.delete(
        endpoint
      );

      const updatedProfile =
        response.data.user ||
        response.data.profile ||
        response.data;

      setFormData(
        createFormData(
          updatedProfile,
          isEmployer
        )
      );

      setMessage(
        response.data.message ||
          (isEmployer
            ? "Company logo removed successfully."
            : "Profile photo removed successfully.")
      );

      if (onSaved) {
        onSaved(updatedProfile);
      }
    } catch (err) {
      console.error(
        "Profile image delete error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to remove image."
      );
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================
  // PROFILE IMAGE
  // ==========================================

  const profileImage =
    profile?.profilePhoto ||
    profile?.companyLogo ||
    "";

  return (
    <section className="dashboard-section">

      {/* ====================================
          HEADER
      ===================================== */}

      <div className="section-heading">

        <div>

          <h2>
            {isEmployer
              ? "Company Profile"
              : "Your Profile"}
          </h2>

          <p>
            {isEmployer
              ? "Manage your company information and logo."
              : "Keep your personal and professional information updated."}
          </p>

        </div>

      </div>

      {/* ====================================
          SUCCESS MESSAGE
      ===================================== */}

      {message && (
        <div className="dashboard-success">

          <p>
            {message}
          </p>

        </div>
      )}

      {/* ====================================
          ERROR MESSAGE
      ===================================== */}

      {error && (
        <div className="dashboard-error">

          <p>
            {error}
          </p>

        </div>
      )}

      {/* ====================================
          PROFILE IMAGE
      ===================================== */}

      <div className="dashboard-card">

        <h3>
          {isEmployer
            ? "Company Logo"
            : "Profile Photo"}
        </h3>

        {profileImage && (
          <div className="profile-image-preview">

            <img
              src={profileImage}
              alt={
                isEmployer
                  ? "Company logo"
                  : "Profile"
              }
            />

          </div>
        )}

        <div className="form-group">

          <label htmlFor="profileImage">
            {isEmployer
              ? "Choose Company Logo"
              : "Choose Profile Photo"}
          </label>

          <input
            id="profileImage"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />

        </div>

        <div className="dashboard-actions">

          <button
            type="button"
            className="dashboard-primary-button"
            onClick={handleUpload}
            disabled={
              uploading ||
              !selectedFile
            }
          >
            {uploading
              ? "Uploading..."
              : "Upload"}
          </button>

          {profileImage && (
            <button
              type="button"
              className="dashboard-secondary-button"
              onClick={
                handleDeleteImage
              }
              disabled={deleting}
            >
              {deleting
                ? "Removing..."
                : "Remove"}
            </button>
          )}

        </div>

      </div>

      {/* ====================================
          PROFILE FORM
      ===================================== */}

      <form
        className="dashboard-card"
        onSubmit={handleSubmit}
      >

        {!isEmployer && (
          <>
            {/* NAME */}

            <div className="form-group">

              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={
                  currentFormData.name
                }
                onChange={handleChange}
                placeholder="Enter your full name"
              />

            </div>

            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={
                  currentFormData.email
                }
                onChange={handleChange}
                placeholder="Enter your email"
              />

            </div>

            {/* PHONE */}

            <div className="form-group">

              <label htmlFor="phone">
                Phone
              </label>

              <input
                id="phone"
                name="phone"
                type="text"
                value={
                  currentFormData.phone
                }
                onChange={handleChange}
                placeholder="Enter your phone number"
              />

            </div>

            {/* LOCATION */}

            <div className="form-group">

              <label htmlFor="location">
                Location
              </label>

              <input
                id="location"
                name="location"
                type="text"
                value={
                  currentFormData.location
                }
                onChange={handleChange}
                placeholder="City, State"
              />

            </div>

            {/* SKILLS */}

            <div className="form-group">

              <label htmlFor="skills">
                Skills
              </label>

              <input
                id="skills"
                name="skills"
                type="text"
                value={
                  currentFormData.skills
                }
                onChange={handleChange}
                placeholder="React, Node.js, MongoDB"
              />

              <small>
                Separate skills with commas.
              </small>

            </div>

            {/* EDUCATION */}

            <div className="form-group">

              <label htmlFor="education">
                Education
              </label>

              <textarea
                id="education"
                name="education"
                value={
                  currentFormData.education
                }
                onChange={handleChange}
                placeholder="Enter your education details"
                rows="4"
              />

            </div>

            {/* EXPERIENCE */}

            <div className="form-group">

              <label htmlFor="experience">
                Experience
              </label>

              <textarea
                id="experience"
                name="experience"
                value={
                  currentFormData.experience
                }
                onChange={handleChange}
                placeholder="Enter your experience"
                rows="4"
              />

            </div>

            {/* LINKEDIN */}

            <div className="form-group">

              <label htmlFor="linkedin">
                LinkedIn
              </label>

              <input
                id="linkedin"
                name="linkedin"
                type="url"
                value={
                  currentFormData.linkedin
                }
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
              />

            </div>

            {/* GITHUB */}

            <div className="form-group">

              <label htmlFor="github">
                GitHub
              </label>

              <input
                id="github"
                name="github"
                type="url"
                value={
                  currentFormData.github
                }
                onChange={handleChange}
                placeholder="https://github.com/..."
              />

            </div>

            {/* PORTFOLIO */}

            <div className="form-group">

              <label htmlFor="portfolio">
                Portfolio
              </label>

              <input
                id="portfolio"
                name="portfolio"
                type="url"
                value={
                  currentFormData.portfolio
                }
                onChange={handleChange}
                placeholder="https://yourportfolio.com"
              />

            </div>
          </>
        )}

        {isEmployer && (
          <>
            {/* COMPANY NAME */}

            <div className="form-group">

              <label htmlFor="companyName">
                Company Name
              </label>

              <input
                id="companyName"
                name="companyName"
                type="text"
                value={
                  currentFormData.companyName
                }
                onChange={handleChange}
                placeholder="Enter company name"
              />

            </div>

            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={
                  currentFormData.email
                }
                onChange={handleChange}
                placeholder="Enter company email"
              />

            </div>

            {/* PHONE */}

            <div className="form-group">

              <label htmlFor="phone">
                Phone
              </label>

              <input
                id="phone"
                name="phone"
                type="text"
                value={
                  currentFormData.phone
                }
                onChange={handleChange}
                placeholder="Enter phone number"
              />

            </div>

            {/* COMPANY WEBSITE */}

            <div className="form-group">

              <label htmlFor="companyWebsite">
                Company Website
              </label>

              <input
                id="companyWebsite"
                name="companyWebsite"
                type="url"
                value={
                  currentFormData.companyWebsite
                }
                onChange={handleChange}
                placeholder="https://company.com"
              />

            </div>

            {/* INDUSTRY */}

            <div className="form-group">

              <label htmlFor="industry">
                Industry
              </label>

              <input
                id="industry"
                name="industry"
                type="text"
                value={
                  currentFormData.industry
                }
                onChange={handleChange}
                placeholder="Technology, Finance, Healthcare..."
              />

            </div>

            {/* COMPANY LOCATION */}

            <div className="form-group">

              <label htmlFor="companyLocation">
                Company Location
              </label>

              <input
                id="companyLocation"
                name="companyLocation"
                type="text"
                value={
                  currentFormData.companyLocation
                }
                onChange={handleChange}
                placeholder="City, State"
              />

            </div>

            {/* COMPANY DESCRIPTION */}

            <div className="form-group">

              <label htmlFor="companyDescription">
                Company Description
              </label>

              <textarea
                id="companyDescription"
                name="companyDescription"
                value={
                  currentFormData.companyDescription
                }
                onChange={handleChange}
                placeholder="Describe your company"
                rows="5"
              />

            </div>

            {/* COMPANY LINKEDIN */}

            <div className="form-group">

              <label htmlFor="companyLinkedin">
                Company LinkedIn
              </label>

              <input
                id="companyLinkedin"
                name="companyLinkedin"
                type="url"
                value={
                  currentFormData.companyLinkedin
                }
                onChange={handleChange}
                placeholder="https://linkedin.com/company/..."
              />

            </div>
          </>
        )}

        {/* ==================================
            SAVE BUTTON
        =================================== */}

        <div className="dashboard-actions">

          <button
            type="submit"
            className="dashboard-primary-button"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : "Save Profile"}
          </button>

        </div>

      </form>

    </section>
  );
}

export default ProfileForm;