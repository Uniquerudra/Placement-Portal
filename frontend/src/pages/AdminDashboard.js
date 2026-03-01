// frontend/src/pages/admin/AdminDashboard.js
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "../css/AdminDashboardDark.css";

const BACKEND_ORIGIN = process.env.REACT_APP_BACKEND_ORIGIN || "http://localhost:5000";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applications, setApplications] = useState([]);

  const userName = localStorage.getItem("userName") || "Admin User";
  const userPicture = localStorage.getItem("userPicture");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await API.get("/applications/stats", {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        });
        setStats(res.data || {});

        const appsRes = await API.get("/applications", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        setApplications(appsRes.data || []);
      } catch (err) {
        console.error(err);
        setError(
          err?.response?.data?.message || "Unable to load dashboard metrics"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const placementRate = useMemo(() => {
    const total = Number(stats.totalApplications || 0);
    const selected = Number(stats.totalSelected || 0);
    if (!total || total <= 0) return 0;
    return Math.round((selected / total) * 100);
  }, [stats.totalApplications, stats.totalSelected]);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="dashboard-container admin-dashboard">
      <button className="btn-back" onClick={() => navigate("/")}>
        ← Go Back
      </button>
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Placement Overview</h1>
          <p className="dashboard-subtitle">
            High‑level snapshot of the current placement season for your
            institute.
          </p>
        </div>
        <div className="header-right">
          <div className="user-profile">
            <div className="profile-img-container">
              {userPicture ? (
                <img src={userPicture} alt={userName} className="profile-pic" />
              ) : (
                <div className="profile-placeholder">{userName.charAt(0)}</div>
              )}
            </div>
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <span className="user-role">Administrator</span>
            </div>
          </div>
          <div className="actions">
            <button className="btn-logout" onClick={logout}>Logout</button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="auth-error" style={{ maxWidth: 520, marginTop: 18 }}>
          {error}
        </div>
      ) : null}

      {loading ? (
        <div style={{ marginTop: 18, color: "#64748b", fontWeight: 600 }}>
          Loading dashboard…
        </div>
      ) : null}

      <div className="dashboard-cards">
        <div className="card admin-card">
          <h3>Total Applications</h3>
          <h2>{stats.totalApplications || 0}</h2>
          <p>All student submissions across active drives.</p>
        </div>
        <div className="card admin-card">
          <h3>Shortlisted</h3>
          <h2>{stats.totalShortlisted || 0}</h2>
          <p>Candidates moved to the shortlist stage.</p>
        </div>
        <div className="card admin-card">
          <h3>Selected</h3>
          <h2>{stats.totalSelected || 0}</h2>
          <p>Candidates marked as selected in the system.</p>
        </div>
        <div className="card admin-card">
          <h3>Highest Package</h3>
          <h2>{stats.highestPackage || 0} LPA</h2>
          <p>Best offer achieved in the current batch.</p>
        </div>
      </div>

      <section className="admin-insights">
        <div className="admin-insights-card">
          <h3>Placement Efficiency</h3>
          <p className="admin-insights-metric">{placementRate}%</p>
          <p className="admin-insights-caption">
            of total applicants have been selected so far.
          </p>
          <ul>
            <li>
              <span>Applications:</span>{" "}
              <strong>{stats.totalApplications || 0}</strong>
            </li>
            <li>
              <span>Selected:</span>{" "}
              <strong>{stats.totalSelected || 0}</strong>
            </li>
            <li>
              <span>Highest Package:</span>{" "}
              <strong>{stats.highestPackage || 0} LPA</strong>
            </li>
          </ul>
        </div>

        <div className="admin-insights-card secondary">
          <h3>Next actions</h3>
          <p className="admin-insights-caption">
            Use this dashboard as a control center for upcoming drives.
          </p>
          <ul>
            <li>Monitor application volume and selection ratio.</li>
            <li>Identify drives that need additional promotion.</li>
            <li>Share key metrics with department stakeholders.</li>
          </ul>
        </div>
      </section>

      <h3 className="table-section-title">Recent Applications</h3>
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Email</th>
            <th>Company</th>
            <th>Role</th>
            <th>CGPA</th>
            <th>YOP</th>
            <th>Skills</th>
            <th>Status</th>
            <th>Applied At</th>
            <th>Resume</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app._id}>
              <td>{app.studentName}</td>
              <td>{app.email}</td>
              <td>{app.driveName}</td>
              <td>{app.role}</td>
              <td>{app.cgpa || "—"}</td>
              <td>{app.yearOfPassing || "—"}</td>
              <td>{app.skills || "—"}</td>
              <td>{app.status}</td>
              <td>
                {app.appliedAt
                  ? new Date(app.appliedAt).toLocaleDateString()
                  : "-"}
              </td>
              <td>
                {app.resumeUrl ? (
                  <a
                    href={
                      app.resumeUrl.startsWith("http")
                        ? app.resumeUrl
                        : `${BACKEND_ORIGIN.replace(/\/$/, "")}/${app.resumeUrl.replace(/\\/g, '/').replace(/^\//, '')}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#2563eb", fontWeight: 600 }}
                  >
                    View
                  </a>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
