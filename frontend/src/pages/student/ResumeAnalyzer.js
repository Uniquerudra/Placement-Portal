import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import "../../css/ResumeAnalyzerModern.css";

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

  // Chat State
  const [question, setQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const analyze = async () => {
    setError("");
    setResult(null);
    setMessages([]);

    if (!resumeFile) {
      setError("Please upload a resume (PDF or DOCX).");
      return;
    }

    try {
      setLoading(true);
      const form = new FormData();
      form.append("resume", resumeFile);
      form.append("jobDescription", jobDescription);

      const res = await API.post("/student/resume/analyze", form, {
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

  const askAi = async () => {
    if (!question.trim()) return;
    const q = question;
    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", text: q }]);

    try {
      setChatLoading(true);
      const res = await API.post("/student/resume/ask", {
        question: q,
        resumeText: result?.resumeText || "", // We might need the backend to return resumeText
        jobDescription: jobDescription
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages((prev) => [...prev, { role: "ai", text: res.data.answer }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "ai", text: "Error: Failed to reach AI." }]);
    }
    setChatLoading(false);
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="dashboard-container student-dashboard">
      <div className="dashboard-header">
        <div>
          <h2>AI Resume Intelligence</h2>
          <p className="dashboard-subtitle">
            Get premium ATS scoring and personalized interview coaching powered by Gemini.
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

      <div className={`ra-grid ${result ? "has-result" : ""}`}>
        <div className="ra-panel">
          <h3 style={{ color: "#111827" }}>Configure Analysis</h3>
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
                <strong style={{ color: "#111827" }}>{resumeFile.name}</strong>
                <span>{Math.round(resumeFile.size / 1024)} KB</span>
              </div>
            ) : null}
          </div>

          <div className="ra-field">
            <label className="ra-label">Target Job Description (Optional)</label>
            <textarea
              className="ra-textarea"
              rows={10}
              placeholder="Paste the job description to get role-specific interview prep..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <button className="btn-primary ra-analyze" onClick={analyze} disabled={loading}>
            {loading ? "Processing with AI..." : "Start Deep Analysis"}
          </button>
        </div>

        <div className="ra-panel">
          <h3 style={{ color: "#111827" }}>Intelligence Report</h3>

          {!result ? (
            <div className="ra-empty">
              Configure your details and click <strong>Start Deep Analysis</strong> to begin.
            </div>
          ) : (
            <>
              <div className="ra-score-card">
                <div className="ra-score">
                  <div className="ra-score-number" style={{ color: scoreColor }}>
                    {result.atsScore}
                  </div>
                  <div className="ra-score-sub" style={{ color: "#374151" }}>ATS Compatibility Score</div>
                </div>
                <div className="ra-score-meta">
                  <div>
                    <span>Word Count</span>
                    <strong style={{ color: "#111827" }}>{result.extracted?.wordCount ?? "—"}</strong>
                  </div>
                  <div>
                    <span>Readability</span>
                    <strong style={{ color: "#111827" }}>{result.extracted?.avgWordsPerSentence ?? "—"}</strong>
                  </div>
                  <div>
                    <span>Total Pages</span>
                    <strong style={{ color: "#111827" }}>{result.file?.pages ?? "—"}</strong>
                  </div>
                </div>
              </div>

              <div className="ra-breakdown">
                <ScoreBar label="Structure" value={result.breakdown?.sections ?? 0} max={30} />
                <ScoreBar label="Keywords" value={result.breakdown?.keywords ?? 0} max={30} />
                <ScoreBar label="Contact Info" value={result.breakdown?.contact ?? 0} max={10} />
                <ScoreBar label="Conciseness" value={result.breakdown?.length ?? 0} max={10} />
                <ScoreBar
                  label="Clarity"
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

              {result.geminiAnalysis && (
                <div className="ra-gemini-section">
                  <div className="ra-gemini-badge">Gemini Intelligence</div>

                  {result.geminiAnalysis.summary && (
                    <div className="ra-block">
                      <h4>Professional Summary</h4>
                      <p className="ra-gemini-text">{result.geminiAnalysis.summary}</p>
                    </div>
                  )}

                  {result.geminiAnalysis.suggestions?.length > 0 && (
                    <div className="ra-block">
                      <h4>Improvement Suggestions</h4>
                      <ul className="ra-gemini-list">
                        {result.geminiAnalysis.suggestions.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.geminiAnalysis.interviewPrep?.length > 0 && (
                    <div className="ra-block">
                      <h4>Interview Preparation</h4>
                      <div className="ra-prep-grid">
                        {result.geminiAnalysis.interviewPrep.map((p, i) => (
                          <div key={i} className="ra-prep-item">{p}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {jobDescription && result.geminiAnalysis.tailoringTips?.length > 0 && (
                    <div className="ra-block" style={{ marginTop: "2rem" }}>
                      <h4>Role Tailoring Advice</h4>
                      <ul className="ra-gemini-list">
                        {result.geminiAnalysis.tailoringTips.map((t, i) => (
                          <li key={i} className="tailor">{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Ask Gemini Section */}
              <div className="ra-chat-section">
                <h3 style={{ color: "#111827" }}>Ask Gemini Anything</h3>
                <p className="ra-muted" style={{ marginBottom: "1rem" }}>
                  Have questions about your interview? Ask Gemini for advice.
                </p>

                <div className="ra-chat-box">
                  {messages.length === 0 && (
                    <p style={{ textAlign: "center", color: "#6b7280", padding: "2rem" }}>
                      Ask about specific projects, how to answer common questions, or salary negotiation!
                    </p>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={`chat-msg ${m.role}`}>
                      {m.text}
                    </div>
                  ))}
                  {chatLoading && <div className="chat-msg ai">Thinking...</div>}
                </div>

                <div className="ra-chat-input-wrap">
                  <input
                    className="ra-chat-input"
                    type="text"
                    placeholder="Ask about your interview prep..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && askAi()}
                  />
                  <button className="btn-chat" onClick={askAi} disabled={chatLoading}>
                    {chatLoading ? "..." : "Ask"}
                  </button>
                </div>
              </div>

              {result.geminiError && (
                <div className="ra-error-small">
                  Note: AI analysis could not be fully completed. {result.geminiError}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
