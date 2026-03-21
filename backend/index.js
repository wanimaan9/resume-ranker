require("dotenv").config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require("axios");


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Automatically create the 'uploads' folder if it doesn't exist yet
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})
const upload = multer({ storage })

async function analyzeResume(resumeText) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not set in .env');
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            role: 'user',
            parts: [{
              text: `
              Analyze this resume and return json:{
                  "role": "job role",
                  "skills": ["skill1", "skill2", "skill3"],
                  "missing_skills": ["missing1","missing2"]
            }
          Resume:${resumeText}
          `}]
          }
        ]
      }
    );

    const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.log("No AI text returned");
      return null;
    }

    return text;

  } catch (err) {
    console.error("FULL ERROR:", err.response?.data || err.message);
    return null;
  }
};
async function getsuggestions(resumeText) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key is not working ")
    }
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            role: 'user',
            parts: [{
              text: `
              Provide 3-5 concise, actionable bullet points to improve this resume. Keep each suggestion short and to the point.
              Return ONLY JSON like:
              {
                "suggestions": ["point1", "point2", "point3"]
              }
              resume:${resumeText}`

            }]
          }
        ]
      })
    const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text;
  } catch (err) {
    console.log("error in suggestion", err);
    return null
  }
}
app.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }


    const resumePath = req.file.path;
    const databuffer = fs.readFileSync(resumePath);
    const data = await pdfParse(databuffer);

    const resumeText = (data.text || '').toLowerCase();

    const aiResult = await analyzeResume(resumeText);
    const suggestions = await getsuggestions(resumeText);
    if (!aiResult) {
      return res.status(500).json({ error: "AI failed" });

    }
    console.log("AI RESULT:", aiResult);

    let parsed;
    try {
      const jsonmatch = aiResult.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonmatch[0]);
    } catch (err) {
      console.log("JSON parse error for aiResult:", err.message, "AIResult:", aiResult);
      return res.status(500).json({ error: "AI Format Error (Role/Skills)" });
    }

    let parsedsuggestions = { suggestions: [] };
    try {
      const jsonmatch2 = suggestions ? suggestions.match(/\{[\s\S]*\}/) : null;
      if (jsonmatch2) {
        parsedsuggestions = JSON.parse(jsonmatch2[0]);
      }
    } catch (err) {
      console.log("JSON parse error for suggestions:", err.message, "Suggestions:", suggestions);
    }

    const role = parsed.role;
    const skills = (parsed.skills || []).map(s => s.toLowerCase());
    const missing_skills=(parsed.missing_skills || []).map(s=>s.toLowerCase());
    const suggestionList = parsedsuggestions?.suggestions || [];

    let matchcount = 0;
    let actual_missing = [];

    missing_skills.forEach((skill) => {
      // If the AI accidentally suggested a skill that is actually in the resume, we count it as a match instead
      if (resumeText.includes(skill)) {
        matchcount++;
      } else {
        actual_missing.push(skill);
      }
    });

    const totalExpected = skills.length + actual_missing.length;
    const matchPercentage = totalExpected > 0 ? (((skills.length + matchcount) / totalExpected) * 100).toFixed(2) : 100.00;

    console.log(`Match percentage: ${matchPercentage}%`);
    console.log(`Missing keywords: ${actual_missing.join(', ')}`);


    res.send({
      role,
      extractedSkills: skills,
      matchPercentage,
      missingKeywords: actual_missing,
      suggestions: suggestionList
    })

  }
  catch (err) {
    console.log(err)
    res.status(500).json({ error: "Error processing resume" });
  }
})
app.listen(5000, () => {
  console.log('Server is running on port 5000');
})