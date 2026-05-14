"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  createCourseId,
  createDigitalLogoId,
  createLeadershipId,
  createMarketingToolId,
  createSourceFileId,
  createTechAnswerId,
  createTechHelpPathId,
  createTechPaperCutId,
  createTrainingResourceId,
  createVendorId,
  validateCourseDrafts,
  validateDigitalLogoDrafts,
  validateLeadershipDrafts,
  validateMarketingToolDrafts,
  validateOfficeCardDraft,
  validateOfficeOperationsDraft,
  validateRoomsDraft,
  validateSourceFileDrafts,
  validateVendorDrafts
} from "./contentDrafts";
import { portalPages } from "@/lib/portal-config";
import { createCustomSectionCardId, createCustomSectionId, getCustomSectionsForPage } from "@/lib/custom-sections";
import { LEADERSHIP_SUPPORT_DEFAULT, getLeadershipSupportContent } from "@/lib/leadership-support";
import { getOverviewContent } from "@/lib/overview-content";
import { getNavigationContent } from "@/lib/portal-navigation";
import { getSiteChromeContent } from "@/lib/portal-site-chrome";
import { getTechConnectContent } from "@/lib/tech-connect-content";

const EDITABLE_SECTIONS = [
  { id: "navigation", label: "Navigation", target: "", status: "Page menu" },
  { id: "siteChrome", label: "Site Chrome", target: "", status: "Brand + footer" },
  { id: "customSections", label: "Custom Sections", target: "", status: "Section builder" },
  { id: "overview", label: "Overview", target: "#overview", status: "Homepage intro" },
  { id: "trainingResources", label: "Training Resources", target: "#training-resources", status: "Training cards" },
  { id: "office", label: "Office", target: "#office", status: "Office module" },
  { id: "rooms", label: "Rooms", target: "#conference-rooms", status: "Calendar module" },
  { id: "leadership", label: "Leadership", target: "#leadership", status: "People module" },
  { id: "vendors", label: "Vendor Row", target: "#vendor-row", status: "Vendor module" },
  { id: "brandAssets", label: "Marketing + Brand Assets", target: "#brand-overview", status: "Asset module" },
  { id: "techConnect", label: "Tech Connect", target: "#tech-overview", status: "Tech module" },
  { id: "productivityCourses", label: "Productivity Coaching", target: "#training", status: "Courses module" }
];

const SELECTABLE_CANVAS_SELECTOR = [
  "[data-editable-type]",
  ".page-content > section",
  ".course-card",
  ".office-card",
  ".leader-card",
  ".alc-poster-card",
  ".alc-card",
  ".leadership-support-card",
  ".vendor-card",
  ".marketing-tool-card",
  ".asset-card",
  ".asset-source-card",
  ".custom-section-card",
  ".leadership-card",
  ".portal-action-card",
  ".launch-card",
  ".content-strip-link",
  ".section-nav-link",
  ".button",
  ".chip-link",
  ".card-tag-link"
].join(",");

let nextVisualEditorId = 1;
const EDITOR_SESSION_PASSCODE_KEY = "kwpVisualEditorPasscode";
const EDITOR_PAGE_LINKS = [
  { id: "home", label: "Home", href: "/admin/visual/" },
  { id: "brandAssets", label: "Brand Assets", href: "/admin/visual/brand-assets/" },
  { id: "tech", label: "Tech Connect", href: "/admin/visual/tech/" }
];
const OFFICE_SECTION_DEFAULT = {
  eyebrow: "Office Hub",
  title: "Resources, office information, and internal support"
};
const ROOMS_SECTION_DEFAULT = {
  eyebrow: "Conference + Training Rooms",
  title: "Book a room and review current reservations"
};
const LEADERSHIP_SECTION_DEFAULT = {
  eyebrow: "Leadership Directory",
  title: "Office leadership team"
};
const VENDOR_DIRECTORY_SECTION_DEFAULT = {
  eyebrow: "Vendor Directory",
  title: "Preferred office vendors",
  summary: "A fast referral directory for lender, title, insurance, inspection, media, construction, cleaning, moving, and remediation contacts."
};
const VENDOR_CORE_SECTION_DEFAULT = {
  eyebrow: "Core Partners",
  title: "Vendors agents reach for constantly"
};
const VENDOR_SERVICES_SECTION_DEFAULT = {
  eyebrow: "Service Vendors",
  title: "The rest of the vendor directory"
};
const BRAND_OVERVIEW_SECTION_DEFAULT = {
  eyebrow: "Marketing + Brand Assets",
  title: "Marketing tools, logo previews, and downloads",
  summary: "Open Keller Williams marketing tools, onboarding help, standards, and ordering links first, then jump into logo previews and source files when you need exact artwork."
};
const MARKETING_TOOLS_SECTION_DEFAULT = {
  eyebrow: "Marketing Tools",
  title: "The links agents usually need first"
};
const DIGITAL_LOGOS_SECTION_DEFAULT = {
  eyebrow: "Digital Logos",
  title: "Preview before downloading"
};
const SOURCE_FILES_SECTION_DEFAULT = {
  eyebrow: "Source Files",
  title: "EPS artwork and print-ready files"
};
const ALC_SECTION_DEFAULT = {
  eyebrow: "Associate Leadership Council",
  title: "2026 ALC Board of Directors",
  summary: "Poster set for the ALC board members and committees posted throughout the brokerage."
};
const JOE_AVAILABILITY_DEFAULT = {
  status: "unavailable",
  trackerEnabled: true,
  timezone: "America/New_York",
  eventDurationMinutes: 30,
  nextOpenSlotIso: "",
  nextOpenSlotWorkingWindowEndIso: "",
  availableNowEndIso: "",
  busyNowStartIso: "",
  busyNowEndIso: "",
  nextBusyStartIso: "",
  nextBusyEndIso: "",
  nextAppointmentAvailableIso: "",
  workingHours: [
    {
      day: "Wednesday",
      start: "09:00",
      end: "17:00"
    },
    {
      day: "Thursday",
      start: "09:00",
      end: "17:00"
    },
    {
      day: "Friday",
      start: "09:00",
      end: "16:00"
    }
  ],
  availableNowLabel: "Joe is available to chat",
  availableNowSummary: "Schedule an appointment with Joe.",
  busyNowLabel: "Joe is in another appointment",
  unavailableLabel: "Joe is unavailable",
  noSlotsSummary: "No open tech-help slots are listed right now."
};

