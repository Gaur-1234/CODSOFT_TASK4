import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

function JobDetails() {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");

  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyError, setApplyError] = useState("");

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get(`/jobs/${id}`);

        setJob(response.data.job);
      } catch (error) {
        console.error("Error fetching job:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load job details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // Apply for job
  const handleApply = async (e) => {
    e.preventDefault();

    setApplyMessage("");
    setApplyError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setApplyError("Please login as a candidate first.");
      return;
    }

    if (!resume) {
      setApplyError("Please upload your resume.");
      return;
    }

    const formData = new FormData();

    formData.append("jobId", id);
    formData.append("coverLetter", coverLetter);
    formData.append("resume", resume);

    try {
      setApplying(true);

      await API.post("/applications", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setApplyMessage(
        "Application submitted successfully! Check your email for confirmation."
      );

      setResume(null);
      setCoverLetter("");

      // Reset file input
      document.getElementById("resume").value = "";
    } catch (error) {
      console.error("Application error:", error);

      setApplyError(
        error.response?.data?.message ||
          "Unable to submit application."
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="job-details-page">
        <p>Loading job details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-details-page">
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-details-page">
        <p>Job not found.</p>
      </div>
    );
  }

  return (
    <div className="job-details-page">
      <h1>{job.title}</h1>

      <h2>{job.company}</h2>

      <p>
        <strong>Location:</strong> {job.location}
      </p>

      <p>
        <strong>Job Type:</strong> {job.jobType}
      </p>

      <p>
        <strong>Salary:</strong> {job.salary}
      </p>

      <h3>Description</h3>

      <p>{job.description}</p>

      {job.requirements?.length > 0 && (
        <>
          <h3>Requirements</h3>

          <ul>
            {job.requirements.map((requirement, index) => (
              <li key={index}>{requirement}</li>
            ))}
          </ul>
        </>
      )}

      {job.employer && (
        <>
          <h3>Employer</h3>

          <p>
            <strong>Name:</strong>{" "}
            {job.employer.name}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {job.employer.email}
          </p>
        </>
      )}

      <hr />

      <h2>Apply for this Job</h2>

      <form onSubmit={handleApply}>
        <div>
          <label htmlFor="resume">
            Resume (PDF, DOC, DOCX)
          </label>

          <input
            id="resume"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) =>
              setResume(e.target.files[0])
            }
            required
          />
        </div>

        <div>
          <label htmlFor="coverLetter">
            Cover Letter
          </label>

          <textarea
            id="coverLetter"
            placeholder="Write your cover letter..."
            value={coverLetter}
            onChange={(e) =>
              setCoverLetter(e.target.value)
            }
            rows="6"
          />
        </div>

        {applyError && (
          <p style={{ color: "red" }}>
            {applyError}
          </p>
        )}

        {applyMessage && (
          <p style={{ color: "green" }}>
            {applyMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={applying}
        >
          {applying
            ? "Submitting Application..."
            : "Apply for Job"}
        </button>
      </form>
    </div>
  );
}

export default JobDetails;