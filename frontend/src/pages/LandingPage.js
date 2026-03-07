// frontend/src/pages/LandingPage.js
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../css/LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="landing">
      {/* NAVBAR */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-logo" onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="/logo.png" alt="TPO Portal" className="logo-icon-img" />
          <h2>TPO Portal</h2>
        </div>

        <div className="navbar-links">
          <span onClick={() => scrollToSection("hero")}>Home</span>
          <span onClick={() => scrollToSection("stats")}>Stats</span>
          <span onClick={() => scrollToSection("recruiters")}>Recruiters</span>
          <span onClick={() => scrollToSection("notices")}>Notices</span>
        </div>

        <div className="navbar-actions">
          <button className="login-btn" onClick={() => navigate("/login")}>Login</button>
          <button className="register-btn" onClick={() => navigate("/register")}>Register</button>
        </div>
      </nav>

      {/* HERO - Dark Theme with Glowing Effect */}
      <section className="hero-dark" id="hero">
        <div className="glow-ring"></div>
        <div className="glow-ring glow-ring-2"></div>

        <div className="hero-content">
          <h1 className="hero-title">
            Campus Recruitment<br />
            <span className="gradient-text">& Training Platform</span>
          </h1>
          <p className="hero-subtitle">
            Connect top talent with industry leaders. Streamline placements with
            intelligent automation and real-time analytics.
          </p>

          <div className="hero-cta">
            <button className="btn-glow" onClick={() => navigate("/login")}>
              Get Started <span>→</span>
            </button>
            <button className="btn-outline-light" onClick={() => scrollToSection("stats")}>
              View Analytics
            </button>
          </div>

          <div className="hero-stats-row">
            <div className="hero-stat-item">
              <span className="stat-number">250+</span>
              <span className="stat-label">Companies</span>
            </div>
            <div className="hero-stat-item">
              <span className="stat-number">1200+</span>
              <span className="stat-label">Placements</span>
            </div>
            <div className="hero-stat-item">
              <span className="stat-number">45L</span>
              <span className="stat-label">Highest Package</span>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="feature-cards">
          <div className="feature-card" onClick={() => navigate("/login?role=student")}>
            <div className="feature-icon">👤</div>
            <h3>Student Portal</h3>
            <p>Apply to drives, track applications, and analyze your resume</p>
            <span className="feature-link">Login as Student →</span>
          </div>
          <div className="feature-card" onClick={() => navigate("/login?role=tpo")}>
            <div className="feature-icon">📊</div>
            <h3>TPO Dashboard</h3>
            <p>Manage drives, review applications, and generate reports</p>
            <span className="feature-link">Login as TPO →</span>
          </div>
          <div className="feature-card" onClick={() => navigate("/student/resume-analyzer")}>
            <div className="feature-icon">🤖</div>
            <h3>AI Resume Analyzer</h3>
            <p>Get ATS scores and keyword matching for better results</p>
            <span className="feature-link">Try Analyzer →</span>
          </div>
          <div className="feature-card" onClick={() => navigate("/login?role=admin")}>
            <div className="feature-icon">⚙️</div>
            <h3>Admin Panel</h3>
            <p>Manage users, view analytics, and control system settings</p>
            <span className="feature-link">Login as Admin →</span>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats" id="stats">
        <div className="section-header">
          <h2>Our Statistics</h2>
          <p>Numbers that define our excellence in training and placements.</p>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🏢</div>
            <h2>250+</h2>
            <p>Companies visited</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎓</div>
            <h2>1200+</h2>
            <p>Students Placed</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <h2>45 LPA</h2>
            <p>Highest Package</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <h2>12 LPA</h2>
            <p>Average Package</p>
          </div>
        </div>
      </section>

      {/* RECRUITERS */}
      <section className="recruiters" id="recruiters">
        <div className="section-header">
          <h2>Top Globals Recruiters</h2>
          <p>Our student are working in the world's most prestigious organizations.</p>
        </div>
        <div className="recruiter-logos">
          <div className="logo-wrapper"><img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" /></div>
          <div className="logo-wrapper"><img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" /></div>
          <div className="logo-wrapper amazon-logo"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" /></div>
          <div className="logo-wrapper"><img src="https://upload.wikimedia.org/wikipedia/commons/6/6e/Adobe_Corporate_logo.svg" alt="Adobe" /></div>
          <div className="logo-wrapper myntra-logo"><img src="https://cdn.freelogovectors.net/wp-content/uploads/2021/02/myntra-logo-freelogovectors.net_.png" alt="Myntra" /></div>
          <div className="logo-wrapper"><img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" /></div>
        </div>
      </section>

      {/* NOTICES */}
      <section className="notices" id="notices">
        <div className="section-header">
          <h2>Latest Placement Notices</h2>
          <p>Stay updated with the latest drives and workshops.</p>
        </div>
        <div className="notices-list">
          <div className="notice-item">
            <div className="notice-icon">🚀</div>
            <div className="notice-content">
              <h3>TCS Ninja Drive 2026</h3>
              <p>Registration ends on 15 Feb. Eligible batches: 2026 CS/IT.</p>
            </div>
          </div>
          <div className="notice-item">
            <div className="notice-icon">🔥</div>
            <div className="notice-content">
              <h3>Infosys Specialist Hiring</h3>
              <p>Apply for the Specialist Programmer role. Multiple openings.</p>
            </div>
          </div>
          <div className="notice-item">
            <div className="notice-icon">🎯</div>
            <div className="notice-content">
              <h3>Resume & Interview Workshop</h3>
              <p>Join us on 18 Feb for a session by industry experts.</p>
            </div>
          </div>
          <div className="notice-item">
            <div className="notice-icon">💼</div>
            <div className="notice-content">
              <h3>Amazon Internship 2026</h3>
              <p>SDE Internship opportunities now open. Apply through portal.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <div className="footer-logo-brand" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <img src="/logo.png" alt="TPO Portal" className="logo-icon-img footer-logo-img" />
              <h3>TPO Portal</h3>
            </div>
            <p>Empowering the next generation of professionals.</p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <span onClick={() => scrollToSection("hero")}>Home</span>
            <span onClick={() => scrollToSection("stats")}>Statistics</span>
            <span onClick={() => scrollToSection("notices")}>Notices</span>
            <span onClick={() => navigate("/forgot-password")}>Forgot Password</span>
          </div>
          <div className="footer-contact">
            <h4>Contact Us</h4>
            <p>Email: tpo@akgec.ac.in</p>
            <p>Phone: +91 1234567890</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 TPO Portal for AKGEC College | Designed for Placement Excellence By Rudra Pal</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
