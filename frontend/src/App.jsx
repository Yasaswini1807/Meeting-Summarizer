import { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState(""); // ✅ New state for raw transcript
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please upload a file!");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:4000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      // Store raw transcript
      setTranscript(data.transcript || "");

      // Parse summary into structured points
      setSummary(parseSummary(data.summary || ""));

    } catch (err) {
      alert("Error uploading or summarizing file!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Parser for structured points
  const parseSummary = (text) => {
    const sections = {};
    const regex = /\*\*(.*?)\:\*\*\s*([\s\S]*?)(?=\*\*|$)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const title = match[1].trim();
      const content = match[2]
        .replace(/\n+/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();

      const points = content
        .split(/(?:(?:\d+\.)|(?:-\s)|(?:•))/g)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      sections[title] = points;
    }

    return sections;
  };

  return (
    <div className="main-container">
      <header className="header">
        <h1 className="title">🎙️ Meeting Summarizer</h1>
        <p className="subtitle">Get meeting transcripts summarized by AI</p>
      </header>

      <div className="upload-box">
        <label className="custom-file-upload">
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          Browse File
        </label>

        {file && <p className="file-name">{file.name}</p>}

        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Processing..." : "Upload & Summarize"}
        </button>
      </div>

      {/* ✅ Display raw transcript */}
      {transcript && (
        <div className="transcript-section">
          <h2>Transcript</h2>
          <p>{transcript}</p>
        </div>
      )}

      {/* Structured summary */}
      {summary && (
        <div className="summary-section">
          {Object.keys(summary).map((section) => (
            <div className="summary-block" key={section}>
              <h2>{section}</h2>
              <ul>
                {summary[section].map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
