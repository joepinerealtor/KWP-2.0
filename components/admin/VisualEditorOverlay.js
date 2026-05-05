"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createCourseId, createTrainingResourceId, validateCourseDrafts } from "./contentDrafts";

const EDITABLE_SECTIONS = [
  { id: "overview", label: "Overview", target: "#overview", status: "Layout locked" },
  { id: "trainingResources", label: "Training Resources", target: "#training-resources", status: "Training cards" },
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
const EDITOR_SESSION_PASSCODE_KEY = "kwpVisualEditorPasscode";

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
  const trainingResources = content?.trainingResources || [];
  const office = content?.office || {};
  const trainingResourceSection = content?.sections?.trainingResources || {
    eyebrow: "Self-Paced Support",
    title: "Training Resources"
  };
  const courseErrors = useMemo(() => validateCourseDrafts(courses), [courses]);
  const trainingResourceErrors = useMemo(() => validateCourseDrafts(trainingResources), [trainingResources]);
  const activeSection = EDITABLE_SECTIONS.find((section) => section.id === activeSectionId) || EDITABLE_SECTIONS[0];
  const selectedCourseIndex = selectedItem?.type === "course-card"
    ? courses.findIndex((course) => course.id === selectedItem.editableId)
    : -1;
  const selectedTrainingResourceIndex = selectedItem?.type === "training-resource-card"
    ? trainingResources.findIndex((resource) => resource.id === selectedItem.editableId)
    : -1;
  const selectedCourse = selectedCourseIndex >= 0 ? courses[selectedCourseIndex] : null;
  const selectedTrainingResource = selectedTrainingResourceIndex >= 0 ? trainingResources[selectedTrainingResourceIndex] : null;
  const selectedOfficeCardKey = selectedItem?.type === "office-card" ? selectedItem.editableId : "";
  const selectedOfficeCard = selectedOfficeCardKey ? office[selectedOfficeCardKey] : null;
  const selectedEditableCard = selectedCourse || selectedTrainingResource;
  const selectedEditableCardIndex = selectedCourse ? selectedCourseIndex : selectedTrainingResourceIndex;
  const selectedEditableCardErrors = selectedTrainingResource ? trainingResourceErrors : courseErrors;
  const selectedEditableCardType = selectedTrainingResource ? "training-resource-card" : "course-card";
  const shouldShowPanel = true;
  const canAddCard = activeSectionId === "trainingResources" || activeSectionId === "productivityCourses";

  useEffect(() => {
    const storedPasscode = window.sessionStorage.getItem(EDITOR_SESSION_PASSCODE_KEY);

    if (!storedPasscode) {
      return;
    }

    unlockEditorWithPasscode(storedPasscode, {
      rememberSession: false,
      restoredSession: true
    });
  }, []);

  useEffect(() => {
    if (!isUnlocked) {
      return undefined;
    }

    function selectCanvasElement(event) {
      if (event.target.closest(".visual-editor-toolbar, .visual-editor-panel, .visual-editor-floating-toolbar, .visual-editor-floating-editor")) {
        return;
      }

      const element = event.target.closest(SELECTABLE_CANVAS_SELECTOR);

      if (!element || !document.body.contains(element)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      const nextSelectedItem = describeSelectedElement(element);
      const relatedSection = findSectionForSelectedItem(nextSelectedItem);

      if (relatedSection) {
        setActiveSectionId(relatedSection.id);
      }

      setSelectedItem(nextSelectedItem);
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

  useEffect(() => {
    document.body.classList.toggle("visual-editor-has-selection", isUnlocked && Boolean(selectedItem));

    return () => {
      document.body.classList.remove("visual-editor-has-selection");
    };
  }, [isUnlocked, selectedItem]);

  async function unlockEditor(event) {
    event.preventDefault();
    await unlockEditorWithPasscode(passcode, {
      rememberSession: true,
      restoredSession: false
    });
  }

  async function unlockEditorWithPasscode(nextPasscode, { rememberSession, restoredSession }) {
    if (!nextPasscode) {
      return;
    }

    setIsLoading(true);
    setError("");
    setStatusMessage(restoredSession ? "Restoring editor session." : "");

    try {
      const response = await fetch("/api/admin/content/", {
        cache: "no-store",
        headers: {
          "x-kwp-admin-passcode": nextPasscode
        }
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to unlock editor.");
      }

      setContent(payload.content);
      setAdminPasscode(nextPasscode);
      setPasscode("");
      setIsUnlocked(true);
      setEditingItemId("");
      setSelectedItem(null);
      if (rememberSession) {
        window.sessionStorage.setItem(EDITOR_SESSION_PASSCODE_KEY, nextPasscode);
      }
      setStatusMessage(restoredSession ? "Editor session restored." : "Editor unlocked for this browser session.");
    } catch (unlockError) {
      if (restoredSession) {
        window.sessionStorage.removeItem(EDITOR_SESSION_PASSCODE_KEY);
        setError("Editor session expired. Enter the passcode again.");
      } else {
        setError(unlockError.message);
      }
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

    if (selectedItem.type === "training-resource-card" && selectedItem.editableId) {
      setActiveSectionId("trainingResources");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Editing this training card." } : currentItem);
      return;
    }

    if (
      selectedItem.sectionId === "training-resources" ||
      selectedItem.type === "section-eyebrow" ||
      selectedItem.type === "section-heading"
    ) {
      setActiveSectionId("trainingResources");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Editing this section heading." } : currentItem);
      return;
    }

    if (selectedItem.type === "office-card" && selectedItem.editableId) {
      setActiveSectionId("office");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Editing this office card." } : currentItem);
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

  function addCardFromToolbar() {
    if (activeSectionId === "trainingResources") {
      addTrainingResource();
      setStatusMessage("Training Resources card added. Edit the new card, then save when ready.");
      return;
    }

    if (activeSectionId === "productivityCourses") {
      addCourse();
      setStatusMessage("Productivity Coaching card added. Edit the new card, then save when ready.");
      return;
    }

    setToolbarStatus("Add Card");
  }

  function updateTrainingResourceSection(field, value) {
    setContent((currentContent) => ({
      ...currentContent,
      sections: {
        ...(currentContent.sections || {}),
        trainingResources: {
          ...((currentContent.sections || {}).trainingResources || {}),
          [field]: value
        }
      }
    }));
    syncTrainingResourceSectionPreview(field, value);
    setStatusMessage("");
    setError("");
  }

  function updateCourse(index, field, value) {
    updateEditableCard("courses", courses, index, field, value, "course-card");
  }

  function updateTrainingResource(index, field, value) {
    updateEditableCard("trainingResources", trainingResources, index, field, value, "training-resource-card");
  }

  function updateOfficeCard(cardKey, field, value) {
    setContent((currentContent) => {
      const currentOffice = currentContent.office || {};
      const currentCard = currentOffice[cardKey] || {};
      const nextCard = field.startsWith("action.")
        ? {
            ...currentCard,
            action: {
              ...(currentCard.action || {}),
              [field.replace("action.", "")]: value
            }
          }
        : {
            ...currentCard,
            [field]: value
          };

      return {
        ...currentContent,
        office: {
          ...currentOffice,
          [cardKey]: nextCard
        }
      };
    });
    syncOfficeCardPreview(cardKey, field, value);
    setStatusMessage("");
    setError("");
  }

  function updateEditableCard(collectionKey, items, index, field, value, editableType) {
    const itemId = items[index]?.id;

    setContent((currentContent) => ({
      ...currentContent,
      [collectionKey]: (currentContent[collectionKey] || []).map((item, itemIndex) => (
        itemIndex === index
          ? {
              ...item,
              [field]: value
            }
          : item
      ))
    }));
    syncEditableCardPreview(editableType, itemId, field, value);
    setStatusMessage("");
    setError("");
  }

  function addCourse() {
    addEditableCard("courses", courses, createCourseId(courses), "course-card");
  }

  function addTrainingResource() {
    addEditableCard("trainingResources", trainingResources, createTrainingResourceId(trainingResources), "training-resource-card");
  }

  function addEditableCard(collectionKey, items, id, editableType) {
    const nextCard = {
      id,
      tag: "New",
      title: "New Card",
      summary: "Add a short description.",
      href: "#",
      external: true,
      active: true
    };

    setContent((currentContent) => {
      const currentItems = currentContent[collectionKey] || items;

      return {
        ...currentContent,
        [collectionKey]: [
          ...currentItems,
          nextCard
        ]
      };
    });
    appendEditableCardPreview(editableType, nextCard);
    setEditingItemId("");
    setSelectedItem(null);
    setStatusMessage("");
    setError("");
  }

  function removeCourse(index) {
    removeEditableCard("courses", courses, index, "course-card");
  }

  function removeTrainingResource(index) {
    removeEditableCard("trainingResources", trainingResources, index, "training-resource-card");
  }

  function removeEditableCard(collectionKey, items, index, editableType) {
    const itemId = items[index]?.id;

    setContent((currentContent) => ({
      ...currentContent,
      [collectionKey]: (currentContent[collectionKey] || []).filter((_, itemIndex) => itemIndex !== index)
    }));
    removeEditableCardPreview(editableType, itemId);
    if (selectedItem?.editableId === itemId && selectedItem?.type === editableType) {
      setEditingItemId("");
      setSelectedItem(null);
    }
    setStatusMessage("");
    setError("");
  }

  function moveCourse(index, direction) {
    moveEditableCard("courses", index, direction);
  }

  function moveTrainingResource(index, direction) {
    moveEditableCard("trainingResources", index, direction);
  }

  function moveEditableCard(collectionKey, index, direction) {
    setContent((currentContent) => {
      const currentItems = currentContent[collectionKey] || [];
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= currentItems.length) {
        return currentContent;
      }

      const nextItems = [...currentItems];
      [nextItems[index], nextItems[nextIndex]] = [nextItems[nextIndex], nextItems[index]];

      return {
        ...currentContent,
        [collectionKey]: nextItems
      };
    });
    setStatusMessage("");
    setError("");
  }

  async function saveCourses() {
    await saveContent(courseErrors, "Courses");
  }

  async function saveTrainingResources() {
    await saveContent(trainingResourceErrors, "Training resources");
  }

  async function saveTrainingResourceSection() {
    await saveContent([], "Training Resources heading");
  }

  async function saveOfficeCard() {
    await saveContent([], "Office card");
  }

  async function saveContent(validationErrors, label) {
    if (validationErrors.length) {
      setError(`Fix ${label.toLowerCase()} validation before saving.`);
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

      setStatusMessage(payload.changed ? `${label} saved. Refresh preview to see saved portal output.` : "No content changes detected.");
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

      {shouldShowPanel ? (
      <aside className="visual-editor-panel" aria-label="Visual editor inspector">
        <div className="visual-editor-panel-header">
          <span className="visual-editor-kicker">{selectedItem ? "Add Tools" : "Page Tools"}</span>
          <h2>{isUnlocked ? activeSection.label : "Unlock Editor"}</h2>
          <p>
            {isUnlocked && selectedItem
              ? "Use the floating pop-up to edit. Use this panel to add content to the current section."
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
              <AddToolsPanel
                activeSection={activeSection}
                canAddCard={canAddCard}
                onAddCard={addCardFromToolbar}
                onAddSection={() => setToolbarStatus("Add Section")}
                onBackToPageTools={() => {
                  setEditingItemId("");
                  setSelectedItem(null);
                }}
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

                {activeSectionId === "trainingResources" ? (
                  <CourseVisualPanel
                    addLabel="Add Card"
                    courses={trainingResources}
                    errors={trainingResourceErrors}
                    itemLabel="training cards"
                    isSaving={isSaving}
                    onAddCourse={addTrainingResource}
                    onMoveCourse={moveTrainingResource}
                    onRemoveCourse={removeTrainingResource}
                    onSaveCourses={saveTrainingResources}
                    onUpdateCourse={updateTrainingResource}
                    saveLabel="Save Training Cards"
                  />
                ) : activeSectionId === "productivityCourses" ? (
                  <CourseVisualPanel
                    courses={courses}
                    errors={courseErrors}
                    itemLabel="course cards"
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
                    <p>This section is selectable now. Editing controls will be added in the next module slices.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {error ? <p className="visual-editor-message visual-editor-message--error">{error}</p> : null}
        {statusMessage ? <p className="visual-editor-message visual-editor-message--success">{statusMessage}</p> : null}
      </aside>
      ) : null}

      {!shouldShowPanel && (error || statusMessage) ? (
        <div className={`visual-editor-toast${error ? " visual-editor-toast--error" : ""}`} role="status">
          {error || statusMessage}
        </div>
      ) : null}

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
          card={selectedEditableCard}
          cardErrors={selectedEditableCardErrors}
          cardIndex={selectedEditableCardIndex}
          editableType={selectedEditableCardType}
          isSaving={isSaving}
          item={selectedItem}
          officeCard={selectedOfficeCard}
          officeCardKey={selectedOfficeCardKey}
          onClose={() => setEditingItemId("")}
          onSaveOfficeCard={saveOfficeCard}
          onUpdateOfficeCard={updateOfficeCard}
          onRemoveCard={selectedTrainingResource ? removeTrainingResource : removeCourse}
          onSaveCards={selectedTrainingResource ? saveTrainingResources : saveCourses}
          onUpdateCard={selectedTrainingResource ? updateTrainingResource : updateCourse}
          sectionSettings={trainingResourceSection}
          onSaveSection={saveTrainingResourceSection}
          onUpdateSection={updateTrainingResourceSection}
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
    bounds: {
      bottom: rect.bottom,
      height: rect.height,
      left: rect.left,
      right: rect.right,
      top: rect.top,
      width: rect.width
    },
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

function findSectionForSelectedItem(item) {
  const target = item.href?.startsWith("#") ? item.href : item.sectionId ? `#${item.sectionId}` : "";

  if (!target) {
    return null;
  }

  return EDITABLE_SECTIONS.find((section) => section.target === target) || null;
}

function getPanelTitle(selectedItem, activeSection) {
  if (!selectedItem) {
    return activeSection.label;
  }

  if (selectedItem.type === "course-card") {
    return "Course Card";
  }

  if (selectedItem.type === "training-resource-card") {
    return "Training Card";
  }

  if (selectedItem.type === "link-button") {
    return "Link";
  }

  if (selectedItem.type === "section") {
    return "Section";
  }

  return "Selected Item";
}

function syncEditableCardPreview(editableType, itemId, field, value) {
  if (!editableType || !itemId || typeof document === "undefined") {
    return;
  }

  const safeEditableType = String(editableType).replace(/"/g, '\\"');
  const safeItemId = String(itemId).replace(/"/g, '\\"');
  const element = document.querySelector(`[data-editable-type="${safeEditableType}"][data-editable-id="${safeItemId}"]`);

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

function syncOfficeCardPreview(cardKey, field, value) {
  if (!cardKey || typeof document === "undefined") {
    return;
  }

  const safeCardKey = String(cardKey).replace(/"/g, '\\"');
  const element = document.querySelector(`[data-editable-type="office-card"][data-editable-id="${safeCardKey}"]`);

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
    const summary = element.querySelector(":scope > p");
    if (summary) {
      summary.textContent = value;
    }
  }

  if (field === "tagHref") {
    const tagLink = element.querySelector(".card-tag-link");
    if (tagLink) {
      tagLink.setAttribute("href", value);
    }
  }

  if (field === "hoursLabel") {
    const labels = element.querySelectorAll(".office-operations-label");
    if (labels[0]) {
      labels[0].textContent = value;
    }
  }

  if (field === "holidaysLabel") {
    const labels = element.querySelectorAll(".office-operations-label");
    if (labels[1]) {
      labels[1].textContent = value;
    }
  }

  if (field === "action.label") {
    const button = element.querySelector(".button");
    if (button) {
      button.textContent = value;
    }
  }

  if (field === "action.href") {
    const button = element.querySelector(".button");
    if (button) {
      button.setAttribute("href", value);
    }
  }

  if (field === "action.external") {
    const button = element.querySelector(".button");
    if (!button) {
      return;
    }

    if (value) {
      button.setAttribute("target", "_blank");
      button.setAttribute("rel", "noreferrer");
    } else {
      button.removeAttribute("target");
      button.removeAttribute("rel");
    }
  }
}

function syncTrainingResourceSectionPreview(field, value) {
  if (typeof document === "undefined") {
    return;
  }

  const selector = field === "eyebrow"
    ? '[data-editable-type="section-eyebrow"][data-editable-id="trainingResources"]'
    : '[data-editable-type="section-heading"][data-editable-id="trainingResources"]';
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = value;
  }
}

function appendEditableCardPreview(editableType, card) {
  if (!editableType || !card || typeof document === "undefined") {
    return;
  }

  const sectionSelector = editableType === "training-resource-card" ? "#training-resources" : "#training";
  const grid = document.querySelector(`${sectionSelector} .course-grid`);

  if (!grid) {
    return;
  }

  const element = document.createElement("a");
  element.className = "course-card";
  element.dataset.editableType = editableType;
  element.dataset.editableId = card.id;
  element.href = card.href || "#";
  if (card.external !== false) {
    element.target = "_blank";
    element.rel = "noreferrer";
  }
  element.innerHTML = `<span class="card-tag"></span><h3></h3><p></p>`;
  element.querySelector(".card-tag").textContent = card.tag || "";
  element.querySelector("h3").textContent = card.title || "";
  element.querySelector("p").textContent = card.summary || "";
  grid.appendChild(element);
}

function removeEditableCardPreview(editableType, itemId) {
  if (!editableType || !itemId || typeof document === "undefined") {
    return;
  }

  const safeEditableType = String(editableType).replace(/"/g, '\\"');
  const safeItemId = String(itemId).replace(/"/g, '\\"');
  const element = document.querySelector(`[data-editable-type="${safeEditableType}"][data-editable-id="${safeItemId}"]`);
  element?.remove();
}

function AddToolsPanel({ activeSection, canAddCard, onAddCard, onAddSection, onBackToPageTools }) {
  return (
    <div className="visual-editor-add-tools">
      <div className="visual-editor-empty-state">
        <strong>{activeSection.label}</strong>
        <p>Add tools live here. Editing the selected item stays in the floating pop-up.</p>
      </div>
      <div className="visual-editor-add-grid">
        <button className="visual-editor-button" type="button" disabled={!canAddCard} onClick={onAddCard}>
          Add Card
        </button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={onAddSection}>
          Add Section
        </button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={onBackToPageTools}>
          Page Tools
        </button>
      </div>
      {!canAddCard ? (
        <p className="visual-editor-note">
          Cards can be added in Training Resources and Productivity Coaching right now. More section types are coming as they become data-backed.
        </p>
      ) : null}
    </div>
  );
}

function SelectedItemPanel({ item, selectedEditableCard, onClear, onEdit, onMoveDown, onMoveUp }) {
  return (
    <div className="visual-editor-selection-summary visual-editor-context-panel">
      <div>
        <strong>{item.label}</strong>
        <p>{item.type} {item.sectionLabel ? `in ${item.sectionLabel}` : ""}</p>
        {item.href ? <p className="visual-editor-selection-link">{item.href}</p> : null}
        {(item.type === "course-card" || item.type === "training-resource-card") && selectedEditableCard ? (
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
  card,
  cardErrors,
  cardIndex,
  editableType,
  isSaving,
  item,
  officeCard,
  officeCardKey,
  onClose,
  onRemoveCard,
  onSaveCards,
  onSaveOfficeCard,
  onUpdateCard,
  onUpdateOfficeCard,
  sectionSettings,
  onSaveSection,
  onUpdateSection
}) {
  const isCardEditable = item.type === editableType && card && cardIndex >= 0;
  const isOfficeCardEditable = item.type === "office-card" && officeCard && officeCardKey;
  const isTrainingResourceSectionEditable = (
    (item.type === "section" && item.sectionId === "training-resources") ||
    item.type === "section-eyebrow" ||
    item.type === "section-heading"
  );
  const editorRef = useRef(null);
  const [editorPosition, setEditorPosition] = useState(() => getInitialFloatingEditorPosition(item));

  useLayoutEffect(() => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    setEditorPosition(getMeasuredFloatingEditorPosition(item, editor));
  }, [item, cardIndex, cardErrors.length, officeCardKey]);

  return (
    <div
      ref={editorRef}
      className="visual-editor-floating-editor"
      style={{
        top: `${editorPosition.top}px`,
        left: `${editorPosition.left}px`
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

      {isTrainingResourceSectionEditable ? (
        <>
          <p className="visual-editor-note">
            Changes update the section heading preview as you type. Save when it looks right.
          </p>
          <label className="visual-editor-field">
            <span>Eyebrow</span>
            <input value={sectionSettings.eyebrow || ""} onChange={(event) => onUpdateSection("eyebrow", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Heading</span>
            <input value={sectionSettings.title || ""} onChange={(event) => onUpdateSection("title", event.target.value)} />
          </label>
          <div className="visual-editor-panel-actions">
            <button className="visual-editor-button" type="button" disabled={isSaving} onClick={onSaveSection}>
              {isSaving ? "Saving" : "Save Heading"}
            </button>
          </div>
        </>
      ) : isOfficeCardEditable ? (
        <>
          <p className="visual-editor-note">
            Changes update this office card preview as you type. Chip and list editing will come in the next office slice.
          </p>
          <label className="visual-editor-field">
            <span>Tag</span>
            <input value={officeCard.tag || ""} onChange={(event) => onUpdateOfficeCard(officeCardKey, "tag", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Title</span>
            <input value={officeCard.title || ""} onChange={(event) => onUpdateOfficeCard(officeCardKey, "title", event.target.value)} />
          </label>
          {"summary" in officeCard ? (
            <label className="visual-editor-field">
              <span>Description</span>
              <textarea value={officeCard.summary || ""} rows={3} onChange={(event) => onUpdateOfficeCard(officeCardKey, "summary", event.target.value)} />
            </label>
          ) : null}
          {"tagHref" in officeCard ? (
            <label className="visual-editor-field">
              <span>Tag Link</span>
              <input value={officeCard.tagHref || ""} onChange={(event) => onUpdateOfficeCard(officeCardKey, "tagHref", event.target.value)} />
            </label>
          ) : null}
          {"hoursLabel" in officeCard ? (
            <label className="visual-editor-field">
              <span>Hours Label</span>
              <input value={officeCard.hoursLabel || ""} onChange={(event) => onUpdateOfficeCard(officeCardKey, "hoursLabel", event.target.value)} />
            </label>
          ) : null}
          {"holidaysLabel" in officeCard ? (
            <label className="visual-editor-field">
              <span>Holidays Label</span>
              <input value={officeCard.holidaysLabel || ""} onChange={(event) => onUpdateOfficeCard(officeCardKey, "holidaysLabel", event.target.value)} />
            </label>
          ) : null}
          {officeCard.action ? (
            <>
              <label className="visual-editor-field">
                <span>Button Label</span>
                <input value={officeCard.action.label || ""} onChange={(event) => onUpdateOfficeCard(officeCardKey, "action.label", event.target.value)} />
              </label>
              <label className="visual-editor-field">
                <span>Button Link</span>
                <input value={officeCard.action.href || ""} onChange={(event) => onUpdateOfficeCard(officeCardKey, "action.href", event.target.value)} />
              </label>
              <div className="visual-editor-check-row">
                <label>
                  <input
                    type="checkbox"
                    checked={officeCard.action.external !== false}
                    onChange={(event) => onUpdateOfficeCard(officeCardKey, "action.external", event.target.checked)}
                  />
                  Opens externally
                </label>
              </div>
            </>
          ) : null}
          <div className="visual-editor-panel-actions">
            <button className="visual-editor-button" type="button" disabled={isSaving} onClick={onSaveOfficeCard}>
              {isSaving ? "Saving" : "Save Office Card"}
            </button>
          </div>
        </>
      ) : isCardEditable ? (
        <>
          <p className="visual-editor-note">
            Changes update this card preview as you type. Save when it looks right.
          </p>
          <label className="visual-editor-field">
            <span>Tag</span>
            <input value={card.tag || ""} onChange={(event) => onUpdateCard(cardIndex, "tag", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Title</span>
            <input value={card.title || ""} onChange={(event) => onUpdateCard(cardIndex, "title", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Description</span>
            <textarea value={card.summary || ""} rows={3} onChange={(event) => onUpdateCard(cardIndex, "summary", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Link</span>
            <input value={card.href || ""} onChange={(event) => onUpdateCard(cardIndex, "href", event.target.value)} />
          </label>
          <div className="visual-editor-check-row">
            <label>
              <input
                type="checkbox"
                checked={card.active !== false}
                onChange={(event) => onUpdateCard(cardIndex, "active", event.target.checked)}
              />
              Visible
            </label>
            <label>
              <input
                type="checkbox"
                checked={card.external !== false}
                onChange={(event) => onUpdateCard(cardIndex, "external", event.target.checked)}
              />
              Opens externally
            </label>
          </div>
          {cardErrors.length ? (
            <div className="visual-editor-validation" role="status">
              {cardErrors.map((validationError) => (
                <p key={validationError}>{validationError}</p>
              ))}
            </div>
          ) : null}
          <div className="visual-editor-panel-actions">
            <button className="visual-editor-button" type="button" disabled={Boolean(cardErrors.length) || isSaving} onClick={onSaveCards}>
              {isSaving ? "Saving" : "Save Card"}
            </button>
            <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={() => onRemoveCard(cardIndex)}>
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

function getInitialFloatingEditorPosition(item) {
  const safeLeft = typeof window === "undefined"
    ? item.toolbarPosition.left
    : Math.min(window.innerWidth - 390, item.toolbarPosition.left);

  return {
    top: Math.max(86, item.toolbarPosition.top + 44),
    left: Math.max(18, safeLeft)
  };
}

function getMeasuredFloatingEditorPosition(item, editor) {
  const margin = 18;
  const topLimit = 86;
  const bottomLimit = window.innerHeight - margin;
  const bounds = item.bounds || {};
  const editorHeight = Math.min(editor.offsetHeight || 420, window.innerHeight - topLimit - margin);
  const editorWidth = editor.offsetWidth || 360;
  const openBelowTop = Math.max(topLimit, (bounds.bottom || item.toolbarPosition.top) + 12);
  const openAboveTop = (bounds.top || item.toolbarPosition.top) - editorHeight - 12;
  const preferredTop = openBelowTop + editorHeight > bottomLimit && openAboveTop >= topLimit
    ? openAboveTop
    : openBelowTop;
  const clampedTop = Math.min(Math.max(topLimit, preferredTop), bottomLimit - editorHeight);
  const rawLeft = bounds.left || item.toolbarPosition.left;
  const clampedLeft = Math.min(Math.max(margin, rawLeft), window.innerWidth - editorWidth - margin);

  return {
    top: Math.max(topLimit, clampedTop),
    left: Math.max(margin, clampedLeft)
  };
}

function CourseVisualPanel({
  addLabel = "Add",
  courses,
  errors,
  itemLabel = "course cards",
  isSaving,
  onAddCourse,
  onMoveCourse,
  onRemoveCourse,
  onSaveCourses,
  onUpdateCourse,
  saveLabel = "Save Courses"
}) {
  return (
    <div className="visual-editor-module">
      <div className="visual-editor-module-header">
        <div>
          <span className={errors.length ? "visual-editor-status visual-editor-status--error" : "visual-editor-status visual-editor-status--ok"}>
            {errors.length ? `${errors.length} issue${errors.length === 1 ? "" : "s"}` : "Valid draft"}
          </span>
          <strong>{courses.length} {itemLabel}</strong>
        </div>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={onAddCourse}>
          {addLabel}
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
          {isSaving ? "Saving" : saveLabel}
        </button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={() => window.location.reload()}>
          Refresh Preview
        </button>
      </div>
    </div>
  );
}
