import { useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";

function PostJob() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    requirements: "",
    salary: "",
    jobType: "Full-time",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // SUBMIT JOB
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await API.post(
        "/jobs",
        formData
      );

      setMessage(
        response.data.message ||
          "Job posted successfully."
      );

      setFormData({
        title: "",
        company: "",
        location: "",
        description: "",
        requirements: "",
        salary: "",
        jobType: "Full-time",
      });

      // Redirect after successful creation
      setTimeout(() => {
        navigate("/employer-dashboard");
      }, 1000);
    } catch (err) {
      console.error(
        "Post job error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to post the job."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <main className="dashboard-page">

      <div className="dashboard-container">

        {/* ====================================
            PAGE HEADER
        ===================================== */}

        <section className="dashboard-header">

          <div>

            <span className="dashboard-eyebrow">
              Employer Portal
            </span>

            <h1>
              Post a New Job
            </h1>

            <p>
              Create a job listing and start
              receiving applications from
              qualified candidates.
            </p>

          </div>

          <div className="dashboard-actions">

            <button
              type="button"
              className="dashboard-secondary-button"
              onClick={() =>
                navigate(
                  "/employer-dashboard"
                )
              }
            >
              ← Dashboard
            </button>

          </div>

        </section>

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
            JOB FORM
        ===================================== */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>

              <h2>
                Job Details
              </h2>

              <p>
                Provide accurate information
                about the position.
              </p>

            </div>

          </div>

          <div className="dashboard-card">

            <form
              onSubmit={handleSubmit}
              className="profile-form"
            >

              <div className="profile-form-grid">

                {/* JOB TITLE */}

                <div className="form-group">

                  <label htmlFor="title">
                    Job Title *
                  </label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Frontend Developer"
                    required
                    disabled={loading}
                  />

                </div>

                {/* COMPANY */}

                <div className="form-group">

                  <label htmlFor="company">
                    Company *
                  </label>

                  <input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. Gaur Automation"
                    required
                    disabled={loading}
                  />

                </div>

                {/* LOCATION */}

                <div className="form-group">

                  <label htmlFor="location">
                    Location *
                  </label>

                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Delhi / Remote"
                    required
                    disabled={loading}
                  />

                </div>

                {/* JOB TYPE */}

                <div className="form-group">

                  <label htmlFor="jobType">
                    Job Type *
                  </label>

                  <select
                    id="jobType"
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    disabled={loading}
                  >

                    <option value="Full-time">
                      Full-time
                    </option>

                    <option value="Part-time">
                      Part-time
                    </option>

                    <option value="Internship">
                      Internship
                    </option>

                    <option value="Contract">
                      Contract
                    </option>

                    <option value="Freelance">
                      Freelance
                    </option>

                  </select>

                </div>

                {/* SALARY */}

                <div className="form-group">

                  <label htmlFor="salary">
                    Salary
                  </label>

                  <input
                    id="salary"
                    name="salary"
                    type="text"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g. ₹6 - ₹10 LPA"
                    disabled={loading}
                  />

                </div>

              </div>

              {/* DESCRIPTION */}

              <div className="form-group">

                <label htmlFor="description">
                  Job Description *
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="7"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the role, responsibilities and expectations..."
                  required
                  disabled={loading}
                />

              </div>

              {/* REQUIREMENTS */}

              <div className="form-group">

                <label htmlFor="requirements">
                  Requirements *
                </label>

                <textarea
                  id="requirements"
                  name="requirements"
                  rows="7"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="List the required skills, qualifications and experience..."
                  required
                  disabled={loading}
                />

              </div>

              {/* ACTIONS */}

              <div className="dashboard-actions">

                <button
                  type="button"
                  className="dashboard-secondary-button"
                  onClick={() =>
                    navigate(
                      "/employer-dashboard"
                    )
                  }
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="dashboard-primary-button"
                  disabled={loading}
                >
                  {loading
                    ? "Posting Job..."
                    : "Post Job"}
                </button>

              </div>

            </form>

          </div>

        </section>

      </div>

    </main>
  );
}

export default PostJob;