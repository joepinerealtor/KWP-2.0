function getTransitionHref(page = {}) {
  return page.transitionNotice?.href || "lonewolf/";
}

export function DocuSignReminderModal({ page }) {
  if (!page?.showDocuSignReminder) {
    return null;
  }

  return (
    <div className="docusign-reminder-modal" data-docusign-reminder-modal hidden>
      <div className="docusign-reminder-modal__backdrop" data-docusign-reminder-close />
      <div className="docusign-reminder-modal__panel" role="dialog" aria-modal="true" aria-labelledby="docusignReminderTitle" aria-describedby="docusignReminderSummary">
        <div className="docusign-reminder-modal__signal" aria-hidden="true">i</div>
        <div className="docusign-reminder-modal__copy">
          <p className="eyebrow small">DocuSign Transition</p>
          <h2 id="docusignReminderTitle">DocuSign transition: July 14, 2026</h2>
          <p id="docusignReminderSummary">DocuSign Rooms is scheduled to discontinue on July 14, 2026, and Lone Wolf Transact will become the next place to manage this workflow. Please review the transition page for KW Answers articles, class registration, and next steps.</p>
        </div>
        <div className="docusign-reminder-modal__actions">
          <a className="button primary compact docusign-reminder-modal__register-button" href={getTransitionHref(page)}>View Lone Wolf Transition Page</a>
          <button className="button primary compact" type="button" data-docusign-reminder-close data-docusign-reminder-action="read">I've Read This</button>
          <button className="button secondary compact" type="button" data-docusign-reminder-close data-docusign-reminder-action="later">Remind Me Later</button>
        </div>
      </div>
    </div>
  );
}

export function LoneWolfArticleModal({ page }) {
  if (!page?.showLoneWolfArticleModal) {
    return null;
  }

  return (
    <div className="calendar-modal lone-wolf-modal" data-lone-wolf-modal hidden>
      <div className="calendar-modal__backdrop" data-lone-wolf-modal-close />
      <div className="calendar-modal__panel" role="dialog" aria-modal="true" aria-labelledby="loneWolfArticleTitle">
        <div className="calendar-modal__head">
          <div className="calendar-modal__copy">
            <p className="eyebrow small">Lone Wolf Article</p>
            <h2 id="loneWolfArticleTitle" data-lone-wolf-modal-title>Helpful Lone Wolf Transact Article</h2>
            <p className="calendar-modal__summary">Review the KW Answers article without leaving the transition hub.</p>
          </div>
          <button className="button secondary compact calendar-modal__close" type="button" data-lone-wolf-modal-close>Close</button>
        </div>
        <div className="calendar-modal__body">
          <div className="calendar-modal__embed-shell" data-lone-wolf-modal-shell aria-label="Lone Wolf KW Answers article" />
        </div>
        <div className="calendar-modal__footer">
          <p className="calendar-modal__note">If the article does not load, you can open it in a new tab.</p>
          <div className="calendar-modal__actions">
            <a className="button compact" href="https://answers.kw.com/hc/en-us" target="_blank" rel="noreferrer" data-lone-wolf-modal-open>Open In New Tab</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PortalOverlays({ page }) {
  return (
    <>
      <DocuSignReminderModal page={page} />
      <LoneWolfArticleModal page={page} />
    </>
  );
}
