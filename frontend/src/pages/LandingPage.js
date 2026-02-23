// frontend/src/pages/LandingPage.js
import { useNavigate } from "react-router-dom";
import "../css/LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">

      {/* NAVBAR */}
      <nav className="navbar">
        <h2>Training and Placement Portal</h2>
        <button onClick={() => navigate("/login")}>Login</button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-text">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Training & Placement Cell
          </div>
          <h1>Launch your career with the TPO Portal</h1>
          <p>
            A single, smart platform that keeps students, TPO, and recruiters
            perfectly in sync for every placement drive.
          </p>

          <div className="hero-actions">
            <button className="glow-btn" onClick={() => navigate("/login")}>
              Get Started
            </button>
            <div className="hero-secondary">
              <span>For Students, TPO & Recruiters</span>
              <span>• Real‑time updates • Seamless applications</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card">
            <div className="hero-card-header">
              <div className="hero-card-title">Current Season Snapshot</div>
              <span className="hero-chip">Live drives</span>
            </div>

            <div className="hero-card-metrics">
              <div>
                <div className="hero-metric-label">Active Companies</div>
                <div className="hero-metric-value">28</div>
                <div className="hero-metric-sub">+6 this week</div>
              </div>
              <div>
                <div className="hero-metric-label">Students Placed</div>
                <div className="hero-metric-value">842</div>
                <div className="hero-metric-sub">92% CS batch</div>
              </div>
            </div>
          </div>
          <div className="hero-pulse" />
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div className="stat-card">
          <h2>250+</h2>
          <p>Companies</p>
        </div>
        <div className="stat-card">
          <h2>1200+</h2>
          <p>Students Placed</p>
        </div>
        <div className="stat-card">
          <h2>45 LPA</h2>
          <p>Highest Package</p>
        </div>
        <div className="stat-card">
          <h2>12 LPA</h2>
          <p>Average Package</p>
        </div>
      </section>

      {/* RECRUITERS */}
      <section className="recruiters">
        <h2>Top Recruiters</h2>
        <div className="recruiter-logos">
          <img src="https://cdn4.iconfinder.com/data/icons/logos-brands-7/512/google_logo-google_icongoogle-1024.png" alt="Google" />
          <img src="https://s3-alpha.figma.com/hub/file/2747494711/31b6ad5c-b404-4086-a685-89b1d5294f1c-cover.png" alt="Microsoft" />
          <img src="https://tse2.mm.bing.net/th/id/OIP.YdkQGmhB9c2Sr84FeDD9egHaEK?cb=defcache2&defcache=1&rs=1&pid=ImgDetMain&o=7&rm=3" alt="Amazon" />
          <img src="https://tse4.mm.bing.net/th/id/OIP.MPHAVL52hadir7pe0HszoAHaEK?cb=defcache2&defcache=1&rs=1&pid=ImgDetMain&o=7&rm=3" alt="Adobe" />
          <img src="https://tse2.mm.bing.net/th/id/OIP.idB_-eo5pNgOG8Ker3jEpgHaEK?cb=defcache2&defcache=1&rs=1&pid=ImgDetMain&o=7&rm=3" alt="Flipkart" />
          <img src="https://tse1.mm.bing.net/th/id/OIP.4Czaum8sTdcx4p5gytXDMQHaEK?cb=defcache2&defcache=1&rs=1&pid=ImgDetMain&o=7&rm=3" alt="Paytm" />
          <img src="https://tse3.mm.bing.net/th/id/OIP.66Pcv6DGbh5yA-Gdtz6ruAHaD4?cb=defcache2&defcache=1&rs=1&pid=ImgDetMain&o=7&rm=3" alt="Newgen" />
        </div>
      </section>

      {/* NOTICES */}
      <section className="notices">
        <h2>Latest Notices</h2>
        <ul>
          <li>🚀 TCS Ninja Drive – 15 Feb</li>
          <li>🔥 Infosys Hiring – Apply Now</li>
          <li>🎯 Resume Workshop – 18 Feb</li>
          <li>💼 Amazon Internship Open</li>
        </ul>
      </section>

      <footer>
        <p>© 2026 TPO Portal for AKGEC College | Designed for Placement Excellence By Rudra Pal</p>
      </footer>

    </div>
  );
};

export default LandingPage;
