# KWP 2.0 Portal Admin Roadmap

## Goal

Make the portal self-sufficient for routine Market Center updates. The long-term system should let approved staff manage content, documents, media links, and future page modules from inside the portal without touching GitHub, Node, or code.

## Guiding Rules

- Keep public portal changes intentional and reviewable.
- Keep staging separate from the live `portal.kwleadingedge.com` domain.
- Keep GitHub workflows manual.
- Prefer structured modules over freeform page building.
- Use approved layouts so new content still matches the portal.
- Use Google Drive or YouTube for large files and videos instead of storing them in the repo.

## Access Model

Portal access:

- Cira 7.5 remains the normal portal login path.

Editor access:

- Add a subtle Admin button near the logout area.
- Clicking Admin opens a Google sign-in gate.
- Only approved Google accounts can enter the editor.
- The Market Center main Google account should be the owner account.
- Owner/admin users can eventually add or remove other authorized Google accounts.

Safety fallback:

- Keep an environment-configured owner email so the team cannot lock itself out if the editable authorized list is misconfigured.

## Editor Experience

Initial editor:

- Separate route at `/admin/content/`.
- Section-based forms for existing portal content.
- Validation before save.
- JSON-backed staging storage while workflows are proven.
- Admin disabled by default.

Future editor:

- Visual edit route at `/admin/visual/`.
- Render the actual portal in edit mode.
- Show section outlines, top editor controls, and a side inspector.
- Preview changes before publishing.
- Add, hide, show, and reorder homepage sections.
- Add approved modules from a standardized module library.
- Manage document and media links from Google Drive or YouTube.
- Manage authorized editor accounts.

## Module Builder Direction

The portal should eventually render the homepage from an ordered list of modules:

- Courses
- Office information
- Vendors
- Leadership
- Brand assets
- Custom module sections

Approved module types:

- Tile Grid
- Link Cards
- Document Cards
- Photo Cards
- Video Embed
- Listing Carousel
- Announcement Banner
- Calendar Embed
- Resource Hub

Staff should be able to add new sections when they fit an existing module type. A developer should only be needed when a brand-new module type or integration is required.

## Storage Direction

Current phase:

- Structured content in `data/portal-content.json`.
- Public mirror in `public/data/portal-content.json`.
- Existing static files stay in the repo if they are small enough.

Future phase:

- Database for editable content and module layouts.
- Google Drive links for office documents and large PDFs.
- YouTube or Drive embeds for video.
- Optional object storage only if Drive/YouTube no longer fits the workflow.

## Recommended Implementation Order

1. Add the portal Admin button as the editor entry point.
2. Refactor the current admin editor into smaller components.
3. Add admin account and Google sign-in architecture docs.
4. Add Google sign-in for editor access.
5. Add authorized editor account management.
6. Define the module schema for future custom sections.
7. Build a preview workflow.
8. Move from JSON storage to database/storage only after the editor workflow is approved.

## Current Near-Term Work

The next technical focus is maintainability:

- Split the large admin client into smaller section editors.
- Keep behavior unchanged.
- Keep validation/build checks green after every slice.
- Avoid changing public portal markup or styling during this refactor.
