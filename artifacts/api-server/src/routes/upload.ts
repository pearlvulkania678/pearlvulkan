import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const UPLOAD_DIR = path.resolve(
  process.cwd(),
  "../pearl-vulkan/public/uploads",
);

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = crypto.randomBytes(12).toString("hex");
    cb(null, `${name}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (allowed.includes(file.mimetype)) { cb(null, true); }
    else { cb(new Error("Only image files are allowed")); }
  },
});

const router: IRouter = Router();

router.post("/upload", upload.single("file"), (req, res): void => {
  if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
  res.json({ url: `/uploads/${req.file.filename}` });
});

export default router;
