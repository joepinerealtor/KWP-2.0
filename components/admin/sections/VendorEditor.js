"use client";

import { AdminTextField } from "../AdminFields";
import { validateVendorDrafts } from "../contentDrafts";

export function VendorEditor({
  isSaving,
  items,
  onAddVendor,
  onMoveVendor,
  onRemoveVendor,
  onSaveVendorDrafts,
  onUpdateVendor,
  saveError,
  saveResult
}) {
  const validationErrors = validateVendorDrafts(items);
  const activeSaveResult = saveResult?.sectionId === "vendors" ? saveResult : null;

  return (
    <div className="admin-form-preview">
      <div className="admin-form-preview__summary">
        <div>
          <strong>{items.length}</strong>
          <span>vendor cards</span>
        </div>
        <div className="admin-summary-actions">
          <span className={validationErrors.length ? "admin-status admin-status--error" : "admin-status admin-status--ok"}>
            {validationErrors.length ? `${validationErrors.length} issue${validationErrors.length === 1 ? "" : "s"}` : "Valid draft"}
          </span>
          <button className="admin-button admin-button--secondary" type="button" onClick={onAddVendor}>
            Add Vendor
          </button>
        </div>
      </div>
      {validationErrors.length ? (
        <div className="admin-validation" role="status">
          <h3>Vendor validation</h3>
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
          onClick={onSaveVendorDrafts}
        >
          {isSaving ? "Saving" : "Save Vendor Drafts"}
        </button>
        <span>Writes only after validation, backup, and API passcode check.</span>
      </div>
      {saveError ? <p className="admin-save-message admin-save-message--error">{saveError}</p> : null}
      {activeSaveResult ? (
        <div className="admin-save-message admin-save-message--success" role="status">
          <strong>{activeSaveResult.changed ? "Vendor drafts saved." : "No content changes detected."}</strong>
          <span>Backup: {activeSaveResult.backup}</span>
          <span>Source: {activeSaveResult.source}</span>
          <span>Mirror: {activeSaveResult.publicMirror}</span>
        </div>
      ) : null}
      <div className="admin-course-list">
        {items.map((vendor, index) => (
          <article className="admin-course-item" key={vendor.id || index}>
            <div className="admin-course-item__header">
              <span>Vendor {index + 1}</span>
              <div className="admin-course-controls">
                <button
                  className="admin-icon-button"
                  disabled={index === 0}
                  type="button"
                  onClick={() => onMoveVendor(index, -1)}
                  aria-label={`Move Vendor ${index + 1} up`}
                >
                  Up
                </button>
                <button
                  className="admin-icon-button"
                  disabled={index === items.length - 1}
                  type="button"
                  onClick={() => onMoveVendor(index, 1)}
                  aria-label={`Move Vendor ${index + 1} down`}
                >
                  Down
                </button>
                <button
                  className="admin-icon-button admin-icon-button--danger"
                  type="button"
                  onClick={() => onRemoveVendor(index)}
                  aria-label={`Remove Vendor ${index + 1}`}
                >
                  Remove
                </button>
                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={Boolean(vendor.active)}
                    onChange={(event) => onUpdateVendor(index, "active", event.target.checked)}
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="admin-field-grid">
              <AdminTextField
                label="ID"
                value={vendor.id}
                onChange={(value) => onUpdateVendor(index, "id", value)}
              />
              <AdminTextField
                label="Section"
                value={vendor.section}
                onChange={(value) => onUpdateVendor(index, "section", value)}
              />
              <AdminTextField
                label="Business"
                value={vendor.business}
                onChange={(value) => onUpdateVendor(index, "business", value)}
              />
              <AdminTextField
                label="Contact Name"
                value={vendor.name}
                onChange={(value) => onUpdateVendor(index, "name", value)}
              />
              <AdminTextField
                label="Phone"
                value={vendor.phone}
                onChange={(value) => onUpdateVendor(index, "phone", value)}
              />
              <AdminTextField
                label="Email"
                value={vendor.email}
                onChange={(value) => onUpdateVendor(index, "email", value)}
              />
              <AdminTextField
                label="Logo"
                value={vendor.logo}
                onChange={(value) => onUpdateVendor(index, "logo", value)}
              />
              <AdminTextField
                label="Notes"
                value={vendor.notes}
                onChange={(value) => onUpdateVendor(index, "notes", value)}
              />
            </div>
          </article>
        ))}
      </div>
      <details className="admin-draft-json">
        <summary>Vendor JSON preview</summary>
        <pre className="admin-json">{JSON.stringify(items, null, 2)}</pre>
      </details>
    </div>
  );
}
