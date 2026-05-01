import path from "node:path";
import { NextResponse } from "next/server";
import portalContent from "../../../../lib/portal-content";

const {
  CANONICAL_CONTENT_PATH,
  PUBLIC_CONTENT_PATH,
  loadPortalContent,
  savePortalContent,
  validatePortalContent
} = portalContent;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DISABLED_RESPONSE = {
  error: "Content admin API is disabled."
};

export function GET(request) {
  const access = requireAdminAccess(request);

  if (access) {
    return access;
  }

  return noStoreJson({
    content: loadPortalContent(),
    source: toRepoPath(CANONICAL_CONTENT_PATH)
  });
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

  const content = extractContentPayload(body);

  try {
    validatePortalContent(content);
  } catch (error) {
    return validationErrorResponse(error);
  }

  try {
    const result = savePortalContent(content);

    return noStoreJson({
      ok: true,
      backup: toRepoPath(result.backupPath),
      source: toRepoPath(result.canonicalPath),
      publicMirror: toRepoPath(result.publicPath)
    });
  } catch (error) {
    if (error.validationErrors) {
      return validationErrorResponse(error);
    }

    return noStoreJson({ error: error.message }, { status: 500 });
  }
}

function requireAdminAccess(request) {
  if (process.env.KWP_ADMIN_ENABLED !== "true") {
    return noStoreJson(DISABLED_RESPONSE, { status: 404 });
  }

  if (!isAuthorized(request)) {
    return noStoreJson({ error: "Valid admin passcode required." }, { status: 401 });
  }

  return null;
}

function isAuthorized(request) {
  const configuredPasscode = process.env.KWP_ADMIN_PASSCODE || "";

  if (!configuredPasscode) {
    return false;
  }

  const headerPasscode = request.headers.get("x-kwp-admin-passcode") || "";
  const authorization = request.headers.get("authorization") || "";
  const bearerPasscode = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

  return headerPasscode === configuredPasscode || bearerPasscode === configuredPasscode;
}

function extractContentPayload(body) {
  if (body && typeof body === "object" && !Array.isArray(body) && body.content) {
    return body.content;
  }

  return body;
}

function validationErrorResponse(error) {
  return noStoreJson({
    error: "Portal content validation failed.",
    validationErrors: error.validationErrors || [error.message]
  }, { status: 422 });
}

function noStoreJson(body, init = {}) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");

  return response;
}

function toRepoPath(filePath) {
  if (!filePath) {
    return null;
  }

  if (filePath === CANONICAL_CONTENT_PATH) {
    return "data/portal-content.json";
  }

  if (filePath === PUBLIC_CONTENT_PATH) {
    return "public/data/portal-content.json";
  }

  return `data/.backups/${path.basename(filePath)}`;
}
