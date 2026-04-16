"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type LabelProps = React.ComponentProps<"label"> & {
  selectable?: boolean
}

function Label({ className, selectable = true, ...props }: LabelProps) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        selectable ? "select-text" : "select-none",
        className
      )}
      {...props}
    />
  )
}

export { Label }