export function VisualEditorOverlay({ currentEditorPage = "home", initialContent, initialSectionId = "productivityCourses", previewHref = "/" }) {
  const [activeSectionId, setActiveSectionId] = useState(initialSectionId);
  const [content, setContent] = useState(initialContent);
  const [joeAvailability, setJoeAvailability] = useState(JOE_AVAILABILITY_DEFAULT);
  const [passcode, setPasscode] = useState("");
  const [adminPasscode, setAdminPasscode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingItemId, setEditingItemId] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  const pageDefaults = portalPages[currentEditorPage] || portalPages.home;
  const navigation = getNavigationContent(content, currentEditorPage, pageDefaults);
  const navigationErrors = useMemo(() => validateNavigationDraft(navigation), [navigation]);
  const siteChrome = getSiteChromeContent(content, currentEditorPage, pageDefaults);
  const siteChromeErrors = useMemo(() => validateSiteChromeDraft(siteChrome), [siteChrome]);
  const overview = getOverviewContent(content);
  const overviewErrors = useMemo(() => validateOverviewDraft(overview), [overview]);
  const customSections = getCustomSectionsForPage(content, currentEditorPage);
  const customSectionErrors = useMemo(() => validateCustomSectionsDraft(customSections), [customSections]);
  const courses = content?.courses || [];
  const trainingResources = content?.trainingResources || [];
  const leadership = content?.leadership || [];
  const vendors = content?.vendors || [];
  const brandAssets = content?.brandAssets || {};
  const marketingTools = brandAssets.marketingTools || [];
  const digitalLogos = brandAssets.digitalLogos || [];
  const sourceFiles = brandAssets.sourceFiles || [];
  const techConnect = getTechConnectContent(content);
  const techSections = techConnect.sections;
  const techJoeSupport = techConnect.joeSupport;
  const techQuickLinks = techConnect.quickLinks;
  const techHelpPaths = techConnect.helpPaths;
  const techPaperCutCards = techConnect.paperCutCards;
  const techAnswerCards = techConnect.answerCards;
  const office = content?.office || {};
  const officeSection = content?.sections?.office || OFFICE_SECTION_DEFAULT;
  const rooms = office.rooms || {};
  const roomsSection = content?.sections?.rooms || ROOMS_SECTION_DEFAULT;
  const leadershipSection = content?.sections?.leadership || LEADERSHIP_SECTION_DEFAULT;
  const vendorDirectorySection = content?.sections?.vendorDirectory || VENDOR_DIRECTORY_SECTION_DEFAULT;
  const vendorCoreSection = content?.sections?.vendorCore || VENDOR_CORE_SECTION_DEFAULT;
  const vendorServicesSection = content?.sections?.vendorServices || VENDOR_SERVICES_SECTION_DEFAULT;
  const brandOverviewSection = content?.sections?.brandOverview || BRAND_OVERVIEW_SECTION_DEFAULT;
  const marketingToolsSection = content?.sections?.marketingTools || MARKETING_TOOLS_SECTION_DEFAULT;
  const digitalLogosSection = content?.sections?.digitalLogos || DIGITAL_LOGOS_SECTION_DEFAULT;
  const sourceFilesSection = content?.sections?.sourceFiles || SOURCE_FILES_SECTION_DEFAULT;
  const alcSection = content?.sections?.alc || ALC_SECTION_DEFAULT;
  const leadershipSupport = getLeadershipSupportContent(content);
  const trainingResourceSection = content?.sections?.trainingResources || {
    eyebrow: "Self-Paced Support",
    title: "Training Resources"
  };
  const courseErrors = useMemo(() => validateCourseDrafts(courses), [courses]);
  const trainingResourceErrors = useMemo(() => validateCourseDrafts(trainingResources), [trainingResources]);
  const leadershipErrors = useMemo(() => validateLeadershipDrafts(leadership), [leadership]);
  const vendorErrors = useMemo(() => validateVendorDrafts(vendors), [vendors]);
  const marketingToolErrors = useMemo(() => validateMarketingToolDrafts(marketingTools), [marketingTools]);
  const digitalLogoErrors = useMemo(() => validateDigitalLogoDrafts(digitalLogos), [digitalLogos]);
  const sourceFileErrors = useMemo(() => validateSourceFileDrafts(sourceFiles), [sourceFiles]);
  const brandAssetErrors = [...marketingToolErrors, ...digitalLogoErrors, ...sourceFileErrors];
  const techHelpPathErrors = useMemo(() => validateMarketingToolDrafts(techHelpPaths), [techHelpPaths]);
  const techPaperCutErrors = useMemo(() => validateMarketingToolDrafts(techPaperCutCards), [techPaperCutCards]);
  const techAnswerErrors = useMemo(() => validateMarketingToolDrafts(techAnswerCards), [techAnswerCards]);
  const techErrors = [...techHelpPathErrors, ...techPaperCutErrors, ...techAnswerErrors];
  const activeSection = EDITABLE_SECTIONS.find((section) => section.id === activeSectionId) || EDITABLE_SECTIONS[0];
  const selectedCourseIndex = selectedItem?.type === "course-card"
    ? courses.findIndex((course) => course.id === selectedItem.editableId)
    : -1;
  const selectedTrainingResourceIndex = selectedItem?.type === "training-resource-card"
    ? trainingResources.findIndex((resource) => resource.id === selectedItem.editableId)
    : -1;
  const selectedLeaderIndex = selectedItem?.type === "leader-card" || selectedItem?.type === "alc-poster-card"
    ? leadership.findIndex((person) => person.id === selectedItem.editableId)
    : -1;
  const selectedVendorIndex = selectedItem?.type === "vendor-card"
    ? vendors.findIndex((vendor) => vendor.id === selectedItem.editableId)
    : -1;
  const selectedMarketingToolIndex = selectedItem?.type === "marketing-tool-card"
    ? marketingTools.findIndex((tool) => tool.id === selectedItem.editableId)
    : -1;
  const selectedDigitalLogoIndex = selectedItem?.type === "digital-logo-card"
    ? digitalLogos.findIndex((logo) => logo.id === selectedItem.editableId)
    : -1;
  const selectedSourceFileIndex = selectedItem?.type === "source-file-card"
    ? sourceFiles.findIndex((file) => file.id === selectedItem.editableId)
    : -1;
  const selectedTechHelpPathIndex = selectedItem?.type === "tech-help-card"
    ? techHelpPaths.findIndex((card) => card.id === selectedItem.editableId)
    : -1;
  const selectedTechPaperCutIndex = selectedItem?.type === "tech-papercut-card"
    ? techPaperCutCards.findIndex((card) => card.id === selectedItem.editableId)
    : -1;
  const selectedTechAnswerIndex = selectedItem?.type === "tech-answer-card"
    ? techAnswerCards.findIndex((card) => card.id === selectedItem.editableId)
    : -1;
  const selectedCourse = selectedCourseIndex >= 0 ? courses[selectedCourseIndex] : null;
  const selectedTrainingResource = selectedTrainingResourceIndex >= 0 ? trainingResources[selectedTrainingResourceIndex] : null;
  const selectedLeader = selectedLeaderIndex >= 0 ? leadership[selectedLeaderIndex] : null;
  const selectedVendor = selectedVendorIndex >= 0 ? vendors[selectedVendorIndex] : null;
  const selectedMarketingTool = selectedMarketingToolIndex >= 0 ? marketingTools[selectedMarketingToolIndex] : null;
  const selectedDigitalLogo = selectedDigitalLogoIndex >= 0 ? digitalLogos[selectedDigitalLogoIndex] : null;
  const selectedSourceFile = selectedSourceFileIndex >= 0 ? sourceFiles[selectedSourceFileIndex] : null;
  const selectedTechHelpPath = selectedTechHelpPathIndex >= 0 ? techHelpPaths[selectedTechHelpPathIndex] : null;
  const selectedTechPaperCut = selectedTechPaperCutIndex >= 0 ? techPaperCutCards[selectedTechPaperCutIndex] : null;
  const selectedTechAnswer = selectedTechAnswerIndex >= 0 ? techAnswerCards[selectedTechAnswerIndex] : null;
  const selectedNavigationListKey = getNavigationListKeyFromItem(selectedItem);
  const selectedNavigationLabelKey = getNavigationLabelKeyFromItem(selectedItem);
  const selectedNavigationItems = selectedNavigationListKey ? navigation[selectedNavigationListKey] || [] : [];
  const selectedNavigationIndex = selectedNavigationListKey ? Number.parseInt(selectedItem?.editableId || "-1", 10) : -1;
  const selectedNavigationLink = selectedNavigationIndex >= 0 ? selectedNavigationItems[selectedNavigationIndex] : null;
  const selectedSiteChromeItem = getSiteChromeSelectionFromItem(selectedItem);
  const selectedOverviewItem = getOverviewSelectionFromItem(selectedItem);
  const selectedCustomSectionId = getCustomSectionIdFromItem(selectedItem);
  const selectedCustomSectionIndex = selectedCustomSectionId ? customSections.findIndex((section) => section.id === selectedCustomSectionId) : -1;
  const selectedCustomSection = selectedCustomSectionIndex >= 0 ? customSections[selectedCustomSectionIndex] : null;
  const selectedCustomSectionCardId = selectedItem?.type === "custom-section-card" ? String(selectedItem.editableId || "").split(":")[1] || "" : "";
  const selectedCustomSectionCardIndex = selectedCustomSection && selectedCustomSectionCardId
    ? (selectedCustomSection.cards || []).findIndex((card) => card.id === selectedCustomSectionCardId)
    : -1;
  const selectedCustomSectionCard = selectedCustomSectionCardIndex >= 0 ? selectedCustomSection.cards[selectedCustomSectionCardIndex] : null;
  const selectedOfficeCardKey = getOfficeCardKeyFromItem(selectedItem);
  const selectedOfficeCard = selectedOfficeCardKey ? office[selectedOfficeCardKey] : null;
  const roomErrors = validateRoomsDraft(rooms);
  const selectedOfficeCardErrors = selectedOfficeCardKey === "operations"
    ? validateOfficeOperationsDraft(selectedOfficeCard || {})
    : selectedOfficeCard
    ? validateOfficeCardDraft(selectedOfficeCard, "Office card")
    : [];
  const selectedEditableCard = selectedCourse || selectedTrainingResource;
  const selectedEditableCardIndex = selectedCourse ? selectedCourseIndex : selectedTrainingResourceIndex;
  const selectedEditableCardErrors = selectedTrainingResource ? trainingResourceErrors : courseErrors;
  const selectedEditableCardType = selectedTrainingResource ? "training-resource-card" : "course-card";
  const shouldShowPanel = true;
  const canAddCard = activeSectionId === "trainingResources" || activeSectionId === "productivityCourses" || activeSectionId === "leadership" || activeSectionId === "vendors" || activeSectionId === "brandAssets" || activeSectionId === "techConnect" || activeSectionId === "customSections";

  useEffect(() => {
    const storedPasscode = window.sessionStorage.getItem(EDITOR_SESSION_PASSCODE_KEY);

    if (!storedPasscode) {
      return;
    }

    unlockEditorWithPasscode(storedPasscode, {
      rememberSession: false,
      restoredSession: true
    });
  }, []);

  useEffect(() => {
    if (!isUnlocked) {
      return undefined;
    }

    function selectCanvasElement(event) {
      if (event.target.closest(".visual-editor-toolbar, .visual-editor-panel, .visual-editor-floating-toolbar, .visual-editor-floating-editor")) {
        return;
      }

      const element = event.target.closest(SELECTABLE_CANVAS_SELECTOR);

      if (!element || !document.body.contains(element)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      const nextSelectedItem = describeSelectedElement(element);
      const relatedSection = findSectionForSelectedItem(nextSelectedItem);

      if (relatedSection) {
        setActiveSectionId(relatedSection.id);
      }

      setSelectedItem(nextSelectedItem);
      setEditingItemId("");
    }

    document.addEventListener("click", selectCanvasElement, true);

    return () => {
      document.removeEventListener("click", selectCanvasElement, true);
    };
  }, [isUnlocked]);

  useEffect(() => {
    document.querySelectorAll(".visual-editor-selected").forEach((element) => {
      element.classList.remove("visual-editor-selected");
    });

    if (!selectedItem?.visualId) {
      return;
    }

    const element = document.querySelector(`[data-visual-editor-id="${selectedItem.visualId}"]`);
    element?.classList.add("visual-editor-selected");
  }, [selectedItem]);

  useEffect(() => {
    document.body.classList.toggle("visual-editor-has-selection", isUnlocked && Boolean(selectedItem));

    return () => {
      document.body.classList.remove("visual-editor-has-selection");
    };
  }, [isUnlocked, selectedItem]);

  async function unlockEditor(event) {
    event.preventDefault();
    await unlockEditorWithPasscode(passcode, {
      rememberSession: true,
      restoredSession: false
    });
  }

  async function unlockEditorWithPasscode(nextPasscode, { rememberSession, restoredSession }) {
    if (!nextPasscode) {
      return;
    }

    setIsLoading(true);
    setError("");
    setStatusMessage(restoredSession ? "Restoring editor session." : "");

    try {
      const response = await fetch("/api/admin/content/", {
        cache: "no-store",
        headers: {
          "x-kwp-admin-passcode": nextPasscode
        }
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to unlock editor.");
      }

      setContent(payload.content);
      await loadJoeAvailability(nextPasscode);
      setAdminPasscode(nextPasscode);
      setPasscode("");
      setIsUnlocked(true);
      setEditingItemId("");
      setSelectedItem(null);
      if (rememberSession) {
        window.sessionStorage.setItem(EDITOR_SESSION_PASSCODE_KEY, nextPasscode);
      }
      setStatusMessage(restoredSession ? "Editor session restored." : "Editor unlocked for this browser session.");
    } catch (unlockError) {
      if (restoredSession) {
        window.sessionStorage.removeItem(EDITOR_SESSION_PASSCODE_KEY);
        setError("Editor session expired. Enter the passcode again.");
      } else {
        setError(unlockError.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function loadJoeAvailability(nextPasscode) {
    const response = await fetch("/api/admin/availability/", {
      cache: "no-store",
      headers: {
        "x-kwp-admin-passcode": nextPasscode
      }
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Unable to load Joe availability.");
    }

    const nextAvailability = {
      ...JOE_AVAILABILITY_DEFAULT,
      ...(payload.availability || {})
    };

    setJoeAvailability(nextAvailability);
    previewJoeAvailability(nextAvailability);
  }

  function selectSection(section) {
    setActiveSectionId(section.id);
    setEditingItemId("");
    setSelectedItem(null);

    if (section.target) {
      document.querySelector(section.target)?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }

  function editSelectedItem() {
    if (!selectedItem) {
      return;
    }

    if (getNavigationListKeyFromItem(selectedItem) || getNavigationLabelKeyFromItem(selectedItem)) {
      setActiveSectionId("navigation");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Editing this navigation item." } : currentItem);
      return;
    }

    if (getSiteChromeSelectionFromItem(selectedItem)) {
      setActiveSectionId("siteChrome");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Editing this site chrome item." } : currentItem);
      return;
    }

    if (getOverviewSelectionFromItem(selectedItem)) {
      setActiveSectionId("overview");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Editing this overview content." } : currentItem);
      return;
    }

    if (getCustomSectionIdFromItem(selectedItem)) {
      setActiveSectionId("customSections");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: selectedItem.type === "custom-section-card" ? "Editing this custom section card." : "Editing this custom section." } : currentItem);
      return;
    }

    if (selectedItem.type === "course-card" && selectedItem.editableId) {
      setActiveSectionId("productivityCourses");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Editing this card." } : currentItem);
      return;
    }

    if (selectedItem.type === "training-resource-card" && selectedItem.editableId) {
      setActiveSectionId("trainingResources");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Editing this training card." } : currentItem);
      return;
    }

    if (
      selectedItem.sectionId === "training-resources" ||
      selectedItem.editableId === "trainingResources"
    ) {
      setActiveSectionId("trainingResources");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Editing this section heading." } : currentItem);
      return;
    }

    if (
      (selectedItem.type === "section" || selectedItem.type === "section-eyebrow" || selectedItem.type === "section-heading") &&
      (selectedItem.sectionId === "office" || selectedItem.editableId === "office")
    ) {
      setActiveSectionId("office");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Editing this office section heading." } : currentItem);
      return;
    }

    if (
      selectedItem.sectionId === "conference-rooms" ||
      selectedItem.editableId === "rooms" ||
      selectedItem.type === "room-booking-card" ||
      selectedItem.type === "room-action" ||
      selectedItem.type === "room-calendar"
    ) {
      setActiveSectionId("rooms");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Editing room booking content." } : currentItem);
      return;
    }

    if (selectedItem.type === "leader-card" || selectedItem.type === "alc-poster-card") {
      setActiveSectionId("leadership");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Editing this leadership card." } : currentItem);
      return;
    }

    if (selectedItem.type === "leadership-support-card" || selectedItem.type === "leadership-support-field" || selectedItem.editableId?.startsWith("leadershipSupport")) {
      setActiveSectionId("leadership");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Editing the Tech Help with Joe card." } : currentItem);
      return;
    }

    if (selectedItem.type === "vendor-card" && selectedItem.editableId) {
      setActiveSectionId("vendors");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Editing this vendor card." } : currentItem);
      return;
    }

    if (
      (selectedItem.type === "marketing-tool-card" || selectedItem.type === "digital-logo-card" || selectedItem.type === "source-file-card") &&
      selectedItem.editableId
    ) {
      setActiveSectionId("brandAssets");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Editing this brand asset card." } : currentItem);
      return;
    }

    if (
      (selectedItem.type === "tech-help-card" || selectedItem.type === "tech-papercut-card" || selectedItem.type === "tech-answer-card") &&
      selectedItem.editableId
    ) {
      setActiveSectionId("techConnect");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Editing this Tech Connect card." } : currentItem);
      return;
    }

    if (selectedItem.type === "tech-joe-support" || selectedItem.type === "tech-joe-link") {
      setActiveSectionId("techConnect");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Editing the Tech Connect Joe support block." } : currentItem);
      return;
    }

    if (selectedItem.type === "joe-availability-card") {
      setActiveSectionId("techConnect");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Editing the shared Joe availability status." } : currentItem);
      return;
    }

    if (selectedItem.type === "tech-quick-links") {
      setActiveSectionId("techConnect");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Editing the Tech Connect quick links." } : currentItem);
      return;
    }

    if (
      (selectedItem.type === "section" || selectedItem.type === "section-eyebrow" || selectedItem.type === "section-heading" || selectedItem.type === "section-summary") &&
      (selectedItem.sectionId === "tech-overview" || selectedItem.sectionId === "help-paths" || selectedItem.sectionId === "papercut-hive" || selectedItem.sectionId === "kw-answers" || selectedItem.editableId === "techOverview" || selectedItem.editableId === "techHelpPaths" || selectedItem.editableId === "techPaperCut" || selectedItem.editableId === "techAnswers")
    ) {
      setActiveSectionId("techConnect");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Editing this Tech Connect section heading." } : currentItem);
      return;
    }

    if (
      (selectedItem.type === "section" || selectedItem.type === "section-eyebrow" || selectedItem.type === "section-heading" || selectedItem.type === "section-summary") &&
      (selectedItem.sectionId === "brand-overview" || selectedItem.sectionId === "marketing-tools" || selectedItem.sectionId === "digital-logos" || selectedItem.sectionId === "source-files" || selectedItem.editableId === "brandOverview" || selectedItem.editableId === "marketingTools" || selectedItem.editableId === "digitalLogos" || selectedItem.editableId === "sourceFiles")
    ) {
      setActiveSectionId("brandAssets");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Editing this brand-assets section heading." } : currentItem);
      return;
    }

    if (
      (selectedItem.type === "section" || selectedItem.type === "section-eyebrow" || selectedItem.type === "section-heading" || selectedItem.type === "section-summary") &&
      (selectedItem.sectionId === "vendor-row" || selectedItem.sectionId === "vendor-core-partners" || selectedItem.sectionId === "vendor-services" || selectedItem.editableId === "vendorDirectory" || selectedItem.editableId === "vendorCore" || selectedItem.editableId === "vendorServices")
    ) {
      setActiveSectionId("vendors");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Editing this vendor section heading." } : currentItem);
      return;
    }

    if (
      (selectedItem.type === "section" || selectedItem.type === "section-eyebrow" || selectedItem.type === "section-heading" || selectedItem.type === "section-summary") &&
      (selectedItem.sectionId === "leadership" || selectedItem.editableId === "leadership" || selectedItem.editableId === "alc")
    ) {
      setActiveSectionId("leadership");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Editing this leadership heading." } : currentItem);
      return;
    }

    if ((selectedItem.type === "office-card" || selectedItem.type === "office-chip") && getOfficeCardKeyFromItem(selectedItem)) {
      setActiveSectionId("office");
      setEditingItemId(selectedItem.visualId);
      setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Editing this office card." } : currentItem);
      return;
    }

    setEditingItemId(selectedItem.visualId);
    setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: "Full editing controls for this item type are coming in a future module slice." } : currentItem);
  }

  function moveSelectedSection(direction) {
    const offset = direction === "up" ? -1 : 1;

    if (selectedCustomSectionCardIndex >= 0) {
      moveCustomSectionCard(selectedCustomSectionIndex, selectedCustomSectionCardIndex, offset);
      setStatusMessage("Custom section card moved. Save when ready.");
      return;
    }

    if (selectedCustomSectionIndex >= 0) {
      moveCustomSection(selectedCustomSectionIndex, offset);
      setStatusMessage("Custom section moved. Save when ready.");
      return;
    }

    setSelectedItem((currentItem) => currentItem ? { ...currentItem, panelHint: `${direction === "up" ? "Move up" : "Move down"} will be enabled when section ordering is data-backed.` } : currentItem);
  }

  function setToolbarStatus(action) {
    setError("");
    setStatusMessage(`${action} is part of the visual editor plan. This control is staged here so the editor feels like a true page editor as each action becomes live.`);
  }

  function openNavigationEditor() {
    setActiveSectionId("navigation");
    setEditingItemId("");
    setSelectedItem(null);
    setError("");
    setStatusMessage("Navigation tools are open for this page.");
  }

  function openAddSectionTools() {
    setActiveSectionId("customSections");
    setEditingItemId("");
    setSelectedItem(null);
    setError("");
    setStatusMessage("Custom section tools are open for this page.");
  }

  function addCardFromToolbar() {
    if (activeSectionId === "trainingResources") {
      addTrainingResource();
      setStatusMessage("Training Resources card added. Edit the new card, then save when ready.");
      return;
    }

    if (activeSectionId === "productivityCourses") {
      addCourse();
      setStatusMessage("Productivity Coaching card added. Edit the new card, then save when ready.");
      return;
    }

    if (activeSectionId === "leadership") {
      addLeader();
      setStatusMessage("Leadership card added. Edit the new card, then save when ready.");
      return;
    }

    if (activeSectionId === "vendors") {
      addVendor();
      setStatusMessage("Vendor card added. Edit the new card, then save when ready.");
      return;
    }

    if (activeSectionId === "brandAssets") {
      addMarketingTool();
      setStatusMessage("Marketing tool card added. Edit the new card, then save when ready.");
      return;
    }

    if (activeSectionId === "techConnect") {
      addTechHelpPath();
      setStatusMessage("Tech help-path card added. Edit the new card, then save when ready.");
      return;
    }

    if (activeSectionId === "customSections") {
      addCustomSectionCard();
      setStatusMessage("Custom section card added. Edit the new card, then save when ready.");
      return;
    }

    setToolbarStatus("Add Card");
  }

  function setNavigationList(listKey, nextItems) {
    if (listKey === "dailyAccessLinks") {
      setContent((currentContent) => ({
        ...currentContent,
        navigation: {
          ...(currentContent.navigation || {}),
          dailyAccessLinks: nextItems
        }
      }));
      syncNavigationListPreview(listKey, nextItems);
      setStatusMessage("");
      setError("");
      return;
    }

    setContent((currentContent) => ({
      ...currentContent,
      navigation: {
        ...(currentContent.navigation || {}),
        [currentEditorPage]: {
          ...((currentContent.navigation || {})[currentEditorPage] || {}),
          [listKey]: nextItems
        }
      }
    }));
    syncNavigationListPreview(listKey, nextItems);
    setStatusMessage("");
    setError("");
  }

  function updateNavigationLink(listKey, index, field, value) {
    const currentItems = navigation[listKey] || [];
    const nextItems = currentItems.map((link, linkIndex) => (
      linkIndex === index
        ? {
            ...link,
            [field]: value
          }
        : link
    ));

    setNavigationList(listKey, nextItems);
  }

  function addNavigationLink(listKey) {
    const currentItems = navigation[listKey] || [];
    const nextItems = [
      ...currentItems,
      {
        label: "New Link",
        href: "#",
        button: listKey === "navLinks" ? "" : "secondary",
        external: false,
        active: false,
        page: false,
        primary: false
      }
    ];

    setNavigationList(listKey, nextItems);
  }

  function removeNavigationLink(listKey, index) {
    setNavigationList(listKey, (navigation[listKey] || []).filter((_, linkIndex) => linkIndex !== index));
    if (selectedItem && selectedItem.editableId === String(index) && getNavigationListKeyFromItem(selectedItem) === listKey) {
      setEditingItemId("");
      setSelectedItem(null);
    }
  }

  function moveNavigationLink(listKey, index, direction) {
    const nextIndex = index + direction;
    const nextItems = [...(navigation[listKey] || [])];

    if (nextIndex < 0 || nextIndex >= nextItems.length) {
      return;
    }

    [nextItems[index], nextItems[nextIndex]] = [nextItems[nextIndex], nextItems[index]];
    setNavigationList(listKey, nextItems);
  }

  function updateNavigationLabel(field, value) {
    if (field === "dailyAccessKicker" || field === "dailyAccessTitle") {
      setContent((currentContent) => ({
        ...currentContent,
        navigation: {
          ...(currentContent.navigation || {}),
          [field]: value
        }
      }));
      syncNavigationLabelPreview(field, value);
      setStatusMessage("");
      setError("");
      return;
    }

    setContent((currentContent) => ({
      ...currentContent,
      navigation: {
        ...(currentContent.navigation || {}),
        [currentEditorPage]: {
          ...((currentContent.navigation || {})[currentEditorPage] || {}),
          [field]: value
        }
      }
    }));
    syncNavigationLabelPreview(field, value);
    setStatusMessage("");
    setError("");
  }

  function setSiteChrome(nextSiteChrome) {
    setContent((currentContent) => ({
      ...currentContent,
      siteChrome: {
        ...(currentContent.siteChrome || {}),
        footer: nextSiteChrome.footer,
        pages: {
          ...((currentContent.siteChrome || {}).pages || {}),
          [currentEditorPage]: {
            brandHref: nextSiteChrome.brandHref,
            brandLogo: nextSiteChrome.brandLogo,
            brandTitle: nextSiteChrome.brandTitle
          }
        }
      }
    }));
    syncSiteChromePreview(nextSiteChrome);
    setStatusMessage("");
    setError("");
  }

  function updateSiteBrand(field, value) {
    setSiteChrome({
      ...siteChrome,
      [field]: value
    });
  }

  function updateSiteFooter(field, value) {
    setSiteChrome({
      ...siteChrome,
      footer: {
        ...(siteChrome.footer || {}),
        [field]: value
      }
    });
  }

  function setOverview(nextOverview) {
    setContent((currentContent) => ({
      ...currentContent,
      sections: {
        ...(currentContent.sections || {}),
        overview: nextOverview
      }
    }));
    syncOverviewPreview(nextOverview);
    setStatusMessage("");
    setError("");
  }

  function updateOverviewField(field, value) {
    setOverview({
      ...overview,
      [field]: value
    });
  }

  function updateOverviewGroup(groupKey, field, value) {
    setOverview({
      ...overview,
      [groupKey]: {
        ...(overview[groupKey] || {}),
        [field]: value
      }
    });
  }

  function updateOverviewLink(groupKey, index, field, value) {
    const group = overview[groupKey] || {};
    const nextLinks = (group.links || []).map((link, linkIndex) => (
      linkIndex === index
        ? {
            ...link,
            [field]: value
          }
        : link
    ));

    updateOverviewGroup(groupKey, "links", nextLinks);
  }

  function addOverviewLink(groupKey) {
    const group = overview[groupKey] || {};
    const nextLinks = [
      ...(group.links || []),
      {
        label: "New Link",
        href: "#",
        external: false,
        active: true
      }
    ];

    updateOverviewGroup(groupKey, "links", nextLinks);
  }

  function removeOverviewLink(groupKey, index) {
    const group = overview[groupKey] || {};
    const nextLinks = (group.links || []).filter((_, linkIndex) => linkIndex !== index);

    updateOverviewGroup(groupKey, "links", nextLinks);
  }

  function moveOverviewLink(groupKey, index, direction) {
    const group = overview[groupKey] || {};
    const nextIndex = index + direction;
    const nextLinks = [...(group.links || [])];

    if (nextIndex < 0 || nextIndex >= nextLinks.length) {
      return;
    }

    [nextLinks[index], nextLinks[nextIndex]] = [nextLinks[nextIndex], nextLinks[index]];
    updateOverviewGroup(groupKey, "links", nextLinks);
  }

  function setCustomSections(nextSections) {
    setContent((currentContent) => ({
      ...currentContent,
      customSections: {
        ...(currentContent.customSections || {}),
        [currentEditorPage]: nextSections
      }
    }));
    syncCustomSectionsPreview(nextSections);
    setStatusMessage("");
    setError("");
  }

  function addCustomSection() {
    const nextSection = {
      id: createCustomSectionId(customSections),
      type: "linkGrid",
      eyebrow: "New Section",
      title: "New Portal Section",
      summary: "Add a short section description.",
      cards: [
        {
          id: "custom-card-1",
          kicker: "New",
          title: "New Card",
          summary: "Add a short description.",
          links: [
            {
              label: "Open Link",
              href: "#",
              external: false
            }
          ],
          active: true
        }
      ],
      active: true
    };

    setCustomSections([...customSections, nextSection]);
    setActiveSectionId("customSections");
    setStatusMessage("Custom section added. Edit it, then save when ready.");
  }

  function updateCustomSection(index, field, value) {
    const nextSections = customSections.map((section, sectionIndex) => (
      sectionIndex === index
        ? {
            ...section,
            [field]: value
          }
        : section
    ));

    setCustomSections(nextSections);
  }

  function removeCustomSection(index) {
    const sectionId = customSections[index]?.id;
    setCustomSections(customSections.filter((_, sectionIndex) => sectionIndex !== index));
    if (selectedCustomSectionId === sectionId) {
      setEditingItemId("");
      setSelectedItem(null);
    }
  }

  function moveCustomSection(index, direction) {
    const nextIndex = index + direction;
    const nextSections = [...customSections];

    if (nextIndex < 0 || nextIndex >= nextSections.length) {
      return;
    }

    [nextSections[index], nextSections[nextIndex]] = [nextSections[nextIndex], nextSections[index]];
    setCustomSections(nextSections);
  }

  function addCustomSectionCard(sectionIndex = Math.max(0, customSections.length - 1)) {
    if (!customSections.length) {
      addCustomSection();
      return;
    }

    const section = customSections[sectionIndex] || customSections[0];
    const nextCard = {
      id: createCustomSectionCardId(section.cards || []),
      kicker: "New",
      title: "New Card",
      summary: "Add a short description.",
      links: [
        {
          label: "Open Link",
          href: "#",
          external: false
        }
      ],
      active: true
    };

    updateCustomSection(sectionIndex, "cards", [...(section.cards || []), nextCard]);
  }

  function updateCustomSectionCard(sectionIndex, cardIndex, field, value) {
    const section = customSections[sectionIndex] || {};
    const nextCards = (section.cards || []).map((card, currentCardIndex) => (
      currentCardIndex === cardIndex
        ? {
            ...card,
            [field]: value
          }
        : card
    ));

    updateCustomSection(sectionIndex, "cards", nextCards);
  }

  function removeCustomSectionCard(sectionIndex, cardIndex) {
    const section = customSections[sectionIndex] || {};
    const cardId = section.cards?.[cardIndex]?.id;
    const nextCards = (section.cards || []).filter((_, currentCardIndex) => currentCardIndex !== cardIndex);

    updateCustomSection(sectionIndex, "cards", nextCards);
    if (selectedCustomSectionCardId === cardId) {
      setEditingItemId("");
      setSelectedItem(null);
    }
  }

  function moveCustomSectionCard(sectionIndex, cardIndex, direction) {
    const section = customSections[sectionIndex] || {};
    const nextIndex = cardIndex + direction;
    const nextCards = [...(section.cards || [])];

    if (nextIndex < 0 || nextIndex >= nextCards.length) {
      return;
    }

    [nextCards[cardIndex], nextCards[nextIndex]] = [nextCards[nextIndex], nextCards[cardIndex]];
    updateCustomSection(sectionIndex, "cards", nextCards);
  }

  function updateCustomSectionCardLink(sectionIndex, cardIndex, linkIndex, field, value) {
    const card = customSections[sectionIndex]?.cards?.[cardIndex] || {};
    const nextLinks = (card.links || []).map((link, currentLinkIndex) => (
      currentLinkIndex === linkIndex
        ? {
            ...link,
            [field]: value
          }
        : link
    ));

    updateCustomSectionCard(sectionIndex, cardIndex, "links", nextLinks);
  }

  function addCustomSectionCardLink(sectionIndex, cardIndex) {
    const card = customSections[sectionIndex]?.cards?.[cardIndex] || {};
    const nextLinks = [
      ...(card.links || []),
      {
        label: "New Link",
        href: "#",
        external: false
      }
    ];

    updateCustomSectionCard(sectionIndex, cardIndex, "links", nextLinks);
  }

  function removeCustomSectionCardLink(sectionIndex, cardIndex, linkIndex) {
    const card = customSections[sectionIndex]?.cards?.[cardIndex] || {};
    const nextLinks = (card.links || []).filter((_, currentLinkIndex) => currentLinkIndex !== linkIndex);

    updateCustomSectionCard(sectionIndex, cardIndex, "links", nextLinks);
  }

  function moveCustomSectionCardLink(sectionIndex, cardIndex, linkIndex, direction) {
    const card = customSections[sectionIndex]?.cards?.[cardIndex] || {};
    const nextIndex = linkIndex + direction;
    const nextLinks = [...(card.links || [])];

    if (nextIndex < 0 || nextIndex >= nextLinks.length) {
      return;
    }

    [nextLinks[linkIndex], nextLinks[nextIndex]] = [nextLinks[nextIndex], nextLinks[linkIndex]];
    updateCustomSectionCard(sectionIndex, cardIndex, "links", nextLinks);
  }

  function updateTrainingResourceSection(field, value) {
    setContent((currentContent) => ({
      ...currentContent,
      sections: {
        ...(currentContent.sections || {}),
        trainingResources: {
          ...((currentContent.sections || {}).trainingResources || {}),
          [field]: value
        }
      }
    }));
    syncTrainingResourceSectionPreview(field, value);
    setStatusMessage("");
    setError("");
  }

  function updateCourse(index, field, value) {
    updateEditableCard("courses", courses, index, field, value, "course-card");
  }

  function updateTrainingResource(index, field, value) {
    updateEditableCard("trainingResources", trainingResources, index, field, value, "training-resource-card");
  }

  function updateVendor(index, field, value) {
    const vendorId = vendors[index]?.id;

    setContent((currentContent) => ({
      ...currentContent,
      vendors: (currentContent.vendors || []).map((vendor, vendorIndex) => (
        vendorIndex === index
          ? {
              ...vendor,
              [field]: value
            }
          : vendor
      ))
    }));
    syncVendorPreview(vendorId, field, value);
    setStatusMessage("");
    setError("");
  }

  function updateBrandAssetSection(sectionKey, field, value) {
    const defaults = getBrandAssetSectionDefault(sectionKey);

    setContent((currentContent) => ({
      ...currentContent,
      sections: {
        ...(currentContent.sections || {}),
        [sectionKey]: {
          ...defaults,
          ...((currentContent.sections || {})[sectionKey] || {}),
          [field]: value
        }
      }
    }));
    syncBrandAssetSectionPreview(sectionKey, field, value);
    setStatusMessage("");
    setError("");
  }

  function updateBrandAssetItem(collectionKey, items, index, field, value, editableType) {
    const itemId = items[index]?.id;

    setContent((currentContent) => ({
      ...currentContent,
      brandAssets: {
        ...((currentContent.brandAssets || {})),
        [collectionKey]: (((currentContent.brandAssets || {})[collectionKey]) || []).map((item, itemIndex) => (
          itemIndex === index
            ? updateNestedBrandAssetField(item, field, value)
            : item
        ))
      }
    }));
    syncBrandAssetPreview(editableType, itemId, field, value);
    setStatusMessage("");
    setError("");
  }

  function updateMarketingTool(index, field, value) {
    updateBrandAssetItem("marketingTools", marketingTools, index, field, value, "marketing-tool-card");
  }

  function updateDigitalLogo(index, field, value) {
    updateBrandAssetItem("digitalLogos", digitalLogos, index, field, value, "digital-logo-card");
  }

  function updateSourceFile(index, field, value) {
    updateBrandAssetItem("sourceFiles", sourceFiles, index, field, value, "source-file-card");
  }

  function updateBrandAssetLink(collectionKey, items, index, linkIndex, field, value, editableType) {
    const currentItem = items[index] || {};
    const nextLinks = (currentItem.links || []).map((link, currentLinkIndex) => (
      currentLinkIndex === linkIndex
        ? {
            ...link,
            [field]: value
          }
        : link
    ));

    updateBrandAssetItem(collectionKey, items, index, "links", nextLinks, editableType);
    syncBrandAssetLinksPreview(editableType, currentItem.id, nextLinks);
  }

  function addBrandAssetLink(collectionKey, items, index, editableType) {
    const currentItem = items[index] || {};
    const nextLinks = [
      ...(currentItem.links || []),
      {
        label: "New Link",
        href: "#",
        external: true
      }
    ];

    updateBrandAssetItem(collectionKey, items, index, "links", nextLinks, editableType);
    syncBrandAssetLinksPreview(editableType, currentItem.id, nextLinks);
  }

  function removeBrandAssetLink(collectionKey, items, index, linkIndex, editableType) {
    const currentItem = items[index] || {};
    const nextLinks = (currentItem.links || []).filter((_, currentLinkIndex) => currentLinkIndex !== linkIndex);

    updateBrandAssetItem(collectionKey, items, index, "links", nextLinks, editableType);
    syncBrandAssetLinksPreview(editableType, currentItem.id, nextLinks);
  }

  function moveBrandAssetLink(collectionKey, items, index, linkIndex, direction, editableType) {
    const currentItem = items[index] || {};
    const nextIndex = linkIndex + direction;
    const nextLinks = [...(currentItem.links || [])];

    if (nextIndex < 0 || nextIndex >= nextLinks.length) {
      return;
    }

    [nextLinks[linkIndex], nextLinks[nextIndex]] = [nextLinks[nextIndex], nextLinks[linkIndex]];
    updateBrandAssetItem(collectionKey, items, index, "links", nextLinks, editableType);
    syncBrandAssetLinksPreview(editableType, currentItem.id, nextLinks);
  }

  function updateTechSection(sectionKey, field, value) {
    setContent((currentContent) => {
      const currentTech = getTechConnectContent(currentContent);

      return {
        ...currentContent,
        techConnect: {
          ...(currentContent.techConnect || {}),
          sections: {
            ...currentTech.sections,
            [sectionKey]: {
              ...(currentTech.sections[sectionKey] || {}),
              [field]: value
            }
          }
        }
      };
    });
    syncTechSectionPreview(sectionKey, field, value);
    setStatusMessage("");
    setError("");
  }

  function updateTechJoeSupport(field, value) {
    setContent((currentContent) => {
      const currentTech = getTechConnectContent(currentContent);

      return {
        ...currentContent,
        techConnect: {
          ...(currentContent.techConnect || {}),
          joeSupport: {
            ...currentTech.joeSupport,
            [field]: value
          }
        }
      };
    });
    syncTechJoeSupportPreview(field, value);
    setStatusMessage("");
    setError("");
  }

  function updateTechJoeSupportLink(index, field, value) {
    const nextLinks = (techJoeSupport.secondaryLinks || []).map((link, linkIndex) => (
      linkIndex === index
        ? {
            ...link,
            [field]: value
          }
        : link
    ));

    updateTechJoeSupport("secondaryLinks", nextLinks);
  }

  function addTechJoeSupportLink() {
    updateTechJoeSupport("secondaryLinks", [
      ...(techJoeSupport.secondaryLinks || []),
      {
        label: "New Link",
        href: "#",
        external: false,
        active: true
      }
    ]);
  }

  function removeTechJoeSupportLink(index) {
    updateTechJoeSupport("secondaryLinks", (techJoeSupport.secondaryLinks || []).filter((_, linkIndex) => linkIndex !== index));
  }

  function moveTechJoeSupportLink(index, direction) {
    const nextIndex = index + direction;
    const nextLinks = [...(techJoeSupport.secondaryLinks || [])];

    if (nextIndex < 0 || nextIndex >= nextLinks.length) {
      return;
    }

    [nextLinks[index], nextLinks[nextIndex]] = [nextLinks[nextIndex], nextLinks[index]];
    updateTechJoeSupport("secondaryLinks", nextLinks);
  }

  function updateTechQuickLink(index, field, value) {
    const nextLinks = techQuickLinks.map((link, linkIndex) => (
      linkIndex === index
        ? {
            ...link,
            [field]: value
          }
        : link
    ));

    setTechQuickLinks(nextLinks);
  }

  function addTechQuickLink() {
    setTechQuickLinks([
      ...techQuickLinks,
      {
        label: "New Link",
        href: "#",
        external: true
      }
    ]);
  }

  function removeTechQuickLink(index) {
    setTechQuickLinks(techQuickLinks.filter((_, linkIndex) => linkIndex !== index));
  }

  function moveTechQuickLink(index, direction) {
    const nextIndex = index + direction;
    const nextLinks = [...techQuickLinks];

    if (nextIndex < 0 || nextIndex >= nextLinks.length) {
      return;
    }

    [nextLinks[index], nextLinks[nextIndex]] = [nextLinks[nextIndex], nextLinks[index]];
    setTechQuickLinks(nextLinks);
  }

  function setTechQuickLinks(nextLinks) {
    setContent((currentContent) => ({
      ...currentContent,
      techConnect: {
        ...(currentContent.techConnect || {}),
        quickLinks: nextLinks
      }
    }));
    syncTechQuickLinksPreview(nextLinks);
    setStatusMessage("");
    setError("");
  }

  function updateTechItem(collectionKey, items, index, field, value, editableType) {
    const itemId = items[index]?.id;

    setContent((currentContent) => {
      const currentTech = getTechConnectContent(currentContent);

      return {
        ...currentContent,
        techConnect: {
          ...(currentContent.techConnect || {}),
          [collectionKey]: (currentTech[collectionKey] || []).map((item, itemIndex) => (
            itemIndex === index
              ? {
                  ...item,
                  [field]: value
                }
              : item
          ))
        }
      };
    });
    syncTechItemPreview(editableType, itemId, field, value);
    setStatusMessage("");
    setError("");
  }

  function updateTechHelpPath(index, field, value) {
    updateTechItem("helpPaths", techHelpPaths, index, field, value, "tech-help-card");
  }

  function updateTechPaperCut(index, field, value) {
    updateTechItem("paperCutCards", techPaperCutCards, index, field, value, "tech-papercut-card");
  }

  function updateTechAnswer(index, field, value) {
    updateTechItem("answerCards", techAnswerCards, index, field, value, "tech-answer-card");
  }

  function updateTechLink(collectionKey, items, index, linkIndex, field, value, editableType) {
    const currentItem = items[index] || {};
    const nextLinks = (currentItem.links || []).map((link, currentLinkIndex) => (
      currentLinkIndex === linkIndex
        ? {
            ...link,
            [field]: value
          }
        : link
    ));

    updateTechItem(collectionKey, items, index, "links", nextLinks, editableType);
    syncTechLinksPreview(editableType, currentItem.id, nextLinks);
  }

  function addTechLink(collectionKey, items, index, editableType) {
    const currentItem = items[index] || {};
    const nextLinks = [
      ...(currentItem.links || []),
      {
        label: "New Link",
        href: "#",
        external: true
      }
    ];

    updateTechItem(collectionKey, items, index, "links", nextLinks, editableType);
    syncTechLinksPreview(editableType, currentItem.id, nextLinks);
  }

  function removeTechLink(collectionKey, items, index, linkIndex, editableType) {
    const currentItem = items[index] || {};
    const nextLinks = (currentItem.links || []).filter((_, currentLinkIndex) => currentLinkIndex !== linkIndex);

    updateTechItem(collectionKey, items, index, "links", nextLinks, editableType);
    syncTechLinksPreview(editableType, currentItem.id, nextLinks);
  }

  function moveTechLink(collectionKey, items, index, linkIndex, direction, editableType) {
    const currentItem = items[index] || {};
    const nextIndex = linkIndex + direction;
    const nextLinks = [...(currentItem.links || [])];

    if (nextIndex < 0 || nextIndex >= nextLinks.length) {
      return;
    }

    [nextLinks[linkIndex], nextLinks[nextIndex]] = [nextLinks[nextIndex], nextLinks[linkIndex]];
    updateTechItem(collectionKey, items, index, "links", nextLinks, editableType);
    syncTechLinksPreview(editableType, currentItem.id, nextLinks);
  }

  async function uploadTechJoeSupportPhoto(file) {
    if (!file) {
      return;
    }

    setIsUploading(true);
    setError("");
    setStatusMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "tech");

      const response = await fetch("/api/admin/upload/", {
        method: "POST",
        headers: {
          "x-kwp-admin-passcode": adminPasscode
        },
        body: formData
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to upload photo.");
      }

      updateTechJoeSupport("photo", payload.path);
      setStatusMessage("Tech support photo uploaded. Save Tech Connect when it looks right.");
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  }

  async function uploadDigitalLogoImage(index, file) {
    if (!file) {
      return;
    }

    setIsUploading(true);
    setError("");
    setStatusMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "brand-assets");

      const response = await fetch("/api/admin/upload/", {
        method: "POST",
        headers: {
          "x-kwp-admin-passcode": adminPasscode
        },
        body: formData
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to upload logo preview.");
      }

      updateDigitalLogo(index, "image.src", payload.path);
      setStatusMessage("Logo image uploaded. Save brand assets when it looks right.");
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  }

  async function uploadVendorLogo(index, file) {
    if (!file) {
      return;
    }

    setIsUploading(true);
    setError("");
    setStatusMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "vendors");

      const response = await fetch("/api/admin/upload/", {
        method: "POST",
        headers: {
          "x-kwp-admin-passcode": adminPasscode
        },
        body: formData
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to upload logo.");
      }

      updateVendor(index, "logo", payload.path);
      setStatusMessage("Vendor logo uploaded. Save vendors when it looks right.");
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  }

  function updateLeader(index, field, value) {
    const personId = leadership[index]?.id;

    setContent((currentContent) => ({
      ...currentContent,
      leadership: (currentContent.leadership || []).map((person, personIndex) => (
        personIndex === index
          ? {
              ...person,
              [field]: value
            }
          : person
      ))
    }));
    syncLeaderPreview(personId, field, value);
    setStatusMessage("");
    setError("");
  }

  async function uploadLeaderPhoto(index, file) {
    if (!file) {
      return;
    }

    setIsUploading(true);
    setError("");
    setStatusMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "leadership");

      const response = await fetch("/api/admin/upload/", {
        method: "POST",
        headers: {
          "x-kwp-admin-passcode": adminPasscode
        },
        body: formData
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to upload photo.");
      }

      updateLeader(index, "photo", payload.path);
      setStatusMessage("Photo uploaded. Save leadership when it looks right.");
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  }

  function updateLeadershipSupport(field, value) {
    setContent((currentContent) => ({
      ...currentContent,
      sections: {
        ...(currentContent.sections || {}),
        leadershipSupport: {
          ...LEADERSHIP_SUPPORT_DEFAULT,
          ...((currentContent.sections || {}).leadershipSupport || {}),
          [field]: value
        }
      }
    }));
    syncLeadershipSupportPreview(field, value);
    setStatusMessage("");
    setError("");
  }

  function updateJoeAvailability(field, value) {
    const nextAvailability = {
      ...joeAvailability,
      [field]: value
    };

    setJoeAvailability(nextAvailability);
    previewJoeAvailability(nextAvailability);
    setStatusMessage("");
    setError("");
  }

  function updateJoeAvailabilityStatus(isAvailable) {
    const nextAvailability = {
      ...joeAvailability,
      status: isAvailable ? "available" : "unavailable"
    };

    setJoeAvailability(nextAvailability);
    previewJoeAvailability(nextAvailability);
    setStatusMessage(isAvailable ? "Availability preview is green across Joe widgets. Save to make it stick." : "Availability preview is red across Joe widgets. Save to make it stick.");
    setError("");
  }

  function updateJoeAvailabilityTracker(isEnabled) {
    const nextAvailability = {
      ...joeAvailability,
      trackerEnabled: isEnabled
    };

    setJoeAvailability(nextAvailability);
    previewJoeAvailability(nextAvailability);
    setStatusMessage(isEnabled ? "Availability tracker preview is visible. Save to make it stick." : "Availability tracker preview is hidden. Schedule buttons remain available.");
    setError("");
  }

  async function saveJoeAvailability() {
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/availability/", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-kwp-admin-passcode": adminPasscode
        },
        body: JSON.stringify({ availability: joeAvailability })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to save Joe availability.");
      }

      const nextAvailability = {
        ...JOE_AVAILABILITY_DEFAULT,
        ...(payload.availability || {})
      };

      setJoeAvailability(nextAvailability);
      previewJoeAvailability(nextAvailability);
      setStatusMessage("Joe availability saved. All availability cards use this shared setting.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function uploadLeadershipSupportPhoto(file) {
    if (!file) {
      return;
    }

    setIsUploading(true);
    setError("");
    setStatusMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "leadership");

      const response = await fetch("/api/admin/upload/", {
        method: "POST",
        headers: {
          "x-kwp-admin-passcode": adminPasscode
        },
        body: formData
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to upload photo.");
      }

      updateLeadershipSupport("photo", payload.path);
      setStatusMessage("Tech Help photo uploaded. Save the support card when it looks right.");
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  }

  function updateLeadershipSection(sectionKey, field, value) {
    const defaults = sectionKey === "alc" ? ALC_SECTION_DEFAULT : LEADERSHIP_SECTION_DEFAULT;

    setContent((currentContent) => ({
      ...currentContent,
      sections: {
        ...(currentContent.sections || {}),
        [sectionKey]: {
          ...defaults,
          ...((currentContent.sections || {})[sectionKey] || {}),
          [field]: value
        }
      }
    }));
    syncLeadershipSectionPreview(sectionKey, field, value);
    setStatusMessage("");
    setError("");
  }

  function updateVendorSection(sectionKey, field, value) {
    const defaults = sectionKey === "vendorDirectory"
      ? VENDOR_DIRECTORY_SECTION_DEFAULT
      : sectionKey === "vendorCore"
      ? VENDOR_CORE_SECTION_DEFAULT
      : VENDOR_SERVICES_SECTION_DEFAULT;

    setContent((currentContent) => ({
      ...currentContent,
      sections: {
        ...(currentContent.sections || {}),
        [sectionKey]: {
          ...defaults,
          ...((currentContent.sections || {})[sectionKey] || {}),
          [field]: value
        }
      }
    }));
    syncVendorSectionPreview(sectionKey, field, value);
    setStatusMessage("");
    setError("");
  }

  function updateOfficeCard(cardKey, field, value) {
    setContent((currentContent) => {
      const currentOffice = currentContent.office || {};
      const currentCard = currentOffice[cardKey] || {};
      const nextCard = field.startsWith("action.")
        ? {
            ...currentCard,
            action: {
              ...(currentCard.action || {}),
              [field.replace("action.", "")]: value
            }
          }
        : {
            ...currentCard,
            [field]: value
          };

      return {
        ...currentContent,
        office: {
          ...currentOffice,
          [cardKey]: nextCard
        }
      };
    });
    syncOfficeCardPreview(cardKey, field, value);
    setStatusMessage("");
    setError("");
  }

  function updateOfficeSection(field, value) {
    setContent((currentContent) => ({
      ...currentContent,
      sections: {
        ...(currentContent.sections || {}),
        office: {
          ...OFFICE_SECTION_DEFAULT,
          ...((currentContent.sections || {}).office || {}),
          [field]: value
        }
      }
    }));
    syncOfficeSectionPreview(field, value);
    setStatusMessage("");
    setError("");
  }

  function updateOfficeChip(cardKey, chipIndex, field, value) {
    const currentCard = office[cardKey] || {};
    const nextChips = (currentCard.chips || []).map((chip, currentChipIndex) => (
      currentChipIndex === chipIndex
        ? {
            ...chip,
            [field]: value
          }
        : chip
    ));

    updateOfficeCard(cardKey, "chips", nextChips);
    syncOfficeChipsPreview(cardKey, nextChips);
  }

  function addOfficeChip(cardKey) {
    const currentCard = office[cardKey] || {};
    const nextChips = [
      ...(currentCard.chips || []),
      {
        label: "New Link",
        href: "#",
        external: false,
        download: false,
        handbookModal: false
      }
    ];

    updateOfficeCard(cardKey, "chips", nextChips);
    syncOfficeChipsPreview(cardKey, nextChips);
  }

  function removeOfficeChip(cardKey, chipIndex) {
    const currentCard = office[cardKey] || {};
    const nextChips = (currentCard.chips || []).filter((_, currentChipIndex) => currentChipIndex !== chipIndex);

    updateOfficeCard(cardKey, "chips", nextChips);
    syncOfficeChipsPreview(cardKey, nextChips);
  }

  function moveOfficeChip(cardKey, chipIndex, direction) {
    const currentCard = office[cardKey] || {};
    const nextIndex = chipIndex + direction;
    const nextChips = [...(currentCard.chips || [])];

    if (nextIndex < 0 || nextIndex >= nextChips.length) {
      return;
    }

    [nextChips[chipIndex], nextChips[nextIndex]] = [nextChips[nextIndex], nextChips[chipIndex]];
    updateOfficeCard(cardKey, "chips", nextChips);
    syncOfficeChipsPreview(cardKey, nextChips);
  }

  function updateOfficeHour(index, field, value) {
    const operations = office.operations || {};
    const nextHours = (operations.hours || []).map((hour, hourIndex) => (
      hourIndex === index
        ? {
            ...hour,
            [field]: value
          }
        : hour
    ));

    updateOfficeCard("operations", "hours", nextHours);
    syncOfficeHoursPreview(nextHours);
  }

  function addOfficeHour() {
    const operations = office.operations || {};
    const nextHours = [
      ...(operations.hours || []),
      {
        days: "New Days",
        time: "New Time"
      }
    ];

    updateOfficeCard("operations", "hours", nextHours);
    syncOfficeHoursPreview(nextHours);
  }

  function removeOfficeHour(index) {
    const operations = office.operations || {};
    const nextHours = (operations.hours || []).filter((_, hourIndex) => hourIndex !== index);

    updateOfficeCard("operations", "hours", nextHours);
    syncOfficeHoursPreview(nextHours);
  }

  function moveOfficeHour(index, direction) {
    const operations = office.operations || {};
    const nextIndex = index + direction;
    const nextHours = [...(operations.hours || [])];

    if (nextIndex < 0 || nextIndex >= nextHours.length) {
      return;
    }

    [nextHours[index], nextHours[nextIndex]] = [nextHours[nextIndex], nextHours[index]];
    updateOfficeCard("operations", "hours", nextHours);
    syncOfficeHoursPreview(nextHours);
  }

  function updateOfficeHoliday(index, value) {
    const operations = office.operations || {};
    const nextHolidays = (operations.holidays || []).map((holiday, holidayIndex) => (
      holidayIndex === index ? value : holiday
    ));

    updateOfficeCard("operations", "holidays", nextHolidays);
    syncOfficeHolidaysPreview(nextHolidays);
  }

  function addOfficeHoliday() {
    const operations = office.operations || {};
    const nextHolidays = [
      ...(operations.holidays || []),
      "New Holiday"
    ];

    updateOfficeCard("operations", "holidays", nextHolidays);
    syncOfficeHolidaysPreview(nextHolidays);
  }

  function removeOfficeHoliday(index) {
    const operations = office.operations || {};
    const nextHolidays = (operations.holidays || []).filter((_, holidayIndex) => holidayIndex !== index);

    updateOfficeCard("operations", "holidays", nextHolidays);
    syncOfficeHolidaysPreview(nextHolidays);
  }

  function moveOfficeHoliday(index, direction) {
    const operations = office.operations || {};
    const nextIndex = index + direction;
    const nextHolidays = [...(operations.holidays || [])];

    if (nextIndex < 0 || nextIndex >= nextHolidays.length) {
      return;
    }

    [nextHolidays[index], nextHolidays[nextIndex]] = [nextHolidays[nextIndex], nextHolidays[index]];
    updateOfficeCard("operations", "holidays", nextHolidays);
    syncOfficeHolidaysPreview(nextHolidays);
  }

  function updateRoomsSection(field, value) {
    setContent((currentContent) => ({
      ...currentContent,
      sections: {
        ...(currentContent.sections || {}),
        rooms: {
          ...ROOMS_SECTION_DEFAULT,
          ...((currentContent.sections || {}).rooms || {}),
          [field]: value
        }
      }
    }));
    syncRoomsSectionPreview(field, value);
    setStatusMessage("");
    setError("");
  }

  function updateRoomsField(field, value) {
    setContent((currentContent) => ({
      ...currentContent,
      office: {
        ...(currentContent.office || {}),
        rooms: {
          ...((currentContent.office || {}).rooms || {}),
          [field]: value
        }
      }
    }));
    syncRoomsPreview(field, value);
    setStatusMessage("");
    setError("");
  }

  function updateRoomAction(index, field, value) {
    const nextActions = (rooms.actions || []).map((action, actionIndex) => (
      actionIndex === index
        ? {
            ...action,
            [field]: value
          }
        : action
    ));

    updateRoomsField("actions", nextActions);
    syncRoomActionsPreview(nextActions);
  }

  function addRoomAction() {
    const nextActions = [
      ...(rooms.actions || []),
      {
        label: "New Room",
        url: "#"
      }
    ];

    updateRoomsField("actions", nextActions);
    syncRoomActionsPreview(nextActions);
  }

  function removeRoomAction(index) {
    const nextActions = (rooms.actions || []).filter((_, actionIndex) => actionIndex !== index);

    updateRoomsField("actions", nextActions);
    syncRoomActionsPreview(nextActions);
  }

  function moveRoomAction(index, direction) {
    const nextIndex = index + direction;
    const nextActions = [...(rooms.actions || [])];

    if (nextIndex < 0 || nextIndex >= nextActions.length) {
      return;
    }

    [nextActions[index], nextActions[nextIndex]] = [nextActions[nextIndex], nextActions[index]];
    updateRoomsField("actions", nextActions);
    syncRoomActionsPreview(nextActions);
  }

  function updateRoomCalendar(index, field, value) {
    const nextCalendars = (rooms.calendars || []).map((calendar, calendarIndex) => (
      calendarIndex === index
        ? {
            ...calendar,
            [field]: value
          }
        : calendar
    ));

    updateRoomsField("calendars", nextCalendars);
    syncRoomCalendarsPreview(nextCalendars);
  }

  function addRoomCalendar() {
    const nextCalendars = [
      ...(rooms.calendars || []),
      {
        label: "New Calendar",
        title: "New calendar",
        src: "https://calendar.google.com/calendar/embed"
      }
    ];

    updateRoomsField("calendars", nextCalendars);
    syncRoomCalendarsPreview(nextCalendars);
  }

  function removeRoomCalendar(index) {
    const nextCalendars = (rooms.calendars || []).filter((_, calendarIndex) => calendarIndex !== index);

    updateRoomsField("calendars", nextCalendars);
    syncRoomCalendarsPreview(nextCalendars);
  }

  function moveRoomCalendar(index, direction) {
    const nextIndex = index + direction;
    const nextCalendars = [...(rooms.calendars || [])];

    if (nextIndex < 0 || nextIndex >= nextCalendars.length) {
      return;
    }

    [nextCalendars[index], nextCalendars[nextIndex]] = [nextCalendars[nextIndex], nextCalendars[index]];
    updateRoomsField("calendars", nextCalendars);
    syncRoomCalendarsPreview(nextCalendars);
  }

  function updateEditableCard(collectionKey, items, index, field, value, editableType) {
    const itemId = items[index]?.id;

    setContent((currentContent) => ({
      ...currentContent,
      [collectionKey]: (currentContent[collectionKey] || []).map((item, itemIndex) => (
        itemIndex === index
          ? {
              ...item,
              [field]: value
            }
          : item
      ))
    }));
    syncEditableCardPreview(editableType, itemId, field, value);
    setStatusMessage("");
    setError("");
  }

  function addCourse() {
    addEditableCard("courses", courses, createCourseId(courses), "course-card");
  }

  function addTrainingResource() {
    addEditableCard("trainingResources", trainingResources, createTrainingResourceId(trainingResources), "training-resource-card");
  }

  function addLeader() {
    const nextLeader = {
      id: createLeadershipId(leadership),
      group: "office",
      role: "New Role",
      name: "New Leader",
      photo: "team/joe-pine-chair.jpg",
      email: "",
      phone: "",
      notes: "",
      featured: false,
      active: true
    };

    setContent((currentContent) => ({
      ...currentContent,
      leadership: [
        ...(currentContent.leadership || []),
        nextLeader
      ]
    }));
    appendLeaderPreview(nextLeader);
    setEditingItemId("");
    setSelectedItem(null);
    setStatusMessage("");
    setError("");
  }

  function addVendor() {
    const nextVendor = {
      id: createVendorId(vendors),
      section: "services",
      business: "New Vendor",
      logo: "brand/kw-leading-edge-logo.png",
      name: "New Contact",
      phone: "",
      email: "",
      notes: "Vendor category",
      active: true
    };

    setContent((currentContent) => ({
      ...currentContent,
      vendors: [
        ...(currentContent.vendors || []),
        nextVendor
      ]
    }));
    appendVendorPreview(nextVendor);
    setEditingItemId("");
    setSelectedItem(null);
    setStatusMessage("");
    setError("");
  }

  function addMarketingTool() {
    const nextTool = {
      id: createMarketingToolId(marketingTools),
      kicker: "New Tool",
      title: "New Marketing Tool",
      summary: "Add a short description.",
      links: [
        {
          label: "Open Link",
          href: "#",
          external: true
        }
      ],
      active: true
    };

    addBrandAssetItem("marketingTools", nextTool, "marketing-tool-card");
  }

  function addDigitalLogo() {
    const nextLogo = {
      id: createDigitalLogoId(digitalLogos),
      kicker: "Logo",
      title: "New Digital Logo",
      summary: "Add guidance for when this logo should be used.",
      previewClass: "asset-preview--light",
      image: {
        src: "brand/kw-leading-edge-logo.png",
        alt: "KW Leading Edge logo"
      },
      links: [
        {
          label: "Download",
          href: "#",
          download: true
        }
      ],
      active: true
    };

    addBrandAssetItem("digitalLogos", nextLogo, "digital-logo-card");
  }

  function addSourceFile() {
    const nextFile = {
      id: createSourceFileId(sourceFiles),
      kicker: "Source File",
      title: "New Source File",
      summary: "Add a short description.",
      links: [
        {
          label: "Download",
          href: "#",
          download: true
        }
      ],
      active: true
    };

    addBrandAssetItem("sourceFiles", nextFile, "source-file-card");
  }

  function addBrandAssetItem(collectionKey, item, editableType) {
    setContent((currentContent) => ({
      ...currentContent,
      brandAssets: {
        ...((currentContent.brandAssets || {})),
        [collectionKey]: [
          ...(((currentContent.brandAssets || {})[collectionKey]) || []),
          item
        ]
      }
    }));
    appendBrandAssetPreview(editableType, item);
    setEditingItemId("");
    setSelectedItem(null);
    setStatusMessage("");
    setError("");
  }

  function addTechHelpPath() {
    const nextCard = {
      id: createTechHelpPathId(techHelpPaths),
      kicker: "New Help Path",
      title: "New Tech Help Card",
      summary: "Add a short description.",
      links: [
        {
          label: "Open Link",
          href: "#",
          external: true
        }
      ],
      active: true
    };

    addTechItem("helpPaths", nextCard, "tech-help-card");
  }

  function addTechPaperCut() {
    const nextCard = {
      id: createTechPaperCutId(techPaperCutCards),
      kicker: "PaperCut",
      title: "New PaperCut Card",
      summary: "Add a short description.",
      secondarySummary: "",
      links: [
        {
          label: "Open Link",
          href: "#",
          external: true
        }
      ],
      active: true
    };

    addTechItem("paperCutCards", nextCard, "tech-papercut-card");
  }

  function addTechAnswer() {
    const nextCard = {
      id: createTechAnswerId(techAnswerCards),
      kicker: "KW Answers",
      title: "New KW Answers Card",
      summary: "Add a short description.",
      links: [
        {
          label: "Open Link",
          href: "#",
          external: true
        }
      ],
      active: true
    };

    addTechItem("answerCards", nextCard, "tech-answer-card");
  }

  function addTechItem(collectionKey, item, editableType) {
    setContent((currentContent) => {
      const currentTech = getTechConnectContent(currentContent);

      return {
        ...currentContent,
        techConnect: {
          ...(currentContent.techConnect || {}),
          [collectionKey]: [
            ...(currentTech[collectionKey] || []),
            item
          ]
        }
      };
    });
    appendTechItemPreview(editableType, item);
    setEditingItemId("");
    setSelectedItem(null);
    setStatusMessage("");
    setError("");
  }

  function addEditableCard(collectionKey, items, id, editableType) {
    const nextCard = {
      id,
      tag: "New",
      title: "New Card",
      summary: "Add a short description.",
      href: "#",
      external: true,
      active: true
    };

    setContent((currentContent) => {
      const currentItems = currentContent[collectionKey] || items;

      return {
        ...currentContent,
        [collectionKey]: [
          ...currentItems,
          nextCard
        ]
      };
    });
    appendEditableCardPreview(editableType, nextCard);
    setEditingItemId("");
    setSelectedItem(null);
    setStatusMessage("");
    setError("");
  }

  function removeCourse(index) {
    removeEditableCard("courses", courses, index, "course-card");
  }

  function removeTrainingResource(index) {
    removeEditableCard("trainingResources", trainingResources, index, "training-resource-card");
  }

  function removeLeader(index) {
    const personId = leadership[index]?.id;

    setContent((currentContent) => ({
      ...currentContent,
      leadership: (currentContent.leadership || []).filter((_, personIndex) => personIndex !== index)
    }));
    removeLeaderPreview(personId);
    if (selectedItem?.editableId === personId) {
      setEditingItemId("");
      setSelectedItem(null);
    }
    setStatusMessage("");
    setError("");
  }

  function removeVendor(index) {
    const vendorId = vendors[index]?.id;

    setContent((currentContent) => ({
      ...currentContent,
      vendors: (currentContent.vendors || []).filter((_, vendorIndex) => vendorIndex !== index)
    }));
    removeVendorPreview(vendorId);
    if (selectedItem?.editableId === vendorId) {
      setEditingItemId("");
      setSelectedItem(null);
    }
    setStatusMessage("");
    setError("");
  }

  function removeBrandAssetItem(collectionKey, items, index, editableType) {
    const itemId = items[index]?.id;

    setContent((currentContent) => ({
      ...currentContent,
      brandAssets: {
        ...((currentContent.brandAssets || {})),
        [collectionKey]: (((currentContent.brandAssets || {})[collectionKey]) || []).filter((_, itemIndex) => itemIndex !== index)
      }
    }));
    removeBrandAssetPreview(editableType, itemId);
    if (selectedItem?.editableId === itemId && selectedItem?.type === editableType) {
      setEditingItemId("");
      setSelectedItem(null);
    }
    setStatusMessage("");
    setError("");
  }

  function removeMarketingTool(index) {
    removeBrandAssetItem("marketingTools", marketingTools, index, "marketing-tool-card");
  }

  function removeDigitalLogo(index) {
    removeBrandAssetItem("digitalLogos", digitalLogos, index, "digital-logo-card");
  }

  function removeSourceFile(index) {
    removeBrandAssetItem("sourceFiles", sourceFiles, index, "source-file-card");
  }

  function removeTechHelpPath(index) {
    removeTechItem("helpPaths", techHelpPaths, index, "tech-help-card");
  }

  function removeTechPaperCut(index) {
    removeTechItem("paperCutCards", techPaperCutCards, index, "tech-papercut-card");
  }

  function removeTechAnswer(index) {
    removeTechItem("answerCards", techAnswerCards, index, "tech-answer-card");
  }

  function removeTechItem(collectionKey, items, index, editableType) {
    const itemId = items[index]?.id;

    setContent((currentContent) => {
      const currentTech = getTechConnectContent(currentContent);

      return {
        ...currentContent,
        techConnect: {
          ...(currentContent.techConnect || {}),
          [collectionKey]: (currentTech[collectionKey] || []).filter((_, itemIndex) => itemIndex !== index)
        }
      };
    });
    removeTechItemPreview(editableType, itemId);
    if (selectedItem?.editableId === itemId && selectedItem?.type === editableType) {
      setEditingItemId("");
      setSelectedItem(null);
    }
    setStatusMessage("");
    setError("");
  }

  function removeEditableCard(collectionKey, items, index, editableType) {
    const itemId = items[index]?.id;

    setContent((currentContent) => ({
      ...currentContent,
      [collectionKey]: (currentContent[collectionKey] || []).filter((_, itemIndex) => itemIndex !== index)
    }));
    removeEditableCardPreview(editableType, itemId);
    if (selectedItem?.editableId === itemId && selectedItem?.type === editableType) {
      setEditingItemId("");
      setSelectedItem(null);
    }
    setStatusMessage("");
    setError("");
  }

  function moveCourse(index, direction) {
    moveEditableCard("courses", index, direction);
  }

  function moveTrainingResource(index, direction) {
    moveEditableCard("trainingResources", index, direction);
  }

  function moveLeader(index, direction) {
    setContent((currentContent) => {
      const currentItems = currentContent.leadership || [];
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= currentItems.length) {
        return currentContent;
      }

      const nextItems = [...currentItems];
      [nextItems[index], nextItems[nextIndex]] = [nextItems[nextIndex], nextItems[index]];

      return {
        ...currentContent,
        leadership: nextItems
      };
    });
    setStatusMessage("");
    setError("");
  }

  function moveVendor(index, direction) {
    setContent((currentContent) => {
      const currentItems = currentContent.vendors || [];
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= currentItems.length) {
        return currentContent;
      }

      const nextItems = [...currentItems];
      [nextItems[index], nextItems[nextIndex]] = [nextItems[nextIndex], nextItems[index]];

      return {
        ...currentContent,
        vendors: nextItems
      };
    });
    setStatusMessage("");
    setError("");
  }

  function moveBrandAssetItem(collectionKey, index, direction) {
    setContent((currentContent) => {
      const currentItems = ((currentContent.brandAssets || {})[collectionKey]) || [];
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= currentItems.length) {
        return currentContent;
      }

      const nextItems = [...currentItems];
      [nextItems[index], nextItems[nextIndex]] = [nextItems[nextIndex], nextItems[index]];

      return {
        ...currentContent,
        brandAssets: {
          ...((currentContent.brandAssets || {})),
          [collectionKey]: nextItems
        }
      };
    });
    setStatusMessage("");
    setError("");
  }

  function moveMarketingTool(index, direction) {
    moveBrandAssetItem("marketingTools", index, direction);
  }

  function moveDigitalLogo(index, direction) {
    moveBrandAssetItem("digitalLogos", index, direction);
  }

  function moveSourceFile(index, direction) {
    moveBrandAssetItem("sourceFiles", index, direction);
  }

  function moveTechHelpPath(index, direction) {
    moveTechItem("helpPaths", index, direction);
  }

  function moveTechPaperCut(index, direction) {
    moveTechItem("paperCutCards", index, direction);
  }

  function moveTechAnswer(index, direction) {
    moveTechItem("answerCards", index, direction);
  }

  function moveTechItem(collectionKey, index, direction) {
    setContent((currentContent) => {
      const currentTech = getTechConnectContent(currentContent);
      const currentItems = currentTech[collectionKey] || [];
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= currentItems.length) {
        return currentContent;
      }

      const nextItems = [...currentItems];
      [nextItems[index], nextItems[nextIndex]] = [nextItems[nextIndex], nextItems[index]];

      return {
        ...currentContent,
        techConnect: {
          ...(currentContent.techConnect || {}),
          [collectionKey]: nextItems
        }
      };
    });
    setStatusMessage("");
    setError("");
  }

  function moveEditableCard(collectionKey, index, direction) {
    setContent((currentContent) => {
      const currentItems = currentContent[collectionKey] || [];
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= currentItems.length) {
        return currentContent;
      }

      const nextItems = [...currentItems];
      [nextItems[index], nextItems[nextIndex]] = [nextItems[nextIndex], nextItems[index]];

      return {
        ...currentContent,
        [collectionKey]: nextItems
      };
    });
    setStatusMessage("");
    setError("");
  }

  async function saveCourses() {
    await saveContent(courseErrors, "Courses");
  }

  async function saveTrainingResources() {
    await saveContent(trainingResourceErrors, "Training resources");
  }

  async function saveLeadership() {
    await saveContent(leadershipErrors, "Leadership");
  }

  async function saveVendors() {
    await saveContent(vendorErrors, "Vendors");
  }

  async function saveBrandAssets() {
    await saveContent(brandAssetErrors, "Brand assets");
  }

  async function saveTechConnect() {
    await saveContent(techErrors, "Tech Connect");
  }

  async function saveTechConnectSection(sectionLabel = "Tech Connect heading") {
    await saveContent([], sectionLabel);
  }

  async function saveTechJoeSupport() {
    await saveContent([], "Tech Connect Joe support");
  }

  async function saveNavigation() {
    await saveContent(navigationErrors, "Navigation");
  }

  async function saveSiteChrome() {
    await saveContent(siteChromeErrors, "Site chrome");
  }

  async function saveOverview() {
    await saveContent(overviewErrors, "Overview");
  }

  async function saveCustomSections() {
    await saveContent(customSectionErrors, "Custom sections");
  }

  async function saveBrandAssetSection(sectionLabel = "Brand assets heading") {
    await saveContent([], sectionLabel);
  }

  async function saveLeadershipSection(sectionLabel = "Leadership heading") {
    await saveContent([], sectionLabel);
  }

  async function saveVendorSection(sectionLabel = "Vendor heading") {
    await saveContent([], sectionLabel);
  }

  async function saveLeadershipSupport() {
    await saveContent([], "Tech Help with Joe");
  }

  async function saveTrainingResourceSection() {
    await saveContent([], "Training Resources heading");
  }

  async function saveOfficeCard() {
    await saveContent(selectedOfficeCardErrors, "Office card");
  }

  async function saveOfficeSection() {
    await saveContent([], "Office heading");
  }

  async function saveRooms() {
    await saveContent(roomErrors, "Rooms");
  }

  async function saveRoomsSection() {
    await saveContent([], "Rooms heading");
  }

  async function saveContent(validationErrors, label) {
    if (validationErrors.length) {
      setError(`Fix ${label.toLowerCase()} validation before saving.`);
      return;
    }

    setIsSaving(true);
    setError("");
    setStatusMessage("");

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
        throw new Error(payload.validationErrors?.join(" ") || payload.error || "Unable to save courses.");
      }

      setStatusMessage(payload.changed ? `${label} saved. Refresh preview to see saved portal output.` : "No content changes detected.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="visual-editor-toolbar" role="banner" aria-label="Visual editor toolbar">
        <div>
          <span className="visual-editor-kicker">Edit Mode</span>
          <strong>KWP Visual Editor</strong>
        </div>
        <nav className="visual-editor-page-switcher" aria-label="Editor pages">
          {EDITOR_PAGE_LINKS.map((pageLink) => (
            <a
              className={`visual-editor-page-link${pageLink.id === currentEditorPage ? " is-active" : ""}`}
              href={pageLink.href}
              key={pageLink.id}
            >
              {pageLink.label}
            </a>
          ))}
        </nav>
        <div className="visual-editor-toolbar-actions">
          <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled={!isUnlocked} onClick={() => setToolbarStatus("Edit Sections")}>
            Edit Sections
          </button>
          <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled={!isUnlocked} onClick={openNavigationEditor}>
            Edit Navigation
          </button>
          <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled={!isUnlocked} onClick={openAddSectionTools}>
            Add Section
          </button>
          <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled={!isUnlocked} onClick={() => setToolbarStatus("Undo")}>
            Undo
          </button>
          <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled={!isUnlocked} onClick={() => setToolbarStatus("Redo")}>
            Redo
          </button>
          <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled={!isUnlocked} onClick={() => setToolbarStatus("Save Draft")}>
            Save Draft
          </button>
          <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled={!isUnlocked} onClick={() => setToolbarStatus("Publish")}>
            Publish
          </button>
          <a className="visual-editor-button" href={previewHref}>
            Preview
          </a>
        </div>
      </div>

      {shouldShowPanel ? (
      <aside className="visual-editor-panel" aria-label="Visual editor inspector">
        <div className="visual-editor-panel-header">
          <span className="visual-editor-kicker">{selectedItem ? "Add Tools" : "Page Tools"}</span>
          <h2>{isUnlocked ? activeSection.label : "Unlock Editor"}</h2>
          <p>
            {isUnlocked && selectedItem
              ? "Use the floating pop-up to edit. Use this panel to add content to the current section."
              : isUnlocked
              ? "Use the top bar for site-wide changes, or choose a page area to review."
              : "Enter the temporary admin passcode to edit content from this visual workspace."}
          </p>
        </div>

        {!isUnlocked ? (
          <form className="visual-editor-unlock" onSubmit={unlockEditor}>
            <label className="visual-editor-field">
              <span>Passcode</span>
              <input
                type="password"
                value={passcode}
                autoComplete="current-password"
                onChange={(event) => setPasscode(event.target.value)}
              />
            </label>
            <button className="visual-editor-button" type="submit" disabled={!passcode || isLoading}>
              {isLoading ? "Unlocking" : "Unlock"}
            </button>
          </form>
        ) : (
          <>
            {selectedItem ? (
              <AddToolsPanel
                activeSection={activeSection}
                canAddCard={canAddCard}
                onAddCard={addCardFromToolbar}
                onAddSection={addCustomSection}
                onBackToPageTools={() => {
                  setEditingItemId("");
                  setSelectedItem(null);
                }}
              />
            ) : (
              <>
                <div className="visual-editor-section-list">
                  {EDITABLE_SECTIONS.map((section) => (
                    <button
                      className={`visual-editor-section-card${section.id === activeSectionId ? " is-active" : ""}`}
                      type="button"
                      onClick={() => selectSection(section)}
                      key={section.id}
                    >
                      <span>{section.label}</span>
                      <strong>{section.status}</strong>
                    </button>
                  ))}
                </div>

                {activeSectionId === "trainingResources" ? (
                  <CourseVisualPanel
                    addLabel="Add Card"
                    courses={trainingResources}
                    errors={trainingResourceErrors}
                    itemLabel="training cards"
                    isSaving={isSaving}
                    onAddCourse={addTrainingResource}
                    onMoveCourse={moveTrainingResource}
                    onRemoveCourse={removeTrainingResource}
                    onSaveCourses={saveTrainingResources}
                    onUpdateCourse={updateTrainingResource}
                    saveLabel="Save Training Cards"
                  />
                ) : activeSectionId === "productivityCourses" ? (
                  <CourseVisualPanel
                    courses={courses}
                    errors={courseErrors}
                    itemLabel="course cards"
                    isSaving={isSaving}
                    onAddCourse={addCourse}
                    onMoveCourse={moveCourse}
                    onRemoveCourse={removeCourse}
                    onSaveCourses={saveCourses}
                    onUpdateCourse={updateCourse}
                  />
                ) : activeSectionId === "leadership" ? (
                  <LeadershipVisualPanel
                    errors={leadershipErrors}
                    isSaving={isSaving}
                    isUploading={isUploading}
                    leaders={leadership}
                    onAddLeader={addLeader}
                    onMoveLeader={moveLeader}
                    onRemoveLeader={removeLeader}
                    onSaveLeadership={saveLeadership}
                    onUploadLeaderPhoto={uploadLeaderPhoto}
                    onUpdateLeader={updateLeader}
                  />
                ) : activeSectionId === "vendors" ? (
                  <VendorVisualPanel
                    errors={vendorErrors}
                    isSaving={isSaving}
                    isUploading={isUploading}
                    vendors={vendors}
                    onAddVendor={addVendor}
                    onMoveVendor={moveVendor}
                    onRemoveVendor={removeVendor}
                    onSaveVendors={saveVendors}
                    onUploadVendorLogo={uploadVendorLogo}
                    onUpdateVendor={updateVendor}
                  />
                ) : activeSectionId === "brandAssets" ? (
                  <BrandAssetsVisualPanel
                    digitalLogoErrors={digitalLogoErrors}
                    digitalLogos={digitalLogos}
                    isSaving={isSaving}
                    isUploading={isUploading}
                    marketingToolErrors={marketingToolErrors}
                    marketingTools={marketingTools}
                    onAddDigitalLogo={addDigitalLogo}
                    onAddMarketingTool={addMarketingTool}
                    onAddSourceFile={addSourceFile}
                    onMoveDigitalLogo={moveDigitalLogo}
                    onMoveMarketingTool={moveMarketingTool}
                    onMoveSourceFile={moveSourceFile}
                    onRemoveDigitalLogo={removeDigitalLogo}
                    onRemoveMarketingTool={removeMarketingTool}
                    onRemoveSourceFile={removeSourceFile}
                    onSaveBrandAssets={saveBrandAssets}
                    onUpdateDigitalLogo={updateDigitalLogo}
                    onUpdateMarketingTool={updateMarketingTool}
                    onUpdateSourceFile={updateSourceFile}
                    onUploadDigitalLogoImage={uploadDigitalLogoImage}
                    sourceFileErrors={sourceFileErrors}
                    sourceFiles={sourceFiles}
                  />
                ) : activeSectionId === "navigation" ? (
                  <NavigationVisualPanel
                    errors={navigationErrors}
                    isSaving={isSaving}
                    navigation={navigation}
                    onAddLink={addNavigationLink}
                    onMoveLink={moveNavigationLink}
                    onRemoveLink={removeNavigationLink}
                    onSaveNavigation={saveNavigation}
                    onUpdateLabel={updateNavigationLabel}
                    onUpdateLink={updateNavigationLink}
                  />
                ) : activeSectionId === "siteChrome" ? (
                  <SiteChromeVisualPanel
                    errors={siteChromeErrors}
                    isSaving={isSaving}
                    siteChrome={siteChrome}
                    onSaveSiteChrome={saveSiteChrome}
                    onUpdateFooter={updateSiteFooter}
                    onUpdateBrand={updateSiteBrand}
                  />
                ) : activeSectionId === "customSections" ? (
                  <CustomSectionsVisualPanel
                    errors={customSectionErrors}
                    isSaving={isSaving}
                    onAddCard={addCustomSectionCard}
                    onAddCardLink={addCustomSectionCardLink}
                    onAddSection={addCustomSection}
                    onMoveCardLink={moveCustomSectionCardLink}
                    onMoveCard={moveCustomSectionCard}
                    onMoveSection={moveCustomSection}
                    onRemoveCardLink={removeCustomSectionCardLink}
                    onRemoveCard={removeCustomSectionCard}
                    onRemoveSection={removeCustomSection}
                    onSaveCustomSections={saveCustomSections}
                    onUpdateCard={updateCustomSectionCard}
                    onUpdateCardLink={updateCustomSectionCardLink}
                    onUpdateSection={updateCustomSection}
                    sections={customSections}
                  />
                ) : activeSectionId === "techConnect" ? (
                  <TechConnectVisualPanel
                    answerCards={techAnswerCards}
                    errors={techErrors}
                    helpPaths={techHelpPaths}
                    isSaving={isSaving}
                    onAddAnswer={addTechAnswer}
                    onAddHelpPath={addTechHelpPath}
                    onAddPaperCut={addTechPaperCut}
                    onMoveAnswer={moveTechAnswer}
                    onMoveHelpPath={moveTechHelpPath}
                    onMovePaperCut={moveTechPaperCut}
                    onRemoveAnswer={removeTechAnswer}
                    onRemoveHelpPath={removeTechHelpPath}
                    onRemovePaperCut={removeTechPaperCut}
                    onSaveTechConnect={saveTechConnect}
                    onUpdateAnswer={updateTechAnswer}
                    onUpdateHelpPath={updateTechHelpPath}
                    onUpdatePaperCut={updateTechPaperCut}
                    paperCutCards={techPaperCutCards}
                  />
                ) : (
                  <div className="visual-editor-empty-state">
                    <strong>{activeSection.label}</strong>
                    <p>This section is selectable now. Editing controls will be added in the next module slices.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {error ? <p className="visual-editor-message visual-editor-message--error">{error}</p> : null}
        {statusMessage ? <p className="visual-editor-message visual-editor-message--success">{statusMessage}</p> : null}
      </aside>
      ) : null}

      {!shouldShowPanel && (error || statusMessage) ? (
        <div className={`visual-editor-toast${error ? " visual-editor-toast--error" : ""}`} role="status">
          {error || statusMessage}
        </div>
      ) : null}

      {isUnlocked && selectedItem ? (
        <FloatingSelectionToolbar
          item={selectedItem}
          onClear={() => {
            setEditingItemId("");
            setSelectedItem(null);
          }}
          onEdit={editSelectedItem}
          onMoveDown={() => moveSelectedSection("down")}
          onMoveUp={() => moveSelectedSection("up")}
        />
      ) : null}

      {isUnlocked && selectedItem && editingItemId === selectedItem.visualId ? (
        <FloatingItemEditor
          card={selectedEditableCard}
          cardErrors={selectedEditableCardErrors}
          cardIndex={selectedEditableCardIndex}
          editableType={selectedEditableCardType}
          isSaving={isSaving}
          isUploading={isUploading}
          item={selectedItem}
          joeAvailability={joeAvailability}
          leader={selectedLeader}
          leaderErrors={leadershipErrors}
          leaderIndex={selectedLeaderIndex}
          leadershipSupport={leadershipSupport}
          leadershipSectionSettings={leadershipSection}
          alcSectionSettings={alcSection}
          navigation={navigation}
          navigationErrors={navigationErrors}
          navigationListKey={selectedNavigationListKey}
          navigationLabelKey={selectedNavigationLabelKey}
          navigationLink={selectedNavigationLink}
          navigationLinkIndex={selectedNavigationIndex}
          siteChrome={siteChrome}
          siteChromeErrors={siteChromeErrors}
          siteChromeSelection={selectedSiteChromeItem}
          overview={overview}
          overviewErrors={overviewErrors}
          overviewSelection={selectedOverviewItem}
          customSection={selectedCustomSection}
          customSectionCard={selectedCustomSectionCard}
          customSectionCardIndex={selectedCustomSectionCardIndex}
          customSectionErrors={customSectionErrors}
          customSectionIndex={selectedCustomSectionIndex}
          customSections={customSections}
          vendor={selectedVendor}
          brandOverviewSectionSettings={brandOverviewSection}
          digitalLogo={selectedDigitalLogo}
          digitalLogoErrors={digitalLogoErrors}
          digitalLogoIndex={selectedDigitalLogoIndex}
          digitalLogos={digitalLogos}
          digitalLogosSectionSettings={digitalLogosSection}
          marketingTool={selectedMarketingTool}
          marketingToolErrors={marketingToolErrors}
          marketingToolIndex={selectedMarketingToolIndex}
          marketingTools={marketingTools}
          marketingToolsSectionSettings={marketingToolsSection}
          selectedTechAnswer={selectedTechAnswer}
          selectedTechAnswerIndex={selectedTechAnswerIndex}
          selectedTechHelpPath={selectedTechHelpPath}
          selectedTechHelpPathIndex={selectedTechHelpPathIndex}
          selectedTechPaperCut={selectedTechPaperCut}
          selectedTechPaperCutIndex={selectedTechPaperCutIndex}
          sourceFile={selectedSourceFile}
          sourceFileErrors={sourceFileErrors}
          sourceFileIndex={selectedSourceFileIndex}
          sourceFiles={sourceFiles}
          sourceFilesSectionSettings={sourceFilesSection}
          techAnswerCards={techAnswerCards}
          techAnswerErrors={techAnswerErrors}
          techHelpPathErrors={techHelpPathErrors}
          techHelpPaths={techHelpPaths}
          techJoeSupport={techJoeSupport}
          techPaperCutCards={techPaperCutCards}
          techPaperCutErrors={techPaperCutErrors}
          techQuickLinks={techQuickLinks}
          techSections={techSections}
          vendorDirectorySectionSettings={vendorDirectorySection}
          vendorCoreSectionSettings={vendorCoreSection}
          vendorErrors={vendorErrors}
          vendorIndex={selectedVendorIndex}
          vendorServicesSectionSettings={vendorServicesSection}
          officeCard={selectedOfficeCard}
          officeCardErrors={selectedOfficeCardErrors}
          officeCardKey={selectedOfficeCardKey}
          officeSectionSettings={officeSection}
          roomErrors={roomErrors}
          rooms={rooms}
          roomsSectionSettings={roomsSection}
          onAddRoomAction={addRoomAction}
          onAddRoomCalendar={addRoomCalendar}
          onAddBrandAssetLink={addBrandAssetLink}
          onAddTechLink={addTechLink}
          onAddTechJoeSupportLink={addTechJoeSupportLink}
          onAddTechQuickLink={addTechQuickLink}
          onAddNavigationLink={addNavigationLink}
          onAddOverviewLink={addOverviewLink}
          onAddCustomSectionCard={addCustomSectionCard}
          onAddCustomSectionCardLink={addCustomSectionCardLink}
          onAddOfficeChip={addOfficeChip}
          onAddOfficeHoliday={addOfficeHoliday}
          onAddOfficeHour={addOfficeHour}
          onClose={() => setEditingItemId("")}
          onMoveLeader={moveLeader}
          onMoveVendor={moveVendor}
          onMoveOfficeChip={moveOfficeChip}
          onMoveOfficeHoliday={moveOfficeHoliday}
          onMoveOfficeHour={moveOfficeHour}
          onMoveRoomAction={moveRoomAction}
          onMoveRoomCalendar={moveRoomCalendar}
          onMoveBrandAssetLink={moveBrandAssetLink}
          onMoveTechAnswer={moveTechAnswer}
          onMoveTechHelpPath={moveTechHelpPath}
          onMoveTechLink={moveTechLink}
          onMoveTechJoeSupportLink={moveTechJoeSupportLink}
          onMoveTechPaperCut={moveTechPaperCut}
          onMoveTechQuickLink={moveTechQuickLink}
          onMoveNavigationLink={moveNavigationLink}
          onMoveOverviewLink={moveOverviewLink}
          onMoveCustomSection={moveCustomSection}
          onMoveCustomSectionCard={moveCustomSectionCard}
          onMoveCustomSectionCardLink={moveCustomSectionCardLink}
          onRemoveOfficeChip={removeOfficeChip}
          onRemoveOfficeHoliday={removeOfficeHoliday}
          onRemoveOfficeHour={removeOfficeHour}
          onRemoveRoomAction={removeRoomAction}
          onRemoveRoomCalendar={removeRoomCalendar}
          onRemoveBrandAssetLink={removeBrandAssetLink}
          onRemoveTechAnswer={removeTechAnswer}
          onRemoveTechHelpPath={removeTechHelpPath}
          onRemoveTechLink={removeTechLink}
          onRemoveTechJoeSupportLink={removeTechJoeSupportLink}
          onRemoveTechPaperCut={removeTechPaperCut}
          onRemoveTechQuickLink={removeTechQuickLink}
          onRemoveNavigationLink={removeNavigationLink}
          onRemoveOverviewLink={removeOverviewLink}
          onRemoveCustomSection={removeCustomSection}
          onRemoveCustomSectionCard={removeCustomSectionCard}
          onRemoveCustomSectionCardLink={removeCustomSectionCardLink}
          onSaveOfficeCard={saveOfficeCard}
          onSaveOfficeSection={saveOfficeSection}
          onSaveRooms={saveRooms}
          onSaveRoomsSection={saveRoomsSection}
          onSaveBrandAssets={saveBrandAssets}
          onSaveBrandAssetSection={saveBrandAssetSection}
          onSaveTechConnect={saveTechConnect}
          onSaveTechConnectSection={saveTechConnectSection}
          onSaveTechJoeSupport={saveTechJoeSupport}
          onSaveNavigation={saveNavigation}
          onSaveSiteChrome={saveSiteChrome}
          onSaveOverview={saveOverview}
          onSaveCustomSections={saveCustomSections}
          onUpdateOfficeChip={updateOfficeChip}
          onUpdateOfficeHoliday={updateOfficeHoliday}
          onUpdateOfficeHour={updateOfficeHour}
          onUpdateOfficeCard={updateOfficeCard}
          onUpdateOfficeSection={updateOfficeSection}
          onUpdateRoomAction={updateRoomAction}
          onUpdateRoomCalendar={updateRoomCalendar}
          onUpdateRoomsField={updateRoomsField}
          onUpdateRoomsSection={updateRoomsSection}
          onUpdateBrandAssetLink={updateBrandAssetLink}
          onUpdateBrandAssetSection={updateBrandAssetSection}
          onUpdateTechAnswer={updateTechAnswer}
          onUpdateTechHelpPath={updateTechHelpPath}
          onUpdateTechJoeSupport={updateTechJoeSupport}
          onUpdateTechJoeSupportLink={updateTechJoeSupportLink}
          onUpdateTechLink={updateTechLink}
          onUpdateTechPaperCut={updateTechPaperCut}
          onUpdateTechQuickLink={updateTechQuickLink}
          onUpdateTechSection={updateTechSection}
          onUpdateNavigationLink={updateNavigationLink}
          onUpdateNavigationLabel={updateNavigationLabel}
          onUpdateSiteBrand={updateSiteBrand}
          onUpdateSiteFooter={updateSiteFooter}
          onUpdateOverviewField={updateOverviewField}
          onUpdateOverviewGroup={updateOverviewGroup}
          onUpdateOverviewLink={updateOverviewLink}
          onUpdateCustomSection={updateCustomSection}
          onUpdateCustomSectionCard={updateCustomSectionCard}
          onUpdateCustomSectionCardLink={updateCustomSectionCardLink}
          onUpdateDigitalLogo={updateDigitalLogo}
          onUpdateMarketingTool={updateMarketingTool}
          onUpdateSourceFile={updateSourceFile}
          onRemoveCard={selectedTrainingResource ? removeTrainingResource : removeCourse}
          onRemoveLeader={removeLeader}
          onRemoveVendor={removeVendor}
          onSaveLeadership={saveLeadership}
          onSaveLeadershipSection={saveLeadershipSection}
          onSaveLeadershipSupport={saveLeadershipSupport}
          onSaveVendorSection={saveVendorSection}
          onSaveVendors={saveVendors}
          onUpdateLeader={updateLeader}
          onUpdateLeadershipSection={updateLeadershipSection}
          onUpdateLeadershipSupport={updateLeadershipSupport}
          onUpdateVendor={updateVendor}
          onUpdateVendorSection={updateVendorSection}
          onUploadLeaderPhoto={uploadLeaderPhoto}
          onUploadLeadershipSupportPhoto={uploadLeadershipSupportPhoto}
          onUploadVendorLogo={uploadVendorLogo}
          onUploadDigitalLogoImage={uploadDigitalLogoImage}
          onUploadTechJoeSupportPhoto={uploadTechJoeSupportPhoto}
          onSaveCards={selectedTrainingResource ? saveTrainingResources : saveCourses}
          onSaveJoeAvailability={saveJoeAvailability}
          onUpdateCard={selectedTrainingResource ? updateTrainingResource : updateCourse}
          onUpdateJoeAvailability={updateJoeAvailability}
          onUpdateJoeAvailabilityStatus={updateJoeAvailabilityStatus}
          onUpdateJoeAvailabilityTracker={updateJoeAvailabilityTracker}
          sectionSettings={trainingResourceSection}
          onSaveSection={saveTrainingResourceSection}
          onUpdateSection={updateTrainingResourceSection}
        />
      ) : null}
    </>
  );
}

function describeSelectedElement(element) {
  if (!element.dataset.visualEditorId) {
    element.dataset.visualEditorId = `visual-editor-${nextVisualEditorId}`;
    nextVisualEditorId += 1;
  }

  const rect = element.getBoundingClientRect();
  const section = element.closest(".page-content > section[id], .page-content > div[id]");
  const heading = element.querySelector("h2, h3, strong")?.textContent || element.textContent || "";
  const sectionHeading = section?.querySelector("h2, h3")?.textContent || section?.id || "Page";
  const tagName = element.tagName.toLowerCase();
  const type = element.dataset.editableType || inferElementType(element);

  return {
    editableId: element.dataset.editableId || "",
    href: element.getAttribute("href") || "",
    label: normalizeLabel(heading) || element.getAttribute("aria-label") || tagName,
    panelHint: "",
    sectionId: section?.id || "",
    sectionLabel: normalizeLabel(sectionHeading),
    tagName,
    type,
    visualId: element.dataset.visualEditorId,
    bounds: {
      bottom: rect.bottom,
      height: rect.height,
      left: rect.left,
      right: rect.right,
      top: rect.top,
      width: rect.width
    },
    toolbarPosition: {
      top: Math.max(70, rect.top - 48),
      left: Math.min(window.innerWidth - 260, Math.max(18, rect.left))
    }
  };
}

function inferElementType(element) {
  if (element.matches(".page-content > section")) {
    return "section";
  }

  if (element.matches(".course-card")) {
    return "course-card";
  }

  if (element.matches(".office-card")) {
    return "office-card";
  }

  if (element.matches(".leader-card")) {
    return "leader-card";
  }

  if (element.matches(".alc-poster-card")) {
    return "alc-poster-card";
  }

  if (element.matches(".leadership-support-card")) {
    return "leadership-support-card";
  }

  if (element.matches(".vendor-card")) {
    return "vendor-card";
  }

  if (element.matches(".marketing-tool-card")) {
    return "marketing-tool-card";
  }

  if (element.matches(".asset-card")) {
    return "digital-logo-card";
  }

  if (element.matches(".asset-source-card")) {
    return "source-file-card";
  }

  if (element.matches(".leadership-card")) {
    return "leadership-card";
  }

  if (element.matches("a, button")) {
    return "link-button";
  }

  return "content-block";
}

function normalizeLabel(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 90);
}

function getOfficeCardKeyFromItem(item) {
  if (!item) {
    return "";
  }

  if (item.type === "office-card") {
    return item.editableId || "";
  }

  if (item.type === "office-chip") {
    return String(item.editableId || "").split(":")[0];
  }

  return "";
}

function getNavigationListKeyFromItem(item) {
  if (!item) {
    return "";
  }

  if (item.type === "navigation-link") {
    return "navLinks";
  }

  if (item.type === "navigation-utility-link") {
    return "sidebarUtilityLinks";
  }

  if (item.type === "navigation-mobile-link") {
    return "mobileQuickLinks";
  }

  if (item.type === "navigation-daily-link") {
    return "dailyAccessLinks";
  }

  return "";
}

function getNavigationLabelKeyFromItem(item) {
  if (!item || item.type !== "navigation-label") {
    return "";
  }

  const allowedFields = new Set([
    "sidebarUtilityTitle",
    "mobileMenuLabel",
    "mobileQuickLinksLabel",
    "dailyAccessKicker",
    "dailyAccessTitle"
  ]);

  return allowedFields.has(item.editableId) ? item.editableId : "";
}

function getSiteChromeSelectionFromItem(item) {
  if (!item) {
    return null;
  }

  if (item.type === "site-brand") {
    return { type: "brand" };
  }

  if (item.type === "site-footer" || item.type === "site-footer-field") {
    return {
      type: "footer",
      field: item.type === "site-footer-field" ? item.editableId || "" : ""
    };
  }

  return null;
}

function validateSiteChromeDraft(siteChrome) {
  const errors = [];
  const footer = siteChrome.footer || {};

  [
    ["brandTitle", "Brand title"],
    ["brandLogo", "Brand logo"],
    ["brandHref", "Brand link"]
  ].forEach(([field, label]) => {
    if (!String(siteChrome[field] || "").trim()) {
      errors.push(`${label} is required.`);
    }
  });

  [
    ["copyright", "Footer copyright"],
    ["addressLabel", "Footer address"],
    ["addressHref", "Footer address link"],
    ["phoneLabel", "Footer phone"],
    ["phoneHref", "Footer phone link"]
  ].forEach(([field, label]) => {
    if (!String(footer[field] || "").trim()) {
      errors.push(`${label} is required.`);
    }
  });

  return errors;
}

function getOverviewSelectionFromItem(item) {
  if (!item) {
    return null;
  }

  if (
    item.type === "section" && item.sectionId === "overview" ||
    item.type === "overview-heading"
  ) {
    return { type: "heading" };
  }

  if (item.type === "overview-market") {
    return {
      type: "market",
      groupKey: item.editableId === "market" ? "market" : "rates"
    };
  }

  if (item.type === "overview-card") {
    return {
      type: "card",
      groupKey: item.editableId || "dailyAccess"
    };
  }

  if (item.type === "overview-link") {
    const [groupKey, linkIndex] = String(item.editableId || "").split(":");

    return {
      type: "card",
      groupKey: groupKey || "dailyAccess",
      linkIndex: Number.parseInt(linkIndex || "-1", 10)
    };
  }

  return null;
}

function validateOverviewDraft(overview) {
  const errors = [];

  [
    ["eyebrow", "Overview eyebrow"],
    ["title", "Overview title"],
    ["summary", "Overview description"]
  ].forEach(([field, label]) => {
    if (!String(overview[field] || "").trim()) {
      errors.push(`${label} is required.`);
    }
  });

  [
    ["dailyAccess", "Daily Access"],
    ["agenda", "Office Agenda"]
  ].forEach(([groupKey, label]) => {
    const group = overview[groupKey] || {};

    if (!String(group.tag || "").trim()) {
      errors.push(`${label}: tag is required.`);
    }

    if (!String(group.title || "").trim()) {
      errors.push(`${label}: title is required.`);
    }

    if (!Array.isArray(group.links)) {
      errors.push(`${label}: links must be a list.`);
      return;
    }

    group.links.forEach((link, index) => {
      if (!String(link.label || "").trim()) {
        errors.push(`${label} link ${index + 1}: label is required.`);
      }

      if (!String(link.href || "").trim()) {
        errors.push(`${label} link ${index + 1}: link is required.`);
      }
    });
  });

  [
    ["rates", "Interest Rates"],
    ["market", "Market Trends"]
  ].forEach(([groupKey, label]) => {
    const group = overview[groupKey] || {};

    if (!String(group.eyebrow || "").trim()) {
      errors.push(`${label}: eyebrow is required.`);
    }

    if (!String(group.title || "").trim()) {
      errors.push(`${label}: title is required.`);
    }
  });

  return errors;
}

function getCustomSectionIdFromItem(item) {
  if (!item) {
    return "";
  }

  if (
    item.type === "custom-section" ||
    item.type === "custom-section-eyebrow" ||
    item.type === "custom-section-heading" ||
    item.type === "custom-section-summary"
  ) {
    return item.editableId || item.sectionId || "";
  }

  if (item.type === "custom-section-card") {
    return String(item.editableId || "").split(":")[0] || "";
  }

  return "";
}

function validateCustomSectionsDraft(sections) {
  const errors = [];
  const sectionIds = new Set();

  (sections || []).forEach((section, sectionIndex) => {
    const sectionLabel = `Custom section ${sectionIndex + 1}`;
    const sectionId = String(section.id || "").trim();

    if (!sectionId) {
      errors.push(`${sectionLabel}: id is required.`);
    } else if (sectionIds.has(sectionId)) {
      errors.push(`${sectionLabel}: id must be unique.`);
    } else {
      sectionIds.add(sectionId);
    }

    if (!String(section.title || "").trim()) {
      errors.push(`${sectionLabel}: title is required.`);
    }

    if (section.cards && !Array.isArray(section.cards)) {
      errors.push(`${sectionLabel}: cards must be a list.`);
      return;
    }

    const cardIds = new Set();

    (section.cards || []).forEach((card, cardIndex) => {
      const cardLabel = `${sectionLabel} card ${cardIndex + 1}`;
      const cardId = String(card.id || "").trim();

      if (!cardId) {
        errors.push(`${cardLabel}: id is required.`);
      } else if (cardIds.has(cardId)) {
        errors.push(`${cardLabel}: id must be unique inside the section.`);
      } else {
        cardIds.add(cardId);
      }

      if (!String(card.title || "").trim()) {
        errors.push(`${cardLabel}: title is required.`);
      }

      if (card.links && !Array.isArray(card.links)) {
        errors.push(`${cardLabel}: buttons must be a list.`);
        return;
      }

      (card.links || []).forEach((link, linkIndex) => {
        const linkLabel = `${cardLabel} button ${linkIndex + 1}`;

        if (!String(link.label || "").trim()) {
          errors.push(`${linkLabel}: label is required.`);
        }

        if (!String(link.href || "").trim()) {
          errors.push(`${linkLabel}: link is required.`);
        }
      });
    });
  });

  return errors;
}

function validateNavigationDraft(navigation) {
  const errors = [];

  [
    ["navLinks", "Menu"],
    ["sidebarUtilityLinks", "Sidebar Quick Link"],
    ["mobileQuickLinks", "Mobile Quick Link"],
    ["dailyAccessLinks", "Daily Access Link"]
  ].forEach(([listKey, label]) => {
    const links = navigation[listKey] || [];

    links.forEach((link, index) => {
      if (!String(link.label || "").trim()) {
        errors.push(`${label} ${index + 1}: label is required.`);
      }

      if (!String(link.href || "").trim()) {
        errors.push(`${label} ${index + 1}: link is required.`);
      }
    });
  });

  return errors;
}

function getVendorSectionKeyFromItem(item) {
  if (!item) {
    return "";
  }

  if (item.editableId === "vendorDirectory" || item.sectionId === "vendor-row") {
    return "vendorDirectory";
  }

  if (item.editableId === "vendorCore" || item.sectionId === "vendor-core-partners") {
    return "vendorCore";
  }

  if (item.editableId === "vendorServices" || item.sectionId === "vendor-services") {
    return "vendorServices";
  }

  return "";
}

function getBrandAssetSectionKeyFromItem(item) {
  if (!item) {
    return "";
  }

  if (item.editableId === "brandOverview" || item.sectionId === "brand-overview") {
    return "brandOverview";
  }

  if (item.editableId === "marketingTools" || item.sectionId === "marketing-tools") {
    return "marketingTools";
  }

  if (item.editableId === "digitalLogos" || item.sectionId === "digital-logos") {
    return "digitalLogos";
  }

  if (item.editableId === "sourceFiles" || item.sectionId === "source-files") {
    return "sourceFiles";
  }

  return "";
}

function getTechSectionKeyFromItem(item) {
  if (!item) {
    return "";
  }

  if (item.editableId === "techOverview" || item.sectionId === "tech-overview") {
    return "techOverview";
  }

  if (item.editableId === "techHelpPaths" || item.sectionId === "help-paths") {
    return "techHelpPaths";
  }

  if (item.editableId === "techPaperCut" || item.sectionId === "papercut-hive") {
    return "techPaperCut";
  }

  if (item.editableId === "techAnswers" || item.sectionId === "kw-answers") {
    return "techAnswers";
  }

  return "";
}

function getBrandAssetSectionDefault(sectionKey) {
  if (sectionKey === "brandOverview") {
    return BRAND_OVERVIEW_SECTION_DEFAULT;
  }

  if (sectionKey === "marketingTools") {
    return MARKETING_TOOLS_SECTION_DEFAULT;
  }

  if (sectionKey === "digitalLogos") {
    return DIGITAL_LOGOS_SECTION_DEFAULT;
  }

  return SOURCE_FILES_SECTION_DEFAULT;
}

function updateNestedBrandAssetField(item, field, value) {
  if (field === "image.src") {
    return {
      ...item,
      image: {
        ...(item.image || {}),
        src: value
      }
    };
  }

  if (field === "image.alt") {
    return {
      ...item,
      image: {
        ...(item.image || {}),
        alt: value
      }
    };
  }

  return {
    ...item,
    [field]: value
  };
}

function findSectionForSelectedItem(item) {
  if (getCustomSectionIdFromItem(item)) {
    return EDITABLE_SECTIONS.find((section) => section.id === "customSections") || null;
  }

  const target = item.href?.startsWith("#") ? item.href : item.sectionId ? `#${item.sectionId}` : "";

  if (!target) {
    return null;
  }

  return EDITABLE_SECTIONS.find((section) => section.target === target) || null;
}

function getPanelTitle(selectedItem, activeSection) {
  if (!selectedItem) {
    return activeSection.label;
  }

  if (selectedItem.type === "course-card") {
    return "Course Card";
  }

  if (selectedItem.type === "training-resource-card") {
    return "Training Card";
  }

  if (selectedItem.type === "link-button") {
    return "Link";
  }

  if (selectedItem.type === "section") {
    return "Section";
  }

  return "Selected Item";
}

function syncEditableCardPreview(editableType, itemId, field, value) {
  if (!editableType || !itemId || typeof document === "undefined") {
    return;
  }

  const safeEditableType = String(editableType).replace(/"/g, '\\"');
  const safeItemId = String(itemId).replace(/"/g, '\\"');
  const element = document.querySelector(`[data-editable-type="${safeEditableType}"][data-editable-id="${safeItemId}"]`);

  if (!element) {
    return;
  }

  if (field === "tag") {
    const tag = element.querySelector(".card-tag");
    if (tag) {
      tag.textContent = value;
    }
  }

  if (field === "title") {
    const title = element.querySelector("h3");
    if (title) {
      title.textContent = value;
    }
  }

  if (field === "summary") {
    const summary = element.querySelector("p");
    if (summary) {
      summary.textContent = value;
    }
  }

  if (field === "href") {
    element.setAttribute("href", value);
  }

  if (field === "external") {
    if (value) {
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noreferrer");
    } else {
      element.removeAttribute("target");
      element.removeAttribute("rel");
    }
  }
}

function syncVendorPreview(vendorId, field, value) {
  if (!vendorId || typeof document === "undefined") {
    return;
  }

  const safeVendorId = String(vendorId).replace(/"/g, '\\"');
  const element = document.querySelector(`[data-editable-type="vendor-card"][data-editable-id="${safeVendorId}"]`);

  if (!element) {
    return;
  }

  if (field === "section") {
    const grid = document.querySelector(`[data-vendor-grid="${String(value).replace(/"/g, '\\"')}"]`);
    element.classList.toggle("vendor-card-featured", value === "core");
    grid?.append(element);
  }

  if (field === "business") {
    updateVendorDetailPreview(element, "Business", value);
    const image = element.querySelector(".vendor-logo");
    if (image) {
      image.alt = `${value || ""} logo`;
    }
  }

  if (field === "logo") {
    const image = element.querySelector(".vendor-logo");
    if (image) {
      image.src = value;
    }
  }

  if (field === "name") {
    updateVendorDetailPreview(element, "Name", value);
  }

  if (field === "phone") {
    updateVendorDetailPreview(element, "Phone", value, createPhoneLinkPreview);
  }

  if (field === "email") {
    updateVendorDetailPreview(element, "E-mail", value, createEmailLinkPreview);
  }

  if (field === "notes") {
    updateVendorDetailPreview(element, "Notes", value);
  }

  if (field === "active") {
    element.hidden = value === false;
  }
}

function updateVendorDetailPreview(element, label, value, createContent) {
  const rows = [...element.querySelectorAll(".vendor-details > div")];
  const row = rows.find((detailRow) => detailRow.querySelector("dt")?.textContent === label);
  const valueElement = row?.querySelector("dd");

  if (!valueElement) {
    return;
  }

  valueElement.replaceChildren();

  if (createContent && value) {
    valueElement.append(createContent(value));
  } else {
    valueElement.textContent = value || "";
  }
}

function createPhoneLinkPreview(value) {
  const link = document.createElement("a");
  const digits = String(value || "").replace(/\D/g, "");

  link.textContent = value || "";
  link.href = digits ? `tel:+1${digits.length === 10 ? digits : digits.replace(/^1/, "")}` : "";

  return link;
}

function createEmailLinkPreview(value) {
  const link = document.createElement("a");

  link.textContent = value || "";
  link.href = `mailto:${value || ""}`;

  return link;
}

function syncOfficeCardPreview(cardKey, field, value) {
  if (!cardKey || typeof document === "undefined") {
    return;
  }

  const safeCardKey = String(cardKey).replace(/"/g, '\\"');
  const element = document.querySelector(`[data-editable-type="office-card"][data-editable-id="${safeCardKey}"]`);

  if (!element) {
    return;
  }

  if (field === "tag") {
    const tag = element.querySelector(".card-tag");
    if (tag) {
      tag.textContent = value;
    }
  }

  if (field === "title") {
    const title = element.querySelector("h3");
    if (title) {
      title.textContent = value;
    }
  }

  if (field === "summary") {
    const summary = element.querySelector(":scope > p");
    if (summary) {
      summary.textContent = value;
    }
  }

  if (field === "tagHref") {
    const tagLink = element.querySelector(".card-tag-link");
    if (tagLink) {
      tagLink.setAttribute("href", value);
    }
  }

  if (field === "hoursLabel") {
    const labels = element.querySelectorAll(".office-operations-label");
    if (labels[0]) {
      labels[0].textContent = value;
    }
  }

  if (field === "holidaysLabel") {
    const labels = element.querySelectorAll(".office-operations-label");
    if (labels[1]) {
      labels[1].textContent = value;
    }
  }

  if (field === "action.label") {
    const button = element.querySelector(".button");
    if (button) {
      button.textContent = value;
    }
  }

  if (field === "action.href") {
    const button = element.querySelector(".button");
    if (button) {
      button.setAttribute("href", value);
    }
  }

  if (field === "action.external") {
    const button = element.querySelector(".button");
    if (!button) {
      return;
    }

    if (value) {
      button.setAttribute("target", "_blank");
      button.setAttribute("rel", "noreferrer");
    } else {
      button.removeAttribute("target");
      button.removeAttribute("rel");
    }
  }
}

function syncOfficeSectionPreview(field, value) {
  if (typeof document === "undefined") {
    return;
  }

  const selector = field === "eyebrow"
    ? '[data-editable-type="section-eyebrow"][data-editable-id="office"]'
    : '[data-editable-type="section-heading"][data-editable-id="office"]';
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = value;
  }
}

function syncOfficeChipsPreview(cardKey, chips) {
  if (!cardKey || typeof document === "undefined") {
    return;
  }

  const safeCardKey = String(cardKey).replace(/"/g, '\\"');
  const element = document.querySelector(`[data-editable-type="office-card"][data-editable-id="${safeCardKey}"]`);
  const chipRow = element?.querySelector(".chip-row");

  if (!chipRow) {
    return;
  }

  chipRow.replaceChildren(...chips.map((chip, index) => createOfficeChipPreviewElement(cardKey, chip, index)));
}

function createOfficeChipPreviewElement(cardKey, chip, index) {
  const element = document.createElement(chip.href ? "a" : "span");

  element.className = chip.href ? "chip chip-link" : "chip";
  element.dataset.editableType = "office-chip";
  element.dataset.editableId = `${cardKey}:${index}`;
  element.textContent = chip.label || "";

  if (!chip.href) {
    return element;
  }

  element.setAttribute("href", chip.href);

  if (chip.external) {
    element.setAttribute("target", "_blank");
    element.setAttribute("rel", "noreferrer");
  }

  if (chip.download) {
    element.setAttribute("download", "");
  }

  if (chip.handbookModal) {
    element.setAttribute("data-handbook-modal-trigger", "");
    element.setAttribute("aria-haspopup", "dialog");
    element.setAttribute("aria-controls", "agentHandbookModal");
  }

  return element;
}

function syncOfficeHoursPreview(hours) {
  if (typeof document === "undefined") {
    return;
  }

  const list = document.querySelector('[data-editable-type="office-card"][data-editable-id="operations"] .office-hours-list');

  if (!list) {
    return;
  }

  list.replaceChildren(...hours.map((hour) => {
    const item = document.createElement("li");
    const days = document.createElement("strong");
    const time = document.createElement("span");

    days.textContent = hour.days || "";
    time.textContent = hour.time || "";
    item.append(days, time);

    return item;
  }));
}

function syncOfficeHolidaysPreview(holidays) {
  if (typeof document === "undefined") {
    return;
  }

  const list = document.querySelector('[data-editable-type="office-card"][data-editable-id="operations"] .office-holiday-list');

  if (!list) {
    return;
  }

  list.replaceChildren(...holidays.map((holiday) => {
    const item = document.createElement("li");

    item.textContent = holiday || "";

    return item;
  }));
}

function syncRoomsSectionPreview(field, value) {
  if (typeof document === "undefined") {
    return;
  }

  const selector = field === "eyebrow"
    ? '[data-editable-type="section-eyebrow"][data-editable-id="rooms"]'
    : '[data-editable-type="section-heading"][data-editable-id="rooms"]';
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = value;
  }
}

function syncRoomsPreview(field, value) {
  if (typeof document === "undefined") {
    return;
  }

  const element = document.querySelector('[data-editable-type="room-booking-card"][data-editable-id="rooms"]');

  if (!element) {
    return;
  }

  if (field === "summary") {
    const summary = element.querySelector(":scope > p");
    if (summary) {
      summary.textContent = value;
    }
  }
}

function syncRoomActionsPreview(actions) {
  if (typeof document === "undefined") {
    return;
  }

  const actionsElement = document.querySelector('[data-editable-type="room-booking-card"][data-editable-id="rooms"] .office-booking-actions');

  if (!actionsElement) {
    return;
  }

  actionsElement.replaceChildren(...actions.map((action, index) => createRoomActionPreviewElement(action, index)));
}

function createRoomActionPreviewElement(action, index) {
  const button = document.createElement("button");

  button.type = "button";
  button.className = "button primary compact room-booking-trigger";
  button.dataset.editableType = "room-action";
  button.dataset.editableId = String(index);
  button.dataset.roomBookingLabel = action.label || "";
  button.dataset.roomBookingUrl = action.url || "";
  button.textContent = action.label || "";

  return button;
}

function syncRoomCalendarsPreview(calendars) {
  if (typeof document === "undefined") {
    return;
  }

  const grid = document.querySelector('[data-editable-type="room-booking-card"][data-editable-id="rooms"] .office-calendar-grid');

  if (!grid) {
    return;
  }

  grid.replaceChildren(...calendars.map((calendar, index) => createRoomCalendarPreviewElement(calendar, index)));
}

function createRoomCalendarPreviewElement(calendar, index) {
  const section = document.createElement("section");
  const head = document.createElement("div");
  const label = document.createElement("p");
  const iframe = document.createElement("iframe");

  section.className = "office-calendar-card";
  section.dataset.editableType = "room-calendar";
  section.dataset.editableId = String(index);
  head.className = "office-calendar-head";
  label.className = "office-operations-label";
  label.textContent = calendar.label || "";
  iframe.className = "office-calendar-frame";
  iframe.title = calendar.title || "";
  iframe.src = calendar.src || "";
  iframe.loading = "lazy";
  head.append(label);
  section.append(head, iframe);

  return section;
}

function syncLeaderPreview(personId, field, value) {
  if (!personId || typeof document === "undefined") {
    return;
  }

  const safePersonId = String(personId).replace(/"/g, '\\"');
  const element = document.querySelector(`[data-editable-id="${safePersonId}"][data-editable-type="leader-card"], [data-editable-id="${safePersonId}"][data-editable-type="alc-poster-card"]`);

  if (!element) {
    return;
  }

  if (field === "role") {
    const role = element.querySelector(".leader-role, .alc-poster-copy span");
    if (role) {
      role.textContent = value;
    }
  }

  if (field === "name") {
    const name = element.querySelector("h3, .alc-poster-copy strong");
    if (name) {
      name.textContent = value;
    }
    const image = element.querySelector("img");
    if (image) {
      image.alt = value;
    }
  }

  if (field === "notes") {
    let notes = element.querySelector(".leader-notes");
    if (!notes && element.matches(".leader-card") && value) {
      notes = document.createElement("p");
      notes.className = "leader-notes";
      element.querySelector(".leader-copy h3")?.after(notes);
    }
    if (notes) {
      notes.textContent = value;
      if (!value) {
        notes.remove();
      }
    }
  }

  if (field === "photo") {
    const image = element.querySelector("img");
    if (image) {
      image.src = value;
    }
    if (element.matches("a")) {
      element.href = value;
    }
  }

  if (field === "email" || field === "phone") {
    syncLeaderContactPreview(element, field, value);
  }

  if (field === "featured") {
    element.classList.toggle("leader-card-highlight", Boolean(value));
  }
}

function syncLeaderContactPreview(element, field, value) {
  const list = element.querySelector(".leader-contact-list");

  if (!list) {
    return;
  }

  const selector = field === "email" ? 'a[href^="mailto:"]' : 'a[href^="tel:"]';
  let link = list.querySelector(selector);

  if (!value) {
    link?.remove();
    return;
  }

  if (!link) {
    link = document.createElement("a");
    link.className = "leader-contact-link";
    list.append(link);
  }

  link.textContent = value;
  link.href = field === "email" ? `mailto:${value}` : `tel:${value.replace(/\D/g, "")}`;
}

function syncLeadershipSupportPreview(field, value) {
  if (typeof document === "undefined") {
    return;
  }

  const element = document.querySelector('[data-editable-type="leadership-support-card"][data-editable-id="leadershipSupport"], #leadership-support');

  if (!element) {
    return;
  }

  if (field === "eyebrow") {
    const eyebrow = element.querySelector(".leadership-support-copy .eyebrow");
    if (eyebrow) {
      eyebrow.textContent = value;
    }
  }

  if (field === "title") {
    const title = element.querySelector(".leadership-support-copy h3");
    if (title) {
      title.textContent = value;
    }
  }

  if (field === "summary") {
    const summary = element.querySelector(".leadership-support-summary");
    if (summary) {
      summary.textContent = value;
    }
  }

  if (field === "photo") {
    const image = element.querySelector(".leadership-support-photo");
    if (image) {
      image.src = value || LEADERSHIP_SUPPORT_DEFAULT.photo;
    }

    document.querySelectorAll(".mobile-tech-help-avatar img").forEach((mobileImage) => {
      mobileImage.src = value || LEADERSHIP_SUPPORT_DEFAULT.photo;
    });
  }

  if (field === "photoAlt") {
    const image = element.querySelector(".leadership-support-photo");
    if (image) {
      image.alt = value || LEADERSHIP_SUPPORT_DEFAULT.photoAlt;
    }

    document.querySelectorAll(".mobile-tech-help-avatar img").forEach((mobileImage) => {
      mobileImage.alt = value || LEADERSHIP_SUPPORT_DEFAULT.photoAlt;
    });
  }

  if (field === "buttonLabel") {
    document.querySelectorAll("[data-joe-primary-action]").forEach((button) => {
      button.textContent = value;
    });
  }

  if (field === "buttonHref") {
    document.querySelectorAll("[data-joe-primary-action]").forEach((button) => {
      button.setAttribute("href", value);
    });
  }
}

function previewJoeAvailability(availability) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent("kwp:joe-availability-preview", {
    detail: availability
  }));
}

function syncLeadershipSectionPreview(sectionKey, field, value) {
  if (typeof document === "undefined") {
    return;
  }

  const selector = field === "eyebrow"
    ? `[data-editable-type="section-eyebrow"][data-editable-id="${sectionKey}"]`
    : field === "summary"
    ? `[data-editable-type="section-summary"][data-editable-id="${sectionKey}"]`
    : `[data-editable-type="section-heading"][data-editable-id="${sectionKey}"]`;
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = value;
  }
}

function appendLeaderPreview(person) {
  if (!person || typeof document === "undefined") {
    return;
  }

  const grid = document.querySelector(".leadership-grid");

  if (!grid) {
    return;
  }

  const element = document.createElement("article");
  const image = document.createElement("img");
  const copy = document.createElement("div");
  const role = document.createElement("span");
  const name = document.createElement("h3");
  const contacts = document.createElement("div");

  element.className = "leader-card";
  element.dataset.editableType = "leader-card";
  element.dataset.editableId = person.id;
  image.className = "leader-photo";
  image.src = person.photo || "";
  image.alt = person.name || "";
  copy.className = "leader-copy";
  role.className = "leader-role";
  role.textContent = person.role || "";
  name.textContent = person.name || "";
  contacts.className = "leader-contact-list";
  copy.append(role, name, contacts);
  element.append(image, copy);
  grid.append(element);
}

function removeLeaderPreview(personId) {
  if (!personId || typeof document === "undefined") {
    return;
  }

  const safePersonId = String(personId).replace(/"/g, '\\"');
  const element = document.querySelector(`[data-editable-id="${safePersonId}"][data-editable-type="leader-card"], [data-editable-id="${safePersonId}"][data-editable-type="alc-poster-card"]`);
  element?.remove();
}

function syncTrainingResourceSectionPreview(field, value) {
  if (typeof document === "undefined") {
    return;
  }

  const selector = field === "eyebrow"
    ? '[data-editable-type="section-eyebrow"][data-editable-id="trainingResources"]'
    : '[data-editable-type="section-heading"][data-editable-id="trainingResources"]';
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = value;
  }
}

function appendEditableCardPreview(editableType, card) {
  if (!editableType || !card || typeof document === "undefined") {
    return;
  }

  const sectionSelector = editableType === "training-resource-card" ? "#training-resources" : "#training";
  const grid = document.querySelector(`${sectionSelector} .course-grid`);

  if (!grid) {
    return;
  }

  const element = document.createElement("a");
  element.className = "course-card";
  element.dataset.editableType = editableType;
  element.dataset.editableId = card.id;
  element.href = card.href || "#";
  if (card.external !== false) {
    element.target = "_blank";
    element.rel = "noreferrer";
  }
  element.innerHTML = `<span class="card-tag"></span><h3></h3><p></p>`;
  element.querySelector(".card-tag").textContent = card.tag || "";
  element.querySelector("h3").textContent = card.title || "";
  element.querySelector("p").textContent = card.summary || "";
  grid.appendChild(element);
}

function removeEditableCardPreview(editableType, itemId) {
  if (!editableType || !itemId || typeof document === "undefined") {
    return;
  }

  const safeEditableType = String(editableType).replace(/"/g, '\\"');
  const safeItemId = String(itemId).replace(/"/g, '\\"');
  const element = document.querySelector(`[data-editable-type="${safeEditableType}"][data-editable-id="${safeItemId}"]`);
  element?.remove();
}

function syncVendorSectionPreview(sectionKey, field, value) {
  if (typeof document === "undefined") {
    return;
  }

  const selector = field === "eyebrow"
    ? `[data-editable-type="section-eyebrow"][data-editable-id="${sectionKey}"]`
    : field === "summary"
    ? `[data-editable-type="section-summary"][data-editable-id="${sectionKey}"]`
    : `[data-editable-type="section-heading"][data-editable-id="${sectionKey}"]`;
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = value;
  }
}

function syncBrandAssetSectionPreview(sectionKey, field, value) {
  if (typeof document === "undefined") {
    return;
  }

  const selector = field === "eyebrow"
    ? `[data-editable-type="section-eyebrow"][data-editable-id="${sectionKey}"]`
    : field === "summary"
    ? `[data-editable-type="section-summary"][data-editable-id="${sectionKey}"]`
    : `[data-editable-type="section-heading"][data-editable-id="${sectionKey}"]`;
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = value;
  }
}

function syncBrandAssetPreview(editableType, itemId, field, value) {
  if (!editableType || !itemId || typeof document === "undefined") {
    return;
  }

  const element = getBrandAssetElement(editableType, itemId);

  if (!element) {
    return;
  }

  if (field === "kicker") {
    const tag = element.querySelector(".eyebrow");
    if (tag) {
      tag.textContent = value;
    }
  }

  if (field === "title") {
    const title = element.querySelector("h3");
    if (title) {
      title.textContent = value;
    }
  }

  if (field === "summary") {
    const summary = editableType === "digital-logo-card"
      ? element.querySelector(".asset-card-copy p:not(.eyebrow)")
      : [...element.querySelectorAll(":scope > p")].find((paragraph) => !paragraph.classList.contains("eyebrow"));

    if (summary) {
      summary.textContent = value;
    }
  }

  if (field === "previewClass") {
    const preview = element.querySelector(".asset-preview");
    if (preview) {
      preview.className = `asset-preview ${value || ""}`.trim();
    }
  }

  if (field === "image.src") {
    const image = element.querySelector("img");
    if (image) {
      image.src = value || "";
    }
  }

  if (field === "image.alt") {
    const image = element.querySelector("img");
    if (image) {
      image.alt = value || "";
    }
  }

  if (field === "active") {
    element.hidden = value === false;
  }
}

function syncBrandAssetLinksPreview(editableType, itemId, links) {
  const element = getBrandAssetElement(editableType, itemId);
  const row = element?.querySelector(".chip-row");

  if (!row) {
    return;
  }

  row.replaceChildren(...(links || []).map(createBrandAssetLinkPreviewElement));
}

function getBrandAssetElement(editableType, itemId) {
  if (!editableType || !itemId || typeof document === "undefined") {
    return null;
  }

  const safeEditableType = String(editableType).replace(/"/g, '\\"');
  const safeItemId = String(itemId).replace(/"/g, '\\"');

  return document.querySelector(`[data-editable-type="${safeEditableType}"][data-editable-id="${safeItemId}"]`);
}

function createBrandAssetLinkPreviewElement(link) {
  const element = document.createElement("a");

  element.className = "chip chip-link";
  element.textContent = link.label || "";
  element.href = link.href || "#";

  if (link.external) {
    element.target = "_blank";
    element.rel = "noreferrer";
  }

  if (link.download) {
    element.setAttribute("download", "");
  }

  return element;
}

function syncSiteChromePreview(siteChrome) {
  if (typeof document === "undefined") {
    return;
  }

  const brand = document.querySelector('[data-editable-type="site-brand"][data-editable-id="brand"]');
  const brandLogo = brand?.querySelector("[data-site-brand-logo]");
  const brandTitle = brand?.querySelector("[data-site-brand-title]");
  const footer = siteChrome.footer || {};
  const copyright = document.querySelector('[data-editable-type="site-footer-field"][data-editable-id="copyright"]');
  const address = document.querySelector('[data-editable-type="site-footer-field"][data-editable-id="address"]');
  const phone = document.querySelector('[data-editable-type="site-footer-field"][data-editable-id="phone"]');

  if (brand) {
    brand.href = siteChrome.brandHref || "#";
  }

  if (brandLogo) {
    brandLogo.src = siteChrome.brandLogo || "";
  }

  if (brandTitle) {
    brandTitle.textContent = siteChrome.brandTitle || "";
  }

  if (copyright) {
    copyright.textContent = footer.copyright || "";
  }

  if (address) {
    address.textContent = footer.addressLabel || "";
    address.href = footer.addressHref || "#";
  }

  if (phone) {
    phone.textContent = footer.phoneLabel || "";
    phone.href = footer.phoneHref || "#";
  }
}

function syncOverviewPreview(overview) {
  if (typeof document === "undefined") {
    return;
  }

  setText('[data-editable-type="overview-heading"][data-editable-id="eyebrow"]', overview.eyebrow);
  setText('[data-editable-type="overview-heading"][data-editable-id="title"]', overview.title);
  setText('[data-editable-type="overview-heading"][data-editable-id="summary"]', overview.summary);
  syncOverviewCardPreview("dailyAccess", overview.dailyAccess);
  syncOverviewCardPreview("agenda", overview.agenda);
  syncOverviewMarketPreview("rates", overview.rates);
  syncOverviewMarketPreview("market", overview.market);
}

function syncOverviewCardPreview(groupKey, group) {
  const safeGroupKey = String(groupKey).replace(/"/g, '\\"');
  const card = document.querySelector(`[data-editable-type="overview-card"][data-editable-id="${safeGroupKey}"]`);

  if (!card) {
    return;
  }

  const tag = card.querySelector(".card-tag");
  const title = card.querySelector("strong");
  const links = card.querySelector(groupKey === "agenda" ? ".dashboard-agenda-links" : ".dashboard-quick-grid");

  if (tag) {
    tag.textContent = group?.tag || "";
  }

  if (title) {
    title.textContent = group?.title || "";
  }

  links?.replaceChildren(...(group?.links || []).filter((link) => link.active !== false).map((link, index) => createOverviewLinkPreviewElement(link, groupKey, index)));
}

function syncOverviewMarketPreview(groupKey, group) {
  const safeGroupKey = String(groupKey).replace(/"/g, '\\"');
  const elements = document.querySelectorAll(`[data-editable-type="overview-market"][data-editable-id="${safeGroupKey}"]`);

  if (elements[0]) {
    elements[0].textContent = group?.eyebrow || "";
  }

  if (elements[1]) {
    elements[1].textContent = group?.title || "";
  }
}

function createOverviewLinkPreviewElement(link, groupKey, index) {
  const element = document.createElement("a");

  element.className = "dashboard-mini-link";
  element.dataset.editableType = "overview-link";
  element.dataset.editableId = `${groupKey}:${index}`;
  element.textContent = link.label || "";
  element.href = link.href || "#";

  if (link.external) {
    element.target = "_blank";
    element.rel = "noreferrer";
  }

  if (link.download) {
    element.setAttribute("download", "");
  }

  if (link.calendarModal) {
    element.dataset.calendarModalTrigger = "";
    element.setAttribute("aria-haspopup", "dialog");
    element.setAttribute("aria-controls", "fullCalendarModal");
  }

  return element;
}

function setText(selector, value) {
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = value || "";
  }
}

function syncTechSectionPreview(sectionKey, field, value) {
  if (typeof document === "undefined") {
    return;
  }

  const selector = field === "eyebrow"
    ? `[data-editable-type="section-eyebrow"][data-editable-id="${sectionKey}"]`
    : field === "summary"
    ? `[data-editable-type="section-summary"][data-editable-id="${sectionKey}"]`
    : `[data-editable-type="section-heading"][data-editable-id="${sectionKey}"]`;
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = value;
  }
}

function syncTechJoeSupportPreview(field, value) {
  if (typeof document === "undefined") {
    return;
  }

  const element = document.querySelector('[data-editable-type="tech-joe-support"][data-editable-id="techJoeSupport"]');

  if (!element) {
    return;
  }

  if (field === "name") {
    const name = element.querySelector(".joe-support-profile-copy .eyebrow");
    if (name) {
      name.textContent = value;
    }
  }

  if (field === "role") {
    const role = element.querySelector(".joe-support-profile-title");
    if (role) {
      role.textContent = value;
    }
  }

  if (field === "photo") {
    const image = element.querySelector(".joe-support-profile-photo");
    if (image) {
      image.src = value;
    }
  }

  if (field === "photoAlt") {
    const image = element.querySelector(".joe-support-profile-photo");
    if (image) {
      image.alt = value;
    }
  }

  if (field === "phone") {
    const phone = element.querySelectorAll(".joe-support-contact-link")[0];
    if (phone) {
      const digits = String(value || "").replace(/\D/g, "");
      phone.textContent = value || "";
      phone.href = digits ? `tel:+1${digits.length === 10 ? digits : digits.replace(/^1/, "")}` : "";
    }
  }

  if (field === "email") {
    const email = element.querySelectorAll(".joe-support-contact-link")[1];
    if (email) {
      email.textContent = value || "";
      email.href = `mailto:${value || ""}?subject=KW%20Tech%20Question`;
    }
  }

  if (field === "buttonLabel") {
    const button = element.querySelector(".tech-overview-actions .button.primary");
    if (button) {
      button.textContent = value;
    }
  }

  if (field === "buttonHref") {
    const button = element.querySelector(".tech-overview-actions .button.primary");
    if (button) {
      button.href = value || "#";
    }
  }

  if (field === "secondaryLinks") {
    const actions = element.querySelector(".tech-overview-actions");
    const primary = actions?.querySelector(".button.primary");

    if (actions && primary) {
      actions.replaceChildren(primary, ...createTechJoeSecondaryLinkPreviewElements(value || []));
    }
  }
}

function createTechJoeSecondaryLinkPreviewElements(links = []) {
  return links
    .filter((link) => link.active !== false)
    .map((link, index) => {
      const element = document.createElement("a");

      element.className = "button secondary compact";
      element.dataset.editableType = "tech-joe-link";
      element.dataset.editableId = String(index);
      element.textContent = link.label || "";
      element.href = link.href || "#";

      if (link.external) {
        element.target = "_blank";
        element.rel = "noreferrer";
      }

      if (link.download) {
        element.setAttribute("download", "");
      }

      return element;
    });
}

function syncTechItemPreview(editableType, itemId, field, value) {
  const element = getTechElement(editableType, itemId);

  if (!element) {
    return;
  }

  if (field === "kicker") {
    const tag = element.querySelector(".eyebrow, .card-tag");
    if (tag) {
      tag.textContent = value;
    }
  }

  if (field === "title") {
    const title = element.querySelector("h3");
    if (title) {
      title.textContent = value;
    }
  }

  if (field === "summary" || field === "secondarySummary") {
    const paragraphs = [...element.querySelectorAll(":scope > p")].filter((paragraph) => !paragraph.classList.contains("eyebrow"));
    const paragraph = field === "secondarySummary" ? paragraphs[1] : paragraphs[0];

    if (paragraph) {
      paragraph.textContent = value;
    }
  }

  if (field === "active") {
    element.hidden = value === false;
  }
}

function syncTechLinksPreview(editableType, itemId, links) {
  const element = getTechElement(editableType, itemId);
  let row = element?.querySelector(".chip-row");

  if (!element) {
    return;
  }

  if (!row && links?.length) {
    row = document.createElement("div");
    row.className = "chip-row asset-downloads";
    element.append(row);
  }

  row?.replaceChildren(...(links || []).map(createBrandAssetLinkPreviewElement));
}

function syncTechQuickLinksPreview(links) {
  if (typeof document === "undefined") {
    return;
  }

  const row = document.querySelector('[data-editable-type="tech-quick-links"][data-editable-id="techQuickLinks"]');

  if (!row) {
    return;
  }

  row.replaceChildren(...(links || []).map(createBrandAssetLinkPreviewElement));
}

function getTechElement(editableType, itemId) {
  if (!editableType || !itemId || typeof document === "undefined") {
    return null;
  }

  const safeEditableType = String(editableType).replace(/"/g, '\\"');
  const safeItemId = String(itemId).replace(/"/g, '\\"');

  return document.querySelector(`[data-editable-type="${safeEditableType}"][data-editable-id="${safeItemId}"]`);
}

function appendTechItemPreview(editableType, item) {
  if (!editableType || !item || typeof document === "undefined") {
    return;
  }

  const gridSelector = editableType === "tech-help-card"
    ? "#help-paths .marketing-tool-grid"
    : editableType === "tech-papercut-card"
    ? "#papercut-hive .asset-source-grid"
    : "#kw-answers .asset-source-grid";
  const grid = document.querySelector(gridSelector);

  if (!grid) {
    return;
  }

  const element = document.createElement("article");
  const tagElement = editableType === "tech-papercut-card" ? document.createElement("span") : document.createElement("p");
  const title = document.createElement("h3");
  const summary = document.createElement("p");

  element.className = editableType === "tech-help-card"
    ? "asset-source-card marketing-tool-card"
    : editableType === "tech-papercut-card"
    ? "support-card support-card-accent"
    : "asset-source-card";
  element.dataset.editableType = editableType;
  element.dataset.editableId = item.id;
  tagElement.className = editableType === "tech-papercut-card" ? "card-tag" : "eyebrow small";
  tagElement.textContent = item.kicker || "";
  title.textContent = item.title || "";
  summary.textContent = item.summary || "";
  element.append(tagElement, title, summary);

  if (item.secondarySummary) {
    const secondarySummary = document.createElement("p");
    secondarySummary.textContent = item.secondarySummary;
    element.append(secondarySummary);
  }

  const row = document.createElement("div");
  row.className = "chip-row asset-downloads";
  element.append(row);
  grid.append(element);
  syncTechLinksPreview(editableType, item.id, item.links || []);
}

function removeTechItemPreview(editableType, itemId) {
  const element = getTechElement(editableType, itemId);
  element?.remove();
}

function syncCustomSectionsPreview(sections) {
  if (typeof document === "undefined") {
    return;
  }

  const main = document.querySelector(".page-content");

  if (!main) {
    return;
  }

  main.querySelectorAll('section[data-editable-type="custom-section"]').forEach((section) => {
    section.remove();
  });

  (sections || [])
    .filter(isCustomSectionPreviewVisible)
    .forEach((section) => {
      main.append(createCustomSectionPreviewElement(section));
    });
}

function createCustomSectionPreviewElement(section) {
  const element = document.createElement("section");
  const head = document.createElement("div");
  const headCopy = document.createElement("div");
  const eyebrow = document.createElement("p");
  const title = document.createElement("h2");
  const grid = document.createElement("div");

  element.className = "panel";
  element.id = section.id || "";
  element.dataset.editableType = "custom-section";
  element.dataset.editableId = section.id || "";
  head.className = "section-head";
  eyebrow.className = "eyebrow small";
  eyebrow.dataset.editableType = "custom-section-eyebrow";
  eyebrow.dataset.editableId = section.id || "";
  eyebrow.textContent = section.eyebrow || "";
  title.dataset.editableType = "custom-section-heading";
  title.dataset.editableId = section.id || "";
  title.textContent = section.title || "";
  headCopy.append(eyebrow, title);

  const sectionSummary = section.summary || section.description || "";

  if (sectionSummary) {
    const summary = document.createElement("p");

    summary.className = "dashboard-summary";
    summary.dataset.editableType = "custom-section-summary";
    summary.dataset.editableId = section.id || "";
    summary.textContent = sectionSummary;
    headCopy.append(summary);
  }

  head.append(headCopy);
  grid.className = "asset-source-grid";
  grid.dataset.customSectionGrid = section.id || "";
  (section.cards || [])
    .filter(isCustomSectionPreviewVisible)
    .forEach((card) => {
      grid.append(createCustomSectionCardPreviewElement(section.id, card));
    });
  element.append(head, grid);

  return element;
}

function createCustomSectionCardPreviewElement(sectionId, card) {
  const element = document.createElement("article");
  const kicker = document.createElement("p");
  const title = document.createElement("h3");
  const summary = document.createElement("p");
  const links = document.createElement("div");
  const cardSummary = card.summary || card.description || "";
  const kickerText = card.kicker || card.tag || "";

  element.className = "asset-source-card custom-section-card";
  element.dataset.editableType = "custom-section-card";
  element.dataset.editableId = `${sectionId || ""}:${card.id || ""}`;
  kicker.className = "eyebrow small";
  kicker.textContent = kickerText;
  title.textContent = card.title || "";
  summary.textContent = cardSummary;
  links.className = "chip-row asset-downloads";
  links.replaceChildren(...getCustomSectionPreviewLinks(card).map(createBrandAssetLinkPreviewElement));
  element.append(kicker, title, summary, links);

  return element;
}

function getCustomSectionPreviewLinks(card) {
  if (Array.isArray(card.links) && card.links.length) {
    return card.links;
  }

  if (card.href || card.link || card.buttonHref) {
    return [
      {
        label: card.buttonLabel || card.linkLabel || "Open Link",
        href: card.href || card.link || card.buttonHref,
        external: Boolean(card.external),
        download: Boolean(card.download)
      }
    ];
  }

  return [];
}

function isCustomSectionPreviewVisible(item) {
  return item?.active !== false && item?.visible !== false;
}

function syncNavigationListPreview(listKey, links) {
  if (typeof document === "undefined") {
    return;
  }

  if (listKey === "navLinks") {
    const desktopNav = document.querySelector(".portal-sidebar .section-nav");
    const mobileNav = document.querySelector(".mobile-menu-panel:first-child .mobile-menu-links");
    const desktopLinks = (links || []).map((link, index) => createNavigationLinkPreviewElement(link, index, "navigation-link", "section-nav-link"));
    const mobileLinks = (links || []).map((link, index) => createNavigationLinkPreviewElement(link, index, "navigation-link", "section-nav-link"));

    desktopNav?.replaceChildren(...desktopLinks);
    mobileNav?.replaceChildren(...mobileLinks);
    return;
  }

  if (listKey === "sidebarUtilityLinks") {
    const utility = document.querySelector(".portal-sidebar .sidebar-utility");
    const stack = utility?.querySelector(".sidebar-link-stack") || utility;

    stack?.replaceChildren(...(links || []).map((link, index) => createNavigationLinkPreviewElement(link, index, "navigation-utility-link", `button ${link.button || "secondary"} sidebar-button`)));
    return;
  }

  if (listKey === "mobileQuickLinks") {
    const mobileQuickLinks = document.querySelector(".mobile-menu-panel:nth-child(2) .mobile-menu-links");

    mobileQuickLinks?.replaceChildren(...(links || []).map((link, index) => createNavigationLinkPreviewElement(link, index, "navigation-mobile-link", `button ${link.button || "secondary"} sidebar-button`)));
    return;
  }

  if (listKey === "dailyAccessLinks") {
    const dailyLinks = document.querySelector(".content-strip-links");

    dailyLinks?.replaceChildren(...(links || []).map((link, index) => createNavigationLinkPreviewElement(link, index, "navigation-daily-link", `content-strip-link${link.primary ? " content-strip-link-primary" : ""}`)));
  }
}

function syncNavigationLabelPreview(field, value) {
  if (typeof document === "undefined") {
    return;
  }

  document.querySelectorAll(`[data-editable-type="navigation-label"][data-editable-id="${field}"]`).forEach((element) => {
    element.textContent = value || "";
  });
}

function createNavigationLinkPreviewElement(link, index, editableType, className) {
  const element = document.createElement("a");

  element.className = className;
  element.dataset.editableType = editableType;
  element.dataset.editableId = String(index);
  element.textContent = link.label || "";
  element.href = link.href || "#";

  if (link.active) {
    element.classList.add("is-active");
    element.setAttribute("aria-current", "page");
  }

  if (link.page) {
    element.classList.add("section-nav-link--page");
  }

  if (link.primary) {
    element.classList.add(editableType === "navigation-daily-link" ? "content-strip-link-primary" : "section-nav-link--primary");
  }

  if (link.external) {
    element.target = "_blank";
    element.rel = "noreferrer";
  }

  if (link.download) {
    element.setAttribute("download", "");
  }

  return element;
}

function appendBrandAssetPreview(editableType, item) {
  if (!editableType || !item || typeof document === "undefined") {
    return;
  }

  const gridSelector = editableType === "marketing-tool-card"
    ? ".marketing-tool-grid"
    : editableType === "digital-logo-card"
    ? ".asset-grid"
    : ".asset-source-grid";
  const grid = document.querySelector(gridSelector);

  if (!grid) {
    return;
  }

  const element = document.createElement("article");
  element.dataset.editableType = editableType;
  element.dataset.editableId = item.id;

  if (editableType === "digital-logo-card") {
    element.className = "asset-card";
    element.innerHTML = `<div class="asset-preview ${item.previewClass || ""}"><img src="${item.image?.src || ""}" alt="${item.image?.alt || ""}"></div><div class="asset-card-copy"><p class="eyebrow small"></p><h3></h3><p></p></div><div class="chip-row asset-downloads"></div>`;
  } else {
    element.className = editableType === "marketing-tool-card" ? "asset-source-card marketing-tool-card" : "asset-source-card";
    element.innerHTML = `<p class="eyebrow small"></p><h3></h3><p></p><div class="chip-row asset-downloads"></div>`;
  }

  grid.append(element);
  syncBrandAssetPreview(editableType, item.id, "kicker", item.kicker || "");
  syncBrandAssetPreview(editableType, item.id, "title", item.title || "");
  syncBrandAssetPreview(editableType, item.id, "summary", item.summary || "");
  syncBrandAssetLinksPreview(editableType, item.id, item.links || []);
}

function removeBrandAssetPreview(editableType, itemId) {
  const element = getBrandAssetElement(editableType, itemId);
  element?.remove();
}

function appendVendorPreview(vendor) {
  if (!vendor || typeof document === "undefined") {
    return;
  }

  const grid = document.querySelector(`[data-vendor-grid="${vendor.section || "services"}"]`);

  if (!grid) {
    return;
  }

  const element = document.createElement("article");
  const brand = document.createElement("div");
  const image = document.createElement("img");
  const details = document.createElement("dl");

  element.className = `vendor-card${vendor.section === "core" ? " vendor-card-featured" : ""}`;
  element.dataset.editableType = "vendor-card";
  element.dataset.editableId = vendor.id;
  brand.className = "vendor-brand";
  image.className = "vendor-logo";
  image.src = vendor.logo || "";
  image.alt = `${vendor.business || vendor.name || ""} logo`;
  details.className = "vendor-details";
  brand.append(image);
  details.append(
    createVendorDetailRow("Business", vendor.business || ""),
    createVendorDetailRow("Name", vendor.name || ""),
    createVendorDetailRow("Phone", vendor.phone || "", createPhoneLinkPreview),
    createVendorDetailRow("E-mail", vendor.email || "", createEmailLinkPreview),
    createVendorDetailRow("Notes", vendor.notes || "")
  );
  element.append(brand, details);
  grid.append(element);
}

function createVendorDetailRow(label, value, createContent) {
  const row = document.createElement("div");
  const term = document.createElement("dt");
  const description = document.createElement("dd");

  term.textContent = label;
  if (createContent && value) {
    description.append(createContent(value));
  } else {
    description.textContent = value || "";
  }
  row.append(term, description);

  return row;
}

function removeVendorPreview(vendorId) {
  if (!vendorId || typeof document === "undefined") {
    return;
  }

  const safeVendorId = String(vendorId).replace(/"/g, '\\"');
  const element = document.querySelector(`[data-editable-type="vendor-card"][data-editable-id="${safeVendorId}"]`);
  element?.remove();
}

function AddToolsPanel({ activeSection, canAddCard, onAddCard, onAddSection, onBackToPageTools }) {
  return (
    <div className="visual-editor-add-tools">
      <div className="visual-editor-empty-state">
        <strong>{activeSection.label}</strong>
        <p>Add tools live here. Editing the selected item stays in the floating pop-up.</p>
      </div>
      <div className="visual-editor-add-grid">
        <button className="visual-editor-button" type="button" disabled={!canAddCard} onClick={onAddCard}>
          Add Card
        </button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={onAddSection}>
          Add Section
        </button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={onBackToPageTools}>
          Page Tools
        </button>
      </div>
      {!canAddCard ? (
        <p className="visual-editor-note">
          Cards can be added in Training Resources, Productivity Coaching, Leadership, and Vendor Row right now. More section types are coming as they become data-backed.
        </p>
      ) : null}
    </div>
  );
}

function SelectedItemPanel({ item, selectedEditableCard, onClear, onEdit, onMoveDown, onMoveUp }) {
  return (
    <div className="visual-editor-selection-summary visual-editor-context-panel">
      <div>
        <strong>{item.label}</strong>
        <p>{item.type} {item.sectionLabel ? `in ${item.sectionLabel}` : ""}</p>
        {item.href ? <p className="visual-editor-selection-link">{item.href}</p> : null}
        {(item.type === "course-card" || item.type === "training-resource-card") && selectedEditableCard ? (
          <p>Click Edit to change this card in a focused floating editor.</p>
        ) : (
          <p>This item is selectable. Editing controls for this item type will be added in its module slice.</p>
        )}
        {item.panelHint ? <p className="visual-editor-context-note">{item.panelHint}</p> : null}
      </div>
      <div className="visual-editor-context-actions">
        <button type="button" onClick={onEdit}>
          Edit
        </button>
        <button type="button" onClick={onMoveUp}>
          Move Up
        </button>
        <button type="button" onClick={onMoveDown}>
          Move Down
        </button>
        <button type="button" onClick={onClear}>
          Back
        </button>
      </div>
    </div>
  );
}

function FloatingSelectionToolbar({ item, onClear, onEdit, onMoveDown, onMoveUp }) {
  return (
    <div
      className="visual-editor-floating-toolbar"
      style={{
        top: `${item.toolbarPosition.top}px`,
        left: `${item.toolbarPosition.left}px`
      }}
      role="toolbar"
      aria-label={`Editing ${item.label}`}
    >
      <strong>{item.type}</strong>
      <button type="button" onClick={onEdit}>Edit</button>
      <button type="button" onClick={onMoveUp}>Move Up</button>
      <button type="button" onClick={onMoveDown}>Move Down</button>
      <button type="button" onClick={onClear}>Done</button>
    </div>
  );
}

function FloatingItemEditor({
  card,
  cardErrors,
  cardIndex,
  editableType,
  isSaving,
  isUploading,
  item,
  joeAvailability,
  leader,
  leaderErrors,
  leaderIndex,
  leadershipSupport,
  leadershipSectionSettings,
  alcSectionSettings,
  navigation,
  navigationErrors,
  navigationListKey,
  navigationLabelKey,
  navigationLink,
  navigationLinkIndex,
  siteChrome,
  siteChromeErrors,
  siteChromeSelection,
  overview,
  overviewErrors,
  overviewSelection,
  customSection,
  customSectionCard,
  customSectionCardIndex,
  customSectionErrors,
  customSectionIndex,
  customSections,
  vendor,
  brandOverviewSectionSettings,
  digitalLogo,
  digitalLogoErrors,
  digitalLogoIndex,
  digitalLogos,
  digitalLogosSectionSettings,
  marketingTool,
  marketingToolErrors,
  marketingToolIndex,
  marketingTools,
  marketingToolsSectionSettings,
  selectedTechAnswer,
  selectedTechAnswerIndex,
  selectedTechHelpPath,
  selectedTechHelpPathIndex,
  selectedTechPaperCut,
  selectedTechPaperCutIndex,
  sourceFile,
  sourceFileErrors,
  sourceFileIndex,
  sourceFiles,
  sourceFilesSectionSettings,
  techAnswerCards,
  techAnswerErrors,
  techHelpPathErrors,
  techHelpPaths,
  techJoeSupport,
  techPaperCutCards,
  techPaperCutErrors,
  techQuickLinks,
  techSections,
  vendorDirectorySectionSettings,
  vendorCoreSectionSettings,
  vendorErrors,
  vendorIndex,
  vendorServicesSectionSettings,
  officeCard,
  officeCardErrors,
  officeCardKey,
  officeSectionSettings,
  onAddOfficeChip,
  onAddOfficeHoliday,
  onAddOfficeHour,
  onAddBrandAssetLink,
  onAddCustomSectionCard,
  onAddCustomSectionCardLink,
  onAddTechLink,
  onAddTechJoeSupportLink,
  onAddTechQuickLink,
  onAddNavigationLink,
  onAddOverviewLink,
  onClose,
  onMoveLeader,
  onMoveVendor,
  onMoveOfficeChip,
  onMoveOfficeHoliday,
  onMoveOfficeHour,
  onMoveBrandAssetLink,
  onMoveCustomSection,
  onMoveCustomSectionCard,
  onMoveCustomSectionCardLink,
  onMoveTechAnswer,
  onMoveTechHelpPath,
  onMoveTechLink,
  onMoveTechJoeSupportLink,
  onMoveTechPaperCut,
  onMoveTechQuickLink,
  onMoveNavigationLink,
  onMoveOverviewLink,
  onRemoveOfficeChip,
  onRemoveOfficeHoliday,
  onRemoveOfficeHour,
  onRemoveBrandAssetLink,
  onRemoveCustomSection,
  onRemoveCustomSectionCard,
  onRemoveCustomSectionCardLink,
  onRemoveTechAnswer,
  onRemoveTechHelpPath,
  onRemoveTechLink,
  onRemoveTechJoeSupportLink,
  onRemoveTechPaperCut,
  onRemoveTechQuickLink,
  onRemoveNavigationLink,
  onRemoveOverviewLink,
  onRemoveCard,
  onRemoveLeader,
  onRemoveVendor,
  onSaveCards,
  onSaveJoeAvailability,
  onSaveLeadership,
  onSaveLeadershipSection,
  onSaveLeadershipSupport,
  onSaveVendorSection,
  onSaveVendors,
  onSaveBrandAssets,
  onSaveBrandAssetSection,
  onSaveCustomSections,
  onSaveTechConnect,
  onSaveTechConnectSection,
  onSaveTechJoeSupport,
  onSaveNavigation,
  onSaveSiteChrome,
  onSaveOverview,
  onSaveOfficeCard,
  onSaveOfficeSection,
  onUpdateCard,
  onUpdateJoeAvailability,
  onUpdateJoeAvailabilityStatus,
  onUpdateJoeAvailabilityTracker,
  onUpdateLeader,
  onUpdateLeadershipSection,
  onUpdateLeadershipSupport,
  onUpdateVendor,
  onUpdateVendorSection,
  onUpdateBrandAssetLink,
  onUpdateBrandAssetSection,
  onUpdateCustomSection,
  onUpdateCustomSectionCard,
  onUpdateCustomSectionCardLink,
  onUpdateTechAnswer,
  onUpdateTechHelpPath,
  onUpdateTechJoeSupport,
  onUpdateTechJoeSupportLink,
  onUpdateTechLink,
  onUpdateTechPaperCut,
  onUpdateTechQuickLink,
  onUpdateTechSection,
  onUpdateNavigationLabel,
  onUpdateNavigationLink,
  onUpdateSiteBrand,
  onUpdateSiteFooter,
  onUpdateOverviewField,
  onUpdateOverviewGroup,
  onUpdateOverviewLink,
  onUpdateDigitalLogo,
  onUpdateMarketingTool,
  onUpdateSourceFile,
  onUploadLeaderPhoto,
  onUploadLeadershipSupportPhoto,
  onUploadVendorLogo,
  onUploadDigitalLogoImage,
  onUploadTechJoeSupportPhoto,
  onUpdateOfficeChip,
  onUpdateOfficeCard,
  onUpdateOfficeHoliday,
  onUpdateOfficeHour,
  onUpdateOfficeSection,
  roomErrors,
  rooms,
  roomsSectionSettings,
  onAddRoomAction,
  onAddRoomCalendar,
  onMoveRoomAction,
  onMoveRoomCalendar,
  onRemoveRoomAction,
  onRemoveRoomCalendar,
  onSaveRooms,
  onSaveRoomsSection,
  onUpdateRoomAction,
  onUpdateRoomCalendar,
  onUpdateRoomsField,
  onUpdateRoomsSection,
  sectionSettings,
  onSaveSection,
  onUpdateSection
}) {
  const isCardEditable = item.type === editableType && card && cardIndex >= 0;
  const isNavigationLinkEditable = Boolean(navigationListKey && navigationLink && navigationLinkIndex >= 0);
  const isNavigationLabelEditable = Boolean(navigationLabelKey);
  const isSiteChromeEditable = Boolean(siteChromeSelection && siteChrome);
  const isOverviewEditable = Boolean(overviewSelection && overview);
  const isCustomSectionCardEditable = item.type === "custom-section-card" && customSection && customSectionCard && customSectionIndex >= 0 && customSectionCardIndex >= 0;
  const isCustomSectionEditable = !isCustomSectionCardEditable && Boolean(getCustomSectionIdFromItem(item) && customSection && customSectionIndex >= 0);
  const isOfficeCardEditable = (item.type === "office-card" || item.type === "office-chip") && officeCard && officeCardKey;
  const isTrainingResourceSectionEditable = (
    (item.type === "section" && item.sectionId === "training-resources") ||
    item.editableId === "trainingResources"
  );
  const isOfficeSectionEditable = (
    (item.type === "section" && item.sectionId === "office") ||
    item.editableId === "office"
  );
  const isLeadershipSectionEditable = (
    (item.type === "section" || item.type === "section-eyebrow" || item.type === "section-heading") &&
    (item.sectionId === "leadership" || item.editableId === "leadership")
  );
  const isAlcSectionEditable = (
    (item.type === "section-eyebrow" || item.type === "section-heading" || item.type === "section-summary") &&
    item.editableId === "alc"
  );
  const isLeadershipCardEditable = (item.type === "leader-card" || item.type === "alc-poster-card") && leader && leaderIndex >= 0;
  const isLeadershipSupportEditable = item.type === "leadership-support-card" || item.type === "leadership-support-field" || item.editableId?.startsWith("leadershipSupport");
  const isVendorCardEditable = item.type === "vendor-card" && vendor && vendorIndex >= 0;
  const isMarketingToolEditable = item.type === "marketing-tool-card" && marketingTool && marketingToolIndex >= 0;
  const isDigitalLogoEditable = item.type === "digital-logo-card" && digitalLogo && digitalLogoIndex >= 0;
  const isSourceFileEditable = item.type === "source-file-card" && sourceFile && sourceFileIndex >= 0;
  const isTechHelpPathEditable = item.type === "tech-help-card" && selectedTechHelpPath && selectedTechHelpPathIndex >= 0;
  const isTechPaperCutEditable = item.type === "tech-papercut-card" && selectedTechPaperCut && selectedTechPaperCutIndex >= 0;
  const isTechAnswerEditable = item.type === "tech-answer-card" && selectedTechAnswer && selectedTechAnswerIndex >= 0;
  const isTechJoeSupportEditable = item.type === "tech-joe-support";
  const isJoeAvailabilityEditable = item.type === "joe-availability-card";
  const isTechQuickLinksEditable = item.type === "tech-quick-links";
  const techSectionKey = (item.type === "section" || item.type === "section-eyebrow" || item.type === "section-heading" || item.type === "section-summary")
    ? getTechSectionKeyFromItem(item)
    : "";
  const techSectionSettings = techSectionKey ? techSections[techSectionKey] : null;
  const isTechSectionEditable = Boolean(techSectionKey && techSectionSettings);
  const brandAssetSectionKey = (item.type === "section" || item.type === "section-eyebrow" || item.type === "section-heading" || item.type === "section-summary")
    ? getBrandAssetSectionKeyFromItem(item)
    : "";
  const brandAssetSectionSettings = brandAssetSectionKey === "brandOverview"
    ? brandOverviewSectionSettings
    : brandAssetSectionKey === "marketingTools"
    ? marketingToolsSectionSettings
    : brandAssetSectionKey === "digitalLogos"
    ? digitalLogosSectionSettings
    : brandAssetSectionKey === "sourceFiles"
    ? sourceFilesSectionSettings
    : null;
  const isBrandAssetSectionEditable = Boolean(brandAssetSectionKey && brandAssetSectionSettings);
  const vendorSectionKey = (item.type === "section" || item.type === "section-eyebrow" || item.type === "section-heading" || item.type === "section-summary")
    ? getVendorSectionKeyFromItem(item)
    : "";
  const vendorSectionSettings = vendorSectionKey === "vendorDirectory"
    ? vendorDirectorySectionSettings
    : vendorSectionKey === "vendorCore"
    ? vendorCoreSectionSettings
    : vendorSectionKey === "vendorServices"
    ? vendorServicesSectionSettings
    : null;
  const isVendorSectionEditable = Boolean(vendorSectionKey && vendorSectionSettings);
  const isRoomsSectionEditable = (
    (item.type === "section" || item.type === "section-eyebrow" || item.type === "section-heading") &&
    (item.sectionId === "conference-rooms" || item.editableId === "rooms")
  );
  const isRoomsEditable = item.type === "room-booking-card" || item.type === "room-action" || item.type === "room-calendar";
  const editorRef = useRef(null);
  const [editorPosition, setEditorPosition] = useState(() => getInitialFloatingEditorPosition(item));

  useLayoutEffect(() => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    setEditorPosition(getMeasuredFloatingEditorPosition(item, editor));
  }, [item, cardIndex, cardErrors.length, customSectionErrors.length, leaderErrors.length, officeCardErrors.length, roomErrors.length, officeCardKey, techHelpPathErrors.length, techPaperCutErrors.length, techAnswerErrors.length]);

  return (
    <div
      ref={editorRef}
      className="visual-editor-floating-editor"
      style={{
        top: `${editorPosition.top}px`,
        left: `${editorPosition.left}px`
      }}
      role="dialog"
      aria-label={`Edit ${item.label}`}
    >
      <div className="visual-editor-floating-editor-header">
        <div>
          <span className="visual-editor-kicker">Editing</span>
          <strong>{item.label}</strong>
        </div>
        <button type="button" onClick={onClose} aria-label="Close editor">
          Close
        </button>
      </div>

      {isNavigationLinkEditable ? (
        <NavigationLinkEditor
          errors={navigationErrors}
          index={navigationLinkIndex}
          isSaving={isSaving}
          link={navigationLink}
          listKey={navigationListKey}
          navigation={navigation}
          onAddLink={onAddNavigationLink}
          onMoveLink={onMoveNavigationLink}
          onRemoveLink={onRemoveNavigationLink}
          onSave={onSaveNavigation}
          onUpdateLink={onUpdateNavigationLink}
        />
      ) : isNavigationLabelEditable ? (
        <NavigationLabelEditor
          field={navigationLabelKey}
          isSaving={isSaving}
          navigation={navigation}
          onSave={onSaveNavigation}
          onUpdateLabel={onUpdateNavigationLabel}
        />
      ) : isSiteChromeEditable ? (
        <SiteChromeFloatingEditor
          errors={siteChromeErrors}
          isSaving={isSaving}
          selection={siteChromeSelection}
          siteChrome={siteChrome}
          onSave={onSaveSiteChrome}
          onUpdateBrand={onUpdateSiteBrand}
          onUpdateFooter={onUpdateSiteFooter}
        />
      ) : isOverviewEditable ? (
        <OverviewFloatingEditor
          errors={overviewErrors}
          isSaving={isSaving}
          overview={overview}
          selection={overviewSelection}
          onAddLink={onAddOverviewLink}
          onMoveLink={onMoveOverviewLink}
          onRemoveLink={onRemoveOverviewLink}
          onSave={onSaveOverview}
          onUpdateField={onUpdateOverviewField}
          onUpdateGroup={onUpdateOverviewGroup}
          onUpdateLink={onUpdateOverviewLink}
        />
      ) : isCustomSectionEditable ? (
        <CustomSectionFloatingEditor
          errors={customSectionErrors}
          isSaving={isSaving}
          section={customSection}
          sectionIndex={customSectionIndex}
          sections={customSections}
          onAddCard={onAddCustomSectionCard}
          onMoveSection={onMoveCustomSection}
          onRemoveSection={onRemoveCustomSection}
          onSave={onSaveCustomSections}
          onUpdateSection={onUpdateCustomSection}
        />
      ) : isCustomSectionCardEditable ? (
        <CustomSectionCardFloatingEditor
          card={customSectionCard}
          cardIndex={customSectionCardIndex}
          errors={customSectionErrors}
          isSaving={isSaving}
          section={customSection}
          sectionIndex={customSectionIndex}
          onAddLink={onAddCustomSectionCardLink}
          onMoveCard={onMoveCustomSectionCard}
          onMoveLink={onMoveCustomSectionCardLink}
          onRemoveCard={onRemoveCustomSectionCard}
          onRemoveLink={onRemoveCustomSectionCardLink}
          onSave={onSaveCustomSections}
          onUpdateCard={onUpdateCustomSectionCard}
          onUpdateLink={onUpdateCustomSectionCardLink}
        />
      ) : isTrainingResourceSectionEditable ? (
        <>
          <p className="visual-editor-note">
            Changes update the section heading preview as you type. Save when it looks right.
          </p>
          <label className="visual-editor-field">
            <span>Eyebrow</span>
            <input value={sectionSettings.eyebrow || ""} onChange={(event) => onUpdateSection("eyebrow", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Heading</span>
            <input value={sectionSettings.title || ""} onChange={(event) => onUpdateSection("title", event.target.value)} />
          </label>
          <div className="visual-editor-panel-actions">
            <button className="visual-editor-button" type="button" disabled={isSaving} onClick={onSaveSection}>
              {isSaving ? "Saving" : "Save Heading"}
            </button>
          </div>
        </>
      ) : isOfficeSectionEditable ? (
        <>
          <p className="visual-editor-note">
            Changes update the office section heading preview as you type. Save when it looks right.
          </p>
          <label className="visual-editor-field">
            <span>Eyebrow</span>
            <input value={officeSectionSettings.eyebrow || ""} onChange={(event) => onUpdateOfficeSection("eyebrow", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Heading</span>
            <input value={officeSectionSettings.title || ""} onChange={(event) => onUpdateOfficeSection("title", event.target.value)} />
          </label>
          <div className="visual-editor-panel-actions">
            <button className="visual-editor-button" type="button" disabled={isSaving} onClick={onSaveOfficeSection}>
              {isSaving ? "Saving" : "Save Heading"}
            </button>
          </div>
        </>
      ) : isLeadershipSectionEditable ? (
        <>
          <p className="visual-editor-note">
            Changes update the leadership section heading preview as you type. Save when it looks right.
          </p>
          <label className="visual-editor-field">
            <span>Eyebrow</span>
            <input value={leadershipSectionSettings.eyebrow || ""} onChange={(event) => onUpdateLeadershipSection("leadership", "eyebrow", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Heading</span>
            <input value={leadershipSectionSettings.title || ""} onChange={(event) => onUpdateLeadershipSection("leadership", "title", event.target.value)} />
          </label>
          <div className="visual-editor-panel-actions">
            <button className="visual-editor-button" type="button" disabled={isSaving} onClick={() => onSaveLeadershipSection("Leadership heading")}>
              {isSaving ? "Saving" : "Save Heading"}
            </button>
          </div>
        </>
      ) : isAlcSectionEditable ? (
        <>
          <p className="visual-editor-note">
            Changes update the ALC section preview as you type. Save when it looks right.
          </p>
          <label className="visual-editor-field">
            <span>Eyebrow</span>
            <input value={alcSectionSettings.eyebrow || ""} onChange={(event) => onUpdateLeadershipSection("alc", "eyebrow", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Heading</span>
            <input value={alcSectionSettings.title || ""} onChange={(event) => onUpdateLeadershipSection("alc", "title", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Description</span>
            <textarea value={alcSectionSettings.summary || ""} rows={3} onChange={(event) => onUpdateLeadershipSection("alc", "summary", event.target.value)} />
          </label>
          <div className="visual-editor-panel-actions">
            <button className="visual-editor-button" type="button" disabled={isSaving} onClick={() => onSaveLeadershipSection("ALC heading")}>
              {isSaving ? "Saving" : "Save ALC Heading"}
            </button>
          </div>
        </>
      ) : isRoomsSectionEditable ? (
        <>
          <p className="visual-editor-note">
            Changes update the room section heading preview as you type. Save when it looks right.
          </p>
          <label className="visual-editor-field">
            <span>Eyebrow</span>
            <input value={roomsSectionSettings.eyebrow || ""} onChange={(event) => onUpdateRoomsSection("eyebrow", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Heading</span>
            <input value={roomsSectionSettings.title || ""} onChange={(event) => onUpdateRoomsSection("title", event.target.value)} />
          </label>
          <div className="visual-editor-panel-actions">
            <button className="visual-editor-button" type="button" disabled={isSaving} onClick={onSaveRoomsSection}>
              {isSaving ? "Saving" : "Save Heading"}
            </button>
          </div>
        </>
      ) : isRoomsEditable ? (
        <>
          <p className="visual-editor-note">
            Changes update the room booking preview as you type. Save when it looks right.
          </p>
          <label className="visual-editor-field">
            <span>Description</span>
            <textarea value={rooms.summary || ""} rows={3} onChange={(event) => onUpdateRoomsField("summary", event.target.value)} />
          </label>
          <RoomActionsEditor
            actions={rooms.actions || []}
            onAddAction={onAddRoomAction}
            onMoveAction={onMoveRoomAction}
            onRemoveAction={onRemoveRoomAction}
            onUpdateAction={onUpdateRoomAction}
          />
          <RoomCalendarsEditor
            calendars={rooms.calendars || []}
            onAddCalendar={onAddRoomCalendar}
            onMoveCalendar={onMoveRoomCalendar}
            onRemoveCalendar={onRemoveRoomCalendar}
            onUpdateCalendar={onUpdateRoomCalendar}
          />
          {roomErrors.length ? (
            <div className="visual-editor-validation" role="status">
              {roomErrors.map((validationError) => (
                <p key={validationError}>{validationError}</p>
              ))}
            </div>
          ) : null}
          <div className="visual-editor-panel-actions">
            <button className="visual-editor-button" type="button" disabled={Boolean(roomErrors.length) || isSaving} onClick={onSaveRooms}>
              {isSaving ? "Saving" : "Save Rooms"}
            </button>
          </div>
        </>
      ) : isLeadershipSupportEditable ? (
        <>
          <p className="visual-editor-note">
            Changes update the Tech Help with Joe preview as you type. Save when it looks right.
          </p>
          <label className="visual-editor-field">
            <span>Eyebrow</span>
            <input value={leadershipSupport.eyebrow || ""} onChange={(event) => onUpdateLeadershipSupport("eyebrow", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Title</span>
            <input value={leadershipSupport.title || ""} onChange={(event) => onUpdateLeadershipSupport("title", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Description</span>
            <textarea value={leadershipSupport.summary || ""} rows={3} onChange={(event) => onUpdateLeadershipSupport("summary", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Photo</span>
            <input value={leadershipSupport.photo || ""} onChange={(event) => onUpdateLeadershipSupport("photo", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Upload Photo</span>
            <input
              accept="image/gif,image/jpeg,image/png,image/webp"
              type="file"
              onChange={(event) => onUploadLeadershipSupportPhoto(event.target.files?.[0])}
            />
          </label>
          <label className="visual-editor-field">
            <span>Photo Alt Text</span>
            <input value={leadershipSupport.photoAlt || ""} onChange={(event) => onUpdateLeadershipSupport("photoAlt", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Button Label</span>
            <input value={leadershipSupport.buttonLabel || ""} onChange={(event) => onUpdateLeadershipSupport("buttonLabel", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Button Link</span>
            <input value={leadershipSupport.buttonHref || ""} onChange={(event) => onUpdateLeadershipSupport("buttonHref", event.target.value)} />
          </label>
          <JoeAvailabilityEditor
            isSaving={isSaving}
            joeAvailability={joeAvailability}
            onSaveJoeAvailability={onSaveJoeAvailability}
            onUpdateJoeAvailability={onUpdateJoeAvailability}
            onUpdateJoeAvailabilityStatus={onUpdateJoeAvailabilityStatus}
            onUpdateJoeAvailabilityTracker={onUpdateJoeAvailabilityTracker}
          />
          <div className="visual-editor-panel-actions">
            <button className="visual-editor-button" type="button" disabled={isSaving} onClick={onSaveLeadershipSupport}>
              {isSaving ? "Saving" : "Save Tech Help Card"}
            </button>
            {isUploading ? <span className="visual-editor-status">Uploading</span> : null}
          </div>
        </>
      ) : isTechSectionEditable ? (
        <>
          <p className="visual-editor-note">
            Changes update this Tech Connect heading preview as you type. Save when it looks right.
          </p>
          <label className="visual-editor-field">
            <span>Eyebrow</span>
            <input value={techSectionSettings.eyebrow || ""} onChange={(event) => onUpdateTechSection(techSectionKey, "eyebrow", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Heading</span>
            <input value={techSectionSettings.title || ""} onChange={(event) => onUpdateTechSection(techSectionKey, "title", event.target.value)} />
          </label>
          {"summary" in techSectionSettings ? (
            <label className="visual-editor-field">
              <span>Description</span>
              <textarea value={techSectionSettings.summary || ""} rows={3} onChange={(event) => onUpdateTechSection(techSectionKey, "summary", event.target.value)} />
            </label>
          ) : null}
          <div className="visual-editor-panel-actions">
            <button className="visual-editor-button" type="button" disabled={isSaving} onClick={() => onSaveTechConnectSection("Tech Connect heading")}>
              {isSaving ? "Saving" : "Save Heading"}
            </button>
          </div>
        </>
      ) : isTechJoeSupportEditable ? (
        <>
          <p className="visual-editor-note">
            Changes update the Tech Connect support card preview as you type. Save when it looks right.
          </p>
          <label className="visual-editor-field">
            <span>Name</span>
            <input value={techJoeSupport.name || ""} onChange={(event) => onUpdateTechJoeSupport("name", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Role</span>
            <input value={techJoeSupport.role || ""} onChange={(event) => onUpdateTechJoeSupport("role", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Photo</span>
            <input value={techJoeSupport.photo || ""} onChange={(event) => onUpdateTechJoeSupport("photo", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Upload Photo</span>
            <input accept="image/gif,image/jpeg,image/png,image/webp" type="file" onChange={(event) => onUploadTechJoeSupportPhoto(event.target.files?.[0])} />
          </label>
          <label className="visual-editor-field">
            <span>Alt Text</span>
            <input value={techJoeSupport.photoAlt || ""} onChange={(event) => onUpdateTechJoeSupport("photoAlt", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Phone</span>
            <input value={techJoeSupport.phone || ""} onChange={(event) => onUpdateTechJoeSupport("phone", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Email</span>
            <input value={techJoeSupport.email || ""} onChange={(event) => onUpdateTechJoeSupport("email", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Button Label</span>
            <input value={techJoeSupport.buttonLabel || ""} onChange={(event) => onUpdateTechJoeSupport("buttonLabel", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Button Link</span>
            <input value={techJoeSupport.buttonHref || ""} onChange={(event) => onUpdateTechJoeSupport("buttonHref", event.target.value)} />
          </label>
          <SimpleLinksEditor
            links={techJoeSupport.secondaryLinks || []}
            onAddLink={onAddTechJoeSupportLink}
            onMoveLink={onMoveTechJoeSupportLink}
            onRemoveLink={onRemoveTechJoeSupportLink}
            onUpdateLink={onUpdateTechJoeSupportLink}
          />
          <JoeAvailabilityEditor
            isSaving={isSaving}
            joeAvailability={joeAvailability}
            onSaveJoeAvailability={onSaveJoeAvailability}
            onUpdateJoeAvailability={onUpdateJoeAvailability}
            onUpdateJoeAvailabilityStatus={onUpdateJoeAvailabilityStatus}
            onUpdateJoeAvailabilityTracker={onUpdateJoeAvailabilityTracker}
          />
          <div className="visual-editor-panel-actions">
            <button className="visual-editor-button" type="button" disabled={isSaving} onClick={onSaveTechJoeSupport}>
              {isSaving ? "Saving" : "Save Support Card"}
            </button>
            {isUploading ? <span className="visual-editor-status">Uploading</span> : null}
          </div>
        </>
      ) : isJoeAvailabilityEditable ? (
        <JoeAvailabilityEditor
          isSaving={isSaving}
          joeAvailability={joeAvailability}
          onSaveJoeAvailability={onSaveJoeAvailability}
          onUpdateJoeAvailability={onUpdateJoeAvailability}
          onUpdateJoeAvailabilityStatus={onUpdateJoeAvailabilityStatus}
          onUpdateJoeAvailabilityTracker={onUpdateJoeAvailabilityTracker}
        />
      ) : isTechQuickLinksEditable ? (
        <>
          <p className="visual-editor-note">
            These are the quick-link buttons near the top of the Tech Connect page.
          </p>
          <SimpleLinksEditor
            links={techQuickLinks}
            onAddLink={onAddTechQuickLink}
            onMoveLink={onMoveTechQuickLink}
            onRemoveLink={onRemoveTechQuickLink}
            onUpdateLink={onUpdateTechQuickLink}
          />
          <div className="visual-editor-panel-actions">
            <button className="visual-editor-button" type="button" disabled={isSaving} onClick={onSaveTechConnect}>
              {isSaving ? "Saving" : "Save Quick Links"}
            </button>
          </div>
        </>
      ) : isTechHelpPathEditable ? (
        <TechCardEditor
          card={selectedTechHelpPath}
          cardErrors={techHelpPathErrors}
          collectionKey="helpPaths"
          editableType="tech-help-card"
          itemIndex={selectedTechHelpPathIndex}
          items={techHelpPaths}
          isSaving={isSaving}
          onAddLink={onAddTechLink}
          onMoveCard={onMoveTechHelpPath}
          onMoveLink={onMoveTechLink}
          onRemoveCard={onRemoveTechHelpPath}
          onRemoveLink={onRemoveTechLink}
          onSave={onSaveTechConnect}
          onUpdateCard={onUpdateTechHelpPath}
          onUpdateLink={onUpdateTechLink}
        />
      ) : isTechPaperCutEditable ? (
        <TechCardEditor
          card={selectedTechPaperCut}
          cardErrors={techPaperCutErrors}
          collectionKey="paperCutCards"
          editableType="tech-papercut-card"
          includeSecondarySummary
          itemIndex={selectedTechPaperCutIndex}
          items={techPaperCutCards}
          isSaving={isSaving}
          onAddLink={onAddTechLink}
          onMoveCard={onMoveTechPaperCut}
          onMoveLink={onMoveTechLink}
          onRemoveCard={onRemoveTechPaperCut}
          onRemoveLink={onRemoveTechLink}
          onSave={onSaveTechConnect}
          onUpdateCard={onUpdateTechPaperCut}
          onUpdateLink={onUpdateTechLink}
        />
      ) : isTechAnswerEditable ? (
        <TechCardEditor
          card={selectedTechAnswer}
          cardErrors={techAnswerErrors}
          collectionKey="answerCards"
          editableType="tech-answer-card"
          itemIndex={selectedTechAnswerIndex}
          items={techAnswerCards}
          isSaving={isSaving}
          onAddLink={onAddTechLink}
          onMoveCard={onMoveTechAnswer}
          onMoveLink={onMoveTechLink}
          onRemoveCard={onRemoveTechAnswer}
          onRemoveLink={onRemoveTechLink}
          onSave={onSaveTechConnect}
          onUpdateCard={onUpdateTechAnswer}
          onUpdateLink={onUpdateTechLink}
        />
      ) : isBrandAssetSectionEditable ? (
        <>
          <p className="visual-editor-note">
            Changes update this brand-assets heading preview as you type. Save when it looks right.
          </p>
          <label className="visual-editor-field">
            <span>Eyebrow</span>
            <input value={brandAssetSectionSettings.eyebrow || ""} onChange={(event) => onUpdateBrandAssetSection(brandAssetSectionKey, "eyebrow", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Heading</span>
            <input value={brandAssetSectionSettings.title || ""} onChange={(event) => onUpdateBrandAssetSection(brandAssetSectionKey, "title", event.target.value)} />
          </label>
          {"summary" in brandAssetSectionSettings ? (
            <label className="visual-editor-field">
              <span>Description</span>
              <textarea value={brandAssetSectionSettings.summary || ""} rows={3} onChange={(event) => onUpdateBrandAssetSection(brandAssetSectionKey, "summary", event.target.value)} />
            </label>
          ) : null}
          <div className="visual-editor-panel-actions">
            <button className="visual-editor-button" type="button" disabled={isSaving} onClick={() => onSaveBrandAssetSection("Brand assets heading")}>
              {isSaving ? "Saving" : "Save Heading"}
            </button>
          </div>
        </>
      ) : isMarketingToolEditable ? (
        <>
          <p className="visual-editor-note">
            Changes update this marketing tool preview as you type. Save when it looks right.
          </p>
          <label className="visual-editor-field">
            <span>Tag</span>
            <input value={marketingTool.kicker || ""} onChange={(event) => onUpdateMarketingTool(marketingToolIndex, "kicker", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Title</span>
            <input value={marketingTool.title || ""} onChange={(event) => onUpdateMarketingTool(marketingToolIndex, "title", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Description</span>
            <textarea value={marketingTool.summary || ""} rows={3} onChange={(event) => onUpdateMarketingTool(marketingToolIndex, "summary", event.target.value)} />
          </label>
          <AssetLinksEditor
            collectionKey="marketingTools"
            editableType="marketing-tool-card"
            item={marketingTool}
            itemIndex={marketingToolIndex}
            items={marketingTools}
            links={marketingTool.links || []}
            onAddLink={onAddBrandAssetLink}
            onMoveLink={onMoveBrandAssetLink}
            onRemoveLink={onRemoveBrandAssetLink}
            onUpdateLink={onUpdateBrandAssetLink}
          />
          <div className="visual-editor-check-row">
            <label>
              <input type="checkbox" checked={marketingTool.active !== false} onChange={(event) => onUpdateMarketingTool(marketingToolIndex, "active", event.target.checked)} />
              Visible
            </label>
          </div>
          {marketingToolErrors.length ? (
            <div className="visual-editor-validation" role="status">
              {marketingToolErrors.map((validationError) => <p key={validationError}>{validationError}</p>)}
            </div>
          ) : null}
          <div className="visual-editor-panel-actions">
            <button className="visual-editor-button" type="button" disabled={Boolean(marketingToolErrors.length) || isSaving} onClick={onSaveBrandAssets}>
              {isSaving ? "Saving" : "Save Brand Assets"}
            </button>
          </div>
        </>
      ) : isDigitalLogoEditable ? (
        <>
          <p className="visual-editor-note">
            Changes update this logo card preview as you type. Save when it looks right.
          </p>
          <label className="visual-editor-field">
            <span>Tag</span>
            <input value={digitalLogo.kicker || ""} onChange={(event) => onUpdateDigitalLogo(digitalLogoIndex, "kicker", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Title</span>
            <input value={digitalLogo.title || ""} onChange={(event) => onUpdateDigitalLogo(digitalLogoIndex, "title", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Description</span>
            <textarea value={digitalLogo.summary || ""} rows={3} onChange={(event) => onUpdateDigitalLogo(digitalLogoIndex, "summary", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Preview Style</span>
            <select value={digitalLogo.previewClass || "asset-preview--light"} onChange={(event) => onUpdateDigitalLogo(digitalLogoIndex, "previewClass", event.target.value)}>
              <option value="asset-preview--light">Light</option>
              <option value="asset-preview--dark">Dark</option>
              <option value="asset-preview--red">Red</option>
            </select>
          </label>
          <label className="visual-editor-field">
            <span>Image</span>
            <input value={digitalLogo.image?.src || ""} onChange={(event) => onUpdateDigitalLogo(digitalLogoIndex, "image.src", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Upload Image</span>
            <input accept="image/gif,image/jpeg,image/png,image/webp" type="file" onChange={(event) => onUploadDigitalLogoImage(digitalLogoIndex, event.target.files?.[0])} />
          </label>
          <label className="visual-editor-field">
            <span>Alt Text</span>
            <input value={digitalLogo.image?.alt || ""} onChange={(event) => onUpdateDigitalLogo(digitalLogoIndex, "image.alt", event.target.value)} />
          </label>
          <AssetLinksEditor
            collectionKey="digitalLogos"
            editableType="digital-logo-card"
            item={digitalLogo}
            itemIndex={digitalLogoIndex}
            items={digitalLogos}
            links={digitalLogo.links || []}
            onAddLink={onAddBrandAssetLink}
            onMoveLink={onMoveBrandAssetLink}
            onRemoveLink={onRemoveBrandAssetLink}
            onUpdateLink={onUpdateBrandAssetLink}
          />
          <div className="visual-editor-check-row">
            <label>
              <input type="checkbox" checked={digitalLogo.active !== false} onChange={(event) => onUpdateDigitalLogo(digitalLogoIndex, "active", event.target.checked)} />
              Visible
            </label>
          </div>
          {digitalLogoErrors.length ? (
            <div className="visual-editor-validation" role="status">
              {digitalLogoErrors.map((validationError) => <p key={validationError}>{validationError}</p>)}
            </div>
          ) : null}
          <div className="visual-editor-panel-actions">
            <button className="visual-editor-button" type="button" disabled={Boolean(digitalLogoErrors.length) || isSaving} onClick={onSaveBrandAssets}>
              {isSaving ? "Saving" : "Save Brand Assets"}
            </button>
            {isUploading ? <span className="visual-editor-status">Uploading</span> : null}
          </div>
        </>
      ) : isSourceFileEditable ? (
        <>
          <p className="visual-editor-note">
            Changes update this source file card preview as you type. Save when it looks right.
          </p>
          <label className="visual-editor-field">
            <span>Tag</span>
            <input value={sourceFile.kicker || ""} onChange={(event) => onUpdateSourceFile(sourceFileIndex, "kicker", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Title</span>
            <input value={sourceFile.title || ""} onChange={(event) => onUpdateSourceFile(sourceFileIndex, "title", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Description</span>
            <textarea value={sourceFile.summary || ""} rows={3} onChange={(event) => onUpdateSourceFile(sourceFileIndex, "summary", event.target.value)} />
          </label>
          <AssetLinksEditor
            collectionKey="sourceFiles"
            editableType="source-file-card"
            item={sourceFile}
            itemIndex={sourceFileIndex}
            items={sourceFiles}
            links={sourceFile.links || []}
            onAddLink={onAddBrandAssetLink}
            onMoveLink={onMoveBrandAssetLink}
            onRemoveLink={onRemoveBrandAssetLink}
            onUpdateLink={onUpdateBrandAssetLink}
          />
          <div className="visual-editor-check-row">
            <label>
              <input type="checkbox" checked={sourceFile.active !== false} onChange={(event) => onUpdateSourceFile(sourceFileIndex, "active", event.target.checked)} />
              Visible
            </label>
          </div>
          {sourceFileErrors.length ? (
            <div className="visual-editor-validation" role="status">
              {sourceFileErrors.map((validationError) => <p key={validationError}>{validationError}</p>)}
            </div>
          ) : null}
          <div className="visual-editor-panel-actions">
            <button className="visual-editor-button" type="button" disabled={Boolean(sourceFileErrors.length) || isSaving} onClick={onSaveBrandAssets}>
              {isSaving ? "Saving" : "Save Brand Assets"}
            </button>
          </div>
        </>
      ) : isVendorSectionEditable ? (
        <>
          <p className="visual-editor-note">
            Changes update this vendor section heading preview as you type. Save when it looks right.
          </p>
          <label className="visual-editor-field">
            <span>Eyebrow</span>
            <input value={vendorSectionSettings.eyebrow || ""} onChange={(event) => onUpdateVendorSection(vendorSectionKey, "eyebrow", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Heading</span>
            <input value={vendorSectionSettings.title || ""} onChange={(event) => onUpdateVendorSection(vendorSectionKey, "title", event.target.value)} />
          </label>
          {"summary" in vendorSectionSettings ? (
            <label className="visual-editor-field">
              <span>Description</span>
              <textarea value={vendorSectionSettings.summary || ""} rows={3} onChange={(event) => onUpdateVendorSection(vendorSectionKey, "summary", event.target.value)} />
            </label>
          ) : null}
          <div className="visual-editor-panel-actions">
            <button className="visual-editor-button" type="button" disabled={isSaving} onClick={() => onSaveVendorSection("Vendor heading")}>
              {isSaving ? "Saving" : "Save Heading"}
            </button>
          </div>
        </>
      ) : isVendorCardEditable ? (
        <>
          <p className="visual-editor-note">
            Changes update this vendor card preview as you type. Save when it looks right.
          </p>
          <label className="visual-editor-field">
            <span>Group</span>
            <select value={vendor.section || "services"} onChange={(event) => onUpdateVendor(vendorIndex, "section", event.target.value)}>
              <option value="core">Core Partners</option>
              <option value="services">Service Vendors</option>
            </select>
          </label>
          <label className="visual-editor-field">
            <span>Business</span>
            <input value={vendor.business || ""} onChange={(event) => onUpdateVendor(vendorIndex, "business", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Logo</span>
            <input value={vendor.logo || ""} onChange={(event) => onUpdateVendor(vendorIndex, "logo", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Upload Logo</span>
            <input
              accept="image/gif,image/jpeg,image/png,image/webp"
              type="file"
              onChange={(event) => onUploadVendorLogo(vendorIndex, event.target.files?.[0])}
            />
          </label>
          <label className="visual-editor-field">
            <span>Name</span>
            <input value={vendor.name || ""} onChange={(event) => onUpdateVendor(vendorIndex, "name", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Phone</span>
            <input value={vendor.phone || ""} onChange={(event) => onUpdateVendor(vendorIndex, "phone", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Email</span>
            <input value={vendor.email || ""} onChange={(event) => onUpdateVendor(vendorIndex, "email", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Notes</span>
            <textarea value={vendor.notes || ""} rows={3} onChange={(event) => onUpdateVendor(vendorIndex, "notes", event.target.value)} />
          </label>
          <div className="visual-editor-check-row">
            <label>
              <input
                type="checkbox"
                checked={vendor.active !== false}
                onChange={(event) => onUpdateVendor(vendorIndex, "active", event.target.checked)}
              />
              Visible
            </label>
          </div>
          {vendorErrors.length ? (
            <div className="visual-editor-validation" role="status">
              {vendorErrors.map((validationError) => (
                <p key={validationError}>{validationError}</p>
              ))}
            </div>
          ) : null}
          <div className="visual-editor-panel-actions">
            <button className="visual-editor-button" type="button" disabled={Boolean(vendorErrors.length) || isSaving} onClick={onSaveVendors}>
              {isSaving ? "Saving" : "Save Vendors"}
            </button>
            {isUploading ? <span className="visual-editor-status">Uploading</span> : null}
            <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled={vendorIndex === 0} onClick={() => onMoveVendor(vendorIndex, -1)}>
              Up
            </button>
            <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={() => onMoveVendor(vendorIndex, 1)}>
              Down
            </button>
            <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={() => onRemoveVendor(vendorIndex)}>
              Delete
            </button>
          </div>
        </>
      ) : isLeadershipCardEditable ? (
        <>
          <p className="visual-editor-note">
            Changes update this leadership card preview as you type. Save when it looks right.
          </p>
          <label className="visual-editor-field">
            <span>Group</span>
            <select value={leader.group || "office"} onChange={(event) => onUpdateLeader(leaderIndex, "group", event.target.value)}>
              <option value="office">Office Leadership</option>
              <option value="alc">ALC Poster</option>
            </select>
          </label>
          <label className="visual-editor-field">
            <span>Role</span>
            <input value={leader.role || ""} onChange={(event) => onUpdateLeader(leaderIndex, "role", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Name</span>
            <input value={leader.name || ""} onChange={(event) => onUpdateLeader(leaderIndex, "name", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Photo</span>
            <input value={leader.photo || ""} onChange={(event) => onUpdateLeader(leaderIndex, "photo", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Upload Photo</span>
            <input
              accept="image/gif,image/jpeg,image/png,image/webp"
              type="file"
              onChange={(event) => onUploadLeaderPhoto(leaderIndex, event.target.files?.[0])}
            />
          </label>
          <label className="visual-editor-field">
            <span>Email</span>
            <input value={leader.email || ""} onChange={(event) => onUpdateLeader(leaderIndex, "email", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Phone</span>
            <input value={leader.phone || ""} onChange={(event) => onUpdateLeader(leaderIndex, "phone", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Notes</span>
            <textarea value={leader.notes || ""} rows={3} onChange={(event) => onUpdateLeader(leaderIndex, "notes", event.target.value)} />
          </label>
          <div className="visual-editor-check-row">
            <label>
              <input
                type="checkbox"
                checked={leader.active !== false}
                onChange={(event) => onUpdateLeader(leaderIndex, "active", event.target.checked)}
              />
              Visible
            </label>
            <label>
              <input
                type="checkbox"
                checked={Boolean(leader.featured)}
                onChange={(event) => onUpdateLeader(leaderIndex, "featured", event.target.checked)}
              />
              Featured
            </label>
          </div>
          {leaderErrors.length ? (
            <div className="visual-editor-validation" role="status">
              {leaderErrors.map((validationError) => (
                <p key={validationError}>{validationError}</p>
              ))}
            </div>
          ) : null}
          <div className="visual-editor-panel-actions">
            <button className="visual-editor-button" type="button" disabled={Boolean(leaderErrors.length) || isSaving} onClick={onSaveLeadership}>
              {isSaving ? "Saving" : "Save Leadership"}
            </button>
            {isUploading ? <span className="visual-editor-status">Uploading</span> : null}
            <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={() => onRemoveLeader(leaderIndex)}>
              Delete
            </button>
          </div>
        </>
      ) : isOfficeCardEditable ? (
        <>
          <p className="visual-editor-note">
            Changes update this office card preview as you type. Save when it looks right.
          </p>
          <label className="visual-editor-field">
            <span>Tag</span>
            <input value={officeCard.tag || ""} onChange={(event) => onUpdateOfficeCard(officeCardKey, "tag", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Title</span>
            <input value={officeCard.title || ""} onChange={(event) => onUpdateOfficeCard(officeCardKey, "title", event.target.value)} />
          </label>
          {"summary" in officeCard ? (
            <label className="visual-editor-field">
              <span>Description</span>
              <textarea value={officeCard.summary || ""} rows={3} onChange={(event) => onUpdateOfficeCard(officeCardKey, "summary", event.target.value)} />
            </label>
          ) : null}
          {"tagHref" in officeCard ? (
            <label className="visual-editor-field">
              <span>Tag Link</span>
              <input value={officeCard.tagHref || ""} onChange={(event) => onUpdateOfficeCard(officeCardKey, "tagHref", event.target.value)} />
            </label>
          ) : null}
          {"hoursLabel" in officeCard ? (
            <label className="visual-editor-field">
              <span>Hours Label</span>
              <input value={officeCard.hoursLabel || ""} onChange={(event) => onUpdateOfficeCard(officeCardKey, "hoursLabel", event.target.value)} />
            </label>
          ) : null}
          {"holidaysLabel" in officeCard ? (
            <label className="visual-editor-field">
              <span>Holidays Label</span>
              <input value={officeCard.holidaysLabel || ""} onChange={(event) => onUpdateOfficeCard(officeCardKey, "holidaysLabel", event.target.value)} />
            </label>
          ) : null}
          {Array.isArray(officeCard.hours) ? (
            <OfficeHoursEditor
              hours={officeCard.hours}
              onAddHour={onAddOfficeHour}
              onMoveHour={onMoveOfficeHour}
              onRemoveHour={onRemoveOfficeHour}
              onUpdateHour={onUpdateOfficeHour}
            />
          ) : null}
          {Array.isArray(officeCard.holidays) ? (
            <OfficeHolidaysEditor
              holidays={officeCard.holidays}
              onAddHoliday={onAddOfficeHoliday}
              onMoveHoliday={onMoveOfficeHoliday}
              onRemoveHoliday={onRemoveOfficeHoliday}
              onUpdateHoliday={onUpdateOfficeHoliday}
            />
          ) : null}
          {Array.isArray(officeCard.chips) ? (
            <OfficeChipsEditor
              cardKey={officeCardKey}
              chips={officeCard.chips}
              onAddChip={onAddOfficeChip}
              onMoveChip={onMoveOfficeChip}
              onRemoveChip={onRemoveOfficeChip}
              onUpdateChip={onUpdateOfficeChip}
            />
          ) : null}
          {officeCard.action ? (
            <>
              <label className="visual-editor-field">
                <span>Button Label</span>
                <input value={officeCard.action.label || ""} onChange={(event) => onUpdateOfficeCard(officeCardKey, "action.label", event.target.value)} />
              </label>
              <label className="visual-editor-field">
                <span>Button Link</span>
                <input value={officeCard.action.href || ""} onChange={(event) => onUpdateOfficeCard(officeCardKey, "action.href", event.target.value)} />
              </label>
              <div className="visual-editor-check-row">
                <label>
                  <input
                    type="checkbox"
                    checked={officeCard.action.external !== false}
                    onChange={(event) => onUpdateOfficeCard(officeCardKey, "action.external", event.target.checked)}
                  />
                  Opens externally
                </label>
              </div>
            </>
          ) : null}
          {officeCardErrors.length ? (
            <div className="visual-editor-validation" role="status">
              {officeCardErrors.map((validationError) => (
                <p key={validationError}>{validationError}</p>
              ))}
            </div>
          ) : null}
          <div className="visual-editor-panel-actions">
            <button className="visual-editor-button" type="button" disabled={Boolean(officeCardErrors.length) || isSaving} onClick={onSaveOfficeCard}>
              {isSaving ? "Saving" : "Save Office Card"}
            </button>
          </div>
        </>
      ) : isCardEditable ? (
        <>
          <p className="visual-editor-note">
            Changes update this card preview as you type. Save when it looks right.
          </p>
          <label className="visual-editor-field">
            <span>Tag</span>
            <input value={card.tag || ""} onChange={(event) => onUpdateCard(cardIndex, "tag", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Title</span>
            <input value={card.title || ""} onChange={(event) => onUpdateCard(cardIndex, "title", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Description</span>
            <textarea value={card.summary || ""} rows={3} onChange={(event) => onUpdateCard(cardIndex, "summary", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Link</span>
            <input value={card.href || ""} onChange={(event) => onUpdateCard(cardIndex, "href", event.target.value)} />
          </label>
          <div className="visual-editor-check-row">
            <label>
              <input
                type="checkbox"
                checked={card.active !== false}
                onChange={(event) => onUpdateCard(cardIndex, "active", event.target.checked)}
              />
              Visible
            </label>
            <label>
              <input
                type="checkbox"
                checked={card.external !== false}
                onChange={(event) => onUpdateCard(cardIndex, "external", event.target.checked)}
              />
              Opens externally
            </label>
          </div>
          {cardErrors.length ? (
            <div className="visual-editor-validation" role="status">
              {cardErrors.map((validationError) => (
                <p key={validationError}>{validationError}</p>
              ))}
            </div>
          ) : null}
          <div className="visual-editor-panel-actions">
            <button className="visual-editor-button" type="button" disabled={Boolean(cardErrors.length) || isSaving} onClick={onSaveCards}>
              {isSaving ? "Saving" : "Save Card"}
            </button>
            <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={() => onRemoveCard(cardIndex)}>
              Delete
            </button>
          </div>
        </>
      ) : (
        <p className="visual-editor-note">
          This item is selectable now. The focused editor for this kind of block is coming next.
        </p>
      )}
    </div>
  );
}

function JoeAvailabilityEditor({
  isSaving,
  joeAvailability,
  onSaveJoeAvailability,
  onUpdateJoeAvailability,
  onUpdateJoeAvailabilityStatus,
  onUpdateJoeAvailabilityTracker
}) {
  return (
    <div className="visual-editor-repeat-list">
      <div className="visual-editor-repeat-header">
        <span>Shared Availability</span>
      </div>
      <p className="visual-editor-note">
        This controls every Joe availability card on the portal.
      </p>
      <div className="visual-editor-check-row">
        <label>
          <input
            type="checkbox"
            checked={joeAvailability.trackerEnabled !== false}
            onChange={(event) => onUpdateJoeAvailabilityTracker(event.target.checked)}
          />
          Show availability tracker
        </label>
      </div>
      {joeAvailability.trackerEnabled !== false ? (
        <div className="visual-editor-check-row">
          <label>
            <input
              type="checkbox"
              checked={joeAvailability.status === "available"}
              onChange={(event) => onUpdateJoeAvailabilityStatus(event.target.checked)}
            />
            Joe is available
          </label>
        </div>
      ) : null}
      <label className="visual-editor-field">
        <span>Available Label</span>
        <input value={joeAvailability.availableNowLabel || ""} onChange={(event) => onUpdateJoeAvailability("availableNowLabel", event.target.value)} />
      </label>
      <label className="visual-editor-field">
        <span>Available Summary</span>
        <input value={joeAvailability.availableNowSummary || ""} onChange={(event) => onUpdateJoeAvailability("availableNowSummary", event.target.value)} />
      </label>
      <label className="visual-editor-field">
        <span>Unavailable Label</span>
        <input value={joeAvailability.unavailableLabel || ""} onChange={(event) => onUpdateJoeAvailability("unavailableLabel", event.target.value)} />
      </label>
      <label className="visual-editor-field">
        <span>Unavailable Summary</span>
        <input value={joeAvailability.noSlotsSummary || ""} onChange={(event) => onUpdateJoeAvailability("noSlotsSummary", event.target.value)} />
      </label>
      <div className="visual-editor-panel-actions">
        <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled={isSaving} onClick={onSaveJoeAvailability}>
          {isSaving ? "Saving" : "Save Availability"}
        </button>
      </div>
    </div>
  );
}

function OverviewFloatingEditor({
  errors,
  isSaving,
  overview,
  selection,
  onAddLink,
  onMoveLink,
  onRemoveLink,
  onSave,
  onUpdateField,
  onUpdateGroup,
  onUpdateLink
}) {
  if (selection.type === "market") {
    const group = overview[selection.groupKey] || {};
    const label = selection.groupKey === "rates" ? "Interest Rates" : "Market Trends";

    return (
      <>
        <p className="visual-editor-note">
          Changes update this overview market heading as you type. Save when it looks right.
        </p>
        <label className="visual-editor-field">
          <span>Eyebrow</span>
          <input value={group.eyebrow || ""} onChange={(event) => onUpdateGroup(selection.groupKey, "eyebrow", event.target.value)} />
        </label>
        <label className="visual-editor-field">
          <span>Title</span>
          <input value={group.title || ""} onChange={(event) => onUpdateGroup(selection.groupKey, "title", event.target.value)} />
        </label>
        <OverviewValidation errors={errors} />
        <div className="visual-editor-panel-actions">
          <button className="visual-editor-button" type="button" disabled={Boolean(errors.length) || isSaving} onClick={onSave}>
            {isSaving ? "Saving" : `Save ${label}`}
          </button>
        </div>
      </>
    );
  }

  if (selection.type === "card") {
    const groupKey = selection.groupKey === "agenda" ? "agenda" : "dailyAccess";
    const group = overview[groupKey] || {};
    const label = groupKey === "agenda" ? "Office Agenda" : "Daily Access";

    return (
      <>
        <p className="visual-editor-note">
          Changes update this overview card preview as you type. Save when it looks right.
        </p>
        <label className="visual-editor-field">
          <span>Tag</span>
          <input value={group.tag || ""} onChange={(event) => onUpdateGroup(groupKey, "tag", event.target.value)} />
        </label>
        <label className="visual-editor-field">
          <span>Title</span>
          <input value={group.title || ""} onChange={(event) => onUpdateGroup(groupKey, "title", event.target.value)} />
        </label>
        <OverviewLinksEditor
          groupKey={groupKey}
          links={group.links || []}
          onAddLink={onAddLink}
          onMoveLink={onMoveLink}
          onRemoveLink={onRemoveLink}
          onUpdateLink={onUpdateLink}
        />
        <OverviewValidation errors={errors} />
        <div className="visual-editor-panel-actions">
          <button className="visual-editor-button" type="button" disabled={Boolean(errors.length) || isSaving} onClick={onSave}>
            {isSaving ? "Saving" : `Save ${label}`}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <p className="visual-editor-note">
        Changes update the home overview headline as you type. Save when it looks right.
      </p>
      <label className="visual-editor-field">
        <span>Eyebrow</span>
        <input value={overview.eyebrow || ""} onChange={(event) => onUpdateField("eyebrow", event.target.value)} />
      </label>
      <label className="visual-editor-field">
        <span>Title</span>
        <input value={overview.title || ""} onChange={(event) => onUpdateField("title", event.target.value)} />
      </label>
      <label className="visual-editor-field">
        <span>Description</span>
        <textarea value={overview.summary || ""} rows={4} onChange={(event) => onUpdateField("summary", event.target.value)} />
      </label>
      <OverviewValidation errors={errors} />
      <div className="visual-editor-panel-actions">
        <button className="visual-editor-button" type="button" disabled={Boolean(errors.length) || isSaving} onClick={onSave}>
          {isSaving ? "Saving" : "Save Overview"}
        </button>
      </div>
    </>
  );
}

function OverviewLinksEditor({ groupKey, links, onAddLink, onMoveLink, onRemoveLink, onUpdateLink }) {
  return (
    <div className="visual-editor-repeat-list">
      <div className="visual-editor-repeat-header">
        <span>Buttons</span>
        <button type="button" onClick={() => onAddLink(groupKey)}>Add Button</button>
      </div>
      {links.map((link, index) => (
        <div className="visual-editor-repeat-item" key={`${link.label}-${index}`}>
          <div className="visual-editor-course-controls">
            <button type="button" disabled={index === 0} onClick={() => onMoveLink(groupKey, index, -1)}>Up</button>
            <button type="button" disabled={index === links.length - 1} onClick={() => onMoveLink(groupKey, index, 1)}>Down</button>
            <button type="button" onClick={() => onRemoveLink(groupKey, index)}>Remove</button>
          </div>
          <label className="visual-editor-field">
            <span>Label</span>
            <input value={link.label || ""} onChange={(event) => onUpdateLink(groupKey, index, "label", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Link</span>
            <input value={link.href || ""} onChange={(event) => onUpdateLink(groupKey, index, "href", event.target.value)} />
          </label>
          <div className="visual-editor-check-row">
            <label>
              <input type="checkbox" checked={link.active !== false} onChange={(event) => onUpdateLink(groupKey, index, "active", event.target.checked)} />
              Visible
            </label>
            <label>
              <input type="checkbox" checked={Boolean(link.external)} onChange={(event) => onUpdateLink(groupKey, index, "external", event.target.checked)} />
              Opens externally
            </label>
            <label>
              <input type="checkbox" checked={Boolean(link.download)} onChange={(event) => onUpdateLink(groupKey, index, "download", event.target.checked)} />
              Download
            </label>
            {groupKey === "agenda" ? (
              <label>
                <input type="checkbox" checked={Boolean(link.calendarModal)} onChange={(event) => onUpdateLink(groupKey, index, "calendarModal", event.target.checked)} />
                Calendar modal
              </label>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function OverviewValidation({ errors }) {
  return errors.length ? (
    <div className="visual-editor-validation" role="status">
      {errors.map((validationError) => <p key={validationError}>{validationError}</p>)}
    </div>
  ) : null;
}

function CustomSectionFloatingEditor({
  errors,
  isSaving,
  section,
  sectionIndex,
  sections,
  onAddCard,
  onMoveSection,
  onRemoveSection,
  onSave,
  onUpdateSection
}) {
  return (
    <>
      <p className="visual-editor-note">
        Changes update this custom section preview as you type. Save when it looks right.
      </p>
      <label className="visual-editor-field">
        <span>Eyebrow</span>
        <input value={section.eyebrow || ""} onChange={(event) => onUpdateSection(sectionIndex, "eyebrow", event.target.value)} />
      </label>
      <label className="visual-editor-field">
        <span>Title</span>
        <input value={section.title || ""} onChange={(event) => onUpdateSection(sectionIndex, "title", event.target.value)} />
      </label>
      <label className="visual-editor-field">
        <span>Description</span>
        <textarea value={section.summary || ""} rows={3} onChange={(event) => onUpdateSection(sectionIndex, "summary", event.target.value)} />
      </label>
      <div className="visual-editor-check-row">
        <label>
          <input type="checkbox" checked={section.active !== false} onChange={(event) => onUpdateSection(sectionIndex, "active", event.target.checked)} />
          Visible
        </label>
      </div>
      {errors.length ? (
        <div className="visual-editor-validation" role="status">
          {errors.map((validationError) => <p key={validationError}>{validationError}</p>)}
        </div>
      ) : null}
      <div className="visual-editor-panel-actions">
        <button className="visual-editor-button" type="button" disabled={Boolean(errors.length) || isSaving} onClick={onSave}>
          {isSaving ? "Saving" : "Save Section"}
        </button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled={sectionIndex === 0} onClick={() => onMoveSection(sectionIndex, -1)}>
          Up
        </button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled={sectionIndex === sections.length - 1} onClick={() => onMoveSection(sectionIndex, 1)}>
          Down
        </button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={() => onAddCard(sectionIndex)}>
          Add Card
        </button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={() => onRemoveSection(sectionIndex)}>
          Delete
        </button>
      </div>
    </>
  );
}

function CustomSectionCardFloatingEditor({
  card,
  cardIndex,
  errors,
  isSaving,
  section,
  sectionIndex,
  onAddLink,
  onMoveCard,
  onMoveLink,
  onRemoveCard,
  onRemoveLink,
  onSave,
  onUpdateCard,
  onUpdateLink
}) {
  return (
    <>
      <p className="visual-editor-note">
        Changes update only this custom section card preview as you type. Save when it looks right.
      </p>
      <label className="visual-editor-field">
        <span>Tag</span>
        <input value={card.kicker || ""} onChange={(event) => onUpdateCard(sectionIndex, cardIndex, "kicker", event.target.value)} />
      </label>
      <label className="visual-editor-field">
        <span>Title</span>
        <input value={card.title || ""} onChange={(event) => onUpdateCard(sectionIndex, cardIndex, "title", event.target.value)} />
      </label>
      <label className="visual-editor-field">
        <span>Description</span>
        <textarea value={card.summary || ""} rows={3} onChange={(event) => onUpdateCard(sectionIndex, cardIndex, "summary", event.target.value)} />
      </label>
      <CustomSectionLinksEditor
        cardIndex={cardIndex}
        links={card.links || []}
        onAddLink={onAddLink}
        onMoveLink={onMoveLink}
        onRemoveLink={onRemoveLink}
        onUpdateLink={onUpdateLink}
        sectionIndex={sectionIndex}
      />
      <div className="visual-editor-check-row">
        <label>
          <input type="checkbox" checked={card.active !== false} onChange={(event) => onUpdateCard(sectionIndex, cardIndex, "active", event.target.checked)} />
          Visible
        </label>
      </div>
      {errors.length ? (
        <div className="visual-editor-validation" role="status">
          {errors.map((validationError) => <p key={validationError}>{validationError}</p>)}
        </div>
      ) : null}
      <div className="visual-editor-panel-actions">
        <button className="visual-editor-button" type="button" disabled={Boolean(errors.length) || isSaving} onClick={onSave}>
          {isSaving ? "Saving" : "Save Card"}
        </button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled={cardIndex === 0} onClick={() => onMoveCard(sectionIndex, cardIndex, -1)}>
          Up
        </button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled={cardIndex === (section.cards || []).length - 1} onClick={() => onMoveCard(sectionIndex, cardIndex, 1)}>
          Down
        </button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={() => onRemoveCard(sectionIndex, cardIndex)}>
          Delete
        </button>
      </div>
    </>
  );
}

function TechCardEditor({
  card,
  cardErrors,
  collectionKey,
  editableType,
  includeSecondarySummary = false,
  isSaving,
  itemIndex,
  items,
  onAddLink,
  onMoveCard,
  onMoveLink,
  onRemoveCard,
  onRemoveLink,
  onSave,
  onUpdateCard,
  onUpdateLink
}) {
  return (
    <>
      <p className="visual-editor-note">
        Changes update this Tech Connect card preview as you type. Save when it looks right.
      </p>
      <label className="visual-editor-field">
        <span>Tag</span>
        <input value={card.kicker || ""} onChange={(event) => onUpdateCard(itemIndex, "kicker", event.target.value)} />
      </label>
      <label className="visual-editor-field">
        <span>Title</span>
        <input value={card.title || ""} onChange={(event) => onUpdateCard(itemIndex, "title", event.target.value)} />
      </label>
      <label className="visual-editor-field">
        <span>Description</span>
        <textarea value={card.summary || ""} rows={3} onChange={(event) => onUpdateCard(itemIndex, "summary", event.target.value)} />
      </label>
      {includeSecondarySummary ? (
        <label className="visual-editor-field">
          <span>Second Description</span>
          <textarea value={card.secondarySummary || ""} rows={3} onChange={(event) => onUpdateCard(itemIndex, "secondarySummary", event.target.value)} />
        </label>
      ) : null}
      <AssetLinksEditor
        collectionKey={collectionKey}
        editableType={editableType}
        item={card}
        itemIndex={itemIndex}
        items={items}
        links={card.links || []}
        onAddLink={onAddLink}
        onMoveLink={onMoveLink}
        onRemoveLink={onRemoveLink}
        onUpdateLink={onUpdateLink}
      />
      <div className="visual-editor-check-row">
        <label>
          <input type="checkbox" checked={card.active !== false} onChange={(event) => onUpdateCard(itemIndex, "active", event.target.checked)} />
          Visible
        </label>
      </div>
      {cardErrors.length ? (
        <div className="visual-editor-validation" role="status">
          {cardErrors.map((validationError) => <p key={validationError}>{validationError}</p>)}
        </div>
      ) : null}
      <div className="visual-editor-panel-actions">
        <button className="visual-editor-button" type="button" disabled={Boolean(cardErrors.length) || isSaving} onClick={onSave}>
          {isSaving ? "Saving" : "Save Tech Connect"}
        </button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled={itemIndex === 0} onClick={() => onMoveCard(itemIndex, -1)}>
          Up
        </button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled={itemIndex === items.length - 1} onClick={() => onMoveCard(itemIndex, 1)}>
          Down
        </button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={() => onRemoveCard(itemIndex)}>
          Delete
        </button>
      </div>
    </>
  );
}

function NavigationLinkEditor({
  errors,
  index,
  isSaving,
  link,
  listKey,
  navigation,
  onAddLink,
  onMoveLink,
  onRemoveLink,
  onSave,
  onUpdateLink
}) {
  return (
    <>
      <p className="visual-editor-note">
        Changes update this navigation link preview as you type. Save when it looks right.
      </p>
      <label className="visual-editor-field">
        <span>Label</span>
        <input value={link.label || ""} onChange={(event) => onUpdateLink(listKey, index, "label", event.target.value)} />
      </label>
      <label className="visual-editor-field">
        <span>Link</span>
        <input value={link.href || ""} onChange={(event) => onUpdateLink(listKey, index, "href", event.target.value)} />
      </label>
      <label className="visual-editor-field">
        <span>Button Style</span>
        <select value={link.button || ""} onChange={(event) => onUpdateLink(listKey, index, "button", event.target.value)}>
          <option value="">Menu link</option>
          <option value="secondary">Secondary button</option>
          <option value="primary">Primary button</option>
        </select>
      </label>
      <div className="visual-editor-check-row">
        <label>
          <input type="checkbox" checked={Boolean(link.page)} onChange={(event) => onUpdateLink(listKey, index, "page", event.target.checked)} />
          Page link
        </label>
        <label>
          <input type="checkbox" checked={Boolean(link.primary)} onChange={(event) => onUpdateLink(listKey, index, "primary", event.target.checked)} />
          Highlight
        </label>
        <label>
          <input type="checkbox" checked={Boolean(link.external)} onChange={(event) => onUpdateLink(listKey, index, "external", event.target.checked)} />
          Opens externally
        </label>
        <label>
          <input type="checkbox" checked={Boolean(link.download)} onChange={(event) => onUpdateLink(listKey, index, "download", event.target.checked)} />
          Download
        </label>
      </div>
      {errors.length ? (
        <div className="visual-editor-validation" role="status">
          {errors.map((validationError) => <p key={validationError}>{validationError}</p>)}
        </div>
      ) : null}
      <div className="visual-editor-panel-actions">
        <button className="visual-editor-button" type="button" disabled={Boolean(errors.length) || isSaving} onClick={onSave}>
          {isSaving ? "Saving" : "Save Navigation"}
        </button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled={index === 0} onClick={() => onMoveLink(listKey, index, -1)}>
          Up
        </button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled={index === (navigation[listKey] || []).length - 1} onClick={() => onMoveLink(listKey, index, 1)}>
          Down
        </button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={() => onAddLink(listKey)}>
          Add
        </button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={() => onRemoveLink(listKey, index)}>
          Delete
        </button>
      </div>
    </>
  );
}

function NavigationLabelEditor({ field, isSaving, navigation, onSave, onUpdateLabel }) {
  const labelNames = {
    sidebarUtilityTitle: "Sidebar quick-link title",
    mobileMenuLabel: "Mobile menu title",
    mobileQuickLinksLabel: "Mobile quick-link title",
    dailyAccessKicker: "Daily access kicker",
    dailyAccessTitle: "Daily access title"
  };

  return (
    <>
      <p className="visual-editor-note">
        Changes update this navigation label as you type. Save when it looks right.
      </p>
      <label className="visual-editor-field">
        <span>{labelNames[field] || "Navigation label"}</span>
        <input value={navigation[field] || ""} onChange={(event) => onUpdateLabel(field, event.target.value)} />
      </label>
      <div className="visual-editor-panel-actions">
        <button className="visual-editor-button" type="button" disabled={isSaving || !String(navigation[field] || "").trim()} onClick={onSave}>
          {isSaving ? "Saving" : "Save Navigation"}
        </button>
      </div>
    </>
  );
}

function SiteChromeFloatingEditor({
  errors,
  isSaving,
  selection,
  siteChrome,
  onSave,
  onUpdateBrand,
  onUpdateFooter
}) {
  return (
    <>
      <p className="visual-editor-note">
        Changes update the visible portal chrome as you type. Save when it looks right.
      </p>
      {selection.type === "brand" ? (
        <SiteBrandFields siteChrome={siteChrome} onUpdateBrand={onUpdateBrand} />
      ) : (
        <SiteFooterFields footer={siteChrome.footer || {}} focusField={selection.field} onUpdateFooter={onUpdateFooter} />
      )}
      <SiteChromeValidation errors={errors} />
      <div className="visual-editor-panel-actions">
        <button className="visual-editor-button" type="button" disabled={Boolean(errors.length) || isSaving} onClick={onSave}>
          {isSaving ? "Saving" : "Save Site Chrome"}
        </button>
      </div>
    </>
  );
}

function SiteChromeVisualPanel({
  errors,
  isSaving,
  siteChrome,
  onSaveSiteChrome,
  onUpdateBrand,
  onUpdateFooter
}) {
  return (
    <div className="visual-editor-module">
      <div className="visual-editor-module-header">
        <div>
          <span className={errors.length ? "visual-editor-status visual-editor-status--error" : "visual-editor-status visual-editor-status--ok"}>
            {errors.length ? `${errors.length} issue${errors.length === 1 ? "" : "s"}` : "Valid draft"}
          </span>
          <strong>Brand and footer</strong>
        </div>
      </div>
      <p className="visual-editor-note">
        These controls edit the current page brand lockup and the shared footer.
      </p>
      <SiteBrandFields siteChrome={siteChrome} onUpdateBrand={onUpdateBrand} />
      <SiteFooterFields footer={siteChrome.footer || {}} onUpdateFooter={onUpdateFooter} />
      <SiteChromeValidation errors={errors} />
      <div className="visual-editor-panel-actions">
        <button className="visual-editor-button" type="button" disabled={Boolean(errors.length) || isSaving} onClick={onSaveSiteChrome}>
          {isSaving ? "Saving" : "Save Site Chrome"}
        </button>
      </div>
    </div>
  );
}

function SiteBrandFields({ siteChrome, onUpdateBrand }) {
  return (
    <>
      <label className="visual-editor-field">
        <span>Brand Title</span>
        <input value={siteChrome.brandTitle || ""} onChange={(event) => onUpdateBrand("brandTitle", event.target.value)} />
      </label>
      <label className="visual-editor-field">
        <span>Logo Path</span>
        <input value={siteChrome.brandLogo || ""} onChange={(event) => onUpdateBrand("brandLogo", event.target.value)} />
      </label>
      <label className="visual-editor-field">
        <span>Brand Link</span>
        <input value={siteChrome.brandHref || ""} onChange={(event) => onUpdateBrand("brandHref", event.target.value)} />
      </label>
    </>
  );
}

function SiteFooterFields({ footer, focusField = "", onUpdateFooter }) {
  return (
    <>
      <label className="visual-editor-field">
        <span>Copyright</span>
        <input autoFocus={focusField === "copyright"} value={footer.copyright || ""} onChange={(event) => onUpdateFooter("copyright", event.target.value)} />
      </label>
      <label className="visual-editor-field">
        <span>Address</span>
        <input autoFocus={focusField === "address"} value={footer.addressLabel || ""} onChange={(event) => onUpdateFooter("addressLabel", event.target.value)} />
      </label>
      <label className="visual-editor-field">
        <span>Address Link</span>
        <input value={footer.addressHref || ""} onChange={(event) => onUpdateFooter("addressHref", event.target.value)} />
      </label>
      <label className="visual-editor-field">
        <span>Phone</span>
        <input autoFocus={focusField === "phone"} value={footer.phoneLabel || ""} onChange={(event) => onUpdateFooter("phoneLabel", event.target.value)} />
      </label>
      <label className="visual-editor-field">
        <span>Phone Link</span>
        <input value={footer.phoneHref || ""} onChange={(event) => onUpdateFooter("phoneHref", event.target.value)} />
      </label>
    </>
  );
}

function SiteChromeValidation({ errors }) {
  return errors.length ? (
    <div className="visual-editor-validation" role="status">
      {errors.map((validationError) => <p key={validationError}>{validationError}</p>)}
    </div>
  ) : null;
}

function SimpleLinksEditor({ links, onAddLink, onMoveLink, onRemoveLink, onUpdateLink }) {
  return (
    <div className="visual-editor-repeat-list">
      <div className="visual-editor-repeat-header">
        <span>Buttons</span>
        <button type="button" onClick={onAddLink}>Add Button</button>
      </div>
      {links.map((link, index) => (
        <div className="visual-editor-repeat-item" key={`${link.label}-${index}`}>
          <div className="visual-editor-course-controls">
            <button type="button" disabled={index === 0} onClick={() => onMoveLink(index, -1)}>Up</button>
            <button type="button" disabled={index === links.length - 1} onClick={() => onMoveLink(index, 1)}>Down</button>
            <button type="button" onClick={() => onRemoveLink(index)}>Remove</button>
          </div>
          <label className="visual-editor-field">
            <span>Label</span>
            <input value={link.label || ""} onChange={(event) => onUpdateLink(index, "label", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Link</span>
            <input value={link.href || ""} onChange={(event) => onUpdateLink(index, "href", event.target.value)} />
          </label>
          <div className="visual-editor-check-row">
            <label>
              <input
                type="checkbox"
                checked={Boolean(link.external)}
                onChange={(event) => onUpdateLink(index, "external", event.target.checked)}
              />
              Opens externally
            </label>
            <label>
              <input
                type="checkbox"
                checked={Boolean(link.download)}
                onChange={(event) => onUpdateLink(index, "download", event.target.checked)}
              />
              Download
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

function OfficeHoursEditor({ hours, onAddHour, onMoveHour, onRemoveHour, onUpdateHour }) {
  return (
    <div className="visual-editor-repeat-list">
      <div className="visual-editor-repeat-header">
        <span>Office Hours</span>
        <button type="button" onClick={onAddHour}>Add Hours</button>
      </div>
      {hours.map((hour, index) => (
        <div className="visual-editor-repeat-item" key={`${hour.days}-${index}`}>
          <div className="visual-editor-course-controls">
            <button type="button" disabled={index === 0} onClick={() => onMoveHour(index, -1)}>Up</button>
            <button type="button" disabled={index === hours.length - 1} onClick={() => onMoveHour(index, 1)}>Down</button>
            <button type="button" onClick={() => onRemoveHour(index)}>Remove</button>
          </div>
          <label className="visual-editor-field">
            <span>Days</span>
            <input value={hour.days || ""} onChange={(event) => onUpdateHour(index, "days", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Time</span>
            <input value={hour.time || ""} onChange={(event) => onUpdateHour(index, "time", event.target.value)} />
          </label>
        </div>
      ))}
    </div>
  );
}

function LeadershipVisualPanel({
  errors,
  isSaving,
  isUploading,
  leaders,
  onAddLeader,
  onMoveLeader,
  onRemoveLeader,
  onSaveLeadership,
  onUploadLeaderPhoto,
  onUpdateLeader
}) {
  return (
    <div className="visual-editor-module">
      <div className="visual-editor-module-header">
        <div>
          <span className={errors.length ? "visual-editor-status visual-editor-status--error" : "visual-editor-status visual-editor-status--ok"}>
            {errors.length ? `${errors.length} issue${errors.length === 1 ? "" : "s"}` : "Valid draft"}
          </span>
          <strong>{leaders.length} leadership cards</strong>
        </div>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={onAddLeader}>
          Add Card
        </button>
      </div>

      {errors.length ? (
        <div className="visual-editor-validation" role="status">
          {errors.map((validationError) => (
            <p key={validationError}>{validationError}</p>
          ))}
        </div>
      ) : null}

      <div className="visual-editor-course-list">
        {leaders.map((leader, index) => (
          <details className="visual-editor-course" key={leader.id || index} open={index === 0}>
            <summary>
              <span>{leader.name || `Leader ${index + 1}`}</span>
              <strong>{leader.active === false ? "Hidden" : leader.group === "alc" ? "ALC" : "Office"}</strong>
            </summary>
            <div className="visual-editor-course-controls">
              <button type="button" disabled={index === 0} onClick={() => onMoveLeader(index, -1)}>
                Up
              </button>
              <button type="button" disabled={index === leaders.length - 1} onClick={() => onMoveLeader(index, 1)}>
                Down
              </button>
              <button type="button" onClick={() => onRemoveLeader(index)}>
                Remove
              </button>
            </div>
            <label className="visual-editor-field">
              <span>Group</span>
              <select value={leader.group || "office"} onChange={(event) => onUpdateLeader(index, "group", event.target.value)}>
                <option value="office">Office Leadership</option>
                <option value="alc">ALC Poster</option>
              </select>
            </label>
            <label className="visual-editor-field">
              <span>Role</span>
              <input value={leader.role || ""} onChange={(event) => onUpdateLeader(index, "role", event.target.value)} />
            </label>
            <label className="visual-editor-field">
              <span>Name</span>
              <input value={leader.name || ""} onChange={(event) => onUpdateLeader(index, "name", event.target.value)} />
            </label>
            <label className="visual-editor-field">
              <span>Photo</span>
              <input value={leader.photo || ""} onChange={(event) => onUpdateLeader(index, "photo", event.target.value)} />
            </label>
            <label className="visual-editor-field">
              <span>Upload Photo</span>
              <input
                accept="image/gif,image/jpeg,image/png,image/webp"
                type="file"
                onChange={(event) => onUploadLeaderPhoto(index, event.target.files?.[0])}
              />
            </label>
            <label className="visual-editor-field">
              <span>Email</span>
              <input value={leader.email || ""} onChange={(event) => onUpdateLeader(index, "email", event.target.value)} />
            </label>
            <label className="visual-editor-field">
              <span>Phone</span>
              <input value={leader.phone || ""} onChange={(event) => onUpdateLeader(index, "phone", event.target.value)} />
            </label>
            <label className="visual-editor-field">
              <span>Notes</span>
              <textarea value={leader.notes || ""} rows={3} onChange={(event) => onUpdateLeader(index, "notes", event.target.value)} />
            </label>
            <div className="visual-editor-check-row">
              <label>
                <input
                  type="checkbox"
                  checked={leader.active !== false}
                  onChange={(event) => onUpdateLeader(index, "active", event.target.checked)}
                />
                Visible
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={Boolean(leader.featured)}
                  onChange={(event) => onUpdateLeader(index, "featured", event.target.checked)}
                />
                Featured
              </label>
            </div>
          </details>
        ))}
      </div>

      <div className="visual-editor-panel-actions">
        <button className="visual-editor-button" type="button" disabled={Boolean(errors.length) || isSaving} onClick={onSaveLeadership}>
          {isSaving ? "Saving" : "Save Leadership"}
        </button>
        {isUploading ? <span className="visual-editor-status">Uploading</span> : null}
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={() => window.location.reload()}>
          Refresh Preview
        </button>
      </div>
    </div>
  );
}

function RoomActionsEditor({ actions, onAddAction, onMoveAction, onRemoveAction, onUpdateAction }) {
  return (
    <div className="visual-editor-repeat-list">
      <div className="visual-editor-repeat-header">
        <span>Booking Buttons</span>
        <button type="button" onClick={onAddAction}>Add Button</button>
      </div>
      {actions.map((action, index) => (
        <div className="visual-editor-repeat-item" key={`${action.label}-${index}`}>
          <div className="visual-editor-course-controls">
            <button type="button" disabled={index === 0} onClick={() => onMoveAction(index, -1)}>Up</button>
            <button type="button" disabled={index === actions.length - 1} onClick={() => onMoveAction(index, 1)}>Down</button>
            <button type="button" onClick={() => onRemoveAction(index)}>Remove</button>
          </div>
          <label className="visual-editor-field">
            <span>Label</span>
            <input value={action.label || ""} onChange={(event) => onUpdateAction(index, "label", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Calendly Link</span>
            <input value={action.url || ""} onChange={(event) => onUpdateAction(index, "url", event.target.value)} />
          </label>
        </div>
      ))}
    </div>
  );
}

function RoomCalendarsEditor({ calendars, onAddCalendar, onMoveCalendar, onRemoveCalendar, onUpdateCalendar }) {
  return (
    <div className="visual-editor-repeat-list">
      <div className="visual-editor-repeat-header">
        <span>Calendar Embeds</span>
        <button type="button" onClick={onAddCalendar}>Add Calendar</button>
      </div>
      {calendars.map((calendar, index) => (
        <div className="visual-editor-repeat-item" key={`${calendar.label}-${index}`}>
          <div className="visual-editor-course-controls">
            <button type="button" disabled={index === 0} onClick={() => onMoveCalendar(index, -1)}>Up</button>
            <button type="button" disabled={index === calendars.length - 1} onClick={() => onMoveCalendar(index, 1)}>Down</button>
            <button type="button" onClick={() => onRemoveCalendar(index)}>Remove</button>
          </div>
          <label className="visual-editor-field">
            <span>Label</span>
            <input value={calendar.label || ""} onChange={(event) => onUpdateCalendar(index, "label", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Frame Title</span>
            <input value={calendar.title || ""} onChange={(event) => onUpdateCalendar(index, "title", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Google Calendar Embed URL</span>
            <textarea value={calendar.src || ""} rows={3} onChange={(event) => onUpdateCalendar(index, "src", event.target.value)} />
          </label>
        </div>
      ))}
    </div>
  );
}

function OfficeHolidaysEditor({ holidays, onAddHoliday, onMoveHoliday, onRemoveHoliday, onUpdateHoliday }) {
  return (
    <div className="visual-editor-repeat-list">
      <div className="visual-editor-repeat-header">
        <span>Holidays</span>
        <button type="button" onClick={onAddHoliday}>Add Holiday</button>
      </div>
      {holidays.map((holiday, index) => (
        <div className="visual-editor-repeat-item" key={`${holiday}-${index}`}>
          <div className="visual-editor-course-controls">
            <button type="button" disabled={index === 0} onClick={() => onMoveHoliday(index, -1)}>Up</button>
            <button type="button" disabled={index === holidays.length - 1} onClick={() => onMoveHoliday(index, 1)}>Down</button>
            <button type="button" onClick={() => onRemoveHoliday(index)}>Remove</button>
          </div>
          <label className="visual-editor-field">
            <span>Holiday</span>
            <input value={holiday || ""} onChange={(event) => onUpdateHoliday(index, event.target.value)} />
          </label>
        </div>
      ))}
    </div>
  );
}

function OfficeChipsEditor({ cardKey, chips, onAddChip, onMoveChip, onRemoveChip, onUpdateChip }) {
  return (
    <div className="visual-editor-repeat-list">
      <div className="visual-editor-repeat-header">
        <span>Tag Buttons</span>
        <button type="button" onClick={() => onAddChip(cardKey)}>Add Button</button>
      </div>
      {chips.map((chip, index) => (
        <div className="visual-editor-repeat-item" key={`${chip.label}-${index}`}>
          <div className="visual-editor-course-controls">
            <button type="button" disabled={index === 0} onClick={() => onMoveChip(cardKey, index, -1)}>Up</button>
            <button type="button" disabled={index === chips.length - 1} onClick={() => onMoveChip(cardKey, index, 1)}>Down</button>
            <button type="button" onClick={() => onRemoveChip(cardKey, index)}>Remove</button>
          </div>
          <label className="visual-editor-field">
            <span>Label</span>
            <input value={chip.label || ""} onChange={(event) => onUpdateChip(cardKey, index, "label", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Link</span>
            <input value={chip.href || ""} onChange={(event) => onUpdateChip(cardKey, index, "href", event.target.value)} />
          </label>
          <div className="visual-editor-check-row">
            <label>
              <input
                type="checkbox"
                checked={Boolean(chip.external)}
                onChange={(event) => onUpdateChip(cardKey, index, "external", event.target.checked)}
              />
              Opens externally
            </label>
            <label>
              <input
                type="checkbox"
                checked={Boolean(chip.download)}
                onChange={(event) => onUpdateChip(cardKey, index, "download", event.target.checked)}
              />
              Download
            </label>
            <label>
              <input
                type="checkbox"
                checked={Boolean(chip.handbookModal)}
                onChange={(event) => onUpdateChip(cardKey, index, "handbookModal", event.target.checked)}
              />
              Handbook modal
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

function CustomSectionLinksEditor({ cardIndex, links, onAddLink, onMoveLink, onRemoveLink, onUpdateLink, sectionIndex }) {
  return (
    <div className="visual-editor-repeat-list">
      <div className="visual-editor-repeat-header">
        <span>Buttons</span>
        <button type="button" onClick={() => onAddLink(sectionIndex, cardIndex)}>Add Button</button>
      </div>
      {links.map((link, index) => (
        <div className="visual-editor-repeat-item" key={`${link.label}-${index}`}>
          <div className="visual-editor-course-controls">
            <button type="button" disabled={index === 0} onClick={() => onMoveLink(sectionIndex, cardIndex, index, -1)}>Up</button>
            <button type="button" disabled={index === links.length - 1} onClick={() => onMoveLink(sectionIndex, cardIndex, index, 1)}>Down</button>
            <button type="button" onClick={() => onRemoveLink(sectionIndex, cardIndex, index)}>Remove</button>
          </div>
          <label className="visual-editor-field">
            <span>Label</span>
            <input value={link.label || ""} onChange={(event) => onUpdateLink(sectionIndex, cardIndex, index, "label", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Link</span>
            <input value={link.href || ""} onChange={(event) => onUpdateLink(sectionIndex, cardIndex, index, "href", event.target.value)} />
          </label>
          <div className="visual-editor-check-row">
            <label>
              <input
                type="checkbox"
                checked={Boolean(link.external)}
                onChange={(event) => onUpdateLink(sectionIndex, cardIndex, index, "external", event.target.checked)}
              />
              Opens externally
            </label>
            <label>
              <input
                type="checkbox"
                checked={Boolean(link.download)}
                onChange={(event) => onUpdateLink(sectionIndex, cardIndex, index, "download", event.target.checked)}
              />
              Download
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

function AssetLinksEditor({ collectionKey, editableType, itemIndex, items, links, onAddLink, onMoveLink, onRemoveLink, onUpdateLink }) {
  return (
    <div className="visual-editor-repeat-list">
      <div className="visual-editor-repeat-header">
        <span>Buttons</span>
        <button type="button" onClick={() => onAddLink(collectionKey, items, itemIndex, editableType)}>Add Button</button>
      </div>
      {links.map((link, index) => (
        <div className="visual-editor-repeat-item" key={`${link.label}-${index}`}>
          <div className="visual-editor-course-controls">
            <button type="button" disabled={index === 0} onClick={() => onMoveLink(collectionKey, items, itemIndex, index, -1, editableType)}>Up</button>
            <button type="button" disabled={index === links.length - 1} onClick={() => onMoveLink(collectionKey, items, itemIndex, index, 1, editableType)}>Down</button>
            <button type="button" onClick={() => onRemoveLink(collectionKey, items, itemIndex, index, editableType)}>Remove</button>
          </div>
          <label className="visual-editor-field">
            <span>Label</span>
            <input value={link.label || ""} onChange={(event) => onUpdateLink(collectionKey, items, itemIndex, index, "label", event.target.value, editableType)} />
          </label>
          <label className="visual-editor-field">
            <span>Link</span>
            <input value={link.href || ""} onChange={(event) => onUpdateLink(collectionKey, items, itemIndex, index, "href", event.target.value, editableType)} />
          </label>
          <div className="visual-editor-check-row">
            <label>
              <input
                type="checkbox"
                checked={Boolean(link.external)}
                onChange={(event) => onUpdateLink(collectionKey, items, itemIndex, index, "external", event.target.checked, editableType)}
              />
              Opens externally
            </label>
            <label>
              <input
                type="checkbox"
                checked={Boolean(link.download)}
                onChange={(event) => onUpdateLink(collectionKey, items, itemIndex, index, "download", event.target.checked, editableType)}
              />
              Download
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

function CustomSectionsVisualPanel({
  errors,
  isSaving,
  onAddCard,
  onAddCardLink,
  onAddSection,
  onMoveCard,
  onMoveCardLink,
  onMoveSection,
  onRemoveCard,
  onRemoveCardLink,
  onRemoveSection,
  onSaveCustomSections,
  onUpdateCard,
  onUpdateCardLink,
  onUpdateSection,
  sections
}) {
  return (
    <div className="visual-editor-module">
      <div className="visual-editor-module-header">
        <div>
          <span className={errors.length ? "visual-editor-status visual-editor-status--error" : "visual-editor-status visual-editor-status--ok"}>
            {errors.length ? `${errors.length} issue${errors.length === 1 ? "" : "s"}` : "Valid draft"}
          </span>
          <strong>{sections.length} custom section{sections.length === 1 ? "" : "s"}</strong>
        </div>
      </div>
      <div className="visual-editor-add-grid">
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={onAddSection}>Add Section</button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" disabled={!sections.length} onClick={() => onAddCard(Math.max(0, sections.length - 1))}>Add Card</button>
      </div>

      {errors.length ? (
        <div className="visual-editor-validation" role="status">
          {errors.map((validationError) => (
            <p key={validationError}>{validationError}</p>
          ))}
        </div>
      ) : null}

      <div className="visual-editor-course-list">
        {sections.map((section, sectionIndex) => (
          <details className="visual-editor-course" key={section.id || sectionIndex} open={sectionIndex === sections.length - 1}>
            <summary>
              <span>{section.title || `Custom Section ${sectionIndex + 1}`}</span>
              <strong>{section.active === false ? "Hidden" : `${(section.cards || []).length} card${(section.cards || []).length === 1 ? "" : "s"}`}</strong>
            </summary>
            <div className="visual-editor-course-controls">
              <button type="button" disabled={sectionIndex === 0} onClick={() => onMoveSection(sectionIndex, -1)}>Up</button>
              <button type="button" disabled={sectionIndex === sections.length - 1} onClick={() => onMoveSection(sectionIndex, 1)}>Down</button>
              <button type="button" onClick={() => onAddCard(sectionIndex)}>Add Card</button>
              <button type="button" onClick={() => onRemoveSection(sectionIndex)}>Remove</button>
            </div>
            <label className="visual-editor-field">
              <span>Eyebrow</span>
              <input value={section.eyebrow || ""} onChange={(event) => onUpdateSection(sectionIndex, "eyebrow", event.target.value)} />
            </label>
            <label className="visual-editor-field">
              <span>Title</span>
              <input value={section.title || ""} onChange={(event) => onUpdateSection(sectionIndex, "title", event.target.value)} />
            </label>
            <label className="visual-editor-field">
              <span>Description</span>
              <textarea value={section.summary || ""} rows={3} onChange={(event) => onUpdateSection(sectionIndex, "summary", event.target.value)} />
            </label>
            <div className="visual-editor-check-row">
              <label>
                <input type="checkbox" checked={section.active !== false} onChange={(event) => onUpdateSection(sectionIndex, "active", event.target.checked)} />
                Visible
              </label>
            </div>
            <CustomSectionCardDetailsList
              cards={section.cards || []}
              onAddCardLink={onAddCardLink}
              onMoveCardLink={onMoveCardLink}
              onMoveCard={onMoveCard}
              onRemoveCardLink={onRemoveCardLink}
              onRemoveCard={onRemoveCard}
              onUpdateCard={onUpdateCard}
              onUpdateCardLink={onUpdateCardLink}
              sectionIndex={sectionIndex}
            />
          </details>
        ))}
      </div>

      <div className="visual-editor-panel-actions">
        <button className="visual-editor-button" type="button" disabled={Boolean(errors.length) || isSaving} onClick={onSaveCustomSections}>
          {isSaving ? "Saving" : "Save Custom Sections"}
        </button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={() => window.location.reload()}>
          Refresh Preview
        </button>
      </div>
    </div>
  );
}

function CustomSectionCardDetailsList({ cards, onAddCardLink, onMoveCard, onMoveCardLink, onRemoveCard, onRemoveCardLink, onUpdateCard, onUpdateCardLink, sectionIndex }) {
  return (
    <div className="visual-editor-repeat-list">
      <div className="visual-editor-repeat-header">
        <span>Cards</span>
      </div>
      {cards.map((card, cardIndex) => (
        <details className="visual-editor-course" key={card.id || cardIndex}>
          <summary>
            <span>{card.title || `Card ${cardIndex + 1}`}</span>
            <strong>{card.active === false ? "Hidden" : "Visible"}</strong>
          </summary>
          <div className="visual-editor-course-controls">
            <button type="button" disabled={cardIndex === 0} onClick={() => onMoveCard(sectionIndex, cardIndex, -1)}>Up</button>
            <button type="button" disabled={cardIndex === cards.length - 1} onClick={() => onMoveCard(sectionIndex, cardIndex, 1)}>Down</button>
            <button type="button" onClick={() => onRemoveCard(sectionIndex, cardIndex)}>Remove</button>
          </div>
          <label className="visual-editor-field">
            <span>Tag</span>
            <input value={card.kicker || ""} onChange={(event) => onUpdateCard(sectionIndex, cardIndex, "kicker", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Title</span>
            <input value={card.title || ""} onChange={(event) => onUpdateCard(sectionIndex, cardIndex, "title", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Description</span>
            <textarea value={card.summary || ""} rows={3} onChange={(event) => onUpdateCard(sectionIndex, cardIndex, "summary", event.target.value)} />
          </label>
          <CustomSectionLinksEditor
            cardIndex={cardIndex}
            links={card.links || []}
            onAddLink={onAddCardLink}
            onMoveLink={onMoveCardLink}
            onRemoveLink={onRemoveCardLink}
            onUpdateLink={onUpdateCardLink}
            sectionIndex={sectionIndex}
          />
          <div className="visual-editor-check-row">
            <label>
              <input type="checkbox" checked={card.active !== false} onChange={(event) => onUpdateCard(sectionIndex, cardIndex, "active", event.target.checked)} />
              Visible
            </label>
          </div>
        </details>
      ))}
    </div>
  );
}

function NavigationVisualPanel({
  errors,
  isSaving,
  navigation,
  onAddLink,
  onMoveLink,
  onRemoveLink,
  onSaveNavigation,
  onUpdateLabel,
  onUpdateLink
}) {
  return (
    <div className="visual-editor-module">
      <div className="visual-editor-module-header">
        <div>
          <span className={errors.length ? "visual-editor-status visual-editor-status--error" : "visual-editor-status visual-editor-status--ok"}>
            {errors.length ? `${errors.length} issue${errors.length === 1 ? "" : "s"}` : "Valid draft"}
          </span>
          <strong>Page navigation</strong>
        </div>
      </div>

      {errors.length ? (
        <div className="visual-editor-validation" role="status">
          {errors.map((validationError) => (
            <p key={validationError}>{validationError}</p>
          ))}
        </div>
      ) : null}

      <div className="visual-editor-repeat-list">
        <div className="visual-editor-repeat-header">
          <span>Navigation Labels</span>
        </div>
        <label className="visual-editor-field">
          <span>Daily Access Kicker</span>
          <input value={navigation.dailyAccessKicker || ""} onChange={(event) => onUpdateLabel("dailyAccessKicker", event.target.value)} />
        </label>
        <label className="visual-editor-field">
          <span>Daily Access Title</span>
          <input value={navigation.dailyAccessTitle || ""} onChange={(event) => onUpdateLabel("dailyAccessTitle", event.target.value)} />
        </label>
        <label className="visual-editor-field">
          <span>Sidebar Quick-Link Title</span>
          <input value={navigation.sidebarUtilityTitle || ""} onChange={(event) => onUpdateLabel("sidebarUtilityTitle", event.target.value)} />
        </label>
        <label className="visual-editor-field">
          <span>Mobile Menu Title</span>
          <input value={navigation.mobileMenuLabel || ""} onChange={(event) => onUpdateLabel("mobileMenuLabel", event.target.value)} />
        </label>
        <label className="visual-editor-field">
          <span>Mobile Quick-Link Title</span>
          <input value={navigation.mobileQuickLinksLabel || ""} onChange={(event) => onUpdateLabel("mobileQuickLinksLabel", event.target.value)} />
        </label>
      </div>

      <NavigationDetailsList
        items={navigation.navLinks}
        label="Sidebar Menu"
        listKey="navLinks"
        onAddLink={onAddLink}
        onMoveLink={onMoveLink}
        onRemoveLink={onRemoveLink}
        onUpdateLink={onUpdateLink}
      />
      <NavigationDetailsList
        items={navigation.sidebarUtilityLinks}
        label="Sidebar Quick Links"
        listKey="sidebarUtilityLinks"
        onAddLink={onAddLink}
        onMoveLink={onMoveLink}
        onRemoveLink={onRemoveLink}
        onUpdateLink={onUpdateLink}
      />
      <NavigationDetailsList
        items={navigation.mobileQuickLinks}
        label="Mobile Quick Links"
        listKey="mobileQuickLinks"
        onAddLink={onAddLink}
        onMoveLink={onMoveLink}
        onRemoveLink={onRemoveLink}
        onUpdateLink={onUpdateLink}
      />
      <NavigationDetailsList
        items={navigation.dailyAccessLinks}
        label="Daily Access Strip"
        listKey="dailyAccessLinks"
        onAddLink={onAddLink}
        onMoveLink={onMoveLink}
        onRemoveLink={onRemoveLink}
        onUpdateLink={onUpdateLink}
      />

      <div className="visual-editor-panel-actions">
        <button className="visual-editor-button" type="button" disabled={Boolean(errors.length) || isSaving} onClick={onSaveNavigation}>
          {isSaving ? "Saving" : "Save Navigation"}
        </button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={() => window.location.reload()}>
          Refresh Preview
        </button>
      </div>
    </div>
  );
}

function NavigationDetailsList({ items, label, listKey, onAddLink, onMoveLink, onRemoveLink, onUpdateLink }) {
  return (
    <div className="visual-editor-course-list">
      <div className="visual-editor-repeat-header">
        <span>{label}</span>
        <button type="button" onClick={() => onAddLink(listKey)}>Add Link</button>
      </div>
      {items.map((link, index) => (
        <details className="visual-editor-course" key={`${link.href}-${link.label}-${index}`}>
          <summary>
            <span>{link.label || `Link ${index + 1}`}</span>
            <strong>{link.external ? "External" : link.download ? "Download" : "Internal"}</strong>
          </summary>
          <div className="visual-editor-course-controls">
            <button type="button" disabled={index === 0} onClick={() => onMoveLink(listKey, index, -1)}>Up</button>
            <button type="button" disabled={index === items.length - 1} onClick={() => onMoveLink(listKey, index, 1)}>Down</button>
            <button type="button" onClick={() => onRemoveLink(listKey, index)}>Remove</button>
          </div>
          <label className="visual-editor-field">
            <span>Label</span>
            <input value={link.label || ""} onChange={(event) => onUpdateLink(listKey, index, "label", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Link</span>
            <input value={link.href || ""} onChange={(event) => onUpdateLink(listKey, index, "href", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Button Style</span>
            <select value={link.button || ""} onChange={(event) => onUpdateLink(listKey, index, "button", event.target.value)}>
              <option value="">Menu link</option>
              <option value="secondary">Secondary button</option>
              <option value="primary">Primary button</option>
            </select>
          </label>
          <div className="visual-editor-check-row">
            <label>
              <input type="checkbox" checked={Boolean(link.page)} onChange={(event) => onUpdateLink(listKey, index, "page", event.target.checked)} />
              Page link
            </label>
            <label>
              <input type="checkbox" checked={Boolean(link.primary)} onChange={(event) => onUpdateLink(listKey, index, "primary", event.target.checked)} />
              Highlight
            </label>
            <label>
              <input type="checkbox" checked={Boolean(link.external)} onChange={(event) => onUpdateLink(listKey, index, "external", event.target.checked)} />
              Opens externally
            </label>
            <label>
              <input type="checkbox" checked={Boolean(link.download)} onChange={(event) => onUpdateLink(listKey, index, "download", event.target.checked)} />
              Download
            </label>
          </div>
        </details>
      ))}
    </div>
  );
}

function TechConnectVisualPanel({
  answerCards,
  errors,
  helpPaths,
  isSaving,
  onAddAnswer,
  onAddHelpPath,
  onAddPaperCut,
  onMoveAnswer,
  onMoveHelpPath,
  onMovePaperCut,
  onRemoveAnswer,
  onRemoveHelpPath,
  onRemovePaperCut,
  onSaveTechConnect,
  onUpdateAnswer,
  onUpdateHelpPath,
  onUpdatePaperCut,
  paperCutCards
}) {
  return (
    <div className="visual-editor-module">
      <div className="visual-editor-module-header">
        <div>
          <span className={errors.length ? "visual-editor-status visual-editor-status--error" : "visual-editor-status visual-editor-status--ok"}>
            {errors.length ? `${errors.length} issue${errors.length === 1 ? "" : "s"}` : "Valid draft"}
          </span>
          <strong>{helpPaths.length + paperCutCards.length + answerCards.length} Tech Connect cards</strong>
        </div>
      </div>
      <div className="visual-editor-add-grid">
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={onAddHelpPath}>Add Help Path</button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={onAddPaperCut}>Add PaperCut Card</button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={onAddAnswer}>Add KW Answer</button>
      </div>

      {errors.length ? (
        <div className="visual-editor-validation" role="status">
          {errors.map((validationError) => (
            <p key={validationError}>{validationError}</p>
          ))}
        </div>
      ) : null}

      <TechCardDetailsList
        items={helpPaths}
        label="Help Paths"
        onMoveItem={onMoveHelpPath}
        onRemoveItem={onRemoveHelpPath}
        onUpdateItem={onUpdateHelpPath}
        typeLabel="Help Path"
      />
      <TechCardDetailsList
        includeSecondarySummary
        items={paperCutCards}
        label="PaperCut Hive"
        onMoveItem={onMovePaperCut}
        onRemoveItem={onRemovePaperCut}
        onUpdateItem={onUpdatePaperCut}
        typeLabel="PaperCut"
      />
      <TechCardDetailsList
        items={answerCards}
        label="KW Answers"
        onMoveItem={onMoveAnswer}
        onRemoveItem={onRemoveAnswer}
        onUpdateItem={onUpdateAnswer}
        typeLabel="Answer"
      />

      <div className="visual-editor-panel-actions">
        <button className="visual-editor-button" type="button" disabled={Boolean(errors.length) || isSaving} onClick={onSaveTechConnect}>
          {isSaving ? "Saving" : "Save Tech Connect"}
        </button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={() => window.location.reload()}>
          Refresh Preview
        </button>
      </div>
    </div>
  );
}

function TechCardDetailsList({ includeSecondarySummary = false, items, label, onMoveItem, onRemoveItem, onUpdateItem, typeLabel }) {
  return (
    <div className="visual-editor-course-list">
      <div className="visual-editor-repeat-header">
        <span>{label}</span>
      </div>
      {items.map((item, index) => (
        <details className="visual-editor-course" key={item.id || index}>
          <summary>
            <span>{item.title || `${typeLabel} ${index + 1}`}</span>
            <strong>{item.active === false ? "Hidden" : "Visible"}</strong>
          </summary>
          <div className="visual-editor-course-controls">
            <button type="button" disabled={index === 0} onClick={() => onMoveItem(index, -1)}>Up</button>
            <button type="button" disabled={index === items.length - 1} onClick={() => onMoveItem(index, 1)}>Down</button>
            <button type="button" onClick={() => onRemoveItem(index)}>Remove</button>
          </div>
          <label className="visual-editor-field">
            <span>Tag</span>
            <input value={item.kicker || ""} onChange={(event) => onUpdateItem(index, "kicker", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Title</span>
            <input value={item.title || ""} onChange={(event) => onUpdateItem(index, "title", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Description</span>
            <textarea value={item.summary || ""} rows={3} onChange={(event) => onUpdateItem(index, "summary", event.target.value)} />
          </label>
          {includeSecondarySummary ? (
            <label className="visual-editor-field">
              <span>Second Description</span>
              <textarea value={item.secondarySummary || ""} rows={3} onChange={(event) => onUpdateItem(index, "secondarySummary", event.target.value)} />
            </label>
          ) : null}
          <div className="visual-editor-check-row">
            <label>
              <input type="checkbox" checked={item.active !== false} onChange={(event) => onUpdateItem(index, "active", event.target.checked)} />
              Visible
            </label>
          </div>
        </details>
      ))}
    </div>
  );
}

function BrandAssetsVisualPanel({
  digitalLogoErrors,
  digitalLogos,
  isSaving,
  isUploading,
  marketingToolErrors,
  marketingTools,
  onAddDigitalLogo,
  onAddMarketingTool,
  onAddSourceFile,
  onMoveDigitalLogo,
  onMoveMarketingTool,
  onMoveSourceFile,
  onRemoveDigitalLogo,
  onRemoveMarketingTool,
  onRemoveSourceFile,
  onSaveBrandAssets,
  onUpdateDigitalLogo,
  onUpdateMarketingTool,
  onUpdateSourceFile,
  onUploadDigitalLogoImage,
  sourceFileErrors,
  sourceFiles
}) {
  const errors = [...marketingToolErrors, ...digitalLogoErrors, ...sourceFileErrors];

  return (
    <div className="visual-editor-module">
      <div className="visual-editor-module-header">
        <div>
          <span className={errors.length ? "visual-editor-status visual-editor-status--error" : "visual-editor-status visual-editor-status--ok"}>
            {errors.length ? `${errors.length} issue${errors.length === 1 ? "" : "s"}` : "Valid draft"}
          </span>
          <strong>{marketingTools.length + digitalLogos.length + sourceFiles.length} brand asset cards</strong>
        </div>
      </div>
      <div className="visual-editor-add-grid">
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={onAddMarketingTool}>Add Marketing Tool</button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={onAddDigitalLogo}>Add Digital Logo</button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={onAddSourceFile}>Add Source File</button>
      </div>

      {errors.length ? (
        <div className="visual-editor-validation" role="status">
          {errors.map((validationError) => (
            <p key={validationError}>{validationError}</p>
          ))}
        </div>
      ) : null}

      <BrandAssetDetailsList
        label="Marketing Tools"
        items={marketingTools}
        onMoveItem={onMoveMarketingTool}
        onRemoveItem={onRemoveMarketingTool}
        onUpdateItem={onUpdateMarketingTool}
        typeLabel="Tool"
      />
      <BrandAssetDetailsList
        includeImage
        isUploading={isUploading}
        label="Digital Logos"
        items={digitalLogos}
        onMoveItem={onMoveDigitalLogo}
        onRemoveItem={onRemoveDigitalLogo}
        onUpdateItem={onUpdateDigitalLogo}
        onUploadImage={onUploadDigitalLogoImage}
        typeLabel="Logo"
      />
      <BrandAssetDetailsList
        label="Source Files"
        items={sourceFiles}
        onMoveItem={onMoveSourceFile}
        onRemoveItem={onRemoveSourceFile}
        onUpdateItem={onUpdateSourceFile}
        typeLabel="File"
      />

      <div className="visual-editor-panel-actions">
        <button className="visual-editor-button" type="button" disabled={Boolean(errors.length) || isSaving} onClick={onSaveBrandAssets}>
          {isSaving ? "Saving" : "Save Brand Assets"}
        </button>
        {isUploading ? <span className="visual-editor-status">Uploading</span> : null}
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={() => window.location.reload()}>
          Refresh Preview
        </button>
      </div>
    </div>
  );
}

function BrandAssetDetailsList({ includeImage = false, isUploading = false, items, label, onMoveItem, onRemoveItem, onUpdateItem, onUploadImage, typeLabel }) {
  return (
    <div className="visual-editor-course-list">
      <div className="visual-editor-repeat-header">
        <span>{label}</span>
      </div>
      {items.map((item, index) => (
        <details className="visual-editor-course" key={item.id || index}>
          <summary>
            <span>{item.title || `${typeLabel} ${index + 1}`}</span>
            <strong>{item.active === false ? "Hidden" : "Visible"}</strong>
          </summary>
          <div className="visual-editor-course-controls">
            <button type="button" disabled={index === 0} onClick={() => onMoveItem(index, -1)}>Up</button>
            <button type="button" disabled={index === items.length - 1} onClick={() => onMoveItem(index, 1)}>Down</button>
            <button type="button" onClick={() => onRemoveItem(index)}>Remove</button>
          </div>
          <label className="visual-editor-field">
            <span>Tag</span>
            <input value={item.kicker || ""} onChange={(event) => onUpdateItem(index, "kicker", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Title</span>
            <input value={item.title || ""} onChange={(event) => onUpdateItem(index, "title", event.target.value)} />
          </label>
          <label className="visual-editor-field">
            <span>Description</span>
            <textarea value={item.summary || ""} rows={3} onChange={(event) => onUpdateItem(index, "summary", event.target.value)} />
          </label>
          {includeImage ? (
            <>
              <label className="visual-editor-field">
                <span>Image</span>
                <input value={item.image?.src || ""} onChange={(event) => onUpdateItem(index, "image.src", event.target.value)} />
              </label>
              <label className="visual-editor-field">
                <span>Upload Image</span>
                <input accept="image/gif,image/jpeg,image/png,image/webp" type="file" onChange={(event) => onUploadImage(index, event.target.files?.[0])} />
              </label>
              <label className="visual-editor-field">
                <span>Alt Text</span>
                <input value={item.image?.alt || ""} onChange={(event) => onUpdateItem(index, "image.alt", event.target.value)} />
              </label>
              <label className="visual-editor-field">
                <span>Preview Style</span>
                <select value={item.previewClass || "asset-preview--light"} onChange={(event) => onUpdateItem(index, "previewClass", event.target.value)}>
                  <option value="asset-preview--light">Light</option>
                  <option value="asset-preview--dark">Dark</option>
                  <option value="asset-preview--red">Red</option>
                </select>
              </label>
              {isUploading ? <span className="visual-editor-status">Uploading</span> : null}
            </>
          ) : null}
          <div className="visual-editor-check-row">
            <label>
              <input type="checkbox" checked={item.active !== false} onChange={(event) => onUpdateItem(index, "active", event.target.checked)} />
              Visible
            </label>
          </div>
        </details>
      ))}
    </div>
  );
}

function getInitialFloatingEditorPosition(item) {
  const safeLeft = typeof window === "undefined"
    ? item.toolbarPosition.left
    : Math.min(window.innerWidth - 390, item.toolbarPosition.left);

  return {
    top: Math.max(86, item.toolbarPosition.top + 44),
    left: Math.max(18, safeLeft)
  };
}

function getMeasuredFloatingEditorPosition(item, editor) {
  const margin = 18;
  const topLimit = 86;
  const bottomLimit = window.innerHeight - margin;
  const bounds = item.bounds || {};
  const editorHeight = Math.min(editor.offsetHeight || 420, window.innerHeight - topLimit - margin);
  const editorWidth = editor.offsetWidth || 360;
  const openBelowTop = Math.max(topLimit, (bounds.bottom || item.toolbarPosition.top) + 12);
  const openAboveTop = (bounds.top || item.toolbarPosition.top) - editorHeight - 12;
  const preferredTop = openBelowTop + editorHeight > bottomLimit && openAboveTop >= topLimit
    ? openAboveTop
    : openBelowTop;
  const clampedTop = Math.min(Math.max(topLimit, preferredTop), bottomLimit - editorHeight);
  const rawLeft = bounds.left || item.toolbarPosition.left;
  const clampedLeft = Math.min(Math.max(margin, rawLeft), window.innerWidth - editorWidth - margin);

  return {
    top: Math.max(topLimit, clampedTop),
    left: Math.max(margin, clampedLeft)
  };
}

function CourseVisualPanel({
  addLabel = "Add",
  courses,
  errors,
  itemLabel = "course cards",
  isSaving,
  onAddCourse,
  onMoveCourse,
  onRemoveCourse,
  onSaveCourses,
  onUpdateCourse,
  saveLabel = "Save Courses"
}) {
  return (
    <div className="visual-editor-module">
      <div className="visual-editor-module-header">
        <div>
          <span className={errors.length ? "visual-editor-status visual-editor-status--error" : "visual-editor-status visual-editor-status--ok"}>
            {errors.length ? `${errors.length} issue${errors.length === 1 ? "" : "s"}` : "Valid draft"}
          </span>
          <strong>{courses.length} {itemLabel}</strong>
        </div>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={onAddCourse}>
          {addLabel}
        </button>
      </div>

      {errors.length ? (
        <div className="visual-editor-validation" role="status">
          {errors.map((validationError) => (
            <p key={validationError}>{validationError}</p>
          ))}
        </div>
      ) : null}

      <div className="visual-editor-course-list">
        {courses.map((course, index) => (
          <details className="visual-editor-course" key={course.id || index} open={index === 0}>
            <summary>
              <span>{course.title || `Course ${index + 1}`}</span>
              <strong>{course.active === false ? "Hidden" : "Visible"}</strong>
            </summary>
            <div className="visual-editor-course-controls">
              <button type="button" disabled={index === 0} onClick={() => onMoveCourse(index, -1)}>
                Up
              </button>
              <button type="button" disabled={index === courses.length - 1} onClick={() => onMoveCourse(index, 1)}>
                Down
              </button>
              <button type="button" onClick={() => onRemoveCourse(index)}>
                Remove
              </button>
            </div>
            <label className="visual-editor-field">
              <span>Tag</span>
              <input value={course.tag || ""} onChange={(event) => onUpdateCourse(index, "tag", event.target.value)} />
            </label>
            <label className="visual-editor-field">
              <span>Title</span>
              <input value={course.title || ""} onChange={(event) => onUpdateCourse(index, "title", event.target.value)} />
            </label>
            <label className="visual-editor-field">
              <span>Summary</span>
              <textarea value={course.summary || ""} rows={3} onChange={(event) => onUpdateCourse(index, "summary", event.target.value)} />
            </label>
            <label className="visual-editor-field">
              <span>Link</span>
              <input value={course.href || ""} onChange={(event) => onUpdateCourse(index, "href", event.target.value)} />
            </label>
            <div className="visual-editor-check-row">
              <label>
                <input
                  type="checkbox"
                  checked={course.active !== false}
                  onChange={(event) => onUpdateCourse(index, "active", event.target.checked)}
                />
                Visible
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={course.external !== false}
                  onChange={(event) => onUpdateCourse(index, "external", event.target.checked)}
                />
                Opens externally
              </label>
            </div>
          </details>
        ))}
      </div>

      <div className="visual-editor-panel-actions">
        <button className="visual-editor-button" type="button" disabled={Boolean(errors.length) || isSaving} onClick={onSaveCourses}>
          {isSaving ? "Saving" : saveLabel}
        </button>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={() => window.location.reload()}>
          Refresh Preview
        </button>
      </div>
    </div>
  );
}

function VendorVisualPanel({
  errors,
  isSaving,
  isUploading,
  vendors,
  onAddVendor,
  onMoveVendor,
  onRemoveVendor,
  onSaveVendors,
  onUploadVendorLogo,
  onUpdateVendor
}) {
  return (
    <div className="visual-editor-module">
      <div className="visual-editor-module-header">
        <div>
          <span className={errors.length ? "visual-editor-status visual-editor-status--error" : "visual-editor-status visual-editor-status--ok"}>
            {errors.length ? `${errors.length} issue${errors.length === 1 ? "" : "s"}` : "Valid draft"}
          </span>
          <strong>{vendors.length} vendor cards</strong>
        </div>
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={onAddVendor}>
          Add Card
        </button>
      </div>

      {errors.length ? (
        <div className="visual-editor-validation" role="status">
          {errors.map((validationError) => (
            <p key={validationError}>{validationError}</p>
          ))}
        </div>
      ) : null}

      <div className="visual-editor-course-list">
        {vendors.map((vendor, index) => (
          <details className="visual-editor-course" key={vendor.id || index} open={index === 0}>
            <summary>
              <span>{vendor.business || `Vendor ${index + 1}`}</span>
              <strong>{vendor.active === false ? "Hidden" : vendor.section === "core" ? "Core" : "Service"}</strong>
            </summary>
            <div className="visual-editor-course-controls">
              <button type="button" disabled={index === 0} onClick={() => onMoveVendor(index, -1)}>
                Up
              </button>
              <button type="button" disabled={index === vendors.length - 1} onClick={() => onMoveVendor(index, 1)}>
                Down
              </button>
              <button type="button" onClick={() => onRemoveVendor(index)}>
                Remove
              </button>
            </div>
            <label className="visual-editor-field">
              <span>Group</span>
              <select value={vendor.section || "services"} onChange={(event) => onUpdateVendor(index, "section", event.target.value)}>
                <option value="core">Core Partners</option>
                <option value="services">Service Vendors</option>
              </select>
            </label>
            <label className="visual-editor-field">
              <span>Business</span>
              <input value={vendor.business || ""} onChange={(event) => onUpdateVendor(index, "business", event.target.value)} />
            </label>
            <label className="visual-editor-field">
              <span>Logo</span>
              <input value={vendor.logo || ""} onChange={(event) => onUpdateVendor(index, "logo", event.target.value)} />
            </label>
            <label className="visual-editor-field">
              <span>Upload Logo</span>
              <input
                accept="image/gif,image/jpeg,image/png,image/webp"
                type="file"
                onChange={(event) => onUploadVendorLogo(index, event.target.files?.[0])}
              />
            </label>
            <label className="visual-editor-field">
              <span>Name</span>
              <input value={vendor.name || ""} onChange={(event) => onUpdateVendor(index, "name", event.target.value)} />
            </label>
            <label className="visual-editor-field">
              <span>Phone</span>
              <input value={vendor.phone || ""} onChange={(event) => onUpdateVendor(index, "phone", event.target.value)} />
            </label>
            <label className="visual-editor-field">
              <span>Email</span>
              <input value={vendor.email || ""} onChange={(event) => onUpdateVendor(index, "email", event.target.value)} />
            </label>
            <label className="visual-editor-field">
              <span>Notes</span>
              <textarea value={vendor.notes || ""} rows={3} onChange={(event) => onUpdateVendor(index, "notes", event.target.value)} />
            </label>
            <div className="visual-editor-check-row">
              <label>
                <input
                  type="checkbox"
                  checked={vendor.active !== false}
                  onChange={(event) => onUpdateVendor(index, "active", event.target.checked)}
                />
                Visible
              </label>
            </div>
          </details>
        ))}
      </div>

      <div className="visual-editor-panel-actions">
        <button className="visual-editor-button" type="button" disabled={Boolean(errors.length) || isSaving} onClick={onSaveVendors}>
          {isSaving ? "Saving" : "Save Vendors"}
        </button>
        {isUploading ? <span className="visual-editor-status">Uploading</span> : null}
        <button className="visual-editor-button visual-editor-button--secondary" type="button" onClick={() => window.location.reload()}>
          Refresh Preview
        </button>
      </div>
    </div>
  );
}
