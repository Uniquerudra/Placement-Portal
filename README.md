🎓 TPO Portal (AI-Powered Placement System)

A full-stack Training & Placement Office (TPO) Portal built using the MERN stack with AI integration.
This platform helps manage campus placements by connecting students and administrators in one system.

🚀 Features
👨‍🎓 Student
View all placement drives
Apply to jobs with one click
Track application status
AI Resume Analyzer (ATS score + feedback)
AI Chat Assistant (career help)
🏛️ Admin / TPO
Create and manage placement drives
Filter students (CGPA, branch, etc.)
Send bulk email notifications
Track applicants (Applied → Selected)
🛠️ Tech Stack
Frontend: React.js, CSS
Backend: Node.js, Express.js
Database: MongoDB
AI: Google Gemini API
File Upload: Cloudinary + Multer
Email: Nodemailer + SendGrid
📂 Project Structure
tpo-portal/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
└── frontend/
    ├── components/
    ├── pages/
    ├── css/
    ├── App.js
    └── api.js
⚙️ Installation & Setup
1. Clone Repository
git clone https://github.com/your-username/tpo-portal.git
cd tpo-portal
2. Backend Setup
cd backend
npm install
npm run dev

Create .env file in backend:

PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret

CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

SMTP_USER=your_email
SMTP_PASS=your_password

GEMINI_API_KEY=your_key
3. Frontend Setup
cd frontend
npm install
npm start

Create .env file in frontend:

REACT_APP_API_URL=http://localhost:5000/api
🧠 Highlights
Full-stack MERN application
AI-powered resume analysis
Secure authentication (JWT)
Email automation system
Clean and simple UI
🔮 Future Improvements
Interview preparation module
Mobile app version
Advanced analytics dashboard
👨‍💻 Author

Rudra Pratap Pal

⭐ Support

If you like this project, give it a ⭐ on GitHub.
