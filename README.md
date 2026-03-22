# 🚀 AI Resume Analyzer & Generator

An AI-powered web application that analyzes resumes, identifies missing skills, provides improvement suggestions, and generates a professional, structured resume in PDF format.

---

## ✨ Features

- 📄 Upload resume (PDF)
- 🤖 AI-based role & skill extraction
- 📊 Match percentage calculation
- ❌ Missing skills detection
- 💡 AI-generated improvement suggestions
- 🧠 Structured resume generation (JSON)
- 🖨️ Professional resume PDF generation (HTML + Puppeteer)
- 🎨 Clean and modern UI

---

## 🧠 How It Works

1. User uploads a resume (PDF)
2. Backend extracts text using pdf-parse
3. Gemini AI:
   - Detects role & skills
   - Suggests improvements
   - Generates structured resume data
4. Backend processes AI response and calculates match percentage
5. Resume is formatted into a professional template
6. User downloads the improved resume as a PDF

---

## 🛠️ Tech Stack

Frontend:
- React
- CSS

Backend:
- Node.js
- Express.js

AI Integration:
- Google Gemini API

Libraries:
- multer (file upload)
- pdf-parse (resume parsing)
- axios (API calls)
- puppeteer (PDF generation)

---

## 📁 Project Structure

backend/
  routes/
  services/
  utils/
  index.js

frontend/
  components/
  App.jsx

---

## ⚙️ Setup Instructions

1. Clone the repository

git clone https://github.com/wanimaan9/resume-ranker.git
cd resume-ranker

---

2. Backend Setup

cd backend
npm install

Create a .env file:

GEMINI_API_KEY=your_api_key_here

Run server:

node index.js

---

3. Frontend Setup

cd frontend
npm install
npm run dev

---

## 🚀 Future Improvements

- Multiple resume templates
- Improved ATS scoring

---

## 💡 Key Learnings

- AI integration with real-world applications
- Resume parsing and text extraction
- JSON parsing and error handling
- Backend modular architecture
- HTML to PDF conversion using Puppeteer

---

## 🧑‍💻 Author

Wani Maan

---

## ⭐ If you like this project

Give it a star on GitHub!
