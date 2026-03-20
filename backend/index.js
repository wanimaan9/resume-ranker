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
          { role:'user',
            parts: [{ text:`
              Analyze this resume and return json:{
                  "role": "job role",
                  "skills": ["skill1", "skill2", "skill3"]
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
app.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }


    const resumePath = req.file.path;
    const databuffer = fs.readFileSync(resumePath);
    const data = await pdfParse(databuffer);

    const resumeText = (data.text || '').toLowerCase();

    const aiResult= await analyzeResume(resumeText);
    if(!aiResult){
      return res.status(500).json({error:"AI failed"});

    }
    console.log("AI RESULT:", aiResult);

    let parsed;
    try{
      const jsonmatch=aiResult.match(/\{[\s\S]*\}/);
      parsed=JSON.parse(jsonmatch[0]);
    }catch(err){
      console.log("JSON parse error", aiResult);
      return res.status(500).json({error:"Ai formar Error"});
    }
    const role=parsed.role;
    const skills=parsed.skills.map(s=>s.toLowerCase());

    let matchcount = 0;
    let missing = [];

    skills.forEach((skill) => {
      if (resumeText.includes(skill)) {
        matchcount++;
      } else {
        missing.push(skill);
      }

    })

    const matchPercentage = ((matchcount / skills.length) * 100).toFixed(2);

    console.log(`Match percentage: ${matchPercentage}%`);
    console.log(`Missing keywords: ${missing.join(', ')}`);


    res.send({
      role,
      extractedSkills: skills,
      matchPercentage,
      missingKeywords: missing
    })

  }
  catch (err) {
    console.log(err)
    res.status(500).json({error:"Error processing resume"});
  }
})
app.listen(5000, () => {
  console.log('Server is running on port 5000');
})