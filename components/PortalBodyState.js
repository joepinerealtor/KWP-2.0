"use client";

import { useEffect } from "react";

export function PortalBodyState({ lockLabel = "Agent Portal", isPublic = false }) {
  useEffect(() => {
    document.body.dataset.portalLockLabel = lockLabel;

    if (isPublic) {
      document.body.dataset.portalPublic = "true";
      document.body.classList.remove("portal-protected");
    } else {
      delete document.body.dataset.portalPublic;
      document.body.classList.add("portal-protected");
    }
  }, [isPublic, lockLabel]);

  return null;
}
