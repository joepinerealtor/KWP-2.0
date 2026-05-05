"use client";

import { useEffect, useMemo, useState } from "react";
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

const SELECTABLE_CANVAS_SELECTOR = [
  "[data-editable-type]",
  ".page-content > section",
  ".course-card",
  ".office-card",
  ".vendor-card",
  ".leadership-card",
  ".portal-action-card",
  ".launch-card",
  ".content-strip-link",
  ".section-nav-link",
  ".button",
  ".chip-link",
  ".card-tag-link"
].join(",");

let nextVisualEditorId = 1;

export function VisualEditorOverlay({ initialContent }) {
  const [activeSectionId, setActiveSectionId] = useState("productivityCourses");
  const [content, setContent] = useState(initialContent);
  const [passcode, setPasscode] = useState("");
  const [adminPasscode, setAdminPasscode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItemId, setEditingItemId] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  const courses = content?.courses || [];
  const courseErrors = useMemo(() => validateCourseDrafts(courses), [courses]);
  const activeSection = EDITABLE_SECTIONS.find((section) => section.id === activeSectionId) || EDITABLE_SECTIONS[0];
  const selectedCourseIndex = selectedItem?.type === "course-card"
    ? courses.findIndex((course) => course.id === selectedItem.editableId)
    : -1;
  const selectedCourse = selectedCourseIndex >= 0 ? courses[selectedCourseIndex] : null;

  useEffect(() => {
    if (!isUnlocked) {
      return undefined;
    }

    function selectCanvasElement(event) {
      if (event.target.closest(".visual-editor-toolbar, .visual-editor-panel, .visual-editor-floating-toolbar")) {
        return;
      }

      const element = event.target.closest(SELECTABLE_CANVAS_SELECTOR);

      if (!element || !document.body.contains(element)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setSelectedItem(describeSelectedElement(element));
      setEditingItemId("");
    }

    document.addEventListener("click", selectCanvasElement, true);

    return () => {
      document.removeEventListener("click", selectCanvasElement, true);
    };
  }, [isUnlocked]);

  useEffect(() => {
    document.querySelectorAll(".visual-editor-selected").forEach((element) => {
      element.classList.remove("visual-editor-selected");
    });

    if (!selectedItem?.visualId) {
      return;
    }

    const element = document.querySelector(`[data-visual-editor-id="${selectedItem.visualId}"]`);
    element?.classList.add("visual-editor-selected");
  }, [selectedItem]);

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
      setEditingItemId("");
      setSelectedItem(null);
      setStatusMessage("Editor unlocked.");
    } catch (unlockError) {
      setError(unlockError.message);
    } finally {
      setIsLoading(false);
    }
  }

  function selectSection(section) {
    setActiveSectionId(section.id);
    setEditingItemId("");
    setSelectedItem(null);

    if (section.target) {
      document.querySelector(section.target)?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }

  function editSelectedItem() {
    if (!selectedItem) {
      return;
    }

    if (selectedItem.type === "course-card" && selectedItem.editableId) {
      setActiveSectionId("productivityCourses");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Editing this card." } : currentItem);
      return;
    }

    setEditingItemId(selectedItem.visualId);
    setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Full editing controls for this item type are coming in a future module slice." } : currentItem);
  }

  function moveSelectedSection(direction) {
    setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: `${direction === "up" ? "Move up" : "Move down"} will be enabled when section ordering is data-backed.` } : currentItem);
  }

  function setToolbarStatus(action) {
    setError("");
    setStatusMessage(`${action} is part of the visual editor plan. This control is staged here so the editor feels like a true page editor as each action becomes live.`);
  }

  function updateCourse(index, field, value) {
    const courseId = courses[index]?.id;

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
    syncCourseCardPreview(courseId, field, value);
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
    const courseId = courses[index]?.id;

    setContent((currentContent) => ({
      ...currentContent,
      courses: (currentContent.courses || []).filter((_, courseIndex) => courseIndex !== index)
    }));
    if (selectedItem?.editableId === courseId) {
      setEditingItemId("");
      setSelectedItem(null);
    }
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
          <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled={!isUnlocked} onClick={() => setToolbarStatus("Add Section")}>
            Add Section
          </button>
          <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled={!isUnlocked} onClick={() => setToolbarStatus("Edit Sections")}>
            Edit Sections
          </button>
          <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled={!isUnlocked} onClick={() => setToolbarStatus("Edit Navigation")}>
            Edit Navigation
          </button>
          <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled={!isUnlocked} onClick={() => setToolbarStatus("Undo")}>
            Undo
          </button>
          <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled={!isUnlocked} onClick={() => setToolbarStatus("Redo")}>
            Redo
          </button>
          <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled={!isUnlocked} onClick={() => setToolbarStatus("Save Draft")}>
            Save Draft
          </button>
          <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled={!isUnlocked} onClick={() => setToolbarStatus("Publish")}>
            Publish
          </button>
          <a className="visual-editor-button" href="/">
            Preview
          </a>
        </div>
      </div>

      <aside className="visual-editor-panel" aria-label="Visual editor inspector">
        <div className="visual-editor-panel-header">
          <span className="visual-editor-kicker">{selectedItem ? "Selected Item" : "Page Tools"}</span>
          <h2>{isUnlocked ? getPanelTitle(selectedItem, activeSection) : "Unlock Editor"}</h2>
          <p>
            {isUnlocked && selectedItem
              ? "This panel only shows the item you clicked. Use Edit for focused controls."
              : isUnlocked
              ? "Use the top bar for site-wide changes, or choose a page area to review."
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
            {selectedItem ? (
              <SelectedItemPanel
                item={selectedItem}
                selectedCourse={selectedCourse}
                onClear={() => {
                  setEditingItemId("");
                  setSelectedItem(null);
                }}
                onEdit={editSelectedItem}
                onMoveDown={() => moveSelectedSection("down")}
                onMoveUp={() => moveSelectedSection("up")}
              />
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
          </>
        )}

        {error ? <p className="visual-editor-message visual-editor-message--error">{error}</p> : null}
        {statusMessage ? <p className="visual-editor-message visual-editor-message--success">{statusMessage}</p> : null}
      </aside>

      {isUnlocked && selectedItem ? (
        <FloatingSelectionToolbar
          item={selectedItem}
          onClear={() => {
            setEditingItemId("");
            setSelectedItem(null);
          }}
          onEdit={editSelectedItem}
          onMoveDown={() => moveSelectedSection("down")}
          onMoveUp={() => moveSelectedSection("up")}
        />
      ) : null}

      {isUnlocked && selectedItem && editingItemId === selectedItem.visualId ? (
        <FloatingItemEditor
          course={selectedCourse}
          courseErrors={courseErrors}
          courseIndex={selectedCourseIndex}
          isSaving={isSaving}
          item={selectedItem}
          onClose={() => setEditingItemId("")}
          onRemoveCourse={removeCourse}
          onSaveCourses={saveCourses}
          onUpdateCourse={updateCourse}
        />
      ) : null}
    </>
  );
}

