const multer = require("multer");
const path = require("path");

const uploadDir = path.join(__dirname, "../../uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    let ext = path.extname(file.originalname || "");
    if (!ext) {
      const mime = String(file.mimetype || "").toLowerCase();
      if (mime === "image/jpeg") ext = ".jpg";
      else if (mime === "image/png") ext = ".png";
      else if (mime === "image/gif") ext = ".gif";
      else if (mime === "image/webp") ext = ".webp";
      else if (mime === "image/bmp") ext = ".bmp";
      else if (mime === "image/svg+xml") ext = ".svg";
      else if (mime === "video/mp4") ext = ".mp4";
      else if (mime === "video/webm") ext = ".webm";
      else if (mime === "video/quicktime") ext = ".mov";
      else if (mime === "video/x-msvideo") ext = ".avi";
      else if (mime === "application/zip") ext = ".zip";
      else if (mime === "application/x-zip-compressed") ext = ".zip";
    }

    cb(null, unique + ext);
  },
});

function getMaxUploadBytes() {
  const raw = process.env.UPLOAD_MAX_BYTES;
  if (raw) {
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  // Default: 4 GiB
  return 4 * 1024 * 1024 * 1024;
}

function allowFile(file) {
  const field = String(file.fieldname || "");
  const mime = String(file.mimetype || "");
  const ext = String(path.extname(file.originalname || "")).toLowerCase();

  // Backups restore upload uses a zip file.
  if (field === "backupFile") {
    if (ext === ".zip") return true;
    if (mime === "application/zip") return true;
    if (mime === "application/x-zip-compressed") return true;
    // Some clients may send octet-stream for zip
    if (mime === "application/octet-stream" && ext === ".zip") return true;
    return false;
  }

  // Systems/Tasks attachments - allow ANY file type
  if (field === "files") {
    return true;
  }

  // Inline paste + log media should be images/videos.
  if (mime.startsWith("image/") || mime.startsWith("video/")) return true;
  if (
    ext === ".png" ||
    ext === ".jpg" ||
    ext === ".jpeg" ||
    ext === ".gif" ||
    ext === ".webp" ||
    ext === ".bmp" ||
    ext === ".mp4" ||
    ext === ".webm" ||
    ext === ".mov" ||
    ext === ".m4v" ||
    ext === ".avi"
  )
    return true;

  return false;
}

const upload = multer({
  storage,
  limits: {
    files: 1,
    // Keep high to avoid breaking backup restores; still prevents unbounded uploads.
    fileSize: getMaxUploadBytes(),
  },
  fileFilter: (req, file, cb) => {
    cb(null, allowFile(file));
  },
});

module.exports = upload;
