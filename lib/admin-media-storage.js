import crypto from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"]
]);

export async function saveAdminMediaUpload({ file, folder = "uploads" }) {
  validateAdminMediaUpload(file);

  const sanitizedFolder = sanitizeFolder(folder);
  const extension = ALLOWED_IMAGE_TYPES.get(file.type);
  const originalName = path.parse(file.name || "image").name;
  const fileName = `${sanitizeFileBase(originalName)}-${crypto.randomUUID()}${extension}`;
  const publicFolder = path.join(process.cwd(), "public", "uploads", sanitizedFolder);
  const publicPath = path.join(publicFolder, fileName);
  const portalPath = `uploads/${sanitizedFolder}/${fileName}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  await mkdir(publicFolder, { recursive: true });
  await writeFile(publicPath, bytes);

  return {
    ok: true,
    provider: "local-public",
    path: portalPath,
    publicPath,
    contentType: file.type,
    size: file.size
  };
}

function validateAdminMediaUpload(file) {
  if (!file || typeof file === "string") {
    throw uploadError("A file is required.", 400);
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw uploadError("Upload a JPG, PNG, WEBP, or GIF image.", 400);
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw uploadError("Image must be 5 MB or smaller.", 400);
  }
}

function uploadError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function sanitizeFolder(value) {
  return String(value || "uploads")
    .replace(/\\/g, "/")
    .split("/")
    .map((segment) => sanitizeFileBase(segment))
    .filter(Boolean)
    .join("/") || "uploads";
}

function sanitizeFileBase(value) {
  return String(value || "image")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "image";
}
