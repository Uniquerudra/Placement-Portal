import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import "../../css/TPODashboardDark.css";

const API_URL_FALLBACK = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : "http://localhost:5000";
const BACKEND_ORIGIN = process.env.REACT_APP_BACKEND_ORIGIN || API_URL_FALLBACK;

function TPODashboard() {
  const navigate = useNavigate();

  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});

  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName") || "TPO User";
  const userPicture = localStorage.getItem("userPicture");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ✅ Fetch drives
  const fetchDrives = useCallback(async () => {
    try {
      const res = await API.get("/drives", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrives(res.data);
    } catch (error) {
      console.error("Error fetching drives:", error);
    }
  }, [token]);

  // ✅ Fetch applications
  const fetchApplications = useCallback(async () => {
    try {
      const res = await API.get("/applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(res.data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  }, [token]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await API.get("/applications/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data || {});
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, [token]);

  // ✅ useEffect now depends on stable functions
  useEffect(() => {
    fetchDrives();
    fetchApplications();
    fetchStats();
  }, [fetchDrives, fetchApplications, fetchStats]);

  // ✅ Update status
  const updateStatus = async (id, status) => {
    try {
      await API.put(
        `/applications/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchApplications(); // refresh after update
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="dashboard-container tpo-dashboard">
      <button className="btn-back" onClick={() => navigate("/")}>
        ← Go Back
      </button>
      <div className="dashboard-header">
        <div className="header-left">
          <h2>TPO Dashboard</h2>
          <p className="dashboard-subtitle">
            Manage campus drives and track student applications in real time.
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
              <span className="user-role">TPO Admin</span>
            </div>
          </div>
          <div className="actions">
            <button className="btn-add" onClick={() => navigate("/tpo/add-drive")}>+ Add Drive</button>
            <button className="btn-logout" onClick={logout}>Logout</button>
          </div>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="card admin-card">
          <h3>Total Applications</h3>
          <h2>{stats.totalApplications || 0}</h2>
          <p>All student submissions across drives.</p>
        </div>
        <div className="card admin-card">
          <h3>Shortlisted</h3>
          <h2>{stats.totalShortlisted || 0}</h2>
          <p>Students progressed to shortlist.</p>
        </div>
        <div className="card admin-card">
          <h3>Selected</h3>
          <h2>{stats.totalSelected || 0}</h2>
          <p>Final selections recorded.</p>
        </div>
      </div>

      {/* 🔹 DRIVES SECTION */}
      <h3 className="section-title-dark">All Drives</h3>
      <div className="drives-grid">
        {drives.map((drive) => (
          <div className="drive-card-dark" key={drive._id}>
            <div className="drive-card-image">
              <div className="drive-card-gradient"></div>
              <span className="drive-card-badge">{drive.package} LPA</span>
            </div>
            <div className="drive-card-content">
              <h3>{drive.company}</h3>
              <p className="drive-role">{drive.role}</p>
              <p className="drive-location">📍 {drive.location}</p>
              <div className="drive-tags">
                {drive.eligibilityCriteria && (
                  <span className="tag">{drive.eligibilityCriteria}</span>
                )}
                {drive.rounds && <span className="tag">{drive.rounds}</span>}
                {drive.deadline && (
                  <span className="tag tag-deadline">⏰ {new Date(drive.deadline).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 APPLICATIONS SECTION */}
      <h3 className="table-section-title">Student Applications</h3>
      <div className="table-container">
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
            <th>Applied</th>
            <th>Resume</th>
            <th>Email</th>
            <th>Update</th>
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
              <td>
                <span className={`status-badge status-${app.status}`}>
                  {app.status}
                </span>
              </td>
              <td>
                {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "—"}
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
              <td>
                {app.email ? (
                  <button
                    className="btn-secondary"
                    type="button"
                    onClick={() => {
                      const subject = `Next Round Details - ${app.driveName} (${app.role})`;

                      const body = `Dear ${app.studentName},

You have been shortlisted for the next round for ${app.driveName} - ${app.role}.

Please find the details below:
- Date & Time:
- Mode / Location:
- Things to carry:

Regards,
TPO Cell`;

                      // ✅ Gmail (Chrome) compose link
                      const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                        app.email
                      )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

                      const newTab = window.open(gmailURL, "_blank");

                      // 🔁 Fallback → default mail client (mailto)
                      if (!newTab) {
                        window.location.href = `mailto:${app.email}?subject=${encodeURIComponent(
                          subject
                        )}&body=${encodeURIComponent(body)}`;
                      }
                    }}
                  >
                    Email
                  </button>
                ) : (
                  "—"
                )}
              </td>
              <td>
                <select
                  value={app.status}
                  onChange={(e) => updateStatus(app._id, e.target.value)}
                >
                  <option value="applied">Applied</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="selected">Selected</option>
                  <option value="rejected">Rejected</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
}

export default TPODashboard;
