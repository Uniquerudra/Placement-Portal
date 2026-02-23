// src/pages/tpo/AddDrive.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import "../../css/Dashboard.css";

const AddDrive = () => {
  const navigate = useNavigate();

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [packageSalary, setPackageSalary] = useState("");
  const [location, setLocation] = useState("");
  const [deadline, setDeadline] = useState("");
  const [eligibilityCriteria, setEligibilityCriteria] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [rounds, setRounds] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await API.post(
        "/drives",
        {
          company,
          role,
          package: packageSalary, // match backend schema
          location,
          deadline,
          eligibilityCriteria,
          jobDescription,
          rounds,
          contactEmail,
          additionalNotes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Drive Created Successfully ✅");
      navigate("/tpo"); // redirect to TPO dashboard
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(
        err.response?.data?.message || "Error creating drive ❌"
      );
    }

    setLoading(false);
  };

  return (
    <div className="dashboard-container dashboard-center">
      <div className="dashboard-form-card">
        <h2>Create New Drive 🚀</h2>
        <form className="dashboard-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Company Name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Package (e.g. 12 LPA)"
            value={packageSalary}
            onChange={(e) => setPackageSalary(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />

          <input
            type="date"
            placeholder="Application Deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Eligibility (branches, CGPA, backlogs, etc.)"
            value={eligibilityCriteria}
            onChange={(e) => setEligibilityCriteria(e.target.value)}
          />
          <input
            type="text"
            placeholder="Job Description (short summary)"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <input
            type="text"
            placeholder="Selection Rounds (e.g. Online test, GD, PI)"
            value={rounds}
            onChange={(e) => setRounds(e.target.value)}
          />
          <input
            type="email"
            placeholder="TPO / Company Contact Email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
          <input
            type="text"
            placeholder="Additional Notes (reporting time, documents, etc.)"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
          />

          <button
            type="submit"
            className={loading ? "btn-disabled" : "btn-primary"}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Drive"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDrive;
