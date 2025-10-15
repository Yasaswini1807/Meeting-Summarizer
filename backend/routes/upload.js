import express from "express";
import multer from "multer";
import path from "path";
import { transcribeAudio } from "../services/asr.js";
import { summarizeTranscript } from "../services/llm.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const transcript = await transcribeAudio(req.file.path);
    const summary = await summarizeTranscript(transcript);

    res.json({
      filename: req.file.filename,
      transcript,
      summary,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
