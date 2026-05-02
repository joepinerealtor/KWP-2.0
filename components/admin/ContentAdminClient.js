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

  function updateMarketingTool(index, field, value) {
    updateMarketingTools((tools) => tools.map((tool, toolIndex) => {
      if (toolIndex !== index) {
        return tool;
      }

      return {
        ...tool,
        [field]: value
      };
    }));
  }

  function updateMarketingToolLink(toolIndex, linkIndex, field, value) {
    updateMarketingTools((tools) => tools.map((tool, currentToolIndex) => {
      if (currentToolIndex !== toolIndex) {
        return tool;
      }

      return {
        ...tool,
        links: (tool.links || []).map((link, currentLinkIndex) => {
          if (currentLinkIndex !== linkIndex) {
            return link;
          }

          return {
            ...link,
            [field]: value
          };
        })
      };
    }));
  }

  function addMarketingTool() {
    updateMarketingTools((tools) => [
      ...tools,
      {
        id: createMarketingToolId(tools),
        kicker: "",
        title: "",
        summary: "",
        links: [
          {
            label: "",
            href: "",
            external: false,
            download: false
          }
        ],
        active: true
      }
    ]);
  }

  function removeMarketingTool(index) {
    updateMarketingTools((tools) => tools.filter((_, toolIndex) => toolIndex !== index));
  }

  function moveMarketingTool(index, direction) {
    updateMarketingTools((tools) => {
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= tools.length) {
        return tools;
      }

      const nextTools = [...tools];
      [nextTools[index], nextTools[nextIndex]] = [nextTools[nextIndex], nextTools[index]];

      return nextTools;
    });
  }

  function addMarketingToolLink(toolIndex) {
    updateMarketingTools((tools) => tools.map((tool, currentToolIndex) => {
      if (currentToolIndex !== toolIndex) {
        return tool;
      }

      return {
        ...tool,
        links: [
          ...(tool.links || []),
          {
            label: "",
            href: "",
            external: false,
            download: false
          }
        ]
      };
    }));
  }

  function removeMarketingToolLink(toolIndex, linkIndex) {
    updateMarketingTools((tools) => tools.map((tool, currentToolIndex) => {
      if (currentToolIndex !== toolIndex) {
        return tool;
      }

      return {
        ...tool,
        links: (tool.links || []).filter((_, currentLinkIndex) => currentLinkIndex !== linkIndex)
      };
    }));
  }

  function updateMarketingTools(getNextTools) {
    setContent((currentContent) => {
      if (!currentContent?.brandAssets?.marketingTools) {
        return currentContent;
      }

      return {
        ...currentContent,
        brandAssets: {
          ...currentContent.brandAssets,
          marketingTools: getNextTools(currentContent.brandAssets.marketingTools)
        }
      };
    });
    setSaveError("");
    setSaveResult(null);
  }

  function updateDigitalLogo(index, field, value) {
    updateDigitalLogos((logos) => logos.map((logo, logoIndex) => {
      if (logoIndex !== index) {
        return logo;
      }

      return {
        ...logo,
        [field]: value
      };
    }));
  }

  function updateDigitalLogoImage(index, field, value) {
    updateDigitalLogos((logos) => logos.map((logo, logoIndex) => {
      if (logoIndex !== index) {
        return logo;
      }

      return {
        ...logo,
        image: {
          ...(logo.image || {}),
          [field]: value
        }
      };
    }));
  }

  function updateDigitalLogoLink(logoIndex, linkIndex, field, value) {
    updateDigitalLogos((logos) => logos.map((logo, currentLogoIndex) => {
      if (currentLogoIndex !== logoIndex) {
        return logo;
      }

      return {
        ...logo,
        links: (logo.links || []).map((link, currentLinkIndex) => {
          if (currentLinkIndex !== linkIndex) {
            return link;
          }

          return {
            ...link,
            [field]: value
          };
        })
      };
    }));
  }

  function addDigitalLogo() {
    updateDigitalLogos((logos) => [
      ...logos,
      {
        id: createDigitalLogoId(logos),
        kicker: "",
        title: "",
        summary: "",
        previewClass: "",
        image: {
          src: "",
          alt: ""
        },
        links: [
          {
            label: "",
            href: "",
            external: false,
            download: false
          }
        ],
        active: true
      }
    ]);
  }

  function removeDigitalLogo(index) {
    updateDigitalLogos((logos) => logos.filter((_, logoIndex) => logoIndex !== index));
  }

  function moveDigitalLogo(index, direction) {
    updateDigitalLogos((logos) => {
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= logos.length) {
        return logos;
      }

      const nextLogos = [...logos];
      [nextLogos[index], nextLogos[nextIndex]] = [nextLogos[nextIndex], nextLogos[index]];

      return nextLogos;
    });
  }

  function addDigitalLogoLink(logoIndex) {
    updateDigitalLogos((logos) => logos.map((logo, currentLogoIndex) => {
      if (currentLogoIndex !== logoIndex) {
        return logo;
      }

      return {
        ...logo,
        links: [
          ...(logo.links || []),
          {
            label: "",
            href: "",
            external: false,
            download: false
          }
        ]
      };
    }));
  }

  function removeDigitalLogoLink(logoIndex, linkIndex) {
    updateDigitalLogos((logos) => logos.map((logo, currentLogoIndex) => {
      if (currentLogoIndex !== logoIndex) {
        return logo;
      }

      return {
        ...logo,
        links: (logo.links || []).filter((_, currentLinkIndex) => currentLinkIndex !== linkIndex)
      };
    }));
  }

  function updateDigitalLogos(getNextLogos) {
    setContent((currentContent) => {
      if (!currentContent?.brandAssets?.digitalLogos) {
        return currentContent;
      }

      return {
        ...currentContent,
        brandAssets: {
          ...currentContent.brandAssets,
          digitalLogos: getNextLogos(currentContent.brandAssets.digitalLogos)
        }
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

  async function saveMarketingToolDrafts() {
    await saveDrafts("marketingTools", "Marketing Tools");
  }

  async function saveDigitalLogoDrafts() {
    await saveDrafts("digitalLogos", "Digital Logos");
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
              onAddDigitalLogo={addDigitalLogo}
              onAddDigitalLogoLink={addDigitalLogoLink}
              onAddLeadership={addLeadership}
              onAddMarketingTool={addMarketingTool}
              onAddMarketingToolLink={addMarketingToolLink}
              onAddVendor={addVendor}
              onMoveDigitalLogo={moveDigitalLogo}
              onMoveLeadership={moveLeadership}
              onMoveCourse={moveCourse}
              onMoveMarketingTool={moveMarketingTool}
              onMoveVendor={moveVendor}
              onRemoveCourse={removeCourse}
              onRemoveDigitalLogo={removeDigitalLogo}
              onRemoveDigitalLogoLink={removeDigitalLogoLink}
              onRemoveLeadership={removeLeadership}
              onRemoveMarketingTool={removeMarketingTool}
              onRemoveMarketingToolLink={removeMarketingToolLink}
              onRemoveVendor={removeVendor}
              onSaveCourseDrafts={saveCourseDrafts}
              onSaveDigitalLogoDrafts={saveDigitalLogoDrafts}
              onSaveLeadershipDrafts={saveLeadershipDrafts}
              onSaveMarketingToolDrafts={saveMarketingToolDrafts}
              onSaveVendorDrafts={saveVendorDrafts}
              onUpdateCourse={updateCourse}
              onUpdateDigitalLogo={updateDigitalLogo}
              onUpdateDigitalLogoImage={updateDigitalLogoImage}
              onUpdateDigitalLogoLink={updateDigitalLogoLink}
              onUpdateLeadership={updateLeadership}
              onUpdateMarketingTool={updateMarketingTool}
              onUpdateMarketingToolLink={updateMarketingToolLink}
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
  onAddDigitalLogo,
  onAddDigitalLogoLink,
  onAddLeadership,
  onAddMarketingTool,
  onAddMarketingToolLink,
  onAddVendor,
  onMoveDigitalLogo,
  onMoveLeadership,
  onMoveCourse,
  onMoveMarketingTool,
  onMoveVendor,
  onRemoveCourse,
  onRemoveDigitalLogo,
  onRemoveDigitalLogoLink,
  onRemoveLeadership,
  onRemoveMarketingTool,
  onRemoveMarketingToolLink,
  onRemoveVendor,
  onSaveCourseDrafts,
  onSaveDigitalLogoDrafts,
  onSaveLeadershipDrafts,
  onSaveMarketingToolDrafts,
  onSaveVendorDrafts,
  onUpdateCourse,
  onUpdateDigitalLogo,
  onUpdateDigitalLogoImage,
  onUpdateDigitalLogoLink,
  onUpdateLeadership,
  onUpdateMarketingTool,
  onUpdateMarketingToolLink,
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
    return (
      <MarketingToolFields
        isSaving={isSaving}
        items={section.value || []}
        onAddMarketingTool={onAddMarketingTool}
        onAddMarketingToolLink={onAddMarketingToolLink}
        onMoveMarketingTool={onMoveMarketingTool}
        onRemoveMarketingTool={onRemoveMarketingTool}
        onRemoveMarketingToolLink={onRemoveMarketingToolLink}
        onSaveMarketingToolDrafts={onSaveMarketingToolDrafts}
        onUpdateMarketingTool={onUpdateMarketingTool}
        onUpdateMarketingToolLink={onUpdateMarketingToolLink}
        saveError={saveError}
        saveResult={saveResult}
      />
    );
  }

  if (section?.id === "digitalLogos") {
    return (
      <DigitalLogoFields
        isSaving={isSaving}
        items={section.value || []}
        onAddDigitalLogo={onAddDigitalLogo}
        onAddDigitalLogoLink={onAddDigitalLogoLink}
        onMoveDigitalLogo={onMoveDigitalLogo}
        onRemoveDigitalLogo={onRemoveDigitalLogo}
        onRemoveDigitalLogoLink={onRemoveDigitalLogoLink}
        onSaveDigitalLogoDrafts={onSaveDigitalLogoDrafts}
        onUpdateDigitalLogo={onUpdateDigitalLogo}
        onUpdateDigitalLogoImage={onUpdateDigitalLogoImage}
        onUpdateDigitalLogoLink={onUpdateDigitalLogoLink}
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

function MarketingToolFields({
  isSaving,
  items,
  onAddMarketingTool,
  onAddMarketingToolLink,
  onMoveMarketingTool,
  onRemoveMarketingTool,
  onRemoveMarketingToolLink,
  onSaveMarketingToolDrafts,
  onUpdateMarketingTool,
  onUpdateMarketingToolLink,
  saveError,
  saveResult
}) {
  const validationErrors = validateMarketingToolDrafts(items);
  const activeSaveResult = saveResult?.sectionId === "marketingTools" ? saveResult : null;

  return (
    <div className="admin-form-preview">
      <div className="admin-form-preview__summary">
        <div>
          <strong>{items.length}</strong>
          <span>marketing tool cards</span>
        </div>
        <div className="admin-summary-actions">
          <span className={validationErrors.length ? "admin-status admin-status--error" : "admin-status admin-status--ok"}>
            {validationErrors.length ? `${validationErrors.length} issue${validationErrors.length === 1 ? "" : "s"}` : "Valid draft"}
          </span>
          <button className="admin-button admin-button--secondary" type="button" onClick={onAddMarketingTool}>
            Add Tool
          </button>
        </div>
      </div>
      {validationErrors.length ? (
        <div className="admin-validation" role="status">
          <h3>Marketing Tools validation</h3>
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
          onClick={onSaveMarketingToolDrafts}
        >
          {isSaving ? "Saving" : "Save Marketing Tools Drafts"}
        </button>
        <span>Writes only after validation, backup, and API passcode check.</span>
      </div>
      {saveError ? <p className="admin-save-message admin-save-message--error">{saveError}</p> : null}
      {activeSaveResult ? (
        <div className="admin-save-message admin-save-message--success" role="status">
          <strong>{activeSaveResult.changed ? "Marketing Tools drafts saved." : "No content changes detected."}</strong>
          <span>Backup: {activeSaveResult.backup}</span>
          <span>Source: {activeSaveResult.source}</span>
          <span>Mirror: {activeSaveResult.publicMirror}</span>
        </div>
      ) : null}
      <div className="admin-course-list">
        {items.map((tool, index) => (
          <article className="admin-course-item" key={tool.id || index}>
            <div className="admin-course-item__header">
              <span>Marketing Tool {index + 1}</span>
              <div className="admin-course-controls">
                <button
                  className="admin-icon-button"
                  disabled={index === 0}
                  type="button"
                  onClick={() => onMoveMarketingTool(index, -1)}
                  aria-label={`Move Marketing Tool ${index + 1} up`}
                >
                  Up
                </button>
                <button
                  className="admin-icon-button"
                  disabled={index === items.length - 1}
                  type="button"
                  onClick={() => onMoveMarketingTool(index, 1)}
                  aria-label={`Move Marketing Tool ${index + 1} down`}
                >
                  Down
                </button>
                <button
                  className="admin-icon-button admin-icon-button--danger"
                  type="button"
                  onClick={() => onRemoveMarketingTool(index)}
                  aria-label={`Remove Marketing Tool ${index + 1}`}
                >
                  Remove
                </button>
                <button
                  className="admin-icon-button"
                  type="button"
                  onClick={() => onAddMarketingToolLink(index)}
                  aria-label={`Add link to Marketing Tool ${index + 1}`}
                >
                  Add Link
                </button>
                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={Boolean(tool.active)}
                    onChange={(event) => onUpdateMarketingTool(index, "active", event.target.checked)}
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="admin-field-grid">
              <AdminTextField
                label="ID"
                value={tool.id}
                onChange={(value) => onUpdateMarketingTool(index, "id", value)}
              />
              <AdminTextField
                label="Kicker"
                value={tool.kicker}
                onChange={(value) => onUpdateMarketingTool(index, "kicker", value)}
              />
              <AdminTextField
                label="Title"
                value={tool.title}
                onChange={(value) => onUpdateMarketingTool(index, "title", value)}
              />
            </div>
            <AdminTextArea
              label="Summary"
              value={tool.summary}
              onChange={(value) => onUpdateMarketingTool(index, "summary", value)}
            />
            {(tool.links || []).map((link, linkIndex) => (
              <div className="admin-field-grid" key={`${tool.id || index}-link-${linkIndex}`}>
                <AdminTextField
                  label={`Link ${linkIndex + 1} Label`}
                  value={link.label}
                  onChange={(value) => onUpdateMarketingToolLink(index, linkIndex, "label", value)}
                />
                <AdminTextField
                  label={`Link ${linkIndex + 1} URL`}
                  value={link.href}
                  onChange={(value) => onUpdateMarketingToolLink(index, linkIndex, "href", value)}
                />
                <div className="admin-flag-row">
                  <label className="admin-check">
                    <input
                      type="checkbox"
                      checked={Boolean(link.external)}
                      onChange={(event) => onUpdateMarketingToolLink(index, linkIndex, "external", event.target.checked)}
                    />
                    External
                  </label>
                  <label className="admin-check">
                    <input
                      type="checkbox"
                      checked={Boolean(link.download)}
                      onChange={(event) => onUpdateMarketingToolLink(index, linkIndex, "download", event.target.checked)}
                    />
                    Download
                  </label>
                  <button
                    className="admin-icon-button admin-icon-button--danger"
                    type="button"
                    onClick={() => onRemoveMarketingToolLink(index, linkIndex)}
                    aria-label={`Remove Link ${linkIndex + 1} from Marketing Tool ${index + 1}`}
                  >
                    Remove Link
                  </button>
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

function DigitalLogoFields({
  isSaving,
  items,
  onAddDigitalLogo,
  onAddDigitalLogoLink,
  onMoveDigitalLogo,
  onRemoveDigitalLogo,
  onRemoveDigitalLogoLink,
  onSaveDigitalLogoDrafts,
  onUpdateDigitalLogo,
  onUpdateDigitalLogoImage,
  onUpdateDigitalLogoLink,
  saveError,
  saveResult
}) {
  const validationErrors = validateDigitalLogoDrafts(items);
  const activeSaveResult = saveResult?.sectionId === "digitalLogos" ? saveResult : null;

  return (
    <div className="admin-form-preview">
      <div className="admin-form-preview__summary">
        <div>
          <strong>{items.length}</strong>
          <span>digital logo cards</span>
        </div>
        <div className="admin-summary-actions">
          <span className={validationErrors.length ? "admin-status admin-status--error" : "admin-status admin-status--ok"}>
            {validationErrors.length ? `${validationErrors.length} issue${validationErrors.length === 1 ? "" : "s"}` : "Valid draft"}
          </span>
          <button className="admin-button admin-button--secondary" type="button" onClick={onAddDigitalLogo}>
            Add Logo
          </button>
        </div>
      </div>
      {validationErrors.length ? (
        <div className="admin-validation" role="status">
          <h3>Digital Logos validation</h3>
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
          onClick={onSaveDigitalLogoDrafts}
        >
          {isSaving ? "Saving" : "Save Digital Logos Drafts"}
        </button>
        <span>Writes only after validation, backup, and API passcode check.</span>
      </div>
      {saveError ? <p className="admin-save-message admin-save-message--error">{saveError}</p> : null}
      {activeSaveResult ? (
        <div className="admin-save-message admin-save-message--success" role="status">
          <strong>{activeSaveResult.changed ? "Digital Logos drafts saved." : "No content changes detected."}</strong>
          <span>Backup: {activeSaveResult.backup}</span>
          <span>Source: {activeSaveResult.source}</span>
          <span>Mirror: {activeSaveResult.publicMirror}</span>
        </div>
      ) : null}
      <div className="admin-course-list">
        {items.map((logo, index) => (
          <article className="admin-course-item" key={logo.id || index}>
            <div className="admin-course-item__header">
              <span>Digital Logo {index + 1}</span>
              <div className="admin-course-controls">
                <button
                  className="admin-icon-button"
                  disabled={index === 0}
                  type="button"
                  onClick={() => onMoveDigitalLogo(index, -1)}
                  aria-label={`Move Digital Logo ${index + 1} up`}
                >
                  Up
                </button>
                <button
                  className="admin-icon-button"
                  disabled={index === items.length - 1}
                  type="button"
                  onClick={() => onMoveDigitalLogo(index, 1)}
                  aria-label={`Move Digital Logo ${index + 1} down`}
                >
                  Down
                </button>
                <button
                  className="admin-icon-button admin-icon-button--danger"
                  type="button"
                  onClick={() => onRemoveDigitalLogo(index)}
                  aria-label={`Remove Digital Logo ${index + 1}`}
                >
                  Remove
                </button>
                <button
                  className="admin-icon-button"
                  type="button"
                  onClick={() => onAddDigitalLogoLink(index)}
                  aria-label={`Add link to Digital Logo ${index + 1}`}
                >
                  Add Link
                </button>
                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={Boolean(logo.active)}
                    onChange={(event) => onUpdateDigitalLogo(index, "active", event.target.checked)}
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="admin-field-grid">
              <AdminTextField
                label="ID"
                value={logo.id}
                onChange={(value) => onUpdateDigitalLogo(index, "id", value)}
              />
              <AdminTextField
                label="Kicker"
                value={logo.kicker}
                onChange={(value) => onUpdateDigitalLogo(index, "kicker", value)}
              />
              <AdminTextField
                label="Title"
                value={logo.title}
                onChange={(value) => onUpdateDigitalLogo(index, "title", value)}
              />
              <AdminTextField
                label="Preview Class"
                value={logo.previewClass}
                onChange={(value) => onUpdateDigitalLogo(index, "previewClass", value)}
              />
              <AdminTextField
                label="Image Source"
                value={logo.image?.src}
                onChange={(value) => onUpdateDigitalLogoImage(index, "src", value)}
              />
              <AdminTextField
                label="Image Alt"
                value={logo.image?.alt}
                onChange={(value) => onUpdateDigitalLogoImage(index, "alt", value)}
              />
            </div>
            <AdminTextArea
              label="Summary"
              value={logo.summary}
              onChange={(value) => onUpdateDigitalLogo(index, "summary", value)}
            />
            {(logo.links || []).map((link, linkIndex) => (
              <div className="admin-field-grid" key={`${logo.id || index}-link-${linkIndex}`}>
                <AdminTextField
                  label={`Link ${linkIndex + 1} Label`}
                  value={link.label}
                  onChange={(value) => onUpdateDigitalLogoLink(index, linkIndex, "label", value)}
                />
                <AdminTextField
                  label={`Link ${linkIndex + 1} URL`}
                  value={link.href}
                  onChange={(value) => onUpdateDigitalLogoLink(index, linkIndex, "href", value)}
                />
                <div className="admin-flag-row">
                  <label className="admin-check">
                    <input
                      type="checkbox"
                      checked={Boolean(link.external)}
                      onChange={(event) => onUpdateDigitalLogoLink(index, linkIndex, "external", event.target.checked)}
                    />
                    External
                  </label>
                  <label className="admin-check">
                    <input
                      type="checkbox"
                      checked={Boolean(link.download)}
                      onChange={(event) => onUpdateDigitalLogoLink(index, linkIndex, "download", event.target.checked)}
                    />
                    Download
                  </label>
                  <button
                    className="admin-icon-button admin-icon-button--danger"
                    type="button"
                    onClick={() => onRemoveDigitalLogoLink(index, linkIndex)}
                    aria-label={`Remove Link ${linkIndex + 1} from Digital Logo ${index + 1}`}
                  >
                    Remove Link
                  </button>
                </div>
              </div>
            ))}
          </article>
        ))}
      </div>
      <details className="admin-draft-json">
        <summary>Digital Logos JSON preview</summary>
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
  return sectionId === "courses" || sectionId === "vendors" || sectionId === "leadership" || sectionId === "marketingTools" || sectionId === "digitalLogos";
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

function validateMarketingToolDrafts(items) {
  const errors = [];
  const seenIds = new Map();

  items.forEach((tool, index) => {
    const label = `Marketing Tool ${index + 1}`;

    ["id", "kicker", "title", "summary"].forEach((field) => {
      if (!String(tool[field] || "").trim()) {
        errors.push(`${label}: ${field} is required.`);
      }
    });

    const id = String(tool.id || "").trim();

    if (id) {
      if (seenIds.has(id)) {
        errors.push(`${label}: id duplicates Marketing Tool ${seenIds.get(id) + 1}.`);
      } else {
        seenIds.set(id, index);
      }
    }

    if (!Array.isArray(tool.links)) {
      errors.push(`${label}: links must be a list.`);
      return;
    }

    tool.links.forEach((link, linkIndex) => {
      const linkLabel = `${label} Link ${linkIndex + 1}`;

      ["label", "href"].forEach((field) => {
        if (!String(link[field] || "").trim()) {
          errors.push(`${linkLabel}: ${field} is required.`);
        }
      });
    });
  });

  return errors;
}

function validateDigitalLogoDrafts(items) {
  const errors = [];
  const seenIds = new Map();

  items.forEach((logo, index) => {
    const label = `Digital Logo ${index + 1}`;

    ["id", "kicker", "title", "summary", "previewClass"].forEach((field) => {
      if (!String(logo[field] || "").trim()) {
        errors.push(`${label}: ${field} is required.`);
      }
    });

    const id = String(logo.id || "").trim();

    if (id) {
      if (seenIds.has(id)) {
        errors.push(`${label}: id duplicates Digital Logo ${seenIds.get(id) + 1}.`);
      } else {
        seenIds.set(id, index);
      }
    }

    if (!logo.image || typeof logo.image !== "object" || Array.isArray(logo.image)) {
      errors.push(`${label}: image must be set.`);
    } else {
      ["src", "alt"].forEach((field) => {
        if (!String(logo.image[field] || "").trim()) {
          errors.push(`${label}: image ${field} is required.`);
        }
      });
    }

    if (!Array.isArray(logo.links)) {
      errors.push(`${label}: links must be a list.`);
      return;
    }

    logo.links.forEach((link, linkIndex) => {
      const linkLabel = `${label} Link ${linkIndex + 1}`;

      ["label", "href"].forEach((field) => {
        if (!String(link[field] || "").trim()) {
          errors.push(`${linkLabel}: ${field} is required.`);
        }
      });
    });
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

function createMarketingToolId(tools) {
  const ids = new Set(tools.map((tool) => tool.id));
  let index = tools.length + 1;
  let id = `new-marketing-tool-${index}`;

  while (ids.has(id)) {
    index += 1;
    id = `new-marketing-tool-${index}`;
  }

  return id;
}

function createDigitalLogoId(logos) {
  const ids = new Set(logos.map((logo) => logo.id));
  let index = logos.length + 1;
  let id = `new-digital-logo-${index}`;

  while (ids.has(id)) {
    index += 1;
    id = `new-digital-logo-${index}`;
  }

  return id;
}
