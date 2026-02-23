import { useEffect, useState } from "react";
import API from "../../api";

function MyApplications() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await API.get("/applications/my");
      setApplications(res.data);
    } catch (err) {
      alert("Error fetching applications");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>My Applications</h2>

      {applications.length === 0 ? (
        <p>No applications yet.</p>
      ) : (
        applications.map((app) => (
          <div
            key={app._id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "8px",
            }}
          >
            <h3>{app.drive.companyName}</h3>
            <p><strong>Role:</strong> {app.drive.role}</p>
            <p><strong>Package:</strong> {app.drive.package} LPA</p>

            <p>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color:
                    app.status === "selected"
                      ? "green"
                      : app.status === "rejected"
                      ? "red"
                      : app.status === "shortlisted"
                      ? "orange"
                      : "blue",
                  fontWeight: "bold",
                }}
              >
                {app.status.toUpperCase()}
              </span>
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default MyApplications;
