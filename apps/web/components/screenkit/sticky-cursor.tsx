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

const LARGE_MIN_WIDTH = 96
const LARGE_MIN_HEIGHT = 56
const LARGE_AREA_RATIO = 5.5

type Mode = "idle" | "sticky" | "element"

type State = {
  x: number
  y: number
  width: number
  height: number
  radius: number
  stretch: number
  angle: number
  opacity: number
  mode: Mode
}

const initial: State = {
  x: -100,
  y: -100,
  width: 16,
  height: 16,
  radius: 999,
  stretch: 1,
  angle: 0,
  opacity: 0,
  mode: "idle",
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

function readRadius(target: HTMLElement) {
  const value = window.getComputedStyle(target).borderTopLeftRadius
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 16
}

function isLargeTarget(rect: DOMRect) {
  const cursorArea = 16 * 16
  return (
    rect.width >= LARGE_MIN_WIDTH &&
    rect.height >= LARGE_MIN_HEIGHT &&
    (rect.width * rect.height) / cursorArea >= LARGE_AREA_RATIO
  )
}

function clearActiveElement(current: HTMLElement | null) {
  if (!current) return
  current.classList.remove("sk-sticky-cursor-element-active")
  current.style.removeProperty("--sticky-cursor-radius")
}

export function StickyCursor() {
  const { features } = useMotion()
  const [enabled, setEnabled] = React.useState(false)
  const cursorRef = React.useRef<HTMLDivElement | null>(null)
  const activeElementRef = React.useRef<HTMLElement | null>(null)
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

    const activateElement = (element: HTMLElement | null, radius = 16) => {
      if (activeElementRef.current === element) return
      clearActiveElement(activeElementRef.current)
      activeElementRef.current = element
      if (element) {
        element.classList.add("sk-sticky-cursor-element-active")
        element.style.setProperty("--sticky-cursor-radius", `${radius}px`)
      }
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !finePointer()) {
        targetState.current.opacity = 0
        activateElement(null)
        return
      }

      const x = event.clientX
      const y = event.clientY
      const target = findTarget(document.elementFromPoint(x, y))

      if (!target) {
        activateElement(null)
        targetState.current = {
          x,
          y,
          width: 16,
          height: 16,
          radius: 999,
          stretch: 1,
          angle: 0,
          opacity: 1,
          mode: "idle",
        }
        return
      }

      const rect = target.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const radius = readRadius(target)

      if (isLargeTarget(rect)) {
        activateElement(target, radius)
        targetState.current = {
          x: cx,
          y: cy,
          width: rect.width,
          height: rect.height,
          radius,
          stretch: 1,
          angle: 0,
          opacity: 0,
          mode: "element",
        }
        return
      }

      activateElement(null)
      const dx = x - cx
      const dy = y - cy
      const distance = Math.hypot(dx, dy)
      const size = clamp(Math.max(rect.width, rect.height) * 0.72, 44, 68)

      targetState.current = {
        x: cx + dx * 0.16,
        y: cy + dy * 0.16,
        width: size,
        height: size,
        radius: 999,
        stretch: clamp(1 + distance / 130, 1, 1.45),
        angle: (Math.atan2(dy, dx) * 180) / Math.PI,
        opacity: 1,
        mode: "sticky",
      }
    }

    const onLeave = () => {
      targetState.current.opacity = 0
      activateElement(null)
    }

    const render = () => {
      const cursor = cursorRef.current
      if (cursor) {
        const current = drawState.current
        const target = targetState.current
        const next: State = {
          x: mix(current.x, target.x, target.mode === "element" ? 0.22 : target.mode === "sticky" ? 0.18 : 0.24),
          y: mix(current.y, target.y, target.mode === "element" ? 0.22 : target.mode === "sticky" ? 0.18 : 0.24),
          width: mix(current.width, target.width, target.mode === "element" ? 0.2 : target.mode === "sticky" ? 0.16 : 0.22),
          height: mix(current.height, target.height, target.mode === "element" ? 0.2 : target.mode === "sticky" ? 0.16 : 0.22),
          radius: mix(current.radius, target.radius, 0.18),
          stretch: mix(current.stretch, target.stretch, 0.16),
          angle: mixAngle(current.angle, target.angle, target.mode === "sticky" ? 0.18 : 0.26),
          opacity: mix(current.opacity, target.opacity, 0.24),
          mode: target.mode,
        }
        drawState.current = next
        cursor.dataset.mode = next.mode
        cursor.style.opacity = String(next.opacity)
        cursor.style.width = `${next.width}px`
        cursor.style.height = `${next.height}px`
        cursor.style.borderRadius = `${next.radius}px`
        cursor.style.transform = `translate3d(${next.x - next.width / 2}px, ${next.y - next.height / 2}px, 0) rotate(${next.angle}deg) scaleX(${next.stretch})`
      }
      frame.current = window.requestAnimationFrame(render)
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("pointerleave", onLeave)
    frame.current = window.requestAnimationFrame(render)

    return () => {
      root.classList.remove("sk-sticky-cursor-active")
      clearActiveElement(activeElementRef.current)
      activeElementRef.current = null
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerleave", onLeave)
      if (frame.current) window.cancelAnimationFrame(frame.current)
      frame.current = null
    }
  }, [enabled])

  if (!enabled) return null
  return <div ref={cursorRef} className="sk-sticky-cursor" aria-hidden />
}
