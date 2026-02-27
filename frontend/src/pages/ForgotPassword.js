import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "../css/Auth.css";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await API.post("/auth/forgot-password", { email });
            setMessage(res.data.message || "Reset link sent to your email!");
        } catch (err) {
            setError(err?.response?.data?.message || "Something went wrong. Please try again.");
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <form className="auth-box" onSubmit={handleSubmit}>
                <h2>Forgot Password</h2>
                <p className="auth-subtitle">Enter your email and we'll send you a link to reset your password.</p>

                {error && <div className="auth-error">{error}</div>}
                {message && <div className="auth-success" style={{ color: '#10b981', background: '#ecfdf5', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center' }}>{message}</div>}

                <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <p className="auth-footer">
                    Remembered your password? <span onClick={() => navigate("/login")}>Login</span>
                </p>
            </form>
        </div>
    );
}

export default ForgotPassword;
