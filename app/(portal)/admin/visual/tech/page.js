import { notFound } from "next/navigation";
import { VisualEditorOverlay } from "@/components/admin/VisualEditorOverlay";
import { LegacyPortalPage } from "@/components/LegacyPage";
import { PortalScripts } from "@/components/PortalScripts";
import portalContent from "@/data/portal-content.json";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "KWP Visual Editor - Tech Connect"
};

export default function TechVisualAdminPage() {
  if (process.env.KWP_ADMIN_ENABLED !== "true") {
    notFound();
  }

  return (
    <div className="visual-editor-mode">
      <LegacyPortalPage source="tech/index.html" pageKey="tech" />
      <VisualEditorOverlay
        currentEditorPage="tech"
        initialContent={portalContent}
        initialSectionId="overview"
        previewHref="/tech/"
      />
      <PortalScripts />
    </div>
  );
}
