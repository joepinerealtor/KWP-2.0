"use client";

import { AdminTextArea, AdminTextField } from "../AdminFields";
import { validateCourseDrafts } from "../contentDrafts";

export function CourseEditor({
  isSaving,
  items,
  onAddCourse,
  onMoveCourse,
  onRemoveCourse,
  onSaveCourseDrafts,
  onUpdateCourse,
  saveError,
  saveResult
}) {
  const validationErrors = validateCourseDrafts(items);
  const activeSaveResult = saveResult?.sectionId === "courses" ? saveResult : null;

  return (
    <div className="admin-form-preview">
      <div className="admin-form-preview__summary">
        <div>
          <strong>{items.length}</strong>
          <span>course cards</span>
        </div>
        <div className="admin-summary-actions">
          <span className={validationErrors.length ? "admin-status admin-status--error" : "admin-status admin-status--ok"}>
            {validationErrors.length ? `${validationErrors.length} issue${validationErrors.length === 1 ? "" : "s"}` : "Valid draft"}
          </span>
          <button className="admin-button admin-button--secondary" type="button" onClick={onAddCourse}>
            Add Course
          </button>
        </div>
      </div>
      {validationErrors.length ? (
        <div className="admin-validation" role="status">
          <h3>Course validation</h3>
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
          onClick={onSaveCourseDrafts}
        >
          {isSaving ? "Saving" : "Save Course Drafts"}
        </button>
        <span>Writes only after validation, backup, and API passcode check.</span>
      </div>
      {saveError ? <p className="admin-save-message admin-save-message--error">{saveError}</p> : null}
      {activeSaveResult ? (
        <div className="admin-save-message admin-save-message--success" role="status">
          <strong>{activeSaveResult.changed ? "Course drafts saved." : "No content changes detected."}</strong>
          <span>Backup: {activeSaveResult.backup}</span>
          <span>Source: {activeSaveResult.source}</span>
          <span>Mirror: {activeSaveResult.publicMirror}</span>
        </div>
      ) : null}
      <div className="admin-course-list">
        {items.map((course, index) => (
          <article className="admin-course-item" key={course.id || index}>
            <div className="admin-course-item__header">
              <span>Course {index + 1}</span>
              <div className="admin-course-controls">
                <button
                  className="admin-icon-button"
                  disabled={index === 0}
                  type="button"
                  onClick={() => onMoveCourse(index, -1)}
                  aria-label={`Move Course ${index + 1} up`}
                >
                  Up
                </button>
                <button
                  className="admin-icon-button"
                  disabled={index === items.length - 1}
                  type="button"
                  onClick={() => onMoveCourse(index, 1)}
                  aria-label={`Move Course ${index + 1} down`}
                >
                  Down
                </button>
                <button
                  className="admin-icon-button admin-icon-button--danger"
                  type="button"
                  onClick={() => onRemoveCourse(index)}
                  aria-label={`Remove Course ${index + 1}`}
                >
                  Remove
                </button>
                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={Boolean(course.active)}
                    onChange={(event) => onUpdateCourse(index, "active", event.target.checked)}
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="admin-field-grid">
              <AdminTextField
                label="ID"
                value={course.id}
                onChange={(value) => onUpdateCourse(index, "id", value)}
              />
              <AdminTextField
                label="Tag"
                value={course.tag}
                onChange={(value) => onUpdateCourse(index, "tag", value)}
              />
              <AdminTextField
                label="Title"
                value={course.title}
                onChange={(value) => onUpdateCourse(index, "title", value)}
              />
              <AdminTextField
                label="URL"
                value={course.href}
                onChange={(value) => onUpdateCourse(index, "href", value)}
              />
            </div>
            <AdminTextArea
              label="Summary"
              value={course.summary}
              onChange={(value) => onUpdateCourse(index, "summary", value)}
            />
            <div className="admin-flag-row">
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={Boolean(course.external)}
                  onChange={(event) => onUpdateCourse(index, "external", event.target.checked)}
                />
                External link
              </label>
            </div>
          </article>
        ))}
      </div>
      <details className="admin-draft-json">
        <summary>Draft JSON preview</summary>
        <pre className="admin-json">{JSON.stringify(items, null, 2)}</pre>
      </details>
    </div>
  );
}