function describeSelectedElement(element) {
  if (!element.dataset.visualEditorId) {
    element.dataset.visualEditorId = `visual-editor-${nextVisualEditorId}`;
    nextVisualEditorId += 1;
  }

  const rect = element.getBoundingClientRect();
  const section = element.closest(".page-content > section[id], .page-content > div[id]");
  const heading = element.querySelector("h2, h3, strong")?.textContent || element.textContent || "";
  const sectionHeading = section?.querySelector("h2, h3")?.textContent || section?.id || "Page";
  const tagName = element.tagName.toLowerCase();
  const type = element.dataset.editableType || inferElementType(element);

  return {
    editableId: element.dataset.editableId || "",
    href: element.getAttribute("href") || "",
    label: normalizeLabel(heading) || element.getAttribute("aria-label") || tagName,
    panelHint: "",
    sectionId: section?.id || "",
    sectionLabel: normalizeLabel(sectionHeading),
    tagName,
    type,
    visualId: element.dataset.visualEditorId,
    toolbarPosition: {
      top: Math.max(70, rect.top - 48),
      left: Math.min(window.innerWidth - 260, Math.max(18, rect.left))
    }
  };
}

function inferElementType(element) {
  if (element.matches(".page-content > section")) {
    return "section";
  }

  if (element.matches(".course-card")) {
    return "course-card";
  }

  if (element.matches(".office-card")) {
    return "office-card";
  }

  if (element.matches(".vendor-card")) {
    return "vendor-card";
  }

  if (element.matches(".leadership-card")) {
    return "leadership-card";
  }

  if (element.matches("a, button")) {
    return "link-button";
  }

  return "content-block";
}

function normalizeLabel(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 90);
}

function getPanelTitle(selectedItem, activeSection) {
  if (!selectedItem) {
    return activeSection.label;
  }

  if (selectedItem.type === "course-card") {
    return "Course Card";
  }

  if (selectedItem.type === "link-button") {
    return "Link";
  }

  if (selectedItem.type === "section") {
    return "Section";
  }

  return "Selected Item";
}

