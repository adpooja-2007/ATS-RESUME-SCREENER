# AI-Powered ATS Career Assistant & Job Matcher

A professional, emoji-free web application designed to help job seekers optimize their resumes for specific job descriptions using advanced keyword matching, parsing algorithms, and Gemini LLM intelligence.

---

## Workspace Architecture

```
ats-ai-analyzer/
│
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable layout and navigation components
│   │   ├── context/        # Auth states and context wraps
│   │   ├── pages/          # Auth, Upload, Matcher, and Dashboard views
│   │   ├── routes/         # Private route guards and switch blocks
│   │   ├── index.css       # Core dark-mode premium styling system
│   │   ├── App.jsx         # App bootstrapping
│   │   └── main.jsx        # Mounting triggers
│   └── package.json
│
├── server/                 # Express Backend
│   ├── src/
│   │   ├── config/         # MongoDB, Multer, and Gemini client initialization
│   │   ├── controllers/    # Authentication, Resumes, Matcher, and Reports handlers
│   │   ├── middleware/     # JWT protection and global error catch blocks
│   │   ├── models/         # Mongoose User, Resume, Job, Report, and Version schemas
│   │   ├── routes/         # Mounted REST API routing
│   │   └── services/       
│   │       ├── ats/        # Programmatic scoring and prioritizing engines
│   │       ├── ai/         # Standalone suggestions, rewrites, and mock interview tools
│   │       ├── parser/     # Text extractors and LLM parser blocks
│   │       ├── report/     # PDFKit and DOCX builders
│   │       └── rag/        # Phase 2 Retrieval-Augmented Generation skeletons
│   ├── uploads/            # Location of raw uploaded resume files
│   ├── generated-reports/  # Location of temporary PDF/DOCX downloads
│   └── package.json
│
└── README.md               # Quickstart guide
```

---

## Technical Features

1. **User Authentication**: Secure email register/login with JWT verification and dashboard route guards.
2. **Resume Parsing Engine**: Formats PDF and DOCX files into raw text, then converts them to structured profiles (education, experiences, skills, projects) using Gemini.
3. **ATS Scoring Algorithm**: Programmatically weights Skill Matches (40%), Keyword Density (30%), Project Relevancy (15%), Experience Criteria (10%), and Formatting Quality (5%).
4. **Missing Skill Detection**: Triggers gap analysis, prioritizing missing qualifications into High, Medium, and Low priorities.
5. **AI Suggestion Engine**: Tailors suggestions to existing profile items (e.g., "Add REST APIs details to your CRUD banking project description").
6. **Resume Bullet Rewriter**: Rephrases weak statements (e.g., "Built a website") into high-impact accomplishments with action verbs and metrics.
7. **Document Generation**: Renders professional PDF and editable DOCX report exports on demand.
8. **Dashboard Analytics**: Displays progression lines showing score improvements over version iterations.
9. **RAG Architecture Blueprint**: Vector storage, retrieval indexing, and prompt augmentation structures ready for advanced query enhancements.

---

## Quickstart Guide

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally or a MongoDB Atlas connection URI

### 2. Configure Backend Server
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Edit the `.env` file and input your credentials:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/ats_resume_analyzer
   JWT_SECRET=secure_career_ats_secret_token_key_13579
   GEMINI_API_KEY=your_actual_gemini_api_key
   ```
4. Start the server:
   - In development mode (restarts on file changes):
     ```bash
     npm run dev
     ```
   - In production mode:
     ```bash
     npm start
     ```

### 3. Configure React Client
1. Navigate to the client folder:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the client dev server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the address displayed (usually `http://localhost:5173`).

---

## Dynamic Fallback Mode

If the `GEMINI_API_KEY` is not provided in `.env`, the system executes custom regex heuristics and semantic matching to simulate analysis, ensuring the user interface, parsing trackers, and report generation systems remain fully operational for demonstration purposes.
