"use client"

import * as React from "react"
import { useMotion } from "./motion"

const SELECTOR = [
  "button",
  "a[href]",
  "[role='button']",
  "[role='tab']",
  "[role='switch']",
  "[role='radio']",
  "[role='menuitem']",
  "[role='option']",
  "summary",
  "label[for]",
  "select",
  "[data-slot='select-trigger']",
  "[data-slot='trigger']",
  "[data-sticky-cursor]",
].join(",")

type State = {
  x: number
  y: number
  size: number
  stretch: number
  angle: number
  opacity: number
  sticky: boolean
}

const initial: State = {
  x: -100,
  y: -100,
  size: 16,
  stretch: 1,
  angle: 0,
  opacity: 0,
  sticky: false,
}

function finePointer() {
  return typeof window !== "undefined" && window.matchMedia?.("(hover: hover) and (pointer: fine)").matches
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function mix(a: number, b: number, amount: number) {
  return a + (b - a) * amount
}

function mixAngle(a: number, b: number, amount: number) {
  const diff = ((b - a + 180) % 360) - 180
  return a + diff * amount
}

function findTarget(element: Element | null) {
  const target = element?.closest(SELECTOR)
  if (!(target instanceof HTMLElement)) return null
  if (target.matches("button:disabled,[aria-disabled='true'],[data-disabled]")) return null
  return target
}

export function StickyCursor() {
  const { features } = useMotion()
  const [enabled, setEnabled] = React.useState(false)
  const cursorRef = React.useRef<HTMLDivElement | null>(null)
  const targetState = React.useRef<State>({ ...initial })
  const drawState = React.useRef<State>({ ...initial })
  const frame = React.useRef<number | null>(null)

  React.useEffect(() => {
    const sync = () => setEnabled(features.cursor && finePointer())
    sync()
    const hoverQuery = window.matchMedia("(hover: hover)")
    const pointerQuery = window.matchMedia("(pointer: fine)")
    hoverQuery.addEventListener("change", sync)
    pointerQuery.addEventListener("change", sync)
    return () => {
      hoverQuery.removeEventListener("change", sync)
      pointerQuery.removeEventListener("change", sync)
    }
  }, [features.cursor])

  React.useEffect(() => {
    if (!enabled) return undefined

    const root = document.documentElement
    root.classList.add("sk-sticky-cursor-active")

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !finePointer()) {
        targetState.current.opacity = 0
        return
      }

      const x = event.clientX
      const y = event.clientY
      const target = findTarget(document.elementFromPoint(x, y))

      if (!target) {
        targetState.current = { x, y, size: 16, stretch: 1, angle: 0, opacity: 1, sticky: false }
        return
      }

      const rect = target.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = x - cx
      const dy = y - cy
      const distance = Math.hypot(dx, dy)

      targetState.current = {
        x: cx + dx * 0.16,
        y: cy + dy * 0.16,
        size: clamp(Math.max(rect.width, rect.height) * 0.72, 44, 68),
        stretch: clamp(1 + distance / 130, 1, 1.45),
        angle: (Math.atan2(dy, dx) * 180) / Math.PI,
        opacity: 1,
        sticky: true,
      }
    }

    const onLeave = () => {
      targetState.current.opacity = 0
    }

    const render = () => {
      const cursor = cursorRef.current
      if (cursor) {
        const current = drawState.current
        const target = targetState.current
        const next: State = {
          x: mix(current.x, target.x, target.sticky ? 0.18 : 0.24),
          y: mix(current.y, target.y, target.sticky ? 0.18 : 0.24),
          size: mix(current.size, target.size, target.sticky ? 0.16 : 0.22),
          stretch: mix(current.stretch, target.stretch, 0.16),
          angle: mixAngle(current.angle, target.angle, target.sticky ? 0.18 : 0.26),
          opacity: mix(current.opacity, target.opacity, 0.24),
          sticky: target.sticky,
        }
        drawState.current = next
        cursor.dataset.mode = next.sticky ? "sticky" : "idle"
        cursor.style.opacity = String(next.opacity)
        cursor.style.width = `${next.size}px`
        cursor.style.height = `${next.size}px`
        cursor.style.transform = `translate3d(${next.x - next.size / 2}px, ${next.y - next.size / 2}px, 0) rotate(${next.angle}deg) scaleX(${next.stretch})`
      }
      frame.current = window.requestAnimationFrame(render)
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("pointerleave", onLeave)
    frame.current = window.requestAnimationFrame(render)

    return () => {
      root.classList.remove("sk-sticky-cursor-active")
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerleave", onLeave)
      if (frame.current) window.cancelAnimationFrame(frame.current)
      frame.current = null
    }
  }, [enabled])

  if (!enabled) return null
  return <div ref={cursorRef} className="sk-sticky-cursor" aria-hidden />
}
