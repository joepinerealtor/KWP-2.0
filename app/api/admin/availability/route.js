import crypto from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CANONICAL_AVAILABILITY_PATH = path.join(process.cwd(), "data", "joe-tech-status.json");
const PUBLIC_AVAILABILITY_PATH = path.join(process.cwd(), "public", "data", "joe-tech-status.json");
const ALLOWED_STATUSES = new Set(["available", "available_now", "unavailable"]);

export async function GET(request) {
  const access = requireAdminAccess(request);

  if (access) {
    return access;
  }

  try {
    return noStoreJson({
      availability: await loadAvailability(),
      source: "data/joe-tech-status.json",
      publicMirror: "public/data/joe-tech-status.json"
    });
  } catch (error) {
    return noStoreJson({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const access = requireAdminAccess(request);

  if (access) {
    return access;
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return noStoreJson({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const availability = normalizeAvailabilityPayload(body?.availability || body);

  try {
    const serialized = `${JSON.stringify(availability, null, 2)}\n`;

    await writeFile(CANONICAL_AVAILABILITY_PATH, serialized);
    await writeFile(PUBLIC_AVAILABILITY_PATH, serialized);

    return noStoreJson({
      ok: true,
      availability,
      source: "data/joe-tech-status.json",
      publicMirror: "public/data/joe-tech-status.json"
    });
  } catch (error) {
    return noStoreJson({ error: error.message }, { status: 500 });
  }
}

async function loadAvailability() {
  const file = await readFile(CANONICAL_AVAILABILITY_PATH, "utf8");
  return normalizeAvailabilityPayload(JSON.parse(file));
}

function normalizeAvailabilityPayload(value) {
  const availability = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const status = ALLOWED_STATUSES.has(availability.status) ? availability.status : "unavailable";
  const {
    status: _status,
    trackerEnabled,
    ...rest
  } = availability;

  return {
    status,
    trackerEnabled: trackerEnabled !== false,
    ...rest
  };
}

function requireAdminAccess(request) {
  if (process.env.KWP_ADMIN_ENABLED !== "true") {
    return noStoreJson({ error: "Availability admin API is disabled." }, { status: 404 });
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

function noStoreJson(body, init = {}) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");

  return response;
}
