// frontend/src/pages/Login.js
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import API from "../api";
import "../css/AuthDark.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roleParam = queryParams.get("role") || "";

  const getRoleSubtitle = () => {
    switch (roleParam.toLowerCase()) {
      case "student":
        return "Login as a Student";
      case "tpo":
        return "Login as a TPO";
      case "admin":
        return "Login as an Administrator";
      default:
        return "Login to your account";
    }
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", { email, password });
      if (!res.data?.token || !res.data?.role) {
        throw new Error("Unexpected server response");
      }
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userName", res.data.user?.name || "");
      localStorage.setItem("userPicture", res.data.user?.picture || "");

      if (res.data.role === "admin") navigate("/admin");
      else if (res.data.role === "tpo") navigate("/tpo");
      else navigate("/student");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Login failed";
      setError(msg);
    }
    setLoading(false);
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError("");

      try {
        // Get user info from Google using the access token
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );
        const userInfo = await userInfoResponse.json();

        // Send Google user info to backend
        const res = await API.post("/auth/google", {
          googleId: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
        });

        if (!res.data?.token || !res.data?.role) {
          throw new Error("Unexpected server response");
        }

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("userName", res.data.user?.name || "");
        localStorage.setItem("userPicture", res.data.user?.picture || "");

        if (res.data.role === "admin") navigate("/admin");
        else if (res.data.role === "tpo") navigate("/tpo");
        else navigate("/student");
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Google login failed";
        setError(msg);
      }
      setGoogleLoading(false);
    },
    onError: () => {
      setError("Google login failed. Please try again.");
      setGoogleLoading(false);
    },
  });

  return (
    <div className="auth-container">
      <button className="btn-back" onClick={() => navigate("/")}>
        ← Back
      </button>
      <form className="auth-box" onSubmit={handleLogin}>
        <div className="auth-logo" onClick={() => navigate("/")} style={{ cursor: "pointer", display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <img src={process.env.PUBLIC_URL + "/bbbbb.png"} alt="TPO Portal" className="logo-icon-img auth-standalone-logo" />
        </div>
        <h2 style={{ textAlign: "center", marginBottom: "5px", color: "var(--text-primary)" }}>Welcome Back</h2>
        <p style={{ textAlign: "center", marginBottom: "25px", color: "#64748b", fontSize: "0.95rem" }}>{getRoleSubtitle()}</p>
        {error ? (
          <div className="auth-error" role="alert" aria-live="polite">
            {error}
          </div>
        ) : null}

        <input
          type="email"
          placeholder="College Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="auth-password">
          <input
            type={showPass ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            className="auth-password-toggle"
            onClick={() => setShowPass(!showPass)}
            role="button"
            aria-label={showPass ? "Hide password" : "Show password"}
          >
            {showPass ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </span>
        </div>

        <div className="auth-forgot">
          <span onClick={() => navigate("/forgot-password")}>
            Forgot Password?
          </span>
        </div>

        <button
          type="submit"
          className={loading ? "loading" : ""}
          disabled={loading || googleLoading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="google-login-btn"
          disabled={loading || googleLoading}
        >
          <svg
            className="google-icon"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g fill="#000" fillRule="evenodd">
              <path
                d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z"
                fill="#EA4335"
              />
              <path
                d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.21 1.18-.84 2.18-1.79 2.91l2.73 2.12c1.63-1.5 2.74-3.7 2.74-6.53z"
                fill="#4285F4"
              />
              <path
                d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z"
                fill="#FBBC05"
              />
              <path
                d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.73-2.12c-.76.53-1.78.9-3.23.9-2.38 0-4.4-1.57-5.12-3.74L.96 13.04C2.45 15.98 5.48 18 9 18z"
                fill="#34A853"
              />
            </g>
          </svg>
          {googleLoading ? "Signing in..." : "Login with Google"}
        </button>

        <p className="auth-footer">
          New user?{" "}
          <span onClick={() => navigate("/register")}>Create account</span>
        </p>
      </form>
    </div>
  );
}

export default Login;
