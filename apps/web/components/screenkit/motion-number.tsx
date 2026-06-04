"use client"

import { cn } from "@/lib/utils"
import NumberFlow from "@number-flow/react"
import * as React from "react"
import { useMotion } from "./motion"

type MotionNumberProps = {
  value: number
  className?: string
  locales?: string | string[]
  format?: Intl.NumberFormatOptions
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  ariaLabel?: string
}

export function MotionNumber({
  value,
  className,
  locales,
  format,
  prefix,
  suffix,
  ariaLabel,
}: MotionNumberProps) {
  const { reduceMotion, ready } = useMotion()
  const shouldAnimate = ready && !reduceMotion

  const staticValue = React.useMemo(
    () => new Intl.NumberFormat(locales, format).format(value),
    [value, locales, format],
  )

  return (
    <span
      className={cn("inline-flex items-baseline tabular-nums", className)}
      aria-label={ariaLabel ?? staticValue}
    >
      {prefix}
      {shouldAnimate ? (
        <NumberFlow value={value} locales={locales} format={format} />
      ) : (
        staticValue
      )}
      {suffix}
    </span>
  )
}