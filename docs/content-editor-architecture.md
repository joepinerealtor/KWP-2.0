# KWP 2.0 Content Editor Architecture

## Purpose

Plan the next migration phase for the safe KWP 2.0 staging repo. The goal is to make portal content easier to maintain without changing the live portal domain, redesigning the experience, or replacing the existing visual surface before it is ready.

## Current State

- The portal renders through Next.js App Router.
- The page chrome is componentized.
- Repeated content blocks are now backed by structured data in `data/portal-content.json`.
- The public browser script still reads `public/data/portal-content.json` for legacy client-side behavior.
- The visible portal experience must remain unchanged during this phase.

## Architecture Recommendation

Use a Git/JSON-backed editor first. Do not introduce a database yet.

This keeps the staging site static-friendly, easy to diff, easy to roll back, and aligned with the current deployment model. A database can come later once the edit workflows are proven.

## Content Source Model

Primary editable source:

- `data/portal-content.json`

Public runtime mirror:

- `public/data/portal-content.json`

Near-term rule:

- Treat `data/portal-content.json` as canonical.
- Generate or sync `public/data/portal-content.json` from the canonical file.
- Avoid hand-editing both files independently.

## Editable Content Groups

Initial editor sections should map directly to the existing structured data groups:

- `courses`
- `vendors`
- `leadership`
- `brandAssets.marketingTools`
- `brandAssets.digitalLogos`
- `brandAssets.sourceFiles`
- `office.referenceHub`
- `office.operations`
- `office.marketingFiles`
- `office.rooms`

Later editor sections can include:

- Quick links
- Navigation labels
- Portal lock settings
- Tech/help status content
- Calendar and handbook modal settings

## Admin UI Scope

First editor should be a staging-only internal tool, not a polished public CMS.

Minimum capabilities:

- View current structured content by section
- Add, edit, reorder, activate, and deactivate repeated items
- Validate required fields before saving
- Preview JSON changes before writing
- Save changes to the canonical content file
- Keep the public mirror synchronized

Do not include in the first pass:

- User roles
- Database migrations
- Media uploads
- Full visual page builder
- Live production publishing

## Validation Rules

Each editable section should have explicit validation before save.

Examples:

- Required `id` values must be unique within their group.
- Required display text cannot be blank.
- Links must include `href`.
- External links should carry `external: true`.
- Download links should carry `download: true`.
- Active flags should default to `true`.
- Image-backed cards must include both image `src` and `alt`.

## Proposed File Structure

Suggested first implementation:

- `lib/portal-content.js`
  - Load canonical content
  - Validate content
  - Write canonical content
  - Sync public mirror
- `lib/portal-content-schema.js`
  - Section-level validation helpers
  - Shared defaults
- `app/(admin)/admin/content/page.js`
  - Staging-only content editor shell
- `app/(admin)/admin/content/actions.js`
  - Server actions for saving JSON
- `components/admin/`
  - Small form components for repeated content groups

## Access Control

Do not expose the editor publicly without protection.

First safe option:

- Gate the admin route behind an environment variable passcode.
- Keep the route staging-only.
- Do not deploy it to the live domain until a stronger auth plan exists.

Environment variables:

- `KWP_ADMIN_ENABLED`
- `KWP_ADMIN_PASSCODE`

The editor should return `notFound()` or a locked screen when disabled.

## Save Workflow

First safe save flow:

1. Load canonical JSON from `data/portal-content.json`.
2. User edits one section.
3. Validate the edited section and full content object.
4. Write pretty-printed JSON to `data/portal-content.json`.
5. Copy the same content to `public/data/portal-content.json`.
6. Show a success message with changed section name.
7. User runs build and visually verifies before committing.

## Deployment Safety

Rules for this phase:

- Keep working only in the staging repo.
- Do not connect to `portal.kwleadingedge.com`.
- Do not enable automatic production publishing.
- Keep GitHub workflows manual.
- Require build success and visual parity before each commit.

## Database Decision Point

Only revisit a database after the JSON editor proves the workflows.

A database may make sense if:

- Multiple people need simultaneous editing.
- Content needs approval workflows.
- Image/file uploads need to be managed inside the editor.
- Audit history needs to exist outside Git.
- Production publishing needs one-click promotion.

Until then, Git-backed JSON is the lower-risk architecture.

## Next Implementation Slice

Build the content infrastructure without a UI first:

1. Add `lib/portal-content.js`.
2. Add validation helpers.
3. Add a sync script for `data/portal-content.json` to `public/data/portal-content.json`.
4. Add npm scripts for validation and sync.
5. Run build.
6. Commit.

After that, build the staging-only admin UI one section at a time.
