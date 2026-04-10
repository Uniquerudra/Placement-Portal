import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser, FiMail, FiPhone, FiBook, FiAward,
  FiCalendar, FiLinkedin, FiGithub, FiGlobe,
  FiPlusCircle, FiCheckCircle, FiXCircle
} from "react-icons/fi";
import API from "../api";
import "../css/StudentDashboardDark.css";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [appliedDrives, setAppliedDrives] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [applyForm, setApplyForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    branch: "",
    cgpa: "",
    yearOfPassing: "",
    skills: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    additionalInfo: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [applyError, setApplyError] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);

  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName") || "Student User";
  const userPicture = localStorage.getItem("userPicture");

  const fetchAllData = useCallback(async () => {
    try {
      const [driveRes, myAppsRes, profileRes, notifRes] = await Promise.all([
        API.get("/drives", { headers: { Authorization: `Bearer ${token}` } }),
        API.get("/applications/my", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        API.get("/student/profile", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        API.get("/student/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setDrives(driveRes.data || []);
      setMyApplications(myAppsRes.data || []);
      setProfile(profileRes.data || null);
      setNotifications(notifRes.data || []);

      if (profileRes.data) {
        setApplyForm({
          fullName: profileRes.data.name || "",
          email: profileRes.data.email || "",
          phone: profileRes.data.phone || "",
          branch: profileRes.data.branch || "",
          cgpa: profileRes.data.cgpa || "",
          yearOfPassing: profileRes.data.yearOfPassing || "",
          skills: profileRes.data.skills ? profileRes.data.skills.join(", ") : "",
          linkedinUrl: profileRes.data.linkedinUrl || "",
          githubUrl: profileRes.data.githubUrl || "",
          portfolioUrl: profileRes.data.portfolioUrl || "",
          additionalInfo: "",
        });
      }

      setAppliedDrives(
        (myAppsRes.data || [])
          .map((app) => app?.drive?._id)
          .filter(Boolean)
      );
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const openApplyForm = (drive) => {
    setSelectedDrive(drive);
    setApplyError("");
    // Re-fill with profile data just in case
    if (profile) {
      setApplyForm(prev => ({
        ...prev,
        fullName: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        branch: profile.branch || "",
        cgpa: profile.cgpa || "",
        yearOfPassing: profile.yearOfPassing || "",
        skills: profile.skills ? profile.skills.join(", ") : "",
        linkedinUrl: profile.linkedinUrl || "",
        githubUrl: profile.githubUrl || "",
        portfolioUrl: profile.portfolioUrl || "",
      }));
    }
    setResumeFile(null);
  };

  const closeApplyForm = () => {
    setSelectedDrive(null);
    setApplyError("");
    setApplyLoading(false);
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    if (!selectedDrive) return;

    setApplyLoading(true);
    setApplyError("");

    const formData = new FormData();
    Object.keys(applyForm).forEach(key => {
      formData.append(key, applyForm[key]);
    });

    if (resumeFile) {
      formData.append("resume", resumeFile);
    }

    try {
      await API.post(
        `/student/apply/${selectedDrive._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchAllData();
      closeApplyForm();
    } catch (err) {
      console.error("Apply error:", err);
      const data = err?.response?.data;
      const serverMessage =
        (data && typeof data === "string" ? data : data?.message) || "";
      const fallback =
        err?.message && err.message !== "Network Error"
          ? err.message
          : "Unable to apply for this drive";

      setApplyError(serverMessage || fallback);
      setApplyLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const filteredDrives = drives.filter(drive => 
    drive.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    drive.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredApplications = myApplications.filter(app => 
    app.drive?.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.drive?.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-container student-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "15px" }}>
            <img src={process.env.PUBLIC_URL + "/bbbbb.png"} alt="Logo" style={{ height: "48px", cursor: "pointer" }} onClick={() => navigate("/")} />
            <h2 style={{ fontSize: "1.5rem", margin: 0, fontWeight: "700" }}>TPO Portal</h2>
          </div>
          <button className="btn-back" onClick={() => navigate("/")}>
            ← Back to Home
          </button>
          <h2 style={{ marginTop: "10px" }}>Student Dashboard</h2>
          <p className="dashboard-subtitle">
            View active placement drives, apply, and track the status.
          </p>
        </div>
        <div className="header-right">
          <div className="student-search-bar">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search companies, roles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
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
              <span className="user-role">Student</span>
            </div>
          </div>
          <div className="actions">
            <div className="notifications-wrapper">
              <button
                className={`btn-icon ${notifications.length > 0 ? 'has-notifs' : ''}`}
                onClick={() => setShowNotifs(!showNotifs)}
                title="Notifications"
              >
                🔔 {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
              </button>

              {showNotifs && (
                <div className="notifs-dropdown">
                  <div className="notifs-header">
                    <h4>Notifications</h4>
                    <button onClick={() => setShowNotifs(false)}>×</button>
                  </div>
                  <div className="notifs-list">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n._id} className={`notif-item ${n.type}`}>
                          <div className="notif-title">{n.title}</div>
                          <div className="notif-msg">{n.message}</div>
                          <div className="notif-time">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      ))
                    ) : (
                      <div className="no-notifs">No new notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button
              className="btn-primary"
              onClick={() => navigate("/student/profile")}
            >
              My Profile
            </button>
            <button
              className="btn-primary"
              onClick={() => navigate("/student/resume-analyzer")}
            >
              Resume Analyzer
            </button>
            <button className="btn-logout" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <h3 className="section-title-dark">Available Drives</h3>
      {loading ? (
        <div className="loading-text">Loading...</div>
      ) : (
        <div className="drives-grid">
          {filteredDrives.map((drive) => {
            const isApplied = appliedDrives.includes(drive._id);

            // Eligibility logic
            let isEligible = true;
            let eligibilityReason = "";

            if (profile) {
              if (drive.minCGPA && profile.cgpa < drive.minCGPA) {
                isEligible = false;
                eligibilityReason = `Min CGPA: ${drive.minCGPA}`;
              } else if (drive.allowedBranches && drive.allowedBranches.length > 0) {
                if (!profile.branch || !drive.allowedBranches.includes(profile.branch)) {
                  isEligible = false;
                  eligibilityReason = "Branch not allowed";
                }
              }
            }

            return (
              <div key={drive._id} className="drive-card-dark">
                <div className="drive-card-image">
                  <div className="drive-card-gradient"></div>
                  <div className="card-top-badges">
                    {new Date(drive.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
                      <span className="badge-new">NEW</span>
                    )}
                    {drive.deadline && new Date(drive.deadline) > new Date() && new Date(drive.deadline) < new Date(Date.now() + 48 * 60 * 60 * 1000) && (
                      <span className="badge-deadline">CLOSING SOON</span>
                    )}
                  </div>
                  <span className="drive-card-badge">{drive.package} LPA</span>
                </div>
                <div className="drive-card-content">
                  <h3>{drive.company}</h3>
                  <p className="drive-role">{drive.role}</p>

                  {profile && !isApplied && (
                    <div className={`eligibility-status ${isEligible ? 'eligible' : 'ineligible'}`}>
                      {isEligible ? '✓ Eligible' : '✕ Ineligible'}
                      {!isEligible && <div className="criteria-text">{eligibilityReason}</div>}
                    </div>
                  )}

                  <p className="drive-location">{drive.location}</p>
                  <div className="drive-tags">
                    {drive.eligibilityCriteria && (
                      <span className="tag">{drive.eligibilityCriteria}</span>
                    )}
                    {drive.rounds && <span className="tag">{drive.rounds}</span>}
                  </div>
                  <button
                    className={isApplied ? "btn-applied" : isEligible ? "btn-apply" : "btn-apply disabled-btn"}
                    disabled={isApplied || !isEligible}
                    onClick={() => openApplyForm(drive)}
                  >
                    {isApplied ? (
                      <>
                        <span>✓</span> Applied
                      </>
                    ) : (
                      "Apply Now"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <h3 className="section-title-dark">My Recent Applications</h3>
      <div className="table-container">
        <table className="dashboard-table-student">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Package</th>
              <th>Status</th>
              <th>Applied</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length ? (
              filteredApplications.slice(0, 8).map((app) => (
                <tr key={app._id}>
                  <td>{app.drive?.company || "—"}</td>
                  <td>{app.drive?.role || "—"}</td>
                  <td>{app.drive?.package ? `${app.drive.package} LPA` : "—"}</td>
                  <td>
                    <span className={`status-badge status-${app.status || 'applied'}`}>
                      {app.status || "applied"}
                    </span>
                  </td>
                  <td>
                    {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ padding: 16, color: "#64748b" }}>
                  No applications yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedDrive && (
        <div className="apply-modal-backdrop">
          <div className="apply-modal">
            <h3>
              Apply for {selectedDrive.company} – {selectedDrive.role}
            </h3>
            <p className="dashboard-subtitle">
              Share your key details and upload your latest resume.
            </p>

            {applyError ? (
              <div className="auth-error" role="alert" aria-live="polite">
                {applyError}
              </div>
            ) : null}

            <form className="apply-form-premium" onSubmit={submitApplication}>
              {/* Form Progress/Sections Indicator could be added here if needed */}

              <div className="form-section-premium">
                <h4><FiUser className="section-icon" /> Personal Information</h4>
                <div className="form-grid-premium">
                  <div className="form-group-premium">
                    <label>Full Name</label>
                    <div className="input-with-icon">
                      <FiUser className="input-icon" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={applyForm.fullName}
                        onChange={(e) =>
                          setApplyForm({ ...applyForm, fullName: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group-premium">
                    <label>Email Address</label>
                    <div className="input-with-icon">
                      <FiMail className="input-icon" />
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={applyForm.email}
                        onChange={(e) =>
                          setApplyForm({ ...applyForm, email: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group-premium">
                    <label>Phone Number</label>
                    <div className="input-with-icon">
                      <FiPhone className="input-icon" />
                      <input
                        type="tel"
                        placeholder="+91 9876543210"
                        value={applyForm.phone}
                        onChange={(e) =>
                          setApplyForm({ ...applyForm, phone: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section-premium">
                <h4><FiBook className="section-icon" /> Academic Details</h4>
                <div className="form-grid-premium">
                  <div className="form-group-premium">
                    <label>Branch / Department</label>
                    <div className="input-with-icon">
                      <FiBook className="input-icon" />
                      <input
                        type="text"
                        placeholder="Computer Science"
                        value={applyForm.branch}
                        onChange={(e) =>
                          setApplyForm({ ...applyForm, branch: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="form-group-premium">
                    <label>Current CGPA</label>
                    <div className="input-with-icon">
                      <FiAward className="input-icon" />
                      <input
                        type="text"
                        placeholder="8.5"
                        value={applyForm.cgpa}
                        onChange={(e) =>
                          setApplyForm({ ...applyForm, cgpa: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="form-group-premium">
                    <label>Year of Passing</label>
                    <div className="input-with-icon">
                      <FiCalendar className="input-icon" />
                      <input
                        type="text"
                        placeholder="2026"
                        value={applyForm.yearOfPassing}
                        onChange={(e) =>
                          setApplyForm({ ...applyForm, yearOfPassing: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section-premium">
                <h4><FiLinkedin className="section-icon" /> Professional Links</h4>
                <div className="form-grid-premium">
                  <div className="form-group-premium">
                    <label>LinkedIn Profile</label>
                    <div className="input-with-icon">
                      <FiLinkedin className="input-icon" />
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/..."
                        value={applyForm.linkedinUrl}
                        onChange={(e) =>
                          setApplyForm({ ...applyForm, linkedinUrl: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="form-group-premium">
                    <label>GitHub Profile</label>
                    <div className="input-with-icon">
                      <FiGithub className="input-icon" />
                      <input
                        type="url"
                        placeholder="https://github.com/..."
                        value={applyForm.githubUrl}
                        onChange={(e) =>
                          setApplyForm({ ...applyForm, githubUrl: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="form-group-premium">
                    <label>Portfolio Website</label>
                    <div className="input-with-icon">
                      <FiGlobe className="input-icon" />
                      <input
                        type="url"
                        placeholder="https://myportfolio.com"
                        value={applyForm.portfolioUrl}
                        onChange={(e) =>
                          setApplyForm({ ...applyForm, portfolioUrl: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section-premium">
                <h4><FiPlusCircle className="section-icon" /> Skills & Additional Info</h4>
                <div className="form-group-premium">
                  <label>Key Skills</label>
                  <textarea
                    placeholder="React, Node.js, Python, AWS (comma separated)"
                    value={applyForm.skills}
                    rows="2"
                    onChange={(e) =>
                      setApplyForm({ ...applyForm, skills: e.target.value })
                    }
                  />
                </div>
                <div className="form-group-premium" style={{ marginTop: '1rem' }}>
                  <label>Additional Information</label>
                  <textarea
                    placeholder="Projects, notice period, or any other relevant details..."
                    value={applyForm.additionalInfo}
                    rows="2"
                    onChange={(e) =>
                      setApplyForm({ ...applyForm, additionalInfo: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="file-input-premium">
                <label htmlFor="resume">
                  <FiPlusCircle className="upload-icon" />
                  <span>Upload Latest Resume (PDF, max 5MB)</span>
                </label>
                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setResumeFile(file);
                  }}
                />
                {resumeFile && (
                  <div className="file-selected">
                    <FiCheckCircle /> {resumeFile.name}
                  </div>
                )}
              </div>

              <div className="apply-modal-actions-premium">
                <button
                  type="button"
                  className="btn-cancel-premium"
                  onClick={closeApplyForm}
                  disabled={applyLoading}
                >
                  <FiXCircle /> Cancel
                </button>
                <button
                  type="submit"
                  className={applyLoading ? "btn-submit-premium loading" : "btn-submit-premium"}
                  disabled={applyLoading}
                >
                  {applyLoading ? (
                    <>Submitting...</>
                  ) : (
                    <><FiCheckCircle /> Submit Application</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;

