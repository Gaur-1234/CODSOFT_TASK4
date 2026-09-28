import { useEffect, useState } from "react";
import API from "../services/api";

function ProfileForm({
  mode = "candidate",
  profile = {},
  onSaved,
}) {
  const isEmployer = mode === "employer";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    skills: "",
    education: "",
    experience: "",
    linkedin: "",
    github: "",
    portfolio: "",
    companyName: "",
    companyWebsite: "",
    industry: "",
    companyLocation: "",
    companyDescription: "",
    companyLinkedin: "",
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

    // Profile data is loaded asynchronously from the API.
    // Syncing the form state with the loaded profile is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(updatedFormData);
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

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
      setError(
        err.response?.data?.message ||
          "Unable to update profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0] || null;

    setPhoto(file);

    if (file) {
      setPhotoPreview(
        URL.createObjectURL(file)
      );
    } else {
      setPhotoPreview("");
    }
  };

  const handleUpload = async () => {
    if (!photo) {
      setError(
        "Please select an image first."
      );
      return;
    }

    setPhotoLoading(true);
    setMessage("");
    setError("");

    try {
      const data = new FormData();

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
          "Image uploaded successfully."
      );

      onSaved?.(updatedProfile);

      setPhoto(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to upload image."
      );
    } finally {
      setPhotoLoading(false);
    }
  };

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
          "Image removed successfully."
      );

      onSaved?.(updatedProfile);

      setPhoto(null);
      setPhotoPreview("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to remove image."
      );
    } finally {
      setPhotoLoading(false);
    }
  };

  const candidateFields = [
    ["name", "Full Name", "text"],
    ["email", "Email", "email"],
    ["phone", "Phone", "tel"],
    ["location", "Location", "text"],
    ["skills", "Skills", "text"],
    ["education", "Education", "text"],
    ["experience", "Experience", "text"],
    ["linkedin", "LinkedIn", "url"],
    ["github", "GitHub", "url"],
    ["portfolio", "Portfolio", "url"],
  ];

  const employerFields = [
    ["name", "Contact Name", "text"],
    ["email", "Email", "email"],
    ["phone", "Phone", "tel"],
    [
      "companyName",
      "Company Name",
      "text",
    ],
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

  const existingImage = isEmployer
    ? profile?.companyLogo
    : profile?.profilePhoto;

  return (
    <section className="dashboard-section">

      <div className="section-heading">
        <div>
          <h2>
            {isEmployer
              ? "Company Information"
              : "Professional Information"}
          </h2>

          <p>
            Keep your information accurate
            and up to date.
          </p>
        </div>
      </div>

      {error && (
        <div className="dashboard-error">
          <p>{error}</p>
        </div>
      )}

      {message && (
        <div className="dashboard-success">
          <p>{message}</p>
        </div>
      )}

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
                    (name === "email" &&
                      Boolean(
                        profile?.email
                      ))
                  }
                />
              </div>
            )
          )}

        </div>

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

        {(photoPreview ||
          existingImage) && (
          <div className="profile-image-preview">

            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Preview"
              />
            ) : (
              <div className="profile-image-placeholder">
                Image uploaded
              </div>
            )}

          </div>
        )}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoChange}
          disabled={photoLoading}
        />

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
              : "Upload Image"}
          </button>

          {existingImage && (
            <button
              type="button"
              className="dashboard-danger-button"
              onClick={handleDeletePhoto}
              disabled={photoLoading}
            >
              Remove Image
            </button>
          )}

        </div>

      </div>

    </section>
  );
}

export default ProfileForm;