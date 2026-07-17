"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Droplets } from "lucide-react";
import { cn } from "@/utils/cn";
import { NAV_ITEMS } from "./navItems";

/**
 * BEFORE: the Sidebar component used `hidden lg:flex`, meaning below the
 * lg breakpoint (most phones and small tablets) the entire navigation
 * simply disappeared with no replacement - there was no way to move
 * between pages at all on mobile. This is a real, significant responsive
 * gap, not a cosmetic one.
 *
 * AFTER: a hamburger button (visible only below lg) opens a slide-over
 * drawer with the same navigation, keyboard-dismissible (Escape) and
 * dismissible by tapping the backdrop.
 */
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        className="lg:hidden p-2 -ml-2 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors"
      >
        <Menu className="w-5 h-5" strokeWidth={2} />
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-background border-r border-surface-border flex flex-col animate-slide-in-left">
            <div className="flex items-center justify-between px-6 h-16 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-accent" strokeWidth={2.5} />
                <span className="font-semibold tracking-tight">QleanFlow</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      active
                        ? "bg-accent-soft text-accent"
                        : "text-muted hover:text-foreground hover:bg-surface"
                    )}
                  >
                    <Icon className="w-4 h-4" strokeWidth={2} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
