import { LegacyPortalPage } from "@/components/LegacyPage";
import { PortalScripts } from "@/components/PortalScripts";
import { createPortalMetadata } from "@/lib/metadata";

export const dynamic = "force-static";

export const metadata = createPortalMetadata({
  title: "KW Leading Edge Tech Connect",
  description: "Tech support, PaperCut Hive access, Joe Pine help, and KW Answers shortcuts for Keller Williams Leading Edge agents.",
  path: "/tech/"
});

export default function TechConnectPage() {
  return (
    <>
      <LegacyPortalPage source="tech/index.html" pageKey="tech" />
      <PortalScripts />
    </>
  );
}
