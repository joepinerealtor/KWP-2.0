import path from "node:path";
import { noStoreJson, requireAdminAccess } from "@/lib/admin-access";
import portalContent from "../../../../lib/portal-content";

const {
  CANONICAL_CONTENT_PATH,
  DRAFT_CONTENT_PATH,
  PUBLIC_CONTENT_PATH,
  loadDraftPortalContent,
  loadPortalContent,
  publishPortalContent,
  savePortalDraft,
  savePortalContent,
  validatePortalContent
} = portalContent;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET(request) {
  const access = requireAdminAccess(request, {
    disabledMessage: "Content admin API is disabled."
  });

  if (access) {
    return access;
  }

  const draft = loadDraftPortalContent();

  return noStoreJson({
    content: draft.content,
    hasDraft: draft.hasDraft,
    source: toRepoPath(draft.sourcePath)
  });
}

export async function PUT(request) {
  const access = requireAdminAccess(request, {
    disabledMessage: "Content admin API is disabled."
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

  const content = extractContentPayload(body);

  try {
    validatePortalContent(content);
  } catch (error) {
    return validationErrorResponse(error);
  }

  try {
    const mode = body?.mode === "publish" ? "publish" : body?.mode === "live" ? "live" : "draft";
    const result = mode === "publish"
      ? publishPortalContent(content)
      : mode === "live"
      ? savePortalContent(content)
      : savePortalDraft(content);

    return noStoreJson({
      ok: true,
      mode,
      backup: toRepoPath(result.backupPath),
      changed: result.changed,
      source: toRepoPath(result.draftPath || result.canonicalPath),
      publicMirror: toRepoPath(result.publicPath)
    });
  } catch (error) {
    if (error.validationErrors) {
      return validationErrorResponse(error);
    }

    return noStoreJson({ error: error.message }, { status: 500 });
  }
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

function toRepoPath(filePath) {
  if (!filePath) {
    return null;
  }

  if (filePath === CANONICAL_CONTENT_PATH) {
    return "data/portal-content.json";
  }

  if (filePath === DRAFT_CONTENT_PATH) {
    return "data/portal-content.draft.json";
  }

  if (filePath === PUBLIC_CONTENT_PATH) {
    return "public/data/portal-content.json";
  }

  return `data/.backups/${path.basename(filePath)}`;
}
