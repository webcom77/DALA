"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="p-2 rounded-full text-luxury-body dark:text-muted-foreground hover:bg-brand-50 hover:text-brand-800 transition-colors"
        aria-label="Alternar tema"
      >
        <Moon className="w-4 h-4 stroke-[1.8]" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      className="p-2 rounded-full text-luxury-body dark:text-muted-foreground hover:bg-brand-50 hover:text-brand-800 transition-colors"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      aria-label="Alternar tema claro/escuro"
    >
      {isDark ? (
        <Sun className="w-4 h-4 stroke-[1.8] text-amber-500" />
      ) : (
        <Moon className="w-4 h-4 stroke-[1.8]" />
      )}
    </button>
  );
}
