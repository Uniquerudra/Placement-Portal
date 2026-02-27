// frontend/src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import TPODashboard from "./pages/tpo/TPODashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ResumeAnalyzer from "./pages/student/ResumeAnalyzer";
import ProtectedRoute from "./components/ProtectedRoute";
import AddDrive from "./pages/tpo/AddDrive";

// Google OAuth Client ID - Replace with your actual client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "270933402517-i0hvrvgfvtn0sh2rk3d24p6066hbu1qc.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tpo"
            element={
              <ProtectedRoute role="tpo">
                <TPODashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tpo/add-drive"
            element={
              <ProtectedRoute role="tpo">
                <AddDrive />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/resume-analyzer"
            element={
              <ProtectedRoute role="student">
                <ResumeAnalyzer />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
