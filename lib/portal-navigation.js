import { dailyAccessLinks } from "@/lib/portal-config";
import { mergePageWithSiteChrome } from "@/lib/portal-site-chrome";

export function getPortalPageWithContent(pageKey, page, content = {}) {
  const pageWithChrome = mergePageWithSiteChrome(content, pageKey, page);
  const navigation = content.navigation || {};
  const pageNavigation = navigation[pageKey] || {};
  const navLinks = pageNavigation.navLinks || pageWithChrome.navLinks || [];
  const sidebarUtilityLinks = pageNavigation.sidebarUtilityLinks || pageWithChrome.sidebarUtility?.links || [];
  const mobileQuickLinks = pageNavigation.mobileQuickLinks || pageWithChrome.mobileQuickLinks || [];

  return {
    ...pageWithChrome,
    dailyAccessLinks: navigation.dailyAccessLinks || pageWithChrome.dailyAccessLinks || dailyAccessLinks,
    navLinks,
    sidebarUtility: pageWithChrome.sidebarUtility
      ? {
          ...pageWithChrome.sidebarUtility,
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
    dailyAccessLinks: navigation.dailyAccessLinks || page.dailyAccessLinks || dailyAccessLinks,
    navLinks: pageNavigation.navLinks || page.navLinks || [],
    sidebarUtilityLinks: pageNavigation.sidebarUtilityLinks || page.sidebarUtility?.links || [],
    mobileQuickLinks: pageNavigation.mobileQuickLinks || page.mobileQuickLinks || []
  };
}
