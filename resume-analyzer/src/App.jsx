import { useState } from 'react'

import './App.css'

function App() {
  const [file,setfile]=useState(null)
  const [result,setresult]=useState(null)
  const [jobDescription,setJobDescription]=useState("");
  const handleFileChange = (ev) => {
    const file=ev.target.files[0];
    setfile(file);
  }

  const handleUpload=async ()=>{
    if(!file){
      alert("please select a file to upload")
      return;
    }
    const formData=new FormData();
    formData.append('resume', file);
    formData.append("jobDesc", jobDescription);
    try{
      const res=await fetch('http://localhost:5000/upload',{
        method:'POST',
        body:formData
      })
      const data=await res.json();
      setresult(data);

    }
    catch(err){
      console.error("Error uploading file:", err);
    }
  }
  return (
    <>
      <div className='main'>
        <h1>Resume Analyzer</h1>
        <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange}/>
        <br /> <br />
        <textarea
         placeholder="Enter job description..."
         value={jobDescription}
         onChange={(e) => setJobDescription(e.target.value)}
         rows={5}
         cols={40}
/>
        <button onClick={handleUpload}>Upload Resume</button>
        {result && (
          <div>
            <h2>Matched Percentage : {result.matchPercentage}%</h2>
            <h3>Missing Keywords:</h3>
            <ul>
              {result.missingKeywords.map((keyword,index)=>{
                return <li key={index}>{keyword}</li>
              })}
            </ul>
          </div>

        )} 
      </div>
    </>
  )
}

export default App
