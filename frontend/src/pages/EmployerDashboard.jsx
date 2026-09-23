import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function EmployerDashboard() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login as an employer.");
        setLoading(false);
        return;
      }

      const response = await API.get("/jobs/my-jobs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setJobs(response.data.jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load your jobs."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async (jobId) => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login as an employer.");
        return;
      }

      const response = await API.get(
        `/applications/job/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApplicants((previous) => ({
        ...previous,
        [jobId]: response.data.applications,
      }));

      setSelectedJob(jobId);
    } catch (error) {
      console.error(
        "Error fetching applicants:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load applicants."
      );
    }
  };

  const updateStatus = async (
    applicationId,
    status,
    jobId
  ) => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login as an employer.");
        return;
      }

      await API.patch(
        `/applications/${applicationId}/status`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchApplicants(jobId);
    } catch (error) {
      console.error(
        "Error updating application status:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to update application status."
      );
    }
  };

  useEffect(() => {
    // This is an intentional data-fetching effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMyJobs();
  }, []);

  return (
    <div className="dashboard-page">

      {/* Dashboard Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <h1>Employer Dashboard</h1>

        <button
          type="button"
          onClick={() => navigate("/post-job")}
        >
          + Post a Job
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <p>Loading your jobs...</p>
      )}

      {/* Error */}
      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {/* No Jobs */}
      {!loading &&
        !error &&
        jobs.length === 0 && (
          <div>
            <p>
              You have not posted any jobs yet.
            </p>

            <button
              type="button"
              onClick={() => navigate("/post-job")}
            >
              + Post Your First Job
            </button>
          </div>
        )}

      {/* Jobs */}
      {!loading &&
        jobs.length > 0 && (
          <section className="dashboard-section">

            <h2>My Job Listings</h2>

            {jobs.map((job) => (
              <div
                className="application-card"
                key={job._id}
              >

                <h3>{job.title}</h3>

                <p>
                  <strong>Company:</strong>{" "}
                  {job.company}
                </p>

                <p>
                  <strong>Location:</strong>{" "}
                  {job.location}
                </p>

                <p>
                  <strong>Job Type:</strong>{" "}
                  {job.jobType}
                </p>

                <p>
                  <strong>Salary:</strong>{" "}
                  {job.salary}
                </p>

                {/* Applicants Button */}
                <button
                  type="button"
                  onClick={() =>
                    fetchApplicants(job._id)
                  }
                >
                  View Applicants
                </button>

                {/* Applicants */}
                {selectedJob === job._id &&
                  applicants[job._id] && (
                    <div className="applicants-section">

                      <h3>Applicants</h3>

                      {applicants[job._id].length ===
                      0 ? (
                        <p>
                          No applicants yet.
                        </p>
                      ) : (
                        applicants[job._id].map(
                          (application) => (
                            <div
                              className="application-card"
                              key={application._id}
                            >

                              <h4>
                                {
                                  application
                                    .candidate?.name
                                }
                              </h4>

                              <p>
                                <strong>
                                  Email:
                                </strong>{" "}
                                {
                                  application
                                    .candidate?.email
                                }
                              </p>

                              <p>
                                <strong>
                                  Status:
                                </strong>{" "}
                                {application.status}
                              </p>

                              {/* Application Status */}
                              <select
                                value={
                                  application.status
                                }
                                onChange={(e) =>
                                  updateStatus(
                                    application._id,
                                    e.target.value,
                                    job._id
                                  )
                                }
                              >
                                <option value="Applied">
                                  Applied
                                </option>

                                <option value="Under Review">
                                  Under Review
                                </option>

                                <option value="Shortlisted">
                                  Shortlisted
                                </option>

                                <option value="Rejected">
                                  Rejected
                                </option>
                              </select>

                              {/* Resume */}
                              {application.resume && (
                                <p>
                                  <strong>
                                    Resume:
                                  </strong>{" "}
                                  {
                                    application.resume
                                  }
                                </p>
                              )}

                            </div>
                          )
                        )
                      )}

                    </div>
                  )}

              </div>
            ))}

          </section>
        )}

    </div>
  );
}

export default EmployerDashboard;