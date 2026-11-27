"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { IconComponent } from "reicon-react";
import { Box, ChartBar, Grid, Radio, User } from "reicon-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type SidebarItem = {
  label: string;
  href: string;
  icon: IconComponent;
};

const items: SidebarItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Grid },
  { label: "Live", href: "/dashboard/live", icon: Radio },
  { label: "Pedidos", href: "/dashboard/pedidos", icon: Box },
  { label: "Reportes", href: "/dashboard/reportes", icon: ChartBar },
  { label: "Perfil", href: "/dashboard/perfil", icon: User },
];

export function DashboardSidebar({
  collapsed,
  mobileOpen,
  onMobileOpenChange,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <aside
        className={cn(
          "sticky top-0 hidden h-svh shrink-0 flex-col overflow-hidden border-r border-white/10 bg-zinc-950 p-2 transition-[width] duration-300 ease-in-out dark:bg-zinc-900 lg:flex lg:p-3",
          collapsed ? "lg:w-16" : "lg:w-60",
        )}
      >
        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "mx-auto flex size-10 items-center justify-center rounded-lg text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                  !collapsed &&
                    "lg:mx-0 lg:h-10 lg:w-full lg:justify-start lg:gap-3 lg:px-3",
                  active
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon size={20} className="shrink-0" />
                <span
                  className={cn(
                    "hidden overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out lg:block",
                    collapsed
                      ? "max-w-0 opacity-0"
                      : "max-w-40 opacity-100",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="left"
          className="w-64 gap-0 border-r-0 bg-zinc-950 p-3 text-white sm:max-w-none dark:bg-zinc-900 [&_[data-slot=sheet-close]]:text-zinc-300 [&_[data-slot=sheet-close]]:hover:bg-white/10 [&_[data-slot=sheet-close]]:hover:text-white"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Menú</SheetTitle>
            <SheetDescription>Navegación principal</SheetDescription>
          </SheetHeader>

          <p className="px-2 pb-3 pt-1 text-sm font-semibold text-white">
            Kiments
          </p>

          <nav className="flex flex-col gap-1">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => onMobileOpenChange(false)}
                  className={cn(
                    "flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                    active
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon size={20} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
