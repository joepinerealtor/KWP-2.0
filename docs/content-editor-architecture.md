# KWP 2.0 Content Editor Architecture

## Purpose

Track the staging-only content editor architecture for KWP 2.0. The migration goal is easier portal maintenance without connecting the staging repo to `portal.kwleadingedge.com`, redesigning the experience, or changing the public portal surface before it is ready.

## Current State

- The portal renders through Next.js App Router.
- Page chrome is componentized.
- Repeated portal content is backed by structured data in `data/portal-content.json`.
- The public runtime mirror is `public/data/portal-content.json`.
- The staging-only content admin route exists at `/admin/content/`.
- The admin route and API return 404 unless `KWP_ADMIN_ENABLED=true`.
- Admin saves are guarded by `KWP_ADMIN_PASSCODE`.
- Public portal parity remains the phase 1 constraint.

## Content Source Model

Canonical editable source:

- `data/portal-content.json`

Public runtime mirror:

- `public/data/portal-content.json`

Rules:

- Treat `data/portal-content.json` as canonical.
- Sync `public/data/portal-content.json` from the canonical file.
- Do not hand-edit both files independently.
- Keep JSON changes reviewable in Git before any publishing decision.

## Editable Content Groups

The first editor pass now covers these structured groups:

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

## Admin Scope

This is a staging-only internal editor, not a public CMS.

Current capabilities:

- Load current structured content by section
- Edit fields for all first-pass content groups
- Add, remove, and reorder repeated items
- Toggle active states where the portal data supports them
- Validate required fields before saving
- Preview JSON for each section
- Save the full canonical content file through a guarded API
- Back up the canonical JSON before save
- Sync the public JSON mirror after changed saves

Out of scope for this pass:

- User roles
- Database migrations
- Media uploads
- Full visual page builder
- Live production publishing

## Access Control

Environment variables:

- `KWP_ADMIN_ENABLED`
- `KWP_ADMIN_PASSCODE`

Safety behavior:

- `/admin/content/` returns 404 when disabled.
- `/api/admin/content/` returns 404 when disabled.
- The API accepts the passcode through `x-kwp-admin-passcode` or `Authorization: Bearer`.
- Passcode checks use a timing-safe comparison.
- Do not deploy or enable this route on the live domain until a stronger auth and publishing plan exists.

## Save Workflow

1. Load canonical JSON from `data/portal-content.json`.
2. Edit one or more sections in the staging admin.
3. Validate the full content object.
4. Back up the current canonical file in `data/.backups/`.
5. Write pretty-printed JSON to `data/portal-content.json`.
6. Copy the same content to `public/data/portal-content.json`.
7. Show save status with changed flag, backup path, source path, and mirror path.
8. Run `npm.cmd run content:validate` and `npm.cmd run build`.
9. Commit and push after checks pass.

## Deployment Safety

Rules for this phase:

- Work only in the staging repo.
- Do not connect to `portal.kwleadingedge.com`.
- Do not enable automatic production publishing.
- Keep GitHub workflows manual.
- Require build success and visual parity before deployment decisions.
- Keep the admin disabled by default.

## Database Decision Point

Do not introduce a database yet. The Git-backed JSON editor is the lower-risk architecture while workflows are still being proven.

A database may make sense later if:

- Multiple people need simultaneous editing.
- Approval workflows are required.
- Image/file uploads need to be managed inside the editor.
- Audit history must exist outside Git.
- Production publishing needs one-click promotion.

## Next Safe Architecture Slices

Recommended order:

1. Split the large admin client into smaller section components.
2. Extract shared admin form controls and validation helpers.
3. Add focused editor tests or smoke checks for guarded admin behavior.
4. Add a preview workflow for reviewing content changes before save.
5. Revisit database storage only after the JSON editor workflow is approved.
