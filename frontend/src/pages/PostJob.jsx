import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function PostJob() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] =
    useState("");
  const [requirements, setRequirements] =
    useState("");
  const [salary, setSalary] = useState("");
  const [jobType, setJobType] =
    useState("Full-time");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // ================================
  // SUBMIT JOB
  // ================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    if (!user) {
      setError(
        "Please login as an employer first."
      );

      setLoading(false);
      return;
    }

    if (user.role !== "Employer") {
      setError(
        "Only employers can post jobs."
      );

      setLoading(false);
      return;
    }

    try {
      const requirementsArray =
        requirements
          .split(",")
          .map((item) => item.trim())
          .filter(
            (item) => item !== ""
          );

      const response = await API.post(
        "/jobs",
        {
          title,
          company,
          location,
          description,
          requirements:
            requirementsArray,
          salary:
            salary || "Not specified",
          jobType,
        }
      );

      setSuccess(
        response.data.message ||
          "Job posted successfully!"
      );

      // Reset form
      setTitle("");
      setCompany("");
      setLocation("");
      setDescription("");
      setRequirements("");
      setSalary("");
      setJobType("Full-time");

      setTimeout(() => {
        navigate(
          "/employer-dashboard"
        );
      }, 1200);
    } catch (error) {
      console.error(
        "Error posting job:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to post job. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="post-job-page">

      {/* ================================
          PAGE HEADER
      ================================= */}

      <div className="dashboard-heading">

        <div>

          <span className="dashboard-eyebrow">
            Employer Portal
          </span>

          <h1>Post a Job</h1>

          <p>
            Create a new job listing and
            connect with candidates.
          </p>

        </div>

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

      {/* ================================
          FORM
      ================================= */}

      <section className="post-job-card">

        <form
          onSubmit={handleSubmit}
          className="post-job-form"
        >

          {/* JOB TITLE */}

          <div className="form-group">

            <label htmlFor="title">
              Job Title
            </label>

            <input
              id="title"
              type="text"
              placeholder="e.g. Frontend Developer"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              required
            />

          </div>

          {/* COMPANY */}

          <div className="form-group">

            <label htmlFor="company">
              Company
            </label>

            <input
              id="company"
              type="text"
              placeholder="Company name"
              value={company}
              onChange={(e) =>
                setCompany(e.target.value)
              }
              required
            />

          </div>

          {/* LOCATION */}

          <div className="form-group">

            <label htmlFor="location">
              Location
            </label>

            <input
              id="location"
              type="text"
              placeholder="e.g. Delhi / Remote"
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
              required
            />

          </div>

          {/* JOB TYPE */}

          <div className="form-group">

            <label htmlFor="jobType">
              Job Type
            </label>

            <select
              id="jobType"
              value={jobType}
              onChange={(e) =>
                setJobType(
                  e.target.value
                )
              }
              required
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

            </select>

          </div>

          {/* SALARY */}

          <div className="form-group">

            <label htmlFor="salary">
              Salary
            </label>

            <input
              id="salary"
              type="text"
              placeholder="e.g. ₹6-9 LPA"
              value={salary}
              onChange={(e) =>
                setSalary(
                  e.target.value
                )
              }
            />

            <small>
              Leave blank if salary is not
              disclosed.
            </small>

          </div>

          {/* DESCRIPTION */}

          <div className="form-group">

            <label htmlFor="description">
              Job Description
            </label>

            <textarea
              id="description"
              placeholder="Describe the role, responsibilities and expectations..."
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              rows="8"
              required
            />

          </div>

          {/* REQUIREMENTS */}

          <div className="form-group">

            <label htmlFor="requirements">
              Requirements
            </label>

            <input
              id="requirements"
              type="text"
              placeholder="React, JavaScript, Node.js, MongoDB"
              value={requirements}
              onChange={(e) =>
                setRequirements(
                  e.target.value
                )
              }
            />

            <small>
              Separate requirements with
              commas.
            </small>

          </div>

          {/* MESSAGES */}

          {error && (
            <div className="dashboard-error">

              <strong>
                Unable to post job
              </strong>

              <p>{error}</p>

            </div>
          )}

          {success && (
            <div className="dashboard-success">

              <strong>
                Job posted successfully
              </strong>

              <p>{success}</p>

            </div>
          )}

          {/* ACTIONS */}

          <div className="post-job-actions">

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

      </section>

    </main>
  );
}

export default PostJob;