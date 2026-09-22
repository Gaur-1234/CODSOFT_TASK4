import { useEffect, useState } from "react";
import API from "../services/api";

function CandidateDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to view your applications.");
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

      setApplications(response.data.applications);
    } catch (error) {
      console.error("Error fetching applications:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load your applications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // This is an intentional data-fetching effect.
    // The eslint rule flags the state updates inside the async request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchApplications();
  }, []);

  return (
    <div className="dashboard-page">
      <h1>Candidate Dashboard</h1>

      <section className="dashboard-section">
        <h2>My Applications</h2>

        {loading && <p>Loading applications...</p>}

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          applications.length === 0 && (
            <p>
              You have not applied for any jobs yet.
            </p>
          )}

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
                    {new Date(
                      application.createdAt
                    ).toLocaleDateString()}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    {application.status}
                  </p>

                  {application.resume && (
                    <p>
                      <strong>Resume:</strong>{" "}
                      {application.resume}
                    </p>
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