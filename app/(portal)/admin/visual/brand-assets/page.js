import { notFound } from "next/navigation";
import { VisualEditorOverlay } from "@/components/admin/VisualEditorOverlay";
import { LegacyPortalPage } from "@/components/LegacyPage";
import { PortalScripts } from "@/components/PortalScripts";
import portalContent from "@/data/portal-content.json";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "KWP Visual Editor - Brand Assets"
};

export default function BrandAssetsVisualAdminPage() {
  if (process.env.KWP_ADMIN_ENABLED !== "true") {
    notFound();
  }

  return (
    <div className="visual-editor-mode">
      <LegacyPortalPage source="brand-assets.html" pageKey="brandAssets" />
      <VisualEditorOverlay
        currentEditorPage="brandAssets"
        initialContent={portalContent}
        initialSectionId="brandAssets"
        previewHref="/brand-assets.html"
      />
      <PortalScripts includeTockify={false} />
    </div>
  );
}
