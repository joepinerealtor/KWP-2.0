import { legacyHtmlResponse } from "@/lib/legacy-route";

export const dynamic = "force-static";

export function GET() {
  return legacyHtmlResponse("_drafts/lone-wolf-transition-hub.html");
}
