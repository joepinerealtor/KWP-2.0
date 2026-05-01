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
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [content, setContent] = useState(null);
  const [source, setSource] = useState("");
  const [activeSectionId, setActiveSectionId] = useState(SECTION_DEFINITIONS[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
      setPasscode("");
      setContent(payload.content);
      setSource(payload.source || "");
      setActiveSectionId(SECTION_DEFINITIONS[0].id);
    } catch (loadError) {
      setContent(null);
      setSource("");
      setIsUnlocked(false);
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }

  function lock() {
    setIsUnlocked(false);
    setContent(null);
    setSource("");
    setError("");
    setPasscode("");
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
        <section className="admin-workspace" aria-label="Read-only content workspace">
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
                <p className="admin-kicker">Read only</p>
                <h2>{activeSection?.label}</h2>
              </div>
              <span>{activeSection?.type}</span>
            </div>
            <SectionReader section={activeSection} />
          </div>
        </section>
      )}
    </main>
  );
}

function SectionReader({ section }) {
  if (section?.id === "courses") {
    return <CourseReadOnly items={section.value || []} />;
  }

  return <pre className="admin-json">{JSON.stringify(section?.value, null, 2)}</pre>;
}

function CourseReadOnly({ items }) {
  return (
    <div className="admin-form-preview">
      <div className="admin-form-preview__summary">
        <strong>{items.length}</strong>
        <span>course cards</span>
      </div>
      <div className="admin-course-list">
        {items.map((course, index) => (
          <article className="admin-course-item" key={course.id || index}>
            <div className="admin-course-item__header">
              <span>Course {index + 1}</span>
              <label className="admin-check">
                <input type="checkbox" checked={Boolean(course.active)} disabled readOnly />
                Active
              </label>
            </div>
            <div className="admin-field-grid">
              <AdminTextField label="ID" value={course.id} />
              <AdminTextField label="Tag" value={course.tag} />
              <AdminTextField label="Title" value={course.title} />
              <AdminTextField label="URL" value={course.href} />
            </div>
            <AdminTextArea label="Summary" value={course.summary} />
            <div className="admin-flag-row">
              <label className="admin-check">
                <input type="checkbox" checked={Boolean(course.external)} disabled readOnly />
                External link
              </label>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function AdminTextField({ label, value = "" }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input type="text" value={value} disabled readOnly />
    </label>
  );
}

function AdminTextArea({ label, value = "" }) {
  return (
    <label className="admin-field admin-field--full">
      <span>{label}</span>
      <textarea value={value} disabled readOnly rows={3} />
    </label>
  );
}

function getPathValue(value, path) {
  return path.reduce((current, key) => current?.[key], value);
}
