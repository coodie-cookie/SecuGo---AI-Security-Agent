"use client";

import { useContext } from "react";
import { ThemeContext } from "@/components/theme-provider";

export type Theme = "light" | "dark";

export function useTheme() {
  return useContext(ThemeContext);
}
