import React from 'react';

const UploadSection = ({ file, loading, onFileChange, onUpload }) => {
  return (
    <>
      <div className="upload-section">
        <div className="file-input-wrapper">
          <input 
            type="file" 
            accept=".pdf,.doc,.docx" 
            onChange={onFileChange} 
            disabled={loading} 
          />
        </div>
        
        <button className="upload-btn" onClick={onUpload} disabled={loading || !file}>
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
    </>
  );
};

export default UploadSection;
