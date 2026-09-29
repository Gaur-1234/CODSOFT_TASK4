import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import API from "../services/api";
import ProfileForm from "../components/ProfileForm";
import ApplicationStats from "../components/ApplicationStats";
import SavedJobs from "../components/SavedJobs";

function CandidateProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const response =
          await API.get("/profile");

        if (cancelled) {
          return;
        }

        setProfile(
          response.data?.user ||
            response.data?.profile ||
            response.data
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Candidate profile error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load your profile."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSaved = (updatedProfile) => {
    setProfile(updatedProfile);

    try {
      const storedUser =
        JSON.parse(
          localStorage.getItem("user") ||
            "null"
        );

      if (storedUser) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...storedUser,
            name:
              updatedProfile?.name ||
              storedUser.name,
            email:
              updatedProfile?.email ||
              storedUser.email,
            profilePhoto:
              updatedProfile?.profilePhoto ||
              storedUser.profilePhoto ||
              "",
          })
        );

        window.dispatchEvent(
          new Event("profileUpdated")
        );
      }
    } catch (error) {
      console.error(
        "Failed to update local user:",
        error
      );
    }
  };

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <span className="dashboard-eyebrow">
              Candidate Profile
            </span>

            <h1>
              Loading Profile...
            </h1>

            <p>
              Please wait while we load
              your profile.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <span className="dashboard-eyebrow">
              Candidate Profile
            </span>

            <h1>
              Unable to Load Profile
            </h1>

            <p>{error}</p>

            <button
              type="button"
              className="dashboard-primary-button"
              onClick={() =>
                window.location.reload()
              }
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">

        <section className="dashboard-header">

          <div>
            <span className="dashboard-eyebrow">
              Candidate Profile
            </span>

            <h1>My Profile</h1>

            <p>
              Manage your personal
              information, professional
              details and job activity.
            </p>
          </div>

          <div className="dashboard-actions">

            <Link
              to="/candidate-dashboard"
              className="dashboard-secondary-button"
            >
              Dashboard
            </Link>

            <Link
              to="/jobs"
              className="dashboard-primary-button"
            >
              Browse Jobs
            </Link>

          </div>
        </section>

        <section className="dashboard-section">

          <div className="section-heading">
            <div>
              <h2>
                Personal & Professional
                Details
              </h2>

              <p>
                Keep your candidate profile
                updated for employers.
              </p>
            </div>
          </div>

          <div className="dashboard-card">

            <ProfileForm
              mode="candidate"
              profile={profile || {}}
              onSaved={handleSaved}
            />

          </div>
        </section>

        <section className="dashboard-section">

          <div className="section-heading">
            <div>
              <h2>
                Application Statistics
              </h2>

              <p>
                Track your job application
                activity.
              </p>
            </div>
          </div>

          <div className="dashboard-card">
            <ApplicationStats />
          </div>

        </section>

        <section className="dashboard-section">

          <div className="section-heading">

            <div>
              <h2>Saved Jobs</h2>

              <p>
                Jobs you saved for later.
              </p>
            </div>

            <Link
              to="/jobs"
              className="dashboard-secondary-button"
            >
              Find More Jobs
            </Link>

          </div>

          <div className="dashboard-card">
            <SavedJobs />
          </div>

        </section>

      </div>
    </main>
  );
}

export default CandidateProfile;