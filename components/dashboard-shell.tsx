"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Bell, Search, SidebarLeft } from "reicon-react";

export function DashboardShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const titles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/live": "Live",
    "/dashboard/pedidos": "Pedidos",
    "/dashboard/perfil": "Perfil",
    "/dashboard/reportes": "Reportes",
  };

  const title = titles[pathname] ?? "Dashboard";

  return (
    <TooltipProvider>
      <div className="flex min-h-svh bg-background">
        <DashboardSidebar collapsed={collapsed} />

        <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur sm:px-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden lg:inline-flex"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={
              collapsed
                ? "Expandir barra lateral"
                : "Minimizar barra lateral"
            }
            aria-expanded={!collapsed}
            title={
              collapsed
                ? "Expandir barra lateral"
                : "Minimizar barra lateral"
            }
          >
            <SidebarLeft size={18} />
          </Button>

          <Separator
            orientation="vertical"
            className="mx-1 hidden h-5 lg:block"
          />

          <h1 className="truncate text-sm font-semibold sm:text-base">
            {title}
          </h1>

          <div className="ml-auto flex items-center gap-1.5">
            <div className="relative mr-1 hidden md:block">
              <Search
                size={15}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="search"
                placeholder="Buscar..."
                aria-label="Buscar"
                className="h-8 w-52 pl-8 lg:w-64"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notificaciones, 99+ sin leer"
              title="Notificaciones"
            >
              <Bell size={18} />
              <Badge className="absolute -right-1.5 -top-1.5 h-4 min-w-4 justify-center rounded-full border-0 bg-red-500 px-1 text-[10px] leading-none font-semibold text-white">
                99+
              </Badge>
            </Button>
            <ThemeToggle />
            <Separator orientation="vertical" className="mx-1 h-5" />
            <Link
              href="/dashboard/perfil"
              className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-muted"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                C
              </span>
              <span className="hidden text-sm font-medium sm:inline">
                Cristhofer Leonardo
              </span>
            </Link>
          </div>
        </header>

          <main className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
