"use client";

import { useEffect, useState } from "react";

/**
 * Reads the semantic design-token colors from CSS variables at runtime so
 * Recharts (which needs concrete color strings, not Tailwind classes) maps
 * series to the design-system palette — Blue=brand/primary, Green=won/positive,
 * Red=lost/negative, Yellow=pending/warning (design-system-setup.md §Dataviz).
 *
 * No hex literals live here: values resolve from styles/tokens.css at runtime.
 */
export type SemanticPalette = {
  brand: string;
  green: string;
  red: string;
  yellow: string;
  violet: string;
  grid: string;
  axis: string;
};

const TOKEN_MAP: Record<keyof SemanticPalette, string> = {
  brand: "--color-blue-500",
  green: "--color-green-500",
  red: "--color-red-500",
  yellow: "--color-yellow-500",
  violet: "--color-violet-500",
  grid: "--color-grey-100",
  axis: "--color-grey-500"
};

function readPalette(): SemanticPalette {
  const styles = getComputedStyle(document.documentElement);
  const read = (token: string) => styles.getPropertyValue(token).trim();
  return {
    brand: read(TOKEN_MAP.brand),
    green: read(TOKEN_MAP.green),
    red: read(TOKEN_MAP.red),
    yellow: read(TOKEN_MAP.yellow),
    violet: read(TOKEN_MAP.violet),
    grid: read(TOKEN_MAP.grid),
    axis: read(TOKEN_MAP.axis)
  };
}

const EMPTY: SemanticPalette = {
  brand: "",
  green: "",
  red: "",
  yellow: "",
  violet: "",
  grid: "",
  axis: ""
};

export function useSemanticPalette(): SemanticPalette {
  const [palette, setPalette] = useState<SemanticPalette>(EMPTY);
  useEffect(() => {
    setPalette(readPalette());
  }, []);
  return palette;
}
