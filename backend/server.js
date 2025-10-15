import express from "express";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import cors from "cors"; // ✅ Import CORS middleware
import uploadRouter from "./routes/upload.js";

// ✅ Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ Enable CORS for frontend running on Vite (default port 5173)
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Middleware
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));

// ✅ Ensure 'uploads' folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
  console.log("📁 'uploads' folder created");
}

// ✅ Routes
app.use("/api", uploadRouter);

// ✅ Root route (for quick test)
app.get("/", (req, res) => {
  res.send("🟢 Meeting Summarizer Backend is running...");
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
