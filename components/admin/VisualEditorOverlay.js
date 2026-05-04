export function VisualEditorOverlay() {
  const editableSections = [
    { label: "Overview", target: "#overview", status: "Layout locked" },
    { label: "Training Resources", target: "#training-resources", status: "Courses module" },
    { label: "Office", target: "#office", status: "Office module" },
    { label: "Rooms", target: "#conference-rooms", status: "Calendar module" },
    { label: "Leadership", target: "#leadership", status: "People module" },
    { label: "Vendor Row", target: "#vendor-row", status: "Vendor module" },
    { label: "Productivity Coaching", target: "#training", status: "Courses module" }
  ];

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
          <h2>Page Sections</h2>
          <p>Select a section to edit, move, or add a module between rows.</p>
        </div>

        <div className="visual-editor-section-list">
          {editableSections.map((section) => (
            <a className="visual-editor-section-card" href={section.target} key={section.target}>
              <span>{section.label}</span>
              <strong>{section.status}</strong>
            </a>
          ))}
        </div>

        <div className="visual-editor-panel-actions">
          <button className="visual-editor-button" type="button" disabled>
            Add Section
          </button>
          <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled>
            Save Draft
          </button>
        </div>

        <p className="visual-editor-note">
          This is the visual editor foundation. The next slice will make the first section editable from this panel.
        </p>
      </aside>
    </>
  );
}
