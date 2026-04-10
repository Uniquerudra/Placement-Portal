<div align="center">
  <img src="https://img.shields.io/badge/MERN_Stack-white?logo=react&logoColor=61DAFB" alt="MERN" />
  <img src="https://img.shields.io/badge/Google_Gemini_AI-white?logo=google&logoColor=4285F4" alt="Gemini" />
  <img src="https://img.shields.io/badge/UI_UX-Figma_Inspired-white?logo=figma&logoColor=F24E1E" alt="UI" />
</div>

<h1 align="center">🎓 TPO Portal (AI-Powered Placement App)</h1>

<p align="center">
  A premium, full-stack <strong>Training & Placement Office (TPO) Portal</strong> equipped with dynamic features and an AI-powered Resume Intelligence engine. This platform bridges the gap between administrators, recruiters, and students to streamline campus placements securely and beautifully.
</p>

---

## ✨ Outstanding Features

### 👨‍🎓 **For Students:**
* **Intelligent Student Dashboard:** A sleek interface offering a centralized view of all active placement drives, application history, and personalized notifications.
* **AI-Powered Resume Analyzer:** Built directly with the **Google Gemini-1.5-Flash AI SDK**, students can upload their PDF/Word resumes and receive immediate, deep-dive intelligence: ATS scoring, keyword matching against job descriptions, structural breakdown, and specific AI-tailored interview advice.
* **Gemini Assistant Chatbot:** Ask the embedded Gemini AI directly about career paths, resume tips, or how to conquer interview questions without ever leaving the portal.
* **1-Click Apply:** Directly submit applications to drives with stored configurations, generating instant email receipts.

### 🏛️ **For TPOs & Administrators:**
* **Premium TPO Dashboard:** A gorgeous, dark-themed, glassmorphic management dashboard inspired by top-tier modern web design (Figma). 
* **Drive Generation Engine:** Effortlessly configure new placement drives (LPA, Branches, CGPA cutoffs, deadlines) and instantly broadcast personalized **HTML Email Notifications** to all eligible students using Nodemailer.
* **Real-Time Data Table:** Swiftly sort through applicant lists, track status updates via minimal-styled inline dropdowns (Applied, Shortlisted, Selected), and dispatch interview/shortlist emails seamlessly.

---

## 🛠️ Technology Stack

1. **Frontend:**
   * **React.js** (Hooks, Context, CRA)
   * Advanced Custom CSS3 (Glassmorphism, CSS Gradients, Flexbox/Grid)
   * React Router DOM for seamless SPA routing.
2. **Backend:**
   * **Node.js & Express.js** server.
   * **MongoDB** (with Mongoose modeling) for robust NoSQL cloud data storage.
3. **Third-Party Integrations:**
   * **Google Generative AI (`@google/generative-ai`)** processing complex resume parsing & chatbot capabilities.
   * **Cloudinary & Multer** for high-speed, secure PDF/DOCX and image remote storage.
   * **Nodemailer** alongside **SendGrid API** fallbacks for reliable bulk SMTP email dispatching.
   * **PDF-Parse & Mammoth** for server-side document text extraction.

---

## 🚀 Getting Started

Follow these instructions to run the application perfectly on your local machine.

### Prerequisites
* [Node.js](https://nodejs.org/) installed
* A free [MongoDB Atlas](https://www.mongodb.com/) cluster URI
* A free [Google Gemini API Key](https://aistudio.google.com/)
* A free [Cloudinary API Key](https://cloudinary.com/) (For Resumes/Images)

### 1. Backend Setup

```bash
# Move to the backend folder
cd backend

# Install all backend packages
npm install

# Start the server (Runs on port 5000)
npm run dev 
# or use `node server.js`
```
> **Important:** Duplicate or create a `.env` file inside the `/backend` folder matching the variables below:
```env
PORT=5000
MONGO_URI=your_mongodb_cluster_string
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Emails
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Gemini AI Engine
GEMINI_API_KEY=your_gemini_key
```

### 2. Frontend Setup

```bash
# Open a new terminal, go to the frontend folder
cd frontend

# Install React dependencies
npm install

# Start the React Development Server (Runs on port 3000)
npm start
```
> **Important:** Duplicate or create a `.env` file inside the `/frontend` folder:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📂 Architecture Overview

```text
tpo-portal/
├── backend/                   # ⚙️ Node/Express API
│   ├── config/                # Database & Cloudinary config
│   ├── controllers/           # API Logic (Auth, Drives, etc)
│   ├── models/                # Mongoose DB Schemas
│   ├── routes/                # Express Routing maps
│   ├── utils/                 # Gemini integration, Email sender, File parsers
│   ├── .env                   # Ignored Environment Keys
│   └── server.js              # Server entry
│
└── frontend/                  # 🎨 React Interface
    ├── public/
    └── src/
        ├── components/        # Reusable UI widgets & SVGs
        ├── css/               # Dedicated modular dark/light stylesheets
        ├── pages/             # Parent Views (TPODashboard, ResumeAnalyzer)
        ├── App.js             # Route configurations
        └── api.js             # Prepared Axios instances with interceptors
```

---

## 👨‍💻 Developed By

<div align="center">
  <img src="./developer.png" alt="Rudra - MERN Stack Developer" width="100%" />
</div>

<p align="center">
  <strong>Hi, I'm Rudra — MERN Stack Developer</strong><br>
  <i>I craft high-performance digital solutions with precision and passion. Transforming complex problems into elegant, scalable experiences.</i><br><br>
  <a href="https://github.com/Uniquerudra">View My Work</a> • <a href="#">Hire Me</a>
</p>

---

<p align="center">
  <i>Developed with ❤️ for streamlined campus placements and next-generation career bridging.</i>
</p>
