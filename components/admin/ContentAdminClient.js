"use client";

import { useMemo, useState } from "react";

const SECTION_DEFINITIONS = [
  { id: "courses", label: "Courses", path: ["courses"], type: "array" },
  { id: "vendors", label: "Vendors", path: ["vendors"], type: "array" },
  { id: "leadership", label: "Leadership", path: ["leadership"], type: "array" },
  { id: "marketingTools", label: "Marketing Tools", path: ["brandAssets", "marketingTools"], type: "array" },
  { id: "digitalLogos", label: "Digital Logos", path: ["brandAssets", "digitalLogos"], type: "array" },
  { id: "sourceFiles", label: "Source Files", path: ["brandAssets", "sourceFiles"], type: "array" },
  { id: "referenceHub", label: "Reference Hub", path: ["office", "referenceHub"], type: "object" },
  { id: "operations", label: "Office Operations", path: ["office", "operations"], type: "object" },
  { id: "marketingFiles", label: "Marketing Files", path: ["office", "marketingFiles"], type: "object" },
  { id: "rooms", label: "Rooms", path: ["office", "rooms"], type: "object" }
];

export function ContentAdminClient() {
  const [passcode, setPasscode] = useState("");
  const [adminPasscode, setAdminPasscode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [content, setContent] = useState(null);
  const [source, setSource] = useState("");
  const [activeSectionId, setActiveSectionId] = useState(SECTION_DEFINITIONS[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveResult, setSaveResult] = useState(null);

  const sections = useMemo(() => {
    if (!content) {
      return [];
    }

    return SECTION_DEFINITIONS.map((section) => {
      const value = getPathValue(content, section.path);
      const itemCount = Array.isArray(value) ? value.length : Object.keys(value || {}).length;

      return {
        ...section,
        itemCount,
        value
      };
    });
  }, [content]);

  const activeSection = sections.find((section) => section.id === activeSectionId) || sections[0];

  async function loadContent(event) {
    event?.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/content/", {
        cache: "no-store",
        headers: {
          "x-kwp-admin-passcode": passcode
        }
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to load content.");
      }

      setIsUnlocked(true);
      setAdminPasscode(passcode);
      setPasscode("");
      setContent(payload.content);
      setSource(payload.source || "");
      setActiveSectionId(SECTION_DEFINITIONS[0].id);
      setSaveError("");
      setSaveResult(null);
    } catch (loadError) {
      setContent(null);
      setSource("");
      setAdminPasscode("");
      setIsUnlocked(false);
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }

  function lock() {
    setIsUnlocked(false);
    setAdminPasscode("");
    setContent(null);
    setSource("");
    setError("");
    setSaveError("");
    setSaveResult(null);
    setPasscode("");
  }

  function updateCourse(index, field, value) {
    updateCourses((courses) => courses.map((course, courseIndex) => {
      if (courseIndex !== index) {
        return course;
      }

      return {
        ...course,
        [field]: value
      };
    }));
  }

  function addCourse() {
    updateCourses((courses) => [
      ...courses,
      {
        id: createCourseId(courses),
        tag: "",
        title: "",
        summary: "",
        href: "",
        external: true,
        active: true
      }
    ]);
  }

  function removeCourse(index) {
    updateCourses((courses) => courses.filter((_, courseIndex) => courseIndex !== index));
  }

  function moveCourse(index, direction) {
    updateCourses((courses) => {
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= courses.length) {
        return courses;
      }

      const nextCourses = [...courses];
      [nextCourses[index], nextCourses[nextIndex]] = [nextCourses[nextIndex], nextCourses[index]];

      return nextCourses;
    });
  }

  function updateCourses(getNextCourses) {
    setContent((currentContent) => {
      if (!currentContent?.courses) {
        return currentContent;
      }

      return {
        ...currentContent,
        courses: getNextCourses(currentContent.courses)
      };
    });
    setSaveError("");
    setSaveResult(null);
  }

  function updateVendor(index, field, value) {
    setContent((currentContent) => {
      if (!currentContent?.vendors?.[index]) {
        return currentContent;
      }

      return {
        ...currentContent,
        vendors: currentContent.vendors.map((vendor, vendorIndex) => {
          if (vendorIndex !== index) {
            return vendor;
          }

          return {
            ...vendor,
            [field]: value
          };
        })
      };
    });
    setSaveError("");
    setSaveResult(null);
  }

  async function saveDrafts(sectionId, sectionLabel) {
    if (!content) {
      return;
    }

    setIsSaving(true);
    setSaveError("");
    setSaveResult(null);

    try {
      const response = await fetch("/api/admin/content/", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-kwp-admin-passcode": adminPasscode
        },
        body: JSON.stringify({ content })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.validationErrors?.join(" ") || payload.error || `Unable to save ${sectionLabel.toLowerCase()} drafts.`);
      }

      setSaveResult({
        ...payload,
        sectionId,
        sectionLabel
      });
    } catch (saveRequestError) {
      setSaveError(saveRequestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function saveCourseDrafts() {
    await saveDrafts("courses", "Course");
  }

  async function saveVendorDrafts() {
    await saveDrafts("vendors", "Vendor");
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="admin-kicker">KWP 2.0 staging</p>
          <h1>Content Admin</h1>
        </div>
        {isUnlocked ? (
          <button className="admin-button admin-button--secondary" type="button" onClick={lock}>
            Lock
          </button>
        ) : null}
      </header>

      {!content ? (
        <section className="admin-panel admin-login" aria-labelledby="admin-login-heading">
          <div>
            <p className="admin-kicker">Access</p>
            <h2 id="admin-login-heading">Enter passcode</h2>
          </div>
          <form className="admin-login-form" onSubmit={loadContent}>
            <label htmlFor="admin-passcode">Passcode</label>
            <input
              id="admin-passcode"
              type="password"
              value={passcode}
              autoComplete="current-password"
              onChange={(event) => setPasscode(event.target.value)}
            />
            <button className="admin-button" type="submit" disabled={!passcode || isLoading}>
              {isLoading ? "Loading" : "Open"}
            </button>
          </form>
          {error ? <p className="admin-error">{error}</p> : null}
        </section>
      ) : (
        <section className="admin-workspace" aria-label="Content workspace">
          <aside className="admin-sidebar">
            <div className="admin-source">
              <span>Source</span>
              <strong>{source}</strong>
            </div>
            <nav className="admin-section-nav" aria-label="Content sections">
              {sections.map((section) => (
                <button
                  className={section.id === activeSection?.id ? "is-active" : ""}
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSectionId(section.id)}
                >
                  <span>{section.label}</span>
                  <strong>{section.itemCount}</strong>
                </button>
              ))}
            </nav>
          </aside>

          <div className="admin-panel admin-reader">
            <div className="admin-reader-header">
              <div>
                <p className="admin-kicker">{isDraftFieldSection(activeSection?.id) ? "Draft fields" : "Read only"}</p>
                <h2>{activeSection?.label}</h2>
              </div>
              <span>{activeSection?.type}</span>
            </div>
            <SectionReader
              isSaving={isSaving}
              onAddCourse={addCourse}
              onMoveCourse={moveCourse}
              onRemoveCourse={removeCourse}
              onSaveCourseDrafts={saveCourseDrafts}
              onSaveVendorDrafts={saveVendorDrafts}
              onUpdateCourse={updateCourse}
              onUpdateVendor={updateVendor}
              saveError={saveError}
              saveResult={saveResult}
              section={activeSection}
            />
          </div>
        </section>
      )}
    </main>
  );
}

