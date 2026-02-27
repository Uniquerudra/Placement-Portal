import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import "../css/Auth.css";

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPass, setShowPass] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }

        setLoading(true);
        setError("");

        try {
            await API.post(`/auth/reset-password/${token}`, { password });
            alert("Password reset successful! You can now login with your new password.");
            navigate("/login");
        } catch (err) {
            setError(err?.response?.data?.message || "Invalid or expired token.");
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <form className="auth-box" onSubmit={handleSubmit}>
                <h2>Reset Password</h2>
                <p className="auth-subtitle">Enter your new password below.</p>

                {error && <div className="auth-error">{error}</div>}

                <div className="auth-password">
                    <input
                        type={showPass ? "text" : "password"}
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <span className="auth-password-toggle" onClick={() => setShowPass(!showPass)}>
                        {showPass ? "Hide" : "Show"}
                    </span>
                </div>

                <input
                    type={showPass ? "text" : "password"}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
            </form>
        </div>
    );
}

export default ResetPassword;
