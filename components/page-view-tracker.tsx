"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getTrackedRoute } from "@/lib/tracked-route";

const dedupeWindowMs = 15_000;

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const route = getTrackedRoute(pathname);
    if (!route) {
      return;
    }

    const storageKey = `page-view:${route.path}`;
    const lastTrackedAtRaw = window.sessionStorage.getItem(storageKey);
    const now = Date.now();

    if (lastTrackedAtRaw) {
      const lastTrackedAt = Number(lastTrackedAtRaw);
      if (Number.isFinite(lastTrackedAt) && now - lastTrackedAt < dedupeWindowMs) {
        return;
      }
    }

    window.sessionStorage.setItem(storageKey, String(now));

    void fetch("/api/analytics/page-view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(route),
      keepalive: true
    }).catch(() => {
      window.sessionStorage.removeItem(storageKey);
    });
  }, [pathname]);

  return null;
}
