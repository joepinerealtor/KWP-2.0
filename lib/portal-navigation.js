import { dailyAccessLinks } from "@/lib/portal-config";

export function getPortalPageWithContent(pageKey, page, content = {}) {
  const navigation = content.navigation || {};
  const pageNavigation = navigation[pageKey] || {};
  const navLinks = pageNavigation.navLinks || page.navLinks || [];
  const sidebarUtilityLinks = pageNavigation.sidebarUtilityLinks || page.sidebarUtility?.links || [];
  const mobileQuickLinks = pageNavigation.mobileQuickLinks || page.mobileQuickLinks || [];

  return {
    ...page,
    dailyAccessLinks: navigation.dailyAccessLinks || page.dailyAccessLinks || dailyAccessLinks,
    navLinks,
    sidebarUtility: page.sidebarUtility
      ? {
          ...page.sidebarUtility,
          links: sidebarUtilityLinks
        }
      : page.sidebarUtility,
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
