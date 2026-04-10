import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import "../../css/StudentDashboardDark.css";

const Profile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        branch: "",
        cgpa: "",
        tenthPercentage: "",
        twelfthPercentage: "",
        yearOfPassing: "",
        skills: "",
        githubUrl: "",
        linkedinUrl: "",
        portfolioUrl: "",
        resumeUrl: "",
    });
    const [resumeFile, setResumeFile] = useState(null);

    const token = localStorage.getItem("token");

    const fetchProfile = useCallback(async () => {
        try {
            const res = await API.get("/student/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = res.data;
            setProfile({
                name: data.name || "",
                email: data.email || "",
                phone: data.phone || "",
                branch: data.branch || "",
                cgpa: data.cgpa || "",
                tenthPercentage: data.tenthPercentage || "",
                twelfthPercentage: data.twelfthPercentage || "",
                yearOfPassing: data.yearOfPassing || "",
                skills: data.skills ? data.skills.join(", ") : "",
                githubUrl: data.githubUrl || "",
                linkedinUrl: data.linkedinUrl || "",
                portfolioUrl: data.portfolioUrl || "",
                resumeUrl: data.resumeUrl || "",
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });

        try {
            // Update profile details
            await API.put(
                "/student/profile",
                {
                    ...profile,
                    skills: profile.skills.split(",").map((s) => s.trim()).filter(Boolean),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update resume if file selected
            if (resumeFile) {
                const formData = new FormData();
                formData.append("resume", resumeFile);
                await API.post("/student/profile/resume", formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
            }

            setMessage({ type: "success", text: "Profile updated successfully!" });
            fetchProfile();
        } catch (err) {
            console.error("Error updating profile:", err);
            setMessage({ type: "error", text: "Failed to update profile." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading-text">Loading profile...</div>;

    return (
        <div className="dashboard-container student-dashboard">
            <div className="dashboard-header">
                <div className="header-left">
                    <div className="profile-header-top" style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "15px", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <img src="/bbbbb.png" alt="Logo" className="logo-icon-img" onClick={() => navigate("/")} />
                            <h2 style={{ fontSize: "1.5rem", margin: 0, fontWeight: "700" }}>TPO Portal</h2>
                        </div>
                        <button className="btn-back" onClick={() => navigate("/student")}>
                            ← Back to Dashboard
                        </button>
                    </div>
                    <h2 style={{ fontSize: "2rem", color: "#111827", marginTop: "10px" }}>My Profile</h2>
                    <p className="dashboard-subtitle">
                        Keep your academic and personal details up to date for automatic applications.
                    </p>
                </div>
            </div>

            <div className="profile-content-card">
                {message.text && (
                    <div className={`message-banner ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <form className="profile-form" onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h3>Personal & Contact Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" value={profile.name} disabled className="disabled-input" />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" value={profile.email} disabled className="disabled-input" />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profile.phone || ""}
                                    onChange={handleInputChange}
                                    placeholder="Enter your phone number"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Academic Details</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Branch / Department</label>
                                <select name="branch" value={profile.branch || ""} onChange={handleInputChange} required>
                                    <option value="">Select Branch</option>
                                    <option value="CSE">CSE</option>
                                    <option value="CSE-AI">CSE-AI</option>
                                    <option value="CSE-DS">CSE-DS</option>
                                    <option value="IT">IT</option>
                                    <option value="ECE">ECE</option>
                                    <option value="EN">EN</option>
                                    <option value="ME">ME</option>
                                    <option value="CE">CE</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Current CGPA</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="cgpa"
                                    value={profile.cgpa || ""}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 8.5"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Year of Passing</label>
                                <input
                                    type="text"
                                    name="yearOfPassing"
                                    value={profile.yearOfPassing || ""}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 2026"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>10th Percentage</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="tenthPercentage"
                                    value={profile.tenthPercentage || ""}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 92.5"
                                />
                            </div>
                            <div className="form-group">
                                <label>12th Percentage</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="twelfthPercentage"
                                    value={profile.twelfthPercentage || ""}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 90.0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Professional Links & Skills</h3>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Skills (Comma separated)</label>
                                <input
                                    type="text"
                                    name="skills"
                                    value={profile.skills || ""}
                                    onChange={handleInputChange}
                                    placeholder="Java, React, Node.js, Python..."
                                />
                            </div>
                            <div className="form-group">
                                <label>LinkedIn URL</label>
                                <input
                                    type="url"
                                    name="linkedinUrl"
                                    value={profile.linkedinUrl || ""}
                                    onChange={handleInputChange}
                                    placeholder="https://linkedin.com/in/yourprofile"
                                />
                            </div>
                            <div className="form-group">
                                <label>GitHub URL</label>
                                <input
                                    type="url"
                                    name="githubUrl"
                                    value={profile.githubUrl || ""}
                                    onChange={handleInputChange}
                                    placeholder="https://github.com/yourusername"
                                />
                            </div>
                            <div className="form-group">
                                <label>Portfolio URL</label>
                                <input
                                    type="url"
                                    name="portfolioUrl"
                                    value={profile.portfolioUrl || ""}
                                    onChange={handleInputChange}
                                    placeholder="https://yourportfolio.com"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Resume</h3>
                        <div className="resume-section">
                            {profile.resumeUrl && (
                                <div className="current-resume">
                                    <p>Current Resume: <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">View Resume</a></p>
                                </div>
                            )}
                            <div className="form-group">
                                <label>{profile.resumeUrl ? "Update Resume (PDF)" : "Upload Resume (PDF)"}</label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setResumeFile(e.target.files[0])}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-save-profile" disabled={saving}>
                            {saving ? "Saving Changes..." : "Save Profile"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
