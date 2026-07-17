"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { MobileNav } from "./MobileNav";

export function Header({ title }: { title: string }) {
  // Starts false to match server-rendered HTML exactly (avoids a hydration
  // mismatch); the real theme is applied in useEffect below, which only
  // runs client-side after mount. The <html> class itself is already set
  // synchronously pre-hydration by the inline script in layout.tsx, so
  // there's no visual flash - this state only drives which icon (sun/moon)
  // the toggle button shows, which is a client-only concern by definition.
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = stored ? stored === "dark" : prefersDark;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(dark);
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-surface-border">
      <div className="flex items-center gap-2">
        <MobileNav />
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      </div>
      <button
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors"
      >
        {isDark ? (
          <Sun className="w-4 h-4" strokeWidth={2} />
        ) : (
          <Moon className="w-4 h-4" strokeWidth={2} />
        )}
      </button>
    </header>
  );
}
