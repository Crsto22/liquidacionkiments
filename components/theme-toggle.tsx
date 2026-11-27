"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "reicon-react";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Cambiar entre modo claro y oscuro"
      title="Cambiar tema"
    >
      <Sun size={18} className="hidden dark:block" />
      <Moon size={18} className="dark:hidden" />
    </Button>
  );
}
