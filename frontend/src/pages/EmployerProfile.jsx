import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";

import ProfileForm from "../components/ProfileForm";
import JobStats from "../components/JobStats";
import ApplicantSearch from "../components/ApplicantSearch";

function EmployerProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD EMPLOYER PROFILE
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const response = await API.get(
          "/employer/profile"
        );

        if (cancelled) {
          return;
        }

        setProfile(
          response.data.user ||
            response.data.profile ||
            {}
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Employer profile error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load company profile."
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

  // ==========================================
  // HANDLE PROFILE SAVE / LOGO UPDATE
  // ==========================================

  const handleSaved = (updatedProfile) => {
    setProfile(updatedProfile);

    try {
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

            companyLogo:
              updatedProfile?.companyLogo ||
              storedUser.companyLogo ||
              "",
          })
        );

        // Tell Navbar that profile data changed
        window.dispatchEvent(
          new Event("profileUpdated")
        );
      }
    } catch (error) {
      console.error(
        "Unable to update stored employer:",
        error
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <span className="dashboard-eyebrow">
              Employer Portal
            </span>

            <h1>
              Loading Company Profile...
            </h1>

            <p>
              Please wait while we load your
              company information.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <span className="dashboard-eyebrow">
              Employer Portal
            </span>

            <h1>
              Unable to Load Profile
            </h1>

            <p>{error}</p>

            <div className="dashboard-actions">
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
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">

        {/* ====================================
            PAGE HEADER
        ===================================== */}

        <section className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              Employer Portal
            </span>

            <h1>
              Company Profile
            </h1>

            <p>
              Manage your company and employer
              information.
            </p>
          </div>

          <div className="dashboard-actions">
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

            <button
              type="button"
              className="dashboard-primary-button"
              onClick={() =>
                navigate("/post-job")
              }
            >
              + Post a Job
            </button>
          </div>
        </section>

        {/* ====================================
            COMPANY PROFILE
        ===================================== */}

        <ProfileForm
          mode="employer"
          profile={profile || {}}
          onSaved={handleSaved}
        />

        {/* ====================================
            JOB STATISTICS
        ===================================== */}

        <JobStats />

        {/* ====================================
            APPLICANT SEARCH
        ===================================== */}

        <ApplicantSearch />

      </div>
    </main>
  );
}

export default EmployerProfile;