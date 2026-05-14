export const LEADERSHIP_SUPPORT_DEFAULT = {
  eyebrow: "Tech Help with Joe",
  title: "Schedule a one-on-one with Joe",
  summary: "Use Joe's calendar for live help with KW Command, DocuSign, Canva, social media, and day-to-day real estate tech tools.",
  photo: "team/joe-pine-chair.jpg",
  photoAlt: "Joe Pine sitting in a chair",
  buttonLabel: "Schedule an appointment",
  buttonHref: "https://calendly.com/joepinerealtor/tech-meeting-with-joe",
  mobileSummary: "Tap to schedule an appointment"
};

export function getLeadershipSupportContent(content = {}) {
  return {
    ...LEADERSHIP_SUPPORT_DEFAULT,
    ...(content.sections?.leadershipSupport || {})
  };
}
