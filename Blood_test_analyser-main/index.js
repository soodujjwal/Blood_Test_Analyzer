import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { analyzeBloodTest } from "./analyze.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== "production";

app.use(cors());
app.use(express.json());

app.post("/api/analyze", async (req, res) => {
  try {
    const { results, patientInfo } = req.body;
    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ error: "Invalid blood test results" });
    }
    const analysis = await analyzeBloodTest(results, patientInfo || {});
    res.json(analysis);
  } catch (err) {
    console.error("Analysis error:", err);
    const fallback = err.fallback || null;
    res.status(500).json({
      error: "Analysis failed",
      details: err.message,
      ...(fallback && { fallback }),
    });
  }
});

if (isDev) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
  });
  app.use(vite.middlewares);
} else {
  const dist = path.join(process.cwd(), "dist");
  if (fs.existsSync(dist)) {
    app.use(express.static(dist));
    app.get("*", (_, res) => {
      res.sendFile(path.join(dist, "index.html"));
    });
  }
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Blood Test Report AI running at http://localhost:${PORT}`);
  if (isDev) console.log("Open this URL in Safari (or any browser).");
});
