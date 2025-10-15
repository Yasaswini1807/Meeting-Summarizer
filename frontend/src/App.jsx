import { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
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
      setSummary(parseSummary(data.summary));
    } catch (err) {
      alert("Error uploading or summarizing file!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Parse the LLM response into structured sections
  const parseSummary = (text) => {
    const sections = {};
    const regex = /\*\*(.*?)\:\*\*\s*([\s\S]*?)(?=\*\*|$)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      sections[match[1]] = match[2]
        .trim()
        .split(/[\n.]-\s*/g) // split by bullet or dot+dash
        .filter((item) => item)
        .map((item) => item.trim());
    }
    return sections;
  };

  return (
    <div className="app-container">
      <h1>🎙️ Meeting Summarizer</h1>

      <div className="upload-section">
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Processing..." : "Upload & Summarize"}
        </button>
      </div>

      {summary && (
        <div className="summary-container">
          {Object.keys(summary).map((section) => (
            <div className="section" key={section}>
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
