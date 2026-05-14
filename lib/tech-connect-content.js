export const TECH_CONNECT_DEFAULT = {
  sections: {
    techOverview: {
      eyebrow: "Tech Connect",
      title: "Tech help, printing support, and quick account fixes",
      summary: "Start with the fastest next step when you need help with PaperCut Hive, KW Command, account maintenance, or a one-on-one walkthrough with Joe."
    },
    techHelpPaths: {
      eyebrow: "Help Paths",
      title: "Use the path that matches the issue"
    },
    techPaperCut: {
      eyebrow: "PaperCut Hive",
      title: "Give printing issues a clear starting point"
    },
    techAnswers: {
      eyebrow: "KW Answers",
      title: "Common account maintenance shortcuts"
    }
  },
  joeSupport: {
    name: "Joe Pine",
    role: "Tech Support Contact",
    photo: "../team/joe-pine-chair.jpg",
    photoAlt: "Joe Pine sitting in a chair",
    phone: "401-327-0888",
    email: "JoePine@KW.com",
    buttonLabel: "Book Tech Help with Joe",
    buttonHref: "https://calendly.com/joepinerealtor/tech-meeting-with-joe"
  },
  quickLinks: [
    { label: "Open PaperCut Hive", href: "https://hive.papercut.com/", external: true },
    { label: "Book Tech Help with Joe", href: "https://calendly.com/joepinerealtor/tech-meeting-with-joe", external: true },
    { label: "Email Joe", href: "mailto:JoePine@KW.com?subject=KW%20Tech%20Question" },
    { label: "Open KW Answers", href: "https://answers.kw.com/hc/en-us", external: true },
    { label: "KW Command Login", href: "https://agent.kw.com/", external: true }
  ],
  helpPaths: [
    {
      id: "printing-copier-support",
      kicker: "Printing + Copier Support",
      title: "Start with PaperCut Hive",
      summary: "Use PaperCut Hive first when you need help with printing, copier access, printer setup, or a queue that is not behaving the way it should.",
      links: [
        { label: "Open PaperCut Hive", href: "https://hive.papercut.com/", external: true },
        { label: "What to Include", href: "#papercut-hive" }
      ],
      active: true
    },
    {
      id: "one-on-one-help",
      kicker: "One-on-One Help",
      title: "Book time with Joe",
      summary: "Reserve a quick session when you want live help with KW Command, DocuSign, Canva, social setup, or another day-to-day tool.",
      links: [
        { label: "Schedule with Joe", href: "https://calendly.com/joepinerealtor/tech-meeting-with-joe", external: true },
        { label: "Check Joe Status", href: "#meet-with-joe" }
      ],
      active: true
    },
    {
      id: "quick-questions",
      kicker: "Quick Questions",
      title: "Email Joe directly",
      summary: "Send a note when you have a smaller question, need to share screenshots, or want Joe to point you toward the right next step before booking time.",
      links: [
        { label: "Email Joe", href: "mailto:JoePine@KW.com?subject=KW%20Tech%20Question" },
        { label: "Open KW Answers", href: "https://answers.kw.com/hc/en-us", external: true }
      ],
      active: true
    },
    {
      id: "self-service",
      kicker: "Self-Service",
      title: "Search KW Answers first",
      summary: "Go straight to official Keller Williams help articles for profile edits, password changes, app connections, email setup, and other common account tasks.",
      links: [
        { label: "Open KW Answers", href: "https://answers.kw.com/hc/en-us", external: true },
        { label: "Popular Articles", href: "#kw-answers" }
      ],
      active: true
    }
  ],
  paperCutCards: [
    {
      id: "papercut-request-link",
      kicker: "Request Link",
      title: "Open the PaperCut Hive portal",
      summary: "Start here for printer, copier, or queue-related issues so the request begins in the system that already knows the print environment.",
      links: [
        { label: "Open PaperCut Hive", href: "https://hive.papercut.com/", external: true }
      ],
      active: true
    },
    {
      id: "papercut-details",
      kicker: "What Helps Most",
      title: "Include the details that save back-and-forth",
      summary: "Add the printer or copier name, the office location, what you were trying to print, and a screenshot or photo of any error message when you can.",
      secondarySummary: "If more than one person is affected, mention that too so it is easier to separate a single-user problem from a device-wide issue.",
      links: [],
      active: true
    },
    {
      id: "papercut-loop-joe",
      kicker: "Need Another Path?",
      title: "Loop Joe in when the issue is broader",
      summary: "If the problem touches KW Command, login access, or another office system alongside printing, send Joe the issue details or book time so everything can be handled together.",
      links: [
        { label: "Email Joe", href: "mailto:JoePine@KW.com?subject=PaperCut%20Hive%20Question" },
        { label: "Book Time with Joe", href: "https://calendly.com/joepinerealtor/tech-meeting-with-joe", external: true }
      ],
      active: true
    }
  ],
  answerCards: [
    {
      id: "profile-setup",
      kicker: "Profile Setup",
      title: "Complete your KW profile",
      summary: "Use the new Profile of Record article for the main profile that controls password, KW email, emergency contact, and other core account settings.",
      links: [
        { label: "Open Article", href: "https://answers.kw.com/hc/en-us/articles/27149949379731-Complete-Your-KW-Profile-in-Command-New-Profile-of-Record", external: true }
      ],
      active: true
    },
    {
      id: "marketing-profile",
      kicker: "Marketing Profile",
      title: "Edit your website and app settings",
      summary: "Update the contact information, photo, legal footer, social links, and public-facing marketing details shown across your KW website and app.",
      links: [
        { label: "Open Article", href: "https://answers.kw.com/hc/en-us/articles/27150021091603-Edit-Your-Website-App-Settings-Marketing-Profile", external: true }
      ],
      active: true
    },
    {
      id: "security",
      kicker: "Security",
      title: "Change your username or password",
      summary: "Keep this one close when you need to update your KW login credentials or work through a basic sign-in maintenance step.",
      links: [
        { label: "Open Article", href: "https://answers.kw.com/hc/en-us/articles/360018077713-Change-Your-KW-Username-and-or-Password", external: true }
      ],
      active: true
    },
    {
      id: "app-connections",
      kicker: "App Connections",
      title: "Connect your applications in settings",
      summary: "Use this when DocuSign, Google, social accounts, or other connected tools need to be reviewed, fixed, or reconnected inside Command.",
      links: [
        { label: "Open Article", href: "https://answers.kw.com/hc/en-us/articles/360015701034-Connect-Your-Applications-in-Command-Settings", external: true }
      ],
      active: true
    },
    {
      id: "kw-email",
      kicker: "KW Email",
      title: "Create your @KW.com Gmail account",
      summary: "Keep this nearby for onboarding and email setup when an agent still needs to activate the KW-provided Gmail account.",
      links: [
        { label: "Open Article", href: "https://answers.kw.com/hc/en-us/articles/360011997494-Create-your-KW-com-Gmail-account", external: true }
      ],
      active: true
    },
    {
      id: "mobile-profile",
      kicker: "Mobile Profile",
      title: "Edit your marketing profile in the app",
      summary: "Use the mobile article when the goal is a quick public-profile update from the Command app without sitting down at desktop first.",
      links: [
        { label: "Open Article", href: "https://answers.kw.com/hc/en-us/articles/37409997028499-Edit-Your-KW-Marketing-Profile-in-the-Command-App", external: true }
      ],
      active: true
    }
  ]
};

