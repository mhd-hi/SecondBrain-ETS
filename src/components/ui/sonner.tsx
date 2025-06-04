"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { toast } from "sonner"

const Toaster = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  useTheme()

  return (
    <div
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
    />
  )
}

export { Toaster, toast }
