"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CheckCircle,
  CloseCircle,
  InfoCircle,
  Printer,
  TriangleWarning,
} from "reicon-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CheckCircle
            size={16}
            weight="Filled"
            className="text-emerald-600 dark:text-emerald-400"
          />
        ),
        info: (
          <InfoCircle
            size={16}
            weight="Filled"
            className="text-sky-600 dark:text-sky-400"
          />
        ),
        warning: (
          <TriangleWarning
            size={16}
            weight="Filled"
            className="text-amber-600 dark:text-amber-400"
          />
        ),
        error: (
          <CloseCircle
            size={16}
            weight="Filled"
            className="text-rose-600 dark:text-rose-400"
          />
        ),
        loading: <Printer size={16} weight="Filled" className="animate-pulse" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast !gap-3 !rounded-xl",
          icon: "m-0 flex size-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/60 text-foreground [&>svg]:size-4",
          title: "!text-sm !font-semibold",
          description: "!text-xs !text-muted-foreground",
          loading:
            "[&_[data-icon]]:border-sky-500/25 [&_[data-icon]]:bg-sky-500/10 [&_[data-icon]]:text-sky-600 dark:[&_[data-icon]]:text-sky-400",
          success:
            "[&_[data-icon]]:border-emerald-500/25 [&_[data-icon]]:bg-emerald-500/10",
          info: "[&_[data-icon]]:border-sky-500/25 [&_[data-icon]]:bg-sky-500/10",
          warning:
            "[&_[data-icon]]:border-amber-500/25 [&_[data-icon]]:bg-amber-500/10",
          error:
            "[&_[data-icon]]:border-rose-500/25 [&_[data-icon]]:bg-rose-500/10",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
