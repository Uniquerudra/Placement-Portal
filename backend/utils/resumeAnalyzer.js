const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "from", "has", "have", "he", "her", "his",
  "i", "if", "in", "into", "is", "it", "its", "me", "my", "of", "on", "or", "our", "she", "so", "that",
  "the", "their", "them", "then", "there", "these", "they", "this", "to", "was", "we", "were", "what",
  "when", "where", "which", "who", "will", "with", "you", "your",
  // common resume filler
  "responsible", "worked", "work", "working", "experience", "project", "projects", "skills", "skill",
]);

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function normalizeText(input) {
  return String(input || "")
    .replace(/\u00A0/g, " ")
    .replace(/[•●▪◦◆▶►]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(input) {
  const text = normalizeText(input).toLowerCase();
  const cleaned = text.replace(/[^a-z0-9+.#\s]/g, " ");
  return cleaned
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

function extractTopKeywords(jobDescription, limit = 30) {
  const tokens = tokenize(jobDescription);
  const freq = new Map();
  for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([t]) => t);
}

function detectSections(text) {
  const t = normalizeText(text).toLowerCase();
  const has = (re) => re.test(t);
  return {
    education: has(/\beducation\b/),
    experience: has(/\b(experience|employment|internship|internships|work history)\b/),
    projects: has(/\b(projects|project)\b/),
    skills: has(/\b(skills|technical skills|technologies)\b/),
    summary: has(/\b(summary|objective|profile)\b/),
    certifications: has(/\b(certifications|certification|certificates)\b/),
    achievements: has(/\b(achievements|awards|accomplishments)\b/),
  };
}

function scoreSections(sections) {
  const required = [
    ["education", 8],
    ["skills", 8],
    ["projects", 8],
  ];
  const optional = [
    ["experience", 2],
    ["summary", 2],
    ["certifications", 2],
    ["achievements", 2],
  ];

  let score = 0;
  for (const [key, pts] of required) if (sections[key]) score += pts;
  for (const [key, pts] of optional) if (sections[key]) score += pts;
  return clamp(score, 0, 30);
}

function scoreContact(text) {
  const t = normalizeText(text);
  const hasEmail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(t);
  const hasPhone = /(\+?\d{1,3}[\s-]?)?(\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4})/.test(t);
  const hasLinkedIn = /linkedin\.com\/in\/[a-z0-9-_%]+/i.test(t);
  const hasGitHub = /github\.com\/[a-z0-9-_%]+/i.test(t);

  let score = 0;
  if (hasEmail) score += 4;
  if (hasPhone) score += 3;
  if (hasLinkedIn) score += 2;
  if (hasGitHub) score += 1;
  return { score: clamp(score, 0, 10), hasEmail, hasPhone, hasLinkedIn, hasGitHub };
}

function scoreLength(wordCount) {
  if (wordCount >= 250 && wordCount <= 900) return 10;
  if ((wordCount >= 150 && wordCount < 250) || (wordCount > 900 && wordCount <= 1200)) return 6;
  return 2;
}

function scoreReadability(text) {
  const normalized = normalizeText(text);
  const sentences = normalized.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const words = normalized.split(/\s+/).filter(Boolean);
  const sentenceCount = Math.max(1, sentences.length);
  const avgWordsPerSentence = words.length / sentenceCount;

  let score = 10;
  if (avgWordsPerSentence < 5 || avgWordsPerSentence > 30) score = 3;
  else if (avgWordsPerSentence < 8 || avgWordsPerSentence > 22) score = 6;

  return { score, avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10 };
}

function scoreKeywords(resumeText, jobDescription) {
  const jd = normalizeText(jobDescription);
  if (!jd) {
    return { score: 0, keywords: [], matched: [], missing: [], matchRatio: 0 };
  }

  const keywords = extractTopKeywords(jd, 30);
  const resumeTokens = new Set(tokenize(resumeText));
  const matched = keywords.filter((k) => resumeTokens.has(k));
  const missing = keywords.filter((k) => !resumeTokens.has(k));
  const matchRatio = keywords.length ? matched.length / keywords.length : 0;
  const score = clamp(Math.round(matchRatio * 30), 0, 30);
  return { score, keywords, matched, missing, matchRatio: Math.round(matchRatio * 100) / 100 };
}

function buildInsights({ sections, contact, wordCount, readability, keywordInfo }) {
  const insights = [];

  if (!contact.hasEmail) insights.push({ type: "warning", title: "Missing email", message: "Add a professional email on the top of the resume." });
  if (!contact.hasPhone) insights.push({ type: "warning", title: "Missing phone", message: "Add a phone number so recruiters can reach you." });
  if (!sections.skills) insights.push({ type: "warning", title: "Add a Skills section", message: "ATS systems look for a clear Skills/Technical Skills section." });
  if (!sections.education) insights.push({ type: "warning", title: "Add Education section", message: "Include degree, college, year, and CGPA/percentage (if good)." });
  if (!sections.projects) insights.push({ type: "tip", title: "Add Projects section", message: "Projects help ATS and recruiters quickly assess your hands-on work." });

  if (wordCount < 150) insights.push({ type: "warning", title: "Resume too short", message: "Add more details: projects, impact, tools, measurable results." });
  if (wordCount > 1200) insights.push({ type: "tip", title: "Resume too long", message: "Try to keep it concise (usually 1 page for students). Remove repetition." });

  if (readability.avgWordsPerSentence > 25) insights.push({ type: "tip", title: "Improve readability", message: "Use shorter bullet points. Keep sentences crisp and impact-driven." });

  if (keywordInfo.keywords.length && keywordInfo.matchRatio < 0.35) {
    insights.push({
      type: "tip",
      title: "Low keyword match",
      message: "Tailor your resume to the Job Description by adding missing relevant keywords naturally (skills, tools, role terms).",
    });
  }

  return insights;
}

function analyzeResumeText({ resumeText, jobDescription }) {
  const text = normalizeText(resumeText);
  const words = text ? text.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  const sections = detectSections(text);
  const sectionScore = scoreSections(sections);
  const contact = scoreContact(text);
  const lengthScore = scoreLength(wordCount);
  const readability = scoreReadability(text);
  const keywordInfo = scoreKeywords(text, jobDescription);

  const atsScore = clamp(
    sectionScore + contact.score + lengthScore + readability.score + keywordInfo.score,
    0,
    100
  );

  return {
    atsScore,
    breakdown: {
      sections: sectionScore,
      contact: contact.score,
      length: lengthScore,
      readability: readability.score,
      keywords: keywordInfo.score,
    },
    extracted: {
      wordCount,
      avgWordsPerSentence: readability.avgWordsPerSentence,
    },
    sections,
    keywordMatch: {
      matchRatio: keywordInfo.matchRatio,
      matched: keywordInfo.matched,
      missing: keywordInfo.missing,
      keywords: keywordInfo.keywords,
    },
    insights: buildInsights({
      sections,
      contact,
      wordCount,
      readability,
      keywordInfo,
    }),
  };
}

async function extractResumeTextFromBuffer(buffer, originalName) {
  const ext = (path.extname(originalName || "") || "").toLowerCase();
  if (ext === ".pdf") {
    const data = await pdfParse(buffer);
    return {
      text: normalizeText(data?.text || ""),
      meta: { pages: data?.numpages || undefined },
    };
  }
  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ buffer });
    return {
      text: normalizeText(result?.value || ""),
      meta: {},
    };
  }
  const err = new Error("Unsupported file type. Please upload a PDF or DOCX.");
  err.statusCode = 400;
  throw err;
}

module.exports = {
  analyzeResumeText,
  extractResumeTextFromBuffer,
};

