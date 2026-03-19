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

app.get("/test-ai", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not set in .env' });
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [{ text: "Say hello in one line" }]
          }
        ]
      }
    );

    const text =
      response.data.candidates[0].content.parts[0].text;

    res.send(text);

  } catch (err) {
    console.error("FULL ERROR:", err.response?.data || err.message);
    res.status(500).send("Gemini error");
  }
});
app.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    const jobDescriptionRaw = req.body.jobDesc || '';
    if (typeof jobDescriptionRaw !== 'string' || !jobDescriptionRaw.trim()) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    const resumePath = req.file.path;
    const databuffer = fs.readFileSync(resumePath);
    const data = await pdfParse(databuffer);

    const resumeText = (data.text || '').toLowerCase();
    const jobDescription = jobDescriptionRaw.toLowerCase();

    const keywords = jobDescription.split(/\s+/).filter(Boolean);
    if (keywords.length === 0) {
      return res.status(400).json({ error: 'Job description must contain keywords' });
    }
    let matchcount = 0;
    let missing = [];

    keywords.forEach((keyword) => {
      if (resumeText.includes(keyword)) {
        matchcount++;
      } else {
        missing.push(keyword);
      }

    })

    const matchPercentage = ((matchcount / keywords.length) * 100).toFixed(2);

    console.log(`Match percentage: ${matchPercentage}%`);
    console.log(`Missing keywords: ${missing.join(', ')}`);


    res.send({
      matchPercentage,
      missingKeywords: missing
    })

  }
  catch (err) {
    console.log(err)
    res.status(500).send("Error processing resume");
  }
})
app.listen(5000, () => {
  console.log('Server is running on port 5000');
})