import fs from "fs";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Ensure .env is loaded before anything else
import dotenv from "dotenv";
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1";

if (!GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set in .env");
}

/**
 * Transcribe audio using Groq Whisper
 * @param {string} filePath - path to audio file
 * @returns {Promise<string>} - transcript text
 */
export async function transcribeAudio(filePath) {
  // Resolve absolute file path (important for multer temp folders)
  const absPath = path.resolve(filePath);

  console.log("🎧 Uploading file to Groq:", absPath);

  // ✅ Use native FormData from Node 20+
  const form = new FormData();

  // ✅ Append file as Blob (NOT set)
  form.append("file", new Blob([fs.readFileSync(absPath)]), path.basename(absPath));
  form.append("model", "whisper-large-v3");

  const res = await fetch(`${GROQ_API_URL}/audio/transcriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: form,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Groq ASR Error Response:", errorText);
    throw new Error(`Groq ASR failed: ${errorText}`);
  }

  const data = await res.json();
  console.log("✅ Transcription received from Groq");
  return data.text || "";
}
