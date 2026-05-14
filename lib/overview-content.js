export const OVERVIEW_CONTENT_DEFAULT = {
  eyebrow: "Portal Home",
  title: "Where Entrepreneurs Thrive!",
  summary: "The Keller Williams Leading Edge Agent Portal gives our agents one place to access office resources, training, leadership support, trusted vendors, and the daily tools that help keep your business moving.",
  dailyAccess: {
    tag: "Daily Access",
    title: "Open the tools that shape the day",
    links: [
      { label: "KW Command", href: "https://console.command.kw.com/command", external: true },
      { label: "RI MLS", href: "https://stwmls.clareityiam.net/idp/login", external: true },
      { label: "CT MLS", href: "https://smartmls-sso.connectmls.com/", external: true },
      { label: "Mass MLS", href: "https://h3j.mlspin.com/signin.asp?lstpgckhd=1#ath", external: true }
    ]
  },
  agenda: {
    tag: "Office Agenda",
    title: "What is coming up next in training and office events",
    links: [
      { label: "Full Calendar", href: "https://agent.kwleadingedge.com/training-calendar/", external: true, calendarModal: true },
      { label: "Office Info", href: "https://agent.kwleadingedge.com/important_info/", external: true },
      { label: "Vendor Row", href: "#vendor-row" },
      { label: "Need Tech Support?", href: "#leadership-support" }
    ]
  },
  rates: {
    eyebrow: "Interest Rates",
    title: "Mortgage Interest Rates"
  },
  market: {
    eyebrow: "RI Market Trends",
    title: "Rhode Island Market"
  }
};

export function getOverviewContent(content = {}) {
  const overview = content.sections?.overview || {};

  return {
    ...OVERVIEW_CONTENT_DEFAULT,
    ...overview,
    dailyAccess: {
      ...OVERVIEW_CONTENT_DEFAULT.dailyAccess,
      ...(overview.dailyAccess || {}),
      links: Array.isArray(overview.dailyAccess?.links)
        ? overview.dailyAccess.links
        : OVERVIEW_CONTENT_DEFAULT.dailyAccess.links
    },
    agenda: {
      ...OVERVIEW_CONTENT_DEFAULT.agenda,
      ...(overview.agenda || {}),
      links: Array.isArray(overview.agenda?.links)
        ? overview.agenda.links
        : OVERVIEW_CONTENT_DEFAULT.agenda.links
    },
    rates: {
      ...OVERVIEW_CONTENT_DEFAULT.rates,
      ...(overview.rates || {})
    },
    market: {
      ...OVERVIEW_CONTENT_DEFAULT.market,
      ...(overview.market || {})
    }
  };
}
