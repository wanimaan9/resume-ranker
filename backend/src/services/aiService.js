const axios = require("axios");

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
      console.log("No AI text returned from analyzeResume");
      return null;
    }
    return text;
  } catch (err) {
    console.error("FULL ERROR:", err.response?.data || err.message);
    return null;
  }
}

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

async function getimprovedResume(resumeText, suggestionsText){
  try{
    const apiKey = process.env.GEMINI_API_KEY;
    if(!apiKey){
      throw new Error("Gemini API key is not working");
    }
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        contents:[
          {
            role:'user',
            parts:[{
              text:`
              Rewrite and improve this resume by deeply applying the following suggestions to the content:
              Suggestions for improvement: ${suggestionsText}

              Output ONLY valid JSON in the exact format shown below.
              If the resume has NO work experience, leave the "experience" array EMPTY. Do not invent fake experience.

             {
               "name": "Candidate Name",
               "role": "Job Role",
               "summary": "Impactful professional summary...",
               "skills": ["Skill1", "Skill2"],
               "projects": [
                 { "title": "Project Name", "description": "What you built and how..." }
               ],
               "experience": [
                 { "title": "Job Title", "company": "Company Name", "duration": "2021-2023", "description": "Responsibilities..." }
               ]
             }

             Rules:
            - No extra text
            - Keep it clean
            - Fill missing fields with empty string/array

            Original Resume: ${resumeText}
              `
            }]
          }
        ]
      })
      const text=response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return text;

  }catch(e){
    console.log("error occurred :", e);
    return null;
  }
}

module.exports = {
  analyzeResume,
  getsuggestions,
  getimprovedResume
};
