import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function SavedJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [removing, setRemoving] =
    useState("");

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(
        "/jobs/saved"
      );

      setJobs(
        response.data.jobs || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load saved jobs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Intentional API data-fetching effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSavedJobs();
  }, []);

  const removeSavedJob = async (
    jobId
  ) => {
    try {
      setRemoving(jobId);

      await API.delete(
        `/jobs/${jobId}/save`
      );

      setJobs((previous) =>
        previous.filter(
          (job) =>
            job._id !== jobId
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to remove saved job."
      );
    } finally {
      setRemoving("");
    }
  };

  return (
    <section className="dashboard-section">

      <div className="section-heading">
        <div>
          <h2>Saved Jobs</h2>
          <p>
            Jobs you saved for later.
          </p>
        </div>

        <span className="application-count">
          {jobs.length}{" "}
          {jobs.length === 1
            ? "Job"
            : "Jobs"}
        </span>
      </div>

      {error && (
        <div className="dashboard-error">
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div className="dashboard-state">
          <div className="loading-spinner"></div>
          <p>
            Loading saved jobs...
          </p>
        </div>
      )}

      {!loading &&
        !error &&
        jobs.length === 0 && (
          <div className="dashboard-empty">

            <div className="empty-icon">
              🔖
            </div>

            <h3>
              No saved jobs
            </h3>

            <p>
              Save interesting jobs and
              come back to them later.
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
        )}

      {!loading &&
        jobs.length > 0 && (
          <div className="applications-list">

            {jobs.map((job) => (
              <article
                className="application-card"
                key={job._id}
              >

                <div className="application-card-top">

                  <div>
                    <span className="application-label">
                      Saved Job
                    </span>

                    <h3>
                      {job.title ||
                        "Job Title"}
                    </h3>
                  </div>

                  <span className="job-type-badge">
                    {job.jobType ||
                      "Job"}
                  </span>

                </div>

                <div className="application-details">

                  <div className="detail-item">
                    <span className="detail-label">
                      Company
                    </span>

                    <span className="detail-value">
                      {job.company ||
                        "N/A"}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">
                      Location
                    </span>

                    <span className="detail-value">
                      {job.location ||
                        "N/A"}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">
                      Salary
                    </span>

                    <span className="detail-value">
                      {job.salary ||
                        "Not specified"}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">
                      Status
                    </span>

                    <span className="detail-value">
                      {job.status ||
                        "Open"}
                    </span>
                  </div>

                </div>

                <div className="application-actions">

                  <button
                    type="button"
                    className="dashboard-primary-button"
                    onClick={() =>
                      navigate(
                        `/jobs/${job._id}`
                      )
                    }
                  >
                    View Job
                  </button>

                  <button
                    type="button"
                    className="dashboard-danger-button"
                    disabled={
                      removing === job._id
                    }
                    onClick={() =>
                      removeSavedJob(
                        job._id
                      )
                    }
                  >
                    {removing === job._id
                      ? "Removing..."
                      : "Remove Saved"}
                  </button>

                </div>

              </article>
            ))}

          </div>
        )}

    </section>
  );
}

export default SavedJobs;