function linkAttributes(link) {
  const attrs = [`href="${escapeHtmlAttribute(link.href)}"`];

  if (link.external) {
    attrs.push('target="_blank"', 'rel="noreferrer"');
  }

  if (link.download) {
    attrs.push("download");
  }

  return attrs.join(" ");
}

function createChipLinksHtml(links = []) {
  return links
    .map((link) => `<a class="chip chip-link" ${linkAttributes(link)}>${escapeHtml(link.label)}</a>`)
    .join("");
}

export function MarketingToolGrid({ tools = [] }) {
  return (
    <div className="marketing-tool-grid">
      {tools.filter((tool) => tool.active !== false).map((tool) => (
        <article key={tool.id} className="asset-source-card marketing-tool-card">
          <p className="eyebrow small">{tool.kicker}</p>
          <h3>{tool.title}</h3>
          <p>{tool.summary}</p>
          <div className="chip-row asset-downloads">
            {tool.links.map((link) => (
              <a
                key={`${tool.id}-${link.label}`}
                className="chip chip-link"
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noreferrer" : undefined}
                download={link.download ? true : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

export function createMarketingToolGridHtml(tools = []) {
  const cards = tools
    .filter((tool) => tool.active !== false)
    .map((tool) => {
      return `<article class="asset-source-card marketing-tool-card"><p class="eyebrow small">${escapeHtml(tool.kicker)}</p><h3>${escapeHtml(tool.title)}</h3><p>${escapeHtml(tool.summary)}</p><div class="chip-row asset-downloads">${createChipLinksHtml(tool.links)}</div></article>`;
    })
    .join("");

  return `<div class="marketing-tool-grid">${cards}</div>`;
}

export function AssetGrid({ assets = [] }) {
  return (
    <div className="asset-grid">
      {assets.filter((asset) => asset.active !== false).map((asset) => (
        <article key={asset.id} className="asset-card">
          <div className={`asset-preview ${asset.previewClass}`}>
            <img src={asset.image.src} alt={asset.image.alt} />
          </div>
          <div className="asset-card-copy">
            <p className="eyebrow small">{asset.kicker}</p>
            <h3>{asset.title}</h3>
            <p>{asset.summary}</p>
          </div>
          <div className="chip-row asset-downloads">
            {asset.links.map((link) => (
              <a
                key={`${asset.id}-${link.label}`}
                className="chip chip-link"
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noreferrer" : undefined}
                download={link.download ? true : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

export function createAssetGridHtml(assets = []) {
  const cards = assets
    .filter((asset) => asset.active !== false)
    .map((asset) => {
      return `<article class="asset-card"><div class="asset-preview ${escapeHtmlAttribute(asset.previewClass)}"><img src="${escapeHtmlAttribute(asset.image.src)}" alt="${escapeHtmlAttribute(asset.image.alt)}"></div><div class="asset-card-copy"><p class="eyebrow small">${escapeHtml(asset.kicker)}</p><h3>${escapeHtml(asset.title)}</h3><p>${escapeHtml(asset.summary)}</p></div><div class="chip-row asset-downloads">${createChipLinksHtml(asset.links)}</div></article>`;
    })
    .join("");

  return `<div class="asset-grid">${cards}</div>`;
}

export function SourceFileGrid({ files = [] }) {
  return (
    <div className="asset-source-grid">
      {files.filter((file) => file.active !== false).map((file) => (
        <article key={file.id} className="asset-source-card">
          <p className="eyebrow small">{file.kicker}</p>
          <h3>{file.title}</h3>
          {file.summary ? <p>{file.summary}</p> : null}
          <div className="chip-row asset-downloads">
            {file.links.map((link) => (
              <a key={`${file.id}-${link.label}`} className="chip chip-link" href={link.href} download={link.download ? true : undefined}>
                {link.label}
              </a>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

export function createSourceFileGridHtml(files = []) {
  const cards = files
    .filter((file) => file.active !== false)
    .map((file) => {
      const summary = file.summary ? `<p>${escapeHtml(file.summary)}</p>` : "";

      return `<article class="asset-source-card"><p class="eyebrow small">${escapeHtml(file.kicker)}</p><h3>${escapeHtml(file.title)}</h3>${summary}<div class="chip-row asset-downloads">${createChipLinksHtml(file.links)}</div></article>`;
    })
    .join("");

  return `<div class="asset-source-grid">${cards}</div>`;
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
