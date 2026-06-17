"use client";

import { useEffect } from "react";

export function VisitReviewScrollAnchor() {
  useEffect(() => {
    if (window.location.hash !== "#visit-review") return;

    const timer = window.setTimeout(() => {
      document.getElementById("visit-review")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
