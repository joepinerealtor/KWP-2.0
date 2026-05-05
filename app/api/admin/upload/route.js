import crypto from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"]
]);

export async function POST(request) {
  const access = requireAdminAccess(request);

  if (access) {
    return access;
  }

  let formData;

  try {
    formData = await request.formData();
  } catch {
    return noStoreJson({ error: "Upload must use form data." }, { status: 400 });
  }

  const file = formData.get("file");
  const folder = sanitizeFolder(formData.get("folder") || "uploads");

  if (!file || typeof file === "string") {
    return noStoreJson({ error: "A file is required." }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return noStoreJson({ error: "Upload a JPG, PNG, WEBP, or GIF image." }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return noStoreJson({ error: "Image must be 5 MB or smaller." }, { status: 400 });
  }

  const extension = ALLOWED_IMAGE_TYPES.get(file.type);
  const originalName = path.parse(file.name || "image").name;
  const fileName = `${sanitizeFileBase(originalName)}-${crypto.randomUUID()}${extension}`;
  const publicFolder = path.join(process.cwd(), "public", "uploads", folder);
  const publicPath = path.join(publicFolder, fileName);
  const portalPath = `uploads/${folder}/${fileName}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  await mkdir(publicFolder, { recursive: true });
  await writeFile(publicPath, bytes);

  return noStoreJson({
    ok: true,
    path: portalPath
  });
}

function requireAdminAccess(request) {
  if (process.env.KWP_ADMIN_ENABLED !== "true") {
    return noStoreJson({ error: "Upload API is disabled." }, { status: 404 });
  }

  if (!isAuthorized(request)) {
    return noStoreJson({ error: "Valid admin passcode required." }, { status: 401 });
  }

  return null;
}

function isAuthorized(request) {
  const configuredPasscode = process.env.KWP_ADMIN_PASSCODE || "";
  const headerPasscode = request.headers.get("x-kwp-admin-passcode") || "";
  const authorization = request.headers.get("authorization") || "";
  const bearerPasscode = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

  return passcodeMatches(headerPasscode, configuredPasscode) || passcodeMatches(bearerPasscode, configuredPasscode);
}

function passcodeMatches(candidatePasscode, configuredPasscode) {
  if (!candidatePasscode || !configuredPasscode) {
    return false;
  }

  const candidateBuffer = Buffer.from(candidatePasscode);
  const configuredBuffer = Buffer.from(configuredPasscode);

  if (candidateBuffer.length !== configuredBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(candidateBuffer, configuredBuffer);
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

function noStoreJson(body, init = {}) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");

  return response;
}
