import { dailyAccessLinks } from "@/lib/portal-config";
import { getLeadershipSupportContent } from "@/lib/leadership-support";
import { mergePageWithSiteChrome } from "@/lib/portal-site-chrome";

export function getPortalPageWithContent(pageKey, page, content = {}) {
  const pageWithChrome = mergePageWithSiteChrome(content, pageKey, page);
  const navigation = content.navigation || {};
  const pageNavigation = navigation[pageKey] || {};
  const navLinks = pageNavigation.navLinks || pageWithChrome.navLinks || [];
  const sidebarUtilityLinks = pageNavigation.sidebarUtilityLinks || pageWithChrome.sidebarUtility?.links || [];
  const mobileQuickLinks = pageNavigation.mobileQuickLinks || pageWithChrome.mobileQuickLinks || [];
  const sidebarUtilityTitle = pageNavigation.sidebarUtilityTitle || pageWithChrome.sidebarUtility?.title;

  return {
    ...pageWithChrome,
    dailyAccessLinks: navigation.dailyAccessLinks || pageWithChrome.dailyAccessLinks || dailyAccessLinks,
    dailyAccessKicker: navigation.dailyAccessKicker || pageWithChrome.dailyAccessKicker || "Quick Links",
    dailyAccessTitle: navigation.dailyAccessTitle || pageWithChrome.dailyAccessTitle || "Daily Access",
    leadershipSupport: getLeadershipSupportContent(content),
    mobileMenuLabel: pageNavigation.mobileMenuLabel || pageWithChrome.mobileMenuLabel || "Menu",
    mobileQuickLinksLabel: pageNavigation.mobileQuickLinksLabel || pageWithChrome.mobileQuickLinksLabel || "Quick Links",
    navLinks,
    sidebarUtility: pageWithChrome.sidebarUtility
      ? {
          ...pageWithChrome.sidebarUtility,
          title: sidebarUtilityTitle,
          links: sidebarUtilityLinks
        }
      : pageWithChrome.sidebarUtility,
    mobileQuickLinks
  };
}

export function getNavigationContent(content = {}, pageKey, page) {
  const navigation = content.navigation || {};
  const pageNavigation = navigation[pageKey] || {};

  return {
    dailyAccessKicker: navigation.dailyAccessKicker || page.dailyAccessKicker || "Quick Links",
    dailyAccessLinks: navigation.dailyAccessLinks || page.dailyAccessLinks || dailyAccessLinks,
    dailyAccessTitle: navigation.dailyAccessTitle || page.dailyAccessTitle || "Daily Access",
    mobileMenuLabel: pageNavigation.mobileMenuLabel || page.mobileMenuLabel || "Menu",
    mobileQuickLinksLabel: pageNavigation.mobileQuickLinksLabel || page.mobileQuickLinksLabel || "Quick Links",
    navLinks: pageNavigation.navLinks || page.navLinks || [],
    sidebarUtilityLinks: pageNavigation.sidebarUtilityLinks || page.sidebarUtility?.links || [],
    sidebarUtilityTitle: pageNavigation.sidebarUtilityTitle || page.sidebarUtility?.title || "",
    mobileQuickLinks: pageNavigation.mobileQuickLinks || page.mobileQuickLinks || []
  };
}