export function getTechConnectContent(content = {}) {
  const techConnect = content.techConnect || {};
  const sectionOverrides = techConnect.sections || {};

  return {
    sections: {
      techOverview: {
        ...TECH_CONNECT_DEFAULT.sections.techOverview,
        ...(sectionOverrides.techOverview || {})
      },
      techHelpPaths: {
        ...TECH_CONNECT_DEFAULT.sections.techHelpPaths,
        ...(sectionOverrides.techHelpPaths || {})
      },
      techPaperCut: {
        ...TECH_CONNECT_DEFAULT.sections.techPaperCut,
        ...(sectionOverrides.techPaperCut || {})
      },
      techAnswers: {
        ...TECH_CONNECT_DEFAULT.sections.techAnswers,
        ...(sectionOverrides.techAnswers || {})
      }
    },
    joeSupport: {
      ...TECH_CONNECT_DEFAULT.joeSupport,
      ...(techConnect.joeSupport || {})
    },
    quickLinks: techConnect.quickLinks || TECH_CONNECT_DEFAULT.quickLinks,
    helpPaths: techConnect.helpPaths || TECH_CONNECT_DEFAULT.helpPaths,
    paperCutCards: techConnect.paperCutCards || TECH_CONNECT_DEFAULT.paperCutCards,
    answerCards: techConnect.answerCards || TECH_CONNECT_DEFAULT.answerCards
  };
}
