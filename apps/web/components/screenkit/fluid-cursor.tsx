"use client"

import * as React from "react"
import { useMotion } from "./motion"

type CursorMode = "idle" | "target" | "text"
type CursorTone = "neutral" | "color"

type CursorState = {
  x: number
  y: number
  width: number
  height: number
  radius: number
  opacity: number
  mode: CursorMode
  tone: CursorTone
  pressed: boolean
}

const DEFAULT_STATE: CursorState = {
  x: -100,
  y: -100,
  width: 16,
  height: 16,
  radius: 999,
  opacity: 0,
  mode: "idle",
  tone: "neutral",
  pressed: false,
}

const TARGET_SELECTOR = [
  "button:not(:disabled)",
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
].join(",")

const TEXT_SELECTOR = [
  "input:not([type='checkbox']):not([type='radio']):not([type='range']):not([type='button']):not([type='submit']):not([type='reset']):not([type='file']):not([type='color'])",
  "textarea",
  "[contenteditable='true']",
  "p",
  "span",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "li",
  "code",
  "pre",
  "blockquote",
  "[data-fluid-cursor='text']",
].join(",")

function canUseFinePointer() {
  if (typeof window === "undefined" || !window.matchMedia) return false
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function lerp(current: number, target: number, ease: number) {
  return current + (target - current) * ease
}

type Rgba = { r: number; g: number; b: number; a: number }

function parseChannel(value: string) {
  const trimmed = value.trim()
  if (trimmed.endsWith("%")) return (Number.parseFloat(trimmed) / 100) * 255
  return Number.parseFloat(trimmed)
}

function parseAlpha(value: string | undefined) {
  if (!value) return 1
  const trimmed = value.trim()
  if (trimmed.endsWith("%")) return Number.parseFloat(trimmed) / 100
  return Number.parseFloat(trimmed)
}

function parseRgb(value: string): Rgba | null {
  if (!value || value === "transparent" || value === "currentcolor") return null
  const match = value.match(/rgba?\(([^)]+)\)/i)
  if (!match) return null
  const normalized = match[1].replace(/,/g, " ").replace(/\//g, " ")
  const parts = normalized.split(/\s+/).filter(Boolean)
  if (parts.length < 3) return null
  const r = parseChannel(parts[0])
  const g = parseChannel(parts[1])
  const b = parseChannel(parts[2])
  const a = parseAlpha(parts[3])
  if (![r, g, b, a].every(Number.isFinite)) return null
  return { r, g, b, a }
}

function isChromaticColor(value: string) {
  const rgb = parseRgb(value)
  if (!rgb || rgb.a < 0.08) return false
  const brightest = Math.max(rgb.r, rgb.g, rgb.b)
  const darkest = Math.min(rgb.r, rgb.g, rgb.b)
  const chroma = brightest - darkest
  const saturation = brightest <= 0 ? 0 : chroma / brightest

  // Neutral theme colors are intentionally grayscale / near-grayscale. Anything
  // with visible chroma is treated as authored color and the cursor switches to
  // a non-blending outline so it does not alter that color.
  return chroma > 24 && saturation > 0.12
}

function elementHasAuthoredColor(element: HTMLElement) {
  const style = window.getComputedStyle(element)
  const colorValues = [
    style.color,
    style.backgroundColor,
    style.borderTopColor,
    style.borderRightColor,
    style.borderBottomColor,
    style.borderLeftColor,
    style.outlineColor,
    style.textDecorationColor,
    style.caretColor,
  ]
  return colorValues.some(isChromaticColor)
}

function isColoredContext(source: Element | null, target: HTMLElement | null) {
  if (!(source instanceof HTMLElement) && !target) return false
  let node: HTMLElement | null = source instanceof HTMLElement ? source : target
  let depth = 0
  while (node && node !== document.body && node !== document.documentElement && depth < 8) {
    if (elementHasAuthoredColor(node)) return true
    if (node === target) break
    node = node.parentElement
    depth += 1
  }
  return target ? elementHasAuthoredColor(target) : false
}

export function FluidCursor() {
  const { features } = useMotion()
  const [enabled, setEnabled] = React.useState(false)
  const cursorRef = React.useRef<HTMLDivElement | null>(null)
  const state = React.useRef<CursorState>(DEFAULT_STATE)
  const rendered = React.useRef<CursorState>(DEFAULT_STATE)
  const velocity = React.useRef({ x: 0, y: 0 })
  const lastPointer = React.useRef({ x: -100, y: -100 })
  const raf = React.useRef<number | null>(null)

  React.useEffect(() => {
    const sync = () => setEnabled(features.cursor && canUseFinePointer())
    sync()

    const queries = [
      window.matchMedia("(hover: hover)"),
      window.matchMedia("(pointer: fine)"),
      window.matchMedia("(pointer: coarse)"),
    ]
    queries.forEach((query) => query.addEventListener("change", sync))
    return () => queries.forEach((query) => query.removeEventListener("change", sync))
  }, [features.cursor])

  React.useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove("sk-fluid-cursor-active")
      state.current = { ...DEFAULT_STATE }
      rendered.current = { ...DEFAULT_STATE }
      velocity.current = { x: 0, y: 0 }
      lastPointer.current = { x: -100, y: -100 }
      if (raf.current) window.cancelAnimationFrame(raf.current)
      raf.current = null
      return undefined
    }

    const root = document.documentElement
    root.classList.add("sk-fluid-cursor-active")

    const disableIfPointerBecameCoarse = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !canUseFinePointer()) {
        state.current.opacity = 0
        return true
      }
      return false
    }

    const setTargetFromElement = (el: Element | null, x: number, y: number) => {
      velocity.current = {
        x: x - lastPointer.current.x,
        y: y - lastPointer.current.y,
      }
      lastPointer.current = { x, y }

      const textTarget = el?.closest(TEXT_SELECTOR)
      const interactiveTarget = el?.closest(TARGET_SELECTOR)
      if (textTarget instanceof HTMLElement && !interactiveTarget) {
        const rect = textTarget.getBoundingClientRect()
        state.current = {
          ...state.current,
          x,
          y,
          width: clamp(rect.height * 0.34, 12, 20),
          height: clamp(rect.height * 0.92, 24, 44),
          radius: 999,
          opacity: 1,
          mode: "text",
          tone: isColoredContext(el, textTarget) ? "color" : "neutral",
        }
        return
      }

      if (interactiveTarget instanceof HTMLElement) {
        const rect = interactiveTarget.getBoundingClientRect()
        const padX = clamp(rect.width * 0.11, 8, 18)
        const padY = clamp(rect.height * 0.16, 7, 14)
        state.current = {
          ...state.current,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: clamp(rect.width + padX * 2, 34, 260),
          height: clamp(rect.height + padY * 2, 34, 112),
          radius: clamp(rect.height / 2 + padY, 14, 34),
          opacity: 1,
          mode: "target",
          tone: isColoredContext(el, interactiveTarget) ? "color" : "neutral",
        }
        return
      }

      const stretch = clamp(Math.hypot(velocity.current.x, velocity.current.y) * 0.18, 0, 12)
      state.current = {
        ...state.current,
        x,
        y,
        width: 16 + stretch,
        height: 16 - stretch * 0.28,
        radius: 999,
        opacity: 1,
        mode: "idle",
        tone: isColoredContext(el, null) ? "color" : "neutral",
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      if (disableIfPointerBecameCoarse(event)) return
      const el = document.elementFromPoint(event.clientX, event.clientY)
      setTargetFromElement(el, event.clientX, event.clientY)
    }

    const onPointerEnter = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && canUseFinePointer()) state.current.opacity = 1
    }

    const onPointerLeave = () => {
      state.current.opacity = 0
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") state.current.pressed = true
    }

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType === "mouse") state.current.pressed = false
    }

    const onPointerCancel = () => {
      state.current.pressed = false
      state.current.opacity = 0
    }

    const tick = () => {
      const node = cursorRef.current
      if (node) {
        const current = rendered.current
        const target = state.current
        const easing = target.mode === "target" ? 0.16 : target.mode === "text" ? 0.2 : 0.18
        const sizeEase = target.mode === "target" ? 0.14 : 0.19
        const next: CursorState = {
          x: lerp(current.x, target.x, easing),
          y: lerp(current.y, target.y, easing),
          width: lerp(current.width, target.width, sizeEase),
          height: lerp(current.height, target.height, sizeEase),
          radius: lerp(current.radius, target.radius, 0.13),
          opacity: lerp(current.opacity, target.opacity, 0.24),
          mode: target.mode,
          tone: target.tone,
          pressed: target.pressed,
        }
        rendered.current = next

        const speed = clamp(Math.hypot(velocity.current.x, velocity.current.y), 0, 36)
        const angle = Math.atan2(velocity.current.y, velocity.current.x) || 0
        const squash = next.mode === "idle" ? 1 + speed * 0.008 : 1
        const scale = next.pressed ? 0.9 : 1
        node.style.opacity = String(next.opacity)
        node.style.borderRadius = `${next.radius}px`
        node.style.width = `${next.width}px`
        node.style.height = `${next.height}px`
        node.style.transform = `translate3d(${next.x - next.width / 2}px, ${next.y - next.height / 2}px, 0) rotate(${angle}rad) scale(${scale * squash}, ${scale / squash})`
        node.dataset.mode = next.mode
        node.dataset.tone = next.tone
      }
      velocity.current = { x: velocity.current.x * 0.82, y: velocity.current.y * 0.82 }
      raf.current = window.requestAnimationFrame(tick)
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true })
    window.addEventListener("pointerenter", onPointerEnter)
    window.addEventListener("pointerleave", onPointerLeave)
    window.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("pointerup", onPointerUp)
    window.addEventListener("pointercancel", onPointerCancel)
    raf.current = window.requestAnimationFrame(tick)

    return () => {
      root.classList.remove("sk-fluid-cursor-active")
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerenter", onPointerEnter)
      window.removeEventListener("pointerleave", onPointerLeave)
      window.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("pointerup", onPointerUp)
      window.removeEventListener("pointercancel", onPointerCancel)
      if (raf.current) window.cancelAnimationFrame(raf.current)
      raf.current = null
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <svg className="sk-fluid-cursor-svg" aria-hidden focusable="false">
        <filter id="sk-fluid-cursor-goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </svg>
      <div ref={cursorRef} className="sk-fluid-cursor" aria-hidden />
    </>
  )
}
