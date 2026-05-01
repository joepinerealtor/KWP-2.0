const suggestionMailto = "mailto:JoePine@KW.com?subject=Agent%20Portal%20Suggestion&body=Hi%20Joe%2C%0A%0AI%20have%20a%20suggestion%20for%20the%20Agent%20Portal.%0A%0AWhat%20should%20be%20added%20or%20improved%3F%0A%0AWhy%20would%20this%20help%20agents%3F%0A%0AMy%20name%3A%0A";

export const dailyAccessLinks = [
  { label: "KW Command", href: "https://console.command.kw.com/command", primary: true, external: true },
  { label: "RI MLS", href: "https://stwmls.clareityiam.net/idp/login", external: true },
  { label: "CT MLS", href: "https://smartmls-sso.connectmls.com/", external: true },
  { label: "Mass MLS", href: "https://h3j.mlspin.com/signin.asp?lstpgckhd=1#ath", external: true },
  { label: "KW Answers", href: "https://answers.kw.com/hc/en-us", external: true },
  { label: "KW Facebook Group", href: "https://www.facebook.com/groups/1202591099776591", external: true }
];

const brandQuickLinks = [
  { label: "Dashboard Login", href: "https://agent.kwleadingedge.com/dashboard/", button: "primary", external: true },
  { label: "Full Logo Pack", href: "downloads/leading-edge-logos.zip", button: "primary", download: true },
  { label: "Brand Standards", href: "https://images.kw.com/shared/mykw/logos/KellerWilliams_QuickReferenceGuide.pdf", button: "secondary", external: true },
  { label: "Canva for KW", href: "https://canva.kw.com/", button: "secondary", external: true },
  { label: "KW Canva Setup", href: "https://answers.kw.com/hc/en-us/articles/44040408220819-Get-Started-with-Your-KW-Canva-Account", button: "secondary", external: true },
  { label: "Business Cards", href: "https://agentstore.com/product-category/kw/keller-williams-business-cards/", button: "secondary", external: true },
  { label: "KW Command", href: "https://console.command.kw.com/command", button: "secondary", external: true },
  { label: "Office Info", href: "https://agent.kwleadingedge.com/important_info/", button: "secondary", external: true }
];

const techQuickLinks = [
  { label: "Dashboard Login", href: "https://agent.kwleadingedge.com/dashboard/", button: "primary", external: true },
  { label: "Open PaperCut Hive", href: "https://hive.papercut.com/", button: "primary", external: true },
  { label: "Book Tech Help with Joe", href: "https://calendly.com/joepinerealtor/tech-meeting-with-joe", button: "secondary", external: true },
  { label: "Email Joe", href: "mailto:JoePine@KW.com?subject=KW%20Tech%20Question", button: "secondary" },
  { label: "KW Answers", href: "https://answers.kw.com/hc/en-us", button: "secondary", external: true },
  { label: "KW Command Login", href: "https://agent.kw.com/", button: "secondary", external: true }
];

export const portalPages = {
  home: {
    lockLabel: "Agent Portal",
    brandHref: "#overview",
    brandLogo: "brand/kw-leading-edge-logo.png",
    brandTitle: "Agent Portal",
    timeCardClassName: "header-time-card header-time-card--sidebar",
    navLabel: "Page sections",
    mobileMenusLabel: "Portal menus",
    navLinks: [
      { label: "Overview", href: "#overview", active: true },
      { label: "Training Resources", href: "#training-resources" },
      { label: "Office", href: "#office" },
      { label: "Conference + Training Rooms", href: "#conference-rooms" },
      { label: "Leadership", href: "#leadership" },
      { label: "Vendor Row", href: "#vendor-row" },
      { label: "Marketing + Brand Assets", href: "brand-assets.html", page: true },
      { label: "Productivity Coaching", href: "#training" },
      { label: "Productivity Coaching Login", href: "https://agent.kwleadingedge.com/dashboard/", page: true, primary: true, external: true }
    ],
    sidebarUtility: {
      type: "feedback",
      ariaLabel: "Portal feedback",
      links: [
        { label: "Suggest an Improvement", href: suggestionMailto, button: "secondary" }
      ]
    },
    mobileQuickLinks: [
      { label: "KW Command", href: "https://console.command.kw.com/command", button: "primary", external: true },
      { label: "RI MLS", href: "https://stwmls.clareityiam.net/idp/login", button: "secondary", external: true },
      { label: "CT MLS", href: "https://smartmls-sso.connectmls.com/", button: "secondary", external: true },
      { label: "Mass MLS", href: "https://h3j.mlspin.com/signin.asp?lstpgckhd=1#ath", button: "secondary", external: true },
      { label: "KW Answers", href: "https://answers.kw.com/hc/en-us", button: "secondary", external: true },
      { label: "KW Facebook Group", href: "https://www.facebook.com/groups/1202591099776591", button: "secondary", external: true },
      { label: "Suggest an Improvement", href: suggestionMailto, button: "secondary" }
    ],
    showJoeInQuickStrip: true,
    joeStatusSrc: "data/joe-tech-status.json",
    showLogout: true
  },
  brandAssets: {
    lockLabel: "Marketing + Brand Assets",
    brandHref: "index.html#overview",
    brandLogo: "brand/kw-leading-edge-logo.png",
    brandTitle: "Marketing + Brand Assets",
    navLabel: "Marketing and brand sections",
    mobileMenusLabel: "Mobile portal menus",
    navLinks: [
      { label: "Home", href: "index.html#overview", page: true },
      { label: "Vendor Row", href: "index.html#vendor-row", page: true },
      { label: "Overview", href: "#brand-overview", active: true },
      { label: "Marketing Tools", href: "#marketing-tools" },
      { label: "Digital Logos", href: "#digital-logos" },
      { label: "Source Files", href: "#source-files" }
    ],
    sidebarUtility: {
      type: "stack",
      title: "Quick Links",
      links: brandQuickLinks
    },
    mobileQuickLinks: brandQuickLinks,
    showLogout: false
  },
  tech: {
    lockLabel: "Tech Connect",
    brandHref: "../index.html#overview",
    brandLogo: "../brand/kw-leading-edge-logo.png",
    brandTitle: "Tech Connect",
    navLabel: "Tech Connect sections",
    mobileMenusLabel: "Mobile portal menus",
    navLinks: [
      { label: "Home", href: "../index.html#overview", page: true },
      { label: "Vendor Row", href: "../index.html#vendor-row", page: true },
      { label: "Marketing + Brand Assets", href: "../brand-assets.html", page: true },
      { label: "Overview", href: "#tech-overview", active: true },
      { label: "Help Paths", href: "#help-paths" },
      { label: "PaperCut Hive", href: "#papercut-hive" },
      { label: "KW Answers", href: "#kw-answers" }
    ],
    sidebarUtility: {
      type: "stack",
      title: "Quick Links",
      links: techQuickLinks
    },
    mobileQuickLinks: techQuickLinks,
    showLogout: false
  }
};
