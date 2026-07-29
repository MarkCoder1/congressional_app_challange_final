"use client";

import { useEffect } from "react";

export function DemoDataInitializer() {
  useEffect(() => {
    // Seed demo data via API call to avoid importing better-sqlite3 in client
    // fetch("/api/seed-demo").catch((err) => {
    //   console.error("Failed to seed demo data:", err);
    // });
  }, []);

  return null;
}
