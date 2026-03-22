import React from 'react';

const ResumeResults = ({ result, onDownload }) => {
  if (!result) return null;

  return (
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
      
      <button className="download-btn" onClick={onDownload}>
        Download Improved Resume
      </button>
    </div>
  );
};

export default ResumeResults;
