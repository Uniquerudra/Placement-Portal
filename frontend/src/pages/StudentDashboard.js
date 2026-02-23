// frontend/src/pages/StudentDashboard.js
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "../css/Dashboard.css";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  // const [profile, setProfile] = useState({});
  const [appliedDrives, setAppliedDrives] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrive, setSelectedDrive] = useState(null);
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

  const fetchAllData = useCallback(async () => {
    try {
      const [driveRes, myAppsRes] = await Promise.all([
        API.get("/drives", { headers: { Authorization: `Bearer ${token}` } }),
        API.get("/applications/my", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setDrives(driveRes.data || []);
      setMyApplications(myAppsRes.data || []);
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
    setApplyForm((prev) => ({
      ...prev,
      fullName: prev.fullName || "",
      email: prev.email || "",
    }));
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
    formData.append("fullName", applyForm.fullName);
    formData.append("email", applyForm.email);
    formData.append("phone", applyForm.phone);
    formData.append("branch", applyForm.branch);
    formData.append("cgpa", applyForm.cgpa);
    formData.append("yearOfPassing", applyForm.yearOfPassing);
    formData.append("skills", applyForm.skills);
    formData.append("linkedinUrl", applyForm.linkedinUrl);
    formData.append("githubUrl", applyForm.githubUrl);
    formData.append("portfolioUrl", applyForm.portfolioUrl);
    formData.append("additionalInfo", applyForm.additionalInfo);
    if (resumeFile) {
      formData.append("resume", resumeFile);
    }

    try {
      await API.post(
        `/drives/apply/${selectedDrive._id}`,
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

  return (
    <div className="dashboard-container student-dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Student Dashboard</h2>
          <p className="dashboard-subtitle">
            View active placement drives, apply, and track your status.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            className="btn-primary"
            onClick={() => navigate("/student/resume-analyzer")}
          >
            Resume Analyzer
          </button>
          <button className="btn-danger" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <h3 style={{ marginTop: "26px" }}>Available Drives</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="dashboard-cards">
          {drives.map((drive) => {
            const isApplied = appliedDrives.includes(drive._id);
            return (
              <div key={drive._id} className="card">
                <h3>{drive.company}</h3>
                <p><b>Role:</b> {drive.role}</p>
                <p><b>Package:</b> {drive.package}</p>
                <p><b>Location:</b> {drive.location}</p>
                {drive.eligibilityCriteria && (
                  <p>
                    <b>Eligibility:</b> {drive.eligibilityCriteria}
                  </p>
                )}
                {drive.jobDescription && (
                  <p>
                    <b>Job:</b> {drive.jobDescription}
                  </p>
                )}
                {drive.rounds && (
                  <p>
                    <b>Rounds:</b> {drive.rounds}
                  </p>
                )}
                {drive.additionalNotes && (
                  <p>
                    <b>Notes:</b> {drive.additionalNotes}
                  </p>
                )}

                <button
                  className={isApplied ? "btn-disabled" : "btn-primary"}
                  disabled={isApplied}
                  onClick={() => openApplyForm(drive)}
                >
                  {isApplied ? "Applied ✅" : "Apply Now"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <h3 style={{ marginTop: "40px" }}>My Recent Applications</h3>
      <table className="dashboard-table">
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
          {myApplications.length ? (
            myApplications.slice(0, 8).map((app) => (
              <tr key={app._id}>
                <td>{app.drive?.company || "—"}</td>
                <td>{app.drive?.role || "—"}</td>
                <td>{app.drive?.package ? `${app.drive.package} LPA` : "—"}</td>
                <td style={{ fontWeight: 700 }}>
                  {(app.status || "applied").toUpperCase()}
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

            <form className="apply-form" onSubmit={submitApplication}>
              <input
                type="text"
                placeholder="Full Name"
                value={applyForm.fullName}
                onChange={(e) =>
                  setApplyForm({ ...applyForm, fullName: e.target.value })
                }
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={applyForm.email}
                onChange={(e) =>
                  setApplyForm({ ...applyForm, email: e.target.value })
                }
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={applyForm.phone}
                onChange={(e) =>
                  setApplyForm({ ...applyForm, phone: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Branch / Department"
                value={applyForm.branch}
                onChange={(e) =>
                  setApplyForm({ ...applyForm, branch: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="CGPA / Percentage"
                value={applyForm.cgpa}
                onChange={(e) =>
                  setApplyForm({ ...applyForm, cgpa: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Year of Passing (e.g. 2026)"
                value={applyForm.yearOfPassing}
                onChange={(e) =>
                  setApplyForm({ ...applyForm, yearOfPassing: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Key Skills (comma separated)"
                value={applyForm.skills}
                onChange={(e) =>
                  setApplyForm({ ...applyForm, skills: e.target.value })
                }
              />
              <input
                type="url"
                placeholder="LinkedIn Profile URL"
                value={applyForm.linkedinUrl}
                onChange={(e) =>
                  setApplyForm({ ...applyForm, linkedinUrl: e.target.value })
                }
              />
              <input
                type="url"
                placeholder="GitHub Profile URL"
                value={applyForm.githubUrl}
                onChange={(e) =>
                  setApplyForm({ ...applyForm, githubUrl: e.target.value })
                }
              />
              <input
                type="url"
                placeholder="Portfolio / Resume Website (optional)"
                value={applyForm.portfolioUrl}
                onChange={(e) =>
                  setApplyForm({ ...applyForm, portfolioUrl: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Any additional info (projects, notice period, etc.)"
                value={applyForm.additionalInfo}
                onChange={(e) =>
                  setApplyForm({ ...applyForm, additionalInfo: e.target.value })
                }
              />

              <div className="file-input">
                <label htmlFor="resume">Upload Resume (PDF, max 5MB)</label>
                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setResumeFile(file);
                  }}
                />
              </div>

              <div className="apply-modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeApplyForm}
                  disabled={applyLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={applyLoading ? "btn-primary loading" : "btn-primary"}
                  disabled={applyLoading}
                >
                  {applyLoading ? "Submitting..." : "Submit Application"}
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

