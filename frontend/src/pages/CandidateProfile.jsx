import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";

import ProfileForm from "../components/ProfileForm";
import SavedJobs from "../components/SavedJobs";
import ApplicationStats from "../components/ApplicationStats";

function CandidateProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(
        "/profile"
      );

      setProfile(
        response.data.user ||
          response.data.profile
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Intentional API data-fetching effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, []);

  const handleSaved = (updatedProfile) => {
    setProfile(updatedProfile);

    const storedUser = JSON.parse(
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
        })
      );
    }
  };

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-state">
          <div className="loading-spinner"></div>
          <p>
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-error">
          <strong>
            Unable to load profile
          </strong>

          <p>{error}</p>

          <button
            type="button"
            onClick={fetchProfile}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">

      <div className="dashboard-heading">

        <div>
          <span className="dashboard-eyebrow">
            Candidate Portal
          </span>

          <h1>My Profile</h1>

          <p>
            Keep your professional information
            up to date.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-secondary-button"
          onClick={() =>
            navigate(
              "/candidate-dashboard"
            )
          }
        >
          ← Dashboard
        </button>

      </div>

      <ProfileForm
        mode="candidate"
        profile={profile || {}}
        onSaved={handleSaved}
      />

      <ApplicationStats />

      <SavedJobs />

    </main>
  );
}

export default CandidateProfile;