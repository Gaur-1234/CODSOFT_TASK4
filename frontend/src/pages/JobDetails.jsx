import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");

  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyError, setApplyError] = useState("");

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [alreadyApplied, setAlreadyApplied] =
    useState(false);

  // Get logged-in user safely
  let user = null;

  try {
    user = JSON.parse(
      localStorage.getItem("user") || "null"
    );
  } catch (error) {
    console.error("Unable to read user data:", error);
  }

  const isCandidate =
    user?.role === "Candidate";

  const isEmployer =
    user?.role === "Employer";

  // ==========================================
  // FETCH JOB DETAILS
  // ==========================================

  useEffect(() => {
    let isMounted = true;

    const fetchJob = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get(
          `/jobs/${id}`
        );

        const jobData =
          response.data?.job ||
          response.data;

        if (isMounted) {
          setJob(jobData);
        }
      } catch (error) {
        console.error(
          "Error fetching job:",
          error
        );

        if (isMounted) {
          setError(
            error.response?.data?.message ||
              "Unable to load job details."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchJob();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // ==========================================
  // CHECK SAVED / APPLICATION STATUS
  // ==========================================

  useEffect(() => {
    if (!isCandidate) {
      return;
    }

    let isMounted = true;

    const checkCandidateData = async () => {
      try {
        const [
          savedResponse,
          applicationsResponse,
        ] = await Promise.all([
          API.get("/jobs/saved"),
          API.get("/applications/my-applications"),
        ]);

        const savedJobs =
          savedResponse.data?.jobs ||
          (Array.isArray(savedResponse.data)
            ? savedResponse.data
            : []);

        const applications =
          applicationsResponse.data?.applications ||
          (Array.isArray(
            applicationsResponse.data
          )
            ? applicationsResponse.data
            : []);

        if (!isMounted) {
          return;
        }

        // Check saved job
        const isJobSaved = savedJobs.some(
          (savedJob) =>
            savedJob?._id === id ||
            savedJob?.job?._id === id ||
            savedJob?.job === id
        );

        setSaved(isJobSaved);

        // Check already applied
        const hasAlreadyApplied =
          applications.some(
            (application) =>
              application?.job?._id === id ||
              application?.job === id
          );

        setAlreadyApplied(
          hasAlreadyApplied
        );
      } catch (error) {
        console.error(
          "Unable to check candidate data:",
          error
        );
      }
    };

    checkCandidateData();

    return () => {
      isMounted = false;
    };
  }, [id, isCandidate]);

  // ==========================================
  // SAVE / UNSAVE JOB
  // ==========================================

  const handleSaveJob = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!isCandidate) {
      return;
    }

    try {
      setSaving(true);

      if (saved) {
        await API.delete(
          `/jobs/${id}/save`
        );

        setSaved(false);
      } else {
        await API.post(
          `/jobs/${id}/save`
        );

        setSaved(true);
      }
    } catch (error) {
      console.error(
        "Save job error:",
        error
      );

      window.alert(
        error.response?.data?.message ||
          "Unable to update saved job."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // HANDLE RESUME
  // ==========================================

  const handleResumeChange = (event) => {
    const file =
      event.target.files?.[0] || null;

    setResume(file);
    setApplyError("");
  };

  // ==========================================
  // APPLY FOR JOB
  // ==========================================

  const handleApply = async (event) => {
    event.preventDefault();

    setApplyMessage("");
    setApplyError("");

    if (!user) {
      navigate("/login");
      return;
    }

    if (!isCandidate) {
      setApplyError(
        "Only candidates can apply for jobs."
      );
      return;
    }

    if (alreadyApplied) {
      setApplyError(
        "You have already applied for this job."
      );
      return;
    }

    if (!resume) {
      setApplyError(
        "Please upload your resume."
      );
      return;
    }

    if (job?.status === "Closed") {
      setApplyError(
        "This job is currently closed."
      );
      return;
    }

    const formData = new FormData();

    formData.append("jobId", id);
    formData.append(
      "coverLetter",
      coverLetter
    );
    formData.append(
      "resume",
      resume
    );

    try {
      setApplying(true);

      const response = await API.post(
        "/applications",
        formData
      );

      setApplyMessage(
        response.data?.message ||
          "Application submitted successfully!"
      );

      setResume(null);
      setCoverLetter("");
      setAlreadyApplied(true);

      const fileInput =
        document.getElementById("resume");

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error(
        "Application error:",
        error
      );

      setApplyError(
        error.response?.data?.message ||
          "Unable to submit application."
      );
    } finally {
      setApplying(false);
    }
  };

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <main className="job-details-page">

        <div className="dashboard-state">
          <div className="loading-spinner"></div>

          <p>
            Loading job details...
          </p>
        </div>

      </main>
    );
  }

  // ==========================================
  // ERROR STATE
  // ==========================================

  if (error) {
    return (
      <main className="job-details-page">

        <div className="dashboard-error">

          <strong>
            Unable to load job
          </strong>

          <p>{error}</p>

          <button
            type="button"
            className="dashboard-secondary-button"
            onClick={() =>
              navigate("/jobs")
            }
          >
            Back to Jobs
          </button>

        </div>

      </main>
    );
  }

  // ==========================================
  // JOB NOT FOUND
  // ==========================================

  if (!job) {
    return (
      <main className="job-details-page">

        <div className="dashboard-empty">

          <div className="empty-icon">
            🔍
          </div>

          <h3>
            Job not found
          </h3>

          <p>
            This job may have been removed
            or is no longer available.
          </p>

          <button
            type="button"
            className="dashboard-primary-button"
            onClick={() =>
              navigate("/jobs")
            }
          >
            Browse Jobs
          </button>

        </div>

      </main>
    );
  }

  // ==========================================
  // JOB DATA
  // ==========================================

  const requirements =
    Array.isArray(job.requirements)
      ? job.requirements
      : [];

  const isClosed =
    job.status === "Closed";

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <main className="job-details-page">

      {/* ======================================
          JOB HEADER
      ======================================= */}

      <section className="job-details-header">

        <div>

          <span className="dashboard-eyebrow">
            Job Opportunity
          </span>

          <h1>
            {job.title}
          </h1>

          <h2>
            {job.company ||
              "Company"}
          </h2>

        </div>

        <div className="job-details-actions">

          {isCandidate && (
            <button
              type="button"
              className="dashboard-secondary-button"
              onClick={handleSaveJob}
              disabled={saving}
            >
              {saving
                ? "Updating..."
                : saved
                ? "♥ Saved"
                : "♡ Save Job"}
            </button>
          )}

          <button
            type="button"
            className="dashboard-secondary-button"
            onClick={() =>
              navigate("/jobs")
            }
          >
            ← Back to Jobs
          </button>

        </div>

      </section>

      {/* ======================================
          JOB INFORMATION
      ======================================= */}

      <section className="job-details-card">

        <div className="job-meta-grid">

          <div className="job-meta-item">

            <span className="detail-label">
              Location
            </span>

            <strong>
              📍 {job.location ||
                "Not specified"}
            </strong>

          </div>

          <div className="job-meta-item">

            <span className="detail-label">
              Job Type
            </span>

            <strong>
              💼 {job.jobType ||
                "Not specified"}
            </strong>

          </div>

          <div className="job-meta-item">

            <span className="detail-label">
              Salary
            </span>

            <strong>
              💰 {job.salary ||
                "Not specified"}
            </strong>

          </div>

          <div className="job-meta-item">

            <span className="detail-label">
              Status
            </span>

            <span
              className={`status-badge status-${
                (
                  job.status ||
                  "Open"
                ).toLowerCase()
              }`}
            >
              {job.status ||
                "Open"}
            </span>

          </div>

        </div>

      </section>

      {/* ======================================
          DESCRIPTION
      ======================================= */}

      <section className="job-details-card">

        <h2>
          Job Description
        </h2>

        <p className="job-description">
          {job.description ||
            "No job description provided."}
        </p>

      </section>

      {/* ======================================
          REQUIREMENTS
      ======================================= */}

      {requirements.length > 0 && (
        <section className="job-details-card">

          <h2>
            Requirements
          </h2>

          <ul className="job-requirements">

            {requirements.map(
              (requirement, index) => (
                <li key={index}>
                  {requirement}
                </li>
              )
            )}

          </ul>

        </section>
      )}

      {/* ======================================
          EMPLOYER
      ======================================= */}

      {job.employer && (
        <section className="job-details-card">

          <h2>
            About the Employer
          </h2>

          <div className="employer-info">

            <div>

              <span className="detail-label">
                Name
              </span>

              <strong>
                {job.employer.name ||
                  "Employer"}
              </strong>

            </div>

            <div>

              <span className="detail-label">
                Email
              </span>

              <strong>
                {job.employer.email ||
                  "Not available"}
              </strong>

            </div>

          </div>

        </section>
      )}

      {/* ======================================
          APPLY SECTION
      ======================================= */}

      {isCandidate && (
        <section className="job-details-card apply-job-card">

          <div className="section-heading">

            <div>

              <h2>
                Apply for this Job
              </h2>

              <p>
                Submit your resume and
                optional cover letter.
              </p>

            </div>

          </div>

          {/* Already Applied */}

          {alreadyApplied ? (

            <div className="dashboard-success">

              <strong>
                Application already submitted
              </strong>

              <p>
                You have already applied
                for this position.
              </p>

              <button
                type="button"
                className="dashboard-primary-button"
                onClick={() =>
                  navigate(
                    "/candidate-dashboard"
                  )
                }
              >
                View My Applications
              </button>

            </div>

          ) : isClosed ? (

            /* Closed Job */

            <div className="dashboard-error">

              <strong>
                Applications are closed
              </strong>

              <p>
                This employer is no longer
                accepting applications for
                this job.
              </p>

            </div>

          ) : (

            /* Application Form */

            <form
              onSubmit={handleApply}
              className="job-application-form"
            >

              <div className="form-group">

                <label htmlFor="resume">
                  Resume
                </label>

                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={
                    handleResumeChange
                  }
                  required
                />

                <small>
                  Accepted formats:
                  PDF, DOC, DOCX
                </small>

              </div>

              <div className="form-group">

                <label htmlFor="coverLetter">
                  Cover Letter
                </label>

                <textarea
                  id="coverLetter"
                  placeholder="Write your cover letter..."
                  value={coverLetter}
                  onChange={(event) =>
                    setCoverLetter(
                      event.target.value
                    )
                  }
                  rows="7"
                />

              </div>

              {applyError && (
                <div className="dashboard-error">
                  <p>
                    {applyError}
                  </p>
                </div>
              )}

              {applyMessage && (
                <div className="dashboard-success">
                  <p>
                    {applyMessage}
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="dashboard-primary-button"
                disabled={applying}
              >
                {applying
                  ? "Submitting Application..."
                  : "Apply for Job"}
              </button>

            </form>

          )}

        </section>
      )}

      {/* ======================================
          EMPLOYER NOTICE
      ======================================= */}

      {isEmployer && (
        <section className="job-details-card">

          <div className="dashboard-empty">

            <div className="empty-icon">
              🏢
            </div>

            <h3>
              Employer View
            </h3>

            <p>
              Employers cannot apply for jobs.
              Manage your listings from the
              Employer Dashboard.
            </p>

            <button
              type="button"
              className="dashboard-primary-button"
              onClick={() =>
                navigate(
                  "/employer-dashboard"
                )
              }
            >
              Go to Dashboard
            </button>

          </div>

        </section>
      )}

    </main>
  );
}

export default JobDetails;