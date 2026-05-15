import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { noStoreJson, requireAdminAccess } from "@/lib/admin-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CANONICAL_AVAILABILITY_PATH = path.join(process.cwd(), "data", "joe-tech-status.json");
const PUBLIC_AVAILABILITY_PATH = path.join(process.cwd(), "public", "data", "joe-tech-status.json");
const ALLOWED_STATUSES = new Set(["available", "available_now", "unavailable"]);

export async function GET(request) {
  const access = requireAdminAccess(request, {
    disabledMessage: "Availability admin API is disabled."
  });

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
  const access = requireAdminAccess(request, {
    disabledMessage: "Availability admin API is disabled."
  });

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
