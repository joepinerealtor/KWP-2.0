import { notFound } from "next/navigation";
import { VisualEditorOverlay } from "@/components/admin/VisualEditorOverlay";
import { LegacyPortalPage } from "@/components/LegacyPage";
import { PortalScripts } from "@/components/PortalScripts";
import portalContent from "@/data/portal-content.json";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "KWP Visual Editor"
};

export default function VisualAdminPage() {
  if (process.env.KWP_ADMIN_ENABLED !== "true") {
    notFound();
  }

  return (
    <div className="visual-editor-mode">
      <LegacyPortalPage source="index.html" pageKey="home" />
      <VisualEditorOverlay initialContent={portalContent} />
      <PortalScripts includeTockify />
    </div>
  );
}
