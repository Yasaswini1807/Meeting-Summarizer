import axios from "axios";
import fs from "fs";
import FormData from "form-data";

export const transcribeAudio = async (filePath) => {
  try {
    console.log("Uploading file to Groq:", filePath);

    // ✅ Ensure the file exists and is readable
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const formData = new FormData();

    // ✅ Create a readable stream, not just the file path
    const fileStream = fs.createReadStream(filePath);

    formData.append("file", fileStream);
    formData.append("model", "whisper-large-v3"); // or your model name

    const response = await axios.post(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          ...formData.getHeaders(), // ✅ auto adds multipart boundary
        },
      }
    );

    return response.data.text;
  } catch (err) {
    console.error("Groq ASR Error Response:", err.response?.data || err.message);
    throw new Error(`Groq ASR failed: ${JSON.stringify(err.response?.data || err.message)}`);
  }
};
