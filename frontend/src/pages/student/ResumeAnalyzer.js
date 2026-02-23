import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import "../../css/Dashboard.css";
import "../../css/ResumeAnalyzer.css";

function ScoreBar({ label, value, max }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="ra-bar">
      <div className="ra-bar-top">
        <span>{label}</span>
        <strong>
          {value}/{max}
        </strong>
      </div>
      <div className="ra-bar-track" aria-hidden="true">
        <div className="ra-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ResumeAnalyzer() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const scoreColor = useMemo(() => {
    const s = result?.atsScore ?? 0;
    if (s >= 80) return "#16a34a";
    if (s >= 60) return "#f59e0b";
    return "#dc2626";
  }, [result]);

  const analyze = async () => {
    setError("");
    setResult(null);

    if (!resumeFile) {
      setError("Please upload a resume (PDF or DOCX).");
      return;
    }

    try {
      setLoading(true);
      const form = new FormData();
      form.append("resume", resumeFile);
      form.append("jobDescription", jobDescription);

      const res = await API.post("/drives/resume/analyze", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setResult(res.data);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to analyze resume";
      setError(msg);
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="dashboard-container student-dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Resume Analyzer</h2>
          <p className="dashboard-subtitle">
            Upload your resume and get an ATS score, keyword match, and quick fixes.
          </p>
        </div>
        <div className="ra-header-actions">
          <button className="btn-secondary" onClick={() => navigate("/student")}>
            Back
          </button>
          <button className="btn-danger" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className="ra-grid">
        <div className="ra-panel">
          <h3>Upload Resume</h3>
          {error ? (
            <div className="auth-error" role="alert" aria-live="polite">
              {error}
            </div>
          ) : null}

          <div className="ra-field">
            <label className="ra-label">Resume file (PDF/DOCX)</label>
            <input
              className="ra-file"
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            />
            {resumeFile ? (
              <div className="ra-file-meta">
                <strong>{resumeFile.name}</strong>
                <span>{Math.round(resumeFile.size / 1024)} KB</span>
              </div>
            ) : null}
          </div>

          <div className="ra-field">
            <label className="ra-label">Job Description (optional, paste here)</label>
            <textarea
              className="ra-textarea"
              rows={8}
              placeholder="Paste the job description to check keyword match..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <button className="btn-primary ra-analyze" onClick={analyze} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </div>

        <div className="ra-panel">
          <h3>Results</h3>

          {!result ? (
            <div className="ra-empty">
              Upload a resume and click <strong>Analyze Resume</strong> to see your ATS score.
            </div>
          ) : (
            <>
              <div className="ra-score-card">
                <div className="ra-score">
                  <div className="ra-score-number" style={{ color: scoreColor }}>
                    {result.atsScore}
                  </div>
                  <div className="ra-score-sub">ATS Score (0-100)</div>
                </div>
                <div className="ra-score-meta">
                  <div>
                    <span>Words</span>
                    <strong>{result.extracted?.wordCount ?? "—"}</strong>
                  </div>
                  <div>
                    <span>Avg words/sentence</span>
                    <strong>{result.extracted?.avgWordsPerSentence ?? "—"}</strong>
                  </div>
                  <div>
                    <span>Pages</span>
                    <strong>{result.file?.pages ?? "—"}</strong>
                  </div>
                </div>
              </div>

              <div className="ra-breakdown">
                <ScoreBar label="Sections" value={result.breakdown?.sections ?? 0} max={30} />
                <ScoreBar label="Keywords" value={result.breakdown?.keywords ?? 0} max={30} />
                <ScoreBar label="Contact" value={result.breakdown?.contact ?? 0} max={10} />
                <ScoreBar label="Length" value={result.breakdown?.length ?? 0} max={10} />
                <ScoreBar
                  label="Readability"
                  value={result.breakdown?.readability ?? 0}
                  max={10}
                />
              </div>

              {result.keywordMatch?.keywords?.length ? (
                <div className="ra-block">
                  <h4>Keyword match</h4>
                  <p className="ra-muted">
                    Match ratio: <strong>{Math.round((result.keywordMatch.matchRatio || 0) * 100)}%</strong>
                  </p>
                  <div className="ra-chips">
                    {(result.keywordMatch.matched || []).slice(0, 16).map((k) => (
                      <span key={k} className="ra-chip ok">
                        {k}
                      </span>
                    ))}
                    {(result.keywordMatch.missing || []).slice(0, 16).map((k) => (
                      <span key={k} className="ra-chip miss">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="ra-block">
                  <h4>Keyword match</h4>
                  <p className="ra-muted">
                    Paste a job description to get keyword matching and missing keywords.
                  </p>
                </div>
              )}

              <div className="ra-block">
                <h4>Suggestions</h4>
                {result.insights?.length ? (
                  <ul className="ra-list">
                    {result.insights.map((it, idx) => (
                      <li key={`${it.title}-${idx}`} className={it.type === "warning" ? "warn" : "tip"}>
                        <strong>{it.title}</strong>
                        <span>{it.message}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="ra-muted">Looks good. Minor improvements can still help.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

