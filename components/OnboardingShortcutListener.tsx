"use client";

import { useState, useEffect } from "react";
import { WelcomeScreen } from "@/components/onboarding/WelcomeScreen";

export function OnboardingShortcutListener() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "o") {
        e.preventDefault();
        localStorage.removeItem("studyflow_onboarding_complete");
        setShow(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!show) return null;

  return (
    <WelcomeScreen onComplete={() => setShow(false)} />
  );
}
