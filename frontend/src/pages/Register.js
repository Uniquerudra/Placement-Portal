// frontend/src/pages/Register.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "../css/AuthDark.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await API.post("/auth/register", { name, email, password, role });
      navigate("/login");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.msg ||
        "Registration failed";
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <button className="btn-back" onClick={() => navigate("/")}>
        ← Back
      </button>
      <form className="auth-box" onSubmit={handleRegister}>
        <div className="auth-logo" onClick={() => navigate("/")} style={{ cursor: "pointer", display: "flex", justifyContent: "center", marginBottom: "40px" }}>
          <img src={process.env.PUBLIC_URL + "/bbbbb.png"} alt="TPO Portal" className="logo-icon-img auth-standalone-logo" />
        </div>
        {error ? (
          <div className="auth-error" role="alert" aria-live="polite">
            {error}
          </div>
        ) : null}

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="College Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="tpo">TPO</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit" className={loading ? "loading" : ""} disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="auth-footer">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </form>
    </div>
  );
}

export default Register;
