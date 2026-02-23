import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import "../../css/Dashboard.css";

const API_URL_FALLBACK = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : "http://localhost:5000";
const BACKEND_ORIGIN = process.env.REACT_APP_BACKEND_ORIGIN || API_URL_FALLBACK;

function TPODashboard() {
  const navigate = useNavigate();

  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});

  const token = localStorage.getItem("token");

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
      <div className="dashboard-header">
        <div>
          <h2>TPO Dashboard</h2>
          <p className="dashboard-subtitle">
            Manage campus drives and track student applications in real time.
          </p>
        </div>
        <div className="actions">
          <button onClick={() => navigate("/tpo/add-drive")}>+ Add Drive</button>
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
      <h3 style={{ marginTop: "30px" }}>All Drives</h3>
      <div className="dashboard-cards">
        {drives.map((drive) => (
          <div className="card" key={drive._id}>
            <h3>{drive.company}</h3>
            <p>Role: {drive.role}</p>
            <p>Package: {drive.package} LPA</p>
            <p>Location: {drive.location}</p>
            {drive.eligibilityCriteria && (
              <p>Eligibility: {drive.eligibilityCriteria}</p>
            )}
            {drive.jobDescription && <p>Job: {drive.jobDescription}</p>}
            {drive.rounds && <p>Rounds: {drive.rounds}</p>}
            {drive.deadline && <p>Deadline: {drive.deadline}</p>}
            {drive.contactEmail && <p>Contact: {drive.contactEmail}</p>}
          </div>
        ))}
      </div>

      {/* 🔹 APPLICATIONS SECTION */}
      <h3 style={{ marginTop: "40px" }}>Student Applications</h3>
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
              <td>{app.status}</td>
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
                      const body = `Dear ${app.studentName},%0D%0A%0D%0AYou have been shortlisted for the next round for ${app.driveName} - ${app.role}.%0D%0A%0D%0APlease find the details below:%0D%0A- Date & Time: %0D%0A- Mode / Location: %0D%0A- Things to carry: %0D%0A%0D%0ARegards,%0D%0ATPO Cell`;
                      window.location.href = `mailto:${app.email}?subject=${subject}&body=${body}`;
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
  );
}

export default TPODashboard;
