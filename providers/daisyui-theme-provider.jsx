"use client";

import { ThemeProvider } from "next-themes";

export default function DaisyUIThemeProvider({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