function syncCourseCardPreview(courseId, field, value) {
  if (!courseId || typeof document === "undefined") {
    return;
  }

  const safeCourseId = String(courseId).replace(/"/g, '\\"');
  const element = document.querySelector(`[data-editable-type="course-card"][data-editable-id="${safeCourseId}"]`);

  if (!element) {
    return;
  }

  if (field === "tag") {
    const tag = element.querySelector(".card-tag");
    if (tag) {
      tag.textContent = value;
    }
  }

  if (field === "title") {
    const title = element.querySelector("h3");
    if (title) {
      title.textContent = value;
    }
  }

  if (field === "summary") {
    const summary = element.querySelector("p");
    if (summary) {
      summary.textContent = value;
    }
  }

  if (field === "href") {
    element.setAttribute("href", value);
  }

  if (field === "external") {
    if (value) {
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noreferrer");
    } else {
      element.removeAttribute("target");
      element.removeAttribute("rel");
    }
  }
}

function SelectedItemPanel({ item, selectedCourse, onClear, onEdit, onMoveDown, onMoveUp }) {
  return (
    <div className="visual-editor-selection-summary visual-editor-context-panel">
      <div>
        <strong>{item.label}</strong>
        <p>{item.type} {item.sectionLabel ? `in ${item.sectionLabel}` : ""}</p>
        {item.href ? <p className="visual-editor-selection-link">{item.href}</p> : null}
        {item.type === "course-card" && selectedCourse ? (
          <p>Click Edit to change this card in a focused floating editor.</p>
        ) : (
          <p>This item is selectable. Editing controls for this item type will be added in its module slice.</p>
        )}
        {item.panelHint ? <p className="visual-editor-context-note">{item.panelHint}</p> : null}
      </div>
      <div className="visual-editor-context-actions">
        <button type="button" onClick={onEdit}>
          Edit
        </button>
        <button type="button" onClick={onMoveUp}>
          Move Up
        </button>
        <button type="button" onClick={onMoveDown}>
          Move Down
        </button>
        <button type="button" onClick={onClear}>
          Back
        </button>
      </div>
    </div>
  );
}

function FloatingSelectionToolbar({ item, onClear, onEdit, onMoveDown, onMoveUp }) {
  return (
    <div
      className="visual-editor-floating-toolbar"
      style={{
        top: `${item.toolbarPosition.top}px`,
        left: `${item.toolbarPosition.left}px`
      }}
      role="toolbar"
      aria-label={`Editing ${item.label}`}
    >
      <strong>{item.type}</strong>
      <button type="button" onClick={onEdit}>Edit</button>
      <button type="button" onClick={onMoveUp}>Move Up</button>
      <button type="button" onClick={onMoveDown}>Move Down</button>
      <button type="button" onClick={onClear}>Done</button>
    </div>
  );
}

function FloatingItemEditor({
  course,
  courseErrors,
  courseIndex,
  isSaving,
  item,
  onClose,
  onRemoveCourse,
  onSaveCourses,
  onUpdateCourse
}) {
  const isCourseEditable = item.type === "course-card" && course && courseIndex >= 0;

  return (
    <div
      className="visual-editor-floating-editor"
      style={{
        top: `${Math.max(86, item.toolbarPosition.top + 44)}px`,
        left: `${Math.max(18, item.toolbarPosition.left)}px`
      }}
      role="dialog"
      aria-label={`Edit ${item.label}`}
    >
      <div className="visual-editor-floating-editor-header">
        <div>
          <span className="visual-editor-kicker">Editing</span>
          <strong>{item.label}</strong>
        </div>
        <button type="button" onClick={onClose} aria-label="Close editor">
          Close
        </button>
      </div>

      {isCourseEditable ? (
        <>
          <p className="visual-editor-note">
            Changes update this card preview as you type. Save when it looks right.
          </p>
          <label className="visual-editor-field">
            <span>Tag</span>
            <input value={course.tag || ""} onChange={(event) => onUpdateCourse(courseIndex, "tag", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Title</span>
            <input value={course.title || ""} onChange={(event) => onUpdateCourse(courseIndex, "title", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Description</span>
            <textarea value={course.summary || ""} rows={3} onChange={(event) => onUpdateCourse(courseIndex, "summary", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Link</span>
            <input value={course.href || ""} onChange={(event) => onUpdateCourse(courseIndex, "href", event.target.value)} />
          </label>
          <div className="visual-editor-check-row">
            <label>
              <input
                type="checkbox"
                checked={course.active !== false}
                onChange={(event) => onUpdateCourse(courseIndex, "active", event.target.checked)}
              />
              Visible
            </label>
            <label>
              <input
                type="checkbox"
                checked={course.external !== false}
                onChange={(event) => onUpdateCourse(courseIndex, "external", event.target.checked)}
              />
              Opens externally
            </label>
          </div>
          {courseErrors.length ? (
            <div className="visual-editor-validation" role="status">
              {courseErrors.map((validationError) => (
                <p key={validationError}>{validationError}</p>
              ))}
            </div>
          ) : null}
          <div className="visual-editor-panel-actions">
            <button className="visual-editor-button" type="button" disabled={Boolean(courseErrors.length) || isSaving} onClick={onSaveCourses}>
              {isSaving ? "Saving" : "Save Card"}
            </button>
            <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={() => onRemoveCourse(courseIndex)}>
              Delete
            </button>
          </div>
        </>
      ) : (
        <p className="visual-editor-note">
          This item is selectable now. The focused editor for this kind of block is coming next.
        </p>
      )}
    </div>
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
