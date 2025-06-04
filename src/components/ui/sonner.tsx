"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import type { ToasterProps } from "sonner"

type Theme = "light" | "dark" | "system"

const Toaster = ({ ...props }: ToasterProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const { theme = "system" } = useTheme() as { theme: Theme }

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
