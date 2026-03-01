// src/pages/tpo/AddDrive.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import "../../css/AddDrive.css";

const AddDrive = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    package: "",
    location: "",
    deadline: "",
    eligibilityCriteria: "",
    jobDescription: "",
    rounds: "",
    contactEmail: "",
    additionalNotes: "",
  });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await API.post("/drives", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Drive Created Successfully ✅");
      navigate("/tpo");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || "Error creating drive ❌");
    }

    setLoading(false);
  };

  const formFields = [
    { name: "company", label: "Company Name", type: "text", icon: "🏢", required: true },
    { name: "role", label: "Job Role", type: "text", icon: "💼", required: true },
    { name: "package", label: "Package (e.g. 12 LPA)", type: "text", icon: "💰", required: true },
    { name: "location", label: "Location", type: "text", icon: "📍", required: true },
    { name: "deadline", label: "Application Deadline", type: "date", icon: "📅", required: true },
    { name: "eligibilityCriteria", label: "Eligibility Criteria", type: "text", icon: "🎓" },
    { name: "jobDescription", label: "Job Description", type: "textarea", icon: "📝", rows: 3 },
    { name: "rounds", label: "Selection Rounds", type: "text", icon: "🎯" },
    { name: "contactEmail", label: "Contact Email", type: "email", icon: "📧" },
    { name: "additionalNotes", label: "Additional Notes", type: "textarea", icon: "📌", rows: 2 },
  ];

  return (
    <div className="add-drive-container">
      <div className="add-drive-card">
        <div className="add-drive-header">
          <div className="add-drive-icon">🚀</div>
          <h2>Create New Drive</h2>
          <p>Fill in the details to create a new placement drive</p>
        </div>

        <form className="add-drive-form" onSubmit={handleSubmit}>
          <div className="add-drive-grid">
            {formFields.map((field, index) => (
              <div
                key={field.name}
                className={`add-drive-field ${field.type === "textarea" ? "full-width" : ""} ${
                  focusedField === field.name ? "focused" : ""
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <label className="add-drive-label">
                  <span className="add-drive-label-icon">{field.icon}</span>
                  {field.label}
                  {field.required && <span className="required">*</span>}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    onFocus={() => setFocusedField(field.name)}
                    onBlur={() => setFocusedField(null)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    rows={field.rows}
                    required={field.required}
                    className="add-drive-textarea"
                  />
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    onFocus={() => setFocusedField(field.name)}
                    onBlur={() => setFocusedField(null)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    required={field.required}
                    className="add-drive-input"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="add-drive-actions">
            <button
              type="button"
              className="add-drive-btn-secondary"
              onClick={() => navigate("/tpo")}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`add-drive-btn-primary ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Create Drive
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDrive;
