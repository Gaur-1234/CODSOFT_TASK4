import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function CandidateDashboard() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError(
          "Please login to view your applications."
        );
        setLoading(false);
        return;
      }

      const response = await API.get(
        "/applications/my-applications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApplications(
        response.data.applications || []
      );
    } catch (error) {
      console.error(
        "Error fetching applications:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load your applications."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
    window.location.reload();
  };

useEffect(() => {
  // This is an intentional data-fetching effect.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchApplications();
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
        <div>
          <h1>Candidate Dashboard</h1>

          {user?.name && (
            <p>
              Welcome, <strong>{user.name}</strong> 👋
            </p>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/")}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => navigate("/jobs")}
          >
            Browse Jobs
          </button>

          <button
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Applications */}
      <section className="dashboard-section">

        <h2>My Applications</h2>

        {/* Loading */}
        {loading && (
          <p>Loading applications...</p>
        )}

        {/* Error */}
        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        {/* No Applications */}
        {!loading &&
          !error &&
          applications.length === 0 && (
            <div>
              <p>
                You have not applied for any jobs yet.
              </p>

              <button
                type="button"
                onClick={() => navigate("/jobs")}
              >
                Browse Jobs
              </button>
            </div>
          )}

        {/* Application List */}
        {!loading &&
          !error &&
          applications.length > 0 && (
            <div className="applications-list">

              {applications.map((application) => (
                <div
                  className="application-card"
                  key={application._id}
                >

                  <h3>
                    {application.job?.title ||
                      "Job Title"}
                  </h3>

                  <p>
                    <strong>Company:</strong>{" "}
                    {application.job?.company ||
                      "N/A"}
                  </p>

                  <p>
                    <strong>Location:</strong>{" "}
                    {application.job?.location ||
                      "N/A"}
                  </p>

                  <p>
                    <strong>Job Type:</strong>{" "}
                    {application.job?.jobType ||
                      "N/A"}
                  </p>

                  <p>
                    <strong>Applied On:</strong>{" "}
                    {application.createdAt
                      ? new Date(
                          application.createdAt
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    {application.status ||
                      "Applied"}
                  </p>

                  {application.resume && (
                    <p>
                      <strong>Resume:</strong>{" "}
                      {application.resume}
                    </p>
                  )}

                  {/* View Job */}
                  {application.job?._id && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/jobs/${application.job._id}`
                        )
                      }
                    >
                      View Job
                    </button>
                  )}

                </div>
              ))}

            </div>
          )}

      </section>

    </div>
  );
}

export default CandidateDashboard;