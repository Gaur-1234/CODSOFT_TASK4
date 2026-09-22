import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function PostJob() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [salary, setSalary] = useState("");
  const [jobType, setJobType] = useState("Full-time");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login as an employer first.");
        setLoading(false);
        return;
      }

      const requirementsArray = requirements
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");

      const response = await API.post(
        "/jobs",
        {
          title,
          company,
          location,
          description,
          requirements: requirementsArray,
          salary: salary || "Not specified",
          jobType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        response.data.message ||
          "Job posted successfully!"
      );

      setTitle("");
      setCompany("");
      setLocation("");
      setDescription("");
      setRequirements("");
      setSalary("");
      setJobType("Full-time");

      setTimeout(() => {
        navigate("/employer-dashboard");
      }, 1000);
    } catch (error) {
      console.error("Error posting job:", error);

      setError(
        error.response?.data?.message ||
          "Unable to post job. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-job-page">
      <h1>Post a Job</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Job Title</label>

          <input
            type="text"
            placeholder="e.g. Frontend Developer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Company</label>

          <input
            type="text"
            placeholder="Company name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Location</label>

          <input
            type="text"
            placeholder="e.g. Delhi"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Description</label>

          <textarea
            placeholder="Describe the job..."
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            required
          />
        </div>

        <div>
          <label>Requirements</label>

          <input
            type="text"
            placeholder="React, JavaScript, Node.js"
            value={requirements}
            onChange={(e) =>
              setRequirements(e.target.value)
            }
          />

          <small>
            Separate requirements with commas.
          </small>
        </div>

        <div>
          <label>Salary</label>

          <input
            type="text"
            placeholder="e.g. ₹6-9 LPA"
            value={salary}
            onChange={(e) =>
              setSalary(e.target.value)
            }
          />
        </div>

        <div>
          <label>Job Type</label>

          <select
            value={jobType}
            onChange={(e) =>
              setJobType(e.target.value)
            }
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

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        {success && (
          <p style={{ color: "green" }}>
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Posting Job..." : "Post Job"}
        </button>
      </form>
    </div>
  );
}

export default PostJob;