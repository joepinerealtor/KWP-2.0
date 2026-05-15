import crypto from "node:crypto";
import { NextResponse } from "next/server";

export function requireAdminAccess(request, options = {}) {
  const {
    disabledMessage = "Admin API is disabled.",
    unauthorizedMessage = "Valid admin passcode required."
  } = options;

  if (process.env.KWP_ADMIN_ENABLED !== "true") {
    return noStoreJson({ error: disabledMessage }, { status: 404 });
  }

  if (!isAuthorizedAdminRequest(request)) {
    return noStoreJson({ error: unauthorizedMessage }, { status: 401 });
  }

  return null;
}

export function isAuthorizedAdminRequest(request) {
  const configuredPasscode = process.env.KWP_ADMIN_PASSCODE || "";

  if (!configuredPasscode) {
    return false;
  }

  const headerPasscode = request.headers.get("x-kwp-admin-passcode") || "";
  const authorization = request.headers.get("authorization") || "";
  const bearerPasscode = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

  return passcodeMatches(headerPasscode, configuredPasscode) || passcodeMatches(bearerPasscode, configuredPasscode);
}

export function noStoreJson(body, init = {}) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");

  return response;
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
