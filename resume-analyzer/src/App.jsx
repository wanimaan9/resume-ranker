import { useState } from 'react'
import './App.css'

function App() {
  const [file, setfile] = useState(null)
  const [result, setresult] = useState(null)
  const [loading, setLoading] = useState(false);

  const handleFileChange = (ev) => {
    const file = ev.target.files[0];
    setfile(file);
  }

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload");
      return;
    }
    const formData = new FormData();
    formData.append('resume', file);

    setLoading(true);
    setresult(null);

    try {
      const res = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        alert(errorData?.error || "An error occurred on the server.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setresult(data);
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='main'>
      <div className="header">
        <h1>Resume Analyzer</h1>
        <p>AI-powered insights to land your dream job</p>
      </div>

      <div className="upload-section">
        <div className="file-input-wrapper">
          <input 
            type="file" 
            accept=".pdf,.doc,.docx" 
            onChange={handleFileChange} 
            disabled={loading} 
          />
        </div>
        
        <button className="upload-btn" onClick={handleUpload} disabled={loading || !file}>
          {loading ? (
            <>
              <div className="spinner" style={{width: '20px', height: '20px', borderWidth: '2px'}}></div>
              Analyzing...
            </>
          ) : (
            "Analyze Resume"
          )}
        </button>
      </div>

      {loading && (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Scanning your resume with AI...</p>
        </div>
      )}

      {result && !loading && (
        <div className="results-container">
          
          <div className="score-card">
            <span className="role-badge">{result.role || 'General Role'}</span>
            <div className="score-value">{result.matchPercentage}%</div>
            <div className="score-label">Resume Match Score</div>
          </div>

          {result.missingKeywords && result.missingKeywords.length > 0 && (
            <div className="section-block">
              <h3 className="section-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                Missing Skills
              </h3>
              <div className="skills-grid">
                {result.missingKeywords.map((keyword, index) => (
                  <div className="skill-chip" key={index}>{keyword}</div>
                ))}
              </div>
            </div>
          )}

          {result.suggestions && result.suggestions.length > 0 && (
            <div className="section-block">
              <h3 className="section-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                Actionable Feedback
              </h3>
              <div className="suggestions-list">
                {result.suggestions.map((s, i) => (
                  <div className="suggestion-card" key={i}>
                    <p>{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default App
