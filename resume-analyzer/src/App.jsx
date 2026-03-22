import { useState } from 'react';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import ResumeResults from './components/ResumeResults';
import { uploadResume, downloadPDF } from './services/apiService';
import './App.css';

function App() {
  const [file, setfile] = useState(null);
  const [result, setresult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (ev) => {
    setfile(ev.target.files[0]);
  };

  const handleDownload = async () => {
    try {
      await downloadPDF(result);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download the improved resume.");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload");
      return;
    }

    setLoading(true);
    setresult(null);

    try {
      const data = await uploadResume(file);
      setresult(data);
    } catch (err) {
      console.error("Error uploading file:", err);
      alert(err.message || "Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='main'>
      <Header />
      <UploadSection 
        file={file} 
        loading={loading} 
        onFileChange={handleFileChange} 
        onUpload={handleUpload} 
      />
      {!loading && result && (
        <ResumeResults 
          result={result} 
          onDownload={handleDownload} 
        />
      )}
    </div>
  );
}

export default App;
