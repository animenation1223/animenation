import type { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { HttpError } from "../middleware/errorHandler";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export const uploadFileHandler: RequestHandler = async (req, res, next) => {
  try {
    if (!req.file) throw new HttpError(400, "No file uploaded");
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const safeName = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const dest = path.join(UPLOAD_DIR, safeName);
    fs.writeFileSync(dest, req.file.buffer);
    const baseUrl = process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 4000}`;
    res.json({ file_url: `${baseUrl}/uploads/${safeName}` });
  } catch (e) {
    next(e);
  }
};
