"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { IconComponent } from "reicon-react";
import { Box, ChartBar, Grid, Radio, User } from "reicon-react";

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

export function DashboardSidebar({ collapsed }: { collapsed: boolean }) {
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

      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-zinc-950 pb-[env(safe-area-inset-bottom)] lg:hidden dark:bg-zinc-900"
      >
        <div className="flex items-stretch px-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                  active
                    ? "text-white"
                    : "text-zinc-400 hover:text-white",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg transition-colors",
                    active && "bg-white/10",
                  )}
                >
                  <Icon size={19} className="shrink-0" />
                </span>
                <span className="w-full truncate text-center">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
