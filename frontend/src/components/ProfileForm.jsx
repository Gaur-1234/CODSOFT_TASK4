import { useEffect, useState } from "react";
import API from "../services/api";

const BASE_URL =
  "https://job-board-backend-hd1e.onrender.com";

function ProfileForm({
  mode = "candidate",
  profile = {},
  onSaved,
}) {
  const isEmployer = mode === "employer";

  // ==========================================
  // FORM DATA
  // ==========================================

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",

    // Candidate
    skills: "",
    education: "",
    experience: "",
    linkedin: "",
    github: "",
    portfolio: "",

    // Employer
    companyName: "",
    companyWebsite: "",
    industry: "",
    companyLocation: "",
    companyDescription: "",
    companyLinkedin: "",
  });

  // ==========================================
  // IMAGE STATES
  // ==========================================

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] =
    useState("");

  // ==========================================
  // LOADING / MESSAGE
  // ==========================================

  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // SYNC PROFILE DATA
  // ==========================================

  useEffect(() => {
    const updatedFormData = {
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

      companyName:
        profile?.companyName || "",

      companyWebsite:
        profile?.companyWebsite || "",

      industry:
        profile?.industry || "",

      companyLocation:
        profile?.companyLocation || "",

      companyDescription:
        profile?.companyDescription || "",

      companyLinkedin:
        profile?.companyLinkedin || "",
    };

    // Profile data comes from API asynchronously.
    // Syncing form state with loaded profile is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(updatedFormData);
  }, [profile]);

  // ==========================================
  // IMAGE URL
  // ==========================================

  const getImageUrl = (fileId) => {
    if (!fileId) {
      return "";
    }

    // If already a complete URL
    if (
      typeof fileId === "string" &&
      fileId.startsWith("http")
    ) {
      return fileId;
    }

    // GridFS image
    return `${BASE_URL}/api/media/${fileId}`;
  };

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const endpoint = isEmployer
        ? "/employer/profile"
        : "/profile";

      const response = await API.put(
        endpoint,
        formData
      );

      const updatedProfile =
        response.data.user ||
        response.data.profile ||
        response.data;

      setMessage(
        response.data.message ||
          "Profile updated successfully."
      );

      onSaved?.(updatedProfile);
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
  // SELECT IMAGE
  // ==========================================

  const handlePhotoChange = (e) => {
    const file =
      e.target.files?.[0] || null;

    setPhoto(file);
    setMessage("");
    setError("");

    if (file) {
      // Show selected image immediately
      setPhotoPreview(
        URL.createObjectURL(file)
      );
    } else {
      setPhotoPreview("");
    }
  };

  // ==========================================
  // UPLOAD IMAGE
  // ==========================================

  const handleUpload = async () => {
    if (!photo) {
      setError(
        isEmployer
          ? "Please select a company logo first."
          : "Please select a profile photo first."
      );

      return;
    }

    setPhotoLoading(true);
    setMessage("");
    setError("");

    try {
      const data = new FormData();

      // Candidate -> photo
      // Employer -> logo
      const fieldName = isEmployer
        ? "logo"
        : "photo";

      const endpoint = isEmployer
        ? "/employer/logo"
        : "/profile/photo";

      data.append(fieldName, photo);

      const response = await API.post(
        endpoint,
        data
      );

      const updatedProfile =
        response.data.user ||
        response.data.profile ||
        response.data;

      setMessage(
        response.data.message ||
          (
            isEmployer
              ? "Company logo uploaded successfully."
              : "Profile photo uploaded successfully."
          )
      );

      // Update parent profile
      onSaved?.(updatedProfile);

      // Clear selected file
      setPhoto(null);

      // Clear local preview.
      // Existing GridFS image will now be displayed.
      setPhotoPreview("");

      // Clear file input
      const fileInput =
        document.getElementById(
          isEmployer
            ? "companyLogoInput"
            : "profilePhotoInput"
        );

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error(
        "Image upload error:",
        err
      );

      setError(
        err.response?.data?.message ||
          (
            isEmployer
              ? "Unable to upload company logo."
              : "Unable to upload profile photo."
          )
      );
    } finally {
      setPhotoLoading(false);
    }
  };

  // ==========================================
  // DELETE IMAGE
  // ==========================================

  const handleDeletePhoto = async () => {
    setPhotoLoading(true);
    setMessage("");
    setError("");

    try {
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

      setMessage(
        response.data.message ||
          (
            isEmployer
              ? "Company logo removed successfully."
              : "Profile photo removed successfully."
          )
      );

      onSaved?.(updatedProfile);

      setPhoto(null);
      setPhotoPreview("");

      const fileInput =
        document.getElementById(
          isEmployer
            ? "companyLogoInput"
            : "profilePhotoInput"
        );

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error(
        "Image delete error:",
        err
      );

      setError(
        err.response?.data?.message ||
          (
            isEmployer
              ? "Unable to remove company logo."
              : "Unable to remove profile photo."
          )
      );
    } finally {
      setPhotoLoading(false);
    }
  };

  // ==========================================
  // FIELDS
  // ==========================================

  const candidateFields = [
    ["name", "Full Name", "text"],
    ["email", "Email", "email"],
    ["phone", "Phone", "tel"],
    ["location", "Location", "text"],
    ["skills", "Skills", "text"],
    ["education", "Education", "text"],
    ["linkedin", "LinkedIn", "url"],
    ["github", "GitHub", "url"],
    ["portfolio", "Portfolio", "url"],
  ];

  const employerFields = [
    ["name", "Contact Name", "text"],
    ["email", "Email", "email"],
    ["phone", "Phone", "tel"],
    ["companyName", "Company Name", "text"],
    [
      "companyWebsite",
      "Company Website",
      "url",
    ],
    ["industry", "Industry", "text"],
    [
      "companyLocation",
      "Company Location",
      "text",
    ],
    [
      "companyLinkedin",
      "Company LinkedIn",
      "url",
    ],
  ];

  const fields = isEmployer
    ? employerFields
    : candidateFields;

  // ==========================================
  // EXISTING IMAGE
  // ==========================================

  const existingImage = isEmployer
    ? profile?.companyLogo
    : profile?.profilePhoto;

  // ==========================================
  // IMAGE URL TO DISPLAY
  // ==========================================

  const displayedImage =
    photoPreview ||
    getImageUrl(existingImage);

  // ==========================================
  // UI
  // ==========================================

  return (
    <section className="dashboard-section">

      {/* ======================================
          SECTION HEADER
      ======================================= */}

      <div className="section-heading">
        <div>
          <h2>
            {isEmployer
              ? "Company Information"
              : "Professional Information"}
          </h2>

          <p>
            {isEmployer
              ? "Keep your company information and logo up to date."
              : "Keep your professional information and profile photo up to date."}
          </p>
        </div>
      </div>

      {/* ======================================
          ERROR
      ======================================= */}

      {error && (
        <div className="dashboard-error">
          <p>{error}</p>
        </div>
      )}

      {/* ======================================
          SUCCESS
      ======================================= */}

      {message && (
        <div className="dashboard-success">
          <p>{message}</p>
        </div>
      )}

      {/* ======================================
          PROFILE FORM
      ======================================= */}

      <form
        onSubmit={handleSubmit}
        className="profile-form"
      >

        <div className="profile-form-grid">

          {fields.map(
            ([name, label, type]) => (
              <div
                className="form-group"
                key={name}
              >

                <label htmlFor={name}>
                  {label}
                </label>

                <input
                  id={name}
                  name={name}
                  type={type}
                  value={
                    formData[name] || ""
                  }
                  onChange={handleChange}
                  disabled={
                    loading ||
                    (
                      name === "email" &&
                      Boolean(
                        profile?.email
                      )
                    )
                  }
                />

              </div>
            )
          )}

        </div>

        {/* ====================================
            CANDIDATE EXTRA FIELDS
        ===================================== */}

        {!isEmployer && (
          <>
            <div className="form-group">

              <label htmlFor="candidateExperience">
                Experience Details
              </label>

              <textarea
                id="candidateExperience"
                name="experience"
                rows="5"
                value={
                  formData.experience || ""
                }
                onChange={handleChange}
                placeholder="Describe your experience..."
                disabled={loading}
              />

            </div>

            <div className="form-group">

              <label htmlFor="candidateSkills">
                Skills
              </label>

              <textarea
                id="candidateSkills"
                name="skills"
                rows="4"
                value={
                  formData.skills || ""
                }
                onChange={handleChange}
                placeholder="React, JavaScript, Node.js, MongoDB..."
                disabled={loading}
              />

            </div>
          </>
        )}

        {/* ====================================
            EMPLOYER COMPANY DESCRIPTION
        ===================================== */}

        {isEmployer && (
          <div className="form-group">

            <label htmlFor="companyDescription">
              Company Description
            </label>

            <textarea
              id="companyDescription"
              name="companyDescription"
              rows="6"
              value={
                formData.companyDescription ||
                ""
              }
              onChange={handleChange}
              placeholder="Describe your company..."
              disabled={loading}
            />

          </div>
        )}

        {/* ====================================
            SAVE PROFILE
        ===================================== */}

        <button
          type="submit"
          className="dashboard-primary-button"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : "Save Profile"}
        </button>

      </form>

      {/* ======================================
          IMAGE SECTION
      ======================================= */}

      <div className="profile-media-section">

        <div>
          <h3>
            {isEmployer
              ? "Company Logo"
              : "Profile Photo"}
          </h3>

          <p>
            JPG, PNG or WEBP • Maximum 2MB
          </p>
        </div>

        {/* ====================================
            IMAGE PREVIEW
        ===================================== */}

        {displayedImage && (
          <div className="profile-image-preview">

            <img
              src={displayedImage}
              alt={
                isEmployer
                  ? "Company Logo"
                  : "Profile Photo"
              }
              className="profile-media-image"
              onError={(e) => {
                console.error(
                  "Image failed to load:",
                  displayedImage
                );

                e.currentTarget.style.display =
                  "none";
              }}
            />

          </div>
        )}

        {/* ====================================
            FILE INPUT
        ===================================== */}

        <input
          id={
            isEmployer
              ? "companyLogoInput"
              : "profilePhotoInput"
          }
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoChange}
          disabled={photoLoading}
        />

        {/* ====================================
            ACTION BUTTONS
        ===================================== */}

        <div className="profile-media-actions">

          <button
            type="button"
            className="dashboard-primary-button"
            onClick={handleUpload}
            disabled={
              photoLoading || !photo
            }
          >
            {photoLoading
              ? "Uploading..."
              : isEmployer
              ? "Upload Company Logo"
              : "Upload Profile Photo"}
          </button>

          {existingImage && (
            <button
              type="button"
              className="dashboard-danger-button"
              onClick={handleDeletePhoto}
              disabled={photoLoading}
            >
              {isEmployer
                ? "Remove Company Logo"
                : "Remove Profile Photo"}
            </button>
          )}

        </div>

      </div>

    </section>
  );
}

export default ProfileForm;