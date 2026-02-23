import { useEffect, useState } from "react";
import API from "../../api";

function ManageApplications() {
  const [applications, setApplications] = useState([]);
  const [company, setCompany] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [stats, setStats] = useState({});
  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  const fetchApplications = async () => {
    const res = await API.get("/applications/all", {
      params: { company, search, status, sort: "cgpa" }
    });
    setApplications(res.data);
  };

  const fetchStats = async () => {
    const res = await API.get("/applications/stats");
    setStats(res.data);
  };

  const updateStatus = async (id, status) => {
    await API.put(`/applications/${id}`, { status });
    fetchApplications();
    fetchStats();
  };

  // CSV Export
  const exportCSV = () => {
    const selected = applications.filter(app => app.status === "selected");

    const csvRows = [
      ["Name", "Email", "Company", "Role", "CGPA"]
    ];

    selected.forEach(app => {
      csvRows.push([
        app.student.name,
        app.student.email,
        app.drive.companyName,
        app.drive.role,
        app.student.cgpa
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8,"
      + csvRows.map(e => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "selected_students.csv";
    link.click();
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Admin Dashboard</h2>

      {/* Dashboard Stats */}
      <div style={{ marginBottom: "20px" }}>
        <p>Total Applications: {stats.totalApplications}</p>
        <p>Total Selected: {stats.totalSelected}</p>
        <p>Total Shortlisted: {stats.totalShortlisted}</p>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Search Student"
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          placeholder="Filter by Company"
          onChange={(e) => setCompany(e.target.value)}
        />

        <select onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="applied">Applied</option>
        </select>

        <button onClick={fetchApplications}>Apply Filters</button>
        <button onClick={exportCSV}>Export Selected CSV</button>
      </div>

      {/* Applications List */}
      {applications.map((app) => (
        <div
          key={app._id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "8px"
          }}
        >
          <h3>{app.drive.companyName}</h3>
          <p><strong>Name:</strong> {app.student.name}</p>
          <p><strong>Email:</strong> {app.student.email}</p>
          <p><strong>CGPA:</strong> {app.student.cgpa}</p>
          <p><strong>Status:</strong> {app.status}</p>

          <select onChange={(e) => updateStatus(app._id, e.target.value)}>
            <option value="">Update Status</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      ))}
    </div>
  );
}

export default ManageApplications;
