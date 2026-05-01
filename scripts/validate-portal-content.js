const { loadPortalContent, validatePortalContent } = require("../lib/portal-content");

try {
  validatePortalContent(loadPortalContent());
  console.log("Portal content is valid.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