function SectionReader({
  isSaving,
  onAddCourse,
  onMoveCourse,
  onRemoveCourse,
  onSaveCourseDrafts,
  onSaveVendorDrafts,
  onUpdateCourse,
  onUpdateVendor,
  saveError,
  saveResult,
  section
}) {
  if (section?.id === "courses") {
    return (
      <CourseFields
        isSaving={isSaving}
        items={section.value || []}
        onAddCourse={onAddCourse}
        onMoveCourse={onMoveCourse}
        onRemoveCourse={onRemoveCourse}
        onSaveCourseDrafts={onSaveCourseDrafts}
        onUpdateCourse={onUpdateCourse}
        saveError={saveError}
        saveResult={saveResult}
      />
    );
  }

  if (section?.id === "vendors") {
    return (
      <VendorFields
        isSaving={isSaving}
        items={section.value || []}
        onSaveVendorDrafts={onSaveVendorDrafts}
        onUpdateVendor={onUpdateVendor}
        saveError={saveError}
        saveResult={saveResult}
      />
    );
  }

  return <pre className="admin-json">{JSON.stringify(section?.value, null, 2)}</pre>;
}

function CourseFields({
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

function AdminTextField({ label, onChange, value = "" }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input type="text" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function VendorFields({
  isSaving,
  items,
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
        <span className={validationErrors.length ? "admin-status admin-status--error" : "admin-status admin-status--ok"}>
          {validationErrors.length ? `${validationErrors.length} issue${validationErrors.length === 1 ? "" : "s"}` : "Valid draft"}
        </span>
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
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={Boolean(vendor.active)}
                  onChange={(event) => onUpdateVendor(index, "active", event.target.checked)}
                />
                Active
              </label>
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

function AdminTextArea({ label, onChange, value = "" }) {
  return (
    <label className="admin-field admin-field--full">
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} />
    </label>
  );
}

function getPathValue(value, path) {
  return path.reduce((current, key) => current?.[key], value);
}

function isDraftFieldSection(sectionId) {
  return sectionId === "courses" || sectionId === "vendors";
}

function validateCourseDrafts(items) {
  const errors = [];
  const seenIds = new Map();

  items.forEach((course, index) => {
    const label = `Course ${index + 1}`;

    ["id", "tag", "title", "summary", "href"].forEach((field) => {
      if (!String(course[field] || "").trim()) {
        errors.push(`${label}: ${field} is required.`);
      }
    });

    const id = String(course.id || "").trim();

    if (id) {
      if (seenIds.has(id)) {
        errors.push(`${label}: id duplicates Course ${seenIds.get(id) + 1}.`);
      } else {
        seenIds.set(id, index);
      }
    }
  });

  return errors;
}

function validateVendorDrafts(items) {
  const errors = [];
  const seenIds = new Map();

  items.forEach((vendor, index) => {
    const label = `Vendor ${index + 1}`;

    ["id", "section", "business", "logo", "name", "notes"].forEach((field) => {
      if (!String(vendor[field] || "").trim()) {
        errors.push(`${label}: ${field} is required.`);
      }
    });

    const id = String(vendor.id || "").trim();

    if (id) {
      if (seenIds.has(id)) {
        errors.push(`${label}: id duplicates Vendor ${seenIds.get(id) + 1}.`);
      } else {
        seenIds.set(id, index);
      }
    }
  });

  return errors;
}

function createCourseId(courses) {
  const ids = new Set(courses.map((course) => course.id));
  let index = courses.length + 1;
  let id = `new-course-${index}`;

  while (ids.has(id)) {
    index += 1;
    id = `new-course-${index}`;
  }

  return id;
}
