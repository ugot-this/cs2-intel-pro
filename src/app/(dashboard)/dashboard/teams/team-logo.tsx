"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TeamLogoProps {
  logoUrl: string | null;
  name: string;
  acronym: string;
  size?: "sm" | "md";
  /** Optional extra className for the fallback avatar */
  fallbackClassName?: string;
}

export function TeamLogo({
  logoUrl,
  name,
  acronym,
  size = "md",
  fallbackClassName,
}: TeamLogoProps) {
  const [errored, setErrored] = useState(false);
  const dim = size === "sm" ? "w-7 h-7 text-xs" : "w-11 h-11 text-sm";

  if (logoUrl && !errored) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={cn(
          size === "sm" ? "w-7 h-7" : "w-11 h-11",
          "rounded object-contain bg-transparent shrink-0"
        )}
        onError={() => setErrored(true)}
      />
    );
  }

  return (
    <div className={cn(
      dim,
      "rounded bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0",
      fallbackClassName
    )}>
      {acronym.slice(0, 2)}
    </div>
  );
}
