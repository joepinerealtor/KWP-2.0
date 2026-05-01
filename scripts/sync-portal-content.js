const { syncPortalContent } = require("../lib/portal-content");

try {
  syncPortalContent();
  console.log("Synced data/portal-content.json to public/data/portal-content.json.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
