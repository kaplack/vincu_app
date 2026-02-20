import * as React from "react";
import { Toaster as Sonner } from "sonner";

/**
 * Toaster wrapper for Sonner
 * - Sin next-themes
 * - Sin TypeScript
 * - Compatible con Vite + React
 *
 * Si más adelante usas un ThemeProvider propio,
 * puedes pasar `theme` como prop.
 */
function Toaster({ theme = "system", ...props }) {
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
      }}
      {...props}
    />
  );
}

export { Toaster };
