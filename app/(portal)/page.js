import { LegacyPortalPage } from "@/components/LegacyPage";
import { PortalScripts } from "@/components/PortalScripts";
import { createPortalMetadata } from "@/lib/metadata";

export const dynamic = "force-static";

export const metadata = createPortalMetadata({
  title: "KW Leading Edge Agent Portal",
  description: "Office resources, training, and daily tools for Keller Williams Leading Edge agents.",
  path: "/"
});

export default function HomePage() {
  return (
    <>
      <LegacyPortalPage source="index.html" pageKey="home" />
      <PortalScripts includeTockify />
    </>
  );
}
