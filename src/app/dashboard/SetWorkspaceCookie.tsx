"use client";

import { useEffect } from "react";

const COOKIE_NAME = "dashboard_workspace";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export default function SetWorkspaceCookie({ workspaceId }: { workspaceId: string | null }) {
  useEffect(() => {
    if (workspaceId) {
      document.cookie = `${COOKIE_NAME}=${encodeURIComponent(workspaceId)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
    } else {
      document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
    }
  }, [workspaceId]);
  return null;
}
