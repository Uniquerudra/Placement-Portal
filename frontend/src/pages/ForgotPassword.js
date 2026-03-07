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
            const serverMsg = err?.response?.data?.message;
            const serverErr = err?.response?.data?.error;
            setError(serverErr ? `${serverMsg}: ${serverErr}` : (serverMsg || "Something went wrong. Please try again."));
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <form className="auth-box" onSubmit={handleSubmit}>
                <div className="auth-logo" onClick={() => navigate("/")} style={{ cursor: "pointer", display: "flex", justifyContent: "center", marginBottom: "40px" }}>
                    <img src="/logo.png" alt="TPO Portal" className="logo-icon-img auth-standalone-logo" />
                </div>

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
