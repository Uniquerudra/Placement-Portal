import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import "../../css/TPODashboardDark.css";


function TPODashboard() {
  const navigate = useNavigate();

  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName") || "TPO User";

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

  // ✅ Filter drives and applications based on search query
  const filteredDrives = drives.filter(drive => 
    drive.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    drive.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredApplications = applications.filter(app => 
    app.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.driveName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="tpo-dashboard-wrapper">
      {/* 🔹 TOP NAVBAR */}
      <nav className="tpo-top-nav">
        <div className="tpo-search-bar">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search students, companies, drives..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="tpo-nav-right">
          <div className="tpo-notification">
            🔔<span className="badge">3</span>
          </div>
          <div className="tpo-profile-avatar">
            {userName ? (userName.substring(0, 2).toUpperCase()) : "TP"}
          </div>
        </div>
      </nav>

      {/* 🔹 WHITE HEADER AREA */}
      <div className="tpo-header-white">
        <div className="tpo-header-top-row">
          <button className="tpo-btn-back" onClick={() => navigate("/")}>
            <span className="arrow">←</span> Go Back
          </button>
          <div className="tpo-header-actions">
            <div className="tpo-admin-info">
              <div className="admin-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="admin-text">TPO Admin</span>
            </div>
            <button className="tpo-btn-add" onClick={() => navigate("/tpo/add-drive")}>
              + ADD DRIVE
            </button>
            <button className="tpo-btn-logout" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
        <div className="tpo-header-titles">
          <h1 className="tpo-main-title">TPO Dashboard</h1>
          <p className="tpo-main-subtitle">
            Manage campus drives and track student applications in real time.
          </p>
        </div>
      </div>

      {/* 🔹 STATS CARDS */}
      <div className="tpo-stats-row">
        <div className="tpo-stat-card">
          <p className="stat-label">TOTAL APPLICATIONS</p>
          <h2 className="stat-value">{stats.totalApplications || 0}</h2>
          <p className="stat-desc">All student submissions across drives</p>
        </div>
        <div className="tpo-stat-card">
          <p className="stat-label">SHORTLISTED</p>
          <h2 className="stat-value">{stats.totalShortlisted || 0}</h2>
          <p className="stat-desc">Students progressed to shortlist</p>
        </div>
        <div className="tpo-stat-card">
          <p className="stat-label">SELECTED</p>
          <h2 className="stat-value">{stats.totalSelected || 0}</h2>
          <p className="stat-desc">Final selections recorded</p>
        </div>
      </div>

      {/* 🔹 ACTIVE DRIVES */}
      <div className="tpo-section-header">
        <div className="tpo-section-title">Active Drives</div>
      </div>
      <div className="tpo-drives-grid">
        {filteredDrives.map((drive) => (
          <div className="tpo-drive-card" key={drive._id}>
            <div className="drive-top-half">
              <span className="drive-salary-badge">{drive.package} LPA</span>
            </div>
            <div className="drive-bottom-half">
              <h3 className="company-name">{drive.company}</h3>
              <p className="company-role">{drive.role}</p>
              <div className="company-location">
                <span className="loc-pin">📍</span> {drive.location || "Location TBD"}
              </div>
              
              <div className="drive-pills">
                {drive.minCGPA > 0 && <span className="pill">MIN CGPA: {drive.minCGPA}</span>}
                {drive.deadline && (
                  <span className="pill">
                    ENDS: {new Date(drive.deadline).toLocaleDateString()}
                  </span>
                )}
                {drive.skills && drive.skills.includes("DSA") && <span className="pill">DSA</span>}
              </div>

              <div className="drive-footer-btn">
                <span>View Details</span>
                <span>→</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 APPLICATIONS TABLE */}
      <div className="tpo-section-header">
        <div className="tpo-section-title">Student Applications</div>
      </div>
      <div className="tpo-table-wrapper">
        <table className="tpo-table">
          <thead>
            <tr>
              <th>STUDENT</th>
              <th>EMAIL</th>
              <th>COMPANY</th>
              <th>ROLE</th>
              <th>CGPA</th>
              <th>YOP</th>
              <th>STATUS</th>
              <th>APPLIED</th>
              <th>RESUME</th>
              <th>ACTIONS</th>
              <th>UPDATE STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((app) => (
              <tr key={app._id}>
                <td className="st-name text-bold">{app.studentName}</td>
                <td className="st-email">{app.email}</td>
                <td className="st-company">{app.driveName}</td>
                <td className="st-role">{app.role}</td>
                <td>{app.cgpa || "—"}</td>
                <td>{app.yearOfPassing || "—"}</td>
                <td>
                  <span className={`static-status-badge status-${app.status.toLowerCase()}`}>
                    {app.status.toUpperCase()}
                  </span>
                </td>
                <td>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "—"}</td>
                <td>
                  {app.resumeUrl ? (
                    <a
                      className="st-resume"
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className="eye-icon">👁</span> View
                    </a>
                  ) : "—"}
                </td>
                <td>
                  <button 
                    className="st-action-mail"
                    onClick={() => {
                        const subject = `Next Round Details - ${app.driveName} (${app.role})`;
                        const body = `Dear ${app.studentName},/n/nYou have been shortlisted...`;
                        window.open(`https://mail.google.com/mail/?view=cm&to=${app.email}&su=${subject}&body=${body}`, "_blank");
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'4px', verticalAlign:'middle'}}>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg> Email
                  </button>
                </td>
                <td>
                  <select 
                    className="st-action-select-bare"
                    value={app.status.toLowerCase()}
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
