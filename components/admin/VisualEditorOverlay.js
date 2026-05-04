"use client";

import { useMemo, useState } from "react";
import { createCourseId, validateCourseDrafts } from "./contentDrafts";

const EDITABLE_SECTIONS = [
  { id: "overview", label: "Overview", target: "#overview", status: "Layout locked" },
  { id: "trainingResources", label: "Training Resources", target: "#training-resources", status: "Static training links" },
  { id: "office", label: "Office", target: "#office", status: "Office module" },
  { id: "rooms", label: "Rooms", target: "#conference-rooms", status: "Calendar module" },
  { id: "leadership", label: "Leadership", target: "#leadership", status: "People module" },
  { id: "vendors", label: "Vendor Row", target: "#vendor-row", status: "Vendor module" },
  { id: "productivityCourses", label: "Productivity Coaching", target: "#training", status: "Courses module" }
];

export function VisualEditorOverlay({ initialContent }) {
  const [activeSectionId, setActiveSectionId] = useState("productivityCourses");
  const [content, setContent] = useState(initialContent);
  const [passcode, setPasscode] = useState("");
  const [adminPasscode, setAdminPasscode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  const courses = content?.courses || [];
  const courseErrors = useMemo(() => validateCourseDrafts(courses), [courses]);
  const activeSection = EDITABLE_SECTIONS.find((section) => section.id === activeSectionId) || EDITABLE_SECTIONS[0];

  async function unlockEditor(event) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setStatusMessage("");

    try {
      const response = await fetch("/api/admin/content/", {
        cache: "no-store",
        headers: {
          "x-kwp-admin-passcode": passcode
        }
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to unlock editor.");
      }

      setContent(payload.content);
      setAdminPasscode(passcode);
      setPasscode("");
      setIsUnlocked(true);
      setStatusMessage("Editor unlocked.");
    } catch (unlockError) {
      setError(unlockError.message);
    } finally {
      setIsLoading(false);
    }
  }

  function selectSection(section) {
    setActiveSectionId(section.id);

    if (section.target) {
      document.querySelector(section.target)?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }

  function updateCourse(index, field, value) {
    setContent((currentContent) => ({
      ...currentContent,
      courses: (currentContent.courses || []).map((course, courseIndex) => (
        courseIndex === index
          ? {
              ...course,
              [field]: value
            }
          : course
      ))
    }));
    setStatusMessage("");
    setError("");
  }

  function addCourse() {
    setContent((currentContent) => {
      const currentCourses = currentContent.courses || [];

      return {
        ...currentContent,
        courses: [
          ...currentCourses,
          {
            id: createCourseId(currentCourses),
            tag: "",
            title: "",
            summary: "",
            href: "",
            external: true,
            active: true
          }
        ]
      };
    });
    setStatusMessage("");
    setError("");
  }

  function removeCourse(index) {
    setContent((currentContent) => ({
      ...currentContent,
      courses: (currentContent.courses || []).filter((_, courseIndex) => courseIndex !== index)
    }));
    setStatusMessage("");
    setError("");
  }

  function moveCourse(index, direction) {
    setContent((currentContent) => {
      const currentCourses = currentContent.courses || [];
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= currentCourses.length) {
        return currentContent;
      }

      const nextCourses = [...currentCourses];
      [nextCourses[index], nextCourses[nextIndex]] = [nextCourses[nextIndex], nextCourses[index]];

      return {
        ...currentContent,
        courses: nextCourses
      };
    });
    setStatusMessage("");
    setError("");
  }

  async function saveCourses() {
    if (courseErrors.length) {
      setError("Fix course validation before saving.");
      return;
    }

    setIsSaving(true);
    setError("");
    setStatusMessage("");

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
        throw new Error(payload.validationErrors?.join(" ") || payload.error || "Unable to save courses.");
      }

      setStatusMessage(payload.changed ? "Courses saved. Refresh preview to see saved portal output." : "No content changes detected.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="visual-editor-toolbar" role="banner" aria-label="Visual editor toolbar">
        <div>
          <span className="visual-editor-kicker">Edit Mode</span>
          <strong>KWP Visual Editor</strong>
        </div>
        <div className="visual-editor-toolbar-actions">
          <a className="visual-editor-button visual-editor-button--secondary" href="/admin/content/">
            Form Editor
          </a>
          <a className="visual-editor-button" href="/">
            Preview Portal
          </a>
        </div>
      </div>

      <aside className="visual-editor-panel" aria-label="Visual editor inspector">
        <div className="visual-editor-panel-header">
          <span className="visual-editor-kicker">Inspector</span>
          <h2>{isUnlocked ? activeSection.label : "Unlock Editor"}</h2>
          <p>
            {isUnlocked
              ? "Select a section, edit structured fields, then save the draft."
              : "Enter the temporary admin passcode to edit content from this visual workspace."}
          </p>
        </div>

        {!isUnlocked ? (
          <form className="visual-editor-unlock" onSubmit={unlockEditor}>
            <label className="visual-editor-field">
              <span>Passcode</span>
              <input
                type="password"
                value={passcode}
                autoComplete="current-password"
                onChange={(event) => setPasscode(event.target.value)}
              />
            </label>
            <button className="visual-editor-button" type="submit" disabled={!passcode || isLoading}>
              {isLoading ? "Unlocking" : "Unlock"}
            </button>
          </form>
        ) : (
          <>
            <div className="visual-editor-section-list">
              {EDITABLE_SECTIONS.map((section) => (
                <button
                  className={`visual-editor-section-card${section.id === activeSectionId ? " is-active" : ""}`}
                  type="button"
                  onClick={() => selectSection(section)}
                  key={section.id}
                >
                  <span>{section.label}</span>
                  <strong>{section.status}</strong>
                </button>
              ))}
            </div>

            {activeSectionId === "productivityCourses" ? (
              <CourseVisualPanel
                courses={courses}
                errors={courseErrors}
                isSaving={isSaving}
                onAddCourse={addCourse}
                onMoveCourse={moveCourse}
                onRemoveCourse={removeCourse}
                onSaveCourses={saveCourses}
                onUpdateCourse={updateCourse}
              />
            ) : (
              <div className="visual-editor-empty-state">
                <strong>{activeSection.label}</strong>
                <p>
                  {activeSectionId === "trainingResources"
                    ? "This row is the static Training Resources section with 66 Day Challenge, Scott Le Roy Marketing, and KW Answers. It needs its own structured-data module before it can be edited here."
                    : "This section is selectable now. Editing controls will be added in the next module slices."}
                </p>
              </div>
            )}
          </>
        )}

        {error ? <p className="visual-editor-message visual-editor-message--error">{error}</p> : null}
        {statusMessage ? <p className="visual-editor-message visual-editor-message--success">{statusMessage}</p> : null}
      </aside>
    </>
  );
}

function CourseVisualPanel({
  courses,
  errors,
  isSaving,
  onAddCourse,
  onMoveCourse,
  onRemoveCourse,
  onSaveCourses,
  onUpdateCourse
}) {
  return (
    <div className="visual-editor-module">
      <div className="visual-editor-module-header">
        <div>
          <span className={errors.length ? "visual-editor-status visual-editor-status--error" : "visual-editor-status visual-editor-status--ok"}>
            {errors.length ? `${errors.length} issue${errors.length === 1 ? "" : "s"}` : "Valid draft"}
          </span>
          <strong>{courses.length} course cards</strong>
        </div>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={onAddCourse}>
          Add
        </button>
      </div>

      {errors.length ? (
        <div className="visual-editor-validation" role="status">
          {errors.map((validationError) => (
            <p key={validationError}>{validationError}</p>
          ))}
        </div>
      ) : null}

      <div className="visual-editor-course-list">
        {courses.map((course, index) => (
          <details className="visual-editor-course" key={course.id || index} open={index === 0}>
            <summary>
              <span>{course.title || `Course ${index + 1}`}</span>
              <strong>{course.active === false ? "Hidden" : "Visible"}</strong>
            </summary>
            <div className="visual-editor-course-controls">
              <button type="button" disabled={index === 0} onClick={() => onMoveCourse(index, -1)}>
                Up
              </button>
              <button type="button" disabled={index === courses.length - 1} onClick={() => onMoveCourse(index, 1)}>
                Down
              </button>
              <button type="button" onClick={() => onRemoveCourse(index)}>
                Remove
              </button>
            </div>
            <label className="visual-editor-field">
              <span>Tag</span>
              <input value={course.tag || ""} onChange={(event) => onUpdateCourse(index, "tag", event.target.value)} />
            </label>
            <label className="visual-editor-field">
              <span>Title</span>
              <input value={course.title || ""} onChange={(event) => onUpdateCourse(index, "title", event.target.value)} />
            </label>
            <label className="visual-editor-field">
              <span>Summary</span>
              <textarea value={course.summary || ""} rows={3} onChange={(event) => onUpdateCourse(index, "summary", event.target.value)} />
            </label>
            <label className="visual-editor-field">
              <span>Link</span>
              <input value={course.href || ""} onChange={(event) => onUpdateCourse(index, "href", event.target.value)} />
            </label>
            <div className="visual-editor-check-row">
              <label>
                <input
                  type="checkbox"
                  checked={course.active !== false}
                  onChange={(event) => onUpdateCourse(index, "active", event.target.checked)}
                />
                Visible
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={course.external !== false}
                  onChange={(event) => onUpdateCourse(index, "external", event.target.checked)}
                />
                Opens externally
              </label>
            </div>
          </details>
        ))}
      </div>

      <div className="visual-editor-panel-actions">
        <button className="visual-editor-button" type="button" disabled={Boolean(errors.length) || isSaving} onClick={onSaveCourses}>
          {isSaving ? "Saving" : "Save Courses"}
        </button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={() => window.location.reload()}>
          Refresh Preview
        </button>
      </div>
    </div>
  );
}
