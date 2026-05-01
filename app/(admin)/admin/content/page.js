import { notFound } from "next/navigation";
import { ContentAdminClient } from "@/components/admin/ContentAdminClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function ContentAdminPage() {
  if (process.env.KWP_ADMIN_ENABLED !== "true") {
    notFound();
  }

  return <ContentAdminClient />;
}
