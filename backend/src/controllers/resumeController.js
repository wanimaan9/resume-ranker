const fs = require('fs');
const pdfParse = require('pdf-parse');
const puppeteer = require("puppeteer");
const { analyzeResume, getsuggestions, getimprovedResume } = require('../services/aiService');
const { generateHTML } = require('../templates/resumeTemplate');

const uploadResume = async (req, res) => {
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
    const improveResume = await getimprovedResume(resumeText, suggestions);
    
    if (!aiResult) {
      return res.status(500).json({ error: "AI failed to analyze resume." });
    }

    let parsed = {};
    try {
      const jsonmatch = aiResult ? aiResult.match(/\{[\s\S]*\}/) : null;
      if (jsonmatch) parsed = JSON.parse(jsonmatch[0]);
    } catch (err) {
      console.log("JSON parse error for aiResult:", err.message);
    }

    let parsedsuggestions = { suggestions: [] };
    try {
      const jsonmatch2 = suggestions ? suggestions.match(/\{[\s\S]*\}/) : null;
      if (jsonmatch2) parsedsuggestions = JSON.parse(jsonmatch2[0]);
    } catch (err) {
      console.log("JSON parse error for suggestions:", err.message);
    }

    let parsedimprove = null;
    try {
      const jsonmatch3 = improveResume ? improveResume.match(/\{[\s\S]*\}/) : null;
      if (jsonmatch3) parsedimprove = JSON.parse(jsonmatch3[0]);
    } catch(err) {
      console.log("JSON parse error for improveResume:", err.message);
    }

    const role = parsed.role;
    const skills = (parsed.skills || []).map(s => s.toLowerCase());
    const missing_skills = (parsed.missing_skills || []).map(s => s.toLowerCase());
    const suggestionList = parsedsuggestions?.suggestions || [];
    const improvedResume = parsedimprove;

    let matchcount = 0;
    let actual_missing = [];

    missing_skills.forEach((skill) => {
      if (resumeText.includes(skill)) {
        matchcount++;
      } else {
        actual_missing.push(skill);
      }
    });

    const totalExpected = skills.length + actual_missing.length;
    const matchPercentage = totalExpected > 0 ? (((skills.length + matchcount) / totalExpected) * 100).toFixed(2) : 100.00;

    res.send({
      role,
      extractedSkills: skills,
      matchPercentage,
      missingKeywords: actual_missing,
      suggestions: suggestionList,
      improvedResume: improvedResume
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error processing resume" });
  }
};

const downloadResume = async (req, res) => {
  try {
    const { data } = req.body;
    const html = generateHTML(data.improvedResume || {});
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    });
    await browser.close();
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': 'attachment;filename="resume.pdf"'
    });
    res.send(pdfBuffer);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error generating PDF" });
  }
};

module.exports = {
  uploadResume,
  downloadResume
};
