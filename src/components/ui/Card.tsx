import { type ReactNode } from "react";
import { cn } from "@/utils/cn";

export function Card({
  title,
  subtitle,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-surface-border bg-surface/40 p-5",
        className
      )}
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold">{title}</h3>
          {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
