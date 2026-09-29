import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const accessToken =
    localStorage.getItem("accessToken");

  const storedUser =
    localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch (error) {
    console.error(
      "Unable to parse stored user:",
      error
    );
  }

  const isLoggedIn =
    Boolean(accessToken);

  const role = user?.role;

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem(
      "accessToken"
    );

    localStorage.removeItem(
      "refreshToken"
    );

    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <header className="navbar">

      <div className="navbar-container">

        {/* ==================================
            LOGO
        =================================== */}

        <Link
          to="/"
          className="navbar-brand"
        >
          JobBoard
        </Link>

        {/* ==================================
            NAVIGATION
        =================================== */}

        <nav className="nav-links">

          <Link
            to="/"
            className="nav-link"
          >
            Home
          </Link>

          <Link
            to="/jobs"
            className="nav-link"
          >
            Jobs
          </Link>

          {/* =================================
              CANDIDATE NAVIGATION
          ================================= */}

          {isLoggedIn &&
            role === "candidate" && (
              <>
                <Link
                  to="/candidate-dashboard"
                  className="nav-link"
                >
                  Dashboard
                </Link>

                <Link
                  to="/candidate-profile"
                  className="nav-link"
                >
                  Profile
                </Link>
              </>
            )}

          {/* =================================
              EMPLOYER NAVIGATION
          ================================= */}

          {isLoggedIn &&
            role === "employer" && (
              <>
                <Link
                  to="/employer-dashboard"
                  className="nav-link"
                >
                  Dashboard
                </Link>

                <Link
                  to="/post-job"
                  className="nav-link"
                >
                  Post Job
                </Link>

                <Link
                  to="/employer-profile"
                  className="nav-link"
                >
                  Profile
                </Link>
              </>
            )}

          {/* =================================
              AUTH ACTIONS
          ================================= */}

          {!isLoggedIn && (
            <>
              <Link
                to="/login"
                className="nav-link"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="nav-register"
              >
                Register
              </Link>
            </>
          )}

          {/* =================================
              LOGGED-IN USER
          ================================= */}

          {isLoggedIn && (
            <div className="nav-user">

              <div className="nav-avatar">
                {(
                  user?.name ||
                  user?.email ||
                  "U"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="nav-user-info">

                <span className="nav-user-name">
                  {user?.name ||
                    user?.email ||
                    "User"}
                </span>

              </div>

              <button
                type="button"
                className="nav-logout"
                onClick={handleLogout}
              >
                Logout
              </button>

            </div>
          )}

        </nav>

      </div>

    </header>
  );
}

export default Navbar;