import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1";

if (!GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set in .env");
}

/**
 * Summarize meeting transcript using Groq LLaMA 3.1
 * @param {string} transcript - full transcript text
 * @returns {Promise<string>} - summarized text
 */
export async function summarizeTranscript(transcript) {
  const body = {
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "You are an expert meeting summarizer. Summarize the following transcript into key decisions, action items, and a short summary.",
      },
      {
        role: "user",
        content: transcript,
      },
    ],
  };

  const res = await fetch(`${GROQ_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Groq LLM Error Response:", errText);
    throw new Error(`Groq LLM failed: ${errText}`);
  }

  const data = await res.json();

  // Groq returns choices array similar to OpenAI
  if (!data.choices || !data.choices[0]?.message?.content) {
    throw new Error("Unexpected Groq LLM response format");
  }

  return data.choices[0].message.content;
}
