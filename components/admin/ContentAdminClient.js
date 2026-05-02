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
    updateVendors((vendors) => vendors.map((vendor, vendorIndex) => {
      if (vendorIndex !== index) {
        return vendor;
      }

      return {
        ...vendor,
        [field]: value
      };
    }));
  }

  function addVendor() {
    updateVendors((vendors) => [
      ...vendors,
      {
        id: createVendorId(vendors),
        section: "",
        business: "",
        logo: "",
        name: "",
        phone: "",
        email: "",
        notes: "",
        active: true
      }
    ]);
  }

  function removeVendor(index) {
    updateVendors((vendors) => vendors.filter((_, vendorIndex) => vendorIndex !== index));
  }

  function moveVendor(index, direction) {
    updateVendors((vendors) => {
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= vendors.length) {
        return vendors;
      }

      const nextVendors = [...vendors];
      [nextVendors[index], nextVendors[nextIndex]] = [nextVendors[nextIndex], nextVendors[index]];

      return nextVendors;
    });
  }

  function updateVendors(getNextVendors) {
    setContent((currentContent) => {
      if (!currentContent?.vendors) {
        return currentContent;
      }

      return {
        ...currentContent,
        vendors: getNextVendors(currentContent.vendors)
      };
    });
    setSaveError("");
    setSaveResult(null);
  }

  function updateLeadership(index, field, value) {
    updateLeaderships((leaders) => leaders.map((person, personIndex) => {
      if (personIndex !== index) {
        return person;
      }

      return {
        ...person,
        [field]: value
      };
    }));
  }

  function addLeadership() {
    updateLeaderships((leaders) => [
      ...leaders,
      {
        id: createLeadershipId(leaders),
        group: "",
        role: "",
        name: "",
        photo: "",
        email: "",
        phone: "",
        notes: "",
        featured: false,
        active: true
      }
    ]);
  }

  function removeLeadership(index) {
    updateLeaderships((leaders) => leaders.filter((_, leaderIndex) => leaderIndex !== index));
  }

  function moveLeadership(index, direction) {
    updateLeaderships((leaders) => {
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= leaders.length) {
        return leaders;
      }

      const nextLeaders = [...leaders];
      [nextLeaders[index], nextLeaders[nextIndex]] = [nextLeaders[nextIndex], nextLeaders[index]];

      return nextLeaders;
    });
  }

  function updateLeaderships(getNextLeaders) {
    setContent((currentContent) => {
      if (!currentContent?.leadership) {
        return currentContent;
      }

      return {
        ...currentContent,
        leadership: getNextLeaders(currentContent.leadership)
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

  async function saveLeadershipDrafts() {
    await saveDrafts("leadership", "Leadership");
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
              onAddLeadership={addLeadership}
              onAddVendor={addVendor}
              onMoveLeadership={moveLeadership}
              onMoveCourse={moveCourse}
              onMoveVendor={moveVendor}
              onRemoveCourse={removeCourse}
              onRemoveLeadership={removeLeadership}
              onRemoveVendor={removeVendor}
              onSaveCourseDrafts={saveCourseDrafts}
              onSaveLeadershipDrafts={saveLeadershipDrafts}
              onSaveVendorDrafts={saveVendorDrafts}
              onUpdateCourse={updateCourse}
              onUpdateLeadership={updateLeadership}
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
  onAddLeadership,
  onAddVendor,
  onMoveLeadership,
  onMoveCourse,
  onMoveVendor,
  onRemoveCourse,
  onRemoveLeadership,
  onRemoveVendor,
  onSaveCourseDrafts,
  onSaveLeadershipDrafts,
  onSaveVendorDrafts,
  onUpdateCourse,
  onUpdateLeadership,
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
        onAddVendor={onAddVendor}
        onMoveVendor={onMoveVendor}
        onRemoveVendor={onRemoveVendor}
        onSaveVendorDrafts={onSaveVendorDrafts}
        onUpdateVendor={onUpdateVendor}
        saveError={saveError}
        saveResult={saveResult}
      />
    );
  }

  if (section?.id === "leadership") {
    return (
      <LeadershipFields
        isSaving={isSaving}
        items={section.value || []}
        onAddLeadership={onAddLeadership}
        onMoveLeadership={onMoveLeadership}
        onRemoveLeadership={onRemoveLeadership}
        onSaveLeadershipDrafts={onSaveLeadershipDrafts}
        onUpdateLeadership={onUpdateLeadership}
        saveError={saveError}
        saveResult={saveResult}
      />
    );
  }

  if (section?.id === "marketingTools") {
    return <MarketingToolFields items={section.value || []} />;
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

function AdminTextField({ disabled = false, label, onChange, value = "" }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input
        disabled={disabled}
        type="text"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </label>
  );
}

function LeadershipFields({
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

function MarketingToolFields({ items }) {
  return (
    <div className="admin-form-preview">
      <div className="admin-form-preview__summary">
        <div>
          <strong>{items.length}</strong>
          <span>marketing tool cards</span>
        </div>
        <span className="admin-status admin-status--ok">Read only</span>
      </div>
      <div className="admin-course-list">
        {items.map((tool, index) => (
          <article className="admin-course-item" key={tool.id || index}>
            <div className="admin-course-item__header">
              <span>Marketing Tool {index + 1}</span>
              <label className="admin-check">
                <input type="checkbox" checked={Boolean(tool.active)} disabled readOnly />
                Active
              </label>
            </div>
            <div className="admin-field-grid">
              <AdminTextField disabled label="ID" value={tool.id} />
              <AdminTextField disabled label="Kicker" value={tool.kicker} />
              <AdminTextField disabled label="Title" value={tool.title} />
            </div>
            <AdminTextArea disabled label="Summary" value={tool.summary} />
            {(tool.links || []).map((link, linkIndex) => (
              <div className="admin-field-grid" key={`${tool.id || index}-link-${linkIndex}`}>
                <AdminTextField disabled label={`Link ${linkIndex + 1} Label`} value={link.label} />
                <AdminTextField disabled label={`Link ${linkIndex + 1} URL`} value={link.href} />
                <div className="admin-flag-row">
                  <label className="admin-check">
                    <input type="checkbox" checked={Boolean(link.external)} disabled readOnly />
                    External
                  </label>
                  <label className="admin-check">
                    <input type="checkbox" checked={Boolean(link.download)} disabled readOnly />
                    Download
                  </label>
                </div>
              </div>
            ))}
          </article>
        ))}
      </div>
      <details className="admin-draft-json">
        <summary>Marketing Tools JSON preview</summary>
        <pre className="admin-json">{JSON.stringify(items, null, 2)}</pre>
      </details>
    </div>
  );
}

function VendorFields({
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

function AdminTextArea({ disabled = false, label, onChange, value = "" }) {
  return (
    <label className="admin-field admin-field--full">
      <span>{label}</span>
      <textarea
        disabled={disabled}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        rows={3}
      />
    </label>
  );
}

function getPathValue(value, path) {
  return path.reduce((current, key) => current?.[key], value);
}

function isDraftFieldSection(sectionId) {
  return sectionId === "courses" || sectionId === "vendors" || sectionId === "leadership";
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

function validateLeadershipDrafts(items) {
  const errors = [];
  const seenIds = new Map();

  items.forEach((person, index) => {
    const label = `Leader ${index + 1}`;

    ["id", "group", "role", "name", "photo"].forEach((field) => {
      if (!String(person[field] || "").trim()) {
        errors.push(`${label}: ${field} is required.`);
      }
    });

    const id = String(person.id || "").trim();

    if (id) {
      if (seenIds.has(id)) {
        errors.push(`${label}: id duplicates Leader ${seenIds.get(id) + 1}.`);
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

function createVendorId(vendors) {
  const ids = new Set(vendors.map((vendor) => vendor.id));
  let index = vendors.length + 1;
  let id = `new-vendor-${index}`;

  while (ids.has(id)) {
    index += 1;
    id = `new-vendor-${index}`;
  }

  return id;
}

function createLeadershipId(leaders) {
  const ids = new Set(leaders.map((person) => person.id));
  let index = leaders.length + 1;
  let id = `new-leader-${index}`;

  while (ids.has(id)) {
    index += 1;
    id = `new-leader-${index}`;
  }

  return id;
}
