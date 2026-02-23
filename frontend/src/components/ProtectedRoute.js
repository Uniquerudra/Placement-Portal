import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const userRole = localStorage.getItem("role");
  if (!localStorage.getItem("token")) return <Navigate to="/login" />;
  if (role && role !== userRole) return <Navigate to="/login" />;
  return <>{children}</>;
}

export default ProtectedRoute;
