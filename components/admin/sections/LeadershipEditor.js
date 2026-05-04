"use client";

import { AdminTextField } from "../AdminFields";
import { validateLeadershipDrafts } from "../contentDrafts";

export function LeadershipEditor({
  isSaving,
  items,
  onAddLeadership,
  onMoveLeadership,
  onRemoveLeadership,
  onSaveLeadershipDrafts,
  onUpdateLeadership,
  saveError,
  saveResult
}) {
  const validationErrors = validateLeadershipDrafts(items);
  const activeSaveResult = saveResult?.sectionId === "leadership" ? saveResult : null;

  return (
    <div className="admin-form-preview">
      <div className="admin-form-preview__summary">
        <div>
          <strong>{items.length}</strong>
          <span>leadership profiles</span>
        </div>
        <div className="admin-summary-actions">
          <span className={validationErrors.length ? "admin-status admin-status--error" : "admin-status admin-status--ok"}>
            {validationErrors.length ? `${validationErrors.length} issue${validationErrors.length === 1 ? "" : "s"}` : "Valid draft"}
          </span>
          <button className="admin-button admin-button--secondary" type="button" onClick={onAddLeadership}>
            Add Leader
          </button>
        </div>
      </div>
      {validationErrors.length ? (
        <div className="admin-validation" role="status">
          <h3>Leadership validation</h3>
          <ul>
            {validationErrors.map((validationError) => (
              <li key={validationError}>{validationError}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="admin-save-row">
        <button
          className="admin-button"
          disabled={Boolean(validationErrors.length) || isSaving}
          type="button"
          onClick={onSaveLeadershipDrafts}
        >
          {isSaving ? "Saving" : "Save Leadership Drafts"}
        </button>
        <span>Writes only after validation, backup, and API passcode check.</span>
      </div>
      {saveError ? <p className="admin-save-message admin-save-message--error">{saveError}</p> : null}
      {activeSaveResult ? (
        <div className="admin-save-message admin-save-message--success" role="status">
          <strong>{activeSaveResult.changed ? "Leadership drafts saved." : "No content changes detected."}</strong>
          <span>Backup: {activeSaveResult.backup}</span>
          <span>Source: {activeSaveResult.source}</span>
          <span>Mirror: {activeSaveResult.publicMirror}</span>
        </div>
      ) : null}
      <div className="admin-course-list">
        {items.map((person, index) => (
          <article className="admin-course-item" key={person.id || index}>
            <div className="admin-course-item__header">
              <span>Leader {index + 1}</span>
              <div className="admin-course-controls">
                <button
                  className="admin-icon-button"
                  disabled={index === 0}
                  type="button"
                  onClick={() => onMoveLeadership(index, -1)}
                  aria-label={`Move Leader ${index + 1} up`}
                >
                  Up
                </button>
                <button
                  className="admin-icon-button"
                  disabled={index === items.length - 1}
                  type="button"
                  onClick={() => onMoveLeadership(index, 1)}
                  aria-label={`Move Leader ${index + 1} down`}
                >
                  Down
                </button>
                <button
                  className="admin-icon-button admin-icon-button--danger"
                  type="button"
                  onClick={() => onRemoveLeadership(index)}
                  aria-label={`Remove Leader ${index + 1}`}
                >
                  Remove
                </button>
                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={Boolean(person.featured)}
                    onChange={(event) => onUpdateLeadership(index, "featured", event.target.checked)}
                  />
                  Featured
                </label>
                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={Boolean(person.active)}
                    onChange={(event) => onUpdateLeadership(index, "active", event.target.checked)}
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="admin-field-grid">
              <AdminTextField
                label="ID"
                value={person.id}
                onChange={(value) => onUpdateLeadership(index, "id", value)}
              />
              <AdminTextField
                label="Group"
                value={person.group}
                onChange={(value) => onUpdateLeadership(index, "group", value)}
              />
              <AdminTextField
                label="Role"
                value={person.role}
                onChange={(value) => onUpdateLeadership(index, "role", value)}
              />
              <AdminTextField
                label="Name"
                value={person.name}
                onChange={(value) => onUpdateLeadership(index, "name", value)}
              />
              <AdminTextField
                label="Photo"
                value={person.photo}
                onChange={(value) => onUpdateLeadership(index, "photo", value)}
              />
              <AdminTextField
                label="Email"
                value={person.email}
                onChange={(value) => onUpdateLeadership(index, "email", value)}
              />
              <AdminTextField
                label="Phone"
                value={person.phone}
                onChange={(value) => onUpdateLeadership(index, "phone", value)}
              />
              <AdminTextField
                label="Notes"
                value={person.notes}
                onChange={(value) => onUpdateLeadership(index, "notes", value)}
              />
            </div>
          </article>
        ))}
      </div>
      <details className="admin-draft-json">
        <summary>Leadership JSON preview</summary>
        <pre className="admin-json">{JSON.stringify(items, null, 2)}</pre>
      </details>
    </div>
  );
}
