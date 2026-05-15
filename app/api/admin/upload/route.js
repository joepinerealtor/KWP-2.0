import { noStoreJson, requireAdminAccess } from "@/lib/admin-access";
import { saveAdminMediaUpload } from "@/lib/admin-media-storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  const access = requireAdminAccess(request, {
    disabledMessage: "Upload API is disabled."
  });

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
  const folder = formData.get("folder") || "uploads";

  try {
    const result = await saveAdminMediaUpload({ file, folder });

    return noStoreJson({
      ok: true,
      path: result.path
    });
  } catch (error) {
    return noStoreJson({ error: error.message }, { status: error.status || 500 });
  }
}
