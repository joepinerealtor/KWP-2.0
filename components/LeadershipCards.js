function toPhoneHref(value) {
  const digits = String(value || "").replace(/\D/g, "");

  return digits ? `tel:+1${digits.length === 10 ? digits : digits.replace(/^1/, "")}` : "";
}

function getActiveLeadership(leaders, group) {
  return leaders.filter((person) => person.active !== false && person.group === group);
}

export function LeadershipGrid({ leaders = [] }) {
  const activeLeaders = getActiveLeadership(leaders, "office");

  return (
    <div className="leadership-grid" data-leadership-grid data-react-rendered="true" aria-live="polite">
      {activeLeaders.map((person) => (
        <LeaderCard key={person.id} person={person} />
      ))}
    </div>
  );
}

function LeaderCard({ person }) {
  const phoneHref = toPhoneHref(person.phone);

  return (
    <article className={`leader-card${person.featured ? " leader-card-highlight" : ""}`}>
      <img src={person.photo} alt={person.name} className="leader-photo" />
      <div className="leader-copy">
        <span className="leader-role">{person.role}</span>
        <h3>{person.name}</h3>
        {person.notes ? <p className="leader-notes">{person.notes}</p> : null}
        <div className="leader-contact-list">
          {person.email ? <a href={`mailto:${person.email}`} className="leader-contact-link">{person.email}</a> : null}
          {person.phone && phoneHref ? <a href={phoneHref} className="leader-contact-link">{person.phone}</a> : null}
        </div>
      </div>
    </article>
  );
}

export function AlcPosterGrid({ leaders = [] }) {
  const activePosters = getActiveLeadership(leaders, "alc");

  return (
    <div className="alc-poster-grid" data-alc-grid data-react-rendered="true" aria-label="2026 ALC poster set" aria-live="polite">
      {activePosters.map((person) => (
        <AlcPosterCard key={person.id} person={person} />
      ))}
    </div>
  );
}

function AlcPosterCard({ person }) {
  return (
    <a className="alc-poster-card" href={person.photo} target="_blank" rel="noreferrer" aria-label={`Open ${person.name} ${person.role} ALC poster`}>
      <img src={person.photo} alt={`${person.name} ${person.role} poster`} loading="lazy" decoding="async" />
      <span className="alc-poster-copy">
        <strong>{person.name}</strong>
        <span>{person.role || person.notes}</span>
      </span>
    </a>
  );
}

export function createLeadershipGridHtml(leaders = []) {
  const leaderCards = getActiveLeadership(leaders, "office")
    .map(createLeaderCardHtml)
    .join("");

  return `<div class="leadership-grid" data-leadership-grid data-react-rendered="true" aria-live="polite">${leaderCards}</div>`;
}

export function createAlcPosterGridHtml(leaders = []) {
  const posterCards = getActiveLeadership(leaders, "alc")
    .map(createAlcPosterCardHtml)
    .join("");

  return `<div class="alc-poster-grid" data-alc-grid data-react-rendered="true" aria-label="2026 ALC poster set" aria-live="polite">${posterCards}</div>`;
}

function createLeaderCardHtml(person) {
  const email = person.email
    ? `<a href="mailto:${escapeHtmlAttribute(person.email)}" class="leader-contact-link">${escapeHtml(person.email)}</a>`
    : "";
  const phoneHref = toPhoneHref(person.phone);
  const phone = person.phone && phoneHref
    ? `<a href="${phoneHref}" class="leader-contact-link">${escapeHtml(person.phone)}</a>`
    : "";
  const notes = person.notes
    ? `<p class="leader-notes">${escapeHtml(person.notes)}</p>`
    : "";

  return `<article class="leader-card${person.featured ? " leader-card-highlight" : ""}"><img src="${escapeHtmlAttribute(person.photo)}" alt="${escapeHtmlAttribute(person.name)}" class="leader-photo"><div class="leader-copy"><span class="leader-role">${escapeHtml(person.role)}</span><h3>${escapeHtml(person.name)}</h3>${notes}<div class="leader-contact-list">${email}${phone}</div></div></article>`;
}

function createAlcPosterCardHtml(person) {
  return `<a class="alc-poster-card" href="${escapeHtmlAttribute(person.photo)}" target="_blank" rel="noreferrer" aria-label="Open ${escapeHtmlAttribute(person.name)} ${escapeHtmlAttribute(person.role)} ALC poster"><img src="${escapeHtmlAttribute(person.photo)}" alt="${escapeHtmlAttribute(person.name)} ${escapeHtmlAttribute(person.role)} poster" loading="lazy" decoding="async"><span class="alc-poster-copy"><strong>${escapeHtml(person.name)}</strong><span>${escapeHtml(person.role || person.notes)}</span></span></a>`;
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeHtmlAttribute(value = "") {
  return escapeHtml(value);
}
